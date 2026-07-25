/**
 * MOCOF Deterministic Calculation Engine
 * ALL calculations use integer minor currency units (cents/sen)
 * Gemini AI NEVER calculates or invents prices, totals, or taxes.
 */

import {
  QuoteItem,
  SupplementaryItem,
  WholeHouseTotals,
  QuoteWorksheet,
  QuoteRoom,
  QuoteSection,
  ExchangeRateSnapshot,
  ConversionProfile,
  ReconciliationReport,
} from '../src/types.js';

/**
 * Converts supplier price in CNY to target currency unit price cents based on exchange rate & markup.
 */
export function calculateItemPricing(
  supplierPriceCNY: number, // e.g. 1500.00 CNY
  exchangeRate: number,     // e.g. 0.65 CNY -> MYR
  markupPercent: number,    // e.g. 35 -> 1.35x
  quantity: number,
  discountCents: number = 0
): {
  supplierPriceCents: number;
  unitPriceCents: number;
  totalAmountCents: number;
  discountCents: number;
  finalAmountCents: number;
} {
  // Supplier price in integer CNY cents
  const supplierPriceCents = Math.round(supplierPriceCNY * 100);

  // Convert to MYR/target currency unit price cents
  // Supplier CNY * exchangeRate = MYR base -> multiplied by markup (1 + markup/100)
  const convertedUnitMYR = supplierPriceCNY * exchangeRate * (1 + markupPercent / 100);
  const unitPriceCents = Math.max(0, Math.round(convertedUnitMYR * 100));

  const safeQty = Math.max(1, Math.round(quantity));
  const totalAmountCents = unitPriceCents * safeQty;
  const safeDiscountCents = Math.min(totalAmountCents, Math.max(0, Math.round(discountCents)));
  const finalAmountCents = totalAmountCents - safeDiscountCents;

  return {
    supplierPriceCents,
    unitPriceCents,
    totalAmountCents,
    discountCents: safeDiscountCents,
    finalAmountCents,
  };
}

/**
 * Recalculate an entire QuoteWorksheet's items, section totals, room subtotals, and worksheet total
 */
export function recalculateWorksheet(
  worksheet: QuoteWorksheet,
  exchangeRate: number,
  profile: ConversionProfile
): QuoteWorksheet {
  let worksheetTotalCents = 0;

  const updatedRooms: QuoteRoom[] = worksheet.rooms.map((room) => {
    let roomTotalCents = 0;
    let roomItemCount = 0;

    const updatedSections: QuoteSection[] = room.sections.map((section) => {
      let sectionTotalCents = 0;

      const updatedItems: QuoteItem[] = section.items.map((item) => {
        // Calculate item pricing deterministically
        const supplierCNY = item.supplierPriceCents / 100;
        const pricing = calculateItemPricing(
          supplierCNY,
          exchangeRate,
          item.markupPercent || profile.defaultMarkupPercent,
          item.quantity,
          item.discountCents
        );

        const updatedItem: QuoteItem = {
          ...item,
          unitPriceCents: pricing.unitPriceCents,
          totalAmountCents: pricing.totalAmountCents,
          discountCents: pricing.discountCents,
          finalAmountCents: pricing.finalAmountCents,
        };

        if (updatedItem.isVisibleToCustomer) {
          sectionTotalCents += updatedItem.finalAmountCents;
          roomItemCount += 1;
        }

        return updatedItem;
      });

      return {
        ...section,
        items: updatedItems,
        sectionTotalCents,
      };
    });

    roomTotalCents = updatedSections.reduce((sum, sec) => sum + sec.sectionTotalCents, 0);

    return {
      ...room,
      sections: updatedSections,
      subtotals: {
        roomName: room.roomNameEnglish,
        itemCount: roomItemCount,
        subtotalCents: roomTotalCents,
      },
    };
  });

  worksheetTotalCents = updatedRooms.reduce(
    (sum, rm) => sum + rm.subtotals.subtotalCents,
    0
  );

  return {
    ...worksheet,
    rooms: updatedRooms,
    totalCents: worksheetTotalCents,
  };
}

/**
 * Calculates Whole House Totals across all 6 worksheets and supplementary items.
 */
