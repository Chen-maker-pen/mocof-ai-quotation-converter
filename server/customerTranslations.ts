/** Customer-facing English labels used before Gemini refines product wording. */
const EXACT_PRODUCT_TRANSLATIONS: Record<string, string> = {
  '单列超高-无层板-18背板': 'Single Extra-Tall Cabinet (No Shelves, 18mm Back Panel)',
  'ABA见光板横-横/竖纹': 'ABA Exposed Panel - Horizontal / Vertical Grain',
  '床后背景板': 'Bedside Background Panel',
  '单列吊柜': 'Single Wall Cabinet',
  '单列矮柜-带台面': 'Single Base Cabinet with Countertop',
  'R60圆弧柱右-可选材料': 'R60 Right Curved Column - Material Selected at Confirmation',
  'R60圆弧柱左-可选材料': 'R60 Left Curved Column - Material Selected at Confirmation',
  '双列超高柜-上下双开门': 'Double Extra-Tall Cabinet with Upper and Lower Double Doors',
  '收口板': 'Filler Panel',
  '单张床头柜(231黑)': 'Single Bedside Table (231 Black)',
  '墙板组合': 'Wall Panel Combination',
  '冰箱柜-上对开门': 'Refrigerator Cabinet with Upper Double Doors',
  '木质洞洞板H': 'Wooden Perforated Panel H',
  '见光板': 'Exposed Panel',
  '单列超高柜': 'Single Extra-Tall Cabinet',
  '单层金属开放架07': 'Single-Layer Metal Open Shelf 07',
  '洗衣机柜-带台面': 'Washing Machine Cabinet with Countertop',
  '上假抽下翻门星盆柜': 'Sink Cabinet with Top False Drawer and Bottom Flip Door',
  '三开门高镜柜': 'Three-Door Tall Mirror Cabinet',
  '台面': 'Countertop',
  '星盆': 'Sink Basin',
  '绿芯板格栅': 'Green-Core Board Grille Panel',
  '绿芯板平板': 'Green-Core Flat Board Panel',
  '香奈儿': 'Chanel Sofa',
  '国产集成铰链': 'Local Integrated Hinge',
};

const ROOM_TRANSLATIONS: Array<[RegExp, string]> = [
  [/主卧/, 'Master Bedroom'], [/客餐厅|客餐/, 'Living and Dining'], [/卫生间|浴室/, 'Vanity'],
  [/客卧/, 'Guest Bedroom'], [/书房/, 'Study Room'], [/门厅/, 'Foyer'], [/厨房/, 'Kitchen'],
  [/多功能/, 'Multipurpose Room'], [/儿童房/, 'Kids Room'],
];

const SECTION_TRANSLATIONS: Array<[RegExp, string]> = [
  [/柜体表/, 'Cabinet Table'], [/配套品表|附件表/, 'Accessories Table'], [/快装.*表|墙板.*表/, 'Wall Panel Table'],
  [/门板表/, 'Door Panel Table'], [/功能件表/, 'Functional Hardware Table'], [/五金表/, 'Hardware Table'],
  [/线条表/, 'Countertop and Trim Table'], [/厨柜.*表/, 'Kitchen Cabinet Table'], [/增项表/, 'Additional Items Table'],
];

export function translateRoomName(value: string): string {
  return ROOM_TRANSLATIONS.find(([pattern]) => pattern.test(value))?.[1] || value;
}

export function translateSectionName(value: string): string {
  return SECTION_TRANSLATIONS.find(([pattern]) => pattern.test(value))?.[1] || value;
}

export function translateProductName(value: string, sku = ''): string {
  const trimmed = String(value || '').trim();
  if (!trimmed) return sku || 'Custom Joinery Item';
  if (EXACT_PRODUCT_TRANSLATIONS[trimmed]) return EXACT_PRODUCT_TRANSLATIONS[trimmed];
  // Code-only supplier names are already customer-readable identifiers.
  if (!/[\u3400-\u9fff]/.test(trimmed)) return trimmed;
  // Gemini replaces this conservative English fallback when an API key is set.
  return `Custom Joinery Component (${sku || 'source item'})`;
}
