import type { CustomerWorkbookSheet, DocumentedPromptExecution } from '../src/types.js';
import { createHash } from 'node:crypto';
import { officialAreaCatalog } from './officialAreaCatalog.js';
import { createPreservedTemplateWorkbook, readTemplateWorkbook, type TemplateCellPatch, type TemplateOperation } from './templateWorkbook.js';
import { evaluateWorkbookValue } from '../src/lib/formulaEvaluator.js';

export type OfficialRecipe = typeof officialAreaCatalog[number];
export type OfficialStep = OfficialRecipe['steps'][number];
export interface RecipeCustomer { name: string; address: string; sqft: number; budget: number; currency: string; quotationType?: 'residential' | 'project' }
export interface StepPlan {
  executor?: 'deterministic' | 'gemini';
  stepId: string;
  status: 'ready' | 'needs_review' | 'no_change';
  reason: string;
  operations: Array<{
    kind: 'replace_logo' | 'set' | 'formula' | 'clear' | 'copy' | 'insert_rows' | 'copy_column' | 'format_cells' | 'sequence'; sheetName: string; address: string;
    beforeRow?: number; count?: number; inheritHorizontalMerges?: boolean;
    sourceColumn?: string; targetColumn?: string;
    range?: string; numberFormat?: string; fillColor?: string;
    value?: string | number; formula?: string; sourceAddress?: string; evidence: string;
  }>;
  blockedBy?: string[];
}
export interface StepContext {
  recipe: OfficialRecipe; step: OfficialStep; customer: RecipeCustomer;
  sheets: CustomerWorkbookSheet[]; history: DocumentedPromptExecution[];
  userDecisions?: string[];
}
export type StepPlanner = (context: StepContext) => Promise<StepPlan>;
export interface RecipeCheckpoint {
  area: number; sourceSha256: string; recipeSha256: string; customerSha256: string;
  decisionsSha256?: string;
  nextStep: number; executions: DocumentedPromptExecution[];
  patches: TemplateOperation[];
}
export interface RecipeProgress { current: number; total: number; stepId: string; status: 'planning' | 'applied' | 'needs_review' | 'skipped' }

