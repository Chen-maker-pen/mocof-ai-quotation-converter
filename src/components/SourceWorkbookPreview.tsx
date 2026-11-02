import React, { useEffect, useState } from 'react';
import { readSourcePreview, type PreviewSheet } from '../lib/sourcePreview';

export default function SourceWorkbookPreview({ bytes }: { bytes: ArrayBuffer }) {
  const [sheets, setSheets] = useState<PreviewSheet[]>([]);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(75);
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true; setSheets([]); setError(''); setActive(0);
    readSourcePreview(bytes).then(value => { if (alive) setSheets(value); }).catch(e => { if (alive) setError(e.message); });
    return () => { alive = false; };
  }, [bytes]);
  const sheet = sheets[active];
  return <section className="space-y-3 border-t pt-5">
    <h3 className="text-lg font-bold">Original workbook preview</h3>
    <p className="text-sm">Read-only. Formula cells show the results saved in the source file. Browser font rendering and Excel column widths may differ; this preview still needs visual comparison with Excel.</p>
    {error && <p role="alert">Preview unavailable: {error}. The unchanged Excel download is still available.</p>}
    {!sheet && !error && <p role="status">Loading sheet layouts and pictures…</p>}
    <div role="tablist" aria-label="Original workbook sheets" className="flex flex-wrap gap-2">{sheets.map((s,i) => <button role="tab" aria-selected={i === active} key={s.name} onClick={() => setActive(i)} className={`rounded border px-3 py-2 ${i === active ? 'bg-blue-900 text-white' : 'bg-white'}`}>{s.name}</button>)}</div>
    {sheet && <>
      <label>Zoom <select value={zoom} onChange={e => setZoom(Number(e.target.value))}>{[50,75,100,125,150].map(value => <option key={value} value={value}>{value}%</option>)}</select></label>
      <p className="text-sm">{sheet.name}: {sheet.images.length} pictures</p>
      {sheet.warnings.length > 0 && <p className="text-sm text-amber-900">{sheet.warnings.join(' ')}</p>}
      <div role="tabpanel" aria-label={sheet.name} className="overflow-auto border bg-slate-100" style={{ maxHeight: '70vh' }}>
        <div style={{ width: sheet.width * zoom / 100, height: sheet.height * zoom / 100 }}>
          <div style={{ position: 'relative', width: sheet.width, height: sheet.height, transform: `scale(${zoom / 100})`, transformOrigin: 'top left', background: 'white' }}>
            {sheet.cells.map(cell => <div key={cell.address} title={`${cell.address}${cell.formula ? ` =${cell.formula}` : ''}\n${cell.text}`} style={{ ...cell.style, position:'absolute', boxSizing:'border-box', left:cell.x, top:cell.y, width:cell.width, height:cell.height, overflow:'hidden', display:'flex', flexDirection:'column', padding:'1px 2px', lineHeight:1.35 } as React.CSSProperties}><span>{cell.text}</span></div>)}
            {sheet.images.map((pic,i) => <img key={i} alt={`${sheet.name} picture ${i+1}`} src={pic.src} style={{ position:'absolute', left:pic.x, top:pic.y, width:pic.width, height:pic.height }} />)}
          </div>
        </div>
      </div>
    </>}
  </section>;
}
