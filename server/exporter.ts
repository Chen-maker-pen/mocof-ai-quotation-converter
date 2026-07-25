/**
 * MOCOF Customer Quotation XLSX & PDF Exporter
 * Generates official 6-sheet Excel workbook and formatted PDF documents.
 */

import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quote, ConversionProfile, Project } from '../src/types.js';

/**
 * Generate 6-Sheet Customer XLSX Workbook using saved Quote state
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

  // 1. Sheet 1: Whole-House Details
  const wsWholeHouse = workbook.addWorksheet('Whole-House Details');
  wsWholeHouse.views = [{ showGridLines: true }];

  // Header Branding Block
  wsWholeHouse.mergeCells('A1:H1');
  const titleCell = wsWholeHouse.getCell('A1');
  titleCell.value = `${profile.companyName} - CUSTOMER QUOTATION`;
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF0F382C' } };

  wsWholeHouse.getCell('A2').value = `Address: ${profile.companyAddress}`;
  wsWholeHouse.getCell('A3').value = `Reg No: ${profile.companyRegNo} | Tel: ${profile.companyPhone} | Email: ${profile.companyEmail}`;

  wsWholeHouse.getCell('F2').value = `Quotation No: ${project.quotationNumber}`;
  wsWholeHouse.getCell('F3').value = `Date: ${new Date(quote.createdAt).toLocaleDateString('en-GB')}`;
  wsWholeHouse.getCell('F4').value = `Customer: ${project.customerName}`;
  wsWholeHouse.getCell('F5').value = `Site Address: ${project.projectAddress}`;
  wsWholeHouse.getCell('F6').value = `Currency: ${quote.currency} (Rate: ${quote.exchangeRate.rate} | Locked: ${quote.exchangeRate.isLocked ? 'Yes' : 'No'})`;

  wsWholeHouse.addRow([]);

  // Table Headers
  const tableHeaders = ['Photo', 'English Item Description', 'SKU', 'Dimensions', 'Qty', 'Unit Price', 'Discount', 'Amount'];

  let currentRowIndex = 8;

  // Sheet 1 is already the complete customer-facing overview.  Including the
  // five category worksheets here duplicated every room and inflated totals.
  const wholeHouseWorksheet = quote.worksheets.find((ws) => ws.code === 'whole_house') || quote.worksheets[0];
  ;[wholeHouseWorksheet].filter(Boolean).forEach((ws) => {
    ws.rooms.forEach((room) => {
      // Room Header
      wsWholeHouse.mergeCells(`A${currentRowIndex}:H${currentRowIndex}`);
      const rmCell = wsWholeHouse.getCell(`A${currentRowIndex}`);
      rmCell.value = `ROOM: ${room.roomNameEnglish.toUpperCase()}`;
      rmCell.fill = darkGreenFill;
      rmCell.font = headerFont;
      currentRowIndex++;

      // Table Header Row
      const headRow = wsWholeHouse.addRow(tableHeaders);
      headRow.font = boldFont;
      headRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6ECE9' } };
      });
      currentRowIndex++;

      // Room Items
      room.sections.forEach((sec) => {
        sec.items.forEach((item) => {
          if (!item.isVisibleToCustomer) return;

          const row = wsWholeHouse.addRow([
            '',
            item.nameEnglish,
            item.itemCode,
            item.dimensionText,
            item.quantity,
            (item.unitPriceCents / 100).toFixed(2),
            (item.discountCents / 100).toFixed(2),
            (item.finalAmountCents / 100).toFixed(2),
          ]);
          row.font = normalFont;
          // Preserve the original embedded product image in the generated XLSX.
          if (item.imageUrl?.startsWith('data:image/')) {
            const imageId = workbook.addImage({ base64: item.imageUrl, extension: item.imageUrl.includes('image/png') ? 'png' : 'jpeg' });
            wsWholeHouse.addImage(imageId, { tl: { col: 0, row: currentRowIndex - 1 }, ext: { width: 42, height: 42 } });
            row.height = 36;
          }
          currentRowIndex++;
        });
      });

      // Room Subtotal
      const subRow = wsWholeHouse.addRow(['', 'Subtotal for ' + room.roomNameEnglish, '', '', '', '', '', (room.subtotals.subtotalCents / 100).toFixed(2)]);
      subRow.font = boldFont;
      currentRowIndex++;
      currentRowIndex++;
    });
  });

  // Mandatory Supplementary Items Section
  wsWholeHouse.mergeCells(`A${currentRowIndex}:H${currentRowIndex}`);
  const suppHeader = wsWholeHouse.getCell(`A${currentRowIndex}`);
  suppHeader.value = 'MANDATORY SUPPLEMENTARY ITEMS & SERVICES';
  suppHeader.fill = darkGreenFill;
  suppHeader.font = headerFont;
  currentRowIndex++;

  if (quote.supplementaryItems.length === 0) {
    wsWholeHouse.addRow(['No supplementary items.']);
    currentRowIndex++;
  } else {
    quote.supplementaryItems.forEach((supp) => {
      wsWholeHouse.addRow(['', supp.description, '-', '-', supp.quantity, (supp.unitPriceCents / 100).toFixed(2), '0.00', (supp.totalAmountCents / 100).toFixed(2)]);
      currentRowIndex++;
    });
  }

  currentRowIndex++;

  // Mandatory Whole House Total Summary Table
  wsWholeHouse.mergeCells(`A${currentRowIndex}:H${currentRowIndex}`);
  const summaryHeader = wsWholeHouse.getCell(`A${currentRowIndex}`);
  summaryHeader.value = 'WHOLE HOUSE TOTAL SUMMARY';
  summaryHeader.fill = darkGreenFill;
  summaryHeader.font = headerFont;
  currentRowIndex++;

  const totals = quote.wholeHouseTotals;
  const totalRows = [
    ['1. Cabinet Products', (totals.cabinetProductsCents / 100).toFixed(2)],
    ['2. LF Products', (totals.lfProductsCents / 100).toFixed(2)],
    ['3. Custom Door Products', (totals.customDoorProductsCents / 100).toFixed(2)],
    ['4. Quick Installation / Wall Panel Products', (totals.wallPanelProductsCents / 100).toFixed(2)],
    ['5. Kitchen and Vanity Products', (totals.kitchenVanityProductsCents / 100).toFixed(2)],
    ['6. Supplementary Items', (totals.supplementaryItemsCents / 100).toFixed(2)],
    ['SUBTOTAL', (totals.subtotalCents / 100).toFixed(2)],
    [`Discount (${profile.defaultDiscountPercent}%)`, `- ${(totals.discountCents / 100).toFixed(2)}`],
    [`Tax / SST (${totals.taxPercent}%)`, (totals.taxCents / 100).toFixed(2)],
    ['GRAND TOTAL (' + quote.currency + ')', (totals.grandTotalCents / 100).toFixed(2)],
  ];

  totalRows.forEach(([lbl, val]) => {
    const r = wsWholeHouse.addRow(['', lbl, '', '', '', '', '', val]);
    r.font = lbl.startsWith('GRAND') || lbl === 'SUBTOTAL' ? boldFont : normalFont;
  });

  // Add remaining 5 sheets
  const remainingSheetNames = [
    '23 quotation details',
    '25 Kitchen Cabinet Details',
    '25 Custom Door Details',
    'Kitchen and Vanity Details',
    'LF Details',
  ];

  remainingSheetNames.forEach((sheetName, index) => {
    const sheet = workbook.addWorksheet(sheetName);
    sheet.getCell('A1').value = `${profile.companyName} - ${sheetName.toUpperCase()}`;
    sheet.getCell('A1').font = boldFont;

    sheet.addRow(['Project:', project.name]);
    sheet.addRow(['Quotation #:', project.quotationNumber]);
    sheet.addRow([]);
    sheet.addRow(['Item Code', 'Product Name (English)', 'Dimensions', 'Qty', 'Unit Price', 'Total']);

    const sourceWorksheet = quote.worksheets.find((ws) => ws.name === sheetName || ws.worksheetIndex === index + 2);
    const items = sourceWorksheet?.rooms.flatMap((room) => room.sections.flatMap((section) => section.items.filter((item) => item.isVisibleToCustomer))) || [];
    if (items.length === 0) {
      sheet.addRow(['No items from the supplier quotation belong to this category.']);
    } else {
      items.forEach((item) => {
        sheet.addRow([item.itemCode, item.nameEnglish, item.dimensionText, item.quantity, item.unitPriceCents / 100, item.finalAmountCents / 100]);
      });
    }
  });

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

  // Build Table Data for Whole-House Details
  const tableRows: any[][] = [];

  quote.worksheets.forEach((ws) => {
    ws.rooms.forEach((room) => {
      tableRows.push([
        { content: `ROOM: ${room.roomNameEnglish.toUpperCase()}`, colSpan: 6, styles: { fillColor: [15, 56, 44], textColor: [255, 255, 255], fontStyle: 'bold' } },
      ]);

      room.sections.forEach((sec) => {
        sec.items.forEach((item) => {
          if (!item.isVisibleToCustomer) return;
          tableRows.push([
            item.nameEnglish,
            item.itemCode,
            item.dimensionText,
            item.quantity.toString(),
            (item.unitPriceCents / 100).toFixed(2),
            (item.finalAmountCents / 100).toFixed(2),
          ]);
        });
      });
    });
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Item Description', 'SKU', 'Dimensions', 'Qty', 'Unit Price', 'Amount']],
    body: tableRows,
    headStyles: { fillColor: [230, 236, 233], textColor: [15, 56, 44], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });

  // Supplementary Items
  currentY = (doc as any).lastAutoTable.finalY + 8;
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 56, 44);
  doc.text('MANDATORY SUPPLEMENTARY ITEMS & SERVICES', 14, currentY);
  currentY += 4;

  const suppRows: any[][] = [];
  if (quote.supplementaryItems.length === 0) {
    suppRows.push(['No supplementary items.', '-', '-', '-', '0.00']);
  } else {
    quote.supplementaryItems.forEach((supp) => {
      suppRows.push([supp.description, supp.quantity.toString(), 'Lot', (supp.unitPriceCents / 100).toFixed(2), (supp.totalAmountCents / 100).toFixed(2)]);
    });
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Description', 'Qty', 'Unit', 'Unit Price', 'Total']],
    body: suppRows,
    headStyles: { fillColor: [230, 236, 233], textColor: [15, 56, 44] },
    styles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  // Whole House Total Summary
  currentY = (doc as any).lastAutoTable.finalY + 8;
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  const totals = quote.wholeHouseTotals;
  const totalsBody = [
    ['Cabinet Products', (totals.cabinetProductsCents / 100).toFixed(2)],
    ['LF Products', (totals.lfProductsCents / 100).toFixed(2)],
    ['Custom Door Products', (totals.customDoorProductsCents / 100).toFixed(2)],
    ['Quick Installation / Wall Panel Products', (totals.wallPanelProductsCents / 100).toFixed(2)],
    ['Kitchen and Vanity Products', (totals.kitchenVanityProductsCents / 100).toFixed(2)],
    ['Supplementary Items', (totals.supplementaryItemsCents / 100).toFixed(2)],
    ['Subtotal', (totals.subtotalCents / 100).toFixed(2)],
    [`Discount (${profile.defaultDiscountPercent}%)`, `- ${(totals.discountCents / 100).toFixed(2)}`],
    [`Tax / SST (${totals.taxPercent}%)`, (totals.taxCents / 100).toFixed(2)],
    [`GRAND TOTAL (${quote.currency})`, (totals.grandTotalCents / 100).toFixed(2)],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Category Summary', 'Amount (' + quote.currency + ')']],
    body: totalsBody,
    headStyles: { fillColor: [15, 56, 44], textColor: [255, 255, 255] },
    styles: { fontSize: 8 },
    margin: { left: 80, right: 14 },
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
