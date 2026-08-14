/**
 * MOCOF AI Integrated Quotation Converter Data Types
 */

export type ProjectStatus =
  | 'Processing'
  | 'Generated – Ready for Approval'
  | 'Generated – Exceptions Need Review'
  | 'Approved'
  | 'Exported';

export type CurrencyCode = 'MYR' | 'SGD' | 'USD' | 'CNY';

export interface Project {
  id: string;
  name: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  projectAddress: string;
  quotationNumber: string;
  status: ProjectStatus;
  currency: CurrencyCode;
  createdAt: string;
  updatedAt: string;
  currentQuoteId: string;
  totalMYRCents: number;
}

export interface SourceDocument {
  id: string;
  projectId: string;
  originalFileName: string;
  fileType: 'xlsx' | 'numbers' | 'xdb' | 'pdf';
  uploadTimestamp: string;
  fileSizeBytes: number;
  sheetNames: string[];
  isImmutable: boolean;
  xdbLinked?: boolean;
  numbersConvertedToXlsx?: boolean;
}

export interface SourceImage {
  id: string;
  sourceDocumentId: string;
  sheetName: string;
  rowRef: number;
  colRef: number;
  imageId: string;
  mimeType: string;
  dataUrl: string; // Base64 or image URL
  productCodeRef?: string;
}

export interface ExchangeRateSnapshot {
  sourceCurrency: 'CNY';
  targetCurrency: CurrencyCode;
  rate: number; // e.g. 0.65 CNY -> MYR
  fetchedAt: string;
  lockedAt?: string;
  lockedBy?: string;
  isLocked: boolean;
}

export interface QuoteItem {
  id: string;
  sourceRowIndex: number;
  sourceSheetName: string;
  /** Supplier combination/group number, e.g. 1-1. A group price is shown once. */
  combi?: string;
  itemCode: string;
  nameChinese: string;
  nameEnglish: string;
  category: 'cabinet' | 'lf' | 'custom_door' | 'wall_panel' | 'kitchen_vanity' | 'supplementary' | 'hardware' | 'other';
  roomName: string;
  widthMm: number;
  depthMm: number;
  heightMm: number;
  dimensionText: string;
  quantity: number;
  unit: string;
  supplierPriceCents: number; // In CNY or original currency
  markupPercent: number;
  unitPriceCents: number; // In target currency (integer)
  totalAmountCents: number; // quantity * unitPriceCents
  discountCents: number;
  /** Optional boss prompt override, e.g. SET DISCOUNT: 10%. */
  discountPercentOverride?: number;
  finalAmountCents: number; // totalAmountCents - discountCents
  sourceImageId?: string;
  imageUrl?: string;
  isVisibleToCustomer: boolean;
  notes: string;
  isExceptionFlagged: boolean;
  exceptionReasons: string[];
}

export interface SupplementaryItem {
  id: string;
  description: string;
  /** The quotation-document "sqft / per" input; editable before export. */
  perValue?: number;
  quantity: number;
  unitPriceCents: number;
  totalAmountCents: number;
  notes?: string;
}

export interface RoomSubtotal {
  roomName: string;
  itemCount: number;
  subtotalCents: number;
}

export interface QuoteSection {
  id: string;
  sectionName: string;
  category: QuoteItem['category'];
  items: QuoteItem[];
  sectionTotalCents: number;
}

export interface QuoteRoom {
  id: string;
  roomNameEnglish: string;
  roomNameChinese: string;
  subtotals: RoomSubtotal;
  sections: QuoteSection[];
}

export interface WholeHouseTotals {
  cabinetProductsCents: number;
  lfProductsCents: number;
  customDoorProductsCents: number;
  wallPanelProductsCents: number;
  kitchenVanityProductsCents: number;
  supplementaryItemsCents: number;
  subtotalCents: number;
  discountCents: number;
  taxPercent: number; // e.g. 6.0
  taxCents: number;
  grandTotalCents: number;
  sourceReconciliationTotalCNYCents: number;
  sourceReconciliationConvertedMYRCents: number;
  reconciliationDifferenceCents: number;
  reconciled: boolean;
}

export interface QuoteWorksheet {
  worksheetIndex: number; // 1 to 6
  code: 'whole_house' | 'details_23' | 'kitchen_25' | 'custom_door_25' | 'kitchen_vanity' | 'lf_details';
  name: string;
  rooms: QuoteRoom[];
  totalCents: number;
}

/**
 * A real spreadsheet cell used by the customer workbook.  Keeping the address
 * (for example I2 or J44) is essential because the approved MOCOF prompt
 * document refers to exact cells and ranges, rather than only business fields.
 */
