/**
 * MOCOF Seed Data
 * Preloaded authentic Malaysian renovation quotation projects
 */

import {
  Project,
  SourceDocument,
  Quote,
  ConversionProfile,
  MappingRule,
  ExceptionItem,
  AuditLog,
} from '../src/types.js';
import { DOCUMENTED_AREA_PROMPTS } from './documentedPrompts.js';

const BOSS_EDITING_RULES = `
Apply MOCOF Prompt Documentation rules in this order. Preserve the original Chinese workbook, source values and embedded product photos; create a customer-facing English version only.

1. Determine the Area number from the number of real room/space rows only. A room/space is a customer location such as Master Bedroom, Living & Dining, Vanity, Kitchen, Foyer or Study. Do NOT count Extra m², Curve, Wall Panel, Aluminium Frame, Add-on Finishing, Wall Bed, Pull-out Mechanism, doors, windows, grill doors, island, special offer, discount or any other service/add-on as an area. For example: Master Bedroom + Living & Dining + Vanity is Area 3. Put all service/add-on rows after the real room rows.
2. Create one long editable Google-Sheets-style customer workbook sheet. It must include every required table in this fixed order: (a) customer header and Whole House Total; (b) Supplementary; (c) the complete item tables for every detected real room/space, in the same order as Whole House Total; (d) bilingual remarks and signature area. Never create a customer output that contains only Whole House Total.
3. For Area 3, the same sheet must therefore show: Whole House Total → Supplementary → Master Bedroom tables → Living Dining tables → Vanity tables. For every other Area number, replace these room names with all detected real rooms, preserving their order. Each room must include its Cabinet, Accessories and applicable Wall Panel/LF/Kitchen/Vanity tables and subtotals.
4. Create the Whole House Total table: title “MOCOF Whole House Quotation”, customer name/address/sqft details, MYR currency, RM49,800 and RM79,800 package columns, software/before/after price columns, sequential numbering, totals and discount percentage. Show the real room rows first, followed by the MOCOF services/add-ons section.
5. Add Whole House extras: Extra m², Curve, Wall Panel, Aluminium Frame, Add-on finishing and (only where the area instructions require it) Deduct Design Fee. Package formulas are: RM49,800 Extra m² = (Cabinet Total − 20) × 1999; RM79,800 Extra m² = (Cabinet Total − 24) × 1999; RM79,800 Wall Panel = (Wall Panel Total − 6) × 650. Deduct Design Fee tiers are: sqft ≤1500 = −1500; 1501–2000 = −2000; 2001–2500 = −3500; 2501–3000 = −6000. Never apply a design fee where the area rule says it is not required.
3. Create the Supplementary table with its 14 approved service rows: Defect Check before start work; 3D & 2D design and submission; Project management; Post reno cleaning; Floor Protection (Floor guard); Electrical; Plaster ceiling; Painting with white paint; Paint with 3 colour Nippon colors; Partition (normal w/o sound proof); Curtain with Blind per window H 8–9ft; Hacking & Removal; Grout; Mirror. Use quantities/per values 1, 5, 6, 1, 1, 19, 10, 9, 12, 24, 43, 77, 6.5, 50. Before price is sqft/per × customer RM/sqft, after price is before price × 80%, and the first five after-price rows are 0. Create totals and the Whole House plus Supplementary grand total. Highlight the lowest package total in green.
4. Translate customer-facing headings and labels exactly: Whole House Total, Supplementary, Cabinet Total Price, Accessories Total Price, Product PIC, Combi, Name, Model, WDH, Qty, Software Price, Before Price, After Price, Handle by, Customer Signature, Date. Keep Chinese room names and append approved English room names.
5. Translate room names: Guest Bedroom, Study Room, Living and Dining Room, Foyer, Master Bedroom, Kitchen, Multipurpose Room and Kids Room. Translate product families: 23 System Cabinet, 25 Kitchen Cabinet, Background Wall Panel and New Product.
6. Link room subtotals into Whole House Total. Preserve all source images and attach each original product image to its corresponding customer-facing item. Do not fabricate missing images, dimensions, prices, quantity, exchange rate or totals; flag them for review.
7. Create M&E Work and Curtain sections when present, retain the quotation remarks/terms in English and Chinese, and remove rows labelled 活动金额优惠价.
8. Use formulas rather than hard-coded values for totals, converted before price, discounted after price and pricing comparisons. Do not overwrite a formula with a number. Keep the workbook editable like Google Sheets.
9. Use Malaysian Ringgit formatting (RM) in every customer price and total. The live or project-locked exchange rate is authoritative; do not assume a rate from the source workbook.
10. Apply area-specific instructions after these shared rules. When an instruction conflicts with the source layout, preserve data and create a review exception instead of guessing.
`.trim();

