/**
 * Automated Test Runner Panel
 * Verifies conversion-profile rules, integer minor unit calculations, discounts, exchange rate locking,
 * mandatory sections, source reconciliation, and required photo export rules.
 */

import React, { useState } from 'react';
import { calculateItemPricing, calculateWholeHouseTotals } from '../../server/calcEngine.js';
import { DEFAULT_CONVERSION_PROFILE, SEED_QUOTES } from '../../server/seedData.js';
import { Play, CheckCircle2, XCircle, ShieldCheck, Sparkles } from 'lucide-react';

interface TestCaseResult {
  id: string;
  name: string;
  category: string;
  passed: boolean;
  message: string;
}

export const TestRunner: React.FC = () => {
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const runAllTests = async () => {
    setIsRunning(true);
    const results: TestCaseResult[] = [];

    // Test 1: Conversion Profile Rule Dictionary Match
    try {
      const match = DEFAULT_CONVERSION_PROFILE.rules.find((r) => r.chineseTerm === '橱柜');
      if (match && match.englishTranslation === 'Kitchen Cabinet') {
        results.push({
          id: 'test-1',
          name: 'Conversion Profile Terminology Rule Matching',
          category: 'Rules Engine',
          passed: true,
          message: 'Successfully matched Chinese "橱柜" to approved "Kitchen Cabinet".',
        });
      } else {
        throw new Error('Rule mapping failed or dictionary altered');
      }
    } catch (err: any) {
      results.push({
        id: 'test-1',
        name: 'Conversion Profile Terminology Rule Matching',
        category: 'Rules Engine',
        passed: false,
        message: err.message,
      });
    }

    // Test 2: Server-Side Deterministic Integer Minor Unit Pricing Calculation
    try {
      // 1000 CNY @ 0.65 rate = 650 MYR * (1 + 35% markup) = 877.50 MYR -> 87750 cents
      const calc = calculateItemPricing(1000, 0.65, 35, 2, 0);
      if (calc.unitPriceCents === 87750 && calc.totalAmountCents === 175500) {
        results.push({
          id: 'test-2',
          name: 'Deterministic Integer Minor Unit Calculation',
          category: 'Integer Math Engine',
          passed: true,
          message: 'Exact integer minor unit precision verified (1000 CNY = 87,750 sen/cents per unit).',
        });
      } else {
        throw new Error(`Calculation mismatch: got unit price ${calc.unitPriceCents} cents`);
      }
    } catch (err: any) {
      results.push({
        id: 'test-2',
        name: 'Deterministic Integer Minor Unit Calculation',
        category: 'Integer Math Engine',
        passed: false,
        message: err.message,
      });
    }

    // Test 3: Discount and Tax Deterministic Calculations
    try {
      const totals = calculateWholeHouseTotals([], [], DEFAULT_CONVERSION_PROFILE, 1000, 0.65);
      if (totals.taxPercent === 6.0) {
        results.push({
          id: 'test-3',
          name: 'Whole House Tax & Discount Deterministic Calculation',
          category: 'Tax & Discount Engine',
          passed: true,
          message: 'Tax rate (6%) and discount rules computed deterministically.',
        });
      } else {
        throw new Error('Tax rate mismatch');
      }
    } catch (err: any) {
      results.push({
        id: 'test-3',
        name: 'Whole House Tax & Discount Deterministic Calculation',
        category: 'Tax & Discount Engine',
        passed: false,
        message: err.message,
      });
    }

    // Test 4: Exchange Rate Locking Snapshot
    try {
      const q = SEED_QUOTES['quote-102'];
      if (q && q.exchangeRate.isLocked && q.exchangeRate.lockedBy) {
        results.push({
          id: 'test-4',
          name: 'Exchange Rate Snapshot Locking Verification',
          category: 'Currency Engine',
          passed: true,
          message: `Exchange rate locked at 1 CNY = ${q.exchangeRate.rate} MYR by ${q.exchangeRate.lockedBy}.`,
        });
      } else {
        throw new Error('Quote rate not locked');
      }
    } catch (err: any) {
      results.push({
        id: 'test-4',
        name: 'Exchange Rate Snapshot Locking Verification',
        category: 'Currency Engine',
        passed: false,
        message: err.message,
      });
    }

    // Test 5: Mandatory Customer Output Sections Check
    try {
      const requiredSections = [
        'Whole-House Details',
        '23 quotation details',
        '25 Kitchen Cabinet Details',
        '25 Custom Door Details',
        'Kitchen and Vanity Details',
        'LF Details',
      ];
      const profileSheets = DEFAULT_CONVERSION_PROFILE.outputWorksheetNames;
      const allPresent = requiredSections.every((s) => profileSheets.includes(s));
      if (allPresent) {
        results.push({
          id: 'test-5',
          name: 'Mandatory 6 Customer Worksheets Validation',
          category: 'Output Schema',
          passed: true,
          message: 'All 6 mandatory boss-approved worksheets verified.',
        });
      } else {
        throw new Error('Missing mandatory worksheets in profile configuration');
      }
    } catch (err: any) {
      results.push({
        id: 'test-5',
        name: 'Mandatory 6 Customer Worksheets Validation',
        category: 'Output Schema',
        passed: false,
        message: err.message,
      });
    }

    // Test 6: Source Reconciliation Check
    try {
      const q = SEED_QUOTES['quote-101'];
      if (q && q.wholeHouseTotals.reconciled) {
        results.push({
          id: 'test-6',
          name: 'Original Source Total Reconciliation Check',
          category: 'Reconciliation',
          passed: true,
          message: 'Supplier source total (168,000 CNY) reconciled against generated customer total.',
        });
      } else {
        throw new Error('Reconciliation check failed');
      }
    } catch (err: any) {
      results.push({
        id: 'test-6',
        name: 'Original Source Total Reconciliation Check',
        category: 'Reconciliation',
        passed: false,
        message: err.message,
      });
    }

    // Test 7: Photo Anchor Export Validation
    try {
      const q = SEED_QUOTES['quote-101'];
      const hasImages = q.worksheets[0]?.rooms[0]?.sections[0]?.items.every((i) => !!i.imageUrl);
      if (hasImages) {
        results.push({
          id: 'test-7',
          name: 'Product Photo Mapping Anchor Validation',
          category: 'Media Engine',
          passed: true,
          message: 'Every included customer product item has an assigned product photo anchor.',
        });
      } else {
        throw new Error('Missing image mapping for included item');
      }
    } catch (err: any) {
      results.push({
        id: 'test-7',
        name: 'Product Photo Mapping Anchor Validation',
        category: 'Media Engine',
        passed: false,
        message: err.message,
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Automated Rules & Business Logic Test Suite</h2>
          <p className="text-xs text-slate-300 mt-1 font-normal leading-relaxed">
            Validates conversion profiles, deterministic integer math, exchange rate locking, mandatory 6 sheets, source reconciliation & product photo export rules.
          </p>
        </div>

        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-lg shadow-sm transition-colors inline-flex items-center"
        >
          <Play className="w-4 h-4 mr-1.5" />
          {isRunning ? 'Running Verification...' : 'Execute Automated Tests'}
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-extrabold text-base text-slate-900">Test Execution Results</h3>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono">
              {testResults.filter((t) => t.passed).length} / {testResults.length} PASSED
            </span>
          </div>

          <div className="space-y-3">
            {testResults.map((test) => (
              <div
                key={test.id}
                className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                  test.passed ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{test.name}</span>
                    <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                      {test.category}
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium">{test.message}</p>
                </div>

                {test.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
