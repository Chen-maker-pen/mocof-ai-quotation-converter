import type {CustomerWorkbookSheet} from '../src/types.js';

/** Match semantic labels, never customer names, filenames or fixed detail rows. */
export function area2Structure(sheet:CustomerWorkbookSheet, transformed=false){
 const text=(r:number,c='A')=>String(sheet.cells[c+r]?.value??'').trim();
 const key=(s:string)=>s.split('//')[0].trim();
 const summaryEnd=transformed?15:9;
 if(!/合计|Total Price/.test(text(summaryEnd)))throw Error('Area 2 requires two room summary rows followed by a total.');
 const summary=[7,8].map(row=>({row,name:key(text(row,'B'))}));
 if(summary.some(r=>!r.name))throw Error('Area 2 room names are missing.');
 const max=Math.max(...Object.values(sheet.cells).map(c=>c.row));
 const detailStart=transformed?36:11;
 const totals=(r:number)=>/^(?:合计|Total Price)\s*[:：]?$/.test(text(r));
 const rooms=[];let cursor=detailStart;
 for(const room of summary){
  let heading=cursor;while(heading<=max&&key(text(heading))!==room.name)heading++;
  if(heading>max)throw Error(`Cannot find detail section for room ${room.name}.`);
  let end=heading+1;while(end<=max&&!totals(end))end++;
  if(end>max)throw Error(`Cannot find subtotal for room ${room.name}.`);
  if(typeof sheet.cells['H'+end]?.value!=='number')throw Error(`Room ${room.name} has no numeric source total.`);
  rooms.push({...room,heading,end});cursor=end+1;
 }
 const remarks=Object.values(sheet.cells).filter(c=>c.column===1&&/^(?:备注[:：]|Remark:)/.test(String(c.value)));
 if(remarks.length!==1||remarks[0].row<=rooms[1].end)throw Error('Cannot identify final remarks after both room sections.');
 return {rooms,detailStart:rooms[0].heading,detailEnd:rooms[1].end,remarks:remarks[0].row};
}

export function area2WorkRows(sheet:CustomerWorkbookSheet){
 const title=Object.values(sheet.cells).find(c=>c.column===1&&c.value==='M&E Work');
 if(!title)throw Error('M&E work section is missing.');
 const start=title.row;
 return {start,electrical:start+2,curtain:start+8,description:start+9};
}
