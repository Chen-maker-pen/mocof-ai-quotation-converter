import {readTemplateWorkbook,createPreservedTemplateWorkbook} from './templateWorkbook.js';
import {evaluateWorkbookValue} from '../src/lib/formulaEvaluator.js';
import type {ExchangeRateSnapshot} from '../src/types.js';
export async function applyCnyToMyr(raw:Buffer,area:number,rate:ExchangeRateSnapshot){
 if(![2,3].includes(area))throw Error('Currency conversion for this Area requires template review.');
 if(rate.sourceCurrency!=='CNY'||rate.targetCurrency!=='MYR'||!Number.isFinite(rate.rate)||rate.rate<=0||!rate.source||!rate.rateDate)throw Error('A verified CNY to MYR rate snapshot is required.');
 const sheets=await readTemplateWorkbook(raw),s=sheets[0],start=area===2?39:40,end=area===2?81:131,total=area===2?15:16,grand=area===2?34:35;
 const patches:any[]=[];
 const set=(address:string,value:string|number,formula?:string)=>{s.cells[address]={...s.cells[address],address,row:Number(address.replace(/\D/g,'')),column:address.charCodeAt(0)-64,value,formula};patches.push({sheetName:s.name,address,value,formula});};
 set('H2',rate.rate);
 for(let row=start;row<=end;row++)if(typeof s.cells['H'+row]?.value==='number')set('I'+row,0,`H${row}*$H$2`);
 for(let row=7;row<=(area===2?8:9);row++)set('I'+row,0,`H${row}*$H$2`);
 // MYR package/supplementary rates are intentionally not converted.
 for(const c of ['I','J'])set(c+total,0,`SUM(${c}7:${c}${total-1})`);
 const rateRow=area===2?16:17;
 set('A'+rateRow,`1 CNY = ${rate.rate} MYR | Rate date ${rate.rateDate.slice(0,10)} | exchangerate-api.com`);
 for(const [address,cell]of Object.entries(s.cells))if(cell.formula){const value=evaluateWorkbookValue(s,address,sheets);if((typeof value!=='number'&&typeof value!=='string')||(typeof value==='number'&&!Number.isFinite(value))||(typeof value==='string'&&/^#(?:REF!|VALUE!|DIV\/0!|NAME\?|NUM!|N\/A)/.test(value)))throw Error('Invalid converted formula at '+address);patches.push({sheetName:s.name,address,formula:cell.formula,value});}
 const candidates=['F','G','I','J'].map(c=>({address:c+grand,value:Number(evaluateWorkbookValue(s,c+grand,sheets))}));
 const min=Math.min(...candidates.map(c=>c.value));
 if(!Number.isFinite(min))throw Error('Converted grand totals are invalid.');
 for(const p of candidates)patches.push({kind:'format_cells',sheetName:s.name,range:p.address,numberFormat:'"RM"#,##0.00',fillColor:p.value===min?'00FF00':'FFFFFF'});
 // Visible RM/sqft follows the converted after-price grand total.
 if(area===2)patches.push({sheetName:s.name,address:'I4',formula:'H4',value:evaluateWorkbookValue(s,'H4',sheets)});
 const result=await createPreservedTemplateWorkbook(raw,'quotation.xlsx',patches);
 return Buffer.from(result.transformedXlsxBase64,'base64');
}
