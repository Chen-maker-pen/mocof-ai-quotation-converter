import type {StepContext,StepPlan} from './sequentialRecipe.js';
import {officialAreaCatalog} from './officialAreaCatalog.js';
import {areaRows,standardAreaStructure} from './standardAreaStructure.js';

export const standardAreas=[1,5,6,7,8,9,10];
const hashes:Record<number,string>={1:'21d8465e638a46e56376075f12462cc64714c156f0a4fadbe29a7febb69ebe92',5:'b3b24aab45e24bdf81cb75c8a079f25d4bf7b84314851cb1150c0329ad36f0b4',6:'c0bccfcd82ed1d0978277316e23000d0b4d196201a5ad14de37d7dd71ab28a7f',7:'1dfddf23ec09108553b88e2ee21fcd231c122e49125a5265a55c63dc68c0e890',8:'2c9e58dadfad9522170ca6d606695e13b72cf3a97cbe800996906176bd3c0761',9:'8b904e2ab0c1436bd0ed66e828fadcf0edcdbf418b7ea37f8d5d220456c305cc',10:'b8844f346dbe2e2e96c87a2d701bf7817e768161e1b576a1b0f7e07c917afcfd'};
const actions=['heading','top','headers','customer','factor','clear','extra','serial','total','packages','fee','supplementary','names','suppFactor','rates','suppTotal','grand','highlight','heading','translateTotal','translateTable','rooms','rooms','rooms','headersAD','headersEH','combi','footer','connect','prices','conversion','descriptions','workNames','brand'];
export function standardStepAction(area:number,index:number){
 const list=[...actions];
 if(area>=6&&area<=9)list.splice(16,0,'heading');
 if(area===10){list[13]='suppFactorRates';list.splice(14,1);list.splice(15,0,'heading');}
 return list[index];
}
/** Each original instruction remains a separate checkpoint, with room-count geometry. */
export function planStandardArea(c:StepContext):StepPlan{
 const {recipe,step,customer}=c,area=recipe.area,r=areaRows(area);
 const stop=(reason:string):StepPlan=>({stepId:step.id,status:'needs_review',reason,operations:[],executor:'deterministic'});
 const official=officialAreaCatalog.find(x=>x.area===area);
 if(!hashes[area]||recipe.sourceSha256!==hashes[area]||official?.steps.find(x=>x.id===step.id)?.text!==step.text)return stop('Area prompt differs from the reviewed document.');
 if(c.history.some(x=>x.status==='needs_review'))return stop('An earlier instruction remains unresolved.');
 const index=recipe.steps.findIndex(x=>x.id===step.id),action=standardStepAction(area,index);
 const s=c.sheets[0];
 if(!s||!['全屋汇总','Whole House Total'].includes(String(s.cells.A5?.value)))return stop('Expected supplier summary as the first workbook sheet.');
 const operations:StepPlan['operations']=[],add=(op:any)=>operations.push({...op,sheetName:s.name,evidence:step.text});
 const set=(address:string,value:string|number)=>add({kind:'set',address,value}),formula=(address:string,formula:string)=>add({kind:'formula',address,formula});
 const clear=(address:string)=>add({kind:'clear',address}),format=(range:string,numberFormat:string)=>add({kind:'format_cells',address:'',range,numberFormat});
 const translate=(cols:string[],pairs:[string,string][])=>{for(const [a,cell] of Object.entries(s.cells))if(!cell.formula&&typeof cell.value==='string'&&cols.includes(a.replace(/\d+$/,''))){let v=cell.value;for(const [from,to]of pairs)if(!v.includes(to))v=v.split(from).join(to);if(v!==cell.value)set(a,v);}};
 const layout=()=>standardAreaStructure(s,area,true);
 const work=()=>{const v=Object.values(s.cells).find(x=>x.column===1&&x.value==='M&E Work');if(!v)throw Error('M&E section missing.');return v.row;};
 const supplementaryRates=()=>{[1,5,6,1,1,19,10,9,12,24,43,77,6.5,50].forEach((v,i)=>{const row=r.first+i;set('D'+row,v);formula('E'+row,'$F$4');formula('I'+row,`D${row}*$F$4`);formula('J'+row,`I${row}*$I$3`);for(const col of ['F','G'])formula(col+row,`J${row}`);});};
 try{
 switch(action){
 case 'heading':break;
 case 'top':standardAreaStructure(s,area);for(const targetColumn of ['I','J'])add({kind:'copy_column',address:'',sourceColumn:'H',targetColumn});set('E1','MOCOF Whole House Quotation');set('A5','Whole House Total');break;
 case 'headers':for(const [col,v]of Object.entries({A:'No.',B:'Space',D:'Wall Panel (m²)',E:'Cabinet (m²)',F:'RM49800',G:'RM79800',H:'Software Price',I:'Before Price',J:'After Price'}))set(col+'6',v);break;
 case 'customer':
  if(customer.currency!=='MYR'||!customer.name.trim()||!customer.address.trim()||!Number.isFinite(customer.sqft)||customer.sqft<=0||!Number.isFinite(customer.budget)||customer.budget<0)return stop('Complete MYR customer inputs required.');
  clear('G2:J4');for(const [a,v]of Object.entries({E2:'Customer Name',E3:'Address',E4:'Sqft',F2:customer.name,F3:customer.address,F4:customer.sqft,G2:'Currency',H2:6.88,G3:'Budget',H3:customer.budget,G4:'RM/sqft'}))set(a,v);break;
 case 'factor':set('I2',.9);format('I2','0%');break;
 case 'clear':clear(`D7:G${r.rawTotal}`);break;
 case 'extra':add({kind:'insert_rows',address:'',beforeRow:r.rawTotal,count:6,inheritHorizontalMerges:true});['Extra m2','Curve','Wall Panel','Aluminium Frame','Add-on finishing','Deduct Design fee.'].forEach((v,i)=>set('B'+(r.extra+i),v));break;
 case 'serial':add({kind:'sequence',address:'',range:`A7:A${r.total-1}`});break;
 case 'total':for(const col of ['D','E','H','I','J'])formula(col+r.total,`SUM(${col}7:${col}${r.total-1})`);formula('F'+r.total,`SUM(F7:F${r.total-1})+49800`);formula('G'+r.total,`SUM(G7:G${r.total-1})+79800`);break;
 case 'packages':formula('F'+r.extra,`(E${r.total}-20)*1999`);formula('G'+r.extra,`(E${r.total}-24)*1999`);formula('G'+(r.extra+2),`(D${r.total}-6)*650`);break;
 case 'fee':if(customer.quotationType!=='project')return stop('Residential fee rules require separate validation.');for(const col of ['F','G','J'])clear(col+(r.total-1));format(`F7:J${r.total}`,'"RM"#,##0.00');break;
 case 'supplementary':add({kind:'insert_rows',address:'',beforeRow:r.title,count:19,inheritHorizontalMerges:false});set('A'+r.title,'Supplementary');for(const [col,v]of Object.entries({A:'No',B:'Item',D:'sqft/ per',E:'Qty/ sqft',F:'RM49,800.00',G:'RM79,800.00',H:'Software Price',I:'Before Price',J:'After Price'}))set(col+r.header,v);add({kind:'sequence',address:'',range:`A${r.first}:A${r.last}`});break;
 case 'names':['Defect Check before start work','3D & 2D design and submission','Project management','Post reno cleaning','Floor Protection (Floor guard)','Electrical','Plaster ceiling','Painting with white paint','Paint with 3 colour nippon colours','Partition (normal w/o sounds proof)','Curtain with Blind per window H 8-9ft','Hacking & Removal','Grout','Mirror'].forEach((v,i)=>set('B'+(r.first+i),v));break;
 case 'suppFactor':case 'suppFactorRates':set('I3',.8);format('I3','0%');if(action==='suppFactorRates')supplementaryRates();break;
 case 'rates':supplementaryRates();break;
 case 'suppTotal':set('A'+r.supplementaryTotal,'Total Supplementary :');set('A'+r.grand,'Total Whole House Price with Supplementary Items');for(const col of ['F','G','H','I','J'])formula(col+r.supplementaryTotal,`SUM(${col}${r.first}:${col}${r.last})`);break;
 case 'grand':for(const col of ['F','G','H','I','J'])formula(col+r.grand,`${col}${r.total}+${col}${r.supplementaryTotal}`);formula('H4',`J${r.grand}/F4`);break;
 case 'highlight':{const values=['F','G','I','J'].map(col=>Number(s.cells[col+r.grand]?.value));if(!values.every(Number.isFinite))return stop('Grand totals unavailable.');const min=Math.min(...values);['F','G','I','J'].forEach((col,i)=>add({kind:'format_cells',address:'',range:col+r.grand,numberFormat:'"RM"#,##0.00',fillColor:values[i]===min?'00FF00':'FFFFFF'}));break;}
 case 'translateTotal':translate(['A'],[['柜体合计','Cabinet Total Price'],['配套品合计','Accessories Total Price'],['合计','Total Price']]);break;
 case 'translateTable':translate(['A'],[['配套品表','Accessories Table'],['柜体表','Cabinet Table']]);break;
 case 'rooms':break; // User: retain any original room names, including repeated Other.
 case 'headersAD':translate(['A','B'],[['序号','No'],['产品图片','Product PIC']]);translate(['C','D'],[['组合','Combi'],['名称','Name']]);break;
 case 'headersEH':translate(['E','F'],[['型号','Model'],['宽深高','WDH']]);translate(['G','H'],[['数量','Qty'],['单价','Before Price']]);break;
 case 'combi':translate(['C'],[['23系统柜','23 system cabinet'],['25厨柜','25 Kitchen Cabinet'],['美家背景墙','Background Wall Panel'],['新居产品','New Product']]);break;
 case 'footer':translate(['C','D'],[['经手人','Handle by'],['顾客签名','Customer signature'],['日期','Date']]);break;
 case 'connect':for(const room of layout().rooms)formula('H'+room.row,'H'+room.end);break;
 case 'prices':case 'conversion':{
  const l=layout();
  for(let row=l.detailStart;row<=l.detailEnd;row++){
   if(typeof s.cells['H'+row]?.value==='number'){formula('I'+row,`H${row}*$H$2`);formula('J'+row,`I${row}*$I$2`);}
   else if(/^(单价|Price|Before Price|Software Price)$/.test(String(s.cells['H'+row]?.value))){set('H'+row,'Software Price');set('I'+row,'Before Price');set('J'+row,'After Price');}
  }
  for(const room of l.rooms){formula('I'+room.row,'I'+room.end);formula('J'+room.row,'J'+room.end);}
  if(action==='conversion'){
   const start=Math.max(...Object.values(s.cells).map(x=>x.row))+2;
   set('A'+start,'M&E Work');set('D'+(start+8),'Curtain');
   for(const row of [start+1,start+6])for(const [col,v]of Object.entries({A:'No',D:'Name',E:'Model',G:'Qty'}))set(col+row,v);
  }break;
 }
 case 'descriptions':{
  const text=step.text.replace(/\s+/g,' '),start=text.indexOf('Supply and install'),split=text.search(/(?:\d\. )?Add the text next row:|Next row/i),last=text.search(/(?:\d\. )?Add the text in cell E128:|Cell E128/i);
  if(start<0||split<start||last<split)return stop('M&E descriptions need source review.');
  const me=work();set('E'+(me+9),text.slice(start,split).trim());set('E'+(me+10),text.slice(split,last).replace(/^(?:\d\. )?Add the text next row:|^Next row/i,'').trim());set('E'+(me+8),text.slice(last).replace(/^(?:\d\. )?Add the text in cell E128:|^Cell E128/i,'').trim());break;
 }
 case 'workNames':{const me=work();set('D'+(me+2),'Electrical and Plaster work');set('D'+(me+8),'Curtain');for(const row of [me+2,me+8])set('G'+row,1);break;}
 case 'brand':{
  if(Object.values(s.cells).some(x=>String(x.value).includes('活动金额优惠价')))return stop('Source contains an additional promotional price row; review its dependencies before deleting.');
  const text=step.text.replace(/\s+/g,' '),start=text.indexOf('Remark:'),end=text.lastIndexOf('。');if(start<0||end<start)return stop('Bilingual remarks missing.');set('A'+layout().remarks,text.slice(start,end+1).split(/['’]\s*(?:\d+\.\s*)?Delete the row/)[0].replace(/['’]\s*$/,''));add({kind:'replace_logo',address:''});break;
 }
 default:return stop('Unmapped official instruction.');
 }
 }catch(e){return stop((e as Error).message);}
 return {stepId:step.id,status:operations.length?'ready':'no_change',reason:action==='rooms'?'Keep source room identities as requested.':operations.length?'Apply documented instruction using room-count coordinates and approved MYR/discount rules.':'Document heading; instructions execute in the following section.',operations,executor:'deterministic'};
}