export function calculateWholeHouseTotals(
  worksheets: QuoteWorksheet[],
  supplementaryItems: SupplementaryItem[],
  profile: ConversionProfile,
  supplierTotalCNY: number,
  exchangeRate: number
): WholeHouseTotals {
  let cabinetProductsCents = 0;
  let lfProductsCents = 0;
  let customDoorProductsCents = 0;
  let wallPanelProductsCents = 0;
  let kitchenVanityProductsCents = 0;

  worksheets.forEach((ws) => {
    ws.rooms.forEach((room) => {
      room.sections.forEach((sec) => {
        sec.items.forEach((item) => {
          if (!item.isVisibleToCustomer) return;
          const amt = item.finalAmountCents;

          switch (item.category) {
            case 'cabinet':
              cabinetProductsCents += amt;
              break;
            case 'lf':
              lfProductsCents += amt;
              break;
            case 'custom_door':
              customDoorProductsCents += amt;
              break;
            case 'wall_panel':
              wallPanelProductsCents += amt;
              break;
            case 'kitchen_vanity':
              kitchenVanityProductsCents += amt;
              break;
            default:
              cabinetProductsCents += amt;
              break;
          }
        });
      });
    });
  });

  // Calculate supplementary total
  const supplementaryItemsCents = supplementaryItems.reduce((sum, item) => {
    const total = item.quantity * item.unitPriceCents;
    item.totalAmountCents = total;
    return sum + total;
  }, 0);

  const subtotalCents =
    cabinetProductsCents +
    lfProductsCents +
    customDoorProductsCents +
    wallPanelProductsCents +
    kitchenVanityProductsCents +
    supplementaryItemsCents;

  const defaultDiscountPercent = profile.defaultDiscountPercent || 0;
  const discountCents = Math.round(subtotalCents * (defaultDiscountPercent / 100));

  const taxableAmountCents = Math.max(0, subtotalCents - discountCents);
  const taxRate = profile.taxRatePercent || 0;
  const taxCents = Math.round(taxableAmountCents * (taxRate / 100));

  const grandTotalCents = taxableAmountCents + taxCents;

  // Reconciliation check
  const supplierSourceTotalCNYCents = Math.round(supplierTotalCNY * 100);
  const sourceConvertedMYRCents = Math.round(supplierTotalCNY * exchangeRate * (1 + profile.defaultMarkupPercent / 100) * 100);
  const diffCents = Math.abs(grandTotalCents - sourceConvertedMYRCents);

  // Consider reconciled if within 5% or 50 MYR
  const isReconciled = diffCents <= 5000 || diffCents / (sourceConvertedMYRCents || 1) < 0.05;

  return {
    cabinetProductsCents,
    lfProductsCents,
    customDoorProductsCents,
    wallPanelProductsCents,
    kitchenVanityProductsCents,
    supplementaryItemsCents,
    subtotalCents,
    discountCents,
    taxPercent: taxRate,
    taxCents,
    grandTotalCents,
    sourceReconciliationTotalCNYCents: supplierSourceTotalCNYCents,
    sourceReconciliationConvertedMYRCents: sourceConvertedMYRCents,
    reconciliationDifferenceCents: diffCents,
    reconciled: isReconciled,
  };
}

/**
 * Generate full Reconciliation Report
 */
export function generateReconciliationReport(
  supplierTotalCNY: number,
  exchangeRateSnapshot: ExchangeRateSnapshot,
  wholeHouseTotals: WholeHouseTotals,
  totalItems: number,
  mappedItems: number,
  exceptionCount: number
): ReconciliationReport {
  const rate = exchangeRateSnapshot.rate || 0.65;
  const expectedConvertedMYR = (supplierTotalCNY * rate * 1.35);
  const generatedItemsSumMYR = wholeHouseTotals.grandTotalCents / 100;
  const differenceMYR = Math.abs(generatedItemsSumMYR - expectedConvertedMYR);

  return {
    supplierSourceTotalCNY: supplierTotalCNY,
    exchangeRateUsed: rate,
    expectedConvertedMYR: Math.round(expectedConvertedMYR * 100) / 100,
    generatedItemsSumMYR: Math.round(generatedItemsSumMYR * 100) / 100,
    differenceMYR: Math.round(differenceMYR * 100) / 100,
    isReconciled: wholeHouseTotals.reconciled,
    itemCountTotal: totalItems,
    itemCountMapped: mappedItems,
    exceptionCount,
  };
}
