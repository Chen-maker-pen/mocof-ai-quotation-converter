import {area2Structure} from './area2Structure.js';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {readTemplateWorkbook} from './templateWorkbook.js';
import {shiftRowReferences} from './templateRows.js';
// Source-specific, user-approved deletion. Preserve all unrelated ZIP parts.
export async function normalizeArea2(raw:Buffer){
const before=await readTemplateWorkbook(raw), name=before[0].name;
// A normal two-room workbook needs no destructive normalization.
if(/合计/.test(String(before[0].cells.A9?.value))){area2Structure(before[0]);return raw;}
// Retain the previously approved zero Other-row normalization.
if(before[0].cells.B8?.value!=='其他'||!String(before[0].cells.A10?.value).includes('合计'))throw Error('Area 2 requires two priced rooms. The uploaded summary has a different structure.');
assert.equal(before[0].cells.B8.value,'其他');
for(const c of ['D','E','F','G','H'])assert.equal(before[0].cells[c+'8'].value,0);
const zip=await JSZip.loadAsync(raw), original=await JSZip.loadAsync(raw);
const target='xl/worksheets/sheet1.xml';
let xml=await zip.file(target)!.async('string');
assert.ok(!/<(?:f|tableParts|legacyDrawing|oleObjects|controls|extLst|pane)\b/.test(xml));
const shift=(s:string)=>shiftRowReferences(s,name,{kind:'insert_rows',sheetName:name,beforeRow:9,count:-1});
// Other sheets contain local formulas only; no dependencies on the removed row.
for(const sheet of before.slice(1))for(const c of Object.values(sheet.cells))if(c.formula)assert.ok(!c.formula.includes('!'));
assert.ok(!(await zip.file('xl/workbook.xml')!.async('string')).includes('<definedName'));
xml=xml.replace(/<row\b[^>]*\br="8"[^>]*>[\s\S]*?<\/row>/, '');
assert.ok(!/<row\b[^>]*\br="8"/.test(xml));
xml=xml.replace(/<mergeCells\b[^>]*>([\s\S]*?)<\/mergeCells>/,(_,body)=>{
 const kept=[...body.matchAll(/<mergeCell\b[^>]*ref="([A-Z]+)(\d+):([A-Z]+)(\d+)"[^>]*\/>/g)].filter(m=>{
  if(Number(m[2])===8&&Number(m[4])===8)return false;
  assert.ok(!(Number(m[2])<=8&&Number(m[4])>=8),'Merge crosses deleted row');return true;
 });return `<mergeCells count="${kept.length}">${kept.map(m=>m[0]).join('')}</mergeCells>`;
});
xml=xml.replace(/<row\b[^>]*>/g,t=>t.replace(/\br="(\d+)"/,(_,r)=>`r="${Number(r)>8?Number(r)-1:r}"`));
xml=xml.replace(/<[^!?/][^>]*>/g,t=>t.replace(/\b(r|ref|sqref|activeCell|topLeftCell)="([^"]*)"/g,(all,k,v)=>k==='r'&&!/^<c\b/.test(t)?all:`${k}="${shift(v)}"`));
assert.ok(!xml.includes('<rowBreaks'),'Review page breaks before deleting');
zip.file(target,xml);
const rel=await zip.file('xl/worksheets/_rels/sheet1.xml.rels')!.async('string');
for(const m of rel.matchAll(/<Relationship\b[^>]*Target="([^"]+)"[^>]*>/g)){
 const part='xl/'+m[1].replace(/^\.\.\//,'');assert.ok(part.startsWith('xl/drawings/'));
 let drawing=await zip.file(part)!.async('string');
 for(const a of drawing.matchAll(/<xdr:twoCellAnchor\b[^>]*>([\s\S]*?)<\/xdr:twoCellAnchor>/g)){
  const rows=[...a[1].matchAll(/<xdr:row>(\d+)<\/xdr:row>/g)].map(x=>Number(x[1]));
  assert.ok(rows.length===2 && !(rows[0]<=7&&rows[1]>=7),'Image intersects deleted row');
 }
 drawing=drawing.replace(/(<(?:\w+:)?row>)(\d+)(<\/(?:\w+:)?row>)/g,(_,a,r,b)=>a+(Number(r)>7?Number(r)-1:r)+b);
 zip.file(part,drawing);
}
const output=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}), after=await readTemplateWorkbook(output);
for(const [a,c]of Object.entries(before[0].cells)){
 const r=Number(a.match(/\d+$/)![0]);if(r===8)continue;
 const dest=a.replace(/\d+$/,String(r>8?r-1:r));assert.deepEqual(after[0].cells[dest],{...c,address:dest,row:r>8?r-1:r},dest);
}
for(let i=1;i<before.length;i++)assert.deepEqual(after[i],before[i]);
const changed=[];
for(const p of Object.keys(original.files)){if(original.files[p].dir)continue;
 if(!(await original.files[p].async('nodebuffer')).equals(await zip.files[p].async('nodebuffer')))changed.push(p);
 if(p.startsWith('xl/media/'))assert.deepEqual(await original.files[p].async('nodebuffer'),await zip.files[p].async('nodebuffer'));
}
area2Structure(after[0]);
return output;
}
