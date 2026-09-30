import type { CustomerWorkbookSheet } from '../types';
type Value = string | number | boolean | null;
type Expr = { type: 'value'; value: Value } | { type: 'ref'; sheet?: string; from: string; to?: string }
  | { type: 'call'; name: string; args: Expr[] } | { type: 'binary'; op: string; a: Expr; b: Expr }
  | { type: 'unary'; op: string; a: Expr };
const numeric = (value: Value): number => {
  if (value === null || value === '') return 0;
  if (typeof value === 'boolean') return Number(value);
  const number = typeof value === 'number' ? value : /^\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:E[+-]?\d+)?\s*$/i.test(value) ? Number(value) : NaN;
  if (!Number.isFinite(number)) throw new Error('Non-numeric value');
  return number;
};
function parse(formula: string): Expr {
  const tokens: Array<{ type: string; text: string }> = [];
  let text = formula.replace(/^=/,'');
  while (text.trim()) {
    text=text.trimStart();
    const candidates: Array<[string,RegExp]> = [
      ['string', /^"(?:[^"]|"")*"/],
      ['number', /^(?:\d+(?:\.\d*)?|\.\d+)(?:E[+-]?\d+)?/i],
      ['ref', /^(?:(?:'(?:[^']|'')+'|[\p{L}_][\p{L}\p{N}_.]*)!)?\$?[A-Z]{1,3}\$?[1-9]\d*(?::\$?[A-Z]{1,3}\$?[1-9]\d*)?(?![\p{L}\p{N}_.(])/iu],
      ['word', /^[A-Z_][A-Z_\d.]*/i], ['operator', /^(?:<=|>=|<>|[+\-*/^%=<>(),])/],
    ];
    const match=candidates.map(([type,re])=>({type,result:re.exec(text)})).find(m=>m.result);
    if (!match || tokens.length>8192) throw new Error('Unsupported formula syntax');
    tokens.push({type:match.type,text:match.result![0]}); text=text.slice(match.result![0].length);
  }
  let index=0;
  const consume=(text:string)=>{if(tokens[index++]?.text!==text)throw new Error('Invalid formula');};
  const levels:Record<string,number>={'=':1,'<>':1,'<':1,'>':1,'<=':1,'>=':1,'+':2,'-':2,'*':3,'/':3,'^':4};
  const expression=(min=0):Expr=>{
    const token=tokens[index++]; if(!token)throw new Error('Incomplete formula');
    let node:Expr;
    if(token.text==='+' || token.text==='-')node={type:'unary',op:token.text,a:expression(5)};
    else if(token.text==='('){node=expression();consume(')');}
    else if(token.type==='number')node={type:'value',value:Number(token.text)};
    else if(token.type==='string')node={type:'value',value:token.text.slice(1,-1).replace(/""/g,'"')};
    else if(token.type==='ref'){
      const parts=token.text.split('!'), refs=parts.pop()!.replace(/\$/g,'').toUpperCase().split(':');
      const name=parts.length?parts.join('!'):undefined;
      node={type:'ref',from:refs[0],to:refs[1],sheet:name?.startsWith("'")?name.slice(1,-1).replace(/''/g,"'"):name};
    }else if(token.type==='word'){
      const name=token.text.toUpperCase();
      if(name==='TRUE'||name==='FALSE')node={type:'value',value:name==='TRUE'};
      else {consume('(');const args:Expr[]=[];
        if(tokens[index]?.text!==')'){do{if(args.length)consume(',');args.push(expression());}while(tokens[index]?.text===',');}
        consume(')');node={type:'call',name,args};}
    }else throw new Error('Unsupported token');
    while(index<tokens.length){
      const op=tokens[index].text;
      if(op==='%'){index++;node={type:'unary',op,a:node};continue;}
      if(levels[op]===undefined||levels[op]<min)break;
      index++;node={type:'binary',op,a:node,b:expression(levels[op]+1)};
    }return node;
  };
  const result=expression();if(index!==tokens.length)throw new Error('Trailing formula syntax');return result;
}
function coordinate(address:string){
  const m=/^([A-Z]{1,3})([1-9]\d*)$/.exec(address);if(!m)throw new Error('Invalid reference');
  const column=[...m[1]].reduce((n,c)=>n*26+c.charCodeAt(0)-64,0),row=Number(m[2]);
  if(column>16384||row>1048576)throw new Error('Reference outside worksheet');return {column,row};
}
function columnName(n:number){let s='';while(n){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26);}return s;}
function calculate(sheet:CustomerWorkbookSheet,address:string,sheets:CustomerWorkbookSheet[],visiting:Set<string>):Value{
  coordinate(address);const key=`${sheet.name}!${address}`;
  if(visiting.has(key)||visiting.size>500)throw new Error('Cyclic/excessive dependency');
  const cell=sheet.cells[address];if(!cell)return null;
  if(!cell.formula){
    if(typeof cell.value==='string'&&/^#(?:REF!|DIV\/0!|VALUE!|N\/A|NAME\?|NUM!|NULL!|SPILL!|CALC!)/.test(cell.value))throw new Error('Source spreadsheet error');
    return cell.value===''?null:cell.value;
  }
  visiting.add(key);
  const target=(name?:string)=>{const result=name?sheets.find(s=>s.name.toLowerCase()===name.toLowerCase()):sheet;if(!result)throw new Error('Missing sheet');return result;};
  const evaluate=(node:Expr):Value=>{
    if(node.type==='value')return node.value;
    if(node.type==='ref'){if(node.to)throw new Error('Range requires aggregate');return calculate(target(node.sheet),node.from,sheets,visiting);}
    if(node.type==='unary'){const v=numeric(evaluate(node.a));return node.op==='-'?-v:node.op==='%'?v/100:v;}
    if(node.type==='binary'){
      const left=evaluate(node.a),right=evaluate(node.b);
      if(['=','<>','<','>','<=','>='].includes(node.op)){
        const normalize=(value:Value,other:Value):Exclude<Value,null>=>value===null?(typeof other==='string'?'':typeof other==='boolean'?false:0):typeof value==='string'?value.toLowerCase():value;
        const a=normalize(left,right),b=normalize(right,left);
        const rank=(value:Exclude<Value,null>)=>typeof value==='number'?0:typeof value==='string'?1:2;
        const comparison=typeof a===typeof b?(a===b?0:a<b?-1:1):rank(a)-rank(b);
        return node.op==='='?comparison===0:node.op==='<>'?comparison!==0:node.op==='<'?comparison<0:node.op==='>'?comparison>0:node.op==='<='?comparison<=0:comparison>=0;
      }
      const a=numeric(left),b=numeric(right),value=node.op==='+'?a+b:node.op==='-'?a-b:node.op==='*'?a*b:node.op==='/'?a/b:a**b;
      if(!Number.isFinite(value))throw new Error('Invalid arithmetic');return value;
    }
    if(node.name==='IF'&&node.args.length===3)return evaluate(node.args[numeric(evaluate(node.args[0]))?1:2]);
    if(node.name==='ISNUMBER'&&node.args.length===1)return typeof evaluate(node.args[0])==='number';
    if(node.name==='ISBLANK'&&node.args.length===1)return evaluate(node.args[0])===null;
    if(['SUM','MIN','MAX'].includes(node.name)&&node.args.length){
      const values:number[]=[];
      for(const arg of node.args){
        if(arg.type==='ref'){
          const a=coordinate(arg.from),b=coordinate(arg.to||arg.from);
          if((Math.abs(a.row-b.row)+1)*(Math.abs(a.column-b.column)+1)>100000)throw new Error('Range too large');
          for(let row=Math.min(a.row,b.row);row<=Math.max(a.row,b.row);row++)for(let col=Math.min(a.column,b.column);col<=Math.max(a.column,b.column);col++){
            const value=calculate(target(arg.sheet),`${columnName(col)}${row}`,sheets,visiting);
            if(typeof value==='number')values.push(value);
          }
        }else values.push(numeric(evaluate(arg)));
      }
      return !values.length?0:node.name==='SUM'?values.reduce((a,b)=>a+b,0):node.name==='MIN'?Math.min(...values):Math.max(...values);
    }
    throw new Error('Unsupported spreadsheet function');
  };
  try{const value=evaluate(parse(cell.formula));if(typeof value==='number'&&!Number.isFinite(value))throw new Error('Nonfinite result');return value;}
  finally{visiting.delete(key);}
}
/** Restricted Excel interpreter: lazy IF, typed references, ranges and cross-sheet
 * dependencies. Never evaluates formula text as JavaScript. */
export function evaluateExcelValue(sheet:CustomerWorkbookSheet,address:string,sheets:CustomerWorkbookSheet[]=[sheet]):string|number|undefined{
  try{const value=calculate(sheet,address.toUpperCase(),sheets,new Set());return typeof value==='boolean'?Number(value):value??0;}catch{return undefined;}
}
export function evaluateExcelNumber(sheet:CustomerWorkbookSheet,address:string):number|undefined{
  try{const value=evaluateExcelValue(sheet,address);return value===undefined?undefined:numeric(value);}catch{return undefined;}
}
