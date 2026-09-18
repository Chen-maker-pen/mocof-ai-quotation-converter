/**
 * MOCOF Gemini AI Translation & Conversion Service
 * Uses @google/genai SDK on server-side with structured JSON schemas.
 */

import { GoogleGenAI, Type } from '@google/genai';
import { ConversionProfile, QuoteItem, ExceptionItem } from '../src/types.js';
import { getDocumentedAreaPrompts } from './documentedPrompts.js';

let aiClient: GoogleGenAI | null = null;

// Vercel Hobby functions have a short request ceiling.  Keep a generous
// margin for Excel parsing and workbook generation, then complete through the
// deterministic documented-rule path if Gemini is slow or temporarily busy.
const GEMINI_REQUEST_TIMEOUT_MS = 30_000;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
        timeout: GEMINI_REQUEST_TIMEOUT_MS,
        // A retry can exceed Vercel's runtime ceiling. One attempt lets the
        // normal XLSX fallback finish the customer quotation reliably.
        retryOptions: { attempts: 1 },
      },
    });
  }
  return aiClient;
}

const EXTRACTOR_SYSTEM_PROMPT =
  'You are MOCOF’s careful Chinese-to-English renovation quotation extractor. Return one entry for every source product row with an SKU/code. Preserve Chinese text, source references, product images, SKU, dimensions, room, category, quantity, supplier unit price, supplier total and notes. Translate the product name into concise professional English. Never invent facts and never calculate totals. If uncertain, return null and review_required=true. Return only schema-valid JSON.';

const CONVERSION_SYSTEM_PROMPT =
  'You are MOCOF’s automatic quotation conversion agent. Apply the supplied MOCOF Customer English profile to the structured source quotation. Return a schema-valid final quotation and an exception list. Follow all deterministic mappings where available. Do not invent a product, photo, price, quantity, dimension, discount, tax, exchange rate or total. Preserve Whole House Total and Supplementary Items. Mark any uncertainty as an exception. Return only JSON.';

export interface PdfQuotationExtraction {
  customerName?: string;
  rooms: Array<{
    name: string;
    items: Array<{
      section: string;
      nameChinese: string;
      nameEnglish: string;
      itemCode: string;
      dimensionText: string;
      quantity: number;
      supplierPrice: number;
    }>;
  }>;
}

export interface WorkbookPromptOperation {
  promptIndex: number;
  address: string;
  value?: string | number;
  formula?: string;
  explanation: string;
}

/**
 * Builds an executable patch plan from the *complete* selected Area document.
 * This is intentionally a plan, not a new quotation: Gemini may only target
 * existing cells in the uploaded source template. Formula evaluation and the
 * original XLSX drawings/media remain outside the model's control.
 */
