/**
 * MOCOF Customer Quotation XLSX & PDF Exporter
 * Export only the preserved source workbook; never synthesize a substitute.
 */

import JSZip from 'jszip';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { exportTemplate } from './templateExport.js';
import { Quote, ConversionProfile, Project } from '../src/types.js';

/** Only the first, customer quotation sheet is printed. Source tabs remain in XLSX. */
export async function selectCustomerPrintSheet(zip: JSZip) {
  const entry=zip.file('xl/workbook.xml');
  if(!entry)throw new Error('Workbook metadata is missing.');
  let index=0;
  let xml=await entry.async('string');
  xml=xml.replace(/<sheet\b[^>]*\/?\s*>/g,tag=>{
    const clean=tag.replace(/\sstate="[^"]*"/g,'');
    return index++===0?clean:clean.replace(/\/?\s*>$/,end=>` state="hidden"${end}`);
  });
  if(!index)throw new Error('No customer worksheet is available to print.');
  xml=xml.replace(/\bactiveTab="\d+"/g,'activeTab="0"');
  zip.file('xl/workbook.xml',xml);
}

/**
 * Return the source clone, including validated manual cell edits.
 */
export async function generateCustomerXlsx(
  quote: Quote,
  project: Project,
  profile: ConversionProfile
): Promise<Buffer> {
  return exportTemplate(quote);
}

/**
 * Generate Customer PDF Document
 */
export async function generateCustomerPdf(
  quote: Quote,
  project: Project,
  profile: ConversionProfile
): Promise<Buffer> {
  const workbook = await exportTemplate(quote);
  // Print-only copy: keep cells, drawings and geometry unchanged; fit wide
  // quotation columns onto one page while allowing vertical pagination.
  const zip = await JSZip.loadAsync(workbook);
  await selectCustomerPrintSheet(zip);
  for (const name of Object.keys(zip.files).filter(n=>/^xl\/worksheets\/sheet\d+\.xml$/.test(n))) {
    let xml = await zip.file(name)!.async('string');
    if (!/<sheetPr\b/.test(xml)) xml=xml.replace(/(<worksheet\b[^>]*>)/,'$1<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>');
    else if (/<pageSetUpPr\b/.test(xml)) xml=xml.replace(/<pageSetUpPr\b[^>]*\/>/,'<pageSetUpPr fitToPage="1"/>');
    else xml=xml.replace('</sheetPr>','<pageSetUpPr fitToPage="1"/></sheetPr>');
    xml=xml.replace(/<pageSetup\b[^>]*\/>/,tag=>tag.replace(/\s(?:scale|fitToWidth|fitToHeight)="[^"]*"/g,'').replace('/>',' fitToWidth="1" fitToHeight="0"/>'));
    zip.file(name,xml);
  }
  const fontName=process.platform==='darwin'?'Arial Unicode MS':'Noto Sans CJK SC';
  const printStyles=await zip.file('xl/styles.xml')!.async('string');
  zip.file('xl/styles.xml',printStyles.replace(/<name val="[^"]*"\/>/g,`<name val="${fontName}"/>`).replace(/<sz val="([0-9.]+)"\/>/g,(_,size)=>`<sz val="${Math.min(Number(size),10)}"/>`));
  const printWorkbook=await zip.generateAsync({type:'nodebuffer'});
  const dir = await mkdtemp(path.join(tmpdir(), 'mocof-pdf-'));
  try {
    const input = path.join(dir, 'quotation.xlsx');
    await writeFile(input, printWorkbook, {mode:0o600});
    await promisify(execFile)(process.env.MOCOF_SOFFICE_PATH || 'soffice', [
      `-env:UserInstallation=${pathToFileURL(path.join(dir,'profile')).href}`,
      '--headless', '--convert-to', 'pdf:calc_pdf_Export', '--outdir', dir, input,
    ], {timeout:120000,maxBuffer:1024*1024});
    const pdf = await readFile(path.join(dir,'quotation.pdf'));
    if (pdf.subarray(0,5).toString() !== '%PDF-') throw new Error('Renderer did not produce a PDF.');
    return pdf;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new Error('Same-workbook PDF renderer is unavailable on this server. Configure MOCOF_SOFFICE_PATH on the background worker.');
    throw error;
  } finally { await rm(dir,{recursive:true,force:true}); }
}
