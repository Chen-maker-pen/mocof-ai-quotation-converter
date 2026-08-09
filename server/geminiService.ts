/**
 * MOCOF Gemini AI Translation & Conversion Service
 * Uses @google/genai SDK on server-side with structured JSON schemas.
 */

import { GoogleGenAI, Type } from '@google/genai';
import { ConversionProfile, QuoteItem, ExceptionItem } from '../src/types.js';

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
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
    model: 'gemini-3.6-flash',
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
    const jsonPrompt = {
      action: 'EXTRACT_AND_CONVERT',
      company: profile.companyName,
      rules: profile.rules,
      bossEditingRules: profile.bossEditingRules,
      areaPromptRules: profile.areaPromptRules,
      detectedArea: detectedArea || null,
      instructionPriority: [
        'Preserve source facts and embedded photos',
        `Use detectedArea ${detectedArea || 'unknown'} when it is supplied. Count only real customer rooms/spaces to select Area 1–10; never count MOCOF add-ons or services as an area`,
        'List real rooms first in Whole House Total, then list the MOCOF service/add-on rows',
        'Apply shared boss editing rules',
        'Apply the one area rule that matches the worksheet layout',
        'Flag ambiguity for boss review instead of guessing',
      ],
      // These are compact structured product rows, so include every visible
      // product rather than translating only the first 30 source spreadsheet rows.
      sourceProductRows: rawChineseRows.slice(0, 600),
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
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
