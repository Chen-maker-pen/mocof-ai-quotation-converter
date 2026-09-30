import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withGeminiRetries } from '../server/geminiRetry.js';
test('provider overload retries the same operation with backoff then returns actual success', async () => {
  let calls = 0;
  const delays: number[] = [];
  const result = await withGeminiRetries(async () => {
    if (++calls < 3) throw new Error(JSON.stringify({ error: { code: 503, message: 'Overloaded' } }));
    return 'actual response';
  }, { sleep: async delay => { delays.push(delay); } });
  assert.equal(result, 'actual response');
  assert.equal(calls, 3);
  assert.deepEqual(delays, [15000, 30000]);
});
test('authentication and malformed responses fail immediately; persistent overload remains a failure', async () => {
  let calls = 0;
  await assert.rejects(withGeminiRetries(async () => { calls++; throw { status: 401 }; }, { sleep: async () => assert.fail('Must not retry authentication') }));
  assert.equal(calls, 1);
  calls = 0;
  await assert.rejects(withGeminiRetries(async () => { calls++; throw { status: 503 }; }, { attempts: 3, sleep: async () => {} }));
  assert.equal(calls, 3);
});
test('exhausted daily quota stops immediately rather than consuming repeated attempts', async()=>{
  let calls=0;
  await assert.rejects(withGeminiRetries(async()=>{calls++;throw new Error(JSON.stringify({error:{code:429,details:[{quotaId:'GenerateRequestsPerDayPerProjectPerModel-FreeTier'}]}}));},{sleep:async()=>assert.fail('Daily quota must not retry')}));
  assert.equal(calls,1);
});
