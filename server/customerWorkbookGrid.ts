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
  const roomAmounts = (room: QuoteRoom) => {
    const items = room.sections.flatMap((section) => section.items).filter((item) => item.isVisibleToCustomer);
    const sourceSummary = room.sourceSummaryCents;
    const reconstructed = money(items.reduce((sum, item) => sum + item.totalAmountCents, 0));
    const authoritative = sourceSummary === undefined ? reconstructed : money(sourceSummary);
    return {
      // The recipe starts by copying the supplier's summary price from H to I
      // and J.  Therefore H must use the same authoritative supplier value,
      // not a separate reconstruction of detail rows (which may repeat merged
      // Combi prices and caused the previous incorrect totals).
      software: authoritative,
      before: authoritative,
      after: authoritative,
    };
  };
  const worksheet = quote.worksheets.find((sheet) => sheet.code === 'whole_house') || quote.worksheets[0];
  const rooms = worksheet?.rooms || [];
  const layout = getDocumentedRecipeLayout(quote.detectedArea || rooms.length);

  // Header cells are exactly where the documented recipe expects them.  This
  // is intentionally an A:J grid, not a separate dashboard table: every
  // prompt in the source document refers to these coordinates.
  put(1, 5, 'MOCOF Whole House Quotation', 'title');
  putRow(2, ['', '', '', '', 'Customer Name', project.customerName, 'Currency', quote.exchangeRate.rate, 'Discount', 0.9]);
  // I3 is the separately documented supplementary discount cell. It must not
  // be mistaken for the whole-house discount in I2.
  putRow(3, ['', '', '', '', 'Address', project.projectAddress, 'Budget', '', 'Supplementary discount', 0.8]);
  putRow(4, ['', '', '', '', 'Sqft', quote.sourceCustomerSqft || '', 'RM/sqft', '', '', '']);
  put(5, 1, 'Whole House Total', 'title');
  putRow(6, ['No.', 'Space', '', 'Wall Panel (m²)', 'Cabinet (m²)', 'RM49800', 'RM79800', 'Software Price', 'Before Price', 'After Price'], 'header');

  let row = layout.roomStartRow;
  rooms.forEach((room, index) => {
    const amounts = roomAmounts(room);
    // Never substitute a package price or a discount.  The source-derived
    // amounts remain visible and formula references document where the
    // package columns came from.  The Area recipe / boss prompt can change a
    // cell deliberately; it must not be guessed by the converter.
    putRow(row, [index + 1, `${room.roomNameEnglish}${room.roomNameChinese && room.roomNameChinese !== room.roomNameEnglish ? ` // ${room.roomNameChinese}` : ''}`, '', '', '', 0, 0, amounts.software, amounts.before, amounts.after], 'input');
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
    const sourceAfter = source ? money(source.totalAmountCents) : 0;
    // The document requires the formula cells even when the input (sqft or
    // price) is not yet present. Never fill a missing input using an old
    // quotation's price; a boss can edit the input cell before export.
    putRow(sheetRow, [index + 1, description, '', per, source?.quantity ?? 0, index < 5 ? 0 : sourceAfter, index < 5 ? 0 : sourceAfter, sourceAfter, sourceAfter, index < 5 ? 0 : sourceAfter], 'input');
    put(sheetRow, 9, sourceAfter, 'formula', `D${sheetRow}*$F$4*E${sheetRow}`);
    put(sheetRow, 10, index < 5 ? 0 : sourceAfter, 'formula', index < 5 ? '0' : `I${sheetRow}*$I$3`);
    put(sheetRow, 6, index < 5 ? 0 : sourceAfter, 'formula', `J${sheetRow}`);
    put(sheetRow, 7, index < 5 ? 0 : sourceAfter, 'formula', `J${sheetRow}`);
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
        putRow(row, [index + 1, item.imageUrl ? 'Photo preserved' : '', item.combi || '', item.nameEnglish || item.nameChinese, item.itemCode, item.dimensionText, item.quantity, money(item.supplierPriceCents), money(item.totalAmountCents), money(item.finalAmountCents)], 'input');
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
