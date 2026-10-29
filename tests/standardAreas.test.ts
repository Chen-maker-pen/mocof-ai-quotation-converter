import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import {runSourceRecipe} from '../server/sourceRecipe.js';
import {standardAreas,standardStepAction} from '../server/standardAreaPlanner.js';
import {standardAreaStructure,areaRows} from '../server/standardAreaStructure.js';
import {readTemplateWorkbook} from '../server/templateWorkbook.js';
import {officialAreaCatalog} from '../server/officialAreaCatalog.js';
const image='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==';
async function fixture(area:number){
 const book=new ExcelJS.Workbook(),s=book.addWorksheet('Supplier');
 for(let row=1;row<=area*8+30;row++)for(let col=1;col<=8;col++){const c=s.getCell(row,col);c.font={name:'Arial',size:11};c.border={bottom:{style:'thin'}};}
 for(let col=1;col<=8;col++)s.getColumn(col).width=20;
 s.mergeCells('A1:D4');s.mergeCells('E1:H1');s.getCell('E1').value='Supplier quotation';s.getCell('A5').value='全屋汇总';s.mergeCells('A5:H5');
 ['序号','空间','','柜体产品','配套产品','定制产品','快装产品','空间合计'].forEach((v,i)=>s.getCell(6,i+1).value=v);s.mergeCells('B6:C6');
 const sourceTotal=areaRows(area).rawTotal;
 for(let i=0;i<area;i++){
  const name=i%2?'其他':'Room '+(i+1),row=7+i,start=sourceTotal+2+i*8,amount=(i+1)*100;
  s.getCell('A'+row).value=i+1;s.getCell('B'+row).value=name;s.mergeCells(`B${row}:C${row}`);s.getCell('H'+row).value=amount;
  s.getCell('A'+start).value=name;s.mergeCells(`A${start}:H${start}`);
  s.getCell('A'+(start+1)).value='柜体表';s.mergeCells(`A${start+1}:H${start+1}`);
  ['序号','产品图片','组合','名称','型号','宽深高','数量','单价'].forEach((v,j)=>s.getCell(start+2,j+1).value=v);
  s.getCell('D'+(start+3)).value='柜体';s.getCell('H'+(start+3)).value=amount;
  s.getCell('A'+(start+6)).value='合计:';s.mergeCells(`A${start+6}:G${start+6}`);s.getCell('H'+(start+6)).value=amount;
 }
 s.getCell('A'+sourceTotal).value='合计:';s.mergeCells(`A${sourceTotal}:C${sourceTotal}`);s.getCell('H'+sourceTotal).value=area*(area+1)*50;
 const remarks=sourceTotal+2+area*8;s.getCell('A'+remarks).value='备注:';s.mergeCells(`A${remarks}:F${remarks+5}`);
 s.addImage(book.addImage({base64:image,extension:'png'}),{tl:{col:0,row:0},ext:{width:200,height:75}});
 book.addWorksheet('Untouched').getCell('A1').value='Preserve source';
 return Buffer.from(await book.xlsx.writeBuffer());
}
const customer={name:'Synthetic test',address:'Test',sqft:600,budget:100000,currency:'MYR',quotationType:'project' as const};
const rate={sourceCurrency:'CNY',targetCurrency:'MYR',rate:.6,rateDate:'2026-10-28',source:'Synthetic test rate'} as any;
for(let area=1;area<=10;area++)test(`Area ${area} identifies every ordered room independently`,async()=>{
 const s=(await readTemplateWorkbook(await fixture(area)))[0],layout=standardAreaStructure(s,area);
 assert.equal(layout.rooms.length,area);assert.equal(new Set(layout.rooms.map(x=>x.end)).size,area);
 if(area>1){s.cells.H8.value=999;assert.throws(()=>standardAreaStructure(s,area),/mismatch/);}
});
for(const area of standardAreas)test(`Area ${area} executes the complete official sequence and reconciles MYR totals`,async()=>{
 const recipe=officialAreaCatalog.find(x=>x.area===area)!;assert.ok(recipe);
 assert.equal(standardStepAction(area,recipe.steps.length),undefined);
 const raw=await fixture(area),result=await runSourceRecipe(raw,'arbitrary.xlsx',area,customer,{exchangeSnapshot:rate});
 const failed=result.executions.filter(x=>x.status==='needs_review');assert.deepEqual(failed.map(x=>[x.stepId,x.result]),[]);
 assert.deepEqual(result.executions.map(x=>x.stepId),recipe.steps.map(x=>x.id));
 const bytes=Buffer.from(result.preserved.transformedXlsxBase64,'base64');
 const sheet=(await readTemplateWorkbook(bytes))[0],r=areaRows(area),expected=area*(area+1)*50*.6;
 assert.ok(Math.abs(Number(sheet.cells['I'+r.total].value)-expected)<.00001);
 assert.ok(Math.abs(Number(sheet.cells['J'+r.grand].value)-(expected*.9+126960))<.00001);
 for(let row=r.first;row<=r.last;row++)assert.equal(sheet.cells['J'+row].formula,`I${row}*$I$3`);
 assert.equal(sheet.cells['F'+r.extra].value,0);
 const a=await JSZip.loadAsync(raw),b=await JSZip.loadAsync(bytes);
 for(const path of Object.keys(a.files).filter(x=>!a.files[x].dir&&(x.startsWith('xl/media/')||x==='xl/worksheets/sheet2.xml')))assert.deepEqual(await b.file(path)!.async('nodebuffer'),await a.file(path)!.async('nodebuffer'));
});
