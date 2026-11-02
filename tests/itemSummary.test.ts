import test from 'node:test';import assert from 'node:assert/strict';import ExcelJS from 'exceljs';
import {addItemSummary} from '../server/itemSummary.js';import {readTemplateWorkbook} from '../server/templateWorkbook.js';
test('After Price summary reconciles disjoint categories and retains unknown amounts explicitly',async()=>{
 const w=new ExcelJS.Workbook(),s=w.addWorksheet('Quote');s.mergeCells('A1:I1');
 for(const [a,v]of Object.entries({A5:'Whole House Total',A15:'Total Price:',J34:1000,A42:'Cabinet Total Price:',J42:400,A45:'Accessories Total Price:',J45:100,B19:'Electrical',J19:200,B20:'Curtain',J20:50,A50:'Remark:'}))s.getCell(a).value=v;
 s.getCell('J51').value={formula:'J34',result:1000};
 const raw=Buffer.from(await w.xlsx.writeBuffer());const out=await addItemSummary(raw,2),sheet=(await readTemplateWorkbook(out))[0];
 assert.equal(sheet.cells.A50.value,'Summary of items');assert.equal(sheet.cells.J51.value,400);assert.equal(sheet.cells.J55.value,200);assert.equal(sheet.cells.J56.value,50);
 assert.equal(sheet.cells.A57.value,'Other / unclassified items');assert.equal(sheet.cells.J57.value,250);assert.equal(sheet.cells.J58.value,1000);
 assert.equal(sheet.cells.A60.value,'Remark:');assert.equal(sheet.cells.J61.formula,'J34');
 assert.deepEqual(await addItemSummary(out,2),out);
});
