import type { StepContext, StepPlan, StepPlanner } from './sequentialRecipe.js';
import { officialAreaCatalog } from './officialAreaCatalog.js';
import { planGeminiStep } from './geminiStepPlanner.js';

// Compiled rules are pinned to reviewed source wording. A changed document or
// different Area never silently inherits these coordinates/business constants.
const AREA3_HASH = 'd7110be6ce9f76766e5b39da85988b832a56febfc1352379346834773b7a1b6f';
export function planDeterministicStep(context: StepContext): StepPlan | undefined {
  const { recipe, step, customer } = context;
  if (recipe.area !== 3 || recipe.sourceSha256 !== AREA3_HASH) return undefined;
  const canonical = officialAreaCatalog.find(r => r.area === 3)?.steps.find(s => s.id === step.id);
  if (!canonical || canonical.text !== step.text) return undefined;
  if (step.id === 'A3-S001') return { stepId: step.id, status: 'no_change', reason: 'Document title; no worksheet edit is specified.', operations: [], executor: 'deterministic' };
  const supported = ['A3-S002','A3-S003','A3-S004','A3-S005','A3-S006','A3-S007','A3-S008','A3-S009','A3-S010','A3-S011','A3-S012','A3-S013','A3-S014','A3-S015','A3-S016','A3-S017','A3-S018','A3-S019','A3-S020','A3-S021','A3-S022','A3-S023','A3-S024','A3-S025','A3-S026','A3-S027','A3-S028','A3-S029','A3-S030','A3-S031','A3-S032','A3-S033'];
  if (!supported.includes(step.id)) return undefined;
  const matches = context.sheets.filter(s => s.cells.E1 && (String(s.cells.A5?.value).includes('全屋汇总') || s.cells.A5?.value === 'Whole House Total'));
  if (matches.length !== 1) return undefined;
  const sheetName = matches[0].name, operations: StepPlan['operations'] = [];
  const add = (op: Omit<StepPlan['operations'][number], 'sheetName' | 'evidence'>) => operations.push({ ...op, sheetName, evidence: step.text });
  const set = (address: string, value: string | number) => add({ kind: 'set', address, value });
  const formula = (address: string, value: string) => add({ kind: 'formula', address, formula: value });
  const replace = (columns: string[], rules: Array<[string,string]>) => {
    for (const cell of Object.values(matches[0].cells)) {
      if (cell.formula || typeof cell.value !== 'string' || !columns.includes(cell.address.replace(/\d+$/,''))) continue;
      let value = cell.value;
      for (const [from,to] of rules) {
        // Protect already-translated bilingual labels against a repeated run.
        if (!value.includes(to)) value = value.split(from).join(to);
      }
      if (value !== cell.value) set(cell.address,value);
    }
  };
  switch (step.id) {
    case 'A3-S002':
      for (const targetColumn of ['I','J']) add({ kind:'copy_column',address:'',sourceColumn:'H',targetColumn });
      set('E1','MOCOF Whole House Quotation'); set('A5','Whole House Total'); break;
    case 'A3-S003':
      for (const [col,label] of Object.entries({ A:'No.',B:'Space',D:'Wall Panel (m²)',E:'Cabinet (m²)',F:'RM49800',G:'RM79800',H:'Software Price',I:'Before Price',J:'After Price' })) set(`${col}6`,label);
      break;
    case 'A3-S004':
      if (customer.currency !== 'MYR' || !customer.name.trim() || !customer.address.trim() || !Number.isFinite(customer.sqft) || customer.sqft <= 0 || !Number.isFinite(customer.budget) || customer.budget < 0)
        return { stepId: step.id,status:'needs_review',reason:'This compiled recipe requires complete MYR customer inputs; no exchange rate is inferred.',operations:[],executor:'deterministic' };
      for (const [address,value] of Object.entries({ E2:'Customer Name',E3:'Address',E4:'Sqft',F2:customer.name,F3:customer.address,F4:customer.sqft })) set(address,value);
      add({kind:'clear',address:'G2:J4'});
      set('G2','Currency');set('H2',6.88);set('G3','Budget');set('H3',customer.budget);set('G4','RM/sqft');break;
    case 'A3-S005':
      set('I2',0.9);add({kind:'format_cells',address:'',range:'I2',numberFormat:'0.00E+00'});break;
    case 'A3-S006': add({kind:'clear',address:'D7:G10'});break;
    case 'A3-S007':
      add({kind:'insert_rows',address:'',beforeRow:10,count:6,inheritHorizontalMerges:true});
      ['Extra m2','Curve','Wall Panel','Aluminium Frame','Add-on finishing','Deduct Design fee.'].forEach((label,i)=>set(`B${10+i}`,label));break;
    case 'A3-S008':
      if (!customer.quotationType) return {stepId:step.id,status:'needs_review',reason:'Quotation type is required to determine the Project design-fee exemption.',operations:[],executor:'deterministic'};
      add({kind:'sequence',address:'',range:'A7:A15'});
      if (customer.quotationType === 'project') for (const address of ['F15','G15','J15']) add({kind:'clear',address});
      break;
    case 'A3-S009':
      if (!context.userDecisions?.some(d => d.includes('use SUM(D7:D15) for D, E, H and I totals'))) return undefined;
      for (const col of ['D','E','H','I']) formula(`${col}16`,'SUM(D7:D15)');
      formula('F16','SUM(F7:F15)+49800'); formula('G16','SUM(G7:G15)+79800');break;
    case 'A3-S010':formula('F10','SUM(E16-20)*1999');formula('G10','SUM(E16-24)*1999');formula('G12','SUM(D16-6)*650');break;
    case 'A3-S011':
      if (customer.quotationType !== 'project') return undefined;
      for (const address of ['F15','G15','J15']) add({kind:'clear',address});
      add({kind:'format_cells',address:'',range:'F7:I15',numberFormat:'\"RM\" #,##0.00'});
      add({kind:'format_cells',address:'',range:'F16:J16',numberFormat:'\"RM\" #,##0.00'});break;
    case 'A3-S012':
      add({kind:'insert_rows',address:'',beforeRow:18,count:19});set('A18','Supplementary');
      for(const [col,label] of Object.entries({A:'No',B:'Name',D:'sqft / per',E:'Qty / per',F:'RM49800',G:'RM79800',H:'Software Price',I:'Before Price',J:'After Price'}))set(`${col}19`,label);
      break;
    case 'A3-S013':
      // User-supplied Fang reference resolves the unpunctuated painting text:
      // white paint and three-colour Nippon paint are separate line items.
      ['Defect Check before start work','3D & 2D design and submission','Project management','Post reno cleaning','Floor Protection (Floor guard)','Electrical','Plaster ceiling','Painting with white paint','Paint with 3 colour nippon colours','Partition ( normal w/o sounds proof)','Curtain with Blind per window H 8-9ft','Hacking & Removal','Grout','Mirror'].forEach((name,i)=>set(`B${20+i}`,name));break;
    case 'A3-S014':
      add({kind:'sequence',address:'',range:'A20:A33'});set('I3',0.8);add({kind:'format_cells',address:'',range:'I3',numberFormat:'0.00E+00'});break;
    case 'A3-S015': {
      const missing = Array.from({length:14},(_,i)=>`B${20+i}`).filter(address=>!String(matches[0].cells[address]?.value ?? '').trim());
      if (missing.length) return {stepId:step.id,status:'needs_review',reason:`Supplementary requires 14 named items before assigning 14 rates. Missing labels: ${missing.join(', ')}. User clarification is required; no rates were applied.`,operations:[],executor:'deterministic'};
      const rates=[1,5,6,1,1,19,10,9,12,24,43,77,6.5,50];
      rates.forEach((rate,i)=>{
        const row=20+i;
        set(`D${row}`,rate);set(`E${row}`,0);
        formula(`I${row}`,`SUM(D${row}*$F$4)`);
        if(row<=24)set(`J${row}`,0);else formula(`J${row}`,`SUM(I${row}*$I$3)`);
        formula(`F${row}`,`J${row}`);formula(`G${row}`,`J${row}`);
      });break;
    }
    case 'A3-S016':
      set('A34','Total Supplementary :');set('A35','Total Whole House Price with Supplementary Items');
      for(const col of ['F','G','H','I','J'])formula(`${col}34`,`SUM(${col}20:${col}33)`);break;
    case 'A3-S017':
      if (!context.userDecisions?.some(d=>d.includes('Use J14+J34'))) return undefined;
      for(const col of ['F','G','H','I']) formula(`${col}35`,`${col}16+${col}34`);
      formula('J35','J14+J34');
      formula('G4','MIN(F35,G35,I35,J35)/F4');formula('H4','J35/F4');break;
    case 'A3-S018': {
      const prices=['F','G','I','J'].map(col=>({col,value:matches[0].cells[`${col}34`]?.value}));
      if(prices.some(p=>typeof p.value!=='number'||!Number.isFinite(p.value))) return {stepId:step.id,status:'needs_review',reason:'All four supplementary totals must be calculated before highlighting the cheapest.',operations:[],executor:'deterministic'};
      const lowest=Math.min(...prices.map(p=>p.value as number));
      add({kind:'insert_rows',address:'',beforeRow:120,count:11});
      set('A120','M&E Work');set('D128','Curtain');
      for(const row of [121,126])for(const [col,label] of Object.entries({A:'No',D:'Name',E:'Model',G:'Qty'}))set(`${col}${row}`,label);
      for(const p of prices)if(p.value===lowest)add({kind:'format_cells',address:'',range:`${p.col}34`,numberFormat:'"RM" #,##0.00',fillColor:'00FF00'});
      break;
    }
    case 'A3-S019': {
      if(!context.userDecisions?.some(d=>d.includes('E212 / E213'))) return undefined;
      const text=step.text;
      set('E212',text.split('Cell E212\n')[1].split('\nNext row')[0]);
      set('E213',text.split('Next row\n')[1].split('\nCell E128')[0]);
      set('E128',text.split('Cell E128\n')[1]);break;
    }
    case 'A3-S020':
      set('D122','Electrical and Plaster work');set('D128','Curtain');
      set('G122',1);set('G128',1);break;
    case 'A3-S021':break;
    case 'A3-S022':replace(['A'],[['柜体合计','Cabinet Total Price'],['配套品合计','Accessories Total Price'],['合计','Total Price']]);break;
    case 'A3-S023':replace(['A'],[['配套品表','Accessories Table'],['柜体表','Cabinet Table']]);break;
    case 'A3-S024':replace(['A','B'],[['客卧房','客卧房//Guest Bedroom'],['书房','书房//Study Room'],['客餐厅','客餐厅//Living and Dining Room']]);break;
    case 'A3-S025':replace(['A','B'],[['门厅','门厅//Foyer.'],['主卧房','主卧房//Master Bedroom']]);break;
    case 'A3-S026':replace(['A','B'],[['厨房','厨房//Kitchen'],['多功能空间','多功能空间//Multipurpose Room'],['儿童房','儿童房//Kids Room']]);break;
    case 'A3-S027':replace(['A','B'],[['序号','No'],['产品图片','Product PIC']]);replace(['C','D'],[['组合','Combi'],['名称','Name']]);break;
    case 'A3-S028':replace(['E','F'],[['型号','Model'],['宽深高','WDH']]);replace(['G','H'],[['数量','Qty'],['单价','Before Price']]);break;
    case 'A3-S029':replace(['C'],[['23系统柜','23 system cabinet'],['25厨柜','25 Kitchen Cabinet'],['美家背景墙','Background Wall Panel'],['新居产品','New Product']]);break;
    case 'A3-S031': {
      if(!context.userDecisions?.includes('Use actual labeled total rows for step 31 instead of H54/H68/H110.')) return undefined;
      const labels=Object.values(matches[0].cells).filter(c=>c.column===1&&c.row>35).sort((a,b)=>a.row-b.row);
      let headerRow=0; let roomTotals:string[]=[];
      for(const cell of labels) {
        const label=String(cell.value).trim();
        if(label==='No') headerRow=cell.row;
        if(/Total Price[:：]?$/.test(label)&&label!=='Total Price:') {
          if(!headerRow||headerRow>=cell.row)return {stepId:step.id,status:'needs_review',reason:'Cannot identify a detail table header before its subtotal.',operations:[],executor:'deterministic'};
          formula(`H${cell.row}`,`SUM(H${headerRow+1}:H${cell.row-1})`);
          roomTotals.push(`H${cell.row}`);headerRow=0;
        } else if(/^Total Price[:：]?$/.test(label)) {
          if(!roomTotals.length)return {stepId:step.id,status:'needs_review',reason:'No source subtotals found for room total.',operations:[],executor:'deterministic'};
          formula(`H${cell.row}`,`SUM(${roomTotals.join(',')})`);roomTotals=[];
        }
      }
      for(const cell of Object.values(matches[0].cells)) {
        if(cell.row<36)continue;
        if(['H','I','J'].includes(cell.address.replace(/\d+$/,''))&&typeof cell.value==='string'&&/price/i.test(cell.value)) {
          const col=cell.address.replace(/\d+$/,'');set(cell.address,col==='H'?'Software Price':col==='I'?'Before Price':'After Price');
          if(col==='H'){set(`I${cell.row}`,'Before Price');set(`J${cell.row}`,'After Price');}
        }
      }
      break;
    }
    case 'A3-S033': {
      const remarks=Object.values(matches[0].cells).filter(c=>c.column===1&&String(c.value).includes('备注'));
      if(remarks.length!==1 || !matches[0].mergedRanges.some(r=>r.startsWith(`${remarks[0].address}:`)))return {stepId:step.id,status:'needs_review',reason:'Cannot uniquely identify the existing merged remark block.',operations:[],executor:'deterministic'};
      add({kind:'replace_logo',address:''});
      const remark=step.text.slice(step.text.indexOf("'Remark:")+1).replace(/'$/,'');
      set(remarks[0].address,remark);break;
    }
    case 'A3-S032': {
      const covered=(address:string)=>matches[0].mergedRanges.some(range=>{
        const [start,end=start]=range.split(':');
        const a=/^([A-Z]+)(\d+)$/.exec(start)!,b=/^([A-Z]+)(\d+)$/.exec(end)!,c=/^([A-Z]+)(\d+)$/.exec(address)!;
        const col=(v:string)=>[...v].reduce((n,ch)=>n*26+ch.charCodeAt(0)-64,0);
        return address!==start&&col(c[1])>=col(a[1])&&col(c[1])<=col(b[1])&&Number(c[2])>=Number(a[2])&&Number(c[2])<=Number(b[2]);
      });
      for(let row=40;row<=222;row++) {
        for(const [target,source,factor] of [['I','H','H'],['J','I','I']]) {
          const address=`${target}${row}`;
          if(covered(address))continue;
          if(/price/i.test(String(matches[0].cells[address]?.value??'')))continue;
          formula(address,`IF(ISNUMBER(${source}${row}),${source}${row}*${factor}$2,"")`);
        }
      }break;
    }
    case 'A3-S030': {
      if(!context.userDecisions?.includes('Set absent Guest Bedroom and Kids Room totals H7/H8 to 0.')) return undefined;
      const cells=Object.values(matches[0].cells);
      for(const [room,target] of [['客卧房','H7'],['儿童房','H8'],['主卧房','H9'],['客餐厅','H10']]) {
        const headings=cells.filter(c=>c.column===1&&c.row>35&&String(c.value).includes(room));
        if(headings.length===0 && (target==='H7'||target==='H8')){set(target,0);continue;}
        if(headings.length!==1)return {stepId:step.id,status:'needs_review',reason:`Cannot uniquely locate ${room} detail heading.`,operations:[],executor:'deterministic'};
        const totals=cells.filter(c=>c.column===1&&c.row>headings[0].row&&/^Total Price[:：]?$/.test(String(c.value).trim())).sort((a,b)=>a.row-b.row);
        const total=totals[0];
        if(!total || typeof matches[0].cells[`H${total.row}`]?.value!=='number')return {stepId:step.id,status:'needs_review',reason:`Missing numeric source total for ${room}.`,operations:[],executor:'deterministic'};
        formula(target,`H${total.row}`);
      }
      break;
    }

  }
  if (!operations.length) return {stepId:step.id,status:'no_change',reason:step.id==='A3-S021'?'Translation section heading; no operation specified.':'Scanned all specified columns; no untranslated matching source text remains.',operations:[],executor:'deterministic'};
  return {stepId:step.id,status:'ready',reason:'Compiled from the pinned official Area 3 instructions; operations are validated and committed by the sequential executor.',operations,executor:'deterministic'};
}
export function createHybridStepPlanner(fallback: StepPlanner = planGeminiStep): StepPlanner {
  return async context => {
    const compiled = planDeterministicStep(context);
    if (compiled) return compiled;
    const unresolved = context.history.filter(e=>e.status==='needs_review');
    if (unresolved.length) return {stepId:context.step.id,status:'needs_review',reason:'Earlier instruction is unresolved; Gemini was not called for this dependent step.',operations:[],blockedBy:unresolved.map(e=>e.stepId!).filter(Boolean),executor:'deterministic'};
    if(context.recipe.area===3){
      const reason=context.recipe.sourceSha256!==AREA3_HASH?'The installed Area 3 recipe does not match the reviewed version.':context.step.id==='A3-S011'&&context.customer.quotationType!=='project'?'This reviewed Area 3 release requires Project quotation type. Residential rules have not been validated.':'The source layout or required review decisions do not match the compiled Area 3 rule.';
      return {stepId:context.step.id,status:'needs_review',reason:`${context.step.id}: ${reason} No Gemini request was made.`,operations:[],executor:'deterministic'};
    }
    const effective = context.customer.quotationType === 'project' ? {...context,userDecisions:[...(context.userDecisions || []),'This is a Project quotation. Do not deduct any design fee, regardless of sqft. Preserve row positions.']} : context;
    return {...await fallback(effective),executor:'gemini'};
  };
}
export const planHybridStep = createHybridStepPlanner();
