import crypto from 'crypto';
import { get, put } from '@vercel/blob';
import { CurrencyCode, Project } from '../src/types.js';

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
  error?: string;
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
  const response = await fetch(`https://api.github.com/repos/${repository}/dispatches`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${process.env.GITHUB_DISPATCH_TOKEN!}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'mocof-quotation-converter',
    },
    body: JSON.stringify({
      event_type: 'mocof-conversion',
      client_payload: { jobId },
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
    cacheControlMaxAge: 60,
  });
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

  const repository = await dispatchGitHubWorker(id);
  job.githubDispatchAt = new Date().toISOString();
  job.githubRepository = repository;
  job.updatedAt = new Date().toISOString();
  await writeJson(jobPath(id), job);
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
) {
  const resultBlob = await writeJson(resultPath(jobId), result);
  const converted = transformedWorkbook
    ? await put(outputPath(jobId, transformedWorkbook.outputFileName), transformedWorkbook.buffer, {
      access: 'private', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', cacheControlMaxAge: 60 * 60 * 24 * 365,
    })
    : undefined;
  return updatePersistentConversionJob(jobId, {
    status: 'completed', completedAt: new Date().toISOString(), resultBlobUrl: resultBlob.url,
    convertedWorkbookBlobUrl: converted?.url,
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
    error: job.error,
  };
}
