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

/**
 * A recipe is deliberately a sequence, rather than one large AI prompt.
 * The Area_1 document says that several rename/conversion commands must run
 * one after another; keeping this order makes that contract visible to both
 * the converter and the Prompt Trace.
 */
export interface AreaRecipeStep {
  promptNumber: string;
  operation: string;
  target: string;
  mode: 'deterministic' | 'source-derived' | 'review-required';
}

/**
 * These are the standard non-room lines shown after the actual spaces in the
 * MOCOF Whole House Total.  They are not counted as an Area.  Keeping this
 * list in one place prevents the grid, detail view and exports from silently
 * using different layouts.
 */
export const WHOLE_HOUSE_SERVICE_ROWS = [
  'Extra m²',
  'Curve',
  'Wall Panel',
  'Aluminium Frame',
  'Add-on finishing',
  'Wall bed',
  'Pull out mechanism',
  'Sliding Door',
  'Hidden Door',
  'Folding Door',
  'Partition at foyer',
  'Staircase store room',
  'Window',
  'Grill door',
  'Special off',
] as const;

const AREA_ONE_OPERATION_ORDER: AreaRecipeStep[] = [
  ['1', 'Create the MOCOF heading and preserve H as the source price column.', 'E1, A5, H:J', 'deterministic'],
  ['2', 'Create the fixed A:J headings and customer-detail labels.', 'E2:J6', 'deterministic'],
  ['3', 'Set whole-house discount input.', 'I2', 'deterministic'],
  ['4', 'Clear package input cells before applying Area 1 package rules.', 'D7:G8', 'deterministic'],
  ['5', 'Create the six Area 1 service rows after the one real room.', 'A8:B13', 'deterministic'],
  ['6', 'Skip Deduct Design Fee only when the uploaded job is a Project quote.', 'B13', 'review-required'],
  ['7', 'Number the Whole House Total rows.', 'A7:A13', 'deterministic'],
  ['8', 'Calculate Whole House Total columns.', 'D14:J14', 'deterministic'],
  ['9', 'Apply package formulas only when cabinet/wall-panel m² values exist in the source.', 'F8:G10', 'source-derived'],
  ['10', 'Apply the sqft-based Deduct Design Fee threshold.', 'F13:G13:J13', 'source-derived'],
  ['11', 'Format money values as RM.', 'F7:J14', 'deterministic'],
  ['12', 'Create the Supplementary section.', 'A16:J16', 'deterministic'],
  ['13', 'Create Supplementary headings.', 'A17:J17', 'deterministic'],
  ['14', 'Create the documented Supplementary service rows.', 'A18:B31', 'deterministic'],
  ['15', 'Set the Supplementary discount input.', 'I3', 'deterministic'],
  ['16', 'Create sqft/quantity and price formula cells.', 'D18:J31', 'deterministic'],
  ['17', 'Link RM49800 and RM79800 to After Price; zero the first five standard services.', 'F18:G31, J18:J22', 'deterministic'],
  ['18', 'Calculate Total Supplementary.', 'A32:J32', 'deterministic'],
  ['19', 'Calculate Whole House + Supplementary totals.', 'A33:J33', 'deterministic'],
  ['20', 'Calculate customer unit price from final price and sqft.', 'H4', 'deterministic'],
  ['21', 'Highlight the lowest applicable total.', 'F33:J33', 'deterministic'],
  ['22', 'Translate total labels.', 'A:A', 'source-derived'],
  ['23', 'Translate Cabinet/Accessories Table labels.', 'A:A', 'source-derived'],
  ['24', 'Translate Guest Bedroom, Study Room and Living/Dining headings.', 'A:B', 'source-derived'],
  ['25', 'Translate Foyer and Master Bedroom headings.', 'A:B', 'source-derived'],
  ['26', 'Translate Kitchen, Multipurpose Room and Kids Room headings.', 'A:B', 'source-derived'],
  ['27', 'Translate detail-table headings No., Product PIC, Combi and Name.', 'A:D', 'source-derived'],
  ['28', 'Translate detail-table headings Model, WDH, Qty and Before Price.', 'E:H', 'source-derived'],
  ['29', 'Translate documented product-section labels.', 'C:C', 'source-derived'],
  ['30', 'Translate Handler, Customer Signature and Date labels.', 'D:D', 'source-derived'],
  ['31', 'Connect summary rows to the correct source detail-table totals.', 'H7:H10', 'source-derived'],
  ['32', 'Calculate Cabinet Total Price and Accessories Total Price.', 'H54, H110', 'source-derived'],
  ['33', 'Create detail-table Before/After price headings and initial formulas.', 'I36:I141', 'deterministic'],
  ['34', 'Rename H/I/J detail columns then convert H to I.', 'H43:I222', 'deterministic'],
  ['35', 'Apply the selected discount from I to J.', 'J44:J222', 'deterministic'],
  ['36', 'Add M&E Work and Curtain section anchors.', 'A120:D128', 'source-derived'],
  ['37', 'Add M&E Work and Curtain table headings.', 'A121:G126', 'source-derived'],
  ['38', 'Add documented M&E and Curtain content.', 'E128, E212', 'source-derived'],
  ['39', 'Set M&E and Curtain quantities and names.', 'D122:G128', 'source-derived'],
  ['40', 'Insert the MOCOF logo.', 'A1:D4', 'review-required'],
  ['41', 'Apply required horizontal and vertical merges.', 'Workbook merged ranges', 'review-required'],
  ['42', 'Insert bilingual terms and signature footer.', 'Footer', 'review-required'],
  ['43', 'Remove supplier promotion row.', '活动金额优惠价 row', 'source-derived'],
].map(([promptNumber, operation, target, mode]) => ({ promptNumber, operation, target, mode: mode as AreaRecipeStep['mode'] }));

