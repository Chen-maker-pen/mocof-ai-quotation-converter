import type JSZip from 'jszip';
import path from 'node:path';
import {officialLogoPng} from './officialBrandAsset.js';
export interface BrandOperation {kind:'replace_logo';sheetName:string;promptNumber?:string}
export async function replaceTemplateLogo(zip:JSZip,sheetFile:string):Promise<Set<string>> {
 const relFile=`${path.posix.dirname(sheetFile)}/_rels/${path.posix.basename(sheetFile)}.rels`;
 const rels=await zip.file(relFile)?.async('string');
 const rel=rels?.match(/<Relationship\b[^>]*Type="[^"]*\/drawing"[^>]*>/)?.[0];
 const target=rel?.match(/Target="([^"]+)"/)?.[1];
 if(!target)throw Error('Source drawing relationship missing.');
 const drawingFile=path.posix.normalize(path.posix.join(path.posix.dirname(sheetFile),target));
 let drawing=await zip.file(drawingFile)!.async('string');
 const anchors=[...drawing.matchAll(/<xdr:oneCellAnchor\b[^>]*>[\s\S]*?<\/xdr:oneCellAnchor>/g)].filter(m=>/<xdr:col>0<\/xdr:col>/.test(m[0])&&/<xdr:row>0<\/xdr:row>/.test(m[0]));
 if(anchors.length!==1)throw Error('Cannot uniquely identify the source header logo.');
 const drawingRels=`${path.posix.dirname(drawingFile)}/_rels/${path.posix.basename(drawingFile)}.rels`;
 let relationships=await zip.file(drawingRels)!.async('string');
 const id='mocofOfficialLogo';
 if(relationships.includes(`Id="${id}"`))throw Error('Branding already applied.');
 const media='xl/media/mocof-official-logo.png';
 relationships=relationships.replace('</Relationships>',`<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/mocof-official-logo.png"/></Relationships>`);
 const anchor=anchors[0][0].replace(/r:embed="[^"]+"/,`r:embed="${id}"`).replace(/<xdr:ext cx="\d+" cy="\d+"\/>/, '<xdr:ext cx="3311904" cy="955357"/>');
 drawing=drawing.replace(anchors[0][0],anchor);
 zip.file(drawingFile,drawing);zip.file(drawingRels,relationships);zip.file(media,Buffer.from(officialLogoPng,'base64'));
 const changed=new Set([drawingFile,drawingRels,media]);
 let ct=await zip.file('[Content_Types].xml')!.async('string');
 if(!/Extension="png"/.test(ct)){ct=ct.replace('</Types>','<Default Extension="png" ContentType="image/png"/></Types>');zip.file('[Content_Types].xml',ct);changed.add('[Content_Types].xml');}
 return changed;
}

