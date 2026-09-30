import type JSZip from 'jszip';
export interface FormatCellsOperation {
  kind: 'format_cells'; sheetName: string; range: string; numberFormat: string; fillColor?: string; promptNumber?: string;
}
const attr = (s: string, n: string) => new RegExp(`\\b${n}=["']([^"']*)["']`).exec(s)?.[1];
const setAttr = (s: string, n: string, value: string) => new RegExp(`\\b${n}=["'][^"']*["']`).test(s)
  ? s.replace(new RegExp(`\\b${n}=["'][^"']*["']`), `${n}="${value}"`) : s.replace(/\s*\/?>$/, ending => ` ${n}="${value}"${ending}`);
const escape = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const parse = (s: string) => { const m = /^([A-Z]{1,3})([1-9]\d*)$/.exec(s); if (!m) throw new Error('Invalid format range.'); return { col: [...m[1]].reduce((n,c)=>n*26+c.charCodeAt(0)-64,0), row: Number(m[2]) }; };
const colName = (n: number) => { let s=''; while(n) { n--; s=String.fromCharCode(65+n%26)+s; n=Math.floor(n/26); } return s; };

export async function formatTemplateCells(zip: JSZip, filename: string, op: FormatCellsOperation,
  addBlank: (xml: string, address: string) => string): Promise<Set<string>> {
  if (!op.numberFormat || op.numberFormat.length > 128 || /[\u0000-\u001f<>]/.test(op.numberFormat)) throw new Error('Invalid number format.');
  const [from, to = from] = op.range.toUpperCase().split(':');
  const a = parse(from), b = parse(to);
  if (a.col>b.col || a.row>b.row || b.col>16384 || b.row>1048576 || (b.col-a.col+1)*(b.row-a.row+1)>20000) throw new Error('Format range exceeds limits.');
  let styles = await zip.file('xl/styles.xml')?.async('string');
  if (!styles) throw new Error('Source stylesheet is required for formatting.');
  const xfsMatch = /<cellXfs\b[^>]*>([\s\S]*?)<\/cellXfs>/.exec(styles);
  if (!xfsMatch) throw new Error('Source cell styles are missing.');
  const xfs = [...xfsMatch[1].matchAll(/<xf\b[^>]*?(?:\/>|>[\s\S]*?<\/xf>)/g)].map(m=>m[0]);
  let fillId: number | undefined;
  if (op.fillColor) {
    if (!/^[A-Fa-f0-9]{6}$/.test(op.fillColor)) throw new Error('Invalid fill color.');
    const section=/<fills\b[^>]*>([\s\S]*?)<\/fills>/.exec(styles);
    if (!section) throw new Error('Source fills missing.');
    const fills=[...section[1].matchAll(/<fill\b[^>]*?(?:\/>|>[\s\S]*?<\/fill>)/g)].map(m=>m[0]);
    const fill=`<fill><patternFill patternType="solid"><fgColor rgb="FF${op.fillColor.toUpperCase()}"/><bgColor indexed="64"/></patternFill></fill>`;
    fillId=fills.indexOf(fill); if(fillId<0){fillId=fills.length;fills.push(fill);}
    styles=styles.replace(section[0],`<fills count="${fills.length}">${fills.join('')}</fills>`);
  }
  const formats = [...styles.matchAll(/<numFmt\b[^>]*\/?\s*>/g)];
  const encoded = escape(op.numberFormat);
  let id = Number(formats.find(m=>attr(m[0],'formatCode')===encoded)?.[0].match(/\bnumFmtId=["'](\d+)["']/)?.[1]);
  if (!Number.isFinite(id)) {
    id = Math.max(163, ...formats.map(m=>Number(attr(m[0],'numFmtId')))) + 1;
    const item = `<numFmt numFmtId="${id}" formatCode="${encoded}"/>`;
    if (/<numFmts\b[^>]*>/.test(styles)) {
      styles = styles.replace(/<numFmts\b[^>]*?(?:\/>|>[\s\S]*?<\/numFmts>)/, section => section.endsWith('/>')
        ? `<numFmts count="1">${item}</numFmts>`
        : section.replace(/^<numFmts[^>]*>/, `<numFmts count="${formats.length+1}">`).replace('</numFmts>', `${item}</numFmts>`));
    } else styles = styles.replace(/<styleSheet\b[^>]*>/, open=>`${open}<numFmts count="1">${item}</numFmts>`);
  }
  let xml = await zip.file(filename)!.async('string');
  const cache = new Map<number, number>();
  for(let row=a.row;row<=b.row;row++) for(let col=a.col;col<=b.col;col++) {
    const address = `${colName(col)}${row}`;
    const matcher = new RegExp(`<c\\b(?=[^>]*\\br=["']${address}["'])[^>]*>`);
    if (!matcher.test(xml)) {
      // Covered cells inherit the anchor's number format for displayed content.
      const covered = [...xml.matchAll(/<mergeCell\b[^>]*\/?\s*>/g)].some(m=> {
        const ref = attr(m[0],'ref')!, [start,end=start]=ref.split(':'); const p=parse(start), q=parse(end);
        return address!==start && row>=p.row && row<=q.row && col>=p.col && col<=q.col;
      });
      if (covered) continue;
      xml = addBlank(xml,address);
    }
    xml = xml.replace(matcher, tag => {
      const original = Number(attr(tag,'s') || 0);
      if (!xfs[original]) throw new Error('Invalid source style index.');
      let style = cache.get(original);
      if (style === undefined) {
        let xf = xfs[original].replace(/^<xf\b[^>]*>/, opening => setAttr(setAttr(opening,'numFmtId',String(id)),'applyNumberFormat','1'));
        if(fillId!==undefined) xf=xf.replace(/^<xf\b[^>]*>/,opening=>setAttr(setAttr(opening,'fillId',String(fillId)),'applyFill','1'));
        style = xfs.indexOf(xf);
        if (style < 0) { style=xfs.length; xfs.push(xf); }
        cache.set(original,style);
      }
      return setAttr(tag,'s',String(style));
    });
  }
  styles = styles.replace(/<cellXfs\b[^>]*>[\s\S]*?<\/cellXfs>/, `<cellXfs count="${xfs.length}">${xfs.join('')}</cellXfs>`);
  zip.file(filename,xml); zip.file('xl/styles.xml',styles);
  return new Set([filename,'xl/styles.xml']);
}