const AREA_TWO_TARGETS: Record<string, Omit<AreaRecipeStep, 'promptNumber'>> = {
  '1': { operation: 'Select the Area 2 recipe before any worksheet changes.', target: 'Area selector', mode: 'deterministic' },
  '2': { operation: 'Create the MOCOF heading and preserve H as source price.', target: 'E1, A5, H:J', mode: 'deterministic' },
  '3': { operation: 'Create Area 2 Whole House column headings.', target: 'A6:J6', mode: 'deterministic' },
  '4': { operation: 'Create customer details, currency and whole-house discount inputs.', target: 'E2:J4, I2', mode: 'deterministic' },
  '5': { operation: 'Clear the documented Area 2 package input range.', target: 'D7:G9', mode: 'deterministic' },
  '6': { operation: 'Create Area 2 service/add-on rows after the two rooms.', target: 'A9:B14', mode: 'deterministic' },
  '7': { operation: 'Number Whole House Total rows.', target: 'A7:A14', mode: 'deterministic' },
  '8': { operation: 'Skip Deduct Design Fee only for a Project quote.', target: 'B14', mode: 'review-required' },
  '9': { operation: 'Calculate Whole House Total columns.', target: 'D15:J15', mode: 'deterministic' },
  '10': { operation: 'Apply package formulas where source m² inputs are present.', target: 'F9:G11', mode: 'source-derived' },
  '11': { operation: 'Confirm Whole House Total numbering after insertion.', target: 'A7:A14', mode: 'deterministic' },
  '12': { operation: 'Apply the Project quote exception.', target: 'B14', mode: 'review-required' },
  '13': { operation: 'Apply the sqft-based Deduct Design Fee threshold.', target: 'F14:G14:J14', mode: 'source-derived' },
  '14': { operation: 'Format Area 2 monetary values as RM.', target: 'F7:J15', mode: 'deterministic' },
  '15': { operation: 'Create the Area 2 Supplementary section.', target: 'A17:J17', mode: 'deterministic' },
  '16': { operation: 'Create Area 2 Supplementary headings.', target: 'A18:J18', mode: 'deterministic' },
  '17': { operation: 'Create documented Supplementary service rows.', target: 'A19:B32', mode: 'deterministic' },
  '18': { operation: 'Number Supplementary rows and set its discount input.', target: 'A19:A32, I3', mode: 'deterministic' },
  '19': { operation: 'Create sqft/quantity and price formulas.', target: 'D19:J32', mode: 'deterministic' },
  '20': { operation: 'Link package columns to After Price and zero the first five standard services.', target: 'F19:G32, J19:J23', mode: 'deterministic' },
  '21': { operation: 'Calculate Total Supplementary.', target: 'A33:J33', mode: 'deterministic' },
  '22': { operation: 'Calculate Whole House Price with Supplementary Items.', target: 'A34:J34', mode: 'deterministic' },
  '23': { operation: 'Calculate final unit price from final total and sqft.', target: 'H4', mode: 'deterministic' },
  '24': { operation: 'Highlight the cheapest final total.', target: 'F34:J34', mode: 'deterministic' },
  '25': { operation: 'Translate total labels.', target: 'A:A', mode: 'source-derived' },
  '26': { operation: 'Translate small table labels.', target: 'A:A', mode: 'source-derived' },
  '27': { operation: 'Translate first room-heading set.', target: 'A:B', mode: 'source-derived' },
  '28': { operation: 'Translate Foyer and Master Bedroom headings.', target: 'A:B', mode: 'source-derived' },
  '29': { operation: 'Translate Kitchen, Multipurpose and Kids Room headings.', target: 'A:B', mode: 'source-derived' },
  '30': { operation: 'Translate first detail-table headings.', target: 'A:D', mode: 'source-derived' },
  '31': { operation: 'Translate second detail-table headings.', target: 'E:H', mode: 'source-derived' },
  '32': { operation: 'Translate documented combination labels.', target: 'C:C', mode: 'source-derived' },
  '33': { operation: 'Connect whole-house summary cells to source detail totals.', target: 'H7:H10', mode: 'source-derived' },
  '34': { operation: 'Calculate Cabinet and Accessories totals.', target: 'H54, H110', mode: 'source-derived' },
  '35': { operation: 'Create the documented detail Before/After formula chain.', target: 'I36:I141', mode: 'deterministic' },
  '36': { operation: 'Rename H/I/J then convert source price H to Before Price I.', target: 'H43:I222', mode: 'deterministic' },
  '37': { operation: 'Apply the selected discount from Before Price I to After Price J.', target: 'J44:J222', mode: 'deterministic' },
  '38': { operation: 'Create M&E Work and Curtain headings.', target: 'A120:G128', mode: 'source-derived' },
  '39': { operation: 'Add documented M&E and Curtain text.', target: 'E128, E212', mode: 'source-derived' },
  '40': { operation: 'Set M&E/Curtain quantities and labels.', target: 'D122:G128', mode: 'source-derived' },
  '41': { operation: 'Insert MOCOF logo.', target: 'A1:D4', mode: 'review-required' },
  '42': { operation: 'Apply merges and bilingual legal remarks.', target: 'Workbook merged ranges and footer', mode: 'review-required' },
};

