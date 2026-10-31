import assert from 'node:assert/strict';
import {createPreservedTemplateWorkbook,readTemplateWorkbook} from './templateWorkbook.js';
import {evaluateWorkbookValue as evaluate} from '../src/lib/formulaEvaluator.js';
export async function correctArea4Pricing(raw:Buffer){
const sheets=await readTemplateWorkbook(raw),s=sheets[0];
assert.equal(s.cells.B11.value,'Extra m2');assert.equal(s.cells.B13.value,'Wall Panel');
const replacements:Record<string,string>={F11:'MAX(0,E17-20)*1999',G11:'MAX(0,E17-24)*1999',G13:'MAX(0,D17-6)*650'};
for(let r=21;r<=34;r++)replacements['J'+r]=`I${r}*$I$3`;
for(const [address,formula]of Object.entries(replacements))s.cells[address]={...s.cells[address],formula};
const patches:any[]=[];
for(const [address,c]of Object.entries(s.cells))if(c.formula){
 const value=evaluate(s,address,sheets);assert.ok(typeof value==='number'||typeof value==='string');
 if(typeof value==='string')assert.ok(!/^#(REF|VALUE|DIV|NAME|NUM|N\/A)/.test(value));
 patches.push({sheetName:s.name,address,formula:c.formula,value});
}
const prices=['F','G','I','J'].map(c=>({address:c+'36',value:Number(evaluate(s,c+'36',sheets))}));
assert.ok(prices.every(p=>Number.isFinite(p.value)));const lowest=Math.min(...prices.map(p=>p.value));
for(const p of prices)patches.push({kind:'format_cells',sheetName:s.name,range:p.address,numberFormat:'"RM"#,##0.00',fillColor:p.value===lowest?'00FF00':'FFFFFF'});
const out=await createPreservedTemplateWorkbook(raw,'quotation.xlsx',patches);
const bytes=Buffer.from(out.transformedXlsxBase64,'base64'),after=await readTemplateWorkbook(bytes);
return bytes;
}
