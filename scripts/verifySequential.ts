import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomBytes, createCipheriv, publicEncrypt } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { pathToFileURL } from 'node:url';
import { getPersistentConversionJob, readSourceForWorker } from '../server/persistentJobs.js';

// The recipe, customer and experimental engine stay in a temporary repository
// secret. Customer content never enters this public repository or plaintext logs.
const root = path.resolve('.private-acceptance');
const allowed = new Set([
  'server/sequentialRecipe.ts', 'server/templateWorkbook.ts', 'server/templateRows.ts',
  'server/templateColumns.ts', 'server/geminiRetry.ts',
  'server/templateFormat.ts',
  'server/geminiStepPlanner.ts', 'server/geminiConfig.ts', 'server/officialAreaCatalog.ts',
  'src/lib/formulaEvaluator.ts', 'src/types.ts',
]);
let input: any;
let report: any = { status: 'starting' };
async function saveReport() {
  if (!input?.reportPublicKey) return;
  const key = randomBytes(32), iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(report)), cipher.final()]);
  await fs.writeFile('private-acceptance.enc', JSON.stringify({
    key: publicEncrypt({ key: input.reportPublicKey, oaepHash: 'sha256' }, key).toString('base64'),
    iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: data.toString('base64'),
  }));
}
async function main() {
  const encoded = process.env.MOCOF_PRIVATE_ACCEPTANCE;
  if (!encoded) throw new Error('Private acceptance input is not configured.');
  const compressed = Buffer.from(encoded, 'base64');
  input = JSON.parse(gunzipSync(compressed, { maxOutputLength: 2000000 }).toString());
  console.log(`Acceptance bundle SHA256: ${createHash('sha256').update(compressed).digest('hex')}`);
  if (Object.keys(input.files).length !== allowed.size || Object.keys(input.files).some(n => !allowed.has(n))) throw new Error('Invalid acceptance module list.');
  for (const [filename, content] of Object.entries(input.files)) {
    await fs.mkdir(path.dirname(path.join(root, filename)), { recursive: true });
    await fs.writeFile(path.join(root, filename), String(content));
  }
  const job = await getPersistentConversionJob(process.env.MOCOF_TEST_SOURCE_JOB_ID!);
  if (!job) throw new Error('Private source job missing.');
  const raw = await readSourceForWorker(job);
  if (createHash('sha256').update(raw).digest('hex') !== process.env.MOCOF_TEST_SOURCE_SHA256) throw new Error('Private source hash mismatch.');
  const { executeSequentialRecipe } = await import(pathToFileURL(path.join(root, 'server/sequentialRecipe.ts')).href);
  const { planGeminiStep } = await import(pathToFileURL(path.join(root, 'server/geminiStepPlanner.ts')).href);
  const result = await executeSequentialRecipe(raw, 'source.xlsx', input.area, input.customer, {
    planner: planGeminiStep,
    userDecisions: input.userDecisions || [],
    resume: input.resume,
    checkpoint: async (checkpoint: any, progress: any) => {
      report = { status: 'running', customer: input.customer, checkpoint };
      await saveReport();
      console.log(`Prompt ${progress.current}/${progress.total}: ${progress.status}`);
    },
  });
  const unresolved = result.executions.filter((e: any) => e.status === 'needs_review');
  report = { status: unresolved.length ? 'needs_review' : 'prompts_complete', customer: input.customer, ...result };
  await saveReport();
  console.log(`Ordered prompts visited: ${result.executions.length}; unresolved: ${unresolved.length}. PDF/visual acceptance is a separate required check.`);
  if (unresolved.length) process.exitCode = 1;
}
main().catch(async error => {
  report = { ...report, status: 'failed', error: String(error?.message || 'Unknown failure') };
  await saveReport();
  console.error('Acceptance stopped. Details are in the encrypted report; no customer content is logged.');
  process.exitCode = 1;
}).finally(async () => { await fs.rm(root, { recursive: true, force: true }); });
