/**
 * Google-Sheet-style customer quotation workbook
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
  BossPromptCommand,
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
  RotateCcw,
  TableProperties,
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
  const [showPromptRecipe, setShowPromptRecipe] = useState<boolean>(false);
  const [workbookMode, setWorkbookMode] = useState<'grid' | 'details'>('grid');
  const [selectedCell, setSelectedCell] = useState<string>('E1');
  const [managerName, setManagerName] = useState<string>('Manager Tan');

  const rebuildRoomTotals = (updated: Quote) => {
    updated.worksheets.forEach((worksheet) => {
      worksheet.rooms.forEach((room) => {
        room.sections.forEach((section) => {
          section.sectionTotalCents = section.items
            .filter((item) => item.isVisibleToCustomer)
            .reduce((sum, item) => sum + item.finalAmountCents, 0);
        });
        room.subtotals.subtotalCents = room.sections.reduce((sum, section) => sum + section.sectionTotalCents, 0);
        room.subtotals.itemCount = room.sections.reduce((sum, section) => sum + section.items.filter((item) => item.isVisibleToCustomer).length, 0);
      });
      worksheet.totalCents = worksheet.rooms.reduce((sum, room) => sum + room.subtotals.subtotalCents, 0);
    });
  };

  const addBossPrompt = () => {
    const updated = JSON.parse(JSON.stringify(editedQuote)) as Quote;
    updated.bossPromptCommands = [...(updated.bossPromptCommands || []), {
      id: `boss-prompt-${Date.now()}`,
      text: 'HIDE ROOM: Example room name',
      enabled: true,
    }];
    setEditedQuote(updated);
  };

  const updateBossPrompt = (id: string, changes: Partial<BossPromptCommand>) => {
    const updated = JSON.parse(JSON.stringify(editedQuote)) as Quote;
    updated.bossPromptCommands = (updated.bossPromptCommands || []).map((command) =>
      command.id === id ? { ...command, ...changes } : command
    );
    setEditedQuote(updated);
  };

  const deleteBossPrompt = (id: string) => {
    const updated = JSON.parse(JSON.stringify(editedQuote)) as Quote;
    updated.bossPromptCommands = (updated.bossPromptCommands || []).filter((command) => command.id !== id);
    setEditedQuote(updated);
  };

  /**
   * Runs boss commands from a clean baseline. This deliberately supports a
   * small, visible command language rather than pretending that arbitrary
   * prose can safely alter financial totals without a deterministic rule.
   */
  const applyBossPrompts = () => {
    const baseline = editedQuote.promptRecipeBaseline;
    const updated = JSON.parse(JSON.stringify(editedQuote)) as Quote;
    if (!baseline) {
      window.alert('This quotation was created before Prompt Recipe support. Upload the source quotation again to create a safe baseline.');
      return;
    }

    updated.worksheets = JSON.parse(JSON.stringify(baseline.worksheets));
    updated.supplementaryItems = JSON.parse(JSON.stringify(baseline.supplementaryItems));
    updated.workbookSheets = baseline.workbookSheets
      ? JSON.parse(JSON.stringify(baseline.workbookSheets))
      : updated.workbookSheets;
    const commands = (updated.bossPromptCommands || []).filter((command) => command.enabled && command.text.trim());

    commands.forEach((command) => {
      const text = command.text.trim();
      const hideRoom = text.match(/^HIDE ROOM\s*:\s*(.+)$/i);
      const showOnlyRooms = text.match(/^SHOW ONLY ROOMS\s*:\s*(.+)$/i);
      const renameRoom = text.match(/^RENAME ROOM\s*:\s*(.+?)\s*=>\s*(.+)$/i);
      const setDiscount = text.match(/^SET DISCOUNT\s*:\s*(\d+(?:\.\d+)?)%$/i);
      const removeSupplementary = text.match(/^REMOVE SUPPLEMENTARY\s*:\s*(.+)$/i);
      const addSupplementary = text.match(/^ADD SUPPLEMENTARY\s*:\s*([^|]+)\|\s*([\d.]+)\|\s*([\d.]+)\|\s*([\d.]+)$/i);

      if (hideRoom) {
        const term = hideRoom[1].toLowerCase();
        updated.worksheets.forEach((worksheet) => {
          worksheet.rooms = worksheet.rooms.filter((room) => !`${room.roomNameEnglish} ${room.roomNameChinese}`.toLowerCase().includes(term));
        });
      } else if (showOnlyRooms) {
        const allowed = showOnlyRooms[1].split(',').map((name) => name.trim().toLowerCase()).filter(Boolean);
        updated.worksheets.forEach((worksheet) => {
          worksheet.rooms = worksheet.rooms.filter((room) => allowed.some((name) => `${room.roomNameEnglish} ${room.roomNameChinese}`.toLowerCase().includes(name)));
        });
      } else if (renameRoom) {
        const from = renameRoom[1].trim().toLowerCase();
        const to = renameRoom[2].trim();
        updated.worksheets.forEach((worksheet) => worksheet.rooms.forEach((room) => {
          if (`${room.roomNameEnglish} ${room.roomNameChinese}`.toLowerCase().includes(from)) {
            room.roomNameEnglish = to;
            room.subtotals.roomName = to;
            room.sections.forEach((section) => section.items.forEach((item) => { item.roomName = to; }));
          }
        }));
      } else if (setDiscount) {
        const discountPercent = Math.min(100, Math.max(0, Number(setDiscount[1])));
        updated.worksheets.forEach((worksheet) => worksheet.rooms.forEach((room) => room.sections.forEach((section) => section.items.forEach((item) => {
          item.discountPercentOverride = discountPercent;
          item.discountCents = Math.round(item.totalAmountCents * (discountPercent / 100));
          item.finalAmountCents = Math.max(0, item.totalAmountCents - item.discountCents);
        }))));
      } else if (removeSupplementary) {
        const term = removeSupplementary[1].trim().toLowerCase();
        updated.supplementaryItems = updated.supplementaryItems.filter((item) => !item.description.toLowerCase().includes(term));
      } else if (addSupplementary) {
        const [, description, perValue, quantity, afterPrice] = addSupplementary;
        const unitPriceCents = Math.round(Number(afterPrice) * 100);
        updated.supplementaryItems.push({
          id: `supp-prompt-${Date.now()}-${updated.supplementaryItems.length}`,
          description: description.trim(), perValue: Number(perValue), quantity: Number(quantity),
          unitPriceCents, totalAmountCents: Math.round(Number(quantity) * unitPriceCents),
          notes: `Boss Prompt: ${text}`,
        });
      }
    });
    rebuildRoomTotals(updated);
    setEditedQuote(updated);
  };

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
          item.totalAmountCents = qty * unitCents;
          item.discountCents = Math.round(item.totalAmountCents * 0.2);
          item.finalAmountCents = Math.max(0, item.totalAmountCents - item.discountCents);
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
      perValue: 1,
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

  const updateGridCell = (address: string, value: string) => {
    const updated = JSON.parse(JSON.stringify(editedQuote)) as Quote;
    const sheet = updated.workbookSheets?.[0];
    const cell = sheet?.cells[address];
    if (!cell) return;
    cell.value = value;
    // A direct cell edit intentionally overrides a formula, just as typing in
    // Google Sheets replaces the previous formula in that cell.
    delete cell.formula;
    cell.kind = 'input';
    setEditedQuote(updated);
  };

  const gridSheet = editedQuote.workbookSheets?.[0];
  const gridLastRow = gridSheet ? Math.min(Math.max(...Object.values(gridSheet.cells).map((cell) => cell.row), 40), 260) : 0;
  const gridColumns = gridSheet ? Array.from({ length: gridSheet.columnCount }, (_, index) => String.fromCharCode(65 + index)) : [];

  const activeWorksheet = editedQuote.worksheets.find(
    (w) => w.worksheetIndex === activeSheetIndex
  ) || editedQuote.worksheets[0];

  const roomAmounts = (room: any) => {
    const items = room.sections.flatMap((section: any) => section.items).filter((item: QuoteItem) => item.isVisibleToCustomer);
    return {
      software: items.reduce((sum: number, item: QuoteItem) => sum + item.supplierPriceCents * item.quantity, 0),
      before: items.reduce((sum: number, item: QuoteItem) => sum + item.totalAmountCents, 0),
      after: items.reduce((sum: number, item: QuoteItem) => sum + item.finalAmountCents, 0),
    };
  };

  const supplementaryPerValue = (supp: SupplementaryItem) =>
    supp.perValue ?? Number(String(supp.notes || '').match(/[\d.]+$/)?.[0] || 0);

  // The quotation document makes the first five Supplementary After Price
  // values complimentary, while Before Price remains sqft/per × project sqft.
  // The original MOCOF Area samples use 600 sqft when a source sqft has not
  // yet been supplied; the row remains editable for manager review.
  const supplementaryAmounts = (supp: SupplementaryItem, index: number) => {
    const after = Math.max(0, supp.quantity * supp.unitPriceCents);
    const before = after > 0 ? Math.round(after / 0.8) : Math.round(supplementaryPerValue(supp) * 600 * supp.quantity * 100);
    const packagePrice = index < 5 ? 0 : after;
    return { before, after, packagePrice };
  };

  return (
    <div className="space-y-4">
      {/* Header Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-slate-900">MOCOF Customer Quotation Workbook</h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {editedQuote.versionLabel}
            </span>
            {editedQuote.detectedArea && (
              <span className="text-xs bg-blue-50 text-blue-800 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                Area {editedQuote.detectedArea}: {editedQuote.detectedArea} room{editedQuote.detectedArea === 1 ? '' : 's'} detected
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            One full editable quotation workbook. Select a sheet tab, edit cells, then export the saved customer version.
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

          <button
            onClick={() => setShowPromptRecipe(!showPromptRecipe)}
            className="px-3 py-2 bg-[#eceffc] hover:bg-[#d6dcef] border border-[#a6b5de] text-[#323970] text-xs font-semibold rounded-lg transition-colors inline-flex items-center"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#5f6faf]" />
            {showPromptRecipe ? 'Close Prompt Recipe' : 'Show Prompt Recipe'}
          </button>

          <button
            onClick={() => setWorkbookMode(workbookMode === 'grid' ? 'details' : 'grid')}
            className="px-3 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center"
          >
            <TableProperties className="w-3.5 h-3.5 mr-1.5" />
            {workbookMode === 'grid' ? 'Show Detail Forms' : 'Show Sheet Grid'}
          </button>

          {/* Save Version button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-[#7787c6] hover:bg-[#6878b7] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center"
          >
            <Save className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            {isSaving ? 'Saving...' : 'Save Draft Version'}
          </button>

          {/* Export Actions */}
          <button
            onClick={onExportXlsx}
            className="px-3 py-2 bg-[#5f6faf] hover:bg-[#323970] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
            Export XLSX
          </button>

          <button
            onClick={onExportPdf}
            className="px-3 py-2 bg-[#a6b5de] hover:bg-[#7787c6] text-[#323970] text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Google-Sheet-style worksheet tabs */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-2 flex items-center space-x-1 overflow-x-auto text-xs">
        {editedQuote.worksheets.map((tab) => (
          <button
            key={tab.worksheetIndex}
            onClick={() => setActiveSheetIndex(tab.worksheetIndex)}
            className={`px-3.5 py-2 rounded-lg font-bold whitespace-nowrap transition-all ${
              activeSheetIndex === tab.worksheetIndex
                ? 'bg-blue-800 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.worksheetIndex}. {tab.name}
          </button>
        ))}
      </div>

      {/* The quote stays editable in the main sheet; the audit column shows exactly
          which saved rules were supplied to the conversion for this version. */}
      <div className={`grid grid-cols-1 ${showPromptRecipe ? 'xl:grid-cols-[minmax(0,1fr)_380px]' : ''} gap-4 items-start`}>
      {/* Interactive Editable Table Workspace */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 space-y-6 min-w-0">
        {workbookMode === 'grid' && gridSheet ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">{gridSheet.name} — spreadsheet grid</h3>
                <p className="text-xs text-slate-500 mt-1">Direct cell editing is enabled. Column letters and row numbers match the quotation prompt document.</p>
              </div>
              <span className="font-mono text-xs rounded bg-slate-100 px-2 py-1">Selected: {selectedCell}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
              <span className="font-mono font-bold text-slate-600 w-12">{selectedCell}</span>
              <span className="font-mono text-slate-700 break-all">{gridSheet.cells[selectedCell]?.formula || gridSheet.cells[selectedCell]?.value || ''}</span>
            </div>
            <div className="overflow-auto max-h-[74vh] border border-slate-300 rounded-lg bg-white">
              <table className="border-collapse min-w-[1120px] text-xs">
                <thead className="sticky top-0 z-20 bg-slate-100 text-slate-700">
                  <tr><th className="sticky left-0 z-30 min-w-11 border border-slate-300 bg-slate-200 p-2"></th>{gridColumns.map((letter) => <th key={letter} className="min-w-28 border border-slate-300 p-2 font-bold">{letter}</th>)}</tr>
                </thead>
                <tbody>
                  {Array.from({ length: gridLastRow }, (_, index) => index + 1).map((row) => (
                    <tr key={row}>
                      <th className="sticky left-0 z-10 border border-slate-300 bg-slate-100 px-2 py-1 text-right font-mono text-slate-500">{row}</th>
                      {gridColumns.map((letter, columnIndex) => {
                        const cellAddress = `${letter}${row}`;
                        const cell = gridSheet.cells[cellAddress];
                        const isTitle = cell?.kind === 'title';
                        const isHeader = cell?.kind === 'header';
                        const isTotal = cell?.kind === 'total';
                        return <td key={cellAddress} className={`border border-slate-200 p-0 align-middle ${isTitle ? 'bg-[#0b1f3a] text-white font-bold' : isHeader ? 'bg-slate-200 font-bold' : isTotal ? 'bg-blue-50 font-bold text-red-600' : ''}`}>
                          {cell ? <input aria-label={cellAddress} value={cell.formula || cell.value} onFocus={() => setSelectedCell(cellAddress)} onChange={(event) => updateGridCell(cellAddress, event.target.value)} className={`h-8 w-full min-w-0 border-0 bg-transparent px-2 outline-none focus:bg-amber-50 focus:ring-2 focus:ring-inset focus:ring-blue-500 ${isTitle ? 'text-white' : ''} ${columnIndex >= 5 ? 'font-mono text-right' : ''}`} /> : <button aria-label={`Select ${cellAddress}`} onClick={() => setSelectedCell(cellAddress)} className="h-8 w-full text-left hover:bg-blue-50" />}
                        </td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500">Formula cells show their exact formulas. If you type in one, it becomes a manual override—exactly like Google Sheets. Save Draft Version stores these cell changes.</p>
          </div>
        ) : null}

        <div className={workbookMode === 'grid' ? 'hidden' : ''}>
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="font-extrabold text-base text-slate-900">
            {activeWorksheet ? activeWorksheet.name : 'Worksheet Editor'}
          </h3>
          <span className="text-xs text-slate-500 font-mono font-semibold">
            {activeWorksheet?.rooms.length || 0} Rooms Included
          </span>
        </div>

        {/* Supplementary belongs directly after Whole House Total, before room tables. */}
        {activeSheetIndex === 1 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-[#0b1f3a] text-white px-3 py-2.5 flex items-center justify-between">
              <h4 className="font-extrabold text-xs uppercase tracking-wide">Whole House Total</h4>
              <span className="text-[11px] font-bold">Area {editedQuote.detectedArea || activeWorksheet?.rooms.length || 0} • {activeWorksheet?.rooms.length || 0} real rooms</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[920px]">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                  <tr><th className="p-2 text-left w-12">No.</th><th className="p-2 text-left">Space</th><th className="p-2 w-28">Wall Panel m²</th><th className="p-2 w-28">Cabinet m²</th><th className="p-2 w-28">RM 49,800</th><th className="p-2 w-28">RM 79,800</th><th className="p-2 w-28">Software Price</th><th className="p-2 w-28">Before Price</th><th className="p-2 w-28">After Price</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(activeWorksheet?.rooms || []).map((room, idx) => {
                    const amounts = roomAmounts(room);
                    return <tr key={room.id}>
                      <td className="p-2 text-center font-mono">{idx + 1}</td>
                      <td className="p-2 font-semibold">{room.roomNameEnglish}{room.roomNameChinese && room.roomNameChinese !== room.roomNameEnglish ? ` // ${room.roomNameChinese}` : ''}</td>
                      <td className="p-2 text-center text-slate-400">—</td><td className="p-2 text-center text-slate-400">—</td>
                      <td className="p-2 text-right font-mono">RM {(amounts.after / 100).toFixed(2)}</td><td className="p-2 text-right font-mono">RM {(amounts.after / 100).toFixed(2)}</td>
                      <td className="p-2 text-right font-mono">RM {(amounts.software / 100).toFixed(2)}</td><td className="p-2 text-right font-mono">RM {(amounts.before / 100).toFixed(2)}</td><td className="p-2 text-right font-mono font-bold">RM {(amounts.after / 100).toFixed(2)}</td>
                    </tr>;
                  })}
                  {['Extra m²', 'Curve', 'Wall Panel', 'Aluminium Frame', 'Add-on finishing', 'Deduct Design Fee'].map((name, idx) => <tr key={name} className="bg-slate-50"><td className="p-2 text-center font-mono">{(activeWorksheet?.rooms.length || 0) + idx + 1}</td><td className="p-2">{name}</td><td colSpan={4} className="p-2"></td><td className="p-2 text-right font-mono">RM 0.00</td><td className="p-2 text-right font-mono">RM 0.00</td><td className="p-2 text-right font-mono">RM 0.00</td></tr>)}
                  <tr className="bg-slate-200 font-extrabold"><td colSpan={4} className="p-2 text-right">Total Price:</td><td className="p-2 text-right font-mono">RM {((activeWorksheet?.rooms || []).reduce((sum, room) => sum + roomAmounts(room).after, 0) / 100).toFixed(2)}</td><td className="p-2 text-right font-mono">RM {((activeWorksheet?.rooms || []).reduce((sum, room) => sum + roomAmounts(room).after, 0) / 100).toFixed(2)}</td><td className="p-2 text-right font-mono">RM {((activeWorksheet?.rooms || []).reduce((sum, room) => sum + roomAmounts(room).software, 0) / 100).toFixed(2)}</td><td className="p-2 text-right font-mono">RM {((activeWorksheet?.rooms || []).reduce((sum, room) => sum + roomAmounts(room).before, 0) / 100).toFixed(2)}</td><td className="p-2 text-right font-mono">RM {((activeWorksheet?.rooms || []).reduce((sum, room) => sum + roomAmounts(room).after, 0) / 100).toFixed(2)}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSheetIndex === 1 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-[#0b1f3a] text-white px-3 py-2.5 flex items-center justify-between">
              <h4 className="font-extrabold text-xs uppercase tracking-wide">Supplementary</h4>
              <button onClick={handleAddSupplementary} className="px-2.5 py-1 bg-[#183b6b] hover:bg-[#050505] rounded text-[11px] font-bold">
                <Plus className="w-3.5 h-3.5 inline mr-1" />Add row
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[1120px]">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                  <tr><th className="p-2 text-left w-12">No.</th><th className="p-2 text-left">Item</th><th className="p-2 w-28">sqft / per</th><th className="p-2 w-24">Qty / per</th><th className="p-2 w-28">RM 49,800</th><th className="p-2 w-28">RM 79,800</th><th className="p-2 w-32">Before Price</th><th className="p-2 w-32">After Price</th><th className="p-2 w-12"></th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {editedQuote.supplementaryItems.map((supp, idx) => {
                    const amounts = supplementaryAmounts(supp, idx);
                    return <tr key={supp.id}>
                      <td className="p-2 text-center font-mono">{idx + 1}</td>
                      <td className="p-2"><input value={supp.description} onChange={(e) => { const updated = JSON.parse(JSON.stringify(editedQuote)) as Quote; updated.supplementaryItems[idx].description = e.target.value; setEditedQuote(updated); }} className="w-full border border-slate-200 rounded px-2 py-1" /></td>
                      <td className="p-2"><input type="number" min="0" value={supplementaryPerValue(supp)} onChange={(e) => { const updated = JSON.parse(JSON.stringify(editedQuote)) as Quote; updated.supplementaryItems[idx].perValue = Number(e.target.value); setEditedQuote(updated); }} className="w-full border border-slate-200 rounded px-2 py-1 text-center" /></td>
                      <td className="p-2"><input type="number" min="0" value={supp.quantity} onChange={(e) => { const updated = JSON.parse(JSON.stringify(editedQuote)) as Quote; updated.supplementaryItems[idx].quantity = Number(e.target.value); updated.supplementaryItems[idx].totalAmountCents = updated.supplementaryItems[idx].quantity * updated.supplementaryItems[idx].unitPriceCents; setEditedQuote(updated); }} className="w-full border border-slate-200 rounded px-2 py-1 text-center" /></td>
                      <td className="p-2"><input type="number" value={supp.unitPriceCents / 100} onChange={(e) => { const updated = JSON.parse(JSON.stringify(editedQuote)) as Quote; updated.supplementaryItems[idx].unitPriceCents = Math.round(Number(e.target.value) * 100); updated.supplementaryItems[idx].totalAmountCents = updated.supplementaryItems[idx].quantity * updated.supplementaryItems[idx].unitPriceCents; setEditedQuote(updated); }} className="w-full border border-slate-200 rounded px-2 py-1 font-mono" /></td>
                      <td className="p-2 text-right font-mono">RM {(amounts.packagePrice / 100).toFixed(2)}</td>
                      <td className="p-2 text-right font-mono">RM {(amounts.before / 100).toFixed(2)}</td>
                      <td className="p-2 text-right font-mono font-bold">RM {(amounts.after / 100).toFixed(2)}</td>
                      <td className="p-2 text-center"><button onClick={() => handleDeleteSupplementary(supp.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>;
                  })}
                  {editedQuote.supplementaryItems.length > 0 && (() => {
                    const totals = editedQuote.supplementaryItems.reduce((sum, supp, index) => {
                      const amounts = supplementaryAmounts(supp, index);
                      sum.package += amounts.packagePrice; sum.before += amounts.before; sum.after += amounts.after;
                      return sum;
                    }, { package: 0, before: 0, after: 0 });
                    const wholeAfter = (activeWorksheet?.rooms || []).reduce((sum, room) => sum + roomAmounts(room).after, 0);
                    return <>
                      <tr className="bg-slate-200 font-extrabold"><td colSpan={4} className="p-2 text-right">Total Supplementary:</td><td className="p-2 text-right font-mono">RM {(totals.package / 100).toFixed(2)}</td><td className="p-2 text-right font-mono">RM {(totals.package / 100).toFixed(2)}</td><td className="p-2 text-right font-mono">RM {(totals.before / 100).toFixed(2)}</td><td className="p-2 text-right font-mono">RM {(totals.after / 100).toFixed(2)}</td><td></td></tr>
                      <tr className="bg-[#0b1f3a] text-white font-extrabold text-sm"><td colSpan={4} className="p-2 text-right">Total Whole House Price with Supplementary Items:</td><td className="p-2 text-right font-mono">RM {((wholeAfter + totals.package) / 100).toFixed(2)}</td><td className="p-2 text-right font-mono">RM {((wholeAfter + totals.package) / 100).toFixed(2)}</td><td className="p-2 text-right font-mono">RM {((wholeAfter + totals.before) / 100).toFixed(2)}</td><td className="p-2 text-right font-mono">RM {((wholeAfter + totals.after) / 100).toFixed(2)}</td><td></td></tr>
                    </>;
                  })()}
                  {editedQuote.supplementaryItems.length === 0 && <tr><td colSpan={9} className="p-3 text-slate-500 italic">No supplementary items found in the uploaded workbook.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeWorksheet?.rooms.map((room) => (
          <div key={room.id} className="border border-slate-200/80 rounded-xl overflow-hidden space-y-2">
            <div className="bg-[#0b1f3a] text-white p-3 font-extrabold text-xs flex justify-between items-center">
              <span>{room.roomNameEnglish}{room.roomNameChinese && room.roomNameChinese !== room.roomNameEnglish ? ` // ${room.roomNameChinese}` : ''}</span>
              <span className="bg-black/30 text-white font-mono px-2.5 py-0.5 rounded text-[11px] font-bold border border-white/25">
                Room Subtotal: MYR {((room.subtotals.subtotalCents || 0) / 100).toFixed(2)}
              </span>
            </div>

            <div className="overflow-x-auto p-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase text-[10px]">
                    <th className="p-2 w-10">No.</th>
                    <th className="p-2 w-14">Product PIC</th>
                    <th className="p-2 w-28">Combi</th>
                    <th className="p-2 min-w-[200px]">Name</th>
                    <th className="p-2 w-28">Model</th>
                    <th className="p-2 w-32">WDH</th>
                    <th className="p-2 w-16">Qty</th>
                    <th className="p-2 w-28">Before Price</th>
                    <th className="p-2 w-28">After Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {room.sections.flatMap((sec) => [
                    <tr key={`${sec.id}-title`} className="bg-slate-100 border-y border-slate-200">
                      <td colSpan={9} className="px-2 py-1.5 text-[11px] font-extrabold text-slate-700">
                        {sec.sectionName || 'Cabinet Table'}
                      </td>
                    </tr>,
                    ...sec.items.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50/80 transition-colors ${
                          !item.isVisibleToCustomer ? 'opacity-50 bg-gray-50' : ''
                        }`}
                      >
                        {/* No. and customer-visibility toggle */}
                        <td className="p-2 text-center">
                          <button
                            onClick={() => toggleVisibility(activeSheetIndex, room.id, item.id)}
                            className="text-gray-500 hover:text-[#0f382c]"
                            title={item.isVisibleToCustomer ? 'Hide from customer' : 'Show to customer'}
                          >
                            {item.isVisibleToCustomer ? (
                              <span className="inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-emerald-600" />{item.combi || item.id.split('-').slice(-1)[0]}</span>
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

                        {/* Combi */}
                        <td className="p-2">
                          <input type="text" value={item.combi || ''} onChange={(e) => handleItemChange(activeSheetIndex, room.id, item.id, 'combi', e.target.value)} className="w-full p-1.5 border border-gray-200 rounded text-xs" />
                        </td>

                        {/* Name */}
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

                        {/* Model */}
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

                        {/* WDH */}
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

                        {/* Before Price */}
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

                        {/* After Price */}
                        <td className="p-2 font-mono font-bold text-gray-900">
                          MYR {((item.finalAmountCents || 0) / 100).toFixed(2)}
                        </td>

                      </tr>
                    )),
                    <tr key={`${sec.id}-total`} className="bg-[#e7eafa] font-extrabold">
                      <td colSpan={7} className="p-2 text-right">{sec.sectionName?.includes('Accessories') ? 'Accessories Total Price:' : sec.sectionName?.includes('Wall Panel') ? 'Wall Panel Total Price:' : 'Cabinet Total Price:'}</td>
                      <td className="p-2 text-right font-mono">RM {(sec.items.filter((item) => item.isVisibleToCustomer).reduce((sum, item) => sum + item.totalAmountCents, 0) / 100).toFixed(2)}</td>
                      <td className="p-2 text-right font-mono">RM {(sec.items.filter((item) => item.isVisibleToCustomer).reduce((sum, item) => sum + item.finalAmountCents, 0) / 100).toFixed(2)}</td>
                    </tr>,
                  ])}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Mandatory Supplementary Items Section */}
        <div className="hidden bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <h4 className="font-bold text-xs text-[#0f382c] uppercase tracking-wider">
              Mandatory Supplementary Items & Services
            </h4>
            <button
              onClick={handleAddSupplementary}
              className="px-3 py-1 bg-[#d6dcef] hover:bg-[#e7eafa] text-emerald-950 text-xs font-medium rounded shadow-sm inline-flex items-center"
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
      </div>

      {showPromptRecipe && <aside className="xl:sticky xl:top-4 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#7787c6] to-[#5f6faf] text-white px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="font-extrabold text-sm">Prompt Recipe</h3>
            </div>
            <button onClick={() => setShowPromptRecipe(false)} className="p-1 rounded hover:bg-white/30" title="Close prompt recipe">×</button>
          </div>
          <p className="text-[11px] text-blue-100 mt-1">
            Area document prompts are protected. Boss commands are editable and rebuild this quotation from its preserved baseline.
          </p>
        </div>

        <div className="p-3 border-b border-slate-100 bg-cyan-50/50 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-[11px] uppercase tracking-wide font-extrabold text-emerald-700">Boss Custom Prompts</h4>
            <button onClick={addBossPrompt} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold"><Plus className="w-3 h-3 inline mr-1" />Add</button>
          </div>
          <p className="text-[10px] leading-4 text-slate-600">Supported commands: <b>HIDE ROOM: name</b>; <b>SHOW ONLY ROOMS: room, room</b>; <b>RENAME ROOM: old =&gt; new</b>; <b>SET DISCOUNT: 20%</b>; <b>REMOVE SUPPLEMENTARY: name</b>; <b>ADD SUPPLEMENTARY: name | sqft/per | qty | after price</b>.</p>
          {(editedQuote.bossPromptCommands || []).map((command) => (
            <div key={command.id} className="flex gap-2 items-start">
              <input type="checkbox" checked={command.enabled} onChange={(e) => updateBossPrompt(command.id, { enabled: e.target.checked })} className="mt-2 accent-emerald-600" title="Enable this prompt" />
              <textarea value={command.text} onChange={(e) => updateBossPrompt(command.id, { text: e.target.value })} rows={2} className="flex-1 text-xs p-2 border border-slate-200 rounded resize-y" />
              <button onClick={() => deleteBossPrompt(command.id)} className="mt-1 p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete prompt"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <button onClick={applyBossPrompts} className="w-full px-3 py-2 bg-[#5f6faf] hover:bg-[#4e5d99] text-white rounded-lg text-xs font-extrabold inline-flex items-center justify-center"><RotateCcw className="w-3.5 h-3.5 mr-1.5" />Apply Prompts to Table</button>
        </div>

        <div className="max-h-[52vh] overflow-y-auto divide-y divide-slate-100">
          <div className="p-3 bg-slate-50 flex items-center justify-between"><span className="text-[11px] uppercase tracking-wide font-extrabold text-slate-700">Area Document Audit</span><span className="text-[10px] text-slate-500">Read-only base</span></div>
          {(editedQuote.promptTrace || []).map((prompt, index) => (
            <div key={`${index}-${prompt.slice(0, 20)}`} className="p-3">
              <div className="text-[10px] uppercase tracking-wide font-bold text-emerald-700 mb-1">
                {index === 0 ? 'Analysis' : index === 1 ? 'Selected quotation document' : `Quotation document prompt ${String(index - 1).padStart(2, '0')}`}
              </div>
              <p className="text-xs leading-5 text-slate-700 whitespace-pre-wrap">{prompt}</p>
            </div>
          ))}
          {(!editedQuote.promptTrace || editedQuote.promptTrace.length === 0) && (
            <p className="p-4 text-xs leading-5 text-slate-500">
              This quotation was created before prompt tracing was enabled. Convert the raw Chinese workbook again to create an auditable prompt trace.
            </p>
          )}
        </div>
      </aside>}
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
