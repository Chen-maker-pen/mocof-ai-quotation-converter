/**
 * Anonymised MOCOF reference conversions derived from approved historical
 * quotations. They provide layout and calculation guidance for the matching
 * Area only; the uploaded supplier workbook remains the source of truth.
 */

export interface ReferenceConversionRecipe {
  areaNumber: number;
  sourceLayout: string;
  outputLayout: string[];
  pricingRules: string[];
  validationRules: string[];
}

export const REFERENCE_CONVERSION_RECIPES: ReferenceConversionRecipe[] = [
  {
    areaNumber: 3,
    sourceLayout: 'Three real rooms: Master Bedroom, Living and Dining, Vanity. Extra m² and all service/add-on rows are not rooms.',
    outputLayout: [
      'Place Whole House Total first, Supplementary second, then Master Bedroom, Living and Dining, and Vanity in that source order.',
      'Keep source product photos and product groups under their source Combi number. Do not repeat a merged group price on every component row.',
      'Show Cabinet Table, Accessories Table and Wall Panel Table only where they exist in the uploaded source.',
      'Use English customer-facing labels and retain Chinese after // when the approved layout is bilingual.',
      'A Vanity must show its Cabinet Table and Cabinet Total Price before the room Total Price.',
    ],
    pricingRules: [
      'Do not apply one global discount to every product. Preserve approved source group totals and package calculations before calculating customer prices.',
      'Services remain Whole House rows after real rooms and are never room subtotals.',
      'Supplementary keeps sqft/per, Qty/per, RM49800, RM79800, Software Price, Before Price and After Price as separate columns. Zero-priced services remain visible.',
      'When the source contains a Vanity, Bathroom Shower Screen is a selectable supplementary service instead of being silently omitted.',
    ],
    validationRules: [
      'Use this reference only when detected Area equals exactly 3.',
      'Whole House Total plus Total Supplementary must reconcile to the grand total in every price column.',
      'Never replace an unknown Chinese product name with a made-up English name.',
    ],
  },
  {
    areaNumber: 7,
    sourceLayout: 'Seven real rooms: Foyer/Porch, Master Bedroom, Living and Dining, Guest Bedroom 1, Kitchen, Guest Bedroom 2 and Guest Bedroom 3.',
    outputLayout: [
      'Preserve the seven source room rows in their original order. Repeated Guest Bedroom rows must remain separate rooms.',
      'Whole House Total and Supplementary are mandatory before detailed room tables.',
      'Retain only applicable detail tables and original product photos. Never create demo or empty tables.',
      'Translate supplier room terms for customers: Porch becomes Foyer; Guest restaurant becomes Living and Dining.',
    ],
    pricingRules: [
      'The approved Area 7 reference uses source room totals as Before Price and After Price = Before Price × 80% for room lines. This is an Area 7 pattern only, never a universal discount.',
      'Keep Extra m², Curve, Wall Panel, Aluminium Frame and Add-on Finishing after the seven real room rows.',
      'Never double-count values repeated by merged cells in the supplier workbook.',
    ],
    validationRules: [
      'Use this reference only when detected Area equals exactly 7.',
      'Verify that all seven rooms survive parsing, including each Guest Bedroom occurrence.',
      'Flag a price mismatch for review rather than applying Area 7 pricing to another Area.',
    ],
  },
];

export function getReferenceConversionRecipe(areaNumber?: number) {
  return REFERENCE_CONVERSION_RECIPES.find((recipe) => recipe.areaNumber === areaNumber);
}