/**
 * This is the complete rule sequence from the MOCOF Prompt Documentation.
 * The original Google-Sheets prompts use different row numbers for each Area.
 * We generate those coordinates from the detected number of genuine rooms so
 * the same complete sequence is applied to Area 1 through Area 10.
 */
const buildDocumentedAreaPrompts = (areaNumber: number): string[] => {
  const extrasStart = 7 + areaNumber;
  const designFeeRow = extrasStart + 5;
  const wholeHouseTotalRow = extrasStart + 6;
  const supplementaryTitleRow = wholeHouseTotalRow + 2;
  const supplementaryHeaderRow = supplementaryTitleRow + 1;
  const supplementaryStartRow = supplementaryHeaderRow + 1;
  const supplementaryEndRow = supplementaryStartRow + 13;
  const supplementaryTotalRow = supplementaryEndRow + 1;
  const grandTotalRow = supplementaryTotalRow + 1;

  return [
    `CHANGE THE TOP HEADINGS PROMPT: Copy all content from Column H to Column I and Column J, from top to bottom. Update E1 to “MOCOF Whole House Quotation”. Replace 全屋汇总 with “Whole House Total”.`,
    `CHANGE THE TITLE PROMPT: Rename the Whole House headings to No., Space, Wall Panel (m²), Cabinet (m²), RM49800, RM79800, Software Price, Before Price and After Price.`,
    `FILL IN THE CUSTOMER DETAILS: Rename E2:E4 to Customer Name, Address and Sqft. Fill F2, F3 and F4 with editable customer values. Clear G2:J4, then insert Currency/exchange rate, Budget/customer budget and RM/sqft.`,
    `ADD THE DISCOUNT PERCENTAGE: Insert 90% at I2, as scientific and 2 decimal places.`,
    `CLEAR THE CONTENT: Clear package-input contents for the ${areaNumber} source room rows only. Preserve the product data, source values and embedded photographs.`,
    `INSERT EXTRA: Insert six rows after row ${extrasStart - 1}. Add Extra m2, Curve, Wall Panel, Aluminium Frame, Add-on finishing and Deduct Design fee.`,
    `ADD THE SERIAL NUMBER FOR WHOLE HOUSE TOTAL TABLE: Add serial numbers from A7 through “Deduct Design fee”, with the ${areaNumber} real rooms first.`,
    `CREATE TOTAL PRICE FOR WHOLE HOUSE TOTAL TABLE: At row ${wholeHouseTotalRow}, create totals for Wall Panel, Cabinet, RM49800, RM79800, Software Price, Before Price and After Price. RM49800 and RM79800 include their package base price.`,
    `APPLY THE PACKAGES FORMULA: In F${extrasStart}, use (Cabinet Total − 20) × 1999. In G${extrasStart}, use (Cabinet Total − 24) × 1999.`,
    `APPLY THE WALL PANEL FORMULA: In G${extrasStart + 2}, use (Wall Panel Total − 6) × 650.`,
    `ADD THE DEDUCT DESIGN FEE FORMULA: At row ${designFeeRow}, use −1500 for sqft ≤1500; −2000 for 1501–2000; −3500 for 2001–2500; −6000 for 2501–3000. Do not use it where the project does not require it.`,
    `CURRENCY: Apply RM currency formatting to every package, Software Price, Before Price, After Price and total.`,
    `SUPPLEMENTARY TABLE: Insert “Supplementary” at A${supplementaryTitleRow}.`,
    `INSERT THE TEXT: At row ${supplementaryHeaderRow}, insert No., Name, sqft / per, Qty / per, RM49800, RM79800, Software Price, Before Price and After Price.`,
    `ADD THE NAME OF CONTENT: Starting from B${supplementaryStartRow}, add Defect Check before start work; 3D & 2D design and submission; Project management; Post reno cleaning; Floor Protection (Floor guard); Electrical; Plaster ceiling; Painting with white paint; Paint with 3 colour Nippon colors; Partition (normal w/o sound proof); Curtain with Blind per window H 8–9ft; Hacking & Removal; Grout; Mirror.`,
    `ADD THE SERIAL NUMBER FOR SUPPLEMENTARY TABLE: Number A${supplementaryStartRow}:A${supplementaryEndRow} from 1 to 14. Insert 80% at I3, as scientific and 2 decimal places.`,
    `INSERT THE CONTENT AND FORMULA: Use 1, 5, 6, 1, 1, 19, 10, 9, 12, 24, 43, 77, 6.5, 50 for sqft/per. Qty/per is editable. Before Price = sqft/per × RM/sqft. After Price = Before Price × I3.`,
    `RM49800 & RM79800 = AFTER PRICE: Column F and Column G mirror After Price. Set the first five Supplementary After Price values to 0.`,
    `CREATE TOTAL PRICE FOR SUPPLEMENTARY TABLE: At row ${supplementaryTotalRow}, insert “Total Supplementary” and total F${supplementaryStartRow}:J${supplementaryEndRow}.`,
    `CREATE TOTAL WHOLE HOUSE PRICE WITH SUPPLEMENTARY ITEMS: At row ${grandTotalRow}, add Whole House Total plus Total Supplementary in every applicable price column.`,
    `INSERT THE UNIT/PRICE FOR PRICE REASONABLENESS REVIEW: Calculate price per sqft using the lowest valid completed package total divided by sqft.`,
    `HIGHLIGHT THE CHEAPEST PRICE: Compare the completed package totals and highlight the lowest valid total in green.`,
    `24. M&E AND CURTAIN TABLES: When present in source, preserve/create M&E Work and Curtain tables with No., Name, Model and Qty columns.`,
    `25. M&E CONTENT: Retain the documented Electrical and Plaster work scope, including plaster ceiling, lighting points, eyeball fittings, Osram LED T5, switches/doorbell, fan/light relocation and related accessories.`,
    `26. CURTAIN CONTENT: Retain the documented curtain scope for living room, master bedroom and small room, including Dimmer collection and sheer material specifications.`,
    `27. M&E/CURTAIN QUANTITY: Set documented scope quantities to 1 unless the source specifies a different confirmed quantity.`,
    `28. TRANSLATE TOTAL LABELS: 柜体合计 → Cabinet Total Price; 配套品合计 → Accessories Total Price; 合计 → Total Price.`,
    `29. TRANSLATE SMALL TABLES: 柜体表 → Cabinet Table; 配套品表 → Accessories Table.`,
    `30. TRANSLATE ROOM HEADINGS: 客卧房 → Guest Bedroom; 书房 → Study Room; 客餐厅 → Living and Dining Room; 门厅 → Foyer; 主卧房 → Master Bedroom; 厨房 → Kitchen; 多功能空间 → Multipurpose Room; 儿童房 → Kids Room. Show bilingual text where it improves auditability.`,
    `31. TRANSLATE COLUMN HEADINGS: 序号 → No.; 产品图片 → Product PIC; 组合 → Combi; 名称 → Name; 型号 → Model; 宽深高 → WDH; 数量 → Qty; 单价 → Before Price.`,
    `32. TRANSLATE PRODUCT FAMILIES: 23系统柜 → 23 System Cabinet; 25厨柜 → 25 Kitchen Cabinet; 美家背景墙 → Background Wall Panel; 新居产品 → New Product.`,
    `33. TRANSLATE FINAL LABELS: 经手人 → Handle by; 顾客签名 → Customer Signature; 日期 → Date.`,
    `34. LINK ROOM TOTALS: Link every detected room subtotal back to its Whole House row. Create Cabinet Total Price and Accessories Total Price formulas from the actual room-table rows; never replace a formula with a hard-coded amount.`,
    `35. BEFORE-PRICE CONVERSION: For each numeric detailed-row Software Price, calculate Before Price from the locked exchange rate. Keep heading cells as text and leave blank source values blank.`,
    `36. AFTER-PRICE DISCOUNT: For each numeric detailed-row Before Price, calculate After Price using the 90% customer discount. Keep heading cells as text and leave blank source values blank.`,
    `37. PRICE LABELS: In detailed tables, name H as Software Price, I as Before Price and J as After Price; run these renames before applying conversions and discounts.`,
    `38. LOGO AND MERGES: Retain the MOCOF logo/header area and preserve required horizontal/vertical merged cells without deleting source photos.`,
    `39. REMARKS: Include the documented bilingual quotation-validity, specifications, custom-production and material-grade terms, plus Customer Signature and Date.`,
    `40. REMOVE PROMOTION ROWS: Delete or hide rows labelled 活动金额优惠价 from the customer-facing quotation; retain them in the immutable source for audit.`,
    `41. EDITABILITY: The generated customer workbook must remain editable like Google Sheets. Formulas, values, descriptions, quantities and prices must be inspectable before export.`,
    `42. PHOTO PRESERVATION: Reuse each original product photo with its corresponding item. Do not fabricate a replacement photo; flag a missing image for review.`,
    `43. SAFETY CHECK: If a documented coordinate conflicts with the uploaded supplier layout, preserve the source data, apply the semantic rule in the generated customer layout and create a review exception instead of inventing data.`,
  ];
};

