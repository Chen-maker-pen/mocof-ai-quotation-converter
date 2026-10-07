import {applyCnyToMyr} from './currencyWorkbook.js';
import {createRateSnapshot} from './exchange.js';
import type {ExchangeRateSnapshot} from '../src/types.js';
import {correctArea3} from './area3Corrections.js';
import {normalizeArea2} from './area2Source.js';
import {planArea2} from './area2Planner.js';
import {correctArea2Packages} from './area2Corrections.js';
import {layoutArea2} from './area2Layout.js';
import {readTemplateWorkbook} from './templateWorkbook.js';
import {createHash} from 'node:crypto';
import { executeSequentialRecipe, type RecipeCustomer } from "./sequentialRecipe.js";
import { planHybridStep } from "./hybridStepPlanner.js";
export const approvedArea3Decisions = [
 'Use actual labeled total rows for step 31 instead of H54/H68/H110.',
 'Set absent Guest Bedroom and Kids Room totals H7/H8 to 0.',
 'Use E212 / E213 for the Electrical and Plaster descriptions exactly as written.',
 'For Area 3 step 9, use SUM(D7:D15) for D, E, H and I totals exactly as written.',
 'Use J14+J34 for the grand total exactly as written.',
 'Use the exact room names and H7-H10 positions specified in the prompt.',
 'Repair malformed formula syntax: Before Price = Software Price * H$2; After Price = Before Price * I$2.',
];
export type SourceRecipeOptions = Partial<Parameters<typeof executeSequentialRecipe>[4]> & {exchangeSnapshot?:ExchangeRateSnapshot};
export async function runSourceRecipe(raw: Buffer, filename: string, area: number, customer: RecipeCustomer, options: SourceRecipeOptions = {}) {
  if(![2,3].includes(area))throw new Error('Currency conversion for this Area is not yet validated. Please use reviewed Area 2 or Area 3.');
  const exchangeSnapshot=options.exchangeSnapshot || await createRateSnapshot('MYR');
  if(area===2){
    if(customer.quotationType!=='project')throw new Error('Area 2 currently supports the reviewed Project quotation flow only.');
    const normalized=await normalizeArea2(raw);
    const result=await executeSequentialRecipe(normalized,filename,area,customer,{...options,planner:async c=>planArea2(c,{correctGrandTotalRows:true,useYangRooms:true,reviewedPricing:true})});
    if(result.executions.every(e=>e.status==='applied'||e.status==='skipped')){
      let bytes=await layoutArea2(await correctArea2Packages(Buffer.from(result.preserved.transformedXlsxBase64,'base64')));
      bytes=await applyCnyToMyr(bytes,area,exchangeSnapshot);
      result.preserved.transformedXlsxBase64=bytes.toString('base64');result.preserved.transformedSha256=createHash('sha256').update(bytes).digest('hex');
      result.workbookSheets=await readTemplateWorkbook(bytes);
    }
    return result;
  }
  const result=await executeSequentialRecipe(raw, filename, area, customer, { ...options, userDecisions: options.userDecisions || (area===3 ? approvedArea3Decisions : []), planner: options.planner || planHybridStep });
  if(area===3 && result.executions.every(e=>e.status==='applied'||e.status==='skipped')){
    let bytes=await correctArea3(Buffer.from(result.preserved.transformedXlsxBase64,'base64'),filename);
    bytes=await applyCnyToMyr(bytes,area,exchangeSnapshot);
      result.preserved.transformedXlsxBase64=bytes.toString('base64');result.preserved.transformedSha256=createHash('sha256').update(bytes).digest('hex');
    result.workbookSheets=await readTemplateWorkbook(bytes);
  }
  return result;
}
