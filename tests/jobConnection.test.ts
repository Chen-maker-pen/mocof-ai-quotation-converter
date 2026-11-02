import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readJobResponse} from '../src/services/jobConnection.js';
const pause=async()=>{};
test('Safari Load failed recovers without replaying upload or dispatch',async()=>{
 let calls=0;
 const result=await readJobResponse('/api/conversion-jobs/test', (async(url,options)=>{
  assert.equal(url,'/api/conversion-jobs/test'); assert.equal(options?.method,undefined);
  if(++calls<3)throw new TypeError('Load failed');
  return new Response(JSON.stringify({job:{status:'failed',error:'Select Area 2'}}));
 }) as typeof fetch,pause);
 assert.equal(calls,3);assert.equal((await result.json()).job.error,'Select Area 2');
});
test('permanent connection loss is bounded and explains saved-job recovery',async()=>{
 let calls=0;await assert.rejects(readJobResponse('/job',(async()=>{calls++;throw new TypeError('Load failed');}) as typeof fetch,pause),/Check saved conversion/);assert.equal(calls,5);
});
test('status retries transient HTTP failure but returns validation/auth failures immediately',async()=>{
 let calls=0;const result=await readJobResponse('/job',(async()=>new Response('',{status:++calls===1?503:200})) as typeof fetch,pause);assert.equal(result.status,200);assert.equal(calls,2);
 calls=0;const invalid=await readJobResponse('/job',(async()=>{calls++;return new Response('',{status:401});}) as typeof fetch,pause);assert.equal(invalid.status,401);assert.equal(calls,1);
});
