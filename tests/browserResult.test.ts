import {test} from 'node:test';
import assert from 'node:assert/strict';
import {browserConversionResult} from '../server/persistentJobs.js';
test('completed API result excludes workbook binaries, source images and duplicate baselines',()=>{
 const result:any={project:{id:'project'},exceptions:[],parsedSheetNames:['Summary'],extractedImageCount:1,quote:{
  conversionJobId:'job-example',worksheets:[{image:'PRIVATE_IMAGE'}],promptRecipeBaseline:{secret:'PRIVATE_BASELINE'},
  workbookSheets:[{name:'Summary',cells:{J35:{value:120240}}}],
  preservedTemplateWorkbook:{transformedXlsxBase64:'PRIVATE_BINARY',patches:[],operations:[],sheetNames:['Summary']},
 }};
 const visible=browserConversionResult(result) as any;
 const text=JSON.stringify(visible);
 for(const secret of ['PRIVATE_BINARY','PRIVATE_IMAGE','PRIVATE_BASELINE'])assert.ok(!text.includes(secret));
 assert.equal(visible.quote.workbookSheets[0].cells.J35.value,120240);
 assert.equal(result.quote.preservedTemplateWorkbook.transformedXlsxBase64,'PRIVATE_BINARY');
});
