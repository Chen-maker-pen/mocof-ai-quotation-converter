import { CustomerWorkbookSheet, Project, Quote, QuoteRoom, SupplementaryItem, WorkbookCell } from '../src/types.js';

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
    return {
      software: money(items.reduce((sum, item) => sum + item.supplierPriceCents * item.quantity, 0)),
      before: money(items.reduce((sum, item) => sum + item.totalAmountCents, 0)),
      after: money(items.reduce((sum, item) => sum + item.finalAmountCents, 0)),
    };
  };
  const worksheet = quote.worksheets.find((sheet) => sheet.code === 'whole_house') || quote.worksheets[0];
  const rooms = worksheet?.rooms || [];

  // Header cells are exactly where the documented recipe expects them.
  put(1, 5, 'MOCOF Whole House Quotation', 'title');
  putRow(2, ['', '', '', '', 'Customer Name', project.customerName, 'Currency', quote.exchangeRate.rate, 'Discount', 0.9]);
  putRow(3, ['', '', '', '', 'Address', project.projectAddress, 'Budget', '', '', '']);
  putRow(4, ['', '', '', '', 'Sqft', '', 'RM/sqft', '', '', '']);
  put(5, 1, 'Whole House Total', 'title');
  putRow(6, ['No.', 'Space', '', 'Wall Panel (m²)', 'Cabinet (m²)', 'RM49800', 'RM79800', 'Software Price', 'Before Price', 'After Price'], 'header');

  let row = 7;
  rooms.forEach((room, index) => {
    const amounts = roomAmounts(room);
    putRow(row, [index + 1, `${room.roomNameEnglish}${room.roomNameChinese && room.roomNameChinese !== room.roomNameEnglish ? ` // ${room.roomNameChinese}` : ''}`, '', '', '', amounts.after, amounts.after, amounts.software, amounts.before, amounts.after], 'input');
    row++;
  });
  // These are services/add-ons, not rooms. They are always after the detected room rows.
  ['Extra m²', 'Curve', 'Wall Panel', 'Aluminium Frame', 'Add-on finishing', 'Deduct Design Fee'].forEach((service, index) => {
    putRow(row, [rooms.length + index + 1, service, '', '', '', 0, 0, 0, 0, 0], 'input');
    row++;
  });
  const wholeTotalRow = row;
  put(row, 2, 'Total Price:', 'total');
  [6, 7, 8, 9, 10].forEach((column) => put(row, column, 0, 'formula', `SUM(${address(7, column)}:${address(row - 1, column)})`));
  row += 2;

  put(row, 1, 'Supplementary', 'title');
  row++;
  putRow(row, ['No.', 'Item', '', 'sqft / per', 'Qty / per', 'RM49800', 'RM79800', 'Software Price', 'Before Price', 'After Price'], 'header');
  row++;
  const supplementaryStart = row;
  quote.supplementaryItems.forEach((supp, index) => {
    const per = supplementaryPerValue(supp);
    const after = money(supp.totalAmountCents);
    const before = after > 0 ? Number((after / 0.8).toFixed(2)) : Number((per * 600 * supp.quantity).toFixed(2));
    putRow(row, [index + 1, supp.description, '', per, supp.quantity, index < 5 ? 0 : after, index < 5 ? 0 : after, after, before, after], 'input');
    row++;
  });
  const supplementaryTotalRow = row;
  put(row, 2, 'Total Supplementary:', 'total');
  [6, 7, 8, 9, 10].forEach((column) => put(row, column, 0, 'formula', `SUM(${address(supplementaryStart, column)}:${address(row - 1, column)})`));
  row++;
  put(row, 2, 'Total Whole House Price with Supplementary Items:', 'total');
  [6, 7, 8, 9, 10].forEach((column) => put(row, column, 0, 'formula', `${address(wholeTotalRow, column)}+${address(supplementaryTotalRow, column)}`));
  row += 2;

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
