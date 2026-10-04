import {correctArea3} from './area3Corrections.js';
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
export type SourceRecipeOptions = Partial<Parameters<typeof executeSequentialRecipe>[4]>;
export async function runSourceRecipe(raw: Buffer, filename: string, area: number, customer: RecipeCustomer, options: SourceRecipeOptions = {}) {
  const result=await executeSequentialRecipe(raw, filename, area, customer, { ...options, userDecisions: options.userDecisions || (area===3 ? approvedArea3Decisions : []), planner: options.planner || planHybridStep });
  if(area===3 && result.executions.every(e=>e.status==='applied'||e.status==='skipped')){
    const bytes=await correctArea3(Buffer.from(result.preserved.transformedXlsxBase64,'base64'),filename);
    result.preserved.transformedXlsxBase64=bytes.toString('base64');result.preserved.transformedSha256=createHash('sha256').update(bytes).digest('hex');
    result.workbookSheets=await readTemplateWorkbook(bytes);
  }
  return result;
}
