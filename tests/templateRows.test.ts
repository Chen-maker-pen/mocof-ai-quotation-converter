import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import JSZip from 'jszip';
import { createPreservedTemplateWorkbook, readTemplateWorkbook } from '../server/templateWorkbook.js';
import { shiftRowReferences } from '../server/templateRows.js';

const insertion = { kind: 'insert_rows' as const, sheetName: 'Source', beforeRow: 10, count: 6 };
test('insertion shifts absolute, relative, cross-sheet and whole-row ranges, preserving strings and other sheets', () => {
  assert.equal(shiftRowReferences('SUM($A$9:B12)+\'Source\'!C10+Other!C10+IF(A9="A10",1E10,LOG10(A10))', 'Source', insertion),
    'SUM($A$9:B18)+\'Source\'!C16+Other!C10+IF(A9="A10",1E10,LOG10(A16))');
  assert.equal(shiftRowReferences("'Source'!$10:$12", '', insertion), "'Source'!$16:$18");
  assert.equal(shiftRowReferences('Source!A10:A11+A10', 'Other', insertion), 'Source!A16:A17+A10');
  assert.throws(() => shiftRowReferences('INDIRECT("A10")', 'Source', insertion), /Dynamic/);
  assert.throws(() => shiftRowReferences('A1048576', 'Source', insertion), /limits/);
});

async function fixture() {
  const z = new JSZip();
  z.file('xl/workbook.xml', '<workbook><sheets><sheet name="Source" r:id="r1"/><sheet name="Other" r:id="r2"/></sheets><definedNames><definedName name="_xlnm.Print_Area" localSheetId="0">Source!$A$1:$H$12</definedName></definedNames></workbook>');
  z.file('xl/_rels/workbook.xml.rels', '<Relationships><Relationship Id="r1" Type="x/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="r2" Type="x/worksheet" Target="worksheets/sheet2.xml"/></Relationships>');
  z.file('xl/worksheets/sheet1.xml', '<worksheet><dimension ref="A1:H12"/><sheetData><row r="9"><c r="A9"><v>2</v></c></row><row r="10" ht="60" customHeight="1"><c r="A10" s="3"><v>7</v></c><c r="H10"><f>SUM(A9:A10)</f><v>9</v></c></row></sheetData><mergeCells><mergeCell ref="B10:C12"/></mergeCells><drawing r:id="d1"/></worksheet>');
  z.file('xl/worksheets/sheet2.xml', '<worksheet><sheetData><row r="1"><c r="A1"><f>Source!A10</f><v>7</v></c></row></sheetData></worksheet>');
  z.file('xl/worksheets/_rels/sheet1.xml.rels', '<Relationships><Relationship Id="d1" Type="x/drawing" Target="../drawings/drawing1.xml"/></Relationships>');
  z.file('xl/drawings/drawing1.xml', '<xdr:wsDr><xdr:oneCellAnchor><xdr:from><xdr:row>9</xdr:row><xdr:rowOff>20</xdr:rowOff></xdr:from><xdr:ext cx="400" cy="500"/><xdr:pic/></xdr:oneCellAnchor></xdr:wsDr>');
  z.file('xl/media/image.png', Buffer.from([1,2,3]));
  z.file('xl/styles.xml', '<styles/>');
  return z;
}
test('row insertion preserves products, style, row height, image extent and updates dependencies without overwriting the inserted space', async () => {
  const z = await fixture(), raw = await z.generateAsync({ type: 'nodebuffer' });
  const result = await createPreservedTemplateWorkbook(raw, 'source.xlsx', [insertion,
    { sheetName: 'Source', address: 'A10', value: 'New service' }]);
  const out = await JSZip.loadAsync(Buffer.from(result.transformedXlsxBase64, 'base64'));
  const sheets = await readTemplateWorkbook(Buffer.from(result.transformedXlsxBase64, 'base64'));
  assert.equal(sheets[0].cells.A16.value, 7);
  assert.equal(sheets[0].cells.A10.value, 'New service');
  assert.equal(sheets[0].cells.H16.formula, 'SUM(A9:A16)');
  assert.equal(sheets[1].cells.A1.formula, 'Source!A16');
  assert.deepEqual(sheets[0].mergedRanges, ['B16:C18']);
  assert.match(await out.file('xl/worksheets/sheet1.xml')!.async('string'), /<row r="16" ht="60" customHeight="1"><c r="A16" s="3">/);
  assert.match(await out.file('xl/workbook.xml')!.async('string'), /Source!\$A\$1:\$H\$18/);
  assert.equal(await out.file('xl/drawings/drawing1.xml')!.async('string'), (await z.file('xl/drawings/drawing1.xml')!.async('string')).replace('<xdr:row>9</xdr:row>', '<xdr:row>15</xdr:row>'));
  for (const n of ['xl/media/image.png', 'xl/styles.xml', 'xl/worksheets/_rels/sheet1.xml.rels']) assert.deepEqual(await out.file(n)!.async('nodebuffer'), await z.file(n)!.async('nodebuffer'));
});
test('unsupported structural dependencies stop before returning a workbook', async () => {
  const z = await fixture();
  z.file('xl/drawings/drawing1.xml', '<xdr:wsDr><xdr:twoCellAnchor><xdr:from><xdr:row>8</xdr:row></xdr:from><xdr:to><xdr:row>12</xdr:row></xdr:to></xdr:twoCellAnchor></xdr:wsDr>');
  await assert.rejects(createPreservedTemplateWorkbook(await z.generateAsync({ type: 'nodebuffer' }), 'source.xlsx', [insertion]), /stretch/);
});
for (const [name, filename] of [['Fang', process.env.MOCOF_FANG_XLSX], ['Yang', process.env.MOCOF_YANG_XLSX]]) {
  test(`${name}: two documented insertions retain every source cell and image at its shifted position`, { skip: !filename }, async () => {
    const raw = await fs.readFile(filename!);
    const before = await readTemplateWorkbook(raw), sheetName = before[0].name;
    const operations = [{ ...insertion, sheetName }, { ...insertion, sheetName, beforeRow: 18, count: 19 }];
    const output = await createPreservedTemplateWorkbook(raw, 'source.xlsx', operations);
    const outRaw = Buffer.from(output.transformedXlsxBase64, 'base64'), after = await readTemplateWorkbook(outRaw);
    const mappedRow = (r: number) => { if (r >= 10) r += 6; if (r >= 18) r += 19; return r; };
    for (const cell of Object.values(before[0].cells)) {
      const address = cell.address.replace(/\d+$/, String(mappedRow(cell.row)));
      assert.equal(after[0].cells[address].value, cell.value, address);
    }
    const inputZip = await JSZip.loadAsync(raw), outputZip = await JSZip.loadAsync(outRaw);
    assert.deepEqual(Object.keys(outputZip.files).sort(), Object.keys(inputZip.files).sort());
    for (const [n, entry] of Object.entries(inputZip.files)) {
      if (entry.dir) continue;
      if (n === before[0].id) continue;
      const original = await entry.async('nodebuffer'), modified = await outputZip.file(n)!.async('nodebuffer');
      if (n === 'xl/drawings/drawing1.xml') {
        const expected = original.toString().replace(/(<(?:\w+:)?row>)(\d+)(<\/(?:\w+:)?row>)/g, (_, a, r, b) => a + (mappedRow(Number(r) + 1) - 1) + b);
        assert.equal(modified.toString(), expected);
      } else assert.deepEqual(modified, original, `Unrelated entry ${n}`);
    }
  });
}

