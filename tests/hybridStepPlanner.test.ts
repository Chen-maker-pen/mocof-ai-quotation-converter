import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHybridStepPlanner, planDeterministicStep } from '../server/hybridStepPlanner.js';
import { executeSequentialRecipe, type RecipeCheckpoint, type StepContext } from '../server/sequentialRecipe.js';
import { readTemplateWorkbook } from '../server/templateWorkbook.js';
import { officialAreaCatalog } from '../server/officialAreaCatalog.js';
const customer={name:'Test Customer',address:'Test Address',sqft:600,budget:100000,currency:'MYR'};
function contextFor(id:string):StepContext {
  const recipe=officialAreaCatalog[2];
  return {recipe,step:recipe.steps.find(s=>s.id===id)!,customer,history:[],sheets:[{id:'fixture',name:'Summary',rowCount:40,columnCount:10,cells:{
    E1:{address:'E1',row:1,column:5,value:'Heading'},A5:{address:'A5',row:5,column:1,value:'Whole House Total'},
    A20:{address:'A20',row:20,column:1,value:'柜体合计'},B20:{address:'B20',row:20,column:2,value:'主卧房'},
  },mergedRanges:[]}]};
}
test('Project quotation numbers the summary and explicitly clears design-fee deductions',()=>{
  const c=contextFor('A3-S008');c.customer={...customer,quotationType:'project'};
  const plan=planDeterministicStep(c)!;
  assert.equal(plan.status,'ready');
  assert.deepEqual(plan.operations.filter(p=>p.kind==='clear').map(p=>p.address),['F15','G15','J15']);
  assert.equal(plan.operations[0].range,'A7:A15');
});
test('documented translations use exact replacements and avoid duplicate bilingual text',()=>{
  const c=contextFor('A3-S022'),plan=planDeterministicStep(c)!;
  assert.equal(plan.operations[0].value,'Cabinet Total Price');
  const room=contextFor('A3-S025'),translated=planDeterministicStep(room)!;
  assert.equal(translated.operations[0].value,'主卧房//Master Bedroom');
  room.sheets[0].cells.B20.value='主卧房//Master Bedroom';
  assert.equal(planDeterministicStep(room)!.status,'no_change');
});
test('supplementary structure and totals compile exact documented coordinates',()=>{
  const plan=planDeterministicStep(contextFor('A3-S012'))!;
  assert.deepEqual({...plan.operations[0],evidence:undefined},{kind:'insert_rows',address:'',beforeRow:18,count:19,sheetName:'Summary',evidence:undefined});
  assert.equal(plan.operations.find(p=>p.address==='J19')?.value,'After Price');
  const totals=planDeterministicStep(contextFor('A3-S016'))!;
  assert.equal(totals.operations.find(p=>p.address==='J34')?.formula,'SUM(J20:J33)');
  assert.equal(planDeterministicStep(contextFor('A3-S009')),undefined);
});
test('changed Area 3 wording stops without Gemini while other Areas retain fallback',async()=>{
  const recipe=officialAreaCatalog[2];
  const context={recipe,step:{...recipe.steps[0],text:'Changed title'},customer,sheets:[],history:[]} as StepContext;
  assert.equal(planDeterministicStep(context),undefined);
  let calls=0;
  const planner=createHybridStepPlanner(async c=>{calls++;return {stepId:c.step.id,status:'needs_review',reason:'fixture fallback',operations:[]};});
  assert.equal((await planner(context)).executor,'deterministic');
  assert.equal(calls,0);
  const other={...context,recipe:officialAreaCatalog[0],step:officialAreaCatalog[0].steps[0]};
  assert.equal((await planner(other)).executor,'gemini');assert.equal(calls,1);
  assert.equal(planDeterministicStep({...context,recipe:officialAreaCatalog[0],step:officialAreaCatalog[0].steps[0]}),undefined);
});
test('unresolved prior steps do not spend Gemini requests on blocked downstream plans',async()=>{
  const c=contextFor('A3-S009');
  c.history=[{promptNumber:8,stepId:'A3-S008',category:'fixture',instruction:'fixture',status:'needs_review',result:'Missing input'}];
  const planner=createHybridStepPlanner(async()=>{assert.fail('Blocked step must not call Gemini');});
  const plan=await planner(c);
  assert.equal(plan.status,'needs_review');assert.deepEqual(plan.blockedBy,['A3-S008']);
});
test('Fang all thirty-three Project sections execute in order without any Gemini request', {skip:!process.env.MOCOF_FANG_XLSX},async()=>{
  const raw=await fs.readFile(process.env.MOCOF_FANG_XLSX!);
  let saved:RecipeCheckpoint|undefined;
  let fallbackCalls=0;
  const planner=createHybridStepPlanner(async()=>{fallbackCalls++;throw new Error('unexpected Gemini request');});
  await assert.rejects(executeSequentialRecipe(raw,'source.xlsx',3,{...customer,quotationType:'project'},{
    planner,userDecisions:['use SUM(D7:D15) for D, E, H and I totals','Use J14+J34','E212 / E213','Set absent Guest Bedroom and Kids Room totals H7/H8 to 0.','Use actual labeled total rows for step 31 instead of H54/H68/H110.'],checkpoint:async cp=>{saved=cp;if(cp.nextStep===33)throw new Error('fixture stopped after thirty-three committed sections');},
  }),/fixture stopped/);
  assert.equal(fallbackCalls,0);
  assert.equal(saved!.executions[0].status,'skipped');
  for(const e of saved!.executions.slice(1))assert.ok(['applied','skipped'].includes(e.status),`${e.stepId}: ${e.result}`);
  assert.ok(saved!.executions.every(e=>e.executor==='deterministic'));
  const {createPreservedTemplateWorkbook}=await import('../server/templateWorkbook.js');
  const out=await createPreservedTemplateWorkbook(raw,'source.xlsx',saved!.patches);
  const [sheet]=await readTemplateWorkbook(Buffer.from(out.transformedXlsxBase64,'base64'));
  assert.equal(sheet.cells.F2.value,'Test Customer');assert.equal(sheet.cells.F4.value,600);assert.equal(sheet.cells.H3.value,100000);
  assert.equal(sheet.cells.I2.value,.9);assert.equal(sheet.cells.B10.value,'Extra m2');assert.equal(sheet.cells.B15.value,'Deduct Design fee.');
  for (const address of ['F15','G15','J15']) assert.ok(sheet.cells[address]?.value === undefined || sheet.cells[address]?.value === '', address);
  assert.equal(sheet.cells.D28.value,12);
  assert.equal(sheet.cells.B28.value,'Paint with 3 colour nippon colours');
  assert.equal(sheet.cells.J24.value,0);
  assert.equal(sheet.cells.J25.value,9120);
  assert.equal(sheet.cells.J25.formula,'SUM(I25*$I$3)');
  assert.equal(sheet.cells.F25.value,9120);
  assert.equal(sheet.cells.H7.value,0);assert.equal(sheet.cells.H8.value,0);
  assert.equal(sheet.cells.H9.value,43005);assert.equal(sheet.cells.H10.value,53532);
  assert.equal(sheet.cells.H57.formula,'SUM(H40:H56)');
  assert.equal(sheet.cells.H70.formula,'SUM(H57,H63,H69)');
  assert.equal(sheet.cells.H108.formula,'SUM(H99,H107)');
  assert.equal(sheet.cells.I40.value,18285*6.88);
  assert.equal(out.protectedMediaCount,137);
});

