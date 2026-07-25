/**
 * Navbar Component with MOCOF Branding and Navigation Tabs
 */

import React from 'react';
import {
  UploadCloud,
  Layers,
  Edit3,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'upload' | 'conversion' | 'editor' | 'admin' | 'tests';
  setActiveTab: (tab: 'dashboard' | 'upload' | 'conversion' | 'editor' | 'admin' | 'tests') => void;
  projectName?: string;
  quotationNumber?: string;
  onResetSeed: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  projectName,
  quotationNumber,
  onResetSeed,
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('upload')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-extrabold text-emerald-400 text-xl tracking-wider shadow-inner">
              M
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white font-sans">MOCOF</span>
                <span className="bg-emerald-500/15 text-emerald-300 text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-400/20 font-semibold tracking-wide uppercase">
                  AI Integrated
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">Quotation Converter System</p>
            </div>
          </div>

          {/* Active Context Banner */}
          {quotationNumber && (
            <div className="hidden md:flex items-center space-x-2.5 bg-slate-800/80 px-3.5 py-1.5 rounded-lg border border-slate-700/60 text-xs">
              <span className="text-emerald-400 font-semibold">Active:</span>
              <span className="text-white font-mono font-bold">{quotationNumber}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 truncate max-w-[220px] font-medium">{projectName}</span>
            </div>
          )}

          {/* Nav Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'upload'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/40'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span className="hidden sm:inline">New quotation</span>
            </button>

            <button
              onClick={() => setActiveTab('conversion')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'conversion'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/40'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Review</span>
            </button>

            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'editor'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/40'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Full Editor</span>
            </button>

          </nav>
        </div>
      </div>
    </header>
  );
};
