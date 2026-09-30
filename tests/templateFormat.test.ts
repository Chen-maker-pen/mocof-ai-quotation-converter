import { test } from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { createPreservedTemplateWorkbook, readTemplateWorkbook } from '../server/templateWorkbook.js';
test('number format adds a style without changing numeric values or existing fonts/borders', async () => {
  const z = new JSZip();
  z.file('xl/workbook.xml', '<workbook><sheets><sheet name="Source" r:id="r1"/></sheets></workbook>');
  z.file('xl/_rels/workbook.xml.rels', '<Relationships><Relationship Id="r1" Type="x/worksheet" Target="worksheets/sheet1.xml"/></Relationships>');
  z.file('xl/worksheets/sheet1.xml', '<worksheet><sheetData><row r="2"><c r="I2" s="1"><v>0.9</v></c><c r="J2" s="1"><v>2</v></c></row></sheetData></worksheet>');
  const original = '<styleSheet><fills count="1"><fill><patternFill patternType="none"/></fill></fills><fonts count="1"><font><name val="Calibri"/></font></fonts><cellXfs count="2"><xf numFmtId="0" fontId="0" borderId="0"/><xf numFmtId="0" fontId="0" borderId="1"><alignment horizontal="right"/></xf></cellXfs></styleSheet>';
  z.file('xl/styles.xml', original);
  z.file('xl/media/photo.png', Buffer.from([1,2]));
  const raw = await z.generateAsync({ type: 'nodebuffer' });
  const result = await createPreservedTemplateWorkbook(raw, 'source.xlsx', [
    { kind: 'format_cells', sheetName: 'Source', range: 'I2:J2', numberFormat: '0.00E+00' },
    { kind: 'format_cells', sheetName: 'Source', range: 'J2', numberFormat: '"RM"#,##0.00', fillColor: '00FF00' },
  ]);
  const saved = await JSZip.loadAsync(Buffer.from(result.transformedXlsxBase64, 'base64'));
  const [sheet] = await readTemplateWorkbook(Buffer.from(result.transformedXlsxBase64, 'base64'));
  assert.equal(sheet.cells.I2.value, 0.9);
  assert.equal(sheet.cells.J2.value, 2);
  const styles = await saved.file('xl/styles.xml')!.async('string');
  assert.match(styles, /formatCode="0.00E\+00"/);
  assert.match(styles, /formatCode="&quot;RM&quot;#,##0.00"/);
  assert.ok(styles.includes('<xf numFmtId="0" fontId="0" borderId="1"><alignment horizontal="right"/></xf>'));
  assert.match(styles, /numFmtId="164" fontId="0" borderId="1" applyNumberFormat="1"/);
  assert.match(styles, /fgColor rgb="FF00FF00"/);
  assert.match(styles, /fillId="1" applyFill="1"/);
  assert.match(styles, /<cellXfs count="4">/);
  assert.deepEqual(await saved.file('xl/media/photo.png')!.async('nodebuffer'), Buffer.from([1,2]));
});
