/**
 * MOCOF Customer Quotation XLSX & PDF Exporter
 * Generates official 6-sheet Excel workbook and formatted PDF documents.
 */

import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quote, ConversionProfile, Project } from '../src/types.js';

/**
 * Generate the customer workbook in the same single-sheet sequence as the
 * approved MOCOF quotation: Whole House Total → Supplementary → room tables.
 * It intentionally does not use a generic “ROOM:” product-card export.
 */
export async function generateCustomerXlsx(
  quote: Quote,
  project: Project,
  profile: ConversionProfile
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'MOCOF AI Integrated Quotation System';
  workbook.created = new Date();

  // Color Palette
  const darkGreenFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F382C' },
  } as ExcelJS.Fill;

  const headerFont = {
    name: 'Arial',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };

  const boldFont = { name: 'Arial', size: 10, bold: true };
  const normalFont = { name: 'Arial', size: 10 };

  const paleHeader = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6ECE9' } } as ExcelJS.Fill;
  const navyFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF08275B' } } as ExcelJS.Fill;
  const currencyFormat = '"RM" #,##0.00;[Red]-"RM" #,##0.00';
  const visibleItems = (room: Quote['worksheets'][number]['rooms'][number]) =>
    room.sections.flatMap((section) => section.items.filter((item) => item.isVisibleToCustomer));
  const customerWorksheet = quote.worksheets.find((sheet) => sheet.code === 'whole_house') || quote.worksheets[0];

  // One continuous customer-facing sheet — exactly the order in the approved PDF.
  const wsWholeHouse = workbook.addWorksheet('Whole-House Details');
  wsWholeHouse.views = [{ showGridLines: true }];
  wsWholeHouse.pageSetup = { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
  wsWholeHouse.columns = [
    { width: 7 }, { width: 24 }, { width: 17 }, { width: 24 }, { width: 16 },
    { width: 17 }, { width: 17 }, { width: 17 }, { width: 17 },
  ];

  wsWholeHouse.mergeCells('A1:D4');
  wsWholeHouse.getCell('A1').value = 'MOCOF\nInnovative | Versatile | Flexible';
  wsWholeHouse.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  wsWholeHouse.getCell('A1').font = { name: 'Arial', size: 22, bold: true };
  wsWholeHouse.mergeCells('E1:H1');
  wsWholeHouse.getCell('E1').value = 'Mocof';
  wsWholeHouse.getCell('E1').fill = navyFill;
  wsWholeHouse.getCell('E1').font = { ...headerFont, size: 16 };
  wsWholeHouse.getCell('E1').alignment = { horizontal: 'center' };
  wsWholeHouse.getCell('E2').value = 'Customer name'; wsWholeHouse.getCell('F2').value = project.customerName;
  wsWholeHouse.getCell('E3').value = 'Address'; wsWholeHouse.mergeCells('F3:H3'); wsWholeHouse.getCell('F3').value = project.projectAddress;
  wsWholeHouse.getCell('E4').value = 'Sqft'; wsWholeHouse.getCell('F4').value = '';
  wsWholeHouse.getCell('G2').value = 'Currency'; wsWholeHouse.getCell('H2').value = `1 CNY = ${quote.exchangeRate.rate} MYR`;
  wsWholeHouse.getCell('G3').value = 'Budget'; wsWholeHouse.getCell('H3').value = '';
  wsWholeHouse.getCell('G4').value = 'RM / Sqft'; wsWholeHouse.getCell('H4').value = '';
  for (let row = 2; row <= 4; row++) for (let col = 5; col <= 8; col++) {
    const cell = wsWholeHouse.getCell(row, col); cell.font = boldFont; cell.alignment = { vertical: 'middle', wrapText: true };
  }

  let currentRowIndex = 5;
  const sectionBand = (title: string) => {
    wsWholeHouse.mergeCells(`A${currentRowIndex}:I${currentRowIndex}`);
    const cell = wsWholeHouse.getCell(`A${currentRowIndex}`);
    cell.value = title; cell.fill = navyFill; cell.font = { ...headerFont, size: 12 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' }; currentRowIndex++;
  };
  const headerRow = (labels: string[]) => {
    const row = wsWholeHouse.getRow(currentRowIndex); row.values = labels;
    row.eachCell((cell) => { cell.fill = paleHeader; cell.font = boldFont; cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; });
    currentRowIndex++;
  };
  const borderRow = (row: ExcelJS.Row) => row.eachCell({ includeEmpty: true }, (cell) => {
    cell.border = { top: { style: 'thin', color: { argb: 'FF808080' } }, bottom: { style: 'thin', color: { argb: 'FF808080' } }, left: { style: 'thin', color: { argb: 'FF808080' } }, right: { style: 'thin', color: { argb: 'FF808080' } } };
    cell.alignment = { vertical: 'middle', wrapText: true };
  });

  // 1. Whole House Total always comes first.
  sectionBand('全屋汇总 / Whole House Total');
  headerRow(['No.', 'Space', 'Wall Panel (m²)', 'Cabinet (m²)', 'RM 49,800.00', 'RM 79,800.00', 'Software Price', 'Before Price', 'After Price']);
  const wholeStart = currentRowIndex;
  (customerWorksheet?.rooms || []).forEach((room, index) => {
    const items = visibleItems(room);
    const before = items.reduce((total, item) => total + item.totalAmountCents, 0) / 100;
    const after = items.reduce((total, item) => total + item.finalAmountCents, 0) / 100;
    const software = items.reduce((total, item) => total + item.supplierPriceCents * item.quantity, 0) / 100;
    const row = wsWholeHouse.addRow([index + 1, `${room.roomNameEnglish}${room.roomNameChinese && room.roomNameChinese !== room.roomNameEnglish ? ` // ${room.roomNameChinese}` : ''}`, '', '', '', '', software, before, after]);
    row.getCell(7).numFmt = currencyFormat; row.getCell(8).numFmt = currencyFormat; row.getCell(9).numFmt = currencyFormat; borderRow(row); currentRowIndex++;
  });
  ['Extra m2', 'Curve', 'Wall Panel', 'Aluminium Frame', 'Add-on finishing', 'Deduct Design Fee'].forEach((name, index) => {
    const row = wsWholeHouse.addRow([customerWorksheet?.rooms.length ? customerWorksheet.rooms.length + index + 1 : index + 1, name, '', '', 0, 0, 0, 0, 0]);
    for (let col = 5; col <= 9; col++) row.getCell(col).numFmt = currencyFormat;
    borderRow(row); currentRowIndex++;
  });
  const wholeTotalRow = currentRowIndex;
  const totalRow = wsWholeHouse.addRow(['', 'Total Price:', '', '', { formula: `SUM(E${wholeStart}:E${wholeTotalRow - 1})` }, { formula: `SUM(F${wholeStart}:F${wholeTotalRow - 1})` }, { formula: `SUM(G${wholeStart}:G${wholeTotalRow - 1})` }, { formula: `SUM(H${wholeStart}:H${wholeTotalRow - 1})` }, { formula: `SUM(I${wholeStart}:I${wholeTotalRow - 1})` }]);
  totalRow.font = { ...boldFont, color: { argb: 'FFFF0000' } }; for (let col = 5; col <= 9; col++) totalRow.getCell(col).numFmt = currencyFormat; borderRow(totalRow); currentRowIndex += 2;

  // 2. Supplementary always follows Whole House Total.
  sectionBand('Supplementary');
  headerRow(['No.', 'Item', 'sqft / per', 'Qty / per', 'RM 49,800.00', 'RM 79,800.00', 'Software Price', 'Before Price', 'After Price']);
  const supplementaryStart = currentRowIndex;
  quote.supplementaryItems.forEach((item, index) => {
    const perValue = item.perValue ?? Number(String(item.notes || '').match(/[\d.]+$/)?.[0] || 0);
    const afterPrice = item.totalAmountCents / 100;
    const beforePrice = afterPrice > 0 ? afterPrice / 0.8 : perValue * 600 * item.quantity;
    const packagePrice = index < 5 ? 0 : afterPrice;
    const row = wsWholeHouse.addRow([index + 1, item.description, perValue || '', item.quantity, packagePrice, packagePrice, afterPrice, beforePrice, afterPrice]);
    for (let col = 5; col <= 9; col++) row.getCell(col).numFmt = currencyFormat;
    borderRow(row); currentRowIndex++;
  });
  const supplementaryTotalRow = currentRowIndex;
  const suppTotal = wsWholeHouse.addRow(['', 'Total Supplementary:', '', '', { formula: `SUM(E${supplementaryStart}:E${supplementaryTotalRow - 1})` }, { formula: `SUM(F${supplementaryStart}:F${supplementaryTotalRow - 1})` }, { formula: `SUM(G${supplementaryStart}:G${supplementaryTotalRow - 1})` }, { formula: `SUM(H${supplementaryStart}:H${supplementaryTotalRow - 1})` }, { formula: `SUM(I${supplementaryStart}:I${supplementaryTotalRow - 1})` }]);
  suppTotal.font = boldFont; for (let col = 5; col <= 9; col++) suppTotal.getCell(col).numFmt = currencyFormat; borderRow(suppTotal); currentRowIndex++;
  const grand = wsWholeHouse.addRow(['', 'Total Whole House Price with Supplementary Items:', '', '', { formula: `E${wholeTotalRow}+E${supplementaryTotalRow}` }, { formula: `F${wholeTotalRow}+F${supplementaryTotalRow}` }, { formula: `G${wholeTotalRow}+G${supplementaryTotalRow}` }, { formula: `H${wholeTotalRow}+H${supplementaryTotalRow}` }, { formula: `I${wholeTotalRow}+I${supplementaryTotalRow}` }]);
  grand.font = { ...boldFont, color: { argb: 'FFFF0000' } }; for (let col = 5; col <= 9; col++) grand.getCell(col).numFmt = currencyFormat; borderRow(grand); currentRowIndex += 2;

  // 3. Only the detected rooms and their real source sections follow.
  (customerWorksheet?.rooms || []).forEach((room) => {
    sectionBand(`${room.roomNameEnglish}${room.roomNameChinese && room.roomNameChinese !== room.roomNameEnglish ? ` // ${room.roomNameChinese}` : ''}`);
    room.sections.filter((section) => section.items.some((item) => item.isVisibleToCustomer)).forEach((section) => {
      wsWholeHouse.mergeCells(`A${currentRowIndex}:I${currentRowIndex}`);
      const title = wsWholeHouse.getCell(`A${currentRowIndex}`);
      title.value = section.sectionName || 'Cabinet Table'; title.fill = paleHeader; title.font = boldFont; title.alignment = { horizontal: 'center' }; currentRowIndex++;
      headerRow(['No.', 'Product PIC', 'Combi', 'Name', 'Model', 'WDH', 'Qty', 'Before Price', 'After Price']);
      const sectionStart = currentRowIndex;
      section.items.filter((item) => item.isVisibleToCustomer).forEach((item, itemIndex) => {
        const row = wsWholeHouse.addRow([itemIndex + 1, '', item.combi || item.category.replace(/_/g, ' '), item.nameEnglish || item.nameChinese, item.itemCode, item.dimensionText, item.quantity, item.totalAmountCents ? item.totalAmountCents / 100 : '', item.finalAmountCents ? item.finalAmountCents / 100 : '']);
        row.getCell(8).numFmt = currencyFormat; row.getCell(9).numFmt = currencyFormat; row.height = item.imageUrl ? 36 : undefined; borderRow(row);
        if (item.imageUrl?.startsWith('data:image/')) {
          const imageId = workbook.addImage({ base64: item.imageUrl, extension: item.imageUrl.includes('image/png') ? 'png' : 'jpeg' });
          wsWholeHouse.addImage(imageId, { tl: { col: 1, row: currentRowIndex - 1 }, ext: { width: 38, height: 38 } });
        }
        currentRowIndex++;
      });
      const sectionTotalRow = wsWholeHouse.addRow(['', `${section.sectionName} Total Price:`, '', '', '', '', '', { formula: `SUM(H${sectionStart}:H${currentRowIndex - 1})` }, { formula: `SUM(I${sectionStart}:I${currentRowIndex - 1})` }]);
      sectionTotalRow.font = boldFont; sectionTotalRow.getCell(8).numFmt = currencyFormat; sectionTotalRow.getCell(9).numFmt = currencyFormat; borderRow(sectionTotalRow); currentRowIndex++;
    });
    const roomTotal = wsWholeHouse.addRow(['', 'Total Price:', '', '', '', '', '', '', room.subtotals.subtotalCents / 100]);
    roomTotal.font = { ...boldFont, color: { argb: 'FFFF0000' } }; roomTotal.getCell(9).numFmt = currencyFormat; borderRow(roomTotal); currentRowIndex += 2;
  });

  wsWholeHouse.mergeCells(`A${currentRowIndex}:I${currentRowIndex + 2}`);
  const terms = wsWholeHouse.getCell(`A${currentRowIndex}`);
  terms.value = `Remark:\n${profile.termsAndConditions.map((term, index) => `${index + 1}. ${term}`).join('\n')}`;
  terms.alignment = { wrapText: true, vertical: 'top' }; terms.font = { name: 'Arial', size: 9 };
  currentRowIndex += 4;
  wsWholeHouse.getCell(`D${currentRowIndex}`).value = 'Handle by:';
  wsWholeHouse.getCell(`F${currentRowIndex}`).value = 'Customer Signature:';
  wsWholeHouse.getCell(`F${currentRowIndex + 1}`).value = 'Date:';
  wsWholeHouse.pageSetup.printArea = `A1:I${currentRowIndex + 1}`;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Generate Customer PDF Document
 */
export async function generateCustomerPdf(
  quote: Quote,
  project: Project,
  profile: ConversionProfile
): Promise<Buffer> {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  // Header Branding
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 56, 44); // #0f382c Dark Green
  doc.text(profile.companyName, 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(profile.companyAddress, 14, 23);
  doc.text(`Reg No: ${profile.companyRegNo} | Tel: ${profile.companyPhone} | Email: ${profile.companyEmail}`, 14, 27);

  // Customer Block
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 31, 196, 31);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 56, 44);
  doc.text('CUSTOMER QUOTATION', 14, 37);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text(`Customer: ${project.customerName}`, 14, 42);
  doc.text(`Site Address: ${project.projectAddress}`, 14, 46);
  doc.text(`Phone: ${project.customerPhone}`, 14, 50);

  doc.text(`Quote No: ${project.quotationNumber}`, 130, 37);
  doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString('en-GB')}`, 130, 42);
  doc.text(`Currency: ${quote.currency} (Rate: ${quote.exchangeRate.rate})`, 130, 46);
  doc.text(`Status: ${quote.status}`, 130, 50);

  let currentY = 56;
  const customerWorksheet = quote.worksheets.find((sheet) => sheet.code === 'whole_house') || quote.worksheets[0];
  const visibleItems = (room: Quote['worksheets'][number]['rooms'][number]) => room.sections.flatMap((section) => section.items.filter((item) => item.isVisibleToCustomer));
  const advance = () => { currentY = (doc as any).lastAutoTable.finalY + 8; if (currentY > 240) { doc.addPage(); currentY = 18; } };
  const tableTitle = (title: string) => { doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(15, 56, 44); doc.text(title, 14, currentY); currentY += 4; };

  // 1. Whole House Total is always the first table.
  // jsPDF's built-in fonts cannot reliably render Chinese.  The PDF is the
  // customer-ready English version; the XLSX retains bilingual room labels.
  tableTitle('WHOLE HOUSE TOTAL');
  const wholeRows = (customerWorksheet?.rooms || []).map((room, index) => {
    const items = visibleItems(room);
    return [String(index + 1), room.roomNameEnglish, (items.reduce((sum, item) => sum + item.totalAmountCents, 0) / 100).toFixed(2), (items.reduce((sum, item) => sum + item.finalAmountCents, 0) / 100).toFixed(2)];
  });
  autoTable(doc, { startY: currentY, head: [['No.', 'Space', 'Before Price (RM)', 'After Price (RM)']], body: wholeRows, headStyles: { fillColor: [8, 39, 91], textColor: [255, 255, 255] }, styles: { fontSize: 8, cellPadding: 2 }, margin: { left: 14, right: 14 } });
  advance();

  // 2. Supplementary always immediately follows Whole House Total.
  tableTitle('SUPPLEMENTARY');
  const suppRows = quote.supplementaryItems.map((supp, index) => [String(index + 1), supp.description, String(supp.perValue ?? 0), supp.quantity.toString(), (supp.unitPriceCents / 100).toFixed(2), (supp.totalAmountCents / 100).toFixed(2)]);
  autoTable(doc, { startY: currentY, head: [['No.', 'Item', 'sqft / per', 'Qty / per', 'After Price (RM)', 'Total (RM)']], body: suppRows, headStyles: { fillColor: [8, 39, 91], textColor: [255, 255, 255] }, styles: { fontSize: 8, cellPadding: 2 }, margin: { left: 14, right: 14 } });
  advance();

  // 3. The detailed Cabinet / Accessories / Wall Panel tables follow by room.
  (customerWorksheet?.rooms || []).forEach((room) => {
    tableTitle(room.roomNameEnglish);
    room.sections.filter((section) => section.items.some((item) => item.isVisibleToCustomer)).forEach((section) => {
      const details = section.items.filter((item) => item.isVisibleToCustomer).map((item, index) => [String(index + 1), item.nameEnglish || item.nameChinese, item.itemCode, item.dimensionText, String(item.quantity), item.totalAmountCents ? (item.totalAmountCents / 100).toFixed(2) : '', item.finalAmountCents ? (item.finalAmountCents / 100).toFixed(2) : '']);
      autoTable(doc, { startY: currentY, head: [[section.sectionName || 'Cabinet Table', '', '', '', '', '', ''], ['No.', 'Name', 'Model', 'WDH', 'Qty', 'Before Price', 'After Price']], body: details, headStyles: { fillColor: [230, 236, 233], textColor: [15, 56, 44], fontStyle: 'bold' }, styles: { fontSize: 7, cellPadding: 1.5 }, margin: { left: 14, right: 14 } });
      advance();
    });
  });

  // Terms & Conditions and Signature Area
  currentY = (doc as any).lastAutoTable.finalY + 10;
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 56, 44);
  doc.text('TERMS & CONDITIONS', 14, currentY);
  currentY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);

  profile.termsAndConditions.forEach((term, idx) => {
    doc.text(`${idx + 1}. ${term}`, 14, currentY);
    currentY += 4;
  });

  currentY += 12;
  if (currentY < 270) {
    doc.setFont('helvetica', 'bold');
    doc.text('Prepared By: ___________________', 14, currentY);
    doc.text('Client Acceptance: ___________________', 120, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text('MOCOF Authorised Signature', 14, currentY + 4);
    doc.text('Date & Chop', 120, currentY + 4);
  }

  const pdfArrayBuffer = doc.output('arraybuffer');
  return Buffer.from(pdfArrayBuffer);
}
