import { CustomerWorkbookSheet, Project, Quote, QuoteRoom, SupplementaryItem, WorkbookCell } from '../src/types.js';
import { DOCUMENTED_SUPPLEMENTARY_ROWS, getDocumentedRecipeLayout } from './documentedRecipeExecutor.js';

const columns = 'ABCDEFGHIJ'.split('');
const address = (row: number, column: number) => `${columns[column - 1] || 'A'}${row}`;

/**
 * Creates an addressable A:J quotation grid.  It deliberately mirrors the
 * fixed columns used in the MOCOF prompt document: H = Software Price,
 * I = Before Price and J = After Price.  The prompt trace can therefore be
 * checked against actual cells, instead of a translated card-style UI.
 */
export function buildCustomerWorkbookGrid(quote: Quote, project: Project): CustomerWorkbookSheet[] {
  const cells: Record<string, WorkbookCell> = {};
  const put = (row: number, column: number, value: string | number, kind: WorkbookCell['kind'] = 'text', formula?: string) => {
    const cellAddress = address(row, column);
    cells[cellAddress] = { address: cellAddress, row, column, value, kind, formula };
  };
  const putRow = (row: number, values: Array<string | number>, kind: WorkbookCell['kind'] = 'text') => values.forEach((value, index) => put(row, index + 1, value, kind));
  const money = (cents: number) => Number((cents / 100).toFixed(2));
  const roomSoftwarePrice = (room: QuoteRoom) => {
    const items = room.sections.flatMap((section) => section.items).filter((item) => item.isVisibleToCustomer);
    const reconstructed = money(items.reduce((sum, item) => sum + item.totalAmountCents, 0));
    // Supplier summary H is the authoritative source price. Detail prices can
    // be repeated over merged product groups, so summing them can overstate a
    // room. This value belongs in Software Price (H) only.
    return room.sourceSummaryCents === undefined ? reconstructed : money(room.sourceSummaryCents);
  };
  const worksheet = quote.worksheets.find((sheet) => sheet.code === 'whole_house') || quote.worksheets[0];
  const rooms = worksheet?.rooms || [];
  const layout = getDocumentedRecipeLayout(quote.detectedArea || rooms.length);
  const isAreaOne = layout.area === 1;
  const usesFirstFiveSupplementaryZeroRule = isAreaOne || layout.area === 2 || layout.area === 3;

  // Header cells are exactly where the documented recipe expects them.  This
  // is intentionally an A:J grid, not a separate dashboard table: every
  // prompt in the source document refers to these coordinates.
  put(1, 5, 'MOCOF Whole House Quotation', 'title');
  // H2 and I2 are deliberately separate. H2 is the source-to-customer
  // currency rate for detail rows; I2 is the documented whole-house
  // discount multiplier. Keeping the values in their documented cells makes
  // every formula traceable and editable in the grid.
  putRow(2, ['', '', '', '', 'Customer Name', project.customerName, 'Currency', quote.exchangeRate.rate, 'Discount', 0.9]);
  // I3 is the separately documented supplementary discount cell. It must not
  // be mistaken for the whole-house discount in I2.
  putRow(3, ['', '', '', '', 'Address', project.projectAddress, 'Budget', '', 'Supplementary discount', 0.8]);
  putRow(4, ['', '', '', '', 'Sqft', quote.sourceCustomerSqft || '', 'RM/sqft', '', '', '']);
  put(5, 1, 'Whole House Total', 'title');
  putRow(6, ['No.', 'Space', '', 'Wall Panel (m²)', 'Cabinet (m²)', 'RM49800', 'RM79800', 'Software Price', 'Before Price', 'After Price'], 'header');

  let row = layout.roomStartRow;
  rooms.forEach((room, index) => {
    const software = roomSoftwarePrice(room);
    // Whole-house rows use the supplier total as their Before Price. This is
    // the value shown in the source summary and must never be converted a
    // second time. The final customer amount is the live documented discount
    // formula. Detail-table rows below use the H → I currency conversion
    // recipe separately.
    putRow(row, [index + 1, `${room.roomNameEnglish}${room.roomNameChinese && room.roomNameChinese !== room.roomNameEnglish ? ` // ${room.roomNameChinese}` : ''}`, '', '', '', 0, 0, software, 0, 0], 'input');
    put(row, 9, 0, 'formula', `H${row}`);
    put(row, 10, 0, 'formula', `I${row}*$I$2`);
    // F/G are package columns, not copies of the room total. The documented
    // Area recipes populate them only when their package formula applies.
    row++;
  });
  // These are services/add-ons, not rooms. They are always after the detected room rows.
  const services = ['Extra m²', 'Curve', 'Wall Panel', 'Aluminium Frame', 'Add-on finishing', 'Deduct Design Fee'];
  services.forEach((service, index) => {
    const serviceRow = layout.extrasStartRow + index;
    putRow(serviceRow, [layout.roomCount + index + 1, service, '', '', '', 0, 0, 0, 0, 0], 'input');
  });
  const wholeTotalRow = layout.wholeHouseTotalRow;
  put(wholeTotalRow, 2, 'Total Price:', 'total');
  [4, 5, 6, 7, 8, 9, 10].forEach((column) => put(wholeTotalRow, column, 0, 'formula', `SUM(${address(layout.roomStartRow, column)}:${address(wholeTotalRow - 1, column)})`));

  put(layout.supplementaryTitleRow, 1, 'Supplementary', 'title');
  putRow(layout.supplementaryHeaderRow, ['No.', 'Item', '', 'sqft / per', 'Qty / per', 'RM49800', 'RM79800', 'Software Price', 'Before Price', 'After Price'], 'header');
  const sourceSupplementary = new Map(quote.supplementaryItems.map((item) => [item.description.trim().toLowerCase(), item]));
  const knownSupplementary = new Set(DOCUMENTED_SUPPLEMENTARY_ROWS.map(([description]) => description.toLowerCase()));
  // Documented rows define the standard template. Preserve any additional
  // source service (for example Bathroom Shower Screen) as an editable row;
  // never drop it and never assign it a sample price.
  const supplementaryRows: Array<readonly [string, number]> = [
    ...DOCUMENTED_SUPPLEMENTARY_ROWS,
    ...quote.supplementaryItems
      .filter((item) => !knownSupplementary.has(item.description.trim().toLowerCase()))
      .map((item) => [item.description, supplementaryPerValue(item)] as const),
  ];
  supplementaryRows.forEach(([description, documentedPer], index) => {
    const sheetRow = layout.supplementaryStartRow + index;
    const source = sourceSupplementary.get(description.toLowerCase());
    const per = source ? supplementaryPerValue(source) : documentedPer;
    const sourceSoftware = source ? money(source.totalAmountCents) : 0;
    // The document requires the formula cells even when the input (sqft or
    // price) is not yet present. Never fill a missing input using an old
    // quotation's price; a boss can edit the input cell before export.
    // Area 1 explicitly starts Qty / per at zero.  A quantity supplied in the
    // uploaded quotation is retained, because it is a project value rather
    // than an old sample price.  Missing values stay zero for boss review.
    putRow(sheetRow, [index + 1, description, '', per, source?.quantity ?? 0, 0, 0, sourceSoftware, 0, 0], 'input');
    put(sheetRow, 9, 0, 'formula', `D${sheetRow}*$F$4*E${sheetRow}`);
    // Prompt 17 for Area 1 specifically fixes the first five standard
    // services to 0 After Price. This must occur before F/G mirror J.
    put(sheetRow, 10, 0, 'formula', usesFirstFiveSupplementaryZeroRule && index < 5 ? '0' : `I${sheetRow}*$I$3`);
    put(sheetRow, 6, 0, 'formula', `J${sheetRow}`);
    put(sheetRow, 7, 0, 'formula', `J${sheetRow}`);
  });
  const supplementaryEndRow = layout.supplementaryStartRow + supplementaryRows.length - 1;
  const supplementaryTotalRow = Math.max(layout.supplementaryTotalRow, supplementaryEndRow + 1);
  put(supplementaryTotalRow, 2, 'Total Supplementary:', 'total');
  [6, 7, 8, 9, 10].forEach((column) => put(supplementaryTotalRow, column, 0, 'formula', `SUM(${address(layout.supplementaryStartRow, column)}:${address(supplementaryEndRow, column)})`));
  const grandTotalRow = layout.supplementaryGrandTotalRow;
  put(grandTotalRow, 2, 'Total Whole House Price with Supplementary Items:', 'total');
  [6, 7, 8, 9, 10].forEach((column) => put(grandTotalRow, column, 0, 'formula', `${address(wholeTotalRow, column)}+${address(supplementaryTotalRow, column)}`));
  row = grandTotalRow + 2;

  rooms.forEach((room) => {
    put(row, 1, `${room.roomNameEnglish}${room.roomNameChinese && room.roomNameChinese !== room.roomNameEnglish ? ` // ${room.roomNameChinese}` : ''}`, 'title');
    row++;
    room.sections.forEach((section) => {
      put(row, 1, section.sectionName || 'Cabinet Table', 'header');
      row++;
      putRow(row, ['No.', 'Product PIC', 'Combi', 'Name', 'Model', 'WDH', 'Qty', 'Software Price', 'Before Price', 'After Price'], 'header');
      row++;
      const sectionStart = row;
      section.items.filter((item) => item.isVisibleToCustomer).forEach((item, index) => {
        // Match the documented H → I → J conversion sequence for every
        // numeric product row. Source prices remain in H; I and J are always
        // live formulas and can be overridden in the spreadsheet editor.
        putRow(row, [index + 1, item.imageUrl ? 'Photo preserved' : '', item.combi || '', item.nameEnglish || item.nameChinese, item.itemCode, item.dimensionText, item.quantity, money(item.supplierPriceCents), 0, 0], 'input');
        put(row, 9, 0, 'formula', `H${row}*$H$2`);
        put(row, 10, 0, 'formula', `I${row}*$I$2`);
        row++;
      });
      put(row, 2, `${section.sectionName || 'Cabinet'} Total Price:`, 'total');
      [8, 9, 10].forEach((column) => put(row, column, 0, 'formula', `SUM(${address(sectionStart, column)}:${address(row - 1, column)})`));
      row++;
    });
    put(row, 2, 'Total Price:', 'total');
    put(row, 10, money(room.subtotals.subtotalCents), 'formula', `SUM(J${Math.max(1, row - 1)}:J${Math.max(1, row - 1)})`);
    row += 2;
  });

  return [{ id: 'whole-house-details', name: 'Whole-House Details', rowCount: Math.max(row, 40), columnCount: 10, cells, mergedRanges: ['E1:J1', 'A5:J5'] }];
}

function supplementaryPerValue(item: SupplementaryItem) {
  return item.perValue ?? Number(String(item.notes || '').match(/[\d.]+$/)?.[0] || 0);
}
