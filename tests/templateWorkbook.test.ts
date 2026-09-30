import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import JSZip from 'jszip';
import { createPreservedTemplateWorkbook, readTemplateWorkbook } from '../server/templateWorkbook.js';
import { runSourceRecipe } from '../server/sourceRecipe.js';

async function fixture() {
  const zip = new JSZip();
  zip.file('xl/workbook.xml', '<workbook><sheets><sheet r:id="r1" name="A &amp; B"/></sheets></workbook>');
  zip.file('xl/_rels/workbook.xml.rels', '<Relationships><Relationship Target="/xl/worksheets/sheet1.xml" Type="x/worksheet" Id="r1"/></Relationships>');
  zip.file('xl/worksheets/sheet1.xml', '<worksheet><sheetData><row r="1" ht="22"><c r="A1" s="3"/><c r="C1"><v>2</v></c></row><row r="3"><c r="A3"><v>3</v></c></row></sheetData><mergeCells><mergeCell ref="D1:E1"/></mergeCells><drawing r:id="photo"/></worksheet>');
  zip.file('xl/media/photo.png', Buffer.from([1, 2, 3]));
  zip.file('xl/styles.xml', '<styleSheet/>');
  return zip.generateAsync({ type: 'nodebuffer' });
}

test('no-op clone preserves the exact binary', async () => {
  const raw = await fixture();
  const out = await createPreservedTemplateWorkbook(raw, 'test.xlsx');
  assert.equal(out.originalSha256, out.transformedSha256);
});
test('self-closing cell, literal replacement characters, numeric scientific factor and ordered cells', async () => {
  const raw = await fixture();
  const out = await createPreservedTemplateWorkbook(raw, 'test.xlsx', [
    { sheetName: 'A & B', address: 'A1', value: ' $& <hello> ' },
    { sheetName: 'A & B', address: 'B1', value: 8e-1 },
    { sheetName: 'A & B', address: 'A2', value: 4 },
  ]);
  const zip = await JSZip.loadAsync(Buffer.from(out.transformedXlsxBase64, 'base64'));
  const xml = await zip.file('xl/worksheets/sheet1.xml')!.async('string');
  assert.equal((xml.match(/r="A1"/g) || []).length, 1);
  assert.match(xml, /r="A1" s="3"/);
  assert.ok(xml.indexOf('r="B1"') < xml.indexOf('r="C1"'));
  assert.ok(xml.indexOf('<row r="2"') < xml.indexOf('<row r="3"'));
  const [sheet] = await readTemplateWorkbook(Buffer.from(out.transformedXlsxBase64, 'base64'));
  assert.equal(sheet.cells.A1.value, ' $& <hello> ');
  assert.equal(sheet.cells.B1.value, 0.8);
});
test('invalid inputs and unsafe writes fail instead of producing fake values', async () => {
  await assert.rejects(createPreservedTemplateWorkbook(Buffer.from('%PDF'), 'bad.xlsx'), /valid XLSX/);
  const raw = await fixture();
  for (const patch of [
    { address: 'A0', value: 1 }, { address: 'XFE1', value: 1 },
    { address: 'E1', value: 1 }, { address: 'A1', value: NaN },
    { address: 'A1', formula: '=SUM(B1:C1)' },
  ]) await assert.rejects(createPreservedTemplateWorkbook(raw, 'test.xlsx', [{ sheetName: 'A & B', ...patch }]));
});

// Customer fixtures are opt-in local files, never copied into the repository.
for (const [label, filename] of [['Fang', process.env.MOCOF_FANG_XLSX], ['Yang', process.env.MOCOF_YANG_XLSX]]) {
  test(`${label}: every untouched ZIP entry retains identical bytes`, { skip: !filename }, async () => {
    const raw = await fs.readFile(filename!);
    const sheets = await readTemplateWorkbook(raw);
    const out = await createPreservedTemplateWorkbook(raw, 'source.xlsx', [{ sheetName: sheets[0].name, address: 'E1', value: 'MOCOF Whole House Quotation' }]);
    const before = await JSZip.loadAsync(raw), after = await JSZip.loadAsync(Buffer.from(out.transformedXlsxBase64, 'base64'));
    assert.deepEqual(Object.keys(after.files).sort(), Object.keys(before.files).sort());
    for (const [name, entry] of Object.entries(before.files)) if (!entry.dir && name !== sheets[0].id)
      assert.deepEqual(await after.file(name)!.async('nodebuffer'), await entry.async('nodebuffer'), name);
    const result = await runSourceRecipe(raw, 'source.xlsx', 3, { name: 'Acceptance test', address: 'Test address', sqft: 1200, budget: 50000, currency: 'MYR' }, { planner: async context => ({
      stepId: context.step.id, status: context.step.text.includes('CustomerName') ? 'ready' : 'no_change', reason: 'Preservation fixture planner, not a live Gemini result.',
      operations: context.step.text.includes('CustomerName') ? [{ kind: 'set', sheetName: context.sheets[0].name, address: 'F2', value: 'Acceptance test', evidence: 'CustomerName' }] : [],
    }) });
    assert.equal(result.workbookSheets.length, sheets.length);
    assert.ok(result.executions.every(e => e.status === 'applied' || e.status === 'skipped'));
    assert.equal(result.workbookSheets[0].cells.F2.value, 'Acceptance test');
    assert.equal(result.workbookSheets[0].cells.H7.value, sheets[0].cells.H7.value);
    console.log(`${label}: ${out.sheetNames.length} sheets, ${out.protectedMediaCount} media, ${out.protectedDrawingCount} drawings/relationships, ${out.protectedMergeCount} merges preserved`);
  });
}
