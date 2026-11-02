import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRateSnapshot} from '../server/exchange.js';
test('live rate fails closed, validates dates and currencies, then snapshots real feed metadata',async()=>{
 const original=globalThis.fetch;let calls=0;
 try{
  globalThis.fetch=async()=>{throw Error('offline');};
  await assert.rejects(createRateSnapshot('MYR'),/offline/);
  const data={result:'success',base_code:'CNY',time_last_update_unix:Math.floor(Date.now()/1000),rates:{MYR:.61,SGD:.18,USD:.14}};
  for(const bad of [{...data,rates:{...data.rates,MYR:0}},{...data,base_code:'USD'},{...data,time_last_update_unix:1}]){
   globalThis.fetch=async()=>new Response(JSON.stringify(bad));
   await assert.rejects(createRateSnapshot('MYR'));
  }
  globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify(data));};
  const a=await createRateSnapshot('MYR'),b=await createRateSnapshot('MYR');
  assert.equal(a.rate,.61);assert.equal(a.isLocked,true);assert.equal(a.source,'https://www.exchangerate-api.com');
  assert.equal(a.rateDate,new Date(data.time_last_update_unix*1000).toISOString());assert.deepEqual(a,b);assert.equal(calls,1);
 }finally{globalThis.fetch=original;}
});
