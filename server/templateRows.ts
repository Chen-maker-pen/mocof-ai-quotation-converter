import path from 'node:path';
import type JSZip from 'jszip';

export interface InsertRowsOperation {
  kind: 'insert_rows'; inheritHorizontalMerges?: boolean; sheetName: string; beforeRow: number; count: number; promptNumber?: string;
}
const unescapeXml = (s: string) => s.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const attr = (s: string, name: string) => unescapeXml(new RegExp(`\\b${name}=["']([^"']*)["']`).exec(s)?.[1] || '');

/** Excel insertion changes absolute as well as relative references. String literals
 * are deliberately left alone; dynamic/3-D/external references require review. */
export function shiftRowReferences(formula: string, localSheet: string, operation: InsertRowsOperation): string {
  const shift = (n: string) => {
    const row = Number(n), result = row >= operation.beforeRow ? row + operation.count : row;
    if (result > 1048576 || row < 1) throw new Error('Row insertion exceeds Excel limits.');
    return String(result);
  };
  const chunks = formula.split(/("(?:[^"]|"")*")/g);
  return chunks.map((part, i) => {
    if (i % 2) return part;
    if (/\b(?:INDIRECT|OFFSET)\s*\(|[\[\]]|(?:'[^']*:[^']*'|[\p{L}\d_]+:[\p{L}\d_]+)!/iu.test(part))
      throw new Error('Dynamic, external, structured or 3-D references require reviewed row insertion.');
    return part.replace(/(?<![\p{L}\p{N}_.])(?:(('(?:[^']|'')+'|[\p{L}_][\p{L}\p{N}_.]*)!))?(\$?[A-Z]{1,3}\$?)([1-9]\d*)(?::(\$?[A-Z]{1,3}\$?)([1-9]\d*))?(?![\p{L}\p{N}_.(])/gu,
      (all, qualifier, sheet, col, row, endCol, endRow) => {
        const name = sheet ? (sheet.startsWith("'") ? sheet.slice(1, -1).replace(/''/g, "'") : sheet) : localSheet;
        if (name.toLocaleLowerCase() !== operation.sheetName.toLocaleLowerCase()) return all;
        return `${qualifier || ''}${col}${shift(row)}${endCol ? `:${endCol}${shift(endRow)}` : ''}`;
      }).replace(/(?<![\p{L}\p{N}_.])(?:(('(?:[^']|'')+'|[\p{L}_][\p{L}\p{N}_.]*)!))?(\$?)([1-9]\d*):(\$?)([1-9]\d*)(?![\p{L}\p{N}_.])/gu,
      (all, qualifier, sheet, firstDollar, first, lastDollar, last) => {
        const name = sheet ? (sheet.startsWith("'") ? sheet.slice(1, -1).replace(/''/g, "'") : sheet) : localSheet;
        return name.toLocaleLowerCase() === operation.sheetName.toLocaleLowerCase()
          ? `${qualifier || ''}${firstDollar}${shift(first)}:${lastDollar}${shift(last)}` : all;
      });
  }).join('');
}

/** Only selected XML attributes/text change. Never reserialize images/styles or
 * other sheet parts through a workbook library. All unsupported objects abort. */
export async function insertTemplateRows(zip: JSZip, paths: Map<string, string>, operation: InsertRowsOperation): Promise<Set<string>> {
  const { beforeRow, count, sheetName } = operation;
  if (!Number.isInteger(beforeRow) || beforeRow < 1 || !Number.isInteger(count) || count < 1 || beforeRow + count > 1048576)
    throw new Error('Invalid row insertion bounds.');
  const target = paths.get(sheetName);
  if (!target) throw new Error('Missing row insertion sheet.');
  if (Object.keys(zip.files).some(n => /^xl\/(?:charts\/|pivot|externalLinks\/)|^xl\/calcChain\.xml$/.test(n)))
    throw new Error('Charts, pivot, external-link or calculation-chain dependencies require reviewed row insertion.');
  const changes = new Map<string, string>();
  const shift = (s: string) => shiftRowReferences(s, sheetName, operation);
  for (const [name, filename] of paths) {
    let xml = await zip.file(filename)!.async('string');
    const original = xml;
    if (/<f\b[^>]*\bt=["'](?:shared|array|dataTable)["']/.test(xml)) throw new Error('Shared/array/table formulas require coordinated row insertion.');
    xml = xml.replace(/(<(?:f|formula|formula1|formula2)\b[^>]*>)([\s\S]*?)(<\/(?:f|formula|formula1|formula2)>)/g,
      (_, open, body, close) => open + escapeXml(shiftRowReferences(unescapeXml(body), name, operation)) + close);
    if (filename === target) {
      if (/<(?:tableParts|legacyDrawing|oleObjects|controls|extLst|pane)\b/.test(xml))
        throw new Error('Table, comment, embedded-object, extension or frozen-pane geometry requires reviewed row insertion.');
      // Excel inserts blank rows with the adjacent row's formatting. Preserve
      // row height/cell styles only: never duplicate values or formulas.
      const donor = [...xml.matchAll(/<row\b[^>]*>[\s\S]*?<\/row>/g)].find(m=>Number(attr(m[0].split('>')[0], 'r'))===beforeRow-1)?.[0];
      const donorMerges = [...xml.matchAll(/<mergeCell\b[^>]*\/>/g)].map(m=>attr(m[0],'ref')).map(ref=>/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/.exec(ref)).filter(m=>m && Number(m[2])===beforeRow-1 && Number(m[4])===beforeRow-1);
      let inserted = '';
      if (donor) {
        const opening = donor.slice(0,donor.indexOf('>')+1);
        const cells = [...donor.matchAll(/<c\b[^>]*?(?:\/>|>[\s\S]*?<\/c>)/g)];
        for(let row=beforeRow;row<beforeRow+count;row++) {
          const rowTag=opening.replace(/\br=["']\d+["']/,`r="${row}"`);
          inserted += rowTag + cells.map(m=> {
            const column=attr(m[0].split('>')[0],'r').replace(/\d+$/,'');
            const style=attr(m[0].split('>')[0],'s');
            return column ? `<c r="${column}${row}"${style ? ` s="${style}"` : ''}/>` : '';
          }).join('') + '</row>';
        }
      }
      xml = xml.replace(/<row\b[^>]*>/g, tag => tag.replace(/\br=(["'])(\d+)\1/, (_, q, n) => {
        const row = Number(n) >= beforeRow ? Number(n) + count : Number(n);
        if (row > 1048576) throw new Error('Row insertion exceeds Excel limits.');
        return `r=${q}${row}${q}`;
      }));
      xml = xml.replace(/<[^!?/][^>]*>/g, tag => tag.replace(/\b(r|ref|sqref|activeCell|topLeftCell)=(["'])(.*?)\2/g,
        (all, key, quote, value) => key === 'r' && !/^<c\b/.test(tag) ? all : `${key}=${quote}${shift(value)}${quote}`));
      if (inserted) {
        const next = new RegExp(`<row\\b(?=[^>]*\\br=["']${beforeRow+count}["'])`);
        xml = next.test(xml) ? xml.replace(next,inserted+'<row') : xml.replace('</sheetData>',inserted+'</sheetData>');
      }
      if (operation.inheritHorizontalMerges && donorMerges.length) {
        const added = Array.from({length:count},(_,i)=>donorMerges.map(m=>`<mergeCell ref="${m![1]}${beforeRow+i}:${m![3]}${beforeRow+i}"/>`).join('')).join('');
        xml=xml.replace(/<mergeCells\b[^>]*>([\s\S]*?)<\/mergeCells>/,(_,body)=>`<mergeCells count="${[...body.matchAll(/<mergeCell\b/g)].length+count*donorMerges.length}">${body}${added}</mergeCells>`);
      }
      xml = xml.replace(/(<rowBreaks\b[^>]*>)([\s\S]*?)(<\/rowBreaks>)/g, (_, open, body, close) => open + body.replace(/\bid=(["'])(\d+)\1/g,
        (_m: string, q: string, n: string) => `id=${q}${Number(n) >= beforeRow ? Number(n) + count : n}${q}`) + close);
    }
    if (xml !== original) changes.set(filename, xml);
  }
  const workbook = await zip.file('xl/workbook.xml')!.async('string');
  const sheetNames = [...paths.keys()];
  const nextWorkbook = workbook.replace(/(<definedName\b[^>]*>)([\s\S]*?)(<\/definedName>)/g, (_, open, body, close) => {
    const id = attr(open, 'localSheetId');
    return open + escapeXml(shiftRowReferences(unescapeXml(body), id === '' ? '' : sheetNames[Number(id)], operation)) + close;
  });
  if (nextWorkbook !== workbook) changes.set('xl/workbook.xml', nextWorkbook);
  const relFile = `${path.posix.dirname(target)}/_rels/${path.posix.basename(target)}.rels`;
  const rels = await zip.file(relFile)?.async('string') || '';
  for (const match of rels.matchAll(/<Relationship\b[^>]*>/g)) {
    const type = attr(match[0], 'Type');
    if (type.endsWith('/hyperlink')) continue;
    if (!type.endsWith('/drawing') || attr(match[0], 'TargetMode') === 'External') throw new Error('Unsupported worksheet relationship for row insertion.');
    const relative = attr(match[0], 'Target');
    const drawingPath = relative.startsWith('/') ? relative.slice(1) : path.posix.normalize(`${path.posix.dirname(target)}/${relative}`);
    const drawing = await zip.file(drawingPath)?.async('string');
    if (!drawing || !drawingPath.startsWith('xl/drawings/')) throw new Error('Missing or unsafe drawing relationship.');
    if (/<(?:\w+:)?(?:absoluteAnchor|graphicFrame)\b/.test(drawing)) throw new Error('Absolute-positioned drawings/charts require reviewed row insertion.');
    for (const anchor of drawing.matchAll(/<(\w+:)?twoCellAnchor\b[^>]*>([\s\S]*?)<\/\1twoCellAnchor>/g)) {
      const rows = [...anchor[2].matchAll(/<(?:\w+:)?row>(\d+)<\/(?:\w+:)?row>/g)].map(m => Number(m[1]));
      if (rows.length !== 2 || (rows[0] < beforeRow - 1 && rows[1] >= beforeRow - 1)) throw new Error('Insertion would stretch an image spanning the boundary.');
    }
    const moved = drawing.replace(/(<(?:\w+:)?row>)(\d+)(<\/(?:\w+:)?row>)/g, (_, open, row, close) => {
      const result = Number(row) >= beforeRow - 1 ? Number(row) + count : Number(row);
      if (result >= 1048576) throw new Error('Drawing exceeds Excel limits.');
      return open + result + close;
    });
    if (moved !== drawing) changes.set(drawingPath, moved);
  }
  for (const [filename, xml] of changes) zip.file(filename, xml);
  return new Set(changes.keys());
}
