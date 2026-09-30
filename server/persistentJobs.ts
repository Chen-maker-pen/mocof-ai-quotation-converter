import crypto from 'crypto';
import { get, put } from '@vercel/blob';
import { CurrencyCode, Project } from '../src/types.js';
import type { RecipeCheckpoint, RecipeProgress } from './sequentialRecipe.js';

export type ConversionJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface ConversionJobInput {
  projectData: Partial<Project> & {
    selectedArea: number;
    customerSqft: number;
    customerBudget: number;
    currency?: CurrencyCode;
  };
  source: {
    originalFileName: string;
    contentType: string;
    sizeBytes: number;
    blobUrl: string;
  };
}

/**
 * The job record is the production source of truth.  Nothing in this record
 * depends on Vercel's ephemeral filesystem or in-memory database.
 */
export interface PersistentConversionJob {
  id: string;
  status: ConversionJobStatus;
  createdAt: string;
  updatedAt: string;
  attempt: number;
  input: ConversionJobInput;
  /** GitHub Actions is the durable worker runner for long conversions. */
  githubDispatchAt?: string;
  githubRepository?: string;
  workerStartedAt?: string;
  completedAt?: string;
  resultBlobUrl?: string;
  convertedWorkbookBlobUrl?: string;
  convertedPdfBlobUrl?: string;
  error?: string;
  progress?: RecipeProgress;
}

export interface CompletedConversionResult {
  project: unknown;
  quote: unknown;
  exceptions: unknown[];
  parsedSheetNames: string[];
  extractedImageCount: number;
}

const jobPath = (id: string) => `mocof/jobs/${id}.json`;
const resultPath = (id: string) => `mocof/results/${id}.json`;
const sourcePath = (id: string, name: string) => `mocof/sources/${id}/${name.replace(/[^a-zA-Z0-9._-]+/g, '_')}`;
const outputPath = (id: string, name: string) => `mocof/converted/${id}/${name.replace(/[^a-zA-Z0-9._-]+/g, '_')}`;

export const persistentWorkerConfiguration = () => ({
  blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  githubDispatch: Boolean(process.env.GITHUB_DISPATCH_TOKEN),
});

export function assertPersistentWorkerConfigured() {
  const configuration = persistentWorkerConfiguration();
  const missing = Object.entries(configuration).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) {
    throw new Error(`Persistent conversion is not configured. Missing: ${missing.join(', ')}. Add BLOB_READ_WRITE_TOKEN and GITHUB_DISPATCH_TOKEN in Vercel.`);
  }
}

function githubRepository() {
  return process.env.MOCOF_GITHUB_REPOSITORY || 'Chen-maker-pen/mocof-ai-quotation-converter';
}

/**
 * Starts the GitHub Actions worker without putting any customer data in the
 * dispatch payload. The worker receives only a job id and reads the private
 * source file from Vercel Blob.
 */
async function dispatchGitHubWorker(jobId: string) {
  const repository = githubRepository();
  const ref = process.env.VERCEL_GIT_COMMIT_REF || 'main';
  const response = await fetch(`https://api.github.com/repos/${repository}/dispatches`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${process.env.GITHUB_DISPATCH_TOKEN!}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'mocof-quotation-converter',
    },
    body: JSON.stringify({
      event_type: 'mocof-conversion', client_payload: { jobId, ref },
    }),
  });
  if (!response.ok) {
    const details = (await response.text()).slice(0, 240);
    throw new Error(`GitHub Actions dispatch failed (HTTP ${response.status}). ${details || 'Check GITHUB_DISPATCH_TOKEN repository access.'}`);
  }
  return repository;
}

async function readJson<T>(pathname: string): Promise<T | null> {
  const response = await get(pathname, { access: 'private', useCache: false });
  if (!response?.stream || response.statusCode !== 200) return null;
  const body = await new Response(response.stream).text();
  return JSON.parse(body) as T;
}

async function writeJson(pathname: string, data: unknown) {
  return put(pathname, JSON.stringify(data), {
    access: 'private',
    contentType: 'application/json; charset=utf-8',
    allowOverwrite: true,
    addRandomSuffix: false,
    cacheControlMaxAge: 60,
  });
}

export async function readRecipeCheckpoint(jobId: string) {
  return readJson<RecipeCheckpoint>(`mocof/checkpoints/${jobId}.json`);
}

export async function saveRecipeCheckpoint(jobId: string, checkpoint: RecipeCheckpoint, progress: RecipeProgress) {
  await writeJson(`mocof/checkpoints/${jobId}.json`, checkpoint);
  await updatePersistentConversionJob(jobId, { progress });
}

