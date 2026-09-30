import { test } from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { executeSequentialRecipe, type RecipeCheckpoint, type StepPlanner, type StepContext, type StepPlan } from '../server/sequentialRecipe.js';
import { officialAreaCatalog } from '../server/officialAreaCatalog.js';

const customer = { name: 'Test', address: 'Test address', sqft: 1200, budget: 10, currency: 'MYR' };
async function fixture() {
  const z = new JSZip();
  z.file('xl/workbook.xml', '<workbook><sheets><sheet name="Source" r:id="r1"/></sheets></workbook>');
  z.file('xl/_rels/workbook.xml.rels', '<Relationships><Relationship Id="r1" Type="x/worksheet" Target="worksheets/sheet1.xml"/></Relationships>');
  z.file('xl/worksheets/sheet1.xml', '<worksheet><sheetData><row r="1"><c r="A1"><v>1</v></c><c r="B1"><v>0.8</v></c></row></sheetData><mergeCells><mergeCell ref="D1:E1"/></mergeCells></worksheet>');
  z.file('xl/media/photo.png', Buffer.from([1,2,3]));
  return z.generateAsync({ type: 'nodebuffer' });
}
const none = (c: StepContext): StepPlan => ({ stepId: c.step.id, status: 'no_change', reason: 'Fixture-only informational step.', operations: [] });
const op = (c: StepContext, extra: Partial<StepPlan['operations'][number]> = {}): StepPlan => ({
  stepId: c.step.id, status: 'ready', reason: 'Fixture change', operations: [{ kind: 'set', sheetName: 'Source', address: 'A1', value: 10, evidence: c.step.lines[0].text, ...extra }],
});

test('all ten documents have complete ordered source-line coverage and stable unique IDs', () => {
  assert.deepEqual(officialAreaCatalog.map(r => r.area), [1,2,3,4,5,6,7,8,9,10]);
  const expected = [186,184,182,350,186,254,279,256,256,255];
  for (const r of officialAreaCatalog) {
    const lines = r.steps.flatMap(s => s.lines);
    assert.equal(lines.length, expected[r.area-1]);
    assert.equal(new Set(lines.map(l => l.id)).size, lines.length);
    assert.ok(r.steps.every(s => s.text === s.lines.map(l => l.text).join('\n')));
  }
});

test('one call per section, fresh state each time, deterministic formula caches', async () => {
  const calls: string[] = [];
  let active = 0;
  const planner: StepPlanner = async c => {
    assert.equal(active++, 0);
    calls.push(c.step.id);
    let plan = none(c);
    if (calls.length === 1) plan = op(c);
    if (calls.length === 2) {
      assert.equal(c.sheets[0].cells.A1.value, 10);
      plan = op(c, { kind: 'formula', address: 'A2', value: undefined, formula: 'SUM(A1*B1)' });
    }
    if (calls.length === 3) assert.equal(c.sheets[0].cells.A2.value, 8);
    active--;
    return plan;
  };
  const result = await executeSequentialRecipe(await fixture(), 'test.xlsx', 3, customer, { planner });
  assert.deepEqual(calls, officialAreaCatalog[2].steps.map(s => s.id));
  assert.equal(result.workbookSheets[0].cells.A2.value, 8);
  assert.equal(result.executions[1].changes![0].formula, 'SUM(A1*B1)');
  assert.equal(result.preserved.protectedMediaCount, 1);
});

test('an invalid operation rolls back its whole section; downstream writes are held but every section is visited', async () => {
  let calls = 0;
  const result = await executeSequentialRecipe(await fixture(), 'test.xlsx', 1, customer, { planner: async c => {
    calls++;
    const p = op(c);
    if (calls === 1) p.operations.push({ ...p.operations[0], address: 'E1' });
    return p;
  } });
  assert.equal(calls, officialAreaCatalog[0].steps.length);
  assert.equal(result.workbookSheets[0].cells.A1.value, 1);
  assert.ok(result.executions.every(e => e.status === 'needs_review' && e.changes!.length === 0));
});

