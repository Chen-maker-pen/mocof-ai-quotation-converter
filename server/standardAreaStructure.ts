import type {CustomerWorkbookSheet} from '../src/types.js';

export function areaRows(area:number){
 if(!Number.isInteger(area)||area<1||area>10)throw Error('Choose Area 1 through Area 10.');
 return {rawTotal:area+7,extra:area+7,total:area+13,title:area+15,header:area+16,first:area+17,last:area+30,supplementaryTotal:area+31,grand:area+32};
}
/** Ordered identities distinguish repeated names; prices must reconcile before editing. */
export function standardAreaStructure(sheet:CustomerWorkbookSheet,area:number,transformed=false){
 const rows=areaRows(area),text=(r:number,c='A')=>String(sheet.cells[c+r]?.value??'').trim();
 const key=(s:string)=>s.split('//')[0].trim(),isTotal=(s:string)=>/^(合计|Total Price)\s*[:：]?$/.test(s);
 const total=transformed?rows.total:rows.rawTotal;
 if(!isTotal(text(total)))throw Error(`Area ${area} requires ${area} summary rooms followed by a total; check the selected Area.`);
 const max=Math.max(...Object.values(sheet.cells).map(c=>c.row));
 let cursor=transformed?rows.grand+2:rows.rawTotal+2;
 const rooms:Array<{row:number;name:string;heading:number;end:number}>=[];
 for(let i=0;i<area;i++){
  const row=7+i,name=key(text(row,'B'));
  if(!name)throw Error(`Missing room name at B${row}.`);
  let heading=cursor;while(heading<=max&&key(text(heading))!==name)heading++;
  if(heading>max)throw Error(`Missing ordered detail section for room ${i+1}: ${name}.`);
  let end=heading+1;while(end<=max&&!isTotal(text(end)))end++;
  const amount=sheet.cells['H'+end]?.value,summary=sheet.cells['H'+row]?.value;
  if(end>max||typeof amount!=='number'||!Number.isFinite(amount))throw Error(`Missing numeric source total for room ${i+1}: ${name}.`);
  if(!transformed&&(typeof summary!=='number'||!Number.isFinite(summary)||Math.abs(summary-amount)>0.011))throw Error(`Summary/detail price mismatch for room ${i+1}: ${name}.`);
  rooms.push({row,name,heading,end});cursor=end+1;
 }
 const remarks=Object.values(sheet.cells).filter(c=>c.column===1&&/^(备注[:：]|Remark:)/.test(String(c.value))&&c.row>rooms.at(-1)!.end);
 if(remarks.length!==1)throw Error('Cannot identify a unique final remarks block.');
 if(!transformed){
  const sum=rooms.reduce((v,r)=>v+Number(sheet.cells['H'+r.row]?.value),0),quoted=sheet.cells['H'+total]?.value;
  if(typeof quoted!=='number'||Math.abs(sum-quoted)>0.011)throw Error('Source whole-house total does not match the room totals.');
 }
 return {...rows,rooms,detailStart:rooms[0].heading,detailEnd:rooms.at(-1)!.end,remarks:remarks[0].row};
}