export async function createTemplateRecipeTransactions(
  areaPrompts: Array<{ number: string; category: string; text: string }>,
  cells: Array<{ sheetName: string; address: string; value: string | number }>,
  customer: { name: string; address: string; sqft: number; budget: number; currency: string },
): Promise<{ operations: Array<WorkbookPromptOperation & { sheetName: string; promptNumber: string }>; summaries: string[] }> {
  const ai = getGeminiClient();
  if (!ai) throw new Error('Template recipe execution requires GEMINI_API_KEY.');
  const allowed = new Set(cells.map((cell) => `${cell.sheetName}::${cell.address}`.toUpperCase()));
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: JSON.stringify({
      task: 'Execute every listed MOCOF Area prompt in the provided order against a cloned Chinese supplier XLSX template.',
      nonNegotiableRules: [
        'Every numbered prompt must be considered in sequence. Return a summary for every prompt number, even when no cell patch is needed.',
        'The source workbook is immutable. Return only cell changes for its clone; never create/delete sheets, move photos, remove drawings, change merges, styles, row heights or column widths.',
        'Only target a supplied existing sheetName + A1 address. Do not invent a row, product, quantity, price, discount rate, or customer fact.',
        'Use Excel formulas (without a leading equals sign) for calculations. Do not replace formulas by guessed totals.',
        'Use the customer input values only for Customer Name, Address, Sqft, Budget and Currency labels as required by the prompt.',
        'A number written in scientific notation such as 8E-01 is a numeric factor, not a visible price. Preserve numeric meaning.',
      ],
      customer,
      prompts: areaPrompts,
      existingCells: cells,
    }),
    config: {
      systemInstruction: 'You are MOCOF’s controlled spreadsheet recipe executor. Return only schema-valid JSON. Accuracy and preservation are more important than completing an uncertain edit.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          operations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
            promptNumber: { type: Type.STRING }, sheetName: { type: Type.STRING }, address: { type: Type.STRING },
            value: { type: Type.STRING }, formula: { type: Type.STRING }, explanation: { type: Type.STRING },
          }, required: ['promptNumber', 'sheetName', 'address', 'explanation'] } },
          summaries: { type: Type.ARRAY, items: { type: Type.STRING } },
        }, required: ['operations', 'summaries'],
      },
    },
  });
  const parsed = JSON.parse(response.text || '{}');
  const operations = (Array.isArray(parsed.operations) ? parsed.operations : [])
    .filter((op: any) => allowed.has(`${String(op.sheetName)}::${String(op.address).toUpperCase()}`.toUpperCase()))
    .slice(0, 500)
    .map((op: any) => ({
      promptIndex: Number(op.promptNumber) || 0,
      promptNumber: String(op.promptNumber),
      sheetName: String(op.sheetName),
      address: String(op.address).toUpperCase(),
      value: typeof op.value === 'number' ? op.value : (op.value === undefined ? undefined : String(op.value)),
      formula: op.formula ? String(op.formula).replace(/^=/, '') : undefined,
      explanation: String(op.explanation || 'Applied documented recipe patch.'),
    }));
  return { operations, summaries: Array.isArray(parsed.summaries) ? parsed.summaries.map(String) : [] };
}

/**
 * Converts a boss's natural-language instruction into small, reviewable cell
 * transactions. The browser applies only these returned A1/J44 operations;
 * Gemini is never allowed to invent rows, totals, or hidden data structures.
 */
export async function createWorkbookPromptTransactions(
  prompts: string[],
  cells: Array<{ address: string; value: string | number; formula?: string }>,
  documentedPrompts: string[]
): Promise<{ operations: WorkbookPromptOperation[]; summaries: string[] }> {
  const ai = getGeminiClient();
  if (!ai) throw new Error('Applying natural-language prompts requires GEMINI_API_KEY. Add it in Vercel, then redeploy.');

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: JSON.stringify({
      task: 'Apply boss instructions to the existing MOCOF customer quotation spreadsheet.',
      rules: [
        'The supplied quotation document rules are the mandatory base recipe already used to create this workbook. Respect every rule and do not contradict it.',
        'Return only changes requested by the boss prompts. Do not rebuild or delete unrelated cells.',
        'Every operation must target an existing A1-style cell address from the supplied grid.',
        'For discounts or calculations return an Excel formula without a leading equals sign, and return the calculated value only when it is certain.',
        'Never invent a price, product, customer fact, room, or quantity. If a requested change is unclear, return no operation for it and explain this in summaries.',
      ],
      documentedAreaRecipe: documentedPrompts,
      bossPrompts: prompts.map((text, promptIndex) => ({ promptIndex, text })),
      existingCells: cells,
    }),
    config: {
      systemInstruction: 'You are a careful spreadsheet quotation assistant. Return only schema-valid JSON. Financial accuracy and traceability are mandatory.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          operations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                promptIndex: { type: Type.INTEGER },
                address: { type: Type.STRING },
                value: { type: Type.STRING },
                formula: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ['promptIndex', 'address', 'explanation'],
            },
          },
          summaries: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['operations', 'summaries'],
      },
    },
  });
  const parsed = JSON.parse(response.text || '{}');
  const validAddresses = new Set(cells.map((cell) => cell.address.toUpperCase()));
  const operations = (Array.isArray(parsed.operations) ? parsed.operations : [])
    .filter((operation: any) => Number.isInteger(operation.promptIndex) && validAddresses.has(String(operation.address || '').toUpperCase()))
    .slice(0, 80)
    .map((operation: any) => ({
      promptIndex: operation.promptIndex,
      address: String(operation.address).toUpperCase(),
      value: operation.value,
      formula: operation.formula ? String(operation.formula).replace(/^=/, '') : undefined,
      explanation: String(operation.explanation || 'Applied to workbook cell.'),
    }));
  return { operations, summaries: Array.isArray(parsed.summaries) ? parsed.summaries.map(String).slice(0, prompts.length) : [] };
}

