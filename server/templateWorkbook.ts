import {replaceTemplateLogo,finishQuotationLayout,type BrandOperation} from './templateBrand.js';
import crypto from 'node:crypto';
import path from 'node:path';
import JSZip from 'jszip';
import { insertTemplateRows, type InsertRowsOperation } from './templateRows.js';
import { copyTemplateColumn, type CopyColumnOperation } from './templateColumns.js';
import { formatTemplateCells, type FormatCellsOperation } from './templateFormat.js';
import type { PreservedTemplateWorkbook, CustomerWorkbookSheet } from '../src/types.js';

export interface TemplateCellPatch {
  kind?: 'cell';
  sheetName: string;
  address: string;
  value?: string | number;
  formula?: string;
  promptNumber?: string;
}
export type TemplateOperation = TemplateCellPatch | BrandOperation | InsertRowsOperation | CopyColumnOperation | FormatCellsOperation;

const decode = (s: string) => s.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e) =>
  e[0] === '#' ? String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) :
    ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[e] || _));
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const attributes = (s: string): Record<string, string> => Object.fromEntries([...s.matchAll(/([\w:.-]+)\s*=\s*(["'])(.*?)\2/g)].map(m => [m[1], decode(m[3])]));
const cellPattern = /<c\b[^>]*?(?:\/>|>[\s\S]*?<\/c>)/g;
const addressParts = (address: string) => {
  const m = /^([A-Z]{1,3})([1-9]\d*)$/.exec(address);
  if (!m) throw new Error(`Invalid cell address ${address}`);
  const column = [...m[1]].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0);
  const row = Number(m[2]);
  if (column > 16384 || row > 1048576) throw new Error(`Cell outside Excel limits: ${address}`);
  return { column, row };
};

async function openSource(raw: Buffer) {
  if (raw.subarray(0, 2).toString() !== 'PK') throw new Error('Upload a valid XLSX workbook. PDF and other formats cannot preserve an XLSX template.');
  let zip: JSZip;
  try { zip = await JSZip.loadAsync(raw, { checkCRC32: true }); }
  catch { throw new Error('The XLSX archive is invalid or damaged.'); }
  const workbook = await zip.file('xl/workbook.xml')?.async('string');
  const rels = await zip.file('xl/_rels/workbook.xml.rels')?.async('string');
  if (!workbook || !rels) throw new Error('Invalid XLSX workbook relationships.');
  const targets = new Map<string, string>();
  for (const m of rels.matchAll(/<Relationship\b[^>]*\/?\s*>/g)) {
    const a = attributes(m[0]);
    if (a.TargetMode === 'External' || !a.Type?.endsWith('/worksheet')) continue;
    const target = a.Target?.startsWith('/') ? a.Target.slice(1) : path.posix.normalize(`xl/${a.Target}`);
    if (!target.startsWith('xl/') || !zip.file(target)) throw new Error('Missing or unsafe worksheet relationship.');
    targets.set(a.Id, target);
  }
  const paths = new Map<string, string>();
  for (const m of workbook.matchAll(/<sheet\b[^>]*\/?\s*>/g)) {
    const a = attributes(m[0]);
    const target = targets.get(a['r:id']);
    if (!target) throw new Error(`Unsupported sheet relationship: ${a.name}`);
    paths.set(a.name, target);
  }
  if (!paths.size) throw new Error('Workbook has no worksheets.');
  return { zip, paths };
}

function replacementCell(patch: TemplateCellPatch, old = '') {
  const a = attributes(old.slice(0, old.indexOf('>') + 1));
  // Preserve style and other cell metadata; value type belongs to the new value.
  delete a.r; delete a.t;
  const attrs = Object.entries(a).map(([k, v]) => ` ${k}="${escape(v)}"`).join('');
  if (patch.formula) {
    if (typeof patch.value !== 'string' && (typeof patch.value !== 'number' || !Number.isFinite(patch.value))) throw new Error(`Formula ${patch.address} needs a verified cached result.`);
    if (typeof patch.value === 'string' && /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(patch.value)) throw new Error('Invalid cached formula text.');
    return `<c r="${patch.address}"${attrs}${typeof patch.value === 'string' ? ' t="str"' : ''}><f>${escape(patch.formula.replace(/^=/, ''))}</f><v>${escape(String(patch.value))}</v></c>`;
  }
  if (typeof patch.value === 'number') {
    if (!Number.isFinite(patch.value)) throw new Error(`Non-finite value at ${patch.address}`);
    return `<c r="${patch.address}"${attrs}><v>${patch.value}</v></c>`;
  }
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(patch.value ?? '')) throw new Error('Invalid XML control character in cell value.');
  return `<c r="${patch.address}"${attrs} t="inlineStr"><is><t xml:space="preserve">${escape(String(patch.value ?? ''))}</t></is></c>`;
}

function updateCellContent(xml: string, patch: TemplateCellPatch) {
  const p = addressParts(patch.address);
  // Reject writes to covered merged cells rather than silently losing their value.
  for (const m of xml.matchAll(/<mergeCell\b[^>]*\/?\s*>/g)) {
    const ref = attributes(m[0]).ref;
    const [start, end = start] = ref.split(':');
    const a = addressParts(start), b = addressParts(end);
    if (p.row >= a.row && p.row <= b.row && p.column >= a.column && p.column <= b.column && patch.address !== start)
      throw new Error(`${patch.address} is covered by merged range ${ref}; requires a reviewed merge change.`);
  }
  const existing = [...xml.matchAll(cellPattern)].find(m => attributes(m[0].slice(0, m[0].indexOf('>') + 1)).r === patch.address);
  if (existing) {
    if (/<f\b[^>]*\bt=["'](?:shared|array)["']/.test(existing[0])) throw new Error(`Shared/array formula ${patch.address} requires coordinated editing.`);
    return xml.slice(0, existing.index) + replacementCell(patch, existing[0]) + xml.slice(existing.index! + existing[0].length);
  }
  const rows = [...xml.matchAll(/<row\b[^>]*?(?:\/>|>[\s\S]*?<\/row>)/g)];
  const row = rows.find(m => Number(attributes(m[0].slice(0, m[0].indexOf('>') + 1)).r) === p.row);
  const cell = replacementCell(patch);
  if (row) {
    let text = row[0];
    if (text.endsWith('/>')) text = text.slice(0, -2) + '>' + cell + '</row>';
    else {
      const next = [...text.matchAll(cellPattern)].find(m => addressParts(attributes(m[0].slice(0, m[0].indexOf('>') + 1)).r).column > p.column);
      const index = next?.index ?? text.lastIndexOf('</row>');
      text = text.slice(0, index) + cell + text.slice(index);
    }
    return xml.slice(0, row.index) + text + xml.slice(row.index! + row[0].length);
  }
  // No row insertion/renumbering: inserting a cell into an absent blank row only.
  const next = rows.find(m => Number(attributes(m[0].slice(0, m[0].indexOf('>') + 1)).r) > p.row);
  const index = next?.index ?? xml.indexOf('</sheetData>');
  if (index < 0) throw new Error('Unsupported empty worksheet structure.');
  return xml.slice(0, index) + `<row r="${p.row}">${cell}</row>` + xml.slice(index);
}

function updateCell(xml: string, patch: TemplateCellPatch) {
  let result = updateCellContent(xml, patch);
  const target = addressParts(patch.address);
  const name = (column: number) => { let text = ''; while (column) { column--; text = String.fromCharCode(65 + column % 26) + text; column = Math.floor(column / 26); } return text; };
  result = result.replace(/<dimension\b[^>]*>/, tag => tag.replace(/\bref=(["'])(.*?)\1/, (_m, quote, ref) => {
    const [start, end = start] = ref.split(':');
    const a = addressParts(start), b = addressParts(end);
    const first = `${name(Math.min(a.column, target.column))}${Math.min(a.row, target.row)}`;
    const last = `${name(Math.max(b.column, target.column))}${Math.max(b.row, target.row)}`;
    return `ref=${quote}${first === last ? first : `${first}:${last}`}${quote}`;
  }));
  return result;
}

/** Read the very same archive used for export; never synthesize a replacement grid. */
export async function readTemplateWorkbook(raw: Buffer): Promise<CustomerWorkbookSheet[]> {
  const { zip, paths } = await openSource(raw);
  const strings = await zip.file('xl/sharedStrings.xml')?.async('string') || '';
  const textValue = (xml: string) => [...xml.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map(m => decode(m[1])).join('');
  const shared = [...strings.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map(m => textValue(m[1]));
  const sheets: CustomerWorkbookSheet[] = [];
  for (const [name, filename] of paths) {
    const xml = await zip.file(filename)!.async('string');
    const sheet: CustomerWorkbookSheet = { id: filename, name, rowCount: 1, columnCount: 1, cells: {}, mergedRanges: [] };
    for (const m of xml.matchAll(cellPattern)) {
      const a = attributes(m[0].slice(0, m[0].indexOf('>') + 1));
      const p = addressParts(a.r);
      const v = m[0].match(/<v\b[^>]*>([\s\S]*?)<\/v>/)?.[1];
      const f = m[0].match(/<f\b[^>]*>([\s\S]*?)<\/f>/)?.[1];
      const value = a.t === 's' ? shared[Number(v)] ?? '' : a.t === 'inlineStr' ? textValue(m[0]) :
        v === undefined ? '' : a.t === 'str' || a.t === 'e' ? decode(v) : Number(v);
      sheet.cells[a.r] = { address: a.r, ...p, value, ...(f ? { formula: decode(f), kind: 'formula' as const } : {}) };
      sheet.rowCount = Math.max(sheet.rowCount, p.row); sheet.columnCount = Math.max(sheet.columnCount, p.column);
    }
    sheet.mergedRanges = [...xml.matchAll(/<mergeCell\b[^>]*\/?\s*>/g)].map(m => attributes(m[0]).ref);
    sheets.push(sheet);
  }
  return sheets;
}

/** Preserve all unmodified ZIP entry contents byte-for-byte and verify the saved archive. */
export async function createPreservedTemplateWorkbook(rawXlsx: Buffer, originalFileName: string, patches: TemplateOperation[] = []): Promise<PreservedTemplateWorkbook> {
  const { zip, paths } = await openSource(rawXlsx);
  const originals = new Map<string, Buffer>();
  for (const [name, entry] of Object.entries(zip.files)) if (!entry.dir) originals.set(name, await entry.async('nodebuffer'));
  const modified = new Set<string>();
  const normalized = patches.map(p => p.kind === 'replace_logo' || p.kind === 'insert_rows' || p.kind === 'copy_column' || p.kind === 'format_cells' ? { ...p } : { ...p, address: p.address.toUpperCase() });
  for (const patch of normalized) {
    if (patch.kind === 'insert_rows') {
      for (const filename of await insertTemplateRows(zip, paths, patch)) modified.add(filename);
      continue;
    }
    const filename = paths.get(patch.sheetName);
    if (!filename) throw new Error(`Missing source sheet: ${patch.sheetName}`);
    if(patch.kind==='replace_logo'){for(const name of await replaceTemplateLogo(zip,filename))modified.add(name);continue;}
    if (patch.kind === 'format_cells') {
      for (const name of await formatTemplateCells(zip, filename, patch, (xml, address) => updateCell(xml, { sheetName: patch.sheetName, address, value: '' }))) modified.add(name);
      continue;
    }
    const before = await zip.file(filename)!.async('string');
    const after = patch.kind === 'copy_column' ? copyTemplateColumn(before, patch) : updateCell(before, patch);
    zip.file(filename, after); modified.add(filename);
  }
  for(const patch of normalized.filter(p=>p.kind==='replace_logo')) for(const name of await finishQuotationLayout(zip,paths.get(patch.sheetName)!))modified.add(name);
  const transformed = normalized.length ? await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }) : Buffer.from(rawXlsx);
  const saved = await JSZip.loadAsync(transformed, { checkCRC32: true });
  if (Object.keys(saved.files).sort().join('\n') !== Object.keys(zip.files).sort().join('\n')) throw new Error('Preservation failed: archive entries changed.');
  for (const [name, bytes] of originals) {
    const output = await saved.file(name)!.async('nodebuffer');
    if (!modified.has(name) && !bytes.equals(output)) throw new Error(`Preservation failed: ${name}`);
    if (modified.has(name)) {
      // The in-memory entry contains only the ordered, validated operations.
      const expected = await zip.file(name)!.async('string');
      if (output.toString() !== expected) throw new Error(`Unexpected worksheet change: ${name}`);
    }
  }
  return {
    originalFileName, outputFileName: originalFileName.replace(/\.xlsx$/i, '') + '_MOCOF.xlsx',
    transformedXlsxBase64: transformed.toString('base64'),
    originalSha256: crypto.createHash('sha256').update(rawXlsx).digest('hex'),
    transformedSha256: crypto.createHash('sha256').update(transformed).digest('hex'),
    sheetNames: [...paths.keys()],
    protectedMediaCount: [...originals.keys()].filter(n => n.startsWith('xl/media/')).length,
    protectedDrawingCount: [...originals.keys()].filter(n => n.startsWith('xl/drawings/')).length,
    protectedMergeCount: [...paths.values()].reduce((n, p) => n + (originals.get(p)!.toString().match(/<mergeCell\b/g) || []).length, 0),
    patches: normalized.filter((p): p is TemplateCellPatch => p.kind !== 'replace_logo' && p.kind !== 'insert_rows' && p.kind !== 'copy_column' && p.kind !== 'format_cells'),
    operations: normalized,
  };
}