/** Formatting of the new quotation blocks; existing product geometry is untouched. */
export async function finishQuotationLayout(zip:JSZip,sheetFile:string):Promise<Set<string>> {
 let xml=await zip.file(sheetFile)!.async('string');
 const area2=/<c\b[^>]*\br="A17"[^>]*>[\s\S]*?<t[^>]*>Supplementary<\/t>[\s\S]*?<\/c>/.test(xml);
 let styles=await zip.file('xl/styles.xml')!.async('string');
 const get=(s:string,n:string)=>new RegExp(`\\b${n}="([^"]*)"`).exec(s)?.[1];
 const put=(s:string,n:string,v:string)=>new RegExp(`\\b${n}="[^"]*"`).test(s)?s.replace(new RegExp(`\\b${n}="[^"]*"`),`${n}="${v}"`):s.replace(/\s*\/?>$/,m=>` ${n}="${v}"${m}`);
 const fonts=[.../<fonts\b[^>]*>([\s\S]*?)<\/fonts>/.exec(styles)![1].matchAll(/<font\b[^>]*>[\s\S]*?<\/font>/g)].map(m=>m[0]);
 const xfs=[.../<cellXfs\b[^>]*>([\s\S]*?)<\/cellXfs>/.exec(styles)![1].matchAll(/<xf\b[^>]*?(?:\/>|>[\s\S]*?<\/xf>)/g)].map(m=>m[0]);
 const styleCache=new Map<string,number>();
 const format=(address:string,size:number,wrap:boolean)=>{
  const re=new RegExp(`<c\\b(?=[^>]*\\br="${address}")[^>]*>`);
  xml=xml.replace(re,tag=>{
   const old=Number(get(tag,'s')||0),key=`${old}/${size}/${wrap}`;let id=styleCache.get(key);
   if(id===undefined){
    let xf=xfs[old];let font=fonts[Number(get(xf,'fontId')||0)];
    font=font.replace(/<sz\b[^>]*\/>/,`<sz val="${size}"/>`);
    let fid=fonts.indexOf(font);if(fid<0){fid=fonts.length;fonts.push(font);}
    xf=xf.replace(/^<xf\b[^>]*>/,t=>put(put(t,'fontId',String(fid)),'applyAlignment','1'));
    const alignment=`<alignment horizontal="left" vertical="center" wrapText="${wrap?1:0}" shrinkToFit="${wrap?0:1}"/>`;
    if(/<alignment\b/.test(xf))xf=xf.replace(/<alignment\b[^>]*\/>/,alignment);
    else if(xf.endsWith('/>'))xf=xf.slice(0,-2)+'>'+alignment+'</xf>';else xf=xf.replace('</xf>',alignment+'</xf>');
    id=xfs.length;xfs.push(xf);styleCache.set(key,id);
   }return put(tag,'s',String(id));
  });
 };
 const merge=(range:string)=>{
  const [a,b]=range.split(':');const m=/([A-Z]+)(\d+)/.exec(a)!,n=/([A-Z]+)(\d+)/.exec(b)!;
  const existing=[...xml.matchAll(/<mergeCell\b[^>]*ref="([^"]+)"[^>]*\/>/g)];
  if(existing.some(x=>x[1]===range))return;
  for(let r=+m[2];r<=+n[2];r++)for(let c=m[1].charCodeAt(0);c<=n[1].charCodeAt(0);c++){
   const addr=String.fromCharCode(c)+r;if(addr===a)continue;
   const cell=new RegExp(`<c\\b(?=[^>]*\\br="${addr}")[^>]*?(?:/>|>[\\s\\S]*?</c>)`).exec(xml);
   if(cell&&/<(?:v|t|f)\b[^>]*>[^<]+/.test(cell[0]))throw Error(`Layout merge would overwrite ${addr}`);
  }
  xml=xml.replace(/<mergeCells\b[^>]*>([\s\S]*?)<\/mergeCells>/,(_,body)=>`<mergeCells count="${existing.length+1}">${body}<mergeCell ref="${range}"/></mergeCells>`);
 };
 const height=(row:number,h:number)=>{xml=xml.replace(new RegExp(`<row\\b(?=[^>]*\\br="${row}")[^>]*>`),t=>put(put(t,'ht',String(h)),'customHeight','1'));};
 format('E1',18,false);height(1,30);
 const titleRow=area2?17:18,headerRow=titleRow+1;
 merge(`A${titleRow}:J${titleRow}`);format(`A${titleRow}`,12,false);height(titleRow,24);
 for(let r=headerRow;r<=headerRow+14;r++){merge(`B${r}:C${r}`);format(`B${r}`,10,true);height(r,r===headerRow?30:36);}
 for(const r of [headerRow+15,headerRow+16]){merge(`A${r}:E${r}`);format(`A${r}`,11,true);height(r,32);}
 for(let r=7;r<=(area2?14:15);r++){format(`B${r}`,10,true);height(r,30);}
 const textRow=(text:string)=>{
  const found=[...xml.matchAll(/<c\b[^>]*\br="A(\d+)"[^>]*>[\s\S]*?<\/c>/g)].find(m=>m[0].includes(text));
  return found?Number(found[1]):undefined;
 };
 const me=area2?textRow('M&amp;E Work'):120;
 if(me!==undefined){
  const description=area2?me+9:212;
  for(const row of [description,description+1]){merge(`E${row}:H${row}`);format(`E${row}`,10,true);height(row,row===description?100:36);}
  merge(`E${me+8}:F${me+8}`);format(`E${me+8}`,10,true);height(me+8,100);
  format(`D${me+2}`,10,true);height(me+2,35);
 }
 const remarkRow=area2?textRow('Remark:'):133;
 if(remarkRow){format(`A${remarkRow}`,10,true);for(let r=remarkRow;r<=remarkRow+5;r++)height(r,60);}
 styles=styles.replace(/<fonts\b[^>]*>[\s\S]*?<\/fonts>/,`<fonts count="${fonts.length}">${fonts.join('')}</fonts>`).replace(/<cellXfs\b[^>]*>[\s\S]*?<\/cellXfs>/,`<cellXfs count="${xfs.length}">${xfs.join('')}</cellXfs>`);
 zip.file(sheetFile,xml);zip.file('xl/styles.xml',styles);return new Set([sheetFile,'xl/styles.xml']);
}