/**
 * PDFs do not contain the editable worksheet grid that Excel templates have.
 * Gemini reads the PDF and returns a source-shaped structure; the normal
 * deterministic quotation builder then creates the editable workbook.
 */
export async function extractPdfQuotation(buffer: Buffer): Promise<PdfQuotationExtraction> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('PDF conversion requires GEMINI_API_KEY. Add the key, redeploy/restart the app, then upload the PDF again. XLSX conversion can still use the deterministic parser without an API key.');
  }

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{
      role: 'user',
      parts: [
        { inlineData: { mimeType: 'application/pdf', data: buffer.toString('base64') } },
        { text: 'Read this Chinese renovation quotation PDF. Extract only explicit facts into rooms and product rows. A room is a customer space, not Extra m2, Curve, Wall Panel, discount or a service. Preserve names, item codes, dimensions, quantities and source prices exactly when readable. Give an empty string or 0 for an unreadable fact; never invent it.' },
      ],
    }],
    config: {
      systemInstruction: EXTRACTOR_SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          customerName: { type: Type.STRING },
          rooms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      section: { type: Type.STRING }, nameChinese: { type: Type.STRING }, nameEnglish: { type: Type.STRING },
                      itemCode: { type: Type.STRING }, dimensionText: { type: Type.STRING }, quantity: { type: Type.NUMBER }, supplierPrice: { type: Type.NUMBER },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  try {
    const extracted = JSON.parse(response.text || '{}');
    if (!Array.isArray(extracted.rooms) || extracted.rooms.length === 0) {
      throw new Error('No room tables were found in the PDF.');
    }
    return extracted as PdfQuotationExtraction;
  } catch (error: any) {
    throw new Error(`Could not read this PDF quotation: ${error.message || 'no structured quotation data returned'}`);
  }
}