export async function createPersistentConversionJob(
  sourceBuffer: Buffer,
  originalFileName: string,
  contentType: string,
  projectData: ConversionJobInput['projectData'],
): Promise<PersistentConversionJob> {
  assertPersistentWorkerConfigured();
  const id = `job-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  const sourceBlob = await put(sourcePath(id, originalFileName), sourceBuffer, {
    access: 'private',
    contentType: contentType || 'application/octet-stream',
    addRandomSuffix: false,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  });
  const now = new Date().toISOString();
  const job: PersistentConversionJob = {
    id,
    status: 'queued',
    createdAt: now,
    updatedAt: now,
    attempt: 0,
    input: {
      projectData,
      source: { originalFileName, contentType, sizeBytes: sourceBuffer.length, blobUrl: sourceBlob.url },
    },
  };
  await writeJson(jobPath(id), job);

  // Persist dispatch metadata before dispatch: writing the queued snapshot
  // afterwards can overwrite a worker that has already started/completed.
  job.githubDispatchAt = new Date().toISOString();
  job.githubRepository = githubRepository();
  await writeJson(jobPath(id), job);
  try {
    await dispatchGitHubWorker(id);
  } catch (error) {
    await updatePersistentConversionJob(id, { status: 'failed', error: (error as Error).message });
    throw error;
  }
  return job;
}

export async function getPersistentConversionJob(id: string) {
  return readJson<PersistentConversionJob>(jobPath(id));
}

export async function updatePersistentConversionJob(id: string, patch: Partial<PersistentConversionJob>) {
  const current = await getPersistentConversionJob(id);
  if (!current) throw new Error(`Conversion job ${id} was not found in persistent storage.`);
  const next: PersistentConversionJob = { ...current, ...patch, id: current.id, updatedAt: new Date().toISOString() };
  await writeJson(jobPath(id), next);
  return next;
}

export async function readSourceForWorker(job: PersistentConversionJob) {
  const response = await get(job.input.source.blobUrl, { access: 'private', useCache: false });
  if (!response?.stream || response.statusCode !== 200) throw new Error('The original supplier file is missing from persistent storage.');
  return Buffer.from(await new Response(response.stream).arrayBuffer());
}

export async function persistCompletedConversion(
  jobId: string,
  result: CompletedConversionResult,
  transformedWorkbook?: { buffer: Buffer; outputFileName: string },
  renderedPdf?: Buffer,
) {
  const resultBlob = await writeJson(resultPath(jobId), result);
  const converted = transformedWorkbook
    ? await put(outputPath(jobId, transformedWorkbook.outputFileName), transformedWorkbook.buffer, {
      access: 'private', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', cacheControlMaxAge: 60 * 60 * 24 * 365,
    })
    : undefined;
  const pdf=renderedPdf ? await put(outputPath(jobId,'quotation.pdf'),renderedPdf,{access:'private',contentType:'application/pdf',cacheControlMaxAge:31536000}) : undefined;
  return updatePersistentConversionJob(jobId, {
    status: 'completed', completedAt: new Date().toISOString(), resultBlobUrl: resultBlob.url,
    convertedWorkbookBlobUrl: converted?.url, convertedPdfBlobUrl: pdf?.url,
  });
}

export async function readCompletedConversionResult(job: PersistentConversionJob) {
  if (!job.resultBlobUrl) return null;
  return readJson<CompletedConversionResult>(job.resultBlobUrl);
}

/** Safe API shape: browser never receives private Blob source URLs. */
export function publicJobStatus(job: PersistentConversionJob) {
  return {
    id: job.id, status: job.status, createdAt: job.createdAt, updatedAt: job.updatedAt,
    attempt: job.attempt, workerStartedAt: job.workerStartedAt, completedAt: job.completedAt,
    error: job.error, progress: job.progress,
  };
}

export async function readJobExport(job:PersistentConversionJob,format:'xlsx'|'pdf') {
 const url=format==='pdf'?job.convertedPdfBlobUrl:job.convertedWorkbookBlobUrl;
 if(!url)throw Error('Requested export is not ready.');
 const response=await get(url,{access:'private',useCache:false});
 if(!response?.stream||response.statusCode!==200)throw Error('Export file is unavailable.');
 return Buffer.from(await new Response(response.stream).arrayBuffer());
}

/** The review grid is enough for the browser; binary originals stay private. */
export function browserConversionResult(result: CompletedConversionResult | null) {
 if(!result)return null;
 const quote = result.quote as import('../src/types.js').Quote;
 return {...result, quote: {...quote, worksheets: [], promptRecipeBaseline: undefined,
   preservedTemplateWorkbook: quote.preservedTemplateWorkbook ? {...quote.preservedTemplateWorkbook,transformedXlsxBase64: '', operations: [], patches: []} : undefined,
 }};
}

export async function resumePersistentConversionJob(id:string) {
 const job=await getPersistentConversionJob(id);
 if(!job)throw Error('Saved job not found.');
 if(job.status!=='failed')return job;
 const checkpoint=await readRecipeCheckpoint(id);
 if(checkpoint?.executions.some(e=>e.status==='needs_review'||e.status==='partially_applied'))throw Error('This job needs a prompt or source-data review before it can continue.');
 await updatePersistentConversionJob(id,{status:'queued',error:undefined});
 try { await dispatchGitHubWorker(id); }
 catch(error){await updatePersistentConversionJob(id,{status:'failed',error:(error as Error).message});throw error;}
 return (await getPersistentConversionJob(id))!;
}
