import type {StepContext,StepPlan} from './sequentialRecipe.js';
import {officialAreaCatalog} from './officialAreaCatalog.js';
import {area4Structure} from './area4Structure.js';

/** Area 4 instructions, applied in document order to ordered source sections. */
export function planArea4(c:StepContext):StepPlan{
 const {step,recipe,customer}=c;
 const stop=(reason:string):StepPlan=>({stepId:step.id,status:'needs_review',reason,operations:[],executor:'deterministic'});
 const official=officialAreaCatalog.find(r=>r.area===4);
 if(recipe.area!==4||recipe.sourceSha256!=='c4012c9a6a5ce2ffc79a4d7f0543cbb849e12ca2171d92fe7aa0a0c09f4d25f9'||official?.steps.find(s=>s.id===step.id)?.text!==step.text)return stop('Area 4 prompt differs from reviewed source.');
 if(c.history.some(e=>e.status==='needs_review'))return stop('Earlier instruction remains unresolved.');
 const n=Number(step.id.slice(-3));
 const headings=[1,2,6,9,11,14,18,21,23,24,25,27,32,40,42,43];
 if(headings.includes(n))return {stepId:step.id,status:'no_change',reason:'Document heading; its instructions are applied in the following section.',operations:[],executor:'deterministic'};
 const matches=c.sheets.filter(s=>s.cells.E1&&['全屋汇总','Whole House Total'].includes(String(s.cells.A5?.value)));
 if(matches.length!==1)return stop('Cannot identify the source summary sheet.');
 const s=matches[0],operations:StepPlan['operations']=[];
 const add=(op:any)=>operations.push({...op,sheetName:s.name,evidence:step.text});
 const set=(address:string,value:string|number)=>add({kind:'set',address,value});
 const formula=(address:string,formula:string)=>add({kind:'formula',address,formula});
 const fmt=(range:string,numberFormat:string)=>add({kind:'format_cells',address:'',range,numberFormat});
 const translate=(cols:string[],pairs:[string,string][])=>{
  for(const [a,cell] of Object.entries(s.cells))if(!cell.formula&&typeof cell.value==='string'&&cols.includes(a.replace(/\d+$/,''))){
   let v=cell.value;for(const [from,to]of pairs)if(!v.includes(to))v=v.split(from).join(to);if(v!==cell.value)set(a,v);
  }
 };
 if(n<=8)area4Structure(s);
 switch(n){
 case 3:for(const targetColumn of ['I','J'])add({kind:'copy_column',address:'',sourceColumn:'H',targetColumn});set('E1','MOCOF Whole House Quotation');set('A5','Whole House Total');break;
 case 4:for(const [col,v]of Object.entries({A:'No.',B:'Space',D:'Wall Panel (m²)',E:'Cabinet (m²)',F:'RM49800',G:'RM79800',H:'Software Price',I:'Before Price',J:'After Price'}))set(col+'6',v);break;
 case 5:
  if(customer.currency!=='MYR'||!customer.name.trim()||!customer.address.trim()||!Number.isFinite(customer.sqft)||customer.sqft<=0||!Number.isFinite(customer.budget)||customer.budget<0)return stop('Complete MYR customer inputs required.');
  for(const [a,v]of Object.entries({E2:'Customer Name',E3:'Address',E4:'Sqft',F2:customer.name,F3:customer.address,F4:customer.sqft}))set(a,v);
  add({kind:'clear',address:'G2:J4'});for(const [a,v]of Object.entries({G2:'Currency',H2:6.88,G3:'Budget',H3:customer.budget,G4:'RM/sqft'}))set(a,v);break;
 case 7:set('I2',.9);fmt('I2','0%');break;
 case 8:
  add({kind:'insert_rows',address:'',beforeRow:11,count:6,inheritHorizontalMerges:true});add({kind:'clear',address:'D7:G10'});add({kind:'clear',address:'D17:G17'});
  ['Extra m2','Curve','Wall Panel','Aluminium Frame','Add-on finishing','Deduct Design fee.'].forEach((v,i)=>set('B'+(11+i),v));break;
 case 10:add({kind:'sequence',address:'',range:'A7:A16'});break;
 case 12:
  formula('F17','SUM(F7:F16)+49800');formula('G17','SUM(G7:G16)+79800');
  for(const col of ['D','E','H','I'])formula(col+'17','SUM(D7:D16)');break;
 case 13:formula('F11','SUM(E17-20)*1999');formula('G11','SUM(E17-24)*1999');formula('G13','SUM(D17-6)*650');break;
 case 15:
  if(customer.quotationType!=='project')return stop('Residential fee rules need separate acceptance.');
  for(const a of ['F16','G16','J16'])add({kind:'clear',address:a});fmt('F7:J17','"RM"#,##0.00');break;
 case 16:
  add({kind:'insert_rows',address:'',beforeRow:19,count:19,inheritHorizontalMerges:false});set('A19','Supplementary');
  for(const [col,v]of Object.entries({A:'No',B:'Item',D:'sqft/ per',E:'Qty/ sqft',F:'RM49,800.00',G:'RM79,800.00',H:'Software Price',I:'Before Price',J:'After Price'}))set(col+'20',v);break;
 case 17:
  ['Defect Check before start work','3D & 2D design and submission','Project management','Post reno cleaning','Floor Protection (Floor guard)','Electrical','Plaster ceiling','Painting with white paint','Paint with 3 colour nippon colours','Partition (normal w/o sounds proof)','Curtain with Blind per window H 8-9ft','Hacking & Removal','Grout','Mirror'].forEach((v,i)=>set('B'+(21+i),v));break;
 case 19:add({kind:'sequence',address:'',range:'A21:A34'});set('I3',.8);fmt('I3','0%');break;
 case 20:
  [1,5,6,1,1,19,10,9,12,24,43,77,6.5,50].forEach((v,i)=>{const r=21+i;set('D'+r,v);set('E'+r,1);formula('I'+r,`D${r}*$F$4`);if(r<=25)set('J'+r,0);else formula('J'+r,`I${r}*$I$3`);for(const col of ['F','G'])formula(col+r,`J${r}`);});break;
 case 22:set('A35','Total Supplementary :');set('A36','Total Whole House Price with Supplementary Items');for(const col of ['F','G','H','I','J'])formula(col+'35',`SUM(${col}21:${col}34)`);break;
 case 26:for(const col of ['F','G','H','I','J'])formula(col+'36',`${col}17+${col}35`);break;
 case 28:formula('H4','J36/F4');break;
 case 29:{
  // Hardcoded row 119 intersects products in this source. Append after source content.
  const start=Math.max(...Object.values(s.cells).map(cell=>cell.row))+2;
  set('A'+start,'M&E Work');set('D'+(start+8),'Curtain');
  for(const r of [start+1,start+6])for(const [col,v]of Object.entries({A:'No',D:'Name',E:'Model',G:'Qty'}))set(col+r,v);
  break;
 }
 case 30:{
  const start=Object.values(s.cells).find(cell=>cell.value==='M&E Work')?.row;if(!start)return stop('M&E title missing.');
  const text=step.text;
  const desc=text.slice(text.indexOf('Supply and install'),text.indexOf('Add the text next row:')).trim();
  const next=text.split('Add the text next row:')[1]?.split('Add the text in cell E128:');
  if(!desc||!next||next.length!==2)return stop('M&E source text could not be parsed.');
  set('E'+(start+9),desc.replace(/\s+/g,' '));set('E'+(start+10),next[0].replace(/\s+/g,' ').trim());set('E'+(start+8),next[1].replace(/\s+/g,' ').trim());break;
 }
 case 31:{
  const start=Object.values(s.cells).find(cell=>cell.value==='M&E Work')?.row;if(!start)return stop('M&E title missing.');
  set('D'+(start+2),'Electrical and Plaster work');set('D'+(start+8),'Curtain');set('G'+(start+2),1);set('G'+(start+8),1);break;
 }
 case 33:translate(['A'],[['柜体合计','Cabinet Total Price'],['配套品合计','Accessories Total Price'],['合计','Total Price']]);break;
 case 34:translate(['A'],[['配套品表','Accessories Table'],['柜体表','Cabinet Table']]);break;
 // Room names are user-approved source names, not reassigned prompt examples.
 case 35:case 36:case 37:break;
 case 38:translate(['A','B'],[['序号','No'],['产品图片','Product PIC']]);translate(['C','D'],[['组合','Combi'],['名称','Name']]);break;
 case 39:translate(['E','F'],[['型号','Model'],['宽深高','WDH']]);translate(['G','H'],[['数量','Qty'],['单价','Before Price']]);translate(['C'],[['23系统柜','23 system cabinet'],['25厨柜','25 Kitchen Cabinet'],['美家背景墙','Background Wall Panel'],['新居产品','New Product']]);break;
 case 41:for(const room of area4Structure(s,true).rooms)formula('H'+room.row,'H'+room.end);break;
 case 44:{
  const layout=area4Structure(s,true);
  for(let r=layout.detailStart;r<=layout.detailEnd;r++){
   if(typeof s.cells['H'+r]?.value==='number'){formula('I'+r,`H${r}*$H$2`);formula('J'+r,`I${r}*$I$2`);}
   else if(/单价|Before Price/.test(String(s.cells['H'+r]?.value))){set('H'+r,'Software Price');set('I'+r,'Before Price');set('J'+r,'After Price');}
  }
  for(const room of layout.rooms){formula('I'+room.row,'I'+room.end);formula('J'+room.row,'J'+room.end);}
  for(const col of ['D','E','H','I','J'])formula(col+'17',`SUM(${col}7:${col}16)`);
  break;
 }
 case 45:{
  const layout=area4Structure(s,true),start=step.text.indexOf("'Remark:");
  if(start<0)return stop('Missing bilingual remarks.');
  set('A'+layout.remarks,step.text.slice(start+1).replace(/Send\s+feedback\s*$/,'').replace(/\s+/g,' ').trim());add({kind:'replace_logo',address:''});break;
 }
 default:return stop('Unrecognized Area 4 section.');
 }
 return {stepId:step.id,status:operations.length?'ready':'no_change',reason:operations.length?'Apply Area 4 instruction with source-room identity and current approved pricing rules.':'Preserve original room names as requested.',operations,executor:'deterministic'};
}
