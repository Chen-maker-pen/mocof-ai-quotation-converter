import { createPreservedTemplateWorkbook, readTemplateWorkbook, type TemplateCellPatch } from './templateWorkbook.js';
import { evaluateWorkbookValue } from '../src/lib/formulaEvaluator.js';
import type { Quote } from '../src/types.js';

/** Include current grid edits, with finite formula results, in the clone export. */
export async function exportTemplate(quote: Quote): Promise<Buffer> {
  const encoded = quote.preservedTemplateWorkbook?.transformedXlsxBase64;
  if (!encoded) throw new Error('A preserved source XLSX is required. Re-upload the original workbook.');
  const raw = Buffer.from(encoded, 'base64');
  const baseline = await readTemplateWorkbook(raw);
  if (!quote.workbookSheets) return raw;
  if (baseline.map(s => s.name).join('\n') !== quote.workbookSheets.map(s => s.name).join('\n')) throw new Error('Sheet names/order differ from the source clone.');
  const patches: TemplateCellPatch[] = [];
  for (const sheet of quote.workbookSheets) {
    const original = baseline.find(s => s.name === sheet.name)!;
    for (const address of Object.keys(original.cells)) if (!sheet.cells[address]) throw new Error(`Cell deletion must be explicit: ${sheet.name}!${address}`);
    for (const [address, cell] of Object.entries(sheet.cells)) {
      const before = original.cells[address];
      const formula = cell.formula?.replace(/^=/, '');
      const changed = before?.value !== cell.value || before?.formula !== formula;
      if (!changed) continue;
      const value = formula ? evaluateWorkbookValue(sheet, address, quote.workbookSheets) : cell.value;
      if (value === undefined) throw new Error(`Cannot safely calculate ${sheet.name}!${address}. Export needs review.`);
      patches.push({ sheetName: sheet.name, address, formula, value });
    }
  }
  // Recalculate every formula, including cross-sheet dependents of changed
  // inputs. Unsupported formulas abort the entire export before any write.
  if (patches.length) for (const sheet of quote.workbookSheets) for (const cell of Object.values(sheet.cells)) {
    if (!cell.formula) continue;
    const value = evaluateWorkbookValue(sheet, cell.address, quote.workbookSheets);
    if (value === undefined) throw new Error(`Cannot recalculate ${sheet.name}!${cell.address}; export needs review.`);
    const existing = patches.find(p => p.sheetName === sheet.name && p.address === cell.address);
    if (existing) existing.value = value;
    else if (baseline.find(s => s.name === sheet.name)!.cells[cell.address]?.value !== value)
      patches.push({ sheetName: sheet.name, address: cell.address, formula: cell.formula.replace(/^=/,''), value });
  }
  const result = await createPreservedTemplateWorkbook(raw, quote.preservedTemplateWorkbook!.originalFileName, patches);
  return Buffer.from(result.transformedXlsxBase64, 'base64');
}
