/** Shared server-side configuration; the default passed the account's live test. */
export function getGeminiModel(env: NodeJS.ProcessEnv = process.env): string {
  return env.GEMINI_MODEL?.trim() || 'gemini-3.6-flash';
}

export function geminiFailure(error: unknown): Error {
  const status = Number((error as any)?.status || (error as any)?.code);
  // Provider error objects may include request bodies, headers, or URLs.
  // Do not persist/log them in public Actions runs or customer job records.
  return new Error(`Gemini request failed${Number.isInteger(status) && status >= 400 && status <= 599 ? ` (HTTP ${status})` : ''}; model ${getGeminiModel()}. No AI conversion was completed. Check the model, credentials, quota and retry the job.`);
}

export function requireExtractionItems(text: string | undefined): { items: any[]; exceptions?: any[] } {
  const parsed = JSON.parse(text || '{}');
  if (!parsed || !Array.isArray(parsed.items) || (parsed.exceptions !== undefined && !Array.isArray(parsed.exceptions))) {
    throw new Error('Gemini returned an invalid extraction response.');
  }
  return parsed;
}
