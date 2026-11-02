import React, {useEffect, useRef, useState} from 'react';
import {getDocument, GlobalWorkerOptions, type PDFDocumentProxy} from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;

/** Render the export bytes directly: no browser PDF plug-in or regenerated layout. */
export default function SavedPdfPreview({bytes}: {bytes: ArrayBuffer}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState('');
  const [rendering, setRendering] = useState(true);
  useEffect(() => {
    let active = true;
    setPdf(null); setPage(1); setError(''); setRendering(true);
    // PDF.js transfers its buffer to the worker; preserve the download/Excel bytes.
    const task = getDocument({data: new Uint8Array(bytes.slice(0))});
    task.promise.then(value => { if (active) setPdf(value); })
      .catch(reason => { if (active) setError(`PDF preview could not open: ${reason.message}`); });
    return () => { active = false; void task.destroy(); };
  }, [bytes]);
  useEffect(() => {
    if (!pdf) return;
    let active = true;
    let render: ReturnType<Awaited<ReturnType<PDFDocumentProxy['getPage']>>['render']> | undefined;
    setRendering(true); setError('');
    pdf.getPage(page).then(async value => {
      if (!active || !canvas.current) return;
      const target = canvas.current;
      const viewport = value.getViewport({scale});
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      target.width = Math.ceil(viewport.width * ratio);
      target.height = Math.ceil(viewport.height * ratio);
      target.style.width = `${viewport.width}px`;
      target.style.height = `${viewport.height}px`;
      render = value.render({canvas: target, canvasContext: target.getContext('2d')!, viewport,
        transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0]});
      await render.promise;
      if (active) setRendering(false);
    }).catch(reason => { if (active) {setError(`PDF page could not render: ${reason.message}`); setRendering(false);} });
    return () => { active = false; render?.cancel(); };
  }, [pdf, page, scale]);
  return <section className="flex-1 min-h-0 flex flex-col" aria-label="Saved PDF pages">
    <div className="flex flex-wrap items-center gap-3 p-3 border-b">
      <button className="border rounded px-3 py-2 disabled:opacity-40" disabled={!pdf || page === 1 || rendering} onClick={() => setPage(p => p - 1)}>Previous page</button>
      <span>Page {page} of {pdf?.numPages ?? '…'}</span>
      <button className="border rounded px-3 py-2 disabled:opacity-40" disabled={!pdf || page === pdf.numPages || rendering} onClick={() => setPage(p => p + 1)}>Next page</button>
      <label>Zoom <select value={scale} onChange={event => setScale(Number(event.target.value))}>
        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(value => <option key={value} value={value}>{value * 100}%</option>)}
      </select></label>
      {rendering && !error && <span role="status">Rendering page…</span>}
    </div>
    {error && <p role="alert" className="p-4 text-red-700">{error} You can still use the download link above.</p>}
    <div className="overflow-auto flex-1 bg-slate-200 p-4"><canvas ref={canvas} aria-label={`Quotation PDF page ${page}`} className="bg-white shadow mx-auto" style={{visibility: rendering || error ? 'hidden' : 'visible'}} /></div>
  </section>;
}