export interface WorkbookCell {
  address: string;
  row: number;
  column: number;
  value: string | number;
  /** Excel/Google Sheets formula, without losing the formula audit trail. */
  formula?: string;
  /** Small presentation hint for the web grid and XLSX export. */
  kind?: 'title' | 'header' | 'total' | 'formula' | 'input' | 'text';
}

/** One editable customer sheet with visible A, B, C … columns and row numbers. */
export interface CustomerWorkbookSheet {
  id: string;
  name: string;
  rowCount: number;
  columnCount: number;
  cells: Record<string, WorkbookCell>;
  mergedRanges?: string[];
}

/** A boss-entered command that is applied to a preserved conversion baseline. */
export interface BossPromptCommand {
  id: string;
  text: string;
  enabled: boolean;
  /** An auditable result of the last Apply Prompts transaction. */
  status?: 'pending' | 'applied' | 'needs_review' | 'failed';
  appliedAt?: string;
  resultSummary?: string;
}

/** The unchanged initial customer workbook used when boss prompts are re-applied. */
export interface PromptRecipeBaseline {
  worksheets: QuoteWorksheet[];
  supplementaryItems: SupplementaryItem[];
  workbookSheets?: CustomerWorkbookSheet[];
}

export interface Quote {
  id: string;
  projectId: string;
  versionNumber: number;
  versionLabel: string;
  status: ProjectStatus;
  currency: CurrencyCode;
  exchangeRate: ExchangeRateSnapshot;
  /** Number of true room/space rows detected before MOCOF service/add-on rows. */
  detectedArea?: number;
  /** Read-only audit trail of the prompt instructions applied to this upload. */
  promptTrace?: string[];
  /** Optional boss commands layered on top of the documented Area recipe. */
  bossPromptCommands?: BossPromptCommand[];
  /** Preserved initial conversion so removing a command restores the table accurately. */
  promptRecipeBaseline?: PromptRecipeBaseline;
  worksheets: QuoteWorksheet[];
  /** Spreadsheet-first customer output. This is the source of A1/J44 edits. */
  workbookSheets?: CustomerWorkbookSheet[];
  supplementaryItems: SupplementaryItem[];
  wholeHouseTotals: WholeHouseTotals;
  termsAndConditions: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface ExceptionItem {
  id: string;
  quoteId: string;
  sourceRow: number;
  sourceSheet: string;
  productCode: string;
  chineseText: string;
  reasonCode:
    | 'UNAPPROVED_TRANSLATION'
    | 'NEW_PRODUCT_CODE'
    | 'MISSING_DIMENSION_OR_PRICE'
    | 'MISSING_IMAGE_MAPPING'
    | 'RECONCILIATION_MISMATCH'
    | 'NO_MATCHING_PRICE_RULE'
    | 'LOW_AI_CONFIDENCE';
  description: string;
  severity: 'blocking' | 'warning';
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  suggestedFix?: {
    englishName?: string;
    category?: QuoteItem['category'];
    roomName?: string;
    unitPriceCents?: number;
  };
}

export interface MappingRule {
  id: string;
  chineseTerm: string;
  englishTranslation: string;
  category: QuoteItem['category'];
  roomNameDefault?: string;
  hideByDefault: boolean;
  priceMultiplierOverride?: number;
}

/**
 * A boss-approved instruction set for one quotation layout / area.
 * The instruction remains editable in the app because supplier templates can
 * have different row positions even when their business rules are identical.
 */
export interface AreaPromptRule {
  areaNumber: number;
  label: string;
  instructions: string;
}

export interface ConversionProfile {
  companyName: string;
  companyAddress: string;
  companyRegNo: string;
  companyPhone: string;
  companyEmail: string;
  logoUrl: string;
  defaultMarkupPercent: number;
  defaultDiscountPercent: number;
  taxRatePercent: number;
  hideInternalHardwareRows: boolean;
  defaultCurrency: CurrencyCode;
  roundingMode: 'NEAREST_RINGGIT' | 'EXACT_CENTS';
  termsAndConditions: string[];
  outputWorksheetNames: string[];
  rules: MappingRule[];
  /** Shared Google-Sheets editing instructions applied to every conversion. */
  bossEditingRules: string;
  /** Area-specific additions and row-position differences. */
  areaPromptRules: AreaPromptRule[];
}

export interface QuoteVersion {
  id: string;
  quoteId: string;
  versionNumber: number;
  versionLabel: string;
  createdAt: string;
  createdBy: string;
  changesSummary: string;
  quoteSnapshot: Quote;
}

export interface AuditLog {
  id: string;
  projectId: string;
  quoteId?: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
}

export interface ReconciliationReport {
  supplierSourceTotalCNY: number;
  exchangeRateUsed: number;
  expectedConvertedMYR: number;
  generatedItemsSumMYR: number;
  differenceMYR: number;
  isReconciled: boolean;
  itemCountTotal: number;
  itemCountMapped: number;
  exceptionCount: number;
}
