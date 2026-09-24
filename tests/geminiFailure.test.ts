import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { ConversionProfile } from '../src/types.js';

test('actual extraction service rejects provider 404 instead of returning fallback success', async () => {
  const previousFetch = globalThis.fetch;
  const previousKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'synthetic-test-key';
  let requests = 0;
  globalThis.fetch = async () => {
    requests++;
    return new Response(JSON.stringify({ error: { code: 404, status: 'NOT_FOUND', message: 'private-provider-detail' } }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  };
  try {
    const { processAiExtractionAndConversion } = await import('../server/geminiService.js');
    await assert.rejects(processAiExtractionAndConversion([[1, 'TEST', '衣柜']], {
      companyName: 'MOCOF', rules: {}, bossEditingRules: [], areaPromptRules: [],
    } as unknown as ConversionProfile), error => {
      assert.match((error as Error).message, /HTTP 404/);
      assert.doesNotMatch((error as Error).message, /private-provider-detail|synthetic-test-key/);
      return true;
    });
    assert.ok(requests > 0);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = previousKey;
  }
});