// The Word document is the authority.  Keep every original prompt entry,
// including its Area-specific coordinates and wording, in the AI input.
const DEFAULT_AREA_PROMPT_RULES = DOCUMENTED_AREA_PROMPTS.map((area) => ({
  areaNumber: area.areaNumber,
  label: area.label,
  instructions: area.prompts
    .map((prompt, index) => `[DOCUMENTED PROMPT ${index + 1} | ${prompt.category || prompt.number}]\n${prompt.text}`)
    .join('\n\n'),
}));

export const DEFAULT_CONVERSION_PROFILE: ConversionProfile = {
  companyName: 'MOCOF SDN BHD',
  companyAddress: 'No. 18, Jalan Industrial 3, Kawasan Perindustrian, 40150 Shah Alam, Selangor, Malaysia',
  companyRegNo: '201901023456 (1332785-M)',
  companyPhone: '+60 3-5569 8822',
  companyEmail: 'quotation@mocof.com.my',
  logoUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=300&q=80',
  defaultMarkupPercent: 35,
  defaultDiscountPercent: 5,
  taxRatePercent: 6.0,
  hideInternalHardwareRows: true,
  defaultCurrency: 'MYR',
  roundingMode: 'NEAREST_RINGGIT',
  termsAndConditions: [
    '50% deposit upon confirmation of order, 40% before site delivery, 10% upon installation completion.',
    'All custom cabinetry dimensions subject to final on-site measurements and technical confirmation.',
    'Quotations remain valid for 30 calendar days from the issue date.',
    'Electrical appliances, plumbing fittings and third-party sanitaryware installation excluded unless specified.',
    'MOCOF provides a 2-year warranty on custom cabinet structures and 5-year hardware warranty.'
  ],
  outputWorksheetNames: [
    'Whole-House Details',
    '23 quotation details',
    '25 Kitchen Cabinet Details',
    '25 Custom Door Details',
    'Kitchen and Vanity Details',
    'LF Details'
  ],
  bossEditingRules: BOSS_EDITING_RULES,
  areaPromptRules: DEFAULT_AREA_PROMPT_RULES,
  rules: [
    { id: 'rule-1', chineseTerm: '橱柜', englishTranslation: 'Kitchen Cabinet', category: 'cabinet', roomNameDefault: 'Kitchen', hideByDefault: false },
    { id: 'rule-2', chineseTerm: '吊柜', englishTranslation: 'Wall Cabinet', category: 'cabinet', roomNameDefault: 'Kitchen', hideByDefault: false },
    { id: 'rule-3', chineseTerm: '地柜', englishTranslation: 'Base Cabinet', category: 'cabinet', roomNameDefault: 'Kitchen', hideByDefault: false },
    { id: 'rule-4', chineseTerm: '隐形门', englishTranslation: 'Flush Stealth Door', category: 'custom_door', roomNameDefault: 'Master Bedroom', hideByDefault: false },
    { id: 'rule-5', chineseTerm: '石英石台面', englishTranslation: 'Quartz Stone Countertop', category: 'kitchen_vanity', roomNameDefault: 'Kitchen', hideByDefault: false },
    { id: 'rule-6', chineseTerm: '百隆缓冲铰链', englishTranslation: 'Blum Soft-Close Hinge', category: 'hardware', hideByDefault: true },
    { id: 'rule-7', chineseTerm: '快装墙板', englishTranslation: 'Quick-Install Wall Panel', category: 'wall_panel', roomNameDefault: 'Living Room', hideByDefault: false },
    { id: 'rule-8', chineseTerm: '浴室柜', englishTranslation: 'Vanity Cabinet', category: 'kitchen_vanity', roomNameDefault: 'Master Bathroom', hideByDefault: false },
    { id: 'rule-9', chineseTerm: '衣柜', englishTranslation: 'Full-Height Wardrobe', category: 'cabinet', roomNameDefault: 'Master Bedroom', hideByDefault: false },
    { id: 'rule-10', chineseTerm: '鞋柜', englishTranslation: 'Foyer Shoe Cabinet', category: 'cabinet', roomNameDefault: 'Foyer', hideByDefault: false },
    { id: 'rule-11', chineseTerm: '电视柜', englishTranslation: 'Media Console Unit', category: 'cabinet', roomNameDefault: 'Living Room', hideByDefault: false },
    { id: 'rule-12', chineseTerm: '线性铝材', englishTranslation: 'Linear Aluminum Profile', category: 'lf', roomNameDefault: 'Living Room', hideByDefault: false },
  ],
};

