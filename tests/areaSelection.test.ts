import {test} from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import {validateAreaSelection} from '../server/areaSelection.js';
test('two-room source tells user to select Area2 before queueing another recipe',async()=>{
 const w=new ExcelJS.Workbook(),s=w.addWorksheet('Source');
 for(const [a,v]of Object.entries({B7:'Room A',B8:'Room B',A9:'合计:',A11:'Room A',A20:'合计:',H20:123,A22:'Room B',A30:'合计:',H30:456,A32:'备注:'}))s.getCell(a).value=v;
 const raw=Buffer.from(await w.xlsx.writeBuffer());
 await assert.rejects(validateAreaSelection(raw,3),/Select Area 2/);
 await validateAreaSelection(raw,2);
 s.getCell('A9').value='third room';await validateAreaSelection(Buffer.from(await w.xlsx.writeBuffer()),3);
});
