import 'dotenv/config';

/**
 * MOCOF AI Integrated Quotation Converter Express Server
 */

import express from 'express';
import path from 'path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { fetchLiveExchangeRates, lockRateSnapshot, createRateSnapshot } from './server/exchange.js';
import { parseSupplierXlsxBuffer } from './server/xlsxParser.ts';
import { processAiExtractionAndConversion } from './server/geminiService.js';
import {
  recalculateWorksheet,
  calculateWholeHouseTotals,
  generateReconciliationReport,
} from './server/calcEngine.js';
import { generateCustomerXlsx, generateCustomerPdf } from './server/exporter.js';
import { Project, Quote, QuoteVersion } from './src/types.js';

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Routes

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'MOCOF AI Integrated Quotation Converter', timestamp: new Date() });
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

      const project = db.getProjectById(quote.projectId);
      const profile = db.getConversionProfile();

      let parsedXlsx;
      let originalFileName = 'Supplier_CN_Quote.xlsx';

      if (req.file) {
        originalFileName = req.file.originalname;
        parsedXlsx = await parseSupplierXlsxBuffer(req.file.buffer, originalFileName);
      } else {
        return res.status(400).json({
          error: 'Please choose the original Chinese supplier XLSX file before starting conversion.',
        });
      }

      // Step: Run Gemini AI Translation & Conversion
      const sampleRows = parsedXlsx.rawRowsBySheet[parsedXlsx.sheetNames[0]] || [];
      const aiResult = await processAiExtractionAndConversion(sampleRows, profile);

      // Step: Recalculate Worksheets using Deterministic Integer Math
      const exchangeRateValue = quote.exchangeRate.rate || 0.652;
      const updatedWorksheets = parsedXlsx.parsedWorksheets.map((ws) =>
        recalculateWorksheet(ws, exchangeRateValue, profile)
      );

      // Whole house totals & supplementary items
      const wholeHouseTotals = calculateWholeHouseTotals(
        updatedWorksheets,
        quote.supplementaryItems,
        profile,
        parsedXlsx.totalSupplierCNY,
        exchangeRateValue
      );

      // Register exceptions
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
      const newStatus = hasExceptions
        ? 'Generated – Exceptions Need Review'
        : 'Generated – Ready for Approval';

      quote.worksheets = updatedWorksheets;
      quote.wholeHouseTotals = wholeHouseTotals;
      quote.status = newStatus;
      quote.updatedAt = new Date().toISOString();

      db.saveQuote(quote);
      if (project) {
        db.updateProject(project.id, {
          status: newStatus,
          totalMYRCents: wholeHouseTotals.grandTotalCents,
        });
      }

      db.addAuditLog({
        projectId: quote.projectId,
        quoteId: quote.id,
        action: 'CONVERSION_COMPLETED',
        performedBy: 'MOCOF AI Converter',
        details: `Parsed ${parsedXlsx.sheetNames.length} worksheets from ${originalFileName}. Generated 6-sheet customer quote with ${aiResult.exceptions.length} exception flags.`,
      });

      res.json({
        quote,
        parsedSheetNames: parsedXlsx.sheetNames,
        extractedImageCount: parsedXlsx.extractedImages.length,
        exceptions: db.getExceptionsByQuoteId(quote.id),
      });
    } catch (err: any) {
      console.error('Conversion endpoint error:', err);
      res.status(500).json({ error: err.message || 'Conversion failed' });
    }
  });

  // Save / Update Quote State (Full Quotation Editor Workspace)
  app.put('/api/quotes/:id', (req, res) => {
    const quoteId = req.params.id;
    const existingQuote = db.getQuoteById(quoteId);
    if (!existingQuote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    const { worksheets, supplementaryItems, notes, versionLabel } = req.body;
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
      const xlsxBuffer = await generateCustomerXlsx(quote, project, profile);

      quote.status = 'Exported';
      db.saveQuote(quote);
      db.updateProject(project.id, { status: 'Exported' });

      db.addAuditLog({
        projectId: project.id,
        quoteId: quote.id,
        action: 'EXPORT_XLSX',
        performedBy: 'User',
        details: `Exported 6-sheet customer quotation XLSX workbook for ${project.customerName}.`,
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="MOCOF_Quotation_${project.quotationNumber}.xlsx"`);
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

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
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

startServer();
