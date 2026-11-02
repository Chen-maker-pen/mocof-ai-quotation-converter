import {test} from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {selectCustomerPrintSheet} from '../server/exporter.js';
test('PDF print copy exposes quotation only, retaining source sheets and media',async()=>{
 const z=new JSZip();const original='<workbook><bookViews><workbookView activeTab="2"/></bookViews><sheets><sheet name="Quotation" sheetId="1" state="hidden" r:id="r1"/><sheet name="Source" sheetId="2" r:id="r2"/><sheet name="Internal" sheetId="3" state="veryHidden" r:id="r3"/></sheets></workbook>';
 z.file('xl/workbook.xml',original);z.file('xl/worksheets/sheet2.xml','original supplier data');z.file('xl/media/p.png',Buffer.from([1,2,3]));
 const raw=await z.generateAsync({type:'nodebuffer'}),copy=await JSZip.loadAsync(raw);
 await selectCustomerPrintSheet(copy);const text=await copy.file('xl/workbook.xml')!.async('string');
 const tags=[...text.matchAll(/<sheet\b[^>]*>/g)].map(m=>m[0]);assert.equal(tags.length,3);assert.ok(!tags[0].includes('state='));assert.ok(tags.slice(1).every(t=>t.includes('state="hidden"')));assert.ok(text.includes('activeTab="0"'));
 assert.equal(await copy.file('xl/worksheets/sheet2.xml')!.async('string'),'original supplier data');assert.equal(await z.file('xl/workbook.xml')!.async('string'),original);
 await selectCustomerPrintSheet(copy);assert.equal(await copy.file('xl/workbook.xml')!.async('string'),text);
});
