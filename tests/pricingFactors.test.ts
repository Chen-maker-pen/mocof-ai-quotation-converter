import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePricingFactors} from '../server/pricingFactors.js';
test('pricing factors permit zero and one, retain absent legacy defaults, and reject malformed inputs',()=>{
 assert.deepEqual(validatePricingFactors({}),{});
 assert.deepEqual(validatePricingFactors({payableFactor:0,supplementaryFactor:1}),{payableFactor:0,supplementaryFactor:1});
 for(const value of [-.1,1.01,NaN,Infinity,'0.9',null])assert.throws(()=>validatePricingFactors({payableFactor:value as number}));
});
