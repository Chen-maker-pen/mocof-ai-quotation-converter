export interface PricingFactors { payableFactor?: number; supplementaryFactor?: number }
export function validatePricingFactors(input: PricingFactors): PricingFactors {
 const result: PricingFactors = {};
 for (const key of ['payableFactor','supplementaryFactor'] as const) {
  const value=input[key];
  if(value===undefined)continue;
  if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>1)throw new Error(`${key} must be a number from 0 to 1.`);
  result[key]=value;
 }
 return result;
}
