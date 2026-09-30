import fs from 'node:fs/promises';
import {randomBytes,createHash,createCipheriv,publicEncrypt} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {gunzipSync} from 'node:zlib';
import {put} from '@vercel/blob';
import assert from 'node:assert/strict';
import {getPersistentConversionJob,readSourceForWorker,readCompletedConversionResult,readJobExport,browserConversionResult} from '../server/persistentJobs.js';
const input=JSON.parse(gunzipSync(Buffer.from(process.env.MOCOF_RELEASE_TEST_INPUT || '','base64')).toString());
const report:any={status:'starting'};
try {
 const source=await getPersistentConversionJob(input.sourceJobId);
 assert.ok(source,'Private source job missing');
 const bytes=await readSourceForWorker(source);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),input.sourceSha256);
 const id=`job-${Date.now()}-${randomBytes(6).toString('hex')}`;
 console.log(`::add-mask::${id}`);
 const now=new Date().toISOString();
 const customer=input.customer;
 const projectData={selectedArea:3,customerName:customer.name,projectAddress:customer.address,customerSqft:customer.sqft,customerBudget:customer.budget,currency:customer.currency,quotationType:customer.quotationType};
 await put(`mocof/jobs/${id}.json`,JSON.stringify({id,status:'queued',createdAt:now,updatedAt:now,attempt:0,input:{projectData,source:source.input.source}}),{access:'private',addRandomSuffix:false,contentType:'application/json'});
 report.jobId=id;
 await promisify(execFile)(process.execPath,['--import','tsx','worker/githubAction.ts'],{env:{...process.env,MOCOF_JOB_ID:id,MOCOF_BACKGROUND_WORKER:'true'},timeout:1200000,maxBuffer:1024*1024});
 const job=await getPersistentConversionJob(id);
 report.jobStatus=job?.status;
 if(job?.status!=='completed')throw Error(job?.error || 'Worker did not complete');
 const result=await readCompletedConversionResult(job);
 const quote:any=result?.quote;
 assert.equal(quote.documentedPromptExecutions.length,33);
 assert.ok(quote.documentedPromptExecutions.every((e:any)=>['applied','skipped'].includes(e.status)));
 assert.equal(quote.preservedTemplateWorkbook.originalSha256,input.sourceSha256);
 assert.equal(quote.wholeHouseTotals.grandTotalCents,12024000);
 report.browserBytes=Buffer.byteLength(JSON.stringify(browserConversionResult(result)));
 assert.ok(report.browserBytes<4000000);
 const xlsx=await readJobExport(job,'xlsx'),pdf=await readJobExport(job,'pdf');
 assert.equal(pdf.subarray(0,5).toString(),'%PDF-');
 assert.equal(createHash('sha256').update(xlsx).digest('hex'),quote.preservedTemplateWorkbook.transformedSha256);
 report.xlsx=xlsx.toString('base64');report.pdf=pdf.toString('base64');report.executions=quote.documentedPromptExecutions;
 report.status='passed';
 console.log('PASS: actual worker, 33 ordered sections, private XLSX/PDF exports and bounded browser result.');
} catch(error:any){report.status='failed';report.error=error.message;process.exitCode=1;console.error('Release acceptance failed; details are in the encrypted report.');}
finally {
 const key=randomBytes(32),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
 const data=Buffer.concat([cipher.update(JSON.stringify(report)),cipher.final()]);
 await fs.writeFile('private-acceptance.enc',JSON.stringify({key:publicEncrypt({key:input.reportPublicKey,oaepHash:'sha256'},key).toString('base64'),iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),data:data.toString('base64')}));
}
