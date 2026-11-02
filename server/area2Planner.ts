import {area2Structure,area2WorkRows} from './area2Structure.js';
import type {StepContext,StepPlan} from './sequentialRecipe.js';
import {officialAreaCatalog} from './officialAreaCatalog.js';
import {evaluateWorkbookValue} from '../src/lib/formulaEvaluator.js';
const HASH='d092ce1a1d6c5bfcacc4888f02fe07799ea70b55c7dc287fa6613045b43eacbb';
/** Staged Area 2 implementation; not enabled in the online planner until source acceptance. */
export function planArea2(context:StepContext, approvals:{correctGrandTotalRows?:boolean;useYangRooms?:boolean;reviewedPricing?:boolean}={}):StepPlan{
 const {recipe,step,customer}=context;
 const stop=(reason:string):StepPlan=>({stepId:step.id,status:'needs_review',reason,operations:[],executor:'deterministic'});
 if(recipe.area!==2||recipe.sourceSha256!==HASH||officialAreaCatalog.find(r=>r.area===2)?.steps.find(s=>s.id===step.id)?.text!==step.text)return stop('Area 2 source wording does not match the reviewed document.');
 if(context.history.some(e=>e.status==='needs_review'))return stop('An earlier instruction requires review.');
 if(step.id==='A2-S001')return {stepId:step.id,status:'no_change',reason:'Document title.',operations:[],executor:'deterministic'};
 const matches=context.sheets.filter(s=>s.cells.E1&&(String(s.cells.A5?.value).includes('全屋汇总')||s.cells.A5?.value==='Whole House Total'));
 if(matches.length!==1)return stop('Cannot identify the summary sheet.');
 const sheet=matches[0],operations:StepPlan['operations']=[];
 // Prior to row insertion, two-room sources have their original total at row 9.
 if(['A2-S002','A2-S003','A2-S004','A2-S005','A2-S006','A2-S007'].includes(step.id)&&![sheet.cells.A9?.value,sheet.cells.B9?.value].some(v=>/合计|Total Price/i.test(String(v))))return stop('Expected a two-room source with its summary total at row 9. No rows were changed.');
 const add=(op:any)=>operations.push({...op,sheetName:sheet.name,evidence:step.text});
 const set=(address:string,value:string|number)=>add({kind:'set',address,value});
 const formula=(address:string,formula:string)=>add({kind:'formula',address,formula});
 const translate=(columns:string[],pairs:[string,string][])=>{
 for(const [address,cell]of Object.entries(sheet.cells)){
 if(cell.formula||typeof cell.value!=='string'||!columns.includes(address.replace(/\d+$/,'')))continue;
 let value=cell.value;for(const [from,to]of pairs)if(!value.includes(to))value=value.split(from).join(to);
 if(value!==cell.value)set(address,value);
 }
 };
 switch(step.id){
 case 'A2-S002':for(const targetColumn of ['I','J'])add({kind:'copy_column',address:'',sourceColumn:'H',targetColumn});set('E1','MOCOF Whole House Quotation');set('A5','Whole House Total');break;
 case 'A2-S003':for(const [c,v]of Object.entries({A:'No.',B:'Space',D:'Wall Panel (m²)',E:'Cabinet (m²)',F:'RM49800',G:'RM79800',H:'Software Price',I:'Before Price',J:'After Price'}))set(c+'6',v);break;
 case 'A2-S004':
 if(customer.currency!=='MYR'||!customer.name.trim()||!customer.address.trim()||!Number.isFinite(customer.sqft)||customer.sqft<=0||!Number.isFinite(customer.budget)||customer.budget<0)return stop('Complete MYR customer details are required.');
 for(const [a,v]of Object.entries({E2:'Customer Name',E3:'Address',E4:'Sqft',F2:customer.name,F3:customer.address,F4:customer.sqft}))set(a,v);
 add({kind:'clear',address:'G2:J4'});for(const [a,v]of Object.entries({G2:'Currency',H2:6.88,G3:'Budget',H3:customer.budget,G4:'RM/sqft'}))set(a,v);break;
 case 'A2-S005':set('I2',.9);add({kind:'format_cells',address:'',range:'I2',numberFormat:'0.00E+00'});break;
 case 'A2-S006':add({kind:'clear',address:'D7:G9'});break;
 case 'A2-S007':add({kind:'insert_rows',address:'',beforeRow:9,count:6,inheritHorizontalMerges:true});['Extra m2','Curve','Wall Panel','Aluminium Frame','Add-on finishing','Deduct Design fee.'].forEach((v,i)=>set('B'+(i+9),v));break;
 case 'A2-S008':if(!customer.quotationType)return stop('Quotation type is required.');add({kind:'sequence',address:'',range:'A7:A14'});if(customer.quotationType==='project')for(const a of ['F14','G14','J14'])add({kind:'clear',address:a});break;
 case 'A2-S009':
 formula('F15','SUM(F7:F14)+49800');formula('G15','SUM(G7:G14)+79800');
 for(const c of ['D','E','H','I'])formula(c+'15','SUM(D7:D14)');break;
 case 'A2-S010':formula('F9','SUM(E15-20)*1999');formula('G9','SUM(E15-24)*1999');formula('G11','SUM(D15-6)*650');break;
 case 'A2-S011':
 if(!customer.quotationType)return stop('Quotation type is required.');
 add({kind:'sequence',address:'',range:'A7:A14'});
 if(customer.quotationType==='project')for(const a of ['F14','G14','J14'])add({kind:'clear',address:a});break;
 case 'A2-S012':
 if(customer.quotationType!=='project')return stop('Residential design-fee boundary gaps require review.');
 for(const a of ['F14','G14','J14'])add({kind:'clear',address:a});
 add({kind:'format_cells',address:'',range:'F7:I14',numberFormat:'"RM"#,##0.00'});
 add({kind:'format_cells',address:'',range:'F15:J15',numberFormat:'"RM"#,##0.00'});break;
 case 'A2-S013':
 add({kind:'insert_rows',address:'',beforeRow:17,count:19,inheritHorizontalMerges:false});set('A17','Supplementary');
 for(const [c,v]of Object.entries({A:'No',B:'Name',D:'sqft / per',E:'Qty / per',F:'RM49800',G:'RM79800',H:'Software Price',I:'Before Price',J:'After Price'}))set(c+'18',v);break;
 case 'A2-S014':
 ['Defect Check before start work','3D & 2D design and submission','Project management','Post reno cleaning','Floor Protection (Floor guard)','Electrical','Plaster ceiling','Painting with white paint','Paint with 3 colour nippon colours','Partition ( normal w/o sounds proof)','Curtain with Blind per window H 8-9ft','Hacking & Removal','Grout','Mirror'].forEach((v,i)=>set('B'+(19+i),v));break;
 case 'A2-S015':add({kind:'sequence',address:'',range:'A19:A32'});set('I3',.8);add({kind:'format_cells',address:'',range:'I3',numberFormat:'0.00E+00'});break;
 case 'A2-S016':
 [1,5,6,1,1,19,10,9,12,24,43,77,6.5,50].forEach((v,i)=>{
 const r=19+i;set('D'+r,v);set('E'+r,0);formula('I'+r,`SUM(D${r}*$F$4)`);
 if(r<=23)set('J'+r,0);else formula('J'+r,`SUM(I${r}*$I$3)`);
 formula('F'+r,`J${r}`);formula('G'+r,`J${r}`);
 });break;
 case 'A2-S017':set('A33','Total Supplementary :');set('A34','Total Whole House Price with Supplementary Items');
 for(const c of ['F','G','H','I','J'])formula(c+'33',`SUM(${c}19:${c}32)`);break;
 case 'A2-S018':
 if(!approvals.correctGrandTotalRows)return stop('Approval required to use row 15 + row 33 for grand totals.');
 for(const c of ['F','G','H','I','J'])formula(c+'34',`${c}15+${c}33`);
 formula('H4','J34/F4');break;
 case 'A2-S019':{
 if(!approvals.correctGrandTotalRows)return stop('Approval required to compare grand totals at row 34.');
 const prices=['F','G','I','J'].map(c=>({address:c+'34',value:evaluateWorkbookValue(sheet,c+'34',context.sheets)}));
 if(prices.some(p=>typeof p.value!=='number'||!Number.isFinite(p.value)))return stop('Grand totals must calculate before highlighting.');
 const lowest=Math.min(...prices.map(p=>p.value as number));
 for(const p of prices)add({kind:'format_cells',address:'',range:p.address,numberFormat:'"RM"#,##0.00',fillColor:p.value===lowest?'00FF00':'FFFFFF'});
 break;
 }
 case 'A2-S020':return {stepId:step.id,status:'no_change',reason:'Translation section title; instructions follow in S021–S028.',operations:[],executor:'deterministic'};
 case 'A2-S021':translate(['A'],[['柜体合计','Cabinet Total Price'],['配套品合计','Accessories Total Price'],['合计','Total Price']]);break;
 case 'A2-S022':translate(['A'],[['配套品表','Accessories Table'],['柜体表','Cabinet Table']]);break;
 case 'A2-S023':translate(['A','B'],[['客卧房','客卧房//Guest Bedroom'],['书房','书房//Study Room'],['客餐厅','客餐厅//Living and Dining Room']]);break;
 case 'A2-S024':translate(['A','B'],[['门厅','门厅//Foyer'],['主卧房','主卧房//Master Bedroom']]);break;
 case 'A2-S025':translate(['A','B'],[['厨房','厨房//Kitchen'],['多功能空间','多功能空间//Multipurpose Room'],['儿童房','儿童房//Kids Room']]);break;
 case 'A2-S026':translate(['A','B'],[['序号','No'],['产品图片','Product PIC']]);translate(['C','D'],[['组合','Combi'],['名称','Name']]);break;
 case 'A2-S027':translate(['E','F'],[['型号','Model'],['宽深高','WDH']]);translate(['G','H'],[['数量','Qty'],['单价','Before Price']]);break;
 case 'A2-S028':translate(['C'],[['23系统柜','23 system cabinet'],['25厨柜','25 Kitchen Cabinet'],['美家背景墙','Background Wall Panel'],['新居产品','New Product']]);break;
 case 'A2-S029':{
 const layout=area2Structure(sheet,true);
 for(const room of layout.rooms)formula('H'+room.row,'H'+room.end);
 break;
 }
 case 'A2-S030':{
 const layout=area2Structure(sheet,true);
 // Keep supplier subtotals: do not silently override source rounding adjustments.
 for(let r=layout.detailStart;r<=layout.detailEnd;r++){
  if(typeof sheet.cells['H'+r]?.value==='number'){
   formula('I'+r,`H${r}`);formula('J'+r,`I${r}*$I$2`);
  }else if(/单价|Before Price/.test(String(sheet.cells['H'+r]?.value))){
   set('H'+r,'Software Price');set('I'+r,'Before Price');set('J'+r,'After Price');
  }
 }
 for(const room of layout.rooms){formula('I'+room.row,'I'+room.end);formula('J'+room.row,'J'+room.end);}
 for(const c of ['D','E','H','I','J'])formula(c+'15',`SUM(${c}7:${c}14)`);
 break;
 }
 case 'A2-S031':{
 const layout=area2Structure(sheet,true);
 // Append work tables after all source content; never insert through product rows.
 const start=Math.max(...Object.values(sheet.cells).map(c=>c.row))+2;
 set('A'+start,'M&E Work');
 for(const r of [start+1,start+6])for(const [c,v]of Object.entries({A:'No',D:'Name',E:'Model',G:'Qty'}))set(c+r,v);
 const description=step.text.split('Cell E212\n')[1]?.split('\nNext row\n');
 if(!description||description.length!==2)return stop('Missing original M&E description.');
 set('E'+(start+9),description[0]);set('E'+(start+10),description[1].split('\nCell E128\n')[0]);
 set('E'+(start+8),step.text.split('\nCell E128\n')[1]);
 break;
 }
 case 'A2-S032':{
 const rows=area2WorkRows(sheet);
 set('G'+rows.electrical,1);set('G'+rows.curtain,1);set('D'+rows.electrical,'Electrical and Plaster work');set('D'+rows.curtain,'Curtain');break;
 }
 case 'A2-S033':{
 if(!sheet.mergedRanges.includes('A1:D4'))return stop('Logo area differs from reviewed Yang layout.');
 const remarks=Object.entries(sheet.cells).filter(([a,c])=>/^A\d+$/.test(a)&&typeof c.value==='string'&&c.value.startsWith('备注:'));
 if(remarks.length!==1)return stop('Cannot uniquely identify original remarks.');
 const start=step.text.indexOf("'Remark:");
 if(start<0)return stop('Missing official bilingual remarks.');
 const value=step.text.slice(start+1).replace(/'\s*$/,'');
 set(remarks[0][0],value);add({kind:'replace_logo',address:''});break;
 }
 default:return stop('Area 2 later steps await source-layout and formula review.');
 }
 if(!operations.length)return {stepId:step.id,status:'no_change',reason:'No matching source text for this translation instruction.',operations:[],executor:'deterministic'};
 return {stepId:step.id,status:'ready',reason:['A2-S018','A2-S019'].includes(step.id)?'User approved grand totals at row 34 = own-column row 15 + row 33; compare row 34.':'Area 2 source-specific rule; no Area 3 row mapping reused.',operations,executor:'deterministic'};
}