// Seed Product Sample Images
export const SAMPLE_PRODUCT_IMAGES = {
  kitchen: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80',
  wardrobe: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=400&q=80',
  stealthDoor: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
  vanity: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
  wallPanel: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=400&q=80',
  linearLighting: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80',
  shoeCabinet: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80',
};

export const SEED_PROJECTS: Project[] = [
  {
    id: 'proj-101',
    name: 'Seremban Villa Whole-House Custom Joinery',
    customerName: 'Dato’ Kenneth Tan',
    customerPhone: '+60 12-388 9102',
    customerEmail: 'kenneth.tan@villa-seremban.my',
    projectAddress: 'No. 88, Jalan Rasah Heights 3, 70300 Seremban, Negeri Sembilan',
    quotationNumber: 'MOC-2026-SRB-088',
    status: 'Generated – Exceptions Need Review',
    currency: 'MYR',
    createdAt: '2026-07-20T09:30:00Z',
    updatedAt: '2026-07-24T04:15:00Z',
    currentQuoteId: 'quote-101',
    totalMYRCents: 14850000, // MYR 148,500.00
  },
  {
    id: 'proj-102',
    name: 'Bukit Jalil Sky Luxury Residence Cabinetry',
    customerName: 'Ms. Chloe Wong',
    customerPhone: '+60 16-892 1100',
    customerEmail: 'chloe.wong@gmail.com',
    projectAddress: 'Unit B-22-03, Park Sky Residence, Bukit Jalil, 57000 Kuala Lumpur',
    quotationNumber: 'MOC-2026-BJ-2203',
    status: 'Approved',
    currency: 'MYR',
    createdAt: '2026-07-18T14:20:00Z',
    updatedAt: '2026-07-23T11:00:00Z',
    currentQuoteId: 'quote-102',
    totalMYRCents: 9820000, // MYR 98,200.00
  },
  {
    id: 'proj-103',
    name: 'Mont Kiara Triplex Penthouse Interior Joinery',
    customerName: 'Mr. David Miller',
    customerPhone: '+60 11-2090 4455',
    customerEmail: 'david.m@miller-holdings.com',
    projectAddress: 'Penthouse A, 10 Mont Kiara, Jalan Kiara 1, 50480 Kuala Lumpur',
    quotationNumber: 'MOC-2026-MK-001',
    status: 'Generated – Ready for Approval',
    currency: 'MYR',
    createdAt: '2026-07-22T08:10:00Z',
    updatedAt: '2026-07-24T02:00:00Z',
    currentQuoteId: 'quote-103',
    totalMYRCents: 21500000, // MYR 215,000.00
  },
];

