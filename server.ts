import 'dotenv/config';

/**
 * MOCOF AI Integrated Quotation Converter Express Server
 */

import express from 'express';
import path from 'path';
import multer from 'multer';
import { db } from './server/db.js';
import { fetchLiveExchangeRates, lockRateSnapshot, createRateSnapshot } from './server/exchange.js';
import { parseSupplierXlsxBuffer, parseSupplierPdfBuffer } from './server/xlsxParser.js';
import { processAiExtractionAndConversion, createWorkbookPromptTransactions, createTemplateRecipeTransactions } from './server/geminiService.js';
import {
  recalculateWorksheet,
  calculateWholeHouseTotals,
  generateReconciliationReport,
} from './server/calcEngine.js';
import { generateCustomerXlsx, generateCustomerPdf } from './server/exporter.js';
import { Project, Quote, QuoteVersion } from './src/types.js';
import { getDocumentedAreaPrompts } from './server/documentedPrompts.js';
import { buildCustomerWorkbookGrid } from './server/customerWorkbookGrid.js';
import { buildDocumentedPromptExecution } from './server/documentedRecipeExecutor.js';
import { createPreservedTemplateWorkbook, TemplateCellPatch } from './server/templateWorkbook.js';
import { geminiFailure } from './server/geminiConfig.js';
import { createPersistentConversionJob, getPersistentConversionJob, publicJobStatus, readCompletedConversionResult } from './server/persistentJobs.js';

const upload = multer({ storage: multer.memoryStorage() });

function columnAddress(column: number): string {
  let value = column;
  let result = '';
  while (value > 0) {
    const remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }
  return result;
}

