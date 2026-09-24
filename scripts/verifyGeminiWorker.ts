import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { getGeminiModel, geminiFailure } from '../server/geminiConfig.js';
import { createTemplateRecipeTransactions, processAiExtractionAndConversion } from '../server/geminiService.js';
import { createPreservedTemplateWorkbook } from '../server/templateWorkbook.js';
import { getDocumentedAreaPrompts } from '../server/documentedPrompts.js';
import { getPersistentConversionJob, readSourceForWorker } from '../server/persistentJobs.js';
import type { ConversionProfile } from '../src/types.js';

let stage = 'synthetic structured patch';
async function main() {
  console.log(`Testing worker SDK model: ${getGeminiModel()}`);
  const synthetic = await createTemplateRecipeTransactions(
    [{ number: '1', category: 'Synthetic connection test', text: 'Set A1 on Synthetic to the exact text "Connection verified" (without quotes or a trailing period).' }],
    [{ sheetName: 'Synthetic', address: 'A1', value: 'Pending' }],
    { name: 'Synthetic', address: 'Synthetic', sqft: 1000, budget: 10000, currency: 'MYR' },
  );
  assert.equal(synthetic.operations.length, 1);
  assert.equal(synthetic.operations[0].address, 'A1');
  assert.equal(synthetic.operations[0].value, 'Connection verified');
  console.log('PASS: actual worker SDK returned a valid structured patch.');

  stage = 'synthetic product translation';
  const extracted = await processAiExtractionAndConversion(
    [[1, 'TEST-CAB-001', '衣柜', '卧室', '柜体', '600x500x2400']],
    { companyName: 'MOCOF', rules: {}, bossEditingRules: [], areaPromptRules: [] } as unknown as ConversionProfile,
  );
  assert.ok(extracted.translatedItems.some(item => item.itemCode === 'TEST-CAB-001' && item.nameEnglish));
  console.log('PASS: worker extraction received an actual Gemini translation.');

  const jobId = process.env.MOCOF_TEST_SOURCE_JOB_ID;
  if (!jobId) { console.log('Private source test not requested.'); return; }
  if (!process.env.MOCOF_TEST_SOURCE_SHA256) throw new Error('Expected private source hash is required.');
  stage = 'private source identity';
  const job = await getPersistentConversionJob(jobId);
  if (!job) throw new Error('Private source job was not found.');
  const raw = await readSourceForWorker(job);
  if (createHash('sha256').update(raw).digest('hex') !== process.env.MOCOF_TEST_SOURCE_SHA256)
    throw new Error('Stored source does not match the expected Fang fixture. No source conversion was attempted.');
  assert.equal(Number(job.input.projectData.selectedArea), 3);
  stage = 'Fang title substep';
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(raw as any);
  const sheet = workbook.worksheets[0];
  const instruction = getDocumentedAreaPrompts(3)!.prompts[0].text.split('\n').find(line => /Update the cell E1 to:/.test(line));
  assert.ok(instruction, 'Official Area 3 title instruction not found.');
  // A narrowly scoped first-instruction check, not complete Area 3 acceptance.
  // No source bytes, customer cells, credentials, or result workbook are logged/uploaded.
  const plan = await createTemplateRecipeTransactions(
    [{ number: '1', category: 'Area 3 title substep', text: instruction }],
    [{ sheetName: sheet.name, address: 'E1', value: sheet.getCell('E1').text }],
    { name: 'Synthetic', address: 'Synthetic', sqft: 1000, budget: 10000, currency: 'MYR' },
  );
  assert.equal(plan.operations.length, 1);
  assert.equal(plan.operations[0].sheetName, sheet.name);
  assert.equal(plan.operations[0].address, 'E1');
  assert.equal(plan.operations[0].value, 'MOCOF Whole House Quotation');
  assert.ok(!plan.operations[0].formula);
  const out = await createPreservedTemplateWorkbook(raw, 'fixture.xlsx', plan.operations);
  const original = await JSZip.loadAsync(raw), patched = await JSZip.loadAsync(Buffer.from(out.transformedXlsxBase64, 'base64'));
  assert.deepEqual(Object.keys(original.files).sort(), Object.keys(patched.files).sort());
  const changed: string[] = [];
  for (const [name, entry] of Object.entries(original.files)) {
    if (entry.dir) continue;
    if (!(await entry.async('nodebuffer')).equals(await patched.file(name)!.async('nodebuffer'))) changed.push(name);
  }
  assert.equal(changed.length, 1);
  assert.match(changed[0], /^xl\/worksheets\/.*\.xml$/);
  console.log(`PASS: private Fang/Area 3 title substep; ${out.sheetNames.length} sheets, ${out.protectedMediaCount} media, ${out.protectedDrawingCount} drawing entries and ${out.protectedMergeCount} merges retained. Only one worksheet entry changed.`);
  console.log('Full prompt execution, financial reconciliation and PDF acceptance have NOT been tested by this check.');
}

main().catch((error: any) => {
  // Assertion errors may include private cells as actual/expected values.
  if (error?.code === 'ERR_ASSERTION') console.error(`Worker verification assertion failed at ${stage}. No private values were logged.`);
  else if (String(error?.message).startsWith('Stored source') || String(error?.message).startsWith('Private source')) console.error(error.message);
  else console.error(geminiFailure(error).message);
  process.exitCode = 1;
});
