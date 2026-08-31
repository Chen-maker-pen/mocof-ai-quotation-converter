import { getDocumentedAreaPrompts } from './documentedPrompts.js';

/**
 * The prompt document is written for a spreadsheet, not for a card UI.  This
 * module turns the stable, unambiguous coordinates in each Area's original
 * prompts into a layout contract for the generated A:J workbook.  It does not
 * infer prices: numeric pricing stays source-derived or requires a visible
 * formula/review decision.
 */
export interface DocumentedRecipeLayout {
  area: number;
  roomStartRow: number;
  roomCount: number;
  extrasStartRow: number;
  wholeHouseTotalRow: number;
  supplementaryTitleRow: number;
  supplementaryHeaderRow: number;
  supplementaryStartRow: number;
  supplementaryEndRow: number;
  supplementaryTotalRow: number;
  supplementaryGrandTotalRow: number;
}

const firstMatch = (text: string, expression: RegExp): number | undefined => {
  const result = text.match(expression);
  return result?.[1] ? Number(result[1]) : undefined;
};

export function getDocumentedRecipeLayout(areaNumber?: number): DocumentedRecipeLayout {
  const area = Math.min(10, Math.max(1, Number(areaNumber) || 1));
  const prompts = getDocumentedAreaPrompts(area)?.prompts || [];
  // Do not search the entire document for a row number: later room-detail
  // prompts also use phrases such as "Insert the text".  The supplementary
  // section must be derived only from its own documented instructions.
  const supplementaryText = prompts
    .filter((prompt) => /SUPPLEMENTARY|ADD THE NAME OF CONTENT|ADD THE SERIAL NUMBER FOR SUPPLEMENTARY|INSERT THE SUPPLEMENTARY DISCOUNT|INSERT THE CONTENT AND FORMULA/i.test(`${prompt.category}\n${prompt.text}`))
    .map((prompt) => prompt.text)
    .join('\n');

  // Area 1–10 worksheets always begin their room summary at row 7. The
  // remaining rows are taken from the exact instructions when they exist.
  const roomStartRow = 7;
  const extrasStartRow = roomStartRow + area;
  const wholeHouseTotalRow = extrasStartRow + 6;
  const supplementaryTitleRow =
    firstMatch(supplementaryText, /Supplementary[\s\S]{0,180}?cell\s+A(\d+)/i) || wholeHouseTotalRow + 2;
  // In every Area recipe the headings belong directly below the supplementary
  // title.  Some prompt versions list the heading text before saying its row,
  // so parsing that prose can accidentally capture a later room-detail row.
  const supplementaryHeaderRow = supplementaryTitleRow + 1;
  const supplementaryStartRow =
    firstMatch(supplementaryText, /start(?:ing)?\s+(?:the\s+)?Sequential number from\s+(?:cell\s*)?A(\d+)/i) ||
    firstMatch(supplementaryText, /Start from\s+B(\d+)/i) ||
    supplementaryHeaderRow + 1;
  const supplementaryEndRow = supplementaryStartRow + 13;
  const supplementaryTotalRow =
    firstMatch(supplementaryText, /Total Supplementary:[\s\S]{0,80}?cell\s+A(\d+)/i) || supplementaryEndRow + 1;

  return {
    area,
    roomStartRow,
    roomCount: area,
    extrasStartRow,
    wholeHouseTotalRow,
    supplementaryTitleRow,
    supplementaryHeaderRow,
    supplementaryStartRow,
    supplementaryEndRow,
    supplementaryTotalRow,
    supplementaryGrandTotalRow: supplementaryTotalRow + 1,
  };
}

export const DOCUMENTED_SUPPLEMENTARY_ROWS = [
  ['Defect Check before start work', 1],
  ['3D & 2D design and submission', 5],
  ['Project management', 6],
  ['Post reno cleaning', 1],
  ['Floor Protection (Floor guard)', 1],
  ['Electrical', 19],
  ['Plaster ceiling', 10],
  ['Painting with white paint', 9],
  ['Paint with 3 colour Nippon colors', 12],
  ['Partition (normal w/o sound proof)', 24],
  ['Curtain with Blind per window H 8–9ft', 43],
  ['Hacking & Removal', 77],
  ['Grout', 6.5],
  ['Mirror', 50],
] as const;