export async function convertSupplierWorkbook(quote: Quote, originalFileName: string, buffer: Buffer, selectedArea?: number, customerSqft?: number, customerBudget?: number) {
  const project = db.getProjectById(quote.projectId);
  const profile = db.getConversionProfile();
  const isPdf = /\.pdf$/i.test(originalFileName) || buffer.subarray(0, 4).toString() === '%PDF';
  const parsedXlsx = isPdf
    ? await parseSupplierPdfBuffer(buffer, originalFileName)
    : await parseSupplierXlsxBuffer(buffer, originalFileName);
  const detectedArea = parsedXlsx.detectedArea || undefined;
  const requestedArea = Number(selectedArea);
  if (!Number.isInteger(requestedArea) || requestedArea < 1 || requestedArea > 10) {
    throw new Error('Choose a quotation Area from 1 to 10 before conversion.');
  }
  // The selected Area is the business decision. Detection is retained only
  // for an auditable warning; it must never silently run a different recipe.
  const areaToRun = requestedArea;

  // Give Gemini a compact row for every customer-facing product. This avoids
  // the former first-30-row limit that left most Chinese descriptions untranslated.
  const translationRows = parsedXlsx.parsedWorksheets.flatMap((worksheet) =>
    worksheet.rooms.flatMap((room) => room.sections.flatMap((section) =>
      section.items.map((item) => [item.sourceRowIndex, item.itemCode, item.nameChinese, room.roomNameChinese, section.sectionName, item.dimensionText])
    ))
  );
  // Upload conversion must complete even when Gemini is unavailable or slow.
  // The spreadsheet recipe, source totals and deterministic translations are
  // enough to create the editable baseline. AI enrichment is opt-in so Vercel
  // Hobby functions do not time out before the user can review the quote.
  const aiResult = process.env.MOCOF_ENABLE_GEMINI_TRANSLATION === 'true'
    ? await processAiExtractionAndConversion(translationRows.slice(0, 80), profile, areaToRun)
    : { translatedItems: [], exceptions: [] };
  // Gemini supplies English names for recognised source SKUs. The parser keeps
  // the original Chinese source row as the fallback, never a demo placeholder.
  const translationsBySku = new Map(
    aiResult.translatedItems
      .filter((item) => item.itemCode && item.nameEnglish)
      .map((item) => [String(item.itemCode).trim(), item])
  );
  parsedXlsx.parsedWorksheets.forEach((worksheet) => worksheet.rooms.forEach((room) =>
    room.sections.forEach((section) => section.items.forEach((item) => {
      const translated = translationsBySku.get(item.itemCode.trim());
      if (translated?.nameEnglish) item.nameEnglish = translated.nameEnglish;
      if (translated?.notes) item.notes = translated.notes;
    }))
  ));
  const exchangeRateValue = quote.exchangeRate.rate || 0.652;
  const updatedWorksheets = parsedXlsx.parsedWorksheets.map((ws) =>
    recalculateWorksheet(ws, exchangeRateValue, profile)
  );
  // Use the supplementary table parsed from this upload when calculating the
  // quote total. Previously this happened afterwards, so a new conversion
  // displayed the new rows but used the previous quote's supplementary total.
  quote.supplementaryItems = parsedXlsx.supplementaryItems;
  const wholeHouseTotals = calculateWholeHouseTotals(
    updatedWorksheets,
    quote.supplementaryItems,
    profile,
    parsedXlsx.totalSupplierCNY,
    exchangeRateValue
  );

  aiResult.exceptions.forEach((ex, idx) => {
    db.addException({
      id: `exc-${Date.now()}-${idx}`,
      quoteId: quote.id,
      sourceRow: ex.sourceRow || idx + 1,
      sourceSheet: parsedXlsx.sheetNames[0],
      productCode: ex.productCode || `SKU-${idx + 1}`,
      chineseText: ex.chineseText || '需要复核的供应商项目',
      reasonCode: (ex.reasonCode as any) || 'UNAPPROVED_TRANSLATION',
      description: ex.description || 'AI flag: Requires manager verification',
      severity: 'warning',
      resolved: false,
      suggestedFix: ex.suggestedFix,
    });
  });

  const hasExceptions = aiResult.exceptions.length > 0;
  quote.worksheets = updatedWorksheets;
  quote.detectedArea = areaToRun;
  const suppliedSqft = Number(customerSqft);
  const suppliedBudget = Number(customerBudget);
  quote.sourceCustomerSqft = Number.isFinite(suppliedSqft) && suppliedSqft > 0 ? suppliedSqft : parsedXlsx.customerSqft;
  if (!quote.sourceCustomerSqft || quote.sourceCustomerSqft <= 0) {
    throw new Error('Customer sqft is required for the selected Area pricing formulas. Enter it before conversion; it was not found in the supplier source file.');
  }
  if (!Number.isFinite(suppliedBudget) || suppliedBudget < 0) {
    throw new Error('Customer budget is required before conversion.');
  }
  quote.customerBudget = suppliedBudget;
  const exactDocumentedPrompts = getDocumentedAreaPrompts(areaToRun);
  const templateRecipeNotes: string[] = [];
  let templatePatches: TemplateCellPatch[] = [];
  if (!isPdf) {
    const templateCells = Object.entries(parsedXlsx.rawRowsBySheet).flatMap(([sheetName, rows]) =>
      rows.flatMap((row, rowIndex) => row.map((value, columnIndex) => ({
        sheetName,
        address: `${columnAddress(columnIndex + 1)}${rowIndex + 1}`,
        value: typeof value === 'number' ? value : String(value ?? ''),
      })).filter((cell) => cell.value !== ''))
    ).slice(0, 2000);
    if (process.env.GEMINI_API_KEY && exactDocumentedPrompts) {
      try {
        const plan = await createTemplateRecipeTransactions(
          exactDocumentedPrompts.prompts,
          templateCells,
          {
            name: project?.customerName || '', address: project?.projectAddress || '',
            sqft: quote.sourceCustomerSqft, budget: quote.customerBudget, currency: quote.currency,
          },
        );
        templatePatches = plan.operations.map((operation) => ({
          sheetName: operation.sheetName, address: operation.address, value: operation.value,
          formula: operation.formula, promptNumber: operation.promptNumber,
        }));
        templateRecipeNotes.push(`Gemini evaluated all ${exactDocumentedPrompts.prompts.length} selected Area prompts in documented order and returned ${templatePatches.length} allowed source-template cell patches.`);
        templateRecipeNotes.push(...plan.summaries.map((summary, index) => `RECIPE STEP ${index + 1}: ${summary}`));
      } catch (error: any) {
        throw geminiFailure(error);
      }
    } else {
      templateRecipeNotes.push('RECIPE EXECUTION NOT STARTED: GEMINI_API_KEY is not available. The original template clone is preserved, but no prompt edit has been claimed as applied.');
    }
    quote.preservedTemplateWorkbook = await createPreservedTemplateWorkbook(buffer, originalFileName, templatePatches);
  } else {
    quote.preservedTemplateWorkbook = undefined;
  }
  // Keep a clean, source-derived customer workbook. The Prompt Recipe editor
  // always starts from this baseline, so removing a boss command restores the
  // table instead of stacking irreversible edits on top of an old version.
  quote.bossPromptCommands = [];
  // Build an addressable A:J workbook after formulas and translations are
  // finalised.  The prompt document uses cell references (E1, I2, J44…);
  // storing this grid makes those instructions auditable and editable.
  quote.workbookSheets = buildCustomerWorkbookGrid(quote, project || {
    id: quote.projectId, name: '', customerName: '', customerPhone: '', customerEmail: '', projectAddress: '', quotationNumber: '', status: 'Processing', currency: quote.currency, createdAt: '', updatedAt: '', currentQuoteId: quote.id, totalMYRCents: 0,
  });
  quote.promptRecipeBaseline = {
    worksheets: JSON.parse(JSON.stringify(updatedWorksheets)),
    supplementaryItems: JSON.parse(JSON.stringify(parsedXlsx.supplementaryItems)),
    workbookSheets: JSON.parse(JSON.stringify(quote.workbookSheets)),
  };
  const selectedAreaRule = profile.areaPromptRules.find((rule) => rule.areaNumber === areaToRun);
  // Never label a documented instruction “applied” merely because it is shown
  // in the trace. A prompt is applied only when the recipe plan produced at
  // least one validated patch for that numbered instruction.
  const patchedPromptNumbers = new Set(templatePatches.map((patch) => String(patch.promptNumber || '')));
  quote.documentedPromptExecutions = buildDocumentedPromptExecution(areaToRun).map((execution) => {
    const promptNumber = String(execution.promptNumber);
    if (patchedPromptNumbers.has(promptNumber)) {
      return { ...execution, status: 'applied' as const, result: 'Applied as a validated cell patch to the preserved source-template clone.' };
    }
    return {
      ...execution,
      status: 'needs_review' as const,
      result: process.env.GEMINI_API_KEY
        ? 'No safe cell patch was returned for this instruction. The source template was left unchanged rather than guessing.'
        : 'Awaiting Gemini recipe execution. The source template was left unchanged.',
    };
  });
  quote.promptTrace = [
    !isPdf
      ? `SOURCE TEMPLATE PRESERVED: ${quote.preservedTemplateWorkbook?.sheetNames.length || 0} sheets, ${quote.preservedTemplateWorkbook?.protectedMediaCount || 0} embedded media files, ${quote.preservedTemplateWorkbook?.protectedDrawingCount || 0} drawing files and ${quote.preservedTemplateWorkbook?.protectedMergeCount || 0} merged cells were copied unchanged. The original upload is never edited.`
      : 'PDF source has no editable XLSX template. A spreadsheet template cannot be preserved from a PDF upload.',
    ...templateRecipeNotes,
    `Boss selected Area ${areaToRun}. Automatic analysis suggested ${detectedArea || 'an undetermined Area'} from ${parsedXlsx.sheetNames[0] || 'source workbook'}; only real room rows were counted and services/add-ons were excluded.`,
    `Workbook workflow selected: ${exactDocumentedPrompts?.label || selectedAreaRule?.label || `Area ${areaToRun}`}. The selected Area recipe—not automatic detection—controls this conversion. Every original prompt is shown with an execution result.`,
    ...(areaToRun === 3 ? [`AREA 3 BOSS-CONFIRMED CALCULATION OVERRIDE\n8E-01 is the discount factor 0.8. Supplementary Before Price = sqft/per × customer sqft (F4); After Price = Before Price × I3. The first five standard services remain RM 0.00 after price. Bathroom Shower Screen is included as the fifteenth supplementary row.`] : []),
    ...(exactDocumentedPrompts
      ? exactDocumentedPrompts.prompts.map((prompt, index) =>
          `DOCUMENTED PROMPT ${index + 1}${prompt.category ? ` — ${prompt.category}` : ''}\n${prompt.text}`)
      : (selectedAreaRule ? selectedAreaRule.instructions.split(/\n+/).map((line) => line.trim()).filter(Boolean) : [])),
  ];
  quote.wholeHouseTotals = wholeHouseTotals;
  quote.status = hasExceptions ? 'Generated – Exceptions Need Review' : 'Generated – Ready for Approval';
  quote.updatedAt = new Date().toISOString();
  db.saveQuote(quote);
  if (project) {
    db.updateProject(project.id, { status: quote.status, totalMYRCents: wholeHouseTotals.grandTotalCents });
  }
  db.addAuditLog({
    projectId: quote.projectId,
    quoteId: quote.id,
    action: 'CONVERSION_COMPLETED',
    performedBy: 'MOCOF AI Converter',
    details: `Parsed ${parsedXlsx.sheetNames.length} worksheets from ${originalFileName}. Generated customer quote with ${aiResult.exceptions.length} exception flags.`,
  });

  return {
    project: project ? db.getProjectById(project.id) : undefined,
    quote,
    parsedSheetNames: parsedXlsx.sheetNames,
    extractedImageCount: parsedXlsx.extractedImages.length,
    exceptions: db.getExceptionsByQuoteId(quote.id),
  };
}