test('API interruption resumes after last checkpoint, never reapplying completed steps', async () => {
  const raw = await fixture();
  let saved: RecipeCheckpoint | undefined;
  let count = 0;
  await assert.rejects(executeSequentialRecipe(raw, 'test.xlsx', 2, customer, {
    planner: async c => { if (++count === 3) throw new Error('network unavailable'); return count === 1 ? op(c) : none(c); },
    checkpoint: async checkpoint => { saved = checkpoint; },
  }), /network unavailable/);
  assert.equal(saved!.nextStep, 2);
  const calls: string[] = [];
  const result = await executeSequentialRecipe(raw, 'test.xlsx', 2, customer, { resume: saved, planner: async c => { calls.push(c.step.id); return none(c); } });
  assert.equal(calls[0], officialAreaCatalog[1].steps[2].id);
  assert.equal(result.workbookSheets[0].cells.A1.value, 10);
  await assert.rejects(executeSequentialRecipe(raw, 'test.xlsx', 2, { ...customer, sqft: 1500 }, { resume: saved, planner: async c => none(c) }), /Checkpoint/);
});

test('missing Gemini key does not report instructions as executed', async () => {
  await assert.rejects(executeSequentialRecipe(await fixture(), 'test.xlsx', 10, customer, { planner: async () => { throw new Error('GEMINI_API_KEY is required'); } }), /GEMINI_API_KEY/);
});

test('undocumented financial constants are rejected rather than accepted as a price', async () => {
  const result = await executeSequentialRecipe(await fixture(), 'test.xlsx', 3, customer, { planner: async c => op(c, { kind: 'formula', address: 'A2', value: undefined, formula: 'A1*0.7312345' }) });
  assert.equal(result.executions[0].status, 'needs_review');
  assert.match(result.executions[0].result, /numeric constant/);
  assert.equal(result.workbookSheets[0].cells.A2, undefined);
});

test('structural step is journaled, visible to the next prompt and resumes without inserting twice', async () => {
  const raw = await fixture();
  let saved: RecipeCheckpoint | undefined;
  let inserted = false;
  await assert.rejects(executeSequentialRecipe(raw, 'test.xlsx', 3, customer, {
    planner: async c => {
      if (inserted) {
        assert.equal(c.sheets[0].cells.A7.value, 1);
        throw new Error('simulated interruption after structural checkpoint');
      }
      if (!c.step.text.includes('Insert 6 row')) return none(c);
      inserted = true;
      return { stepId: c.step.id, status: 'ready', reason: 'Structure checkpoint fixture', operations: [
        { kind: 'insert_rows', sheetName: 'Source', address: '', beforeRow: 1, count: 6, evidence: c.step.lines[0].text },
        { kind: 'set', sheetName: 'Source', address: 'A1', value: 'Inserted heading', evidence: c.step.lines[0].text },
      ] };
    }, checkpoint: async value => { saved = value; },
  }), /simulated interruption/);
  assert.equal(saved!.executions.at(-1)!.status, 'applied');
  assert.deepEqual(saved!.executions.at(-1)!.structuralChanges, [{ sheetName: 'Source', beforeRow: 1, count: 6 }]);
  const result = await executeSequentialRecipe(raw, 'test.xlsx', 3, customer, { resume: saved, planner: async c => none(c) });
  assert.equal(result.workbookSheets[0].cells.A7.value, 1);
  assert.equal(result.workbookSheets[0].cells.A13, undefined);
  assert.equal(result.workbookSheets[0].cells.A1.value, 'Inserted heading');
});
test('serial numbering is generated from an explicit instruction, not model-calculated amounts', async () => {
  const result = await executeSequentialRecipe(await fixture(), 'test.xlsx', 3, customer, { planner: async c => {
    if (!c.step.text.includes('ADD THE SERIAL NUMBER FOR WHOLE HOUSE')) return none(c);
    return { stepId: c.step.id, status: 'ready', reason: 'Numbering fixture', operations: [
      { kind: 'sequence', sheetName: 'Source', address: '', range: 'A7:A15', evidence: c.step.lines[0].text },
    ] };
  } });
  for (let row=7;row<=15;row++) assert.equal(result.workbookSheets[0].cells[`A${row}`].value,row-6);
});
test('scalar range clearing and absolute addresses are expanded atomically',async()=>{
  let call=0;
  const result=await executeSequentialRecipe(await fixture(),'test.xlsx',3,customer,{planner:async c=>{
    if(++call!==1)return none(c);
    return {stepId:c.step.id,status:'ready',reason:'Range fixture',operations:[
      {kind:'clear',sheetName:'Source',address:'A1:B1',evidence:c.step.lines[0].text},
      {kind:'set',sheetName:'Source',address:'$A$2',value:'Customer',evidence:c.step.lines[0].text},
    ]};
  }});
  assert.equal(result.executions[0].status,'applied');
  assert.equal(result.workbookSheets[0].cells.A1.value,'');
  assert.equal(result.workbookSheets[0].cells.B1.value,'');
  assert.equal(result.workbookSheets[0].cells.A2.value,'Customer');
});
