/**
 * GitHub Actions conversion worker.
 *
 * Vercel only queues a job and stores its source in private Blob storage.
 * This worker has a longer execution window to run the selected Area recipe,
 * Gemini translation/recipe steps, and workbook preservation safely.
 */
import 'dotenv/config';

import { db } from '../server/db.js';
import { createRateSnapshot } from '../server/exchange.js';
import { convertSupplierWorkbook } from '../server.js';
import {
  getPersistentConversionJob,
  persistCompletedConversion,
  readSourceForWorker,
  updatePersistentConversionJob,
} from '../server/persistentJobs.js';
import { Project, Quote } from '../src/types.js';

function createInitialProjectAndQuote(input: Record<string, unknown>) {
  const now = new Date().toISOString();
  const projectId = `proj-${Date.now()}`;
  const quoteId = `quote-${Date.now()}`;
  const currency = String(input.currency || 'MYR') as Quote['currency'];
  const quote: Quote = {
    id: quoteId,
    projectId,
    versionNumber: 1,
    versionLabel: 'v1.0-Initial',
    status: 'Processing',
    currency,
    exchangeRate: createRateSnapshot(currency),
    worksheets: [],
    supplementaryItems: [],
    wholeHouseTotals: {
      cabinetProductsCents: 0, lfProductsCents: 0, customDoorProductsCents: 0,
      wallPanelProductsCents: 0, kitchenVanityProductsCents: 0, supplementaryItemsCents: 0,
      subtotalCents: 0, discountCents: 0, taxPercent: 6, taxCents: 0, grandTotalCents: 0,
      sourceReconciliationTotalCNYCents: 0, sourceReconciliationConvertedMYRCents: 0,
      reconciliationDifferenceCents: 0, reconciled: true,
    },
    termsAndConditions: db.getConversionProfile().termsAndConditions,
    createdBy: 'MOCOF GitHub Actions worker',
    createdAt: now,
    updatedAt: now,
  };
  const project: Project = {
    id: projectId,
    name: String(input.name || 'New MOCOF Renovation Project'),
    customerName: String(input.customerName || 'Valued Customer'),
    customerPhone: String(input.customerPhone || ''),
    customerEmail: String(input.customerEmail || ''),
    projectAddress: String(input.projectAddress || ''),
    quotationNumber: `MOC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    status: 'Processing',
    currency,
    createdAt: now,
    updatedAt: now,
    currentQuoteId: quoteId,
    totalMYRCents: 0,
  };
  return { project, quote };
}

async function main() {
  const jobId = String(process.env.MOCOF_JOB_ID || '').trim();
  if (!jobId) throw new Error('MOCOF_JOB_ID is required.');

  const job = await getPersistentConversionJob(jobId);
  if (!job) throw new Error(`Conversion job ${jobId} was not found.`);
  if (job.status === 'completed') return;

  await updatePersistentConversionJob(jobId, {
    status: 'processing',
    attempt: job.attempt + 1,
    workerStartedAt: new Date().toISOString(),
    error: undefined,
  });

  try {
    const source = await readSourceForWorker(job);
    const { project, quote } = createInitialProjectAndQuote(job.input.projectData as Record<string, unknown>);
    // This local worker database is used only while constructing the result.
    // The completed result itself is persisted in Vercel Blob for the browser.
    db.createProject(project);
    db.saveQuote(quote);
    db.addAuditLog({
      projectId: project.id,
      quoteId: quote.id,
      action: 'PROJECT_CREATED',
      performedBy: 'MOCOF GitHub Actions worker',
      details: `Started persistent conversion ${jobId}.`,
    });

    const result = await convertSupplierWorkbook(
      quote,
      job.input.source.originalFileName,
      source,
      Number(job.input.projectData.selectedArea),
      Number(job.input.projectData.customerSqft),
      Number(job.input.projectData.customerBudget),
    );
    const output = result.quote?.preservedTemplateWorkbook;
    await persistCompletedConversion(jobId, result, output?.transformedXlsxBase64
      ? {
          buffer: Buffer.from(output.transformedXlsxBase64, 'base64'),
          outputFileName: output.outputFileName || `MOCOF_Quotation_${project.quotationNumber}.xlsx`,
        }
      : undefined);
    console.log(`MOCOF conversion completed: ${jobId}`);
  } catch (error: any) {
    const message = error?.message || 'Background conversion failed.';
    await updatePersistentConversionJob(jobId, { status: 'failed', error: message });
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