export const SEED_QUOTES: Record<string, Quote> = {
  'quote-101': {
    id: 'quote-101',
    projectId: 'proj-101',
    versionNumber: 1,
    versionLabel: 'v1.0-AI-Generated',
    status: 'Generated – Exceptions Need Review',
    currency: 'MYR',
    exchangeRate: {
      sourceCurrency: 'CNY',
      targetCurrency: 'MYR',
      rate: 0.652,
      fetchedAt: '2026-07-24T05:00:00Z',
      isLocked: false,
    },
    termsAndConditions: DEFAULT_CONVERSION_PROFILE.termsAndConditions,
    createdBy: 'AI Extractor Engine',
    createdAt: '2026-07-24T04:00:00Z',
    updatedAt: '2026-07-24T04:15:00Z',
    supplementaryItems: [
      {
        id: 'supp-1',
        description: 'Site protection, floor covering & debris disposal service',
        quantity: 1,
        unitPriceCents: 250000, // MYR 2,500.00
        totalAmountCents: 250000,
        notes: 'Complimentary site setup fee waived by manager.',
      },
      {
        id: 'supp-2',
        description: 'Integrated warm-white 3000K LED strip lighting & sensors',
        quantity: 12,
        unitPriceCents: 15000, // MYR 150.00 / meter
        totalAmountCents: 180000, // MYR 1,800.00
      },
    ],
    wholeHouseTotals: {
      cabinetProductsCents: 8250000,
      lfProductsCents: 1450000,
      customDoorProductsCents: 2300000,
      wallPanelProductsCents: 1600000,
      kitchenVanityProductsCents: 1250000,
      supplementaryItemsCents: 430000,
      subtotalCents: 15280000,
      discountCents: 764000, // 5% discount
      taxPercent: 6.0,
      taxCents: 870960,
      grandTotalCents: 15386960,
      sourceReconciliationTotalCNYCents: 16800000, // 168,000 CNY supplier source
      sourceReconciliationConvertedMYRCents: 14787000,
      reconciliationDifferenceCents: 599960,
      reconciled: true,
    },
    worksheets: [
      {
        worksheetIndex: 1,
        code: 'whole_house',
        name: 'Whole-House Details',
        rooms: [
          {
            id: 'rm-kitchen',
            roomNameEnglish: 'Kitchen Area',
            roomNameChinese: '厨房区域',
            subtotals: { roomName: 'Kitchen Area', itemCount: 3, subtotalCents: 4850000 },
            sections: [
              {
                id: 'sec-k1',
                sectionName: 'Dry & Wet Kitchen Cabinets',
                category: 'cabinet',
                sectionTotalCents: 4850000,
                items: [
                  {
                    id: 'item-101',
                    sourceRowIndex: 4,
                    sourceSheetName: '全屋主表',
                    itemCode: 'MC-KIT-01',
                    nameChinese: '现代极简PET门板地柜+吊柜',
                    nameEnglish: 'Modern Minimalist PET Finish Base & Wall Kitchen Cabinet',
                    category: 'cabinet',
                    roomName: 'Kitchen Area',
                    widthMm: 3600,
                    depthMm: 600,
                    heightMm: 2400,
                    dimensionText: 'W3600 x D600 x H2400 mm',
                    quantity: 1,
                    unit: 'Set',
                    supplierPriceCents: 2800000, // 28,000 CNY
                    markupPercent: 35,
                    unitPriceCents: 2465000, // MYR 24,650.00
                    totalAmountCents: 2465000,
                    discountCents: 0,
                    finalAmountCents: 2465000,
                    imageUrl: SAMPLE_PRODUCT_IMAGES.kitchen,
                    isVisibleToCustomer: true,
                    notes: 'E0 grade moisture-resistant board with Blum soft-close hinges',
                    isExceptionFlagged: false,
                    exceptionReasons: [],
                  },
                  {
                    id: 'item-102',
                    sourceRowIndex: 5,
                    sourceSheetName: '全屋主表',
                    itemCode: 'MC-KIT-02',
                    nameChinese: '无缝岩板/石英石厨台面',
                    nameEnglish: 'Premium Seamless Quartz Stone Countertop with Water-Drip Edge',
                    category: 'kitchen_vanity',
                    roomName: 'Kitchen Area',
                    widthMm: 3600,
                    depthMm: 600,
                    heightMm: 50,
                    dimensionText: 'W3600 x D600 x H50 mm',
                    quantity: 1,
                    unit: 'Lot',
                    supplierPriceCents: 1200000, // 12,000 CNY
                    markupPercent: 35,
                    unitPriceCents: 1056000,
                    totalAmountCents: 1056000,
                    discountCents: 0,
                    finalAmountCents: 1056000,
                    imageUrl: SAMPLE_PRODUCT_IMAGES.kitchen,
                    isVisibleToCustomer: true,
                    notes: 'Stain resistant 20mm thick solid quartz stone',
                    isExceptionFlagged: false,
                    exceptionReasons: [],
                  },
                  {
                    id: 'item-103',
                    sourceRowIndex: 6,
                    sourceSheetName: '全屋主表',
                    itemCode: 'MC-KIT-03',
                    nameChinese: '中岛台配隐藏式升降插座柜',
                    nameEnglish: 'Island Counter with Integrated Motorized Pop-Up Socket Unit',
                    category: 'cabinet',
                    roomName: 'Kitchen Area',
                    widthMm: 2200,
                    depthMm: 900,
                    heightMm: 880,
                    dimensionText: 'W2200 x D900 x H880 mm',
                    quantity: 1,
                    unit: 'Set',
                    supplierPriceCents: 1500000,
                    markupPercent: 35,
                    unitPriceCents: 1329000,
                    totalAmountCents: 1329000,
                    discountCents: 0,
                    finalAmountCents: 1329000,
                    imageUrl: SAMPLE_PRODUCT_IMAGES.kitchen,
                    isVisibleToCustomer: true,
                    notes: 'Matching quartz waterfall edge sides included',
                    isExceptionFlagged: false,
                    exceptionReasons: [],
                  },
                ],
              },
            ],
          },
          {
            id: 'rm-masterbed',
            roomNameEnglish: 'Master Bedroom Suite',
            roomNameChinese: '主卧套房',
            subtotals: { roomName: 'Master Bedroom Suite', itemCount: 3, subtotalCents: 6300000 },
            sections: [
              {
                id: 'sec-mb1',
                sectionName: 'Master Wardrobe & Stealth Doors',
                category: 'cabinet',
                sectionTotalCents: 6300000,
                items: [
                  {
                    id: 'item-104',
                    sourceRowIndex: 12,
                    sourceSheetName: '全屋主表',
                    itemCode: 'MC-WAD-01',
                    nameChinese: '主卧一字型玻璃加木门步入式衣柜',
                    nameEnglish: 'Master Walk-In Wardrobe with Tinted Glass & Wood Accent Doors',
                    category: 'cabinet',
                    roomName: 'Master Bedroom Suite',
                    widthMm: 4200,
                    depthMm: 600,
                    heightMm: 2700,
                    dimensionText: 'W4200 x D600 x H2700 mm',
                    quantity: 1,
                    unit: 'Set',
                    supplierPriceCents: 3800000,
                    markupPercent: 35,
                    unitPriceCents: 3345000,
                    totalAmountCents: 3345000,
                    discountCents: 0,
                    finalAmountCents: 3345000,
                    imageUrl: SAMPLE_PRODUCT_IMAGES.wardrobe,
                    isVisibleToCustomer: true,
                    notes: 'Includes sensor drawer lighting & trousers pull-out rack',
                    isExceptionFlagged: false,
                    exceptionReasons: [],
                  },
                  {
                    id: 'item-105',
                    sourceRowIndex: 13,
                    sourceSheetName: '全屋主表',
                    itemCode: 'MC-DOR-01',
                    nameChinese: '主卧隐形同质涂装门 (带磁吸静音锁)',
                    nameEnglish: 'Flush Stealth Concealed Passage Door with Magnetic Silent Lock',
                    category: 'custom_door',
                    roomName: 'Master Bedroom Suite',
                    widthMm: 900,
                    depthMm: 50,
                    heightMm: 2400,
                    dimensionText: 'W900 x D50 x H2400 mm',
                    quantity: 2,
                    unit: 'Pcs',
                    supplierPriceCents: 1300000,
                    markupPercent: 35,
                    unitPriceCents: 1145000,
                    totalAmountCents: 2290000,
                    discountCents: 0,
                    finalAmountCents: 2290000,
                    imageUrl: SAMPLE_PRODUCT_IMAGES.stealthDoor,
                    isVisibleToCustomer: true,
                    notes: 'Blends seamlessly into timber wall paneling',
                    isExceptionFlagged: true,
                    exceptionReasons: ['NEW_PRODUCT_CODE: Unrecognized magnetic lock model MC-MAG-X9'],
                  },
                  {
                    id: 'item-106',
                    sourceRowIndex: 14,
                    sourceSheetName: '全屋主表',
                    itemCode: 'MC-PAN-01',
                    nameChinese: '格栅背景墙快装墙板',
                    nameEnglish: 'Acoustic Fluted Timber Quick-Install Wall Paneling',
                    category: 'wall_panel',
                    roomName: 'Master Bedroom Suite',
                    widthMm: 3200,
                    depthMm: 25,
                    heightMm: 2700,
                    dimensionText: 'W3200 x D25 x H2700 mm',
                    quantity: 1,
                    unit: 'Lot',
                    supplierPriceCents: 750000,
                    markupPercent: 35,
                    unitPriceCents: 665000,
                    totalAmountCents: 665000,
                    discountCents: 0,
                    finalAmountCents: 665000,
                    imageUrl: SAMPLE_PRODUCT_IMAGES.wallPanel,
                    isVisibleToCustomer: true,
                    notes: 'Eco-friendly veneer finish',
                    isExceptionFlagged: false,
                    exceptionReasons: [],
                  },
                ],
              },
            ],
          },
        ],
        totalCents: 11150000,
      },
      {
        worksheetIndex: 2,
        code: 'details_23',
        name: '23 quotation details',
        rooms: [],
        totalCents: 8250000,
      },
      {
        worksheetIndex: 3,
        code: 'kitchen_25',
        name: '25 Kitchen Cabinet Details',
        rooms: [],
        totalCents: 3521000,
      },
      {
        worksheetIndex: 4,
        code: 'custom_door_25',
        name: '25 Custom Door Details',
        rooms: [],
        totalCents: 2290000,
      },
      {
        worksheetIndex: 5,
        code: 'kitchen_vanity',
        name: 'Kitchen and Vanity Details',
        rooms: [],
        totalCents: 1056000,
      },
      {
        worksheetIndex: 6,
        code: 'lf_details',
        name: 'LF Details',
        rooms: [],
        totalCents: 1450000,
      },
    ],
  },
  'quote-102': {
    id: 'quote-102',
    projectId: 'proj-102',
    versionNumber: 2,
    versionLabel: 'v2.0-Approved-Final',
    status: 'Approved',
    currency: 'MYR',
    exchangeRate: {
      sourceCurrency: 'CNY',
      targetCurrency: 'MYR',
      rate: 0.650,
      fetchedAt: '2026-07-23T10:00:00Z',
      lockedAt: '2026-07-23T11:00:00Z',
      lockedBy: 'Manager Tan (MOCOF HQ)',
      isLocked: true,
    },
    termsAndConditions: DEFAULT_CONVERSION_PROFILE.termsAndConditions,
    createdBy: 'Manager Tan',
    createdAt: '2026-07-18T15:00:00Z',
    updatedAt: '2026-07-23T11:00:00Z',
    supplementaryItems: [
      {
        id: 'supp-102',
        description: 'Delivery and crane lifting handling for heavy quartz countertop',
        quantity: 1,
        unitPriceCents: 120000, // MYR 1,200.00
        totalAmountCents: 120000,
      },
    ],
    wholeHouseTotals: {
      cabinetProductsCents: 5800000,
      lfProductsCents: 950000,
      customDoorProductsCents: 1800000,
      wallPanelProductsCents: 800000,
      kitchenVanityProductsCents: 900000,
      supplementaryItemsCents: 120000,
      subtotalCents: 10370000,
      discountCents: 518500,
      taxPercent: 6.0,
      taxCents: 591090,
      grandTotalCents: 10442590,
      sourceReconciliationTotalCNYCents: 11500000,
      sourceReconciliationConvertedMYRCents: 10091250,
      reconciliationDifferenceCents: 351340,
      reconciled: true,
    },
    worksheets: [],
  },
  'quote-103': {
    id: 'quote-103',
    projectId: 'proj-103',
    versionNumber: 1,
    versionLabel: 'v1.0-Ready-For-Review',
    status: 'Generated – Ready for Approval',
    currency: 'MYR',
    exchangeRate: {
      sourceCurrency: 'CNY',
      targetCurrency: 'MYR',
      rate: 0.652,
      fetchedAt: '2026-07-24T01:00:00Z',
      isLocked: false,
    },
    termsAndConditions: DEFAULT_CONVERSION_PROFILE.termsAndConditions,
    createdBy: 'AI Extractor Engine',
    createdAt: '2026-07-22T08:15:00Z',
    updatedAt: '2026-07-24T02:00:00Z',
    supplementaryItems: [],
    wholeHouseTotals: {
      cabinetProductsCents: 12500000,
      lfProductsCents: 2100000,
      customDoorProductsCents: 3400000,
      wallPanelProductsCents: 2200000,
      kitchenVanityProductsCents: 1800000,
      supplementaryItemsCents: 0,
      subtotalCents: 22000000,
      discountCents: 1100000,
      taxPercent: 6.0,
      taxCents: 1254000,
      grandTotalCents: 22154000,
      sourceReconciliationTotalCNYCents: 24200000,
      sourceReconciliationConvertedMYRCents: 21300000,
      reconciliationDifferenceCents: 854000,
      reconciled: true,
    },
    worksheets: [],
  },
};

