import {test} from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import {normalizeArea2} from '../server/area2Source.js';
import {area2Structure} from '../server/area2Structure.js';
import {readTemplateWorkbook} from '../server/templateWorkbook.js';

test('Area 2 accepts different customers, duplicate room names and arbitrary detail lengths without a hash allowlist',async()=>{
 for(const end of [30,150]){
  const w=new ExcelJS.Workbook(),s=w.addWorksheet('Customer quotation');
  for(const [a,v]of Object.entries({F2:'Any customer',B7:'Bedroom',B8:'Bedroom',A9:'合计:',A11:'Bedroom',A20:'合计:',H20:123,A22:'Bedroom',['A'+end]:'合计:',['H'+end]:456,['A'+(end+2)]:'备注:'}))s.getCell(a).value=v;
  const raw=Buffer.from(await w.xlsx.writeBuffer());assert.deepEqual(await normalizeArea2(raw),raw);
  const layout=area2Structure((await readTemplateWorkbook(raw))[0]);
  assert.deepEqual(layout.rooms.map(r=>r.end),[20,end]);
 }
});
test('Area 2 rejects mismatched summary/detail instead of guessing or dropping a room',async()=>{
 const w=new ExcelJS.Workbook(),s=w.addWorksheet('Source');
 for(const [a,v]of Object.entries({B7:'Room A',B8:'Room B',A9:'合计:',A11:'Room A',A20:'合计:',H20:123,A22:'Wrong room',A30:'合计:',H30:456,A32:'备注:'}))s.getCell(a).value=v;
 await assert.rejects(normalizeArea2(Buffer.from(await w.xlsx.writeBuffer())),/Room B/);
});
