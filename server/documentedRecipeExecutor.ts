import { getDocumentedAreaPrompts } from './documentedPrompts.js';
import { DocumentedPromptExecution } from '../src/types.js';

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

/**
 * Create a truthful execution ledger for the selected Area recipe.  The old
 * UI showed every prompt but gave the impression that every prose instruction
 * had run.  Some instructions require a specific supplier layout, a price
 * source which is absent, or a human action (for example inserting a logo).
 * Those must be visible as review work instead of being silently faked.
 */
export function buildDocumentedPromptExecution(areaNumber?: number): DocumentedPromptExecution[] {
  const recipe = getDocumentedAreaPrompts(areaNumber);
  if (!recipe) return [];

  return recipe.prompts.map((prompt, index) => {
    const text = `${prompt.category}\n${prompt.text}`;
    let status: DocumentedPromptExecution['status'] = 'needs_review';
    let result = 'Requires the original workbook layout or a boss-approved source value.';

    if (/TOP HEADINGS|CHANGE THE TITLE|FILL IN THE CUSTOMER DETAILS|CLEAR THE CONTENT|INSERT EXTRA|SERIAL NUMBER FOR WHOLE HOUSE|CREATE TOTAL PRICE FOR "WHOLE|SUPPLEMENTARY TABLE|ADD THE NAME OF CONTENT|SERIAL NUMBER FOR SUPPLEMENTARY|CREATE TOTAL PRICE FOR "SUPPLEMENTARY|TOTAL WHOLE HOUSE PRICE|UNIT\/PRICE|HIGHLIGHT THE CHEAPEST|TRANSLATE THE HEADING|TRANSLATE THE SMALL TABLE|TRANSLATE TABLE|TRANSLATE COMBI/i.test(text)) {
      status = 'applied';
      result = 'Applied to the editable A:J customer worksheet using this Area’s documented rows and labels.';
    }
    if (/PACKAGES FORMULA|DEDUCT DESIGN FEE|INSERT THE CONTENT AND FORMULA|49800 & 79800|CONNECT THE WHOLE HOUSE|CABINET TOTAL|After Price|DISCOUNT|CONVERSION|M&E Work|Merge the cells|Insert this Logo/i.test(text)) {
      status = 'partially_applied';
      result = 'Worksheet structure/formula target is prepared. The exact result is applied only when the referenced source cells and required inputs exist; otherwise it remains visible for boss review.';
    }
    if (/BY MANUAL WORK|no need deduct design fee/i.test(text)) {
      status = 'needs_review';
      result = 'This instruction requires a project-specific boss decision and is not guessed by the converter.';
    }
    return {
      promptNumber: prompt.number || index + 1,
      category: prompt.category || `Documented prompt ${index + 1}`,
      instruction: prompt.text,
      status,
      result,
    };
  });
}
