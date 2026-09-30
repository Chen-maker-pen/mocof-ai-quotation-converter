import { test } from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import type { Quote } from '../src/types.js';
import { createPreservedTemplateWorkbook, readTemplateWorkbook } from '../server/templateWorkbook.js';
import { exportTemplate } from '../server/templateExport.js';
async function fixture() {
  const z=new JSZip();
  z.file('xl/workbook.xml','<workbook><sheets><sheet name="Inputs" r:id="r1"/><sheet name="Totals" r:id="r2"/></sheets></workbook>');
  z.file('xl/_rels/workbook.xml.rels','<Relationships><Relationship Id="r1" Type="x/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="r2" Type="x/worksheet" Target="worksheets/sheet2.xml"/></Relationships>');
  z.file('xl/worksheets/sheet1.xml','<worksheet><sheetData><row r="1"><c r="A1"><v>10</v></c></row></sheetData></worksheet>');
  z.file('xl/worksheets/sheet2.xml','<worksheet><sheetData><row r="1"><c r="A1"><f>Inputs!A1*2</f><v>20</v></c><c r="B1" t="str"><f>IF(ISNUMBER(Inputs!A1),"Ready","")</f><v>Ready</v></c></row></sheetData></worksheet>');
  z.file('xl/media/image.png',Buffer.from([1,2,3]));
  const raw=await z.generateAsync({type:'nodebuffer'});
  return { preservedTemplateWorkbook: await createPreservedTemplateWorkbook(raw,'source.xlsx'), workbookSheets: await readTemplateWorkbook(raw) } as Quote;
}
test('export recalculates cross-sheet totals and typed formula caches after input edit',async()=>{
  const quote=await fixture(); quote.workbookSheets![0].cells.A1.value=25;
  const raw=await exportTemplate(quote), sheets=await readTemplateWorkbook(raw);
  assert.equal(sheets[1].cells.A1.value,50);
  assert.equal(sheets[1].cells.B1.value,'Ready');
  const zip=await JSZip.loadAsync(raw);
  assert.deepEqual(await zip.file('xl/media/image.png')!.async('nodebuffer'),Buffer.from([1,2,3]));
});
test('export refuses unsupported dependent formula rather than preserving a stale total',async()=>{
  const quote=await fixture(); quote.workbookSheets![0].cells.A1.value=25;
  quote.workbookSheets![1].cells.A1.formula='UNSUPPORTED(Inputs!A1)';
  await assert.rejects(exportTemplate(quote),/calculate/);
});
