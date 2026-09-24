import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getGeminiModel, geminiFailure, requireExtractionItems } from '../server/geminiConfig.js';

test('worker uses available model by default and honors explicit model overrides', () => {
  assert.equal(getGeminiModel({}), 'gemini-3.6-flash');
  assert.equal(getGeminiModel({ GEMINI_MODEL: '  ' }), 'gemini-3.6-flash');
  assert.equal(getGeminiModel({ GEMINI_MODEL: ' custom-model ' }), 'custom-model');
});
test('empty/malformed provider output cannot be reported as completed conversion', () => {
  for (const input of [undefined, '', '{}', 'not-json', '{"items":{}}', '{"items":[],"exceptions":{}}'])
    assert.throws(() => requireExtractionItems(input));
  assert.deepEqual(requireExtractionItems('{"items":[],"exceptions":[]}'), { items: [], exceptions: [] });
});
test('provider failure diagnostics retain HTTP status without leaking provider payload', () => {
  const result = geminiFailure({ status: 404, message: 'private-value', request: { key: 'private-key' } });
  assert.match(result.message, /HTTP 404/);
  assert.doesNotMatch(result.message, /private/);
});
