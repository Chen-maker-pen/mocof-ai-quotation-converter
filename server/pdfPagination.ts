/** Add print-only page breaks at row boundaries outside vertically merged items.
 * A small safety margin accounts for spreadsheet font-width differences. */
export function paginateQuotation(xml:string):string {
 const attr=(tag:string,key:string)=>new RegExp(`\\b${key}="([^"]*)"`).exec(tag)?.[1];
 const rows=[...xml.matchAll(/<row\b[^>]*>/g)];
 const last=Math.max(1,...rows.map(m=>Number(attr(m[0],'r'))));
 const heights=new Map(rows.map(m=>[Number(attr(m[0],'r')),attr(m[0],'hidden')==='1'?0:Number(attr(m[0],'ht')||15)]));
 const margins=/<pageMargins\b[^>]*>/.exec(xml)?.[0]||'';
 const left=Number(attr(margins,'left')||.7),right=Number(attr(margins,'right')||.7),top=Number(attr(margins,'top')||.75),bottom=Number(attr(margins,'bottom')||.75);
 let width=0;
 for(const m of xml.matchAll(/<col\b[^>]*>/g))if(attr(m[0],'hidden')!=='1')width+=(Number(attr(m[0],'max'))-Number(attr(m[0],'min'))+1)*(Number(attr(m[0],'width')||8.43)*7+5)*.75;
 if(!width)return xml;
 const capacity=(841.89-(top+bottom)*72)*Math.max(1,width/(595.28-(left+right)*72))*.9;
 const blocked=new Set<number>();
 for(const m of xml.matchAll(/<mergeCell\b[^>]*ref="[A-Z]+(\d+):[A-Z]+(\d+)"/g))for(let r=Number(m[1]);r<Number(m[2]);r++)blocked.add(r);
 // Keep the three-row room/table heading with its first item.
 for(const m of xml.matchAll(/<row\b[^>]*\br="(\d+)"[^>]*>[\s\S]*?<\/row>/g)){
  if(/<t(?:\s[^>]*)?>No<\/t>/.test(m[0])&&Number(m[1])>6){const r=Number(m[1]);blocked.add(r);blocked.add(r-1);blocked.add(r-2);}
 }
 const requested=new Set([...xml.matchAll(/<brk\b[^>]*id="(\d+)"/g)].map(m=>Number(m[1])));
 const breaks=new Set<number>();let start=1,used=0;
 for(let row=1;row<=last;row++){
  used+=heights.get(row)??15;
  if(used>capacity){
   let boundary=row-1;while(boundary>=start&&blocked.has(boundary))boundary--;
   if(boundary>=start){breaks.add(boundary);start=boundary+1;used=0;for(let r=start;r<=row;r++)used+=heights.get(r)??15;}
  }
  if(requested.has(row)&&!blocked.has(row)){breaks.add(row);start=row+1;used=0;}
 }
 xml=xml.replace(/<rowBreaks\b[^>]*(?:\/>|>[\s\S]*?<\/rowBreaks>)/g,'');
 const body=[...breaks].sort((a,b)=>a-b).filter(r=>r<last).map(r=>`<brk id="${r}" min="0" max="16383" man="1"/>`).join('');
 if(body)xml=xml.replace(/(?=<(?:colBreaks|customProperties|cellWatches|ignoredErrors|smartTags|drawing|legacyDrawing|extLst)\b|<\/worksheet>)/,`<rowBreaks count="${breaks.size}" manualBreakCount="${breaks.size}">${body}</rowBreaks>`);
 return xml;
}