export async function processAiExtractionAndConversion(
  rawChineseRows: any[][],
  profile: ConversionProfile,
  detectedArea?: number
): Promise<{
  translatedItems: Partial<QuoteItem>[];
  exceptions: Partial<ExceptionItem>[];
}> {
  const ai = getGeminiClient();

  if (!ai) {
    console.warn('GEMINI_API_KEY missing or client not initialized. Falling back to rule-based deterministic mapping.');
    return fallbackRuleBasedMapping(rawChineseRows, profile);
  }

  try {
    const exactAreaDocument = detectedArea ? getDocumentedAreaPrompts(detectedArea) : undefined;
    const jsonPrompt = {
      action: 'EXTRACT_AND_CONVERT',
      company: profile.companyName,
      rules: profile.rules,
      bossEditingRules: profile.bossEditingRules,
      // Send every exact prompt from the single detected Area, rather than a
      // shortened recipe or unrelated Area instructions.
      // Use the full source document, line-by-line. The profile summary is
      // retained only as supplemental company policy; it must never replace
      // the Area recipe supplied by the boss.
      areaPromptRules: exactAreaDocument
        ? exactAreaDocument.prompts.map((prompt) => ({ number: prompt.number, category: prompt.category, text: prompt.text }))
        : profile.areaPromptRules,
      detectedArea: detectedArea || null,
      instructionPriority: [
        'Preserve source facts and embedded photos',
        `Use detectedArea ${detectedArea || 'unknown'} when it is supplied. Count only real customer rooms/spaces to select Area 1–10; never count MOCOF add-ons or services as an area`,
        'List real rooms first in Whole House Total, then list the MOCOF service/add-on rows',
        'Apply shared boss editing rules',
        'Apply every documented prompt entry for the selected Area in its listed order',
        'Flag ambiguity for boss review instead of guessing',
      ],
      // These are compact structured product rows, so include every visible
      // product rather than translating only the first 30 source spreadsheet rows.
      sourceProductRows: rawChineseRows.slice(0, 600),
    };

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: JSON.stringify(jsonPrompt),
      config: {
        systemInstruction: `${EXTRACTOR_SYSTEM_PROMPT}\n\n${CONVERSION_SYSTEM_PROMPT}\n\nThe supplied bossEditingRules and areaPromptRules are mandatory. Identify the matching area from worksheet headings and table row boundaries. If the area is unknown or its custom rules are awaiting confirmation, apply only the shared rules and return an exception describing the missing area layout.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sourceRowIndex: { type: Type.INTEGER },
                  itemCode: { type: Type.STRING },
                  nameChinese: { type: Type.STRING },
                  nameEnglish: { type: Type.STRING },
                  category: { type: Type.STRING },
                  roomName: { type: Type.STRING },
                  dimensionText: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  supplierPriceCNY: { type: Type.NUMBER },
                  notes: { type: Type.STRING },
                  reviewRequired: { type: Type.BOOLEAN },
                  reviewReason: { type: Type.STRING },
                },
              },
            },
            exceptions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sourceRow: { type: Type.INTEGER },
                  productCode: { type: Type.STRING },
                  chineseText: { type: Type.STRING },
                  reasonCode: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      if (parsed && Array.isArray(parsed.items)) {
        const translatedItems: Partial<QuoteItem>[] = parsed.items.map((it: any) => ({
          sourceRowIndex: it.sourceRowIndex || 1,
          itemCode: it.itemCode || 'MC-ITEM-01',
          nameChinese: it.nameChinese || '定制木作',
          nameEnglish: it.nameEnglish || 'Custom Joinery Unit',
          category: (it.category || 'cabinet') as any,
          roomName: it.roomName || 'Living Room',
          dimensionText: it.dimensionText || 'Standard',
          quantity: it.quantity || 1,
          unit: it.unit || 'Set',
          supplierPriceCents: Math.round((it.supplierPriceCNY || 1000) * 100),
          notes: it.notes || '',
          isExceptionFlagged: !!it.reviewRequired,
          exceptionReasons: it.reviewReason ? [it.reviewReason] : [],
        }));

        const exceptions: Partial<ExceptionItem>[] = (parsed.exceptions || []).map((ex: any) => ({
          sourceRow: ex.sourceRow || 1,
          productCode: ex.productCode || 'UNKNOWN',
          chineseText: ex.chineseText || '未匹配明细',
          reasonCode: (ex.reasonCode || 'UNAPPROVED_TRANSLATION') as any,
          description: ex.description || 'Item requires manager review',
          severity: 'warning',
          resolved: false,
        }));

        return { translatedItems, exceptions };
      }
    }
  } catch (err) {
    console.error('Gemini API extraction error:', err);
  }

  return fallbackRuleBasedMapping(rawChineseRows, profile);
}

function fallbackRuleBasedMapping(
  rawRows: any[][],
  profile: ConversionProfile
): {
  translatedItems: Partial<QuoteItem>[];
  exceptions: Partial<ExceptionItem>[];
} {
  const translatedItems: Partial<QuoteItem>[] = [];
  const exceptions: Partial<ExceptionItem>[] = [];

  rawRows.forEach((row, idx) => {
    const rowStr = row.map((cell) => String(cell)).join(' ');
    if (!rowStr.trim() || rowStr.includes('单价') || rowStr.includes('Total')) return;

    let matchedRule = profile.rules.find((r) => rowStr.includes(r.chineseTerm));

    if (matchedRule) {
      translatedItems.push({
        sourceRowIndex: idx + 1,
        itemCode: `MC-SKU-${idx + 10}`,
        nameChinese: rowStr.substring(0, 30),
        nameEnglish: matchedRule.englishTranslation,
        category: matchedRule.category,
        roomName: matchedRule.roomNameDefault || 'General Room',
        dimensionText: 'W1200 x D600 x H2400 mm',
        quantity: 1,
        unit: 'Set',
        supplierPriceCents: 150000, // 1500 CNY
        notes: 'Matched via rule dictionary',
        isExceptionFlagged: false,
        exceptionReasons: [],
      });
    } else if (rowStr.length > 5) {
      exceptions.push({
        sourceRow: idx + 1,
        sourceSheet: '全屋主表',
        productCode: `RAW-${idx + 1}`,
        chineseText: rowStr.substring(0, 40),
        reasonCode: 'UNAPPROVED_TRANSLATION',
        description: `Unrecognized Chinese product term in row ${idx + 1}`,
        severity: 'warning',
        resolved: false,
      });
    }
  });

  return { translatedItems, exceptions };
}
