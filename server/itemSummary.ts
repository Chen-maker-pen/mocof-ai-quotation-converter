import JSZip from 'jszip';
import {readTemplateWorkbook,createPreservedTemplateWorkbook,type TemplateOperation} from './templateWorkbook.js';
import {areaRows} from './standardAreaStructure.js';

/** Summarize disjoint saved After Price cells, never source CNY or repeated room totals. */
export async function addItemSummary(raw:Buffer,area:number):Promise<Buffer>{
 const s=(await readTemplateWorkbook(raw))[0],r=areaRows(area);
 const text=(row:number,col='A')=>String(s.cells[col+row]?.value??'').trim();
 if(Object.values(s.cells).some(c=>c.column===1&&c.value==='Summary of items'))return raw;
 const remarks=Object.values(s.cells).filter(c=>c.column===1&&/^(备注[:：]|Remark:)/.test(String(c.value))&&c.row>r.grand);
 if(remarks.length!==1)throw Error('Cannot place item summary without a unique final remarks block.');
 const before=remarks[0].row;
 const groups=[{label:'Total Cabinets',refs:[] as string[]},{label:'Total Wall Panel',refs:[] as string[]},{label:'Total Accessories / Loose items',refs:[] as string[]},{label:'Total doors',refs:[] as string[]},{label:'Total M&E',refs:[] as string[]},{label:'Total curtain',refs:[] as string[]}];
 for(let row=r.grand+1;row<before;row++){
  const label=text(row);
  if(/^Cabinet Total Price\s*[:：]?$/i.test(label))groups[0].refs.push('J'+row);
  else if(/^Accessories Total Price\s*[:：]?$/i.test(label))groups[2].refs.push('J'+row);
  else if(/^快装产品Total Price\s*[:：]?$/i.test(label)){
   // A quick-install section may contain products other than wall panels.
   // Only classify as panels when its detail block explicitly identifies them.
   let start=row-1;while(start>r.grand&&!/Total Price|合计/.test(text(start)))start--;
   const block=Object.values(s.cells).filter(c=>c.row>start&&c.row<row).map(c=>String(c.value)).join(' ');
   if(/墙板|wall panel/i.test(block))groups[1].refs.push('J'+row);
  }
 }
 for(let row=r.first;row<=r.last;row++)groups[/curtain|窗帘/i.test(text(row,'B'))?5:4].refs.push('J'+row);
 for(let row=area+7;row<r.total;row++){
  const label=text(row,'B');
  const group=/wall panel|墙板/i.test(label)?1:/\bdoor\b|\bdoors\b/i.test(label)?3:/curtain|窗帘/i.test(label)?5:/aluminium frame|add.on finishing/i.test(label)?2:-1;
  if(group>=0)groups[group].refs.push('J'+row);
 }
 const sum=(refs:string[])=>refs.reduce((n,a)=>n+(typeof s.cells[a]?.value==='number'?Number(s.cells[a].value):0),0);
 const totals=groups.map(g=>sum(g.refs));
 const grand=Number(s.cells['J'+r.grand]?.value);
 if(!Number.isFinite(grand))throw Error('Item summary requires a calculated After Price grand total.');
 const remainder=grand-totals.reduce((a,b)=>a+b,0);
 const extra=Math.abs(remainder)>.005;
 const count=groups.length+(extra?1:0)+3;
 const ops:TemplateOperation[]=[{kind:'insert_rows',sheetName:s.name,beforeRow:before,count,inheritHorizontalMerges:false}];
 const put=(address:string,value:string|number,formula?:string)=>ops.push({sheetName:s.name,address,value,formula});
 put('A'+before,'Summary of items');put('J'+before,'');
 groups.forEach((g,i)=>{put('A'+(before+i+1),g.label);put('J'+(before+i+1),totals[i],g.refs.length?`SUM(${g.refs.join(',')})`:'0');});
 let totalRow=before+groups.length+1;
 if(extra){put('A'+totalRow,'Other / unclassified items');put('J'+totalRow,remainder,`J${r.grand}-SUM(J${before+1}:J${totalRow-1})`);totalRow++;}
 put('A'+totalRow,'Total');put('J'+totalRow,grand,`SUM(J${before+1}:J${totalRow-1})`);
 ops.push({kind:'format_cells',sheetName:s.name,range:`J${before+1}:J${totalRow}`,numberFormat:'"RM"#,##0.00'});
 const result=await createPreservedTemplateWorkbook(raw,'quotation.xlsx',ops);
 const z=await JSZip.loadAsync(Buffer.from(result.transformedXlsxBase64,'base64'));
 let xml=await z.file(s.id)!.async('string');
 const style=(address:string)=>new RegExp(`<c\\b[^>]*r="${address}"[^>]*\\bs="(\\d+)"`).exec(xml)?.[1];
 const titleStyle=style('A5');
 let styles=await z.file('xl/styles.xml')!.async('string');
 const section=/<cellXfs\b[^>]*>([\s\S]*?)<\/cellXfs>/.exec(styles)!;
 const xfs=[...section[1].matchAll(/<xf\b[^>]*?(?:\/>|>[\s\S]*?<\/xf>)/g)].map(m=>m[0]);
 const centered=(base:string|undefined)=>{
  let xf=xfs[Number(base||0)];
  xf=xf.replace(/<alignment\b[^>]*\/>/g,'');
  if(xf.endsWith('/>'))xf=xf.slice(0,-2)+'></xf>';
  xf=xf.replace('</xf>','<alignment horizontal="center" vertical="center" wrapText="1"/></xf>');
  xfs.push(xf);return String(xfs.length-1);
 };
 const labelStyle=centered(style('B7')),valueStyle=centered(style('J7'));
 styles=styles.replace(section[0],`<cellXfs count="${xfs.length}">${xfs.join('')}</cellXfs>`);z.file('xl/styles.xml',styles);
 for(let row=before;row<=totalRow;row++){
  xml=xml.replace(new RegExp(`<row\\b[^>]*\\br="${row}"[^>]*>`),tag=>tag.replace(/\sht="[^"]*"|\scustomHeight="[^"]*"/g,'').replace('>',' ht="24" customHeight="1">'));
  const st=row===before?titleStyle:labelStyle;
  const priceStyle=row===before?titleStyle:valueStyle;
  if(priceStyle)xml=xml.replace(new RegExp(`<c\\b[^>]*r="J${row}"[^>]*>`),tag=>tag.replace(/\ss="[^"]*"/g,'').replace('>',` s="${priceStyle}">`));
  if(st)xml=xml.replace(new RegExp(`<c\\b[^>]*r="A${row}"[^>]*>`),tag=>tag.replace(/\ss="[^"]*"/g,'').replace('>',` s="${st}">`));
 }
 const merges=Array.from({length:totalRow-before+1},(_,i)=>`<mergeCell ref="A${before+i}:I${before+i}"/>`).join('');
 xml=xml.replace(/<mergeCells\b[^>]*count="(\d+)"[^>]*>([\s\S]*?)<\/mergeCells>/,(_,n,body)=>`<mergeCells count="${Number(n)+totalRow-before+1}">${body}${merges}</mergeCells>`);
 z.file(s.id,xml);
 return z.generateAsync({type:'nodebuffer'});
}
