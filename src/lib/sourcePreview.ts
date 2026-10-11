import ExcelJS from 'exceljs';

export interface PreviewCell { address: string; text: string; formula?: string; x: number; y: number; width: number; height: number; style: Record<string, string | number>; }
export interface PreviewSheet { name: string; width: number; height: number; cells: PreviewCell[]; images: { src: string; x: number; y: number; width: number; height: number }[]; warnings: string[]; }
const color = (value: any, fallback: string) => value?.argb ? `#${value.argb.slice(-6)}` : value?.indexed === 64 ? '#000000' : fallback;
const border = (value: any) => !value?.style ? 'none' : `${/medium|thick|double/i.test(value.style) ? 2 : 1}px ${value.style === 'double' ? 'double' : /dash/i.test(value.style) ? 'dashed' : /dot/i.test(value.style) ? 'dotted' : 'solid'} ${color(value.color, '#000000')}`;
function text(cell: any) {
  let value = cell.value;
  if (value && typeof value === 'object') {
    if ('formula' in value || 'sharedFormula' in value) value = value.result ?? '';
    else if (value.richText) return value.richText.map((r: any) => r.text).join('');
    else if (value.text !== undefined) return value.text;
    else if (value.error) return value.error;
  }
  if (typeof value === 'number' && cell.numFmt && cell.numFmt !== 'General') {
    const scientific = /^0\.(0+)E\+00$/i.exec(cell.numFmt);
    if (scientific) {
      const [mantissa, exponent] = value.toExponential(scientific[1].length).split('e');
      return `${mantissa}E${Number(exponent) < 0 ? '-' : '+'}${Math.abs(Number(exponent)).toString().padStart(2,'0')}`;
    }
    const format = cell.numFmt.split(';')[value < 0 ? 1 : 0] || cell.numFmt.split(';')[0];
    const percent = format.includes('%');
    const decimal = format.match(/\.([0#]+)/)?.[1]?.length ?? 0;
    // Common quotation numeric formats only; retain raw value in the cell title.
    if (/[0#]/.test(format) && !/[dmyhs]/i.test(format.replace(/"[^"]*"/g, ''))) {
      const prefix = [...format.matchAll(/"([^"]*)"/g)].map(m => m[1]).join('');
      return prefix + (value * (percent ? 100 : 1)).toLocaleString('en-US', { useGrouping: format.includes(','), minimumFractionDigits: Math.min(decimal, 10), maximumFractionDigits: Math.min(decimal, 10) }) + (percent ? '%' : '');
    }
  }
  return value == null ? '' : value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
}

/** Read-only projection. The original ArrayBuffer is never serialized or modified. */
export async function readSourcePreview(bytes: ArrayBuffer): Promise<PreviewSheet[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(bytes as any);
  return workbook.worksheets.map(sheet => {
    const warnings = new Set<string>();
    const widths = Array.from({ length: sheet.columnCount }, (_, i) => { const col = sheet.getColumn(i + 1); return col.hidden ? 0 : Math.floor((col.width ?? sheet.properties.defaultColWidth ?? 8.43) * 7 + 5); });
    const heights = Array.from({ length: sheet.rowCount }, (_, i) => { const row = sheet.getRow(i + 1); return row.hidden ? 0 : (row.height ?? sheet.properties.defaultRowHeight ?? 15) * 96 / 72; });
    const sums = (values: number[]) => values.reduce((acc, n) => [...acc, acc[acc.length - 1] + n], [0]);
    const xs = sums(widths), ys = sums(heights);
    const merges = new Map<string, { right: number; bottom: number }>();
    for (const range of (sheet.model.merges || [])) {
      const [first, last = first] = range.split(':');
      const end = sheet.getCell(last);
      merges.set(first, { right: Number(end.col), bottom: Number(end.row) });
    }
    const cells: PreviewCell[] = [];
    sheet.eachRow({ includeEmpty: true }, row => row.eachCell({ includeEmpty: true }, cell => {
      if (cell.isMerged && cell.master.address !== cell.address) return;
      const c = Number(cell.col), r = Number(cell.row), merge = merges.get(cell.address);
      const width = xs[merge?.right ?? c] - xs[c - 1], height = ys[merge?.bottom ?? r] - ys[r - 1];
      if (!width || !height) return;
      const font = cell.font || {}, alignment = cell.alignment || {}, fill: any = cell.fill;
      if (font.color?.theme !== undefined || fill?.fgColor?.theme !== undefined) warnings.add('Theme colors may differ from Excel.');
      if (alignment.textRotation || alignment.shrinkToFit) warnings.add('Rotated or shrink-to-fit text requires visual review.');
      const borders = cell.border || {};
      let bottom = borders.bottom, right = borders.right;
      if (merge) { bottom = sheet.getCell(merge.bottom, c).border?.bottom || bottom; right = sheet.getCell(r, merge.right).border?.right || right; }
      cells.push({ address: cell.address, text: text(cell), formula: cell.formula,
        x: xs[c - 1], y: ys[r - 1], width, height,
        style: { fontFamily: font.name || 'Calibri, Arial, sans-serif', fontSize: (font.size || 11) * 96 / 72,
          fontWeight: font.bold ? 'bold' : 'normal', fontStyle: font.italic ? 'italic' : 'normal',
          color: color(font.color, '#000000'), background: fill?.type === 'pattern' && fill.pattern === 'solid' ? color(fill.fgColor, '#ffffff') : '#ffffff',
          textAlign: alignment.horizontal === 'center' || alignment.horizontal === 'centerContinuous' ? 'center' : alignment.horizontal === 'right' || (!alignment.horizontal && typeof cell.value === 'number') ? 'right' : 'left',
          justifyContent: alignment.vertical === 'middle' ? 'center' : alignment.vertical === 'top' ? 'flex-start' : 'flex-end',
          whiteSpace: alignment.wrapText ? 'pre-wrap' : 'pre', overflowWrap: 'anywhere',
          borderTop: border(borders.top), borderBottom: border(bottom), borderLeft: border(borders.left), borderRight: border(right) } });
    }));
    const images: PreviewSheet['images'] = [];
    for (const placement of sheet.getImages()) {
      const media = workbook.getImage(Number(placement.imageId));
      const range: any = placement.range;
      if (!media?.buffer || !range.tl) { warnings.add('An image could not be displayed.'); continue; }
      if (!['png','jpeg','jpg','gif'].includes(media.extension)) { warnings.add(`Unsupported image format: ${media.extension}`); continue; }
      const offset = (anchor: any, horizontal: boolean) => {
        const index = horizontal ? anchor.nativeCol : anchor.nativeRow;
        return (horizontal ? xs[index] : ys[index]) + (horizontal ? anchor.nativeColOff : anchor.nativeRowOff) / 9525;
      };
      const x = offset(range.tl, true), y = offset(range.tl, false);
      const width = range.ext?.width ?? (range.br ? offset(range.br, true) - x : 0);
      const height = range.ext?.height ?? (range.br ? offset(range.br, false) - y : 0);
      const data = new Uint8Array(media.buffer as any);
      let binary = ''; for (let i = 0; i < data.length; i += 8192) binary += String.fromCharCode(...data.subarray(i, i + 8192));
      if (![x,y,width,height].every(Number.isFinite)) { warnings.add('An image anchor is outside the displayed sheet.'); continue; }
      images.push({ src: `data:image/${String(media.extension) === 'jpg' ? 'jpeg' : media.extension};base64,${btoa(binary)}`, x, y, width, height });
    }
    return { name: sheet.name, width: Math.max(xs.at(-1)!, ...images.map(i => i.x + i.width)), height: Math.max(ys.at(-1)!, ...images.map(i => i.y + i.height)), cells, images, warnings: [...warnings] };
  });
}
