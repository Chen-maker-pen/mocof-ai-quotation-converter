export interface CopyColumnOperation {
  kind: 'copy_column'; sheetName: string; sourceColumn: string; targetColumn: string; promptNumber?: string;
}
const number = (s: string) => [...s].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0);
const letters = (n: number) => { let s = ''; while (n) { n--; s = String.fromCharCode(65 + n % 26) + s; n = Math.floor(n / 26); } return s; };
const attribute = (xml: string, key: string) => new RegExp(`\\b${key}=["']([^"']*)["']`).exec(xml)?.[1] || '';

export function translateColumnFormula(formula: string, delta: number) {
  return formula.split(/("(?:[^"]|"")*")/g).map((s, i) => {
    if (i % 2) return s;
    if (/[\[\]]|\b(?:INDIRECT|OFFSET)\s*\(/i.test(s)) throw new Error('Dynamic/structured/external formula copying needs review.');
    return s.replace(/(?<![\p{L}\p{N}_.])(?:(('(?:[^']|'')+'|[\p{L}_][\p{L}\p{N}_.]*)!))?(\$?)([A-Z]{1,3})(\$?[1-9]\d*)(?![\p{L}\p{N}_.(])/gu,
      (all, qualifier, _sheet, absolute, col, row) => {
        if (absolute) return all;
        const destination = number(col) + delta;
        if (destination < 1 || destination > 16384) throw new Error('Copied formula reference exceeds Excel limits.');
        return `${qualifier || ''}${letters(destination)}${row}`;
      });
  }).join('');
}

/** Copy stored cell content and formatting, column width, and wholly contained
 * vertical merges. Other ZIP parts and the source column remain unchanged. */
export function copyTemplateColumn(xml: string, operation: CopyColumnOperation): string {
  const source = operation.sourceColumn.toUpperCase(), target = operation.targetColumn.toUpperCase();
  if (![source, target].every(c => /^[A-Z]{1,3}$/.test(c) && number(c) <= 16384) || source === target) throw new Error('Invalid column copy.');
  const src = number(source), dst = number(target);
  if (/<(?:tableParts|conditionalFormatting|dataValidations|legacyDrawing|extLst)\b/.test(xml)) throw new Error('Column copy with tables, rules, comments or extensions needs review.');
  const merges = [...xml.matchAll(/<mergeCell\b[^>]*\/?\s*>/g)];
  const copiedMerges: string[] = [];
  for (const m of merges) {
    const range = attribute(m[0], 'ref');
    const [from, to = from] = range.split(':');
    const a = /^([A-Z]+)(\d+)$/.exec(from)!, b = /^([A-Z]+)(\d+)$/.exec(to)!;
    if (!a || !b) throw new Error('Invalid merged range.');
    const start = number(a[1]), end = number(b[1]);
    if (start <= dst && end >= dst) throw new Error('Destination column contains merges; reviewed replacement required.');
    if (start === src && end !== src) throw new Error('Source merge spans more than the copied column.');
    if (start === src && end === src) copiedMerges.push(`${target}${a[2]}:${target}${b[2]}`);
  }
  xml = xml.replace(/<row\b[^>]*>[\s\S]*?<\/row>/g, row => {
    const cells = [...row.matchAll(/<c\b[^>]*?(?:\/>|>[\s\S]*?<\/c>)/g)];
    const sourceCell = cells.find(c => attribute(c[0].slice(0, c[0].indexOf('>') + 1), 'r').replace(/\d+$/, '') === source)?.[0];
    const kept = cells.filter(c => attribute(c[0].slice(0, c[0].indexOf('>') + 1), 'r').replace(/\d+$/, '') !== target).map(c => c[0]);
    if (sourceCell) {
      if (/<f\b[^>]*\bt=["'](?:shared|array|dataTable)["']/.test(sourceCell)) throw new Error('Shared/array formula column copy requires coordinated editing.');
      let copied = sourceCell.replace(/\br=(["'])([A-Z]+)(\d+)\1/, (_m, q, _c, r) => `r=${q}${target}${r}${q}`);
      // Refuse formula copies until every dependent cache is recalculated.
      if (/<f\b/.test(copied)) throw new Error('Formula column copy requires full recalculation.');
      kept.push(copied);
    }
    kept.sort((a, b) => number(attribute(a.slice(0, a.indexOf('>') + 1), 'r').replace(/\d+$/, '')) - number(attribute(b.slice(0, b.indexOf('>') + 1), 'r').replace(/\d+$/, '')));
    if (!cells.length) return row;
    // Keep row metadata and any trailing extension in place.
    const first = cells[0].index!, last = cells.at(-1)!;
    return row.slice(0, first) + kept.join('') + row.slice(last.index! + last[0].length);
  });
  if (copiedMerges.length) {
    const additions = copiedMerges.map(ref => `<mergeCell ref="${ref}"/>`).join('');
    if (/<mergeCells\b/.test(xml)) xml = xml.replace(/(<mergeCells\b[^>]*>)([\s\S]*?)(<\/mergeCells>)/, (_m, open, body, close) =>
      open.replace(/\s+count=["']\d+["']/, '') + body + additions + close);
    else xml = xml.replace('</sheetData>', `</sheetData><mergeCells>${additions}</mergeCells>`);
  }
  const cols = /<cols\b[^>]*>([\s\S]*?)<\/cols>/.exec(xml);
  if (cols) {
    const definitions = [...cols[1].matchAll(/<col\b[^>]*\/?\s*>/g)].map(m => m[0]);
    const sourceDefinition = definitions.find(c => Number(attribute(c, 'min')) <= src && Number(attribute(c, 'max')) >= src);
    const setRange = (c: string, min: number, max: number) => c.replace(/\bmin=["']\d+["']/, `min="${min}"`).replace(/\bmax=["']\d+["']/, `max="${max}"`);
    const kept = definitions.flatMap(c => {
      const min = Number(attribute(c, 'min')), max = Number(attribute(c, 'max'));
      if (dst < min || dst > max) return [c];
      return [...(min < dst ? [setRange(c, min, dst - 1)] : []), ...(max > dst ? [setRange(c, dst + 1, max)] : [])];
    });
    if (sourceDefinition) kept.push(setRange(sourceDefinition, dst, dst));
    kept.sort((a,b) => Number(attribute(a,'min')) - Number(attribute(b,'min')));
    xml = xml.replace(cols[0], `<cols>${kept.join('')}</cols>`);
  }
  xml = xml.replace(/<dimension\b[^>]*>/, tag => tag.replace(/ref=(["'])([A-Z]+\d+):([A-Z]+)(\d+)\1/, (_m, q, start, end, row) => `ref=${q}${start}:${letters(Math.max(number(end), dst))}${row}${q}`));
  return xml;
}