function getAreaTwoOperationOrder(): AreaRecipeStep[] {
  return (getDocumentedAreaPrompts(2)?.prompts || []).map((prompt) => ({
    promptNumber: prompt.number,
    ...(AREA_TWO_TARGETS[prompt.number] || {
      operation: prompt.category || 'Documented Area 2 operation',
      target: 'Area 2 workbook',
      mode: 'review-required' as const,
    }),
  }));
}

// Area 3 is a distinct document, not a variation of the Area 1 or Area 2
// sample.  Each source-prompt number has an explicit execution target so the
// Prompt Trace remains an auditable ordered recipe when Area 3 is selected.
const AREA_THREE_TARGETS: Record<string, Omit<AreaRecipeStep, 'promptNumber'>> = {
  '1': { operation: 'Copy source price content to Before/After columns and create the MOCOF heading.', target: 'E1, A5, H:J', mode: 'deterministic' },
  '2': { operation: 'Create Area 3 headings, customer inputs, currency, budget and the whole-house discount multiplier. I2 remains an editable numeric factor.', target: 'A6:J6, E2:J4, I2', mode: 'deterministic' },
  '3': { operation: 'Clear documented Area 3 package input cells.', target: 'D7:G10', mode: 'deterministic' },
  '4': { operation: 'Create six service/add-on rows after the three real rooms.', target: 'A10:B15', mode: 'deterministic' },
  '5': { operation: 'Number the Whole House Total rows.', target: 'A7:A15', mode: 'deterministic' },
  '6': { operation: 'Apply the Project quote exception for Deduct Design Fee.', target: 'B15', mode: 'review-required' },
  '7': { operation: 'Calculate Whole House Total columns.', target: 'D16:J16', mode: 'deterministic' },
  '8': { operation: 'Apply documented Extra m² and Wall Panel package formulas when required source m² inputs exist.', target: 'F10:G12', mode: 'source-derived' },
  '9': { operation: 'Apply the sqft-based Deduct Design Fee threshold.', target: 'F15:G15:J15', mode: 'source-derived' },
  '10': { operation: 'Format Area 3 monetary values as RM.', target: 'F7:J16', mode: 'deterministic' },
  '11': { operation: 'Create the Area 3 Supplementary section.', target: 'A18:J18', mode: 'deterministic' },
  '12': { operation: 'Create Supplementary column headings.', target: 'A19:J19', mode: 'deterministic' },
  '13': { operation: 'Create the documented Supplementary service rows plus the boss-confirmed Bathroom Shower Screen row.', target: 'A20:B34', mode: 'deterministic' },
  '14': { operation: 'Number Supplementary rows and set its 80% discount input.', target: 'A20:A34, I3', mode: 'deterministic' },
  '15': { operation: 'Set documented sqft/per, quantity and Before/After price formulas.', target: 'D20:J34', mode: 'deterministic' },
  '16': { operation: 'Mirror After Price into RM49800/RM79800 and zero the first five standard services.', target: 'F20:G34, J20:J24', mode: 'deterministic' },
  '17': { operation: 'Calculate Total Supplementary.', target: 'A35:J35', mode: 'deterministic' },
  '18': { operation: 'Calculate Whole House Price with Supplementary Items.', target: 'A36:J36', mode: 'deterministic' },
  '19': { operation: 'Calculate customer final unit price from final total and sqft.', target: 'G4:H4', mode: 'deterministic' },
  '20': { operation: 'Highlight the cheapest applicable total.', target: 'F36:J36', mode: 'deterministic' },
  '21': { operation: 'Create M&E Work and Curtain section anchors.', target: 'A120:D128', mode: 'source-derived' },
  '22': { operation: 'Create M&E Work and Curtain headings.', target: 'A121:G126', mode: 'source-derived' },
  '23': { operation: 'Add documented M&E and Curtain descriptions.', target: 'E128, E212', mode: 'source-derived' },
  '24': { operation: 'Set M&E/Curtain quantities and labels.', target: 'D122:G128', mode: 'source-derived' },
  '25': { operation: 'Translate total labels.', target: 'A:A', mode: 'source-derived' },
  '26': { operation: 'Translate Cabinet and Accessories Table labels.', target: 'A:A', mode: 'source-derived' },
  '27': { operation: 'Translate Guest Bedroom, Study Room and Living/Dining headings.', target: 'A:B', mode: 'source-derived' },
  '28': { operation: 'Translate Foyer and Master Bedroom headings.', target: 'A:B', mode: 'source-derived' },
  '29': { operation: 'Translate Kitchen, Multipurpose Room and Kids Room headings.', target: 'A:B', mode: 'source-derived' },
  '30': { operation: 'Translate first detail-table headings.', target: 'A:D', mode: 'source-derived' },
  '31': { operation: 'Translate second detail-table headings.', target: 'E:H', mode: 'source-derived' },
  '32': { operation: 'Translate documented combination labels.', target: 'C:C', mode: 'source-derived' },
  '33': { operation: 'Connect Whole House Total rows to source detail-table totals.', target: 'H7:H10, H54, H110', mode: 'source-derived' },
  '34': { operation: 'Calculate Living and Dining Cabinet + Accessories total.', target: 'H68', mode: 'source-derived' },
  '35': { operation: 'Create documented detail Before/After formula chain.', target: 'I36:I141', mode: 'deterministic' },
  '36': { operation: 'Rename detail price headings and convert Software Price H to Before Price I.', target: 'H39:I222', mode: 'deterministic' },
  '37': { operation: 'Apply the selected discount from Before Price I to After Price J.', target: 'J40:J222', mode: 'deterministic' },
  '38': { operation: 'Insert the MOCOF logo and required horizontal/vertical merges.', target: 'A1:D4 and workbook merged ranges', mode: 'review-required' },
  '39': { operation: 'Insert bilingual contract remarks and footer.', target: 'Footer', mode: 'review-required' },
};

