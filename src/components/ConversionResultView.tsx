/**
 * Synchronized Conversion Result View Component (3 Panels)
 * Panel A: Immutable Original Chinese Source Workbook
 * Panel B: Generated English MOCOF Customer Quotation
 * Panel C: Automated Audit & Exceptions Report
 */

import React, { useState } from 'react';
import {
  Quote,
  Project,
  ExceptionItem,
  AuditLog,
} from '../types.js';
import {
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  FileText,
  Lock,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  Sliders,
  DollarSign,
  Info,
} from 'lucide-react';

interface ConversionResultViewProps {
  quote: Quote;
  project: Project;
  exceptions: ExceptionItem[];
  auditLogs: AuditLog[];
  onResolveException: (exceptionId: string) => void;
  onNavigateEditor: () => void;
  onApproveQuote: () => void;
}

export const ConversionResultView: React.FC<ConversionResultViewProps> = ({
  quote,
  project,
  exceptions,
  auditLogs,
  onResolveException,
  onNavigateEditor,
  onApproveQuote,
}) => {
  const [activeSheetTab, setActiveSheetTab] = useState<number>(1);
  const [activeSourceSheet, setActiveSourceSheet] = useState<string>('全屋主表');

  const unresolvedExceptions = exceptions.filter((e) => !e.resolved);

  return (
    <div className="space-y-4">
      {/* Top Action Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-extrabold text-slate-900">Synchronized Conversion Workspace</h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
              {quote.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Compare immutable Chinese supplier source with AI-generated MOCOF English customer quotation.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onNavigateEditor}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors inline-flex items-center"
          >
            Open Full Quotation Editor
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onApproveQuote}
            disabled={unresolvedExceptions.length > 0}
            className={`px-4 py-2 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center ${
              unresolvedExceptions.length > 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-400" />
            Approve Quotation
          </button>
        </div>
      </div>

      {/* 3 Synchronized Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* PANEL A: Immutable Chinese Supplier Workbook (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col h-[750px] overflow-hidden">
          <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Panel A: Immutable Source (Chinese)</span>
            </div>
            <span className="text-[10px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
              READ-ONLY
            </span>
          </div>

          {/* Chinese Sheet Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-100/60 px-2 pt-1 text-xs overflow-x-auto space-x-1">
            {['全屋主表', '23 quotation details', '25 Kitchen Cabinet', 'LF Details'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSourceSheet(tab)}
                className={`px-3 py-1.5 rounded-t-lg font-bold whitespace-nowrap text-xs transition-all ${
                  activeSourceSheet === tab
                    ? 'bg-white text-slate-900 border-t-2 border-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Source Sheet Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 font-sans text-xs bg-slate-50/50">
            <div className="bg-amber-50 border border-amber-200/80 p-2.5 rounded-lg text-[11px] text-amber-900 flex items-start space-x-2 font-medium">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>Original uploaded XLSX rows are immutable and preserved for audit reconciliation.</span>
            </div>

            <table className="w-full text-left border-collapse bg-white border border-slate-200 text-[11px] rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="p-2 border-r border-slate-200 w-10">行</th>
                  <th className="p-2 border-r border-slate-200">产品名称/细节</th>
                  <th className="p-2 border-r border-slate-200 w-16">数量</th>
                  <th className="p-2">出厂价 (CNY)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 border-r border-slate-200 font-mono text-slate-400">01</td>
                  <td className="p-2 border-r border-slate-200 font-chinese text-slate-800 font-medium">全屋整装木作汇总包</td>
                  <td className="p-2 border-r border-slate-200 text-slate-600">1 套</td>
                  <td className="p-2 font-mono text-slate-900 font-bold">¥168,000.00</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-200 font-mono text-slate-400">04</td>
                  <td className="p-2 border-r border-slate-200 font-chinese text-slate-800 font-medium">现代极简PET门板地柜+吊柜</td>
                  <td className="p-2 border-r border-slate-200 text-slate-600">1 套</td>
                  <td className="p-2 font-mono text-slate-900 font-semibold">¥28,000.00</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-200 font-mono text-slate-400">05</td>
                  <td className="p-2 border-r border-slate-200 font-chinese text-slate-800 font-medium">无缝岩板/石英石厨台面</td>
                  <td className="p-2 border-r border-slate-200 text-slate-600">1 批</td>
                  <td className="p-2 font-mono text-slate-900 font-semibold">¥12,000.00</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-200 font-mono text-slate-400">12</td>
                  <td className="p-2 border-r border-slate-200 font-chinese text-slate-800 font-medium">主卧一字型玻璃加木门衣柜</td>
                  <td className="p-2 border-r border-slate-200 text-slate-600">1 套</td>
                  <td className="p-2 font-mono text-slate-900 font-semibold">¥38,000.00</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-200 font-mono text-slate-400">13</td>
                  <td className="p-2 border-r border-slate-200 font-chinese text-slate-800 font-medium">主卧隐形同质涂装门 (带静音锁)</td>
                  <td className="p-2 border-r border-slate-200 text-slate-600">2 扇</td>
                  <td className="p-2 font-mono text-slate-900 font-semibold">¥13,000.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* PANEL B: Generated English MOCOF Customer Quotation (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col h-[750px] overflow-hidden">
          <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Panel B: MOCOF English Customer Quote</span>
            </div>
            <span className="text-[10px] bg-slate-800 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
              6 SHEETS GENERATED
            </span>
          </div>

          {/* 6 Worksheet Output Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-100 px-2 pt-1 text-xs overflow-x-auto space-x-1">
            {quote.worksheets.map((ws) => (
              <button
                key={ws.worksheetIndex}
                onClick={() => setActiveSheetTab(ws.worksheetIndex)}
                className={`px-3 py-1.5 rounded-t-lg font-bold whitespace-nowrap text-xs transition-all ${
                  activeSheetTab === ws.worksheetIndex
                    ? 'bg-white text-slate-900 border-t-2 border-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {ws.name}
              </button>
            ))}
          </div>

          {/* Generated Sheet Preview */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Header branding */}
            <div className="border-b border-slate-200 pb-3 space-y-0.5">
              <h3 className="font-extrabold text-sm text-slate-900">MOCOF SDN BHD</h3>
              <p className="text-[11px] text-slate-600 font-mono font-bold">Quotation #: {project.quotationNumber}</p>
              <p className="text-[11px] text-slate-600 font-medium">Customer: {project.customerName} | Address: {project.projectAddress}</p>
              <p className="text-[11px] font-bold text-emerald-700 mt-1">
                Currency: {quote.currency} (1 CNY = {quote.exchangeRate.rate} MYR)
              </p>
            </div>

            {/* Room Tables */}
            {quote.worksheets
              .filter((ws) => ws.worksheetIndex === activeSheetTab)
              .map((ws) => (
                <div key={ws.worksheetIndex} className="space-y-4">
                  {ws.rooms.map((room) => (
                    <div key={room.id} className="border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
                      <div className="bg-slate-900 text-white p-2.5 text-xs font-extrabold flex justify-between items-center">
                        <span>ROOM: {room.roomNameEnglish.toUpperCase()}</span>
                        <span className="font-mono text-emerald-400 bg-slate-800 px-2 py-0.5 rounded">
                          Subtotal: MYR {((room.subtotals.subtotalCents || 0) / 100).toFixed(2)}
                        </span>
                      </div>

                      <div className="p-2.5 space-y-2.5 bg-slate-50/30">
                        {room.sections.map((sec) => (
                          <div key={sec.id} className="space-y-1.5">
                            {sec.items.map((item) => (
                              <div
                                key={item.id}
                                className={`p-2.5 rounded-lg border text-[11px] flex items-start space-x-3 transition-colors ${
                                  item.isExceptionFlagged
                                    ? 'bg-amber-50/90 border-amber-300'
                                    : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                                }`}
                              >
                                {item.imageUrl && (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.nameEnglish}
                                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-900 leading-tight">{item.nameEnglish}</p>
                                  <p className="text-slate-500 font-mono text-[10px] mt-0.5">
                                    SKU: {item.itemCode} • {item.dimensionText}
                                  </p>
                                  <p className="text-slate-600 text-[10px] mt-0.5">{item.notes}</p>
                                </div>
                                <div className="text-right font-mono flex-shrink-0">
                                  <p className="font-bold text-slate-900">
                                    MYR {((item.finalAmountCents || 0) / 100).toFixed(2)}
                                  </p>
                                  <p className="text-[10px] text-slate-500 font-sans">
                                    Qty: {item.quantity} @ MYR {((item.unitPriceCents || 0) / 100).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

            {/* Whole House Totals Summary Block */}
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 text-xs shadow-xs border border-slate-800">
              <p className="font-extrabold text-emerald-400 border-b border-slate-800 pb-1.5 uppercase tracking-wider text-[11px]">
                Whole House Total Summary
              </p>
              <div className="flex justify-between text-slate-300">
                <span>Cabinet & Joinery Products:</span>
                <span className="font-mono">MYR {((quote.wholeHouseTotals.cabinetProductsCents || 0) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Custom Stealth Doors:</span>
                <span className="font-mono">MYR {((quote.wholeHouseTotals.customDoorProductsCents || 0) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Supplementary Services:</span>
                <span className="font-mono">MYR {((quote.wholeHouseTotals.supplementaryItemsCents || 0) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-white pt-2 border-t border-slate-800 text-sm">
                <span>GRAND TOTAL (MYR):</span>
                <span className="font-mono text-emerald-400">MYR {((quote.wholeHouseTotals.grandTotalCents || 0) / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL C: Automated Audit & Exceptions Report (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col h-[750px] overflow-hidden">
          <div className="p-3 bg-amber-600 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Panel C: Audit & Exceptions</span>
            </div>
            <span className="text-[10px] bg-amber-800 text-amber-100 px-2 py-0.5 rounded font-mono font-bold">
              {unresolvedExceptions.length} PENDING
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
            {unresolvedExceptions.length === 0 ? (
              <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-xl text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-emerald-950">Zero Pending Exceptions!</p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  All terminology, pricing rules and photo mappings are verified and ready for approval.
                </p>
              </div>
            ) : (
              unresolvedExceptions.map((exc) => (
                <div
                  key={exc.id}
                  className="bg-amber-50/80 border border-amber-300 rounded-xl p-3 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 uppercase text-[10px] bg-amber-200 px-1.5 py-0.5 rounded font-mono">
                      {exc.reasonCode}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">Row #{exc.sourceRow}</span>
                  </div>

                  <p className="font-chinese font-bold text-slate-900">{exc.chineseText}</p>
                  <p className="text-[11px] text-slate-600 font-medium">{exc.description}</p>

                  {exc.suggestedFix && (
                    <div className="bg-white p-2 rounded-lg border border-amber-200 text-[11px]">
                      <p className="font-bold text-emerald-800">Suggested Fix:</p>
                      <p className="text-slate-700 font-semibold">{exc.suggestedFix.englishName}</p>
                    </div>
                  )}

                  <button
                    onClick={() => onResolveException(exc.id)}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                  >
                    Resolve & Approve Item
                  </button>
                </div>
              ))
            )}

            {/* Audit Log Timeline */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 text-xs">Audit History Log</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-[10px]">
                {auditLogs.map((log) => (
                  <div key={log.id} className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                    <p className="font-bold text-slate-800">{log.action}</p>
                    <p className="text-slate-600 mt-0.5 font-medium">{log.details}</p>
                    <p className="text-slate-400 text-[9px] mt-1 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
