import JSZip from 'jszip';
import {createPreservedTemplateWorkbook,readTemplateWorkbook} from './templateWorkbook.js';
import {spaceQuotation} from './quotationSpacing.js';
export async function correctArea3(raw:Buffer,filename:string){
const prior=await readTemplateWorkbook(raw),sheetName=prior[0].name;
if(!String(prior[0].cells.A37?.value).includes('Master Bedroom')||!String(prior[0].cells.A72?.value).includes('Living and Dining')||!String(prior[0].cells.A110?.value).includes('卫生间'))throw Error('Area 3 review currently supports the validated three-room source layout only. No guessed row mapping was applied.');
const formulas:Record<string,string>={},values:Record<string,number|string>={};
const col=(v:string)=>[...v].reduce((n,ch)=>n*26+ch.charCodeAt(0)-64,0);
const covered=(address:string)=>prior[0].mergedRanges.some(range=>{
 const [start,end=start]=range.split(':');
 const a=/^([A-Z]+)(\d+)$/.exec(start)!,b=/^([A-Z]+)(\d+)$/.exec(end)!,c=/^([A-Z]+)(\d+)$/.exec(address)!;
 return address!==start&&col(c[1])>=col(a[1])&&col(c[1])<=col(b[1])&&+c[2]>=+a[2]&&+c[2]<=+b[2];
});

let skippedMerged=0,skippedHeadings=0;
for(let row=40;row<=222;row++)for(const [target,source,factor] of [['I','H','H'],['J','I','I']]){
 const address=target+row;
 if(covered(address)){skippedMerged++;continue;}
 if(/price/i.test(String(prior[0].cells[address]?.value??''))){skippedHeadings++;continue;}
 const sourceAddress=source+row;
 const v=sourceAddress in values?values[sourceAddress]:prior[0].cells[sourceAddress]?.value;
 formulas[address]=`IF(ISNUMBER(${sourceAddress}),${sourceAddress}${target==='I'?'':'*I$2'},"")`;
 values[address]=typeof v==='number'?v*(target==='I'?1:Number(prior[0].cells.I2.value)):'';
}
const set=(a:string,v:number|string,f?:string)=>{values[a]=v;if(f)formulas[a]=f;};
for(const [r,total]of [[7,70],[8,108],[9,131]])for(const c of ['H','I','J'])set(c+r,Number(c==='H'?prior[0].cells[c+total].value:values[c+total]),c+total);
set('H10','');set('B9','卫生间//Vanity');
for(const c of ['D','E','H','I','J']){
 const total=Array.from({length:9},(_,i)=>values[c+(i+7)]??prior[0].cells[c+(i+7)]?.value).reduce<number>((a,v)=>a+(typeof v==='number'?v:0),0);
 set(c+'16',total,`SUM(${c}7:${c}15)`);
}
for(const c of ['F','G','H','I','J'])set(c+'35',Number(values[c+'16']??prior[0].cells[c+'16'].value)+Number(prior[0].cells[c+'34'].value),`${c}16+${c}34`);
set('G4',Math.min(...['F','G','I','J'].map(c=>Number(values[c+'35'])))/Number(prior[0].cells.F4.value),'MIN(F35,G35,I35,J35)/F4');
set('H4',Number(values.J35)/Number(prior[0].cells.F4.value),'J35/F4');
set('J2',Number(prior[0].cells.I2.value),'I2');set('J3',Number(prior[0].cells.H3.value));set('J4',Number(values.H4),'H4');

// Approved supplementary rule: customer sqft times rate; payable factor remains editable I3.
for(let r=20;r<=33;r++){
 set('E'+r,Number(prior[0].cells.F4.value),'$F$4');
}
set('F10',Math.max(0,Number(values.E16)-20)*1999,'MAX(0,E16-20)*1999');
set('G10',Math.max(0,Number(values.E16)-24)*1999,'MAX(0,E16-24)*1999');
set('G12',Math.max(0,Number(values.D16)-6)*650,'MAX(0,D16-6)*650');
for(const [c,base]of [['F',49800],['G',79800]] as const){
 const sum=Array.from({length:9},(_,i)=>values[c+(i+7)]??prior[0].cells[c+(i+7)]?.value).reduce<number>((a,v)=>a+(typeof v==='number'?v:0),0);
 set(c+'16',base+sum,`SUM(${c}7:${c}15)+${base}`);set(c+'35',base+sum+Number(prior[0].cells[c+'34'].value),`${c}16+${c}34`);
}
set('G4',Math.min(...['F','G','I','J'].map(c=>Number(values[c+'35'])))/Number(prior[0].cells.F4.value),'MIN(F35,G35,I35,J35)/F4');
for(const [a,v]of Object.entries({A18:'Supplementary',A19:'No',B19:'Item',D19:'sqft/ per',E19:'Qty/ sqft',F19:'RM49,800.00',G19:'RM 79,800.00',I19:'Before Price',J19:'After Price',G2:'Payable factor',G3:'Supplementary factor'}))set(a,v);
const result=await createPreservedTemplateWorkbook(raw,filename,Object.entries(values).map(([address,value])=>({sheetName,address,value,...(formulas[address]?{formula:formulas[address]}:{}),promptNumber:'BASIC-PRICES-01'})));
const zip=await JSZip.loadAsync(Buffer.from(result.transformedXlsxBase64,'base64'));
let xml=await zip.file('xl/worksheets/sheet1.xml')!.async('string');
xml=xml.replace(/<col\b[^>]*\/>/g,tag=>{
 const min=Number(/min="(\d+)"/.exec(tag)?.[1]),max=Number(/max="(\d+)"/.exec(tag)?.[1]);
 if(min>8||max<8)return tag;
 const part=(a:number,b:number,hidden=false)=>tag.replace(/min="\d+"/,`min="${a}"`).replace(/max="\d+"/,`max="${b}"`).replace(/\s+hidden="[^"]*"/,'').replace('/>',hidden?' hidden="1"/>':'/>');
 return (min<8?part(min,7):'')+part(8,8,true)+(max>8?part(9,max):'');
});
zip.file('xl/worksheets/sheet1.xml',xml);
const output=await zip.generateAsync({type:'nodebuffer'}),after=await readTemplateWorkbook(output);
return spaceQuotation(output);
}
