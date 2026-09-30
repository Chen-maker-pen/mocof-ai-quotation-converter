import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateWorkbookCell, evaluateWorkbookValue } from '../src/lib/formulaEvaluator.js';
import type { CustomerWorkbookSheet } from '../src/types.js';
const sheet = (entries: Record<string, string | number>): CustomerWorkbookSheet => ({
  id: 'test', name: 'test', rowCount: 10, columnCount: 10,
  cells: Object.fromEntries(Object.entries(entries).map(([address, input]) => [address, {
    address, row: Number(address.match(/\d+$/)![0]), column: address.charCodeAt(0) - 64,
    value: typeof input === 'string' && input.startsWith('=') ? '' : input,
    ...(typeof input === 'string' && input.startsWith('=') ? { formula: input } : {}),
  }])),
});
test('scientific discount factors are numbers, and dependencies keep precision', () => {
  const s = sheet({ A1: 100, A2: '8E-01', A3: '=A1*$A$2', B1: '=8E-01*100', B2: '=1/3', B3: '=B2*3' });
  assert.equal(evaluateWorkbookCell(s, 'A3'), 80);
  assert.equal(evaluateWorkbookCell(s, 'B1'), 80);
  assert.equal(evaluateWorkbookCell(s, 'B3'), 1);
});
test('unsupported, cyclic and broken dependencies do not silently become zero', () => {
  const s = sheet({ A1: '=A2', A2: '=A1', B1: '=UNKNOWN(1)', B2: '=B1+10', C1: '=SUM(A1:A2)' });
  for (const address of ['A1', 'B1', 'B2', 'C1']) assert.equal(evaluateWorkbookCell(s, address), undefined);
});
test('SUM ignores referenced text while preserving errors and rejecting currency text in arithmetic', () => {
  const s = sheet({ A1: 10, A2: '100', A3: 'RM200', B1: '=SUM(A1:A3)', B2: '=A3+1', C1: '#DIV/0!', C2: '=SUM(C1:C1)' });
  assert.equal(evaluateWorkbookCell(s, 'B1'), 10);
  assert.equal(evaluateWorkbookCell(s, 'B2'), undefined);
  assert.equal(evaluateWorkbookCell(s, 'C2'), undefined);
});
test('quotation guards preserve blank text results and do not evaluate an unselected IF branch', () => {
  const s = sheet({ A1: 100, A2: 'Software Price', B1: '=IF(ISNUMBER(A1),A1*6.88,"")', B2: '=IF(ISNUMBER(A2),A2*6.88,"")', C1: '=IF(A1>0,5,1/0)', C2: '=MIN(A1,B1,C1)', C3: '=IF(ISBLANK(D1),"Missing",D1)' });
  assert.equal(evaluateWorkbookValue(s,'B1'),688);
  assert.equal(evaluateWorkbookValue(s,'B2'),'');
  assert.equal(evaluateWorkbookValue(s,'C1'),5);
  assert.equal(evaluateWorkbookValue(s,'C2'),5);
  assert.equal(evaluateWorkbookValue(s,'C3'),'Missing');
});
test('cross-sheet references and cycles are handled without trusting cached values', () => {
  const a=sheet({ A1: "='Other sheet'!A1*2" }), b={...sheet({A1:7}),name:'Other sheet'};
  assert.equal(evaluateWorkbookValue(a,'A1',[a,b]),14);
  b.cells.A1.formula='test!A1';
  assert.equal(evaluateWorkbookValue(a,'A1',[a,b]),undefined);
});
test('heading comparisons distinguish numbers from text without coercion failures',()=>{
  const s=sheet({A1:100,A2:'Before Price',B1:'=IF(A1="Before Price","After Price",A1*0.9)',B2:'=IF(A2="before price","After Price",A2*0.9)',B3:'=IF(C1="",7,1/0)'});
  assert.equal(evaluateWorkbookValue(s,'B1'),90);
  assert.equal(evaluateWorkbookValue(s,'B2'),'After Price');
  assert.equal(evaluateWorkbookValue(s,'B3'),7);
});
