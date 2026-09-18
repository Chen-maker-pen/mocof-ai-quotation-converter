import { CustomerWorkbookSheet, Project, Quote, QuoteRoom, SupplementaryItem, WorkbookCell } from '../src/types.js';
import { DOCUMENTED_SUPPLEMENTARY_ROWS, getDocumentedRecipeLayout, WHOLE_HOUSE_SERVICE_ROWS } from './documentedRecipeExecutor.js';

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
  // Keep the inputs at the exact addresses used by the Area documents:
  // H2 = currency/conversion, I2 = whole-house discount and I3 =
  // supplementary discount. Labels must never occupy I2/I3, otherwise the
  // documented I/J price formulas multiply by text instead of a number.
  // Discount inputs are deliberately visible and editable. The current
  // Area 3 boss instruction identifies 8E-01 as 0.8 (80%).
  // Every After Price (J) formula reads this one cell.
  putRow(2, ['', '', '', '', 'Customer Name', project.customerName, 'Currency', quote.exchangeRate.rate, 0.8, quote.currency]);
  putRow(3, ['', '', '', '', 'Address', project.projectAddress, 'Budget', quote.customerBudget ?? '', 0.8, '']);
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
  WHOLE_HOUSE_SERVICE_ROWS.forEach((service, index) => {
    const serviceRow = layout.extrasStartRow + index;
    putRow(serviceRow, [layout.roomCount + index + 1, service, '', '', '', 0, 0, 0, 0, 0], 'input');
  });
  // Area 3 prompts: package amounts calculate only from actual m² totals.
  // With no m² in the uploaded source these correctly stay zero rather than
  // borrowing a number from a sample quotation.
  if (layout.area === 3 || layout.area === 4) {
    const extraRow = layout.extrasStartRow;
    const wallPanelRow = layout.extrasStartRow + 2;
    put(extraRow, 6, 0, 'formula', `IF(E${layout.wholeHouseTotalRow}>20,(E${layout.wholeHouseTotalRow}-20)*1999,0)`);
    put(extraRow, 7, 0, 'formula', `IF(E${layout.wholeHouseTotalRow}>24,(E${layout.wholeHouseTotalRow}-24)*1999,0)`);
    put(wallPanelRow, 7, 0, 'formula', `IF(D${layout.wholeHouseTotalRow}>6,(D${layout.wholeHouseTotalRow}-6)*650,0)`);
    // The document says Project quotations do not receive this deduction.
    // When sqft exists, retain the documented threshold formula so the boss
    // can visibly verify or override it in the sheet.
    const deduction = `IF(F4=0,0,IF(F4<=1500,-1500,IF(F4<=2000,-2000,IF(F4<=2500,-3500,IF(F4<=3000,-6000,0)))))`;
    // The deduction is represented as a visible prompt-trace review item;
    // it is not written into an unrelated standard service row.
  }
  const wholeTotalRow = layout.wholeHouseTotalRow;
  put(wholeTotalRow, 2, 'Total Price:', 'total');
  [4, 5, 6, 7, 8, 9, 10].forEach((column) => put(wholeTotalRow, column, 0, 'formula', `SUM(${address(layout.roomStartRow, column)}:${address(wholeTotalRow - 1, column)})`));

  put(layout.supplementaryTitleRow, 1, 'Supplementary', 'title');
  putRow(layout.supplementaryHeaderRow, ['No.', 'Item', '', 'sqft / per', 'Qty / per', 'RM49800', 'RM79800', 'Software Price', 'Before Price', 'After Price'], 'header');
  const sourceSupplementary = new Map(quote.supplementaryItems.map((item) => [item.description.trim().toLowerCase(), item]));
  // The selected Area document owns this fixed range (Area 3: A20:J34).
  // Never append unmatched source services inside it: that moved the
  // documented total rows and made subsequent prompt addresses incorrect.
  const supplementaryRows: ReadonlyArray<readonly [string, number]> = DOCUMENTED_SUPPLEMENTARY_ROWS;
  supplementaryRows.forEach(([description, documentedPer], index) => {
    const sheetRow = layout.supplementaryStartRow + index;
    const source = sourceSupplementary.get(description.toLowerCase());
    // Area 3 uses the boss-approved fixed rates, not a similarly named raw
    // supplier row. Other Areas retain the source-derived value when present.
    const per = layout.area === 3 ? documentedPer : (source ? supplementaryPerValue(source) : documentedPer);
    const sourceSoftware = layout.area === 3 ? 0 : (source ? money(source.totalAmountCents) : 0);
    // The document requires the formula cells even when the input (sqft or
    // price) is not yet present. Never fill a missing input using an old
    // quotation's price; a boss can edit the input cell before export.
    // Area 3 supplementary rows are fixed service rates. They calculate from
    // sqft/per × customer sqft, then apply the 8E-01 (0.8) factor in I3.
    putRow(sheetRow, [index + 1, description, '', per, layout.area === 3 ? 1 : (source?.quantity ?? 0), 0, 0, sourceSoftware, 0, 0], 'input');
    put(sheetRow, 9, 0, 'formula', layout.area === 3 ? `D${sheetRow}*$F$4` : `D${sheetRow}*$F$4*E${sheetRow}`);
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
  // Prompt 19: final customer unit price = final quotation total / sqft.
  // Keep it blank when source sqft is unavailable, rather than divide by 0.
  if (Number(quote.sourceCustomerSqft) > 0) put(4, 8, 0, 'formula', `J${grandTotalRow}/F4`);
  row = grandTotalRow + 2;

  rooms.forEach((room) => {
    put(row, 1, `${room.roomNameEnglish}${room.roomNameChinese && room.roomNameChinese !== room.roomNameEnglish ? ` // ${room.roomNameChinese}` : ''}`, 'title');
    row++;
    const sectionTotalRows: number[] = [];
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
      sectionTotalRows.push(row);
      row++;
    });
    put(row, 2, 'Total Price:', 'total');
    // Sum only the section-total cells. Summing the complete detail range
    // would double count every item and its section total.
    [8, 9, 10].forEach((column) => {
      const references = sectionTotalRows.map((totalRow) => `${address(totalRow, column)}`).join('+') || '0';
      put(row, column, 0, 'formula', references);
    });
    row += 2;
  });

  return [{ id: 'whole-house-details', name: 'Whole-House Details', rowCount: Math.max(row, 40), columnCount: 10, cells, mergedRanges: ['E1:J1', 'A5:J5'] }];
}

function supplementaryPerValue(item: SupplementaryItem) {
  return item.perValue ?? Number(String(item.notes || '').match(/[\d.]+$/)?.[0] || 0);
}