test('inserted rows inherit height and cell style without copying source amounts or formulas', async()=>{
 const z=await fixture();
 z.file('xl/worksheets/sheet1.xml',(await z.file('xl/worksheets/sheet1.xml')!.async('string')).replace('<row r="9"><c r="A9">','<row r="9" ht="25" customHeight="1"><c r="A9" s="3">'));
 const result=await createPreservedTemplateWorkbook(await z.generateAsync({type:'nodebuffer'}),'source.xlsx',[insertion]);
 const out=await JSZip.loadAsync(Buffer.from(result.transformedXlsxBase64,'base64'));
 const xml=await out.file('xl/worksheets/sheet1.xml')!.async('string');
 for(let row=10;row<16;row++)assert.ok(xml.includes(`<row r="${row}" ht="25" customHeight="1"><c r="A${row}" s="3"/></row>`));
});

test('blank inserted rows inherit horizontal merges without changing original merge contents',async()=>{
 const z=await fixture();
 z.file('xl/worksheets/sheet1.xml',(await z.file('xl/worksheets/sheet1.xml')!.async('string')).replace('<mergeCells>','<mergeCells><mergeCell ref="B9:C9"/>'));
 const out=await createPreservedTemplateWorkbook(await z.generateAsync({type:'nodebuffer'}),'source.xlsx',[{...insertion,inheritHorizontalMerges:true}]);
 const [sheet]=await readTemplateWorkbook(Buffer.from(out.transformedXlsxBase64,'base64'));
 for(let row=9;row<=15;row++)assert.ok(sheet.mergedRanges.includes(`B${row}:C${row}`));
 assert.ok(sheet.mergedRanges.includes('B16:C18'));
});
