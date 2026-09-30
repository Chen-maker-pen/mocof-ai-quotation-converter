/** Transient provider overload must not turn into a fabricated conversion result.
 * Retry the same prompt without committing anything until one request succeeds. */
export async function withGeminiRetries<T>(request: () => Promise<T>, options: {
  sleep?: (ms: number) => Promise<void>; attempts?: number;
} = {}): Promise<T> {
  const sleep = options.sleep || (ms => new Promise(resolve => setTimeout(resolve, ms)));
  const attempts = options.attempts ?? 6;
  for (let attempt = 0; ; attempt++) {
    try { return await request(); }
    catch (error: any) {
      // Daily quota cannot recover through a short retry delay. Retain the
      // checkpoint and let the operator resolve quota/reset before resuming.
      if (/GenerateRequestsPerDay|requests per day|daily quota/i.test(String(error?.message || ''))) throw error;
      let status = Number(error?.status || error?.code || error?.response?.status);
      if (!Number.isFinite(status)) {
        try { status = Number(JSON.parse(error?.message || '{}')?.error?.code); } catch { /* No provider body logged. */ }
      }
      if (attempt + 1 >= attempts || ![429, 500, 502, 503, 504].includes(status)) throw error;
      await sleep(Math.min(240000, 15000 * 2 ** attempt));
    }
  }
}