export const SEED_EXCEPTIONS: ExceptionItem[] = [
  {
    id: 'exc-101',
    quoteId: 'quote-101',
    sourceRow: 13,
    sourceSheet: '全屋主表',
    productCode: 'MC-MAG-X9',
    chineseText: '主卧隐形同质涂装门 (带磁吸静音锁)',
    reasonCode: 'NEW_PRODUCT_CODE',
    description: 'New supplier hardware lock SKU "MC-MAG-X9" not found in approved catalog.',
    severity: 'warning',
    resolved: false,
    suggestedFix: {
      englishName: 'Flush Stealth Concealed Passage Door with Silent Magnetic Lock',
      category: 'custom_door',
      roomName: 'Master Bedroom Suite',
      unitPriceCents: 1145000,
    },
  },
  {
    id: 'exc-102',
    quoteId: 'quote-101',
    sourceRow: 22,
    sourceSheet: '25 Kitchen Cabinet Details',
    productCode: 'MC-HW-BLUM-3D',
    chineseText: '百隆特种三维调节隐形抽轨',
    reasonCode: 'NO_MATCHING_PRICE_RULE',
    description: 'Hardware item "Blum 3D Undermount Drawer Runner" marked for hiding but needs supplier cost check.',
    severity: 'warning',
    resolved: false,
    suggestedFix: {
      englishName: 'Blum 3D Undermount Drawer Runner',
      category: 'hardware',
    },
  },
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-001',
    projectId: 'proj-101',
    quoteId: 'quote-101',
    action: 'CONVERSION_EXECUTED',
    performedBy: 'MOCOF AI Converter Engine',
    timestamp: '2026-07-24T04:00:00Z',
    details: 'Converted Chinese XLSX file "Seremban_Villa_Supplier_CN_Quote.xlsx". Extracted 32 rows, 6 worksheets, and 8 product photos.',
  },
  {
    id: 'audit-002',
    projectId: 'proj-101',
    quoteId: 'quote-101',
    action: 'EXCEPTION_FLAGGED',
    performedBy: 'Rule Enforcement Validator',
    timestamp: '2026-07-24T04:01:00Z',
    details: 'Flagged 2 exceptions for manager review (New Product Code MC-MAG-X9 and Price Rule Check).',
  },
];