test('confirmed literal totals use column D for D/E/H/I without silently correcting the prompt',()=>{
 const c=contextFor('A3-S009');c.userDecisions=['use SUM(D7:D15) for D, E, H and I totals'];
 const p=planDeterministicStep(c)!;
 for (const col of ['D','E','H','I']) assert.equal(p.operations.find(op=>op.address===`${col}16`)?.formula,'SUM(D7:D15)');
});

test('fourteen supplementary rates cannot be assigned to thirteen named items',()=>{
 const c=contextFor('A3-S015');
 for(let row=20;row<=32;row++) c.sheets[0].cells[`B${row}`]={address:`B${row}`,row,column:2,value:`Item ${row-19}`};
 const plan=planDeterministicStep(c)!;
 assert.equal(plan.status,'needs_review');assert.match(plan.reason,/B33/);assert.deepEqual(plan.operations,[]);
});

test('Fang sample resolves fourteen names by separating the two painting services',()=>{
 const p=planDeterministicStep(contextFor('A3-S013'))!;
 assert.equal(p.operations.length,14);
 assert.equal(p.operations.find(o=>o.address==='B27')?.value,'Painting with white paint');
 assert.equal(p.operations.find(o=>o.address==='B28')?.value,'Paint with 3 colour nippon colours');
 assert.equal(p.operations.find(o=>o.address==='B33')?.value,'Mirror');
});

test('grand total retains the user-confirmed literal J14 and compares the four quotation prices',()=>{
 const c=contextFor('A3-S017');c.userDecisions=['Use J14+J34','E212 / E213','Set absent Guest Bedroom and Kids Room totals H7/H8 to 0.','Use actual labeled total rows for step 31 instead of H54/H68/H110.'];
 const p=planDeterministicStep(c)!;
 assert.equal(p.operations.find(o=>o.address==='J35')?.formula,'J14+J34');
 assert.equal(p.operations.find(o=>o.address==='G4')?.formula,'MIN(F35,G35,I35,J35)/F4');
});

test('conversion uses fixed factors and leaves merged continuations and price headers intact',()=>{
 const c=contextFor('A3-S032');c.sheets[0].mergedRanges=['I40:I42','J40:J42'];
 c.sheets[0].cells.I43={address:'I43',row:43,column:9,value:'Before Price'};
 const p=planDeterministicStep(c)!;
 assert.equal(p.operations.find(o=>o.address==='I40')?.formula,'IF(ISNUMBER(H40),H40*H$2,"")');
 assert.equal(p.operations.find(o=>o.address==='J40')?.formula,'IF(ISNUMBER(I40),I40*I$2,"")');
 assert.ok(!p.operations.some(o=>['I41','I42','J41','J42','I43'].includes(o.address)));
});
