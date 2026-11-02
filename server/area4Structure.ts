import type {CustomerWorkbookSheet} from '../src/types.js';

/** Room identity is its ordered source section, including repeated room names. */
export function area4Structure(sheet:CustomerWorkbookSheet, transformed=false){
 const text=(r:number,c='A')=>String(sheet.cells[c+r]?.value??'').trim();
 const key=(s:string)=>s.split('//')[0].trim();
 const total=transformed?17:11;
 if(!/^(合计|Total Price)\s*[:：]?$/.test(text(total)))throw Error('Area 4 requires four summary sections followed by a total.');
 const max=Math.max(...Object.values(sheet.cells).map(c=>c.row));
 let cursor=transformed?38:13;
 const rooms=[];
 for(let row=7;row<=10;row++){
  const name=key(text(row,'B'));
  if(!name)throw Error('Missing Area 4 room name.');
  let heading=cursor;while(heading<=max&&key(text(heading))!==name)heading++;
  if(heading>max)throw Error(`Missing section for ${name}.`);
  let end=heading+1;while(end<=max&&!/^(合计|Total Price)\s*[:：]?$/.test(text(end)))end++;
  if(end>max||typeof sheet.cells['H'+end]?.value!=='number')throw Error(`Missing numeric total for ${name}.`);
  rooms.push({row,name,heading,end});cursor=end+1;
 }
 const remarks=Object.values(sheet.cells).filter(c=>c.column===1&&/^(备注[:：]|Remark:)/.test(String(c.value)));
 if(remarks.length!==1||remarks[0].row<=rooms[3].end)throw Error('Missing final source remarks.');
 return {rooms,detailStart:rooms[0].heading,detailEnd:rooms[3].end,remarks:remarks[0].row};
}