/**
 * Creates the API application for both local development and Vercel.
 * Keep API routes here; static frontend hosting is added only by startServer.
 */
export async function createApp() {
  const app = express();

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Routes

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'MOCOF AI Integrated Quotation Converter', timestamp: new Date() });
  });

  // Persistent background conversion. This Vercel request does only three
  // quick operations: receive source, save to Blob, and dispatch GitHub Actions.
  // Gemini recipe execution never happens in this 60-second serverless route.
  app.post('/api/conversion-jobs', upload.single('supplierFile'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Choose the original Chinese supplier XLSX or PDF file first.' });
      const input = req.body.projectData ? JSON.parse(req.body.projectData) : {};
      const selectedArea = Number(input.selectedArea);
      if (!Number.isInteger(selectedArea) || selectedArea < 1 || selectedArea > 10) return res.status(400).json({ error: 'Choose Area 1–10 before starting the conversion job.' });
      const job = await createPersistentConversionJob(req.file.buffer, req.file.originalname, req.file.mimetype, {
        ...input, selectedArea, customerSqft: Number(input.customerSqft), customerBudget: Number(input.customerBudget),
      });
      res.status(202).json({ job: publicJobStatus(job) });
    } catch (error: any) {
      console.error('Persistent conversion job creation error:', error);
      res.status(503).json({ error: error?.message || 'Could not queue persistent conversion.' });
    }
  });

  app.get('/api/conversion-jobs/:id', async (req, res) => {
    try {
      const job = await getPersistentConversionJob(req.params.id);
      if (!job) return res.status(404).json({ error: 'Conversion job not found or expired.' });
      if (job.status !== 'completed') return res.json({ job: publicJobStatus(job) });
      const result = await readCompletedConversionResult(job);
      res.json({ job: publicJobStatus(job), result });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Could not read conversion job status.' });
    }
  });

  // Projects list
  app.get('/api/projects', (req, res) => {
    const projects = db.getProjects();
    res.json(projects);
  });

  // Project details with quote
  app.get('/api/projects/:id', (req, res) => {
    const project = db.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const quote = db.getQuoteById(project.currentQuoteId);
    const exceptions = quote ? db.getExceptionsByQuoteId(quote.id) : [];
    const auditLogs = db.getAuditLogs(project.id);
    const versions = quote ? db.getQuoteVersions(quote.id) : [];

    res.json({
      project,
      quote,
      exceptions,
      auditLogs,
      versions,
    });
  });

  // Create Project
  app.post('/api/projects', (req, res) => {
    const { name, customerName, customerPhone, customerEmail, projectAddress, currency } = req.body;
    const newProjectId = `proj-${Date.now()}`;
    const newQuoteId = `quote-${Date.now()}`;
    const rates = createRateSnapshot(currency || 'MYR');

    const newQuote: Quote = {
      id: newQuoteId,
      projectId: newProjectId,
      versionNumber: 1,
      versionLabel: 'v1.0-Initial',
      status: 'Processing',
      currency: currency || 'MYR',
      exchangeRate: rates,
      worksheets: [],
      supplementaryItems: [],
      wholeHouseTotals: {
        cabinetProductsCents: 0,
        lfProductsCents: 0,
        customDoorProductsCents: 0,
        wallPanelProductsCents: 0,
        kitchenVanityProductsCents: 0,
        supplementaryItemsCents: 0,
        subtotalCents: 0,
        discountCents: 0,
        taxPercent: 6.0,
        taxCents: 0,
        grandTotalCents: 0,
        sourceReconciliationTotalCNYCents: 0,
        sourceReconciliationConvertedMYRCents: 0,
        reconciliationDifferenceCents: 0,
        reconciled: true,
      },
      termsAndConditions: db.getConversionProfile().termsAndConditions,
      createdBy: 'Manager',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newProject: Project = {
      id: newProjectId,
      name: name || 'New MOCOF Renovation Project',
      customerName: customerName || 'Valued Customer',
      customerPhone: customerPhone || '+60 12-000 0000',
      customerEmail: customerEmail || 'customer@example.com',
      projectAddress: projectAddress || 'Klang Valley, Malaysia',
      quotationNumber: `MOC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Processing',
      currency: currency || 'MYR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentQuoteId: newQuoteId,
      totalMYRCents: 0,
    };

    db.createProject(newProject);
    db.saveQuote(newQuote);

    db.addAuditLog({
      projectId: newProjectId,
      quoteId: newQuoteId,
      action: 'PROJECT_CREATED',
      performedBy: 'User',
      details: `Created new project ${newProject.name} (${newProject.quotationNumber}).`,
    });

    res.json({ project: newProject, quote: newQuote });
  });

  // Convert Supplier File (Upload or Sample conversion)
  app.post('/api/quotes/:id/convert', upload.single('supplierFile'), async (req, res) => {
    try {
      const quoteId = req.params.id;
      const quote = db.getQuoteById(quoteId);
      if (!quote) {
        return res.status(404).json({ error: 'Quote not found' });
      }

      if (!req.file) {
        return res.status(400).json({
          error: 'Please choose the original Chinese supplier XLSX file before starting conversion.',
        });
      }
      res.json(await convertSupplierWorkbook(quote, req.file.originalname, req.file.buffer, Number(req.body?.selectedArea), Number(req.body?.customerSqft), Number(req.body?.customerBudget)));
    } catch (err: any) {
      console.error('Conversion endpoint error:', err);
      res.status(500).json({ error: err.message || 'Conversion failed' });
    }
  });

  // Serverless-safe normal workflow: create a new quote and convert its source
  // workbook in the same request. This avoids a Vercel cold start losing the
  // temporary file-backed quote between separate create and convert requests.
  app.post('/api/convert', upload.single('supplierFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Please choose the original Chinese supplier XLSX file before starting conversion.' });
      }
      const input = req.body.projectData ? JSON.parse(req.body.projectData) : {};
      const newProjectId = `proj-${Date.now()}`;
      const newQuoteId = `quote-${Date.now()}`;
      const rates = createRateSnapshot(input.currency || 'MYR');
      const newQuote: Quote = {
        id: newQuoteId, projectId: newProjectId, versionNumber: 1, versionLabel: 'v1.0-Initial', status: 'Processing',
        currency: input.currency || 'MYR', exchangeRate: rates, worksheets: [], supplementaryItems: [],
        wholeHouseTotals: { cabinetProductsCents: 0, lfProductsCents: 0, customDoorProductsCents: 0, wallPanelProductsCents: 0, kitchenVanityProductsCents: 0, supplementaryItemsCents: 0, subtotalCents: 0, discountCents: 0, taxPercent: 6, taxCents: 0, grandTotalCents: 0, sourceReconciliationTotalCNYCents: 0, sourceReconciliationConvertedMYRCents: 0, reconciliationDifferenceCents: 0, reconciled: true },
        termsAndConditions: db.getConversionProfile().termsAndConditions, createdBy: 'Manager', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      const newProject: Project = {
        id: newProjectId, name: input.name || 'New MOCOF Renovation Project', customerName: input.customerName || 'Valued Customer', customerPhone: input.customerPhone || '', customerEmail: input.customerEmail || '', projectAddress: input.projectAddress || '', quotationNumber: `MOC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`, status: 'Processing', currency: input.currency || 'MYR', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), currentQuoteId: newQuoteId, totalMYRCents: 0,
      };
      db.createProject(newProject);
      db.saveQuote(newQuote);
      db.addAuditLog({ projectId: newProjectId, quoteId: newQuoteId, action: 'PROJECT_CREATED', performedBy: 'User', details: `Created project ${newProject.name} (${newProject.quotationNumber}).` });
      res.json(await convertSupplierWorkbook(newQuote, req.file.originalname, req.file.buffer, Number(input.selectedArea), Number(input.customerSqft), Number(input.customerBudget)));
    } catch (err: any) {
      console.error('One-step conversion endpoint error:', err);
      res.status(500).json({ error: err.message || 'Conversion failed' });
    }
  });

  // Apply boss-entered natural-language prompts as auditable A1 cell
  // operations. The client reviews the returned operations in the live grid
  // and saves the draft only after it is satisfied.
  app.post('/api/quotes/:id/apply-prompts', async (req, res) => {
    try {
      const quote = db.getQuoteById(req.params.id);
      if (!quote) return res.status(404).json({ error: 'Quote not found' });
      const prompts = Array.isArray(req.body?.prompts) ? req.body.prompts.map(String).filter((prompt: string) => prompt.trim()).slice(0, 20) : [];
      const cells = Array.isArray(req.body?.cells) ? req.body.cells : [];
      if (!prompts.length) return res.status(400).json({ error: 'Add at least one enabled boss prompt first.' });
      if (!cells.length) return res.status(400).json({ error: 'This quotation has no spreadsheet grid. Upload and convert the source quotation again.' });
      const areaRecipe = getDocumentedAreaPrompts(quote.detectedArea || 0);
      const result = await createWorkbookPromptTransactions(prompts, cells, areaRecipe?.prompts.map((prompt) => `${prompt.category}\n${prompt.text}`) || []);
      res.json(result);
    } catch (err: any) {
      console.error('Prompt transaction endpoint error:', err);
      res.status(500).json({ error: err.message || 'Could not apply prompts to the workbook.' });
    }
  });

  // Save / Update Quote State (Full Quotation Editor Workspace)
  app.put('/api/quotes/:id', (req, res) => {
    const quoteId = req.params.id;
    const existingQuote = db.getQuoteById(quoteId);
    if (!existingQuote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    const { worksheets, supplementaryItems, notes, versionLabel, bossPromptCommands, promptRecipeBaseline, workbookSheets } = req.body;
    const profile = db.getConversionProfile();
    const rateValue = existingQuote.exchangeRate.rate || 0.652;

    // Recalculate using server deterministic engine
    let updatedWorksheets = worksheets || existingQuote.worksheets;
    updatedWorksheets = updatedWorksheets.map((ws: any) =>
      recalculateWorksheet(ws, rateValue, profile)
    );

    const updatedSupp = supplementaryItems || existingQuote.supplementaryItems;
    const totals = calculateWholeHouseTotals(
      updatedWorksheets,
      updatedSupp,
      profile,
      existingQuote.wholeHouseTotals.sourceReconciliationTotalCNYCents / 100,
      rateValue
    );

    const updatedQuote: Quote = {
      ...existingQuote,
      worksheets: updatedWorksheets,
      supplementaryItems: updatedSupp,
      wholeHouseTotals: totals,
      versionNumber: existingQuote.versionNumber + 1,
      versionLabel: versionLabel || `v1.${existingQuote.versionNumber}-Edited`,
      updatedAt: new Date().toISOString(),
      notes: notes || existingQuote.notes,
      bossPromptCommands: Array.isArray(bossPromptCommands) ? bossPromptCommands : existingQuote.bossPromptCommands,
      promptRecipeBaseline: promptRecipeBaseline || existingQuote.promptRecipeBaseline,
      workbookSheets: Array.isArray(workbookSheets) ? workbookSheets : existingQuote.workbookSheets,
    };

    db.saveQuote(updatedQuote);
    db.updateProject(existingQuote.projectId, {
      totalMYRCents: totals.grandTotalCents,
    });

    // Save Version Snapshot
    const newVersion: QuoteVersion = {
      id: `ver-${Date.now()}`,
      quoteId: existingQuote.id,
      versionNumber: updatedQuote.versionNumber,
      versionLabel: updatedQuote.versionLabel,
      createdAt: new Date().toISOString(),
      createdBy: 'Manager Reviewer',
      changesSummary: 'Saved updated item pricing, quantities and supplementary items.',
      quoteSnapshot: JSON.parse(JSON.stringify(updatedQuote)),
    };
    db.addQuoteVersion(newVersion);

    db.addAuditLog({
      projectId: existingQuote.projectId,
      quoteId: existingQuote.id,
      action: 'QUOTE_SAVED',
      performedBy: 'Manager Reviewer',
      details: `Saved quote workspace version ${updatedQuote.versionLabel}. Grand Total: MYR ${(totals.grandTotalCents / 100).toFixed(2)}.`,
    });

    res.json(updatedQuote);
  });

  // Resolve Exception
  app.post('/api/quotes/:id/resolve-exception', (req, res) => {
    const { exceptionId, managerName, resolutionNotes } = req.body;
    const exc = db.resolveException(exceptionId, managerName || 'Manager', resolutionNotes);
    if (!exc) {
      return res.status(404).json({ error: 'Exception not found' });
    }

    db.addAuditLog({
      projectId: req.params.id,
      quoteId: req.params.id,
      action: 'EXCEPTION_RESOLVED',
      performedBy: managerName || 'Manager',
      details: `Resolved exception #${exceptionId}: ${exc.description}. Notes: ${resolutionNotes || 'Approved by manager.'}`,
    });

    res.json({ success: true, exception: exc });
  });

  // Lock Exchange Rate Snapshot
  app.post('/api/quotes/:id/lock-exchange-rate', (req, res) => {
    const quote = db.getQuoteById(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    const { managerName } = req.body;
    const lockedRate = lockRateSnapshot(quote.exchangeRate, managerName || 'Manager Tan');

    // Recalculate quote with locked rate
    const profile = db.getConversionProfile();
    const updatedWorksheets = quote.worksheets.map((ws) =>
      recalculateWorksheet(ws, lockedRate.rate, profile)
    );
    const totals = calculateWholeHouseTotals(
      updatedWorksheets,
      quote.supplementaryItems,
      profile,
      quote.wholeHouseTotals.sourceReconciliationTotalCNYCents / 100,
      lockedRate.rate
    );

    quote.exchangeRate = lockedRate;
    quote.worksheets = updatedWorksheets;
    quote.wholeHouseTotals = totals;
    quote.updatedAt = new Date().toISOString();

    db.saveQuote(quote);

    db.addAuditLog({
      projectId: quote.projectId,
      quoteId: quote.id,
      action: 'EXCHANGE_RATE_LOCKED',
      performedBy: managerName || 'Manager Tan',
      details: `Locked exchange rate snapshot 1 CNY = ${lockedRate.rate} ${quote.currency}.`,
    });

    res.json(quote);
  });

  // Approve Quotation
  app.post('/api/quotes/:id/approve', (req, res) => {
    const quote = db.getQuoteById(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    // Check pre-approval validation rules
    const exceptions = db.getExceptionsByQuoteId(quote.id);
    const unresolvedExceptions = exceptions.filter((e) => !e.resolved);
    if (unresolvedExceptions.length > 0) {
      return res.status(400).json({
        error: 'Cannot approve quotation while unresolved exceptions exist.',
        unresolvedExceptions,
      });
    }

    quote.status = 'Approved';
    quote.updatedAt = new Date().toISOString();
    db.saveQuote(quote);
    db.updateProject(quote.projectId, { status: 'Approved' });

    db.addAuditLog({
      projectId: quote.projectId,
      quoteId: quote.id,
      action: 'QUOTE_APPROVED',
      performedBy: 'Boss / Manager',
      details: `Approved quotation version ${quote.versionLabel}. Ready for customer export.`,
    });

    res.json(quote);
  });

  // Export Customer XLSX
  app.get('/api/quotes/:id/export/xlsx', async (req, res) => {
    try {
      const quote = db.getQuoteById(req.params.id);
      if (!quote) return res.status(404).send('Quote not found');
      const project = db.getProjectById(quote.projectId);
      if (!project) return res.status(404).send('Project not found');

      const profile = db.getConversionProfile();
      // Export the source-layout-preserving clone whenever the customer
      // supplied XLSX. The generated review grid is deliberately not used as
      // an XLSX export fallback in this path.
      const xlsxBuffer = quote.preservedTemplateWorkbook?.transformedXlsxBase64
        ? Buffer.from(quote.preservedTemplateWorkbook.transformedXlsxBase64, 'base64')
        : await generateCustomerXlsx(quote, project, profile);

      quote.status = 'Exported';
      db.saveQuote(quote);
      db.updateProject(project.id, { status: 'Exported' });

      db.addAuditLog({
        projectId: project.id,
        quoteId: quote.id,
        action: 'EXPORT_XLSX',
        performedBy: 'User',
        details: quote.preservedTemplateWorkbook
          ? `Exported the source-layout-preserving XLSX template for ${project.customerName}.`
          : `Exported generated customer quotation XLSX workbook for ${project.customerName}.`,
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${quote.preservedTemplateWorkbook?.outputFileName || `MOCOF_Quotation_${project.quotationNumber}.xlsx`}"`);
      res.send(xlsxBuffer);
    } catch (err: any) {
      console.error('XLSX export error:', err);
      res.status(500).send('Failed to generate XLSX export');
    }
  });

  // Export Customer PDF
app.get('/api/quotes/:id/export/pdf', async (req, res) => {
    try {
      const quote = db.getQuoteById(req.params.id);
      if (!quote) return res.status(404).send('Quote not found');
      const project = db.getProjectById(quote.projectId);
      if (!project) return res.status(404).send('Project not found');

      const profile = db.getConversionProfile();
      const pdfBuffer = await generateCustomerPdf(quote, project, profile);

      quote.status = 'Exported';
      db.saveQuote(quote);
      db.updateProject(project.id, { status: 'Exported' });

      db.addAuditLog({
        projectId: project.id,
        quoteId: quote.id,
        action: 'EXPORT_PDF',
        performedBy: 'User',
        details: `Exported customer quotation PDF for ${project.customerName}.`,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="MOCOF_Quotation_${project.quotationNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (err: any) {
      console.error('PDF export error:', err);
      res.status(500).send('Failed to generate PDF export');
    }
});

// Direct exports are intentionally independent of the in-memory quotation store.
// On Vercel, the browser request that created a quote and the export request may
// be handled by different serverless instances. The client therefore supplies the
// quotation currently open in the editor.
function getDirectExportPayload(body: any): { quote: Quote; project: Project } | null {
  const quote = body?.quote as Quote | undefined;
  const project = body?.project as Project | undefined;
  if (!quote || !project) return null;
  return { quote, project };
}

app.post('/api/exports/xlsx', async (req, res) => {
  try {
    const payload = getDirectExportPayload(req.body);
    if (!payload) {
      return res.status(400).json({ error: 'A current quotation and project are required for XLSX export.' });
    }

    const { quote, project } = payload;
    const profile = db.getConversionProfile();
    const xlsxBuffer = quote.preservedTemplateWorkbook?.transformedXlsxBase64
      ? Buffer.from(quote.preservedTemplateWorkbook.transformedXlsxBase64, 'base64')
      : await generateCustomerXlsx(quote, project, profile);
    const fileName = quote.preservedTemplateWorkbook?.outputFileName
      || `MOCOF_Quotation_${project.quotationNumber || 'Customer_Quote'}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.send(xlsxBuffer);
  } catch (error: any) {
    console.error('Direct XLSX export error:', error);
    return res.status(500).json({ error: 'Failed to generate XLSX export', detail: error?.message });
  }
});

app.post('/api/exports/pdf', async (req, res) => {
  try {
    const payload = getDirectExportPayload(req.body);
    if (!payload) {
      return res.status(400).json({ error: 'A current quotation and project are required for PDF export.' });
    }

    const { quote, project } = payload;
    const profile = db.getConversionProfile();
    const pdfBuffer = await generateCustomerPdf(quote, project, profile);
    const fileName = `MOCOF_Quotation_${project.quotationNumber || 'Customer_Quote'}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Direct PDF export error:', error);
    return res.status(500).json({ error: 'Failed to generate PDF export', detail: error?.message });
  }
});

// Version History
  app.get('/api/quotes/:id/versions', (req, res) => {
    const versions = db.getQuoteVersions(req.params.id);
    res.json(versions);
  });

  // Admin Conversion Profile
  app.get('/api/admin/profile', (req, res) => {
    res.json(db.getConversionProfile());
  });

  app.put('/api/admin/profile', (req, res) => {
    const updated = db.updateConversionProfile(req.body);
    res.json(updated);
  });

  // Live Exchange Rates
  app.get('/api/exchange-rates', async (req, res) => {
    const rates = await fetchLiveExchangeRates();
    res.json(rates);
  });

  // Reset Data to Seed
  app.post('/api/seed-reset', (req, res) => {
    db.resetToSeed();
    res.json({ success: true, message: 'Database reset to seed state' });
  });

  return app;
}

async function startServer() {
  const app = await createApp();
  const PORT = 3000;

  // Vite middleware for development vs static serve for production.
  // This is intentionally local-only; Vercel serves dist and api/index.ts.
  if (process.env.NODE_ENV !== 'production') {
    // Keep Vite out of the Vercel function dependency graph. Vite loads
    // Rollup's platform-native binary, which belongs only in local dev and
    // causes the serverless API to crash before any request can be handled.
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MOCOF AI Quotation Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL && !process.env.MOCOF_BACKGROUND_WORKER) {
  startServer();
}
