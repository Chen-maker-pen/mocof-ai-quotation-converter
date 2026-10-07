import {test} from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import {applyCnyToMyr} from '../server/currencyWorkbook.js';
import {readTemplateWorkbook} from '../server/templateWorkbook.js';
import {evaluateWorkbookValue} from '../src/lib/formulaEvaluator.js';
for(const area of [2,3])test(`Area ${area}: CNY source converts once, discount follows, MYR charges stay unchanged`,async()=>{
 const w=new ExcelJS.Workbook(),s=w.addWorksheet('Summary');
 const total=area===2?15:16,sub=area===2?33:34,grand=sub+1,detail=area===2?39:40;
 const formula=(a:string,f:string)=>s.getCell(a).value={formula:f,result:0};
 s.getCell('H7').value=1000;s.getCell('H8').value=2032;if(area===3)s.getCell('H9').value=500;
 s.getCell('I2').value=.9;s.getCell('F4').value=600;s.getCell('H'+detail).value=2032;
 formula('I'+detail,'H'+detail);formula('J'+detail,`I${detail}*$I$2`);
 for(let r=7;r<=(area===2?8:9);r++){formula('I'+r,'H'+r);formula('J'+r,`I${r}*$I$2`);}
 for(const c of ['F','G'])s.getCell(c+total).value=c==='F'?49800:79800;
 for(const c of ['F','G','I','J']){s.getCell(c+sub).value=100;formula(c+grand,`${c}${total}+${c}${sub}`);}
 formula('H4',`J${grand}/F4`);
 const raw=Buffer.from(await w.xlsx.writeBuffer());
 const snapshot={sourceCurrency:'CNY' as const,targetCurrency:'MYR' as const,rate:.6,source:'https://www.exchangerate-api.com',rateDate:'2026-10-07T00:00:00Z',fetchedAt:'2026-10-07T01:00:00Z',isLocked:true};
 const out=await applyCnyToMyr(raw,area,snapshot),sheets=await readTemplateWorkbook(out),sheet=sheets[0];
 assert.equal(sheet.cells.H8.value,2032);assert.equal(sheet.cells.I8.value,1219.2);assert.equal(sheet.cells.J8.value,1097.28);
 assert.equal(sheet.cells['F'+grand].value,49900);assert.equal(sheet.cells['I'+detail].value,1219.2);
 const again=(await readTemplateWorkbook(await applyCnyToMyr(out,area,snapshot)))[0];assert.equal(again.cells.I8.value,1219.2);
 sheet.cells.I2.value=.8;assert.ok(Math.abs(Number(evaluateWorkbookValue(sheet,'J8',sheets))-975.36)<1e-8);
 await assert.rejects(applyCnyToMyr(raw,area,{...snapshot,rate:0}));
});
