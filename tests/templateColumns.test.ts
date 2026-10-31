import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import JSZip from 'jszip';
import { copyTemplateColumn } from '../server/templateColumns.js';
import { createPreservedTemplateWorkbook, readTemplateWorkbook } from '../server/templateWorkbook.js';

test('column copy carries cell style, width and vertical merges while preserving source cells', () => {
  const xml = '<worksheet><dimension ref="A1:H12"/><cols><col min="1" max="8" width="23" customWidth="1"/></cols><sheetData><row r="10"><c r="H10" s="9"><v>25</v></c></row></sheetData><mergeCells count="1"><mergeCell ref="H10:H12"/></mergeCells></worksheet>';
  const out = copyTemplateColumn(xml, { kind: 'copy_column', sheetName: 'Source', sourceColumn: 'H', targetColumn: 'J' });
  assert.match(out, /<c r="H10" s="9"><v>25<\/v><\/c><c r="J10" s="9"><v>25<\/v><\/c>/);
  assert.match(out, /<col min="10" max="10" width="23" customWidth="1"\/>/);
  assert.match(out, /<mergeCell ref="J10:J12"\/>/);
  assert.match(out, /<dimension ref="A1:J12"\/>/);
  assert.throws(() => copyTemplateColumn(xml, { kind: 'copy_column', sheetName: 'Source', sourceColumn: 'A', targetColumn: 'H' }), /Destination/);
  assert.throws(() => copyTemplateColumn(xml.replace('<v>25</v>', '<f>A1+1</f><v>25</v>'), { kind: 'copy_column', sheetName: 'Source', sourceColumn: 'H', targetColumn: 'J' }), /recalculation/);
});
for (const [name, filename] of [['Fang', process.env.MOCOF_FANG_XLSX], ['Yang', process.env.MOCOF_YANG_XLSX]]) {
  test(`${name}: documented H to I/J copies preserve all original values and unrelated archive parts`, { skip: !filename }, async () => {
    const raw = await fs.readFile(filename!), before = await readTemplateWorkbook(raw), sheetName = before[0].name;
    const result = await createPreservedTemplateWorkbook(raw, 'source.xlsx', [
      { kind: 'copy_column', sheetName, sourceColumn: 'H', targetColumn: 'I' },
      { kind: 'copy_column', sheetName, sourceColumn: 'H', targetColumn: 'J' },
    ]);
    const outRaw = Buffer.from(result.transformedXlsxBase64, 'base64'), after = await readTemplateWorkbook(outRaw);
    for (const cell of Object.values(before[0].cells)) {
      assert.equal(after[0].cells[cell.address].value, cell.value);
      if (cell.column === 8) for (const column of ['I', 'J']) assert.equal(after[0].cells[`${column}${cell.row}`].value, cell.value);
    }
    const original = await JSZip.loadAsync(raw), saved = await JSZip.loadAsync(outRaw);
    for (const [n, entry] of Object.entries(original.files)) if (!entry.dir && n !== before[0].id)
      assert.deepEqual(await entry.async('nodebuffer'), await saved.file(n)!.async('nodebuffer'), n);
  });
}

test('formula columns translate relative references and recalculate stale caches before return', async () => {
  const z = new JSZip();
  z.file('xl/workbook.xml','<workbook><sheets><sheet name="Source" r:id="r1"/></sheets></workbook>');
  z.file('xl/_rels/workbook.xml.rels','<Relationships><Relationship Id="r1" Target="worksheets/combined.xml" Type="x/worksheet"/></Relationships>');
  z.file('xl/worksheets/combined.xml','<worksheet><sheetData><row r="1"><c r="A1"><v>2</v></c><c r="B1"><v>5</v></c><c r="H1"><f>A1+$A$1</f><v>999</v></c></row><row r="2"><c r="H2"><f>IF(A1=2,&quot;A1&quot;,&quot;B1&quot;)</f><v>999</v></c></row></sheetData></worksheet>');
  z.file('xl/styles.xml','<styleSheet/>');
  const raw=await z.generateAsync({type:'nodebuffer'});
  const op={kind:'copy_column' as const,sheetName:'Source',sourceColumn:'H',targetColumn:'I'};
  const result=await createPreservedTemplateWorkbook(raw,'formula.xlsx',[op]);
  const s=(await readTemplateWorkbook(Buffer.from(result.transformedXlsxBase64,'base64')))[0];
  assert.equal(s.cells.H1.value,4);assert.equal(s.cells.I1.formula,'B1+$A$1');assert.equal(s.cells.I1.value,7);
  assert.equal(s.cells.I2.formula,'IF(B1=2,"A1","B1")');assert.equal(s.cells.I2.value,'B1');
  z.file('xl/worksheets/combined.xml','<worksheet><sheetData><row r="1"><c r="H1"><f>UNKNOWN(A1)</f><v>999</v></c></row></sheetData></worksheet>');
  await assert.rejects(createPreservedTemplateWorkbook(await z.generateAsync({type:'nodebuffer'}),'bad.xlsx',[op]),/Cannot recalculate/);
});
