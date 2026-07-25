/**
 * Full Quotation Workspace Editor Component
 * Supports inline editing across all 6 worksheets, supplementary rows, photo preview,
 * deterministic recalculation, exchange rate locking, version history, and XLSX/PDF export.
 */

import React, { useState } from 'react';
import {
  Quote,
  Project,
  QuoteItem,
  SupplementaryItem,
  QuoteVersion,
} from '../types.js';
import {
  Save,
  Plus,
  Trash2,
  Lock,
  Download,
  FileSpreadsheet,
  FileText,
  History,
  CheckCircle2,
  Layers,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';

interface QuotationEditorProps {
  quote: Quote;
  project: Project;
  versions: QuoteVersion[];
  onSaveQuote: (updatedQuote: Quote, label?: string) => Promise<void>;
  onLockExchangeRate: (managerName: string) => Promise<void>;
  onApproveQuote: () => Promise<void>;
  onExportXlsx: () => void;
  onExportPdf: () => void;
}

export const QuotationEditor: React.FC<QuotationEditorProps> = ({
  quote,
  project,
  versions,
  onSaveQuote,
  onLockExchangeRate,
  onApproveQuote,
  onExportXlsx,
  onExportPdf,
}) => {
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(1);
  const [editedQuote, setEditedQuote] = useState<Quote>(JSON.parse(JSON.stringify(quote)));
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showVersions, setShowVersions] = useState<boolean>(false);
  const [managerName, setManagerName] = useState<string>('Manager Tan');

  // Handle inline item update
  const handleItemChange = (
    sheetIndex: number,
    roomId: string,
    itemId: string,
    field: keyof QuoteItem,
    value: any
  ) => {
    const updated = JSON.parse(JSON.stringify(editedQuote)) as Quote;
    const ws = updated.worksheets.find((w) => w.worksheetIndex === sheetIndex);
    if (!ws) return;

    const room = ws.rooms.find((r) => r.id === roomId);
    if (!room) return;

    for (const sec of room.sections) {
      const item = sec.items.find((i) => i.id === itemId);
      if (item) {
        (item as any)[field] = value;

        // Recalculate item unit price cents & total amount cents
        if (field === 'quantity' || field === 'unitPriceCents' || field === 'discountCents') {
          const qty = Math.max(1, Number(item.quantity) || 1);
          const unitCents = Math.max(0, Number(item.unitPriceCents) || 0);
          const discCents = Math.max(0, Number(item.discountCents) || 0);
          item.totalAmountCents = qty * unitCents;
          item.finalAmountCents = Math.max(0, item.totalAmountCents - discCents);
        }
        break;
      }
    }

    setEditedQuote(updated);
  };

  // Toggle item customer visibility
  const toggleVisibility = (sheetIndex: number, roomId: string, itemId: string) => {
    const updated = JSON.parse(JSON.stringify(editedQuote)) as Quote;
    const ws = updated.worksheets.find((w) => w.worksheetIndex === sheetIndex);
    if (!ws) return;
    const room = ws.rooms.find((r) => r.id === roomId);
    if (!room) return;

    for (const sec of room.sections) {
      const item = sec.items.find((i) => i.id === itemId);
      if (item) {
        item.isVisibleToCustomer = !item.isVisibleToCustomer;
        break;
      }
    }
    setEditedQuote(updated);
  };

  // Add Supplementary Item
  const handleAddSupplementary = () => {
    const newSupp: SupplementaryItem = {
      id: `supp-${Date.now()}`,
      description: 'New Custom Renovation Accessory / Installation Service',
      quantity: 1,
      unitPriceCents: 150000, // MYR 1,500.00
      totalAmountCents: 150000,
    };
    const updated = {
      ...editedQuote,
      supplementaryItems: [...editedQuote.supplementaryItems, newSupp],
    };
    setEditedQuote(updated);
  };

  // Delete Supplementary Item
  const handleDeleteSupplementary = (suppId: string) => {
    const updated = {
      ...editedQuote,
      supplementaryItems: editedQuote.supplementaryItems.filter((s) => s.id !== suppId),
    };
    setEditedQuote(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveQuote(editedQuote, `v1.${editedQuote.versionNumber + 1}-Reviewed`);
    } finally {
      setIsSaving(false);
    }
  };

  const activeWorksheet = editedQuote.worksheets.find(
    (w) => w.worksheetIndex === activeSheetIndex
  ) || editedQuote.worksheets[0];

  return (
    <div className="space-y-4">
      {/* Header Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-slate-900">Full Quotation Workspace Editor</h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {editedQuote.versionLabel}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Full 6-sheet editable workspace. Exports always use saved values from this workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Lock Exchange Rate button */}
          <button
            onClick={() => onLockExchangeRate(managerName)}
            disabled={editedQuote.exchangeRate.isLocked}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors inline-flex items-center ${
              editedQuote.exchangeRate.isLocked
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            }`}
          >
            <Lock className="w-3.5 h-3.5 mr-1.5" />
            {editedQuote.exchangeRate.isLocked
              ? `Rate Locked (1 CNY = ${editedQuote.exchangeRate.rate} MYR)`
              : 'Lock Live Exchange Rate'}
          </button>

          {/* Version History Trigger */}
          <button
            onClick={() => setShowVersions(!showVersions)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center"
          >
            <History className="w-3.5 h-3.5 mr-1.5" />
            History ({versions.length})
          </button>

          {/* Save Version button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center"
          >
            <Save className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            {isSaving ? 'Saving...' : 'Save Draft Version'}
          </button>

          {/* Export Actions */}
          <button
            onClick={onExportXlsx}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
            Export XLSX
          </button>

          <button
            onClick={onExportPdf}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* 6 Worksheet Selector Tabs */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-2 flex items-center space-x-1 overflow-x-auto text-xs">
        {[
          { idx: 1, name: '1. Whole-House Details' },
          { idx: 2, name: '2. 23 quotation details' },
          { idx: 3, name: '3. 25 Kitchen Cabinet Details' },
          { idx: 4, name: '4. 25 Custom Door Details' },
          { idx: 5, name: '5. Kitchen and Vanity Details' },
          { idx: 6, name: '6. LF Details' },
        ].map((tab) => (
          <button
            key={tab.idx}
            onClick={() => setActiveSheetIndex(tab.idx)}
            className={`px-3.5 py-2 rounded-lg font-bold whitespace-nowrap transition-all ${
              activeSheetIndex === tab.idx
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Interactive Editable Table Workspace */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="font-extrabold text-base text-slate-900">
            {activeWorksheet ? activeWorksheet.name : 'Worksheet Editor'}
          </h3>
          <span className="text-xs text-slate-500 font-mono font-semibold">
            {activeWorksheet?.rooms.length || 0} Rooms Included
          </span>
        </div>

        {activeWorksheet?.rooms.map((room) => (
          <div key={room.id} className="border border-slate-200/80 rounded-xl overflow-hidden space-y-2">
            <div className="bg-slate-900 text-white p-3 font-extrabold text-xs flex justify-between items-center">
              <span>ROOM: {room.roomNameEnglish.toUpperCase()}</span>
              <span className="bg-slate-800 text-emerald-400 font-mono px-2.5 py-0.5 rounded text-[11px] font-bold border border-slate-700">
                Room Subtotal: MYR {((room.subtotals.subtotalCents || 0) / 100).toFixed(2)}
              </span>
            </div>

            <div className="overflow-x-auto p-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase text-[10px]">
                    <th className="p-2 w-10">Visible</th>
                    <th className="p-2 w-14">Photo</th>
                    <th className="p-2 min-w-[200px]">English Product Description</th>
                    <th className="p-2 w-28">SKU</th>
                    <th className="p-2 w-32">Dimensions</th>
                    <th className="p-2 w-16">Qty</th>
                    <th className="p-2 w-28">Unit Price (MYR)</th>
                    <th className="p-2 w-28">Total (MYR)</th>
                    <th className="p-2 min-w-[150px]">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {room.sections.flatMap((sec) =>
                    sec.items.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50/80 transition-colors ${
                          !item.isVisibleToCustomer ? 'opacity-50 bg-gray-50' : ''
                        }`}
                      >
                        {/* Customer Visibility Toggle */}
                        <td className="p-2 text-center">
                          <button
                            onClick={() => toggleVisibility(activeSheetIndex, room.id, item.id)}
                            className="text-gray-500 hover:text-[#0f382c]"
                            title={item.isVisibleToCustomer ? 'Hide from customer' : 'Show to customer'}
                          >
                            {item.isVisibleToCustomer ? (
                              <Eye className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </td>

                        {/* Photo Preview */}
                        <td className="p-2">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.nameEnglish}
                              className="w-10 h-10 rounded object-cover border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                              No Pic
                            </div>
                          )}
                        </td>

                        {/* Description */}
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.nameEnglish}
                            onChange={(e) =>
                              handleItemChange(activeSheetIndex, room.id, item.id, 'nameEnglish', e.target.value)
                            }
                            className="w-full p-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#0f382c]"
                          />
                        </td>

                        {/* SKU */}
                        <td className="p-2 font-mono">
                          <input
                            type="text"
                            value={item.itemCode}
                            onChange={(e) =>
                              handleItemChange(activeSheetIndex, room.id, item.id, 'itemCode', e.target.value)
                            }
                            className="w-full p-1.5 border border-gray-200 rounded text-xs font-mono"
                          />
                        </td>

                        {/* Dimensions */}
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.dimensionText}
                            onChange={(e) =>
                              handleItemChange(activeSheetIndex, room.id, item.id, 'dimensionText', e.target.value)
                            }
                            className="w-full p-1.5 border border-gray-200 rounded text-xs"
                          />
                        </td>

                        {/* Quantity */}
                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(activeSheetIndex, room.id, item.id, 'quantity', Number(e.target.value))
                            }
                            className="w-full p-1.5 border border-gray-200 rounded text-xs text-center font-bold"
                          />
                        </td>

                        {/* Unit Price */}
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.unitPriceCents / 100}
                            onChange={(e) =>
                              handleItemChange(
                                activeSheetIndex,
                                room.id,
                                item.id,
                                'unitPriceCents',
                                Math.round(Number(e.target.value) * 100)
                              )
                            }
                            className="w-full p-1.5 border border-gray-200 rounded text-xs font-mono font-semibold"
                          />
                        </td>

                        {/* Total Amount */}
                        <td className="p-2 font-mono font-bold text-gray-900">
                          MYR {((item.finalAmountCents || 0) / 100).toFixed(2)}
                        </td>

                        {/* Notes */}
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) =>
                              handleItemChange(activeSheetIndex, room.id, item.id, 'notes', e.target.value)
                            }
                            className="w-full p-1.5 border border-gray-200 rounded text-xs text-gray-500"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Mandatory Supplementary Items Section */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <h4 className="font-bold text-xs text-[#0f382c] uppercase tracking-wider">
              Mandatory Supplementary Items & Services
            </h4>
            <button
              onClick={handleAddSupplementary}
              className="px-3 py-1 bg-[#0f382c] hover:bg-[#1b4332] text-white text-xs font-medium rounded shadow-sm inline-flex items-center"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Supplementary Row
            </button>
          </div>

          {editedQuote.supplementaryItems.length === 0 ? (
            <p className="text-xs text-gray-500 italic p-2 bg-white rounded border">
              No supplementary items.
            </p>
          ) : (
            <div className="space-y-2">
              {editedQuote.supplementaryItems.map((supp, idx) => (
                <div
                  key={supp.id}
                  className="bg-white p-2.5 rounded-lg border border-gray-200 flex items-center gap-3 text-xs"
                >
                  <input
                    type="text"
                    value={supp.description}
                    onChange={(e) => {
                      const updated = { ...editedQuote };
                      updated.supplementaryItems[idx].description = e.target.value;
                      setEditedQuote(updated);
                    }}
                    className="flex-1 p-1.5 border border-gray-200 rounded text-xs"
                    placeholder="Description..."
                  />

                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      value={supp.quantity}
                      onChange={(e) => {
                        const updated = { ...editedQuote };
                        updated.supplementaryItems[idx].quantity = Number(e.target.value);
                        updated.supplementaryItems[idx].totalAmountCents =
                          updated.supplementaryItems[idx].quantity *
                          updated.supplementaryItems[idx].unitPriceCents;
                        setEditedQuote(updated);
                      }}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs text-center font-bold"
                    />
                  </div>

                  <div className="w-32">
                    <input
                      type="number"
                      value={supp.unitPriceCents / 100}
                      onChange={(e) => {
                        const updated = { ...editedQuote };
                        updated.supplementaryItems[idx].unitPriceCents = Math.round(
                          Number(e.target.value) * 100
                        );
                        updated.supplementaryItems[idx].totalAmountCents =
                          updated.supplementaryItems[idx].quantity *
                          updated.supplementaryItems[idx].unitPriceCents;
                        setEditedQuote(updated);
                      }}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs font-mono font-semibold"
                    />
                  </div>

                  <div className="w-32 font-mono font-bold text-gray-900 text-right">
                    MYR {((supp.quantity * supp.unitPriceCents) / 100).toFixed(2)}
                  </div>

                  <button
                    onClick={() => handleDeleteSupplementary(supp.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Version History Drawer */}
      {showVersions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-xl space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-[#0f382c]">Quotation Version History</h3>
              <button
                onClick={() => setShowVersions(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {versions.map((ver) => (
                <div key={ver.id} className="p-3 border rounded-lg bg-gray-50 space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>{ver.versionLabel}</span>
                    <span className="text-gray-500 font-mono">
                      {new Date(ver.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-600">{ver.changesSummary}</p>
                  <p className="text-gray-400 text-[10px]">Saved by: {ver.createdBy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
