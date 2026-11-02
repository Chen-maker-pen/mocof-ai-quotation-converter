import test from 'node:test';
import assert from 'node:assert/strict';
import {paginateQuotation} from '../server/pdfPagination.js';
test('page breaks keep merged item rows together and preserve existing section boundaries',()=>{
 const rows=Array.from({length:50},(_,i)=>`<row r="${i+1}" ht="40"><c r="A${i+1}"><v>${i}</v></c></row>`).join('');
 const xml=`<worksheet><cols><col min="1" max="10" width="12"/></cols><sheetData>${rows}</sheetData><mergeCells><mergeCell ref="B18:B28"/></mergeCells><rowBreaks count="1"><brk id="40"/></rowBreaks></worksheet>`;
 const out=paginateQuotation(xml),breaks=[...out.matchAll(/<brk\b[^>]*id="(\d+)"/g)].map(m=>+m[1]);
 assert.ok(breaks.length>1);assert.ok(breaks.includes(40));assert.ok(breaks.every(x=>x<18||x>=28));
 assert.equal(/<sheetData>(.*?)<\/sheetData>/.exec(out)?.[1],rows);
 assert.equal(paginateQuotation(out),out);
});
