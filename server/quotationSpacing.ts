import JSZip from 'jszip';
export async function spaceQuotation(bytes:Buffer){
 const zip=await JSZip.loadAsync(bytes);let xml=await zip.file('xl/worksheets/sheet1.xml')!.async('string'),styles=await zip.file('xl/styles.xml')!.async('string');
 const xfs=[.../<cellXfs\b[^>]*>([\s\S]*?)<\/cellXfs>/.exec(styles)![1].matchAll(/<xf\b[^>]*?(?:\/>|>[\s\S]*?<\/xf>)/g)].map(m=>m[0]);
 const cache=new Map<string,number>();
 const styleId=(addr:string)=>Number(new RegExp(`<c\\b(?=[^>]*\\br="${addr}")[^>]*\\bs="(\\d+)"`).exec(xml)?.[1]||0);
 const titleStyle=styleId('A5'),headingStyle=styleId('A6');
 xml=xml.replace(/<c\b[^>]*>/g,tag=>{
  const addr=/\br="([A-Z]+)(\d+)"/.exec(tag);if(!addr)return tag;
  const col=addr[1],r=Number(addr[2]);
  if(!(r===18||r===19||(r>=20&&r<=33&&col==='B')||(r>=40&&r<=119&&['D','E','F'].includes(col))))return tag;
  let old=Number(/\bs="(\d+)"/.exec(tag)?.[1]||0);if(r===18)old=titleStyle;if(r===19)old=headingStyle;
  const key=old+':'+(r<=19?'center':'wrap');let id=cache.get(key);
  if(id===undefined){let xf=xfs[old].replace(/<alignment\b[^>]*\/>/g,'');const alignment=`<alignment horizontal="${r<=19?'center':'left'}" vertical="center" wrapText="1"/>`;
   xf=xf.endsWith('/>')?xf.slice(0,-2)+'>'+alignment+'</xf>':xf.replace('</xf>',alignment+'</xf>');id=xfs.length;xfs.push(xf);cache.set(key,id);}
  return /\bs="\d+"/.test(tag)?tag.replace(/\bs="\d+"/,`s="${id}"`):tag.replace(/>$/,` s="${id}">`);
 });
 xml=xml.replace(/<row\b[^>]*>/g,tag=>{const r=Number(/\br="(\d+)"/.exec(tag)?.[1]);const min=[16,34,35].includes(r)?54:r===18?30:r===19?36:r>=20&&r<=33?60:r>=40&&r<=119?84:0;if(!min)return tag;
 const old=Number(/\bht="([^"]+)"/.exec(tag)?.[1]||0);tag=tag.replace(/\s(?:ht|customHeight)="[^"]*"/g,'');return tag.replace(/>$/,` ht="${Math.max(old,min)}" customHeight="1">`);});
 // Widen the visible price columns without shifting cell addresses or unhiding source H.
 xml=xml.replace(/<col\b[^>]*\/>/g,tag=>{
  const min=Number(/min="(\d+)"/.exec(tag)?.[1]),max=Number(/max="(\d+)"/.exec(tag)?.[1]);
  if(!Number.isFinite(min)||!Number.isFinite(max))return tag;
  let result='';for(let c=min;c<=max;c++){
   let part=tag.replace(/min="\d+"/,`min="${c}"`).replace(/max="\d+"/,`max="${c}"`);
   if([6,7,9,10].includes(c)){
    const width=Math.max(28,Number(/width="([^"]+)"/.exec(part)?.[1]||0));
    part=part.replace(/\s(?:width|customWidth)="[^"]*"/g,'').replace('/>',` width="${width}" customWidth="1"/>`);
   }result+=part;
  }return result;
 });
 styles=styles.replace(/<cellXfs\b[^>]*>[\s\S]*?<\/cellXfs>/,`<cellXfs count="${xfs.length}">${xfs.join('')}</cellXfs>`);
 zip.file('xl/worksheets/sheet1.xml',xml);zip.file('xl/styles.xml',styles);return zip.generateAsync({type:'nodebuffer'});
}
