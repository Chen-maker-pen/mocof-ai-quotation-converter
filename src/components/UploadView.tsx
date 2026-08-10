/**
 * Upload View Component with Automatic Processing Progress
 */

import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
  Sparkles,
  Layers,
  Zap,
  ShieldCheck,
} from 'lucide-react';

interface UploadViewProps {
  onProcessFile: (file?: File) => Promise<void>;
  isProcessing: boolean;
  currentProjectName?: string;
  quotationNumber?: string;
}

// Vercel Functions reject request bodies above 4.5 MB.  Keep a little safety
// margin so the user gets an immediate, understandable message instead of a
// generic Vercel 413 error. Local development has no such deployment limit.
const VERCEL_UPLOAD_SAFE_MAX_BYTES = 4 * 1024 * 1024;

export const UploadView: React.FC<UploadViewProps> = ({
  onProcessFile,
  isProcessing,
  currentProjectName,
  quotationNumber,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  const processingSteps = [
    { label: 'Reading Chinese XLSX worksheets or PDF quotation pages', icon: FileSpreadsheet },
    { label: 'Extracting Embedded Product Photos & Drawing Anchors', icon: Layers },
    { label: 'Applying AI Gemini Terminology & Mappings Profile', icon: Sparkles },
    { label: 'Executing Deterministic Integer Price & Exchange Calculations', icon: Zap },
    { label: 'Scanning Exception Flags & Whole-House Total Reconciliation', icon: ShieldCheck },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > VERCEL_UPLOAD_SAFE_MAX_BYTES) {
        alert('This file is larger than 4 MB. Vercel rejects uploads above 4.5 MB. Please export a smaller XLSX/PDF or use the local version of MOCOF for this file.');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > VERCEL_UPLOAD_SAFE_MAX_BYTES) {
        alert('This file is larger than 4 MB. Vercel rejects uploads above 4.5 MB. Please export a smaller XLSX/PDF or use the local version of MOCOF for this file.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const startConversion = async (fileToUse?: File) => {
    // Simulate step progress visual feedback
    setActiveStep(1);
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < 5 ? prev + 1 : prev));
    }, 700);

    try {
      await onProcessFile(fileToUse || selectedFile || undefined);
    } finally {
      clearInterval(interval);
      setActiveStep(5);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Focused flow header */}
      <div className="bg-gradient-to-br from-[#183b6b] via-[#0b1f3a] to-[#050505] text-white p-6 rounded-xl shadow-lg shadow-black/20 border border-[#183b6b] space-y-2">
        <div className="flex items-center justify-between">
          <span className="bg-white/10 text-white text-xs px-3 py-0.5 rounded-full border border-white/60 font-semibold tracking-wide">
            Step 1 of 3: Upload source quotation
          </span>
          <span className="text-xs text-slate-200 font-medium">Chinese supplier file → customer-ready quotation</span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight">Upload the raw Chinese quotation</h2>
        <p className="text-xs text-slate-200 font-normal leading-relaxed">
          Upload a Chinese supplier workbook (.xlsx) or quotation PDF. The system converts it into MOCOF's editable English customer format.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-white border-2 border-dashed rounded-xl p-8 text-center transition-all shadow-xs ${
          dragActive
            ? 'border-[#183b6b] bg-slate-50 scale-[1.01]'
            : selectedFile
            ? 'border-[#183b6b] bg-slate-50'
            : 'border-slate-300 hover:border-slate-400 bg-white'
        }`}
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 border border-slate-200">
            <UploadCloud className="w-8 h-8 text-slate-800" />
          </div>

          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {selectedFile ? selectedFile.name : 'Upload Chinese Supplier Quotation File'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Upload the original supplier workbook (.xlsx) or quotation PDF (up to 4 MB on the web app). XLSX product photos are preserved; PDF items are extracted by Gemini and flagged if a source image is unavailable.
            </p>
          </div>

          {!isProcessing && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <label className="cursor-pointer inline-flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors">
                Browse File
                <input
                  type="file"
                  accept=".xlsx,.pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => startConversion()}
                disabled={!selectedFile}
                className="inline-flex items-center px-5 py-2.5 bg-[#0b1f3a] hover:bg-[#183b6b] text-white text-xs font-semibold rounded-lg shadow-sm shadow-black/20 transition-colors"
              >
                <Sparkles className="w-4 h-4 mr-1.5 text-white" />
                {selectedFile ? 'Convert to Customer Quotation' : 'Choose an XLSX or PDF file first'}
              </button>
            </div>
          )}
        </div>
      </div>

      {!isProcessing && <p className="text-center text-xs text-slate-500">Step 2: AI converts the quotation. Step 3: review, edit if needed, and export PDF or Excel.</p>}

      {/* Real-Time Processing Progress Panel */}
      {isProcessing && (
        <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-md space-y-4">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Converting Quotation to MOCOF English Format...
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                AI and server deterministic rules engine operating in real-time
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            {processingSteps.map((step, idx) => {
              const StepIcon = step.icon;
              const isDone = activeStep > idx + 1;
              const isCurrent = activeStep === idx + 1;

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg border text-xs font-semibold transition-all ${
                    isDone
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                      : isCurrent
                      ? 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <StepIcon className="w-4 h-4" />
                    <span>{step.label}</span>
                  </div>

                  {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {isCurrent && <Loader2 className="w-4 h-4 animate-spin text-amber-600" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
