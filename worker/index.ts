/**
 * Cloud Run entry point scaffold.
 *
 * It intentionally refuses jobs until the AreaRecipeExecutor is connected.
 * This protects customer quotations from the former generic conversion path.
 * QStash can retry safely because state is held in Vercel Blob, not memory.
 */
import express from 'express';
import { Receiver } from '@upstash/qstash';
import { getPersistentConversionJob, updatePersistentConversionJob } from '../server/persistentJobs.js';

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'MOCOF long-running conversion worker' }));

app.post('/jobs/convert', async (req, res) => {
  const jobId = String(req.body?.jobId || '');
  if (!jobId) return res.status(400).json({ error: 'jobId is required.' });
  try {
    if (process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY) {
      const receiver = new Receiver({ currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY, nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY });
      const signature = String(req.header('Upstash-Signature') || '');
      const valid = await receiver.verify({ signature, body: JSON.stringify(req.body), url: `${req.protocol}://${req.get('host')}${req.originalUrl}` });
      if (!valid) return res.status(401).json({ error: 'Invalid QStash signature.' });
    }
    const job = await getPersistentConversionJob(jobId);
    if (!job) return res.status(404).json({ error: 'Persistent job not found.' });
    await updatePersistentConversionJob(jobId, { status: 'processing', attempt: job.attempt + 1, workerStartedAt: new Date().toISOString(), error: undefined });
    // Deliberate safety gate: connect the approved AreaRecipeExecutor here.
    // Do NOT substitute the old generic worksheet builder, because it can
    // silently generate incorrect prices or change the supplier template.
    throw new Error('Worker scaffold is deployed but the approved AreaRecipeExecutor has not yet been connected. No customer quotation was changed.');
  } catch (error: any) {
    await updatePersistentConversionJob(jobId, { status: 'failed', error: error?.message || 'Worker failed.' }).catch(() => undefined);
    return res.status(500).json({ error: error?.message || 'Worker failed.' });
  }
});

const port = Number(process.env.PORT || 8080);
app.listen(port, '0.0.0.0', () => console.log(`MOCOF worker listening on ${port}`));