function getAreaThreeOperationOrder(): AreaRecipeStep[] {
  return (getDocumentedAreaPrompts(3)?.prompts || []).map((prompt) => ({
    promptNumber: prompt.number,
    ...(AREA_THREE_TARGETS[prompt.number] || {
      operation: prompt.category || 'Documented Area 3 operation',
      target: 'Area 3 workbook',
      mode: 'review-required' as const,
    }),
  }));
}

export function getAreaRecipeSteps(areaNumber?: number): AreaRecipeStep[] {
  if (Number(areaNumber) === 1) return AREA_ONE_OPERATION_ORDER;
  if (Number(areaNumber) === 2) return getAreaTwoOperationOrder();
  if (Number(areaNumber) === 3) return getAreaThreeOperationOrder();
  // Area 4's document is retained line-by-line in the audit trail.  The
  // stable workbook steps below are executed by the shared A:J recipe; any
  // supplier-layout-only step remains visibly marked for review instead of
  // being claimed as automated.
  if (Number(areaNumber) === 4) return (getDocumentedAreaPrompts(4)?.prompts || []).map((prompt) => ({
    promptNumber: prompt.number,
    operation: /INSERT EXTRA|SERIAL NUMBER|TOTAL PRICE|SUPPLEMENTARY|TOP HEADINGS|CUSTOMER DETAILS/i.test(`${prompt.category}\n${prompt.text}`)
      ? 'Execute the Area 4 Whole House and Supplementary workbook step.'
      : (prompt.category || 'Documented Area 4 operation'),
    target: /INSERT EXTRA/i.test(`${prompt.category}\n${prompt.text}`) ? 'Whole House service rows' : 'Area 4 workbook',
    mode: /INSERT EXTRA|SERIAL NUMBER|TOTAL PRICE|SUPPLEMENTARY|TOP HEADINGS|CUSTOMER DETAILS/i.test(`${prompt.category}\n${prompt.text}`)
      ? 'deterministic'
      : 'review-required',
  }));
  return (getDocumentedAreaPrompts(areaNumber)?.prompts || []).map((prompt) => ({
    promptNumber: prompt.number,
    operation: prompt.category || 'Documented quotation operation',
    target: 'Selected Area workbook',
    mode: 'review-required',
  }));
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
  // The full standard service section is required in every Area.  It takes
  // precedence over old six-row examples in some historical prompt files so
  // that the table never overlaps its Supplementary section.
  const wholeHouseTotalRow = extrasStartRow + WHOLE_HOUSE_SERVICE_ROWS.length;
  const supplementaryTitleRow = wholeHouseTotalRow + 2;
  // In every Area recipe the headings belong directly below the supplementary
  // title.  Some prompt versions list the heading text before saying its row,
  // so parsing that prose can accidentally capture a later room-detail row.
  const supplementaryHeaderRow = supplementaryTitleRow + 1;
  const supplementaryStartRow =
    firstMatch(supplementaryText, /start(?:ing)?\s+(?:the\s+)?Sequential number from\s+(?:cell\s*)?A(\d+)/i) ||
    firstMatch(supplementaryText, /Start from\s+B(\d+)/i) ||
    supplementaryHeaderRow + 1;
  // Area 3's original document contains fourteen standard rows. The boss's
  // later approved worksheet adds Bathroom Shower Screen as row 15.
  const supplementaryRowCount = area === 3 ? 15 : 14;
  const supplementaryEndRow = supplementaryStartRow + supplementaryRowCount - 1;
  const documentedTotalRow = firstMatch(supplementaryText, /Total Supplementary:[\s\S]{0,80}?cell\s+A(\d+)/i);
  const supplementaryTotalRow = area === 3
    ? supplementaryEndRow + 1
    : (documentedTotalRow || supplementaryEndRow + 1);

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
  ['Bathroom Shower Screen', 1000],
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

  const areaOneSteps = new Map(getAreaRecipeSteps(areaNumber).map((step) => [step.promptNumber, step]));

  return recipe.prompts.map((prompt, index) => {
    const text = `${prompt.category}\n${prompt.text}`;
    let status: DocumentedPromptExecution['status'] = 'needs_review';
    let result = 'Requires the original workbook layout or a boss-approved source value.';

    const mappedStep = areaOneSteps.get(prompt.number);
    // Preserve every Area-document line verbatim in the audit trace. I2 is
    // deliberately editable in the workbook, so a later confirmed discount
    // changes all linked J cells without altering the source prompt record.
    const instruction = prompt.text;
    if (mappedStep) {
      status = mappedStep.mode === 'deterministic'
        ? 'applied'
        : mappedStep.mode === 'source-derived'
          ? 'partially_applied'
          : 'needs_review';
      result = `${mappedStep.operation} Target: ${mappedStep.target}. ${mappedStep.mode === 'deterministic'
        ? 'Executed in the Area 1 A:J recipe.'
        : mappedStep.mode === 'source-derived'
          ? 'Runs only when its required source value/row is present; otherwise it remains visible for review.'
          : 'Requires a logo, merge decision, project classification or other manager action.'}`;
      return { promptNumber: prompt.number || index + 1, category: prompt.category || `Documented prompt ${index + 1}`, instruction, status, result };
    }

    // Only label a prompt "applied" when the generator performs its matching
    // operation for every upload.  The previous broad keyword match marked
    // translation, manual logos, and supplier-specific package formulas as
    // done even though no such operation had happened.
    if (/TOP HEADINGS|CHANGE THE TITLE|FILL IN THE CUSTOMER DETAILS|CLEAR THE CONTENT|INSERT EXTRA|SERIAL NUMBER FOR WHOLE HOUSE|SUPPLEMENTARY TABLE|ADD THE NAME OF CONTENT|SERIAL NUMBER FOR SUPPLEMENTARY|CREATE TOTAL PRICE FOR "WHOLE|CREATE TOTAL PRICE FOR "SUPPLEMENTARY|TOTAL WHOLE HOUSE PRICE/i.test(text)) {
      status = 'applied';
      result = 'Applied as an addressable operation in the editable A:J customer worksheet for this Area.';
    }
    if (/INSERT THE CONTENT AND FORMULA|After Price|DISCOUNT|CONVERSION|UNIT\/PRICE|HIGHLIGHT THE CHEAPEST/i.test(text)) {
      status = 'partially_applied';
      result = 'The formula cells and inputs are created. Its numeric result is calculated from the uploaded values and must be reviewed if the source does not provide every referenced input.';
    }
    if (/PACKAGES FORMULA|DEDUCT DESIGN FEE|49800 & 79800|CONNECT THE WHOLE HOUSE|CABINET TOTAL|M&E Work|Merge the cells|Insert this Logo|TRANSLATE/i.test(text)) {
      status = 'needs_review';
      result = 'Not marked applied: this source-specific or manual instruction is not yet executed safely for every uploaded workbook.';
    }
    return {
      promptNumber: prompt.number || index + 1,
      category: prompt.category || `Documented prompt ${index + 1}`,
      instruction,
      status,
      result,
    };
  });
}
