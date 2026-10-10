import {area2Structure,area2WorkRows} from './area2Structure.js';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {createPreservedTemplateWorkbook,readTemplateWorkbook} from './templateWorkbook.js';
export async function layoutArea2(raw:Buffer){
const before=await readTemplateWorkbook(raw),s=before[0],ops:any[]=[];
const layout=area2Structure(s,true),work=area2WorkRows(s),me=work.start;
for(const [address,value]of Object.entries({G2:'Payable factor',G3:'Supplementary factor',J2:'Budget (MYR)',J3:s.cells.H3.value,I4:s.cells.H4.value,A18:'No',B18:'Item',D18:'sqft/ per',E18:'Qty/ sqft',F18:'RM49,800.00',G18:'RM79,800.00'}))ops.push({sheetName:s.name,address,value});
ops.push({sheetName:s.name,address:'I4',value:s.cells.H4.value,formula:'H4'});
for(let r=19;r<=32;r++)ops.push({sheetName:s.name,address:'E'+r,value:s.cells.F4.value,formula:'$F$4'});
for(const range of ['F7:J15','F19:J34',`H${layout.detailStart}:J${layout.detailEnd}`,'J3','I4'])ops.push({kind:'format_cells',sheetName:s.name,range,numberFormat:'"RM"#,##0.00'});
for(const range of ['I2','I3'])ops.push({kind:'format_cells',sheetName:s.name,range,numberFormat:'0%'});
const p=await createPreservedTemplateWorkbook(raw,'Yang.xlsx',ops),z=await JSZip.loadAsync(Buffer.from(p.transformedXlsxBase64,'base64'));
let xml=await z.file('xl/worksheets/sheet1.xml')!.async('string');
// Keep source H and its dependencies; only its visual column is hidden.
xml=xml.replace(/<col\b[^>]*\/>/g,t=>{
 const min=Number(/min="(\d+)"/.exec(t)?.[1]),max=Number(/max="(\d+)"/.exec(t)?.[1]);let out='';
 for(let c=min;c<=max;c++){
 let v=t.replace(/min="\d+"/,`min="${c}"`).replace(/max="\d+"/,`max="${c}"`);
 if(c===8)v=v.replace(/\s+hidden="[^"]*"/,'').replace('/>',' hidden="1"/>');
 out+=v;
 }return out;
});
// Apply the established navy section title and gray header styles.
const st=(a:string)=>new RegExp(`<c\\b(?=[^>]*\\br="${a}")[^>]*\\bs="(\\d+)"`).exec(xml)?.[1];
const title=st('A5'),head=st('A6');
xml=xml.replace(/<c\b[^>]*>/g,t=>{
 const a=/\br="([A-Z]+)(\d+)"/.exec(t);if(!a)return t;const r=+a[2];const style=r===17||r===me?title:r===18||r===me+1||r===me+6?head:undefined;
 return style?(/\bs="\d+"/.test(t)?t.replace(/\bs="\d+"/,`s="${style}"`):t.replace(/\s*\/?>(?=$)/,m=>` s="${style}"${m}`)):t;
});
// Begin the existing remarks block on a fresh printed page.
xml=xml.replace(/<rowBreaks\b[^>]*>[\s\S]*?<\/rowBreaks>/,'');
const breaks=`<rowBreaks count="1" manualBreakCount="1"><brk id="${layout.remarks-1}" min="0" max="16383" man="1"/></rowBreaks>`;
xml=xml.replace(/(?=<(?:colBreaks|customProperties|cellWatches|ignoredErrors|smartTags|drawing|legacyDrawing|extLst)\b|<\/worksheet>)/,breaks);
const body=st('B19');
// Materialize blank table cells so borders are visible without shifting content.
for(const r of [me,me+1,me+2,me+6,me+8]){
 const re=new RegExp(`<row\\b(?=[^>]*\\br="${r}")[^>]*>[\\s\\S]*?<\\/row>`);
 xml=xml.replace(re,row=>{
 const style=r===me?title:[me+1,me+6].includes(r)?head:body;
 const opening=row.slice(0,row.indexOf('>')+1).replace(/\s(?:ht|customHeight)="[^"]*"/g,'').replace('>',` ht="${r===me+8?100:r===me+2?48:26}" customHeight="1">`);
 const cells=new Map([...row.matchAll(/<c\b[^>]*\br="([A-Z]+)\d+"[^>]*?(?:\/>|>[\s\S]*?<\/c>)/g)].map(m=>[m[1],m[0]]));
 return opening+Array.from({length:10},(_,i)=>{
 const col=String.fromCharCode(65+i);let cell=cells.get(col)||`<c r="${col}${r}"/>`;
 return cell.replace(/^<c\b[^>]*>/,tag=>/\bs="\d+"/.test(tag)?tag.replace(/\bs="\d+"/,`s="${style}"`):tag.replace(/\/?>(?=$)/,m=>` s="${style}"${m}`));
 }).join('')+'</row>';
 });
}
const added=[`A${me}:J${me}`,`A${me+1}:C${me+1}`,`E${me+1}:F${me+1}`,`G${me+1}:J${me+1}`,`A${me+2}:C${me+2}`,`E${me+2}:F${me+2}`,`G${me+2}:J${me+2}`,`A${me+6}:C${me+6}`,`E${me+6}:F${me+6}`,`G${me+6}:J${me+6}`,`A${me+8}:C${me+8}`,`G${me+8}:J${me+8}`];
xml=xml.replace(/<mergeCells\b[^>]*>([\s\S]*?)<\/mergeCells>/,(_,b)=>{
 const body=b+added.filter(r=>!b.includes(`ref="${r}"`)).map(r=>`<mergeCell ref="${r}"/>`).join('');
 return `<mergeCells count="${[...body.matchAll(/<mergeCell\b/g)].length}">${body}</mergeCells>`;
});
z.file('xl/worksheets/sheet1.xml',xml);const out=await z.generateAsync({type:'nodebuffer'});
const after=await readTemplateWorkbook(out);
for(const a of ['F34','G34','I34','J34'])assert.deepEqual(after[0].cells[a],s.cells[a]);
for(let i=1;i<before.length;i++)assert.deepEqual(after[i],before[i]);
return out;
}
