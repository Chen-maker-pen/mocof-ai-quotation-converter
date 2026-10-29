import {areaRows,standardAreaStructure} from './standardAreaStructure.js';
import {readTemplateWorkbook,createPreservedTemplateWorkbook} from './templateWorkbook.js';
import {layoutArea4} from './area4Layout.js';
import {applyCnyToMyr} from './currencyWorkbook.js';
import type {ExchangeRateSnapshot} from '../src/types.js';
export async function finishStandardArea(raw:Buffer,area:number,rate:ExchangeRateSnapshot){
 const s=(await readTemplateWorkbook(raw))[0],r=areaRows(area);standardAreaStructure(s,area,true);
 const formulas:Record<string,string>={['F'+r.extra]:`MAX(0,E${r.total}-20)*1999`,['G'+r.extra]:`MAX(0,E${r.total}-24)*1999`,['G'+(r.extra+2)]:`MAX(0,D${r.total}-6)*650`};
 const result=await createPreservedTemplateWorkbook(raw,'quotation.xlsx',Object.entries(formulas).map(([address,formula])=>({sheetName:s.name,address,formula,value:0})));
 // Recalculation belongs to currency application, after all source-preserving patches.
 return applyCnyToMyr(await layoutArea4(Buffer.from(result.transformedXlsxBase64,'base64'),area),area,rate);
}