/** One ordered plan per section, then one atomic validated commit. */
export async function executeSequentialRecipe(raw: Buffer, filename: string, area: number, customer: RecipeCustomer, options: {
  planner: StepPlanner;
  userDecisions?: string[];
  resume?: RecipeCheckpoint;
  checkpoint?: (checkpoint: RecipeCheckpoint, progress: RecipeProgress) => Promise<void>;
  progress?: (progress: RecipeProgress) => Promise<void>;
}) {
  const recipe = officialAreaCatalog.find(r => r.area === area);
  if (!recipe) throw new Error(`Missing official Area ${area} document.`);
  const original = await createPreservedTemplateWorkbook(raw, filename);
  const customerSha256 = createHash('sha256').update(JSON.stringify(customer)).digest('hex');
  const decisionsSha256 = createHash('sha256').update(JSON.stringify(options.userDecisions || [])).digest('hex');
  const resume = options.resume;
  if (resume && (resume.decisionsSha256 ? resume.decisionsSha256 !== decisionsSha256 : !!options.userDecisions?.length)) throw new Error('Checkpoint user decisions have changed. Replay from the original source.');
  if (resume && (resume.area !== area || resume.sourceSha256 !== original.originalSha256 || resume.recipeSha256 !== recipe.sourceSha256 || resume.customerSha256 !== customerSha256))
    throw new Error('Checkpoint does not match the immutable source and selected recipe.');
  if (resume && (resume.nextStep !== resume.executions.length || resume.nextStep < 0 || resume.nextStep > recipe.steps.length))
    throw new Error('Invalid recipe checkpoint position.');
  if (resume?.executions.some((e, i) => e.stepId !== recipe.steps[i]?.id || e.instruction !== recipe.steps[i]?.text))
    throw new Error('Checkpoint prompt sequence differs from the current official recipe.');
  let patches = structuredClone(resume?.patches || []);
  const executions = structuredClone(resume?.executions || []);
  let preserved = await createPreservedTemplateWorkbook(raw, filename, patches);
  let sheets = await readTemplateWorkbook(Buffer.from(preserved.transformedXlsxBase64, 'base64'));
  for (let index = resume?.nextStep || 0; index < recipe.steps.length; index++) {
    const step = recipe.steps[index];
    await options.progress?.({ current: index + 1, total: recipe.steps.length, stepId: step.id, status: 'planning' });
    // Provider/network failure must abort and preserve the last durable checkpoint,
    // not fabricate needs-review results for prompts that were never submitted.
    const plan = await options.planner({ recipe, step, customer, sheets: structuredClone(sheets), history: structuredClone(executions), userDecisions: options.userDecisions });
    const execution: DocumentedPromptExecution = {
      promptNumber: index + 1, stepId: step.id, category: step.lines[0].text,
      instruction: step.text, sourceDocument: recipe.sourceDocument,
      sourceLocations: step.lines.map(l => ({ id: l.id, location: l.location })),
      status: 'needs_review', result: plan.reason, changes: [],
      executor: plan.executor,
    };
    try {
      if (plan.stepId !== step.id) throw new Error('Response is for a different prompt.');
      if (!['ready', 'needs_review', 'no_change'].includes(plan.status) || !Array.isArray(plan.operations) || !plan.reason?.trim()) throw new Error('Invalid step response.');
      if (plan.status !== 'ready' && plan.operations.length) throw new Error('Non-ready prompt cannot contain changes.');
      if (plan.status === 'no_change') execution.status = 'skipped';
      if (plan.status === 'ready') {
        if (executions.some(e => e.status === 'needs_review')) throw new Error('Earlier instruction is unresolved; downstream edits are held to preserve sequence.');
        if (!plan.operations.length || plan.operations.length > 20000) throw new Error('Invalid operation count.');
        if (plan.blockedBy?.length) throw new Error(`Depends on unresolved steps: ${plan.blockedBy.join(', ')}`);
        let model = structuredClone(sheets);
        const structure: TemplateOperation[] = [];
        const formats: TemplateOperation[] = [];
        const numericLiterals = (text: string) => [...text.replace(/\bRM(?=\d)/g, '').replace(/(?<![\w.])\$?[A-Z]{1,3}\$?\d+\b/gi, '').matchAll(/(?:\d+(?:\.\d*)?|\.\d+)(?:E[+-]?\d+)?%?/gi)]
          .map(m => m[0].endsWith('%') ? Number(m[0].slice(0, -1))/100 : Number(m[0]));
        const allowedNumbers = new Set([...numericLiterals(step.text), customer.sqft, customer.budget]);
        if(step.id==='A3-S030' && options.userDecisions?.includes('Set absent Guest Bedroom and Kids Room totals H7/H8 to 0.')) allowedNumbers.add(0);
        const changed = new Map<string, TemplateCellPatch>();
        const operations = plan.operations.flatMap(op => {
          if (op.kind !== 'clear' && op.kind !== 'set') return [op];
          const range = /^(\$?[A-Z]{1,3}\$?[1-9]\d*):(\$?[A-Z]{1,3}\$?[1-9]\d*)$/i.exec(op.address || op.range || '');
          if (!range) return [op];
          const coordinate = (s: string) => { const m=/^([A-Z]+)(\d+)$/.exec(s.replace(/\$/g,'').toUpperCase())!; return { col:[...m[1]].reduce((n,c)=>n*26+c.charCodeAt(0)-64,0),row:Number(m[2]) }; };
          const a=coordinate(range[1]),b=coordinate(range[2]);
          if(a.col>b.col||a.row>b.row||b.col>16384||b.row>1048576||(b.col-a.col+1)*(b.row-a.row+1)>20000)throw new Error('Invalid scalar operation range.');
          const expanded:typeof plan.operations=[];
          for(let row=a.row;row<=b.row;row++)for(let col=a.col;col<=b.col;col++){
            let n=col,letter='';while(n){n--;letter=String.fromCharCode(65+n%26)+letter;n=Math.floor(n/26);}
            expanded.push({...op,address:`${letter}${row}`});
          }
          return expanded;
        });
        if (operations.length > 20000) throw new Error('Expanded operation count exceeds limit.');
        for (const op of operations) {
          if (!op.evidence?.trim() || !step.text.includes(op.evidence)) throw new Error('Patch evidence must quote the current official instruction.');
          if(op.kind==='replace_logo'){
            if(!['A3-S033','A2-S033'].includes(step.id))throw Error('Logo replacement requires the explicit final branding instruction.');
            structure.push({kind:'replace_logo',sheetName:op.sheetName,promptNumber:String(index+1)});continue;
          }
          if (op.kind === 'format_cells') {
            if (!op.range || !op.numberFormat) throw new Error('Formatting requires a range and number format.');
            formats.push({ kind: 'format_cells', sheetName: op.sheetName, range: op.range, numberFormat: op.numberFormat, fillColor: op.fillColor, promptNumber: String(index + 1) });
            continue;
          }
          if (op.kind === 'copy_column') {
            if (changed.size) throw new Error('Column copies must precede cell writes within a section.');
            if (!op.sourceColumn || !op.targetColumn) throw new Error('Column copy requires source and target columns.');
            const copy = { kind: 'copy_column' as const, sheetName: op.sheetName, sourceColumn: op.sourceColumn, targetColumn: op.targetColumn, promptNumber: String(index + 1) };
            const staged = await createPreservedTemplateWorkbook(raw, filename, [...patches, ...structure, copy]);
            structure.push(copy);
            model = await readTemplateWorkbook(Buffer.from(staged.transformedXlsxBase64, 'base64'));
            continue;
          }
          if (op.kind === 'insert_rows') {
            if (changed.size) throw new Error('Row insertions must precede cell writes within a section.');
            if (!Number.isInteger(op.count) || !numericLiterals(step.text).includes(op.count!)) throw new Error('Row count must be documented in this instruction.');
            const insertion = { kind: 'insert_rows' as const, sheetName: op.sheetName, beforeRow: op.beforeRow!, count: op.count!, inheritHorizontalMerges: op.inheritHorizontalMerges, promptNumber: String(index + 1) };
            const staged = await createPreservedTemplateWorkbook(raw, filename, [...patches, ...structure, insertion]);
            structure.push(insertion);
            model = await readTemplateWorkbook(Buffer.from(staged.transformedXlsxBase64, 'base64'));
            continue;
          }
          const sheet = model.find(s => s.name === op.sheetName);
          if (!sheet) throw new Error(`Unknown sheet ${op.sheetName}`);
          if (op.kind === 'sequence') {
            if (!/\b(?:serial|sequential)\b/i.test(step.text)) throw new Error('Sequence requires an explicit numbering instruction.');
            const range = /^A([1-9]\d*):A([1-9]\d*)$/i.exec(op.range || '');
            if (!range || Number(range[2]) < Number(range[1]) || Number(range[2]) > 1048576 || Number(range[2]) - Number(range[1]) > 1000) throw new Error('Serial numbering requires a bounded column A range.');
            for (let row = Number(range[1]); row <= Number(range[2]); row++) {
              const address = `A${row}`, value = row - Number(range[1]) + 1;
              sheet.cells[address] = { address, row, column: 1, value };
              changed.set(`${sheet.name}!${address}`, { sheetName: sheet.name, address, value, promptNumber: String(index + 1) });
            }
            continue;
          }
          const address = op.address?.replace(/\$/g,'').toUpperCase();
          const match = /^([A-Z]{1,3})([1-9]\d*)$/.exec(address);
          if (!match) throw new Error(`Invalid target cell for ${op.kind}: ${String(op.address).slice(0,80)}`);
          const column = [...match[1]].reduce((n,c) => n*26+c.charCodeAt(0)-64,0), row = Number(match[2]);
          if (row > 1048576 || column > 16384) throw new Error('Cell exceeds Excel limits.');
          let value: string | number = '', formula: string | undefined;
          if (op.kind === 'formula') {
            if (!op.formula?.trim()) throw new Error('Missing formula.');
            formula = op.formula.replace(/^=/, '');
            if (formula.length > 8192) throw new Error('Formula exceeds Excel limits.');
            if (numericLiterals(formula).some(n => !allowedNumbers.has(n))) throw new Error('Formula contains a numeric constant absent from this instruction/customer inputs. Reference source cells instead.');
          } else if (op.kind === 'copy') {
            const source = sheet.cells[op.sourceAddress?.toUpperCase() || ''];
            if (!source) throw new Error('Copy source cell was not found.');
            // Copying relative formulas needs reference translation. Do not
            // silently paste a stale cached value in place of that formula.
            if (source.formula) throw new Error('Formula-copy reference translation needs review.');
            value = source.value;
          } else if (op.kind === 'set') {
            if (typeof op.value !== 'string' && typeof op.value !== 'number') throw new Error('Missing scalar cell value.');
            value = op.value;
            if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Nonfinite numeric input.');
            if (typeof value === 'number' && !allowedNumbers.has(Math.abs(value)) && !allowedNumbers.has(value)) throw new Error('Numeric value is not documented in this instruction/customer inputs; use a source-cell copy or formula.');
          } else if (op.kind !== 'clear') throw new Error('Unsupported operation.');
          sheet.cells[address] = { address, row, column, value, ...(formula ? { formula } : {}) };
          changed.set(`${sheet.name}!${address}`, { sheetName: sheet.name, address, value, formula, promptNumber: String(index + 1) });
        }
        // Preserve unrelated supplier sheets, including pre-existing formula
        // defects. Recalculate edited sheets and conservatively include sheets
        // with cross-sheet references or structurally shifted formulas.
        const recalculateSheets = new Set(plan.operations.map(op=>op.sheetName));
        for(const sheet of model) for(const cell of Object.values(sheet.cells)) {
          if(cell.formula && (cell.formula.includes('!') || cell.formula !== sheets.find(s=>s.name===sheet.name)?.cells[cell.address]?.formula)) recalculateSheets.add(sheet.name);
        }
        for (const sheet of model) for (const cell of Object.values(sheet.cells)) {
          if (!cell.formula || !recalculateSheets.has(sheet.name)) continue;
          const value = evaluateWorkbookValue(sheet, cell.address, model);
          if (value === undefined) throw new Error(`Cannot recalculate ${sheet.name}!${cell.address}; step rolled back.`);
          const before = sheets.find(s => s.name === sheet.name)!.cells[cell.address];
          if (value !== before?.value || changed.has(`${sheet.name}!${cell.address}`))
            changed.set(`${sheet.name}!${cell.address}`, { sheetName: sheet.name, address: cell.address, formula: cell.formula, value, promptNumber: String(index + 1) });
        }
        const additions = [...changed.values()];
        // The user-confirmed Project exemption overrides later sqft deduction
        // instructions. Reject a conflicting plan instead of silently charging it.
        if (area === 3 && customer.quotationType === 'project' && index >= 7) {
          const summary = model.find(s => s.cells.A5?.value === 'Whole House Total');
          if (summary) for (const address of ['F15','G15','J15']) {
            const cell=summary.cells[address];
            const value=cell?.formula ? evaluateWorkbookValue(summary,address,model) : cell?.value;
            if (value !== undefined && value !== '' && value !== 0) throw new Error(`Project quotation cannot contain a design-fee deduction at ${address}.`);
          }
        }
        // This call checks merges, array formulas, styles and all protected ZIP entries.
        const candidate = await createPreservedTemplateWorkbook(raw, filename, [...patches, ...structure, ...additions, ...formats]);
        execution.changes = additions.map(p => ({ sheetName: p.sheetName, address: p.address, before: sheets.find(s => s.name === p.sheetName)!.cells[p.address]?.value ?? '', after: p.value ?? '', formula: p.formula }));
        execution.status = 'applied';
        execution.structuralChanges = structure.filter(p => p.kind === 'insert_rows').map(p => ({ sheetName: p.sheetName, beforeRow: p.beforeRow, count: p.count }));
        execution.columnCopies = structure.filter(p => p.kind === 'copy_column').map(p => ({ sheetName: p.sheetName, sourceColumn: p.sourceColumn, targetColumn: p.targetColumn }));
        execution.formatChanges = formats.filter(p => p.kind === 'format_cells').map(p => ({ sheetName: p.sheetName, range: p.range, numberFormat: p.numberFormat, fillColor: p.fillColor }));
        preserved = candidate; patches = [...patches, ...structure, ...additions, ...formats];
        sheets = await readTemplateWorkbook(Buffer.from(preserved.transformedXlsxBase64, 'base64'));
      }
    } catch (error) {
      execution.status = 'needs_review'; execution.changes = [];
      execution.result = `Step rolled back: ${(error as Error).message}`;
    }
    executions.push(execution);
    const progress: RecipeProgress = { current: index + 1, total: recipe.steps.length, stepId: step.id, status: execution.status === 'applied' ? 'applied' : execution.status === 'skipped' ? 'skipped' : 'needs_review' };
    await options.checkpoint?.({ area, sourceSha256: original.originalSha256, recipeSha256: recipe.sourceSha256, customerSha256, decisionsSha256, nextStep: index + 1, executions: structuredClone(executions), patches: structuredClone(patches) }, progress);
    await options.progress?.(progress);
  }
  return { preserved, workbookSheets: sheets, executions, patches };
}
