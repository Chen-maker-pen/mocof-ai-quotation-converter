import { CustomerWorkbookSheet } from '../types';

/**
 * Small, deliberately restricted spreadsheet evaluator for the quotation
 * formulas. It is not JavaScript eval: it accepts only A1 references, SUM,
 * arithmetic, parentheses and percentages. Excel still receives the original
 * formula on export; this simply lets the web grid show the calculated result.
 */
export function evaluateWorkbookCell(sheet: CustomerWorkbookSheet, address: string, visiting = new Set<string>()): number | undefined {
  const normalized = address.toUpperCase();
  if (visiting.has(normalized)) return undefined;
  const cell = sheet.cells[normalized];
  if (!cell) return 0;
  if (!cell.formula) {
    const numeric = typeof cell.value === 'number' ? cell.value : Number(String(cell.value).replace(/[RM,\s]/g, ''));
    return Number.isFinite(numeric) ? numeric : undefined;
  }

  visiting.add(normalized);
  try {
    let expression = String(cell.formula).replace(/^=/, '').toUpperCase();
    expression = expression.replace(/SUM\(\s*([A-Z]+\d+)\s*:\s*([A-Z]+\d+)\s*\)/g, (_match, from, to) => String(sumRange(sheet, from, to, new Set(visiting))));
    expression = expression.replace(/\b([A-Z]+\d+)\b/g, (_match, ref) => String(evaluateWorkbookCell(sheet, ref, new Set(visiting)) ?? 0));
    expression = expression.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
    // Formula text must contain only numbers and arithmetic after references
    // are substituted. Reject anything else rather than attempting to run it.
    if (!/^[\d.\s+\-*/()]+$/.test(expression)) return undefined;
    const result = Function(`"use strict"; return (${expression});`)();
    return typeof result === 'number' && Number.isFinite(result) ? Number(result.toFixed(2)) : undefined;
  } catch {
    return undefined;
  } finally {
    visiting.delete(normalized);
  }
}

function sumRange(sheet: CustomerWorkbookSheet, from: string, to: string, visiting: Set<string>) {
  const parse = (reference: string) => {
    const match = reference.match(/^([A-Z]+)(\d+)$/);
    if (!match) return { column: 0, row: 0 };
    const column = match[1].split('').reduce((value, letter) => value * 26 + letter.charCodeAt(0) - 64, 0);
    return { column, row: Number(match[2]) };
  };
  const start = parse(from);
  const end = parse(to);
  let total = 0;
  for (let row = Math.min(start.row, end.row); row <= Math.max(start.row, end.row); row++) {
    for (let column = Math.min(start.column, end.column); column <= Math.max(start.column, end.column); column++) {
      let value = column;
      let letters = '';
      while (value > 0) { const remainder = (value - 1) % 26; letters = String.fromCharCode(65 + remainder) + letters; value = Math.floor((value - 1) / 26); }
      total += evaluateWorkbookCell(sheet, `${letters}${row}`, new Set(visiting)) ?? 0;
    }
  }
  return total;
}
