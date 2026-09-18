import crypto from 'crypto';
import JSZip from 'jszip';
import { PreservedTemplateWorkbook } from '../src/types.js';

export interface TemplateCellPatch {
  sheetName: string;
  address: string;
  value?: string | number;
  formula?: string;
  promptNumber?: string;
}

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

function xmlCell(address: string, patch: TemplateCellPatch, style = ''): string {
  const attribute = style ? ` s="${style}"` : '';
  if (patch.formula) {
    const cached = typeof patch.value === 'number' ? String(patch.value) : '0';
    return `<c r="${address}"${attribute}><f>${escapeXml(patch.formula.replace(/^=/, ''))}</f><v>${cached}</v></c>`;
  }
  if (typeof patch.value === 'number') return `<c r="${address}"${attribute}><v>${patch.value}</v></c>`;
  return `<c r="${address}"${attribute} t="inlineStr"><is><t>${escapeXml(String(patch.value ?? ''))}</t></is></c>`;
}

function updateCellInWorksheet(xml: string, patch: TemplateCellPatch): string {
  const address = patch.address.toUpperCase();
  const existing = new RegExp(`<c\\b([^>]*\\br="${address}"[^>]*)>([\\s\\S]*?)<\\/c>`, 'i');
  const match = xml.match(existing);
  const style = match?.[1].match(/\bs="([^\"]+)"/)?.[1] || '';
  if (match) return xml.replace(existing, xmlCell(address, patch, style));

  const rowNumber = Number(address.match(/\d+$/)?.[0]);
  if (!rowNumber) throw new Error(`Invalid cell address ${address}`);
  const rowPattern = new RegExp(`(<row\\b[^>]*\\br="${rowNumber}"[^>]*>)([\\s\\S]*?)(<\\/row>)`, 'i');
  if (rowPattern.test(xml)) return xml.replace(rowPattern, `$1$2${xmlCell(address, patch)}$3`);
  // A new row is safe only for blank rows: no merges/drawings are changed.
  return xml.replace('</sheetData>', `<row r="${rowNumber}">${xmlCell(address, patch)}</row></sheetData>`);
}

async function sheetXmlPaths(zip: JSZip): Promise<Map<string, string>> {
  const workbook = await zip.file('xl/workbook.xml')?.async('string');
  const rels = await zip.file('xl/_rels/workbook.xml.rels')?.async('string');
  if (!workbook || !rels) throw new Error('Invalid XLSX workbook relationships.');
  const relTargets = new Map<string, string>();
  for (const rel of rels.matchAll(/<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*\/?\s*>/g)) {
    relTargets.set(rel[1], rel[2].replace(/^\//, '').replace(/^xl\//, ''));
  }
  const result = new Map<string, string>();
  for (const sheet of workbook.matchAll(/<sheet\b[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"[^>]*\/?\s*>/g)) {
    const target = relTargets.get(sheet[2]);
    if (target) result.set(sheet[1], target.startsWith('worksheets/') ? `xl/${target}` : target);
  }
  return result;
}

/**
 * Patch only worksheet XML.  JSZip retains all other entries, including
 * xl/media, xl/drawings, styles, merges and the original template geometry.
 */
export async function createPreservedTemplateWorkbook(
  rawXlsx: Buffer,
  originalFileName: string,
  patches: TemplateCellPatch[] = [],
): Promise<PreservedTemplateWorkbook> {
  const zip = await JSZip.loadAsync(rawXlsx);
  const paths = await sheetXmlPaths(zip);
  const media = Object.keys(zip.files).filter((name) => name.startsWith('xl/media/') && !zip.files[name].dir);
  const drawings = Object.keys(zip.files).filter((name) => name.startsWith('xl/drawings/') && !zip.files[name].dir);
  let mergeCount = 0;
  for (const xmlPath of paths.values()) {
    const xml = await zip.file(xmlPath)?.async('string');
    mergeCount += (xml?.match(/<mergeCell\b/g) || []).length;
  }
  for (const patch of patches) {
    const xmlPath = paths.get(patch.sheetName);
    if (!xmlPath) throw new Error(`Prompt patch references missing source sheet “${patch.sheetName}”.`);
    const xml = await zip.file(xmlPath)?.async('string');
    if (!xml) throw new Error(`Could not open source worksheet ${patch.sheetName}.`);
    zip.file(xmlPath, updateCellInWorksheet(xml, patch));
  }
  const transformed = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  const outputFileName = originalFileName.replace(/\.xlsx$/i, '') + '_MOCOF.xlsx';
  return {
    originalFileName,
    outputFileName,
    transformedXlsxBase64: transformed.toString('base64'),
    originalSha256: crypto.createHash('sha256').update(rawXlsx).digest('hex'),
    transformedSha256: crypto.createHash('sha256').update(transformed).digest('hex'),
    sheetNames: [...paths.keys()],
    protectedMediaCount: media.length,
    protectedDrawingCount: drawings.length,
    protectedMergeCount: mergeCount,
    patches,
  };
}
