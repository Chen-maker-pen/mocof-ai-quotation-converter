/**
 * MOCOF AI Integrated Quotation Converter Main React Application
 */

import React, { useState, useEffect } from 'react';
import { api } from './services/api.js';
import {
  Project,
  Quote,
  ExceptionItem,
  AuditLog,
  QuoteVersion,
  ConversionProfile,
} from './types.js';
import { Navbar } from './components/Navbar.tsx';
import { UploadView } from './components/UploadView.tsx';
import { ConversionCustomerDetails } from './components/UploadView.tsx';
import { QuotationEditor } from './components/QuotationEditor.tsx';
import { AdminProfile } from './components/AdminProfile.tsx';
import { TestRunner } from './components/TestRunner.tsx';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'conversion' | 'editor' | 'admin' | 'tests'>('upload');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [versions, setVersions] = useState<QuoteVersion[]>([]);
  const [profile, setProfile] = useState<ConversionProfile | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Initial Load
  useEffect(() => {
    loadProfile();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
      if (data.length > 0 && !currentProject) {
        selectProject(data[0].id);
      }
    } catch (err: any) {
      console.error('Error loading projects:', err);
    }
  };

  const loadProfile = async () => {
    try {
      const prof = await api.getAdminProfile();
      setProfile(prof);
    } catch (err: any) {
      console.error('Error loading admin profile:', err);
    }
  };

  const selectProject = async (projectId: string) => {
    try {
      const detail = await api.getProjectDetail(projectId);
      setCurrentProject(detail.project);
      setCurrentQuote(detail.quote);
      setExceptions(detail.exceptions);
      setAuditLogs(detail.auditLogs);
      setVersions(detail.versions);
    } catch (err: any) {
      showToast('Failed to load project details', 'error');
    }
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      const res = await api.createProject(projectData);
      showToast(`Created project ${res.project.quotationNumber}`);
      await loadProjects();
      await selectProject(res.project.id);
      setActiveTab('upload');
    } catch (err: any) {
      showToast('Failed to create project', 'error');
    }
  };

  const handleProcessFile = async (file?: File, selectedArea?: number, details?: ConversionCustomerDetails) => {
    setIsProcessing(true);
    setConversionError(null);
    try {
      if (!file) throw new Error('Choose the original Chinese supplier .xlsx or .pdf file first.');
      if (!selectedArea || selectedArea < 1 || selectedArea > 10) throw new Error('Choose the quotation Area (1–10) before conversion.');
      if (!details?.customerName || !details.customerAddress || !Number.isFinite(details.customerBudget) || details.customerBudget < 0 || !details.customerSqft || details.customerSqft <= 0) throw new Error('Enter customer name, address, budget and sqft before conversion.');

      // Vercel only queues the job. GitHub Actions runs the selected Area
      // recipe in the background, so a slow Gemini/workbook conversion does
      // not hit the Vercel serverless timeout.
      const sourceName = file.name.replace(/\.[^.]+$/, '') || 'New Chinese Supplier Quotation';
      const queued = await api.createPersistentConversionJob(file, {
        name: sourceName,
        customerName: details.customerName,
        customerPhone: '',
        customerEmail: '',
        projectAddress: details.customerAddress,
        customerBudget: details.customerBudget,
        currency: details.currency,
        selectedArea,
        customerSqft: details.customerSqft,
      });

      const started = Date.now();
      const maxWaitMs = 30 * 60 * 1000;
      while (Date.now() - started < maxWaitMs) {
        await new Promise((resolve) => window.setTimeout(resolve, 4_000));
        const update = await api.getPersistentConversionJob(queued.job.id);
        if (update.job.status === 'failed') {
          throw new Error(update.job.error || 'Background conversion failed.');
        }
        if (update.job.status !== 'completed') continue;

        const result = update.result;
        if (!result?.project || !result?.quote) {
          throw new Error('The background job finished but its customer quotation result is unavailable.');
        }
        setCurrentProject(result.project);
        setCurrentQuote(result.quote);
        setExceptions(result.exceptions || []);
        setVersions([]);
        showToast('Automatic conversion completed successfully!');
        // The normal workflow opens the editable customer quotation workbook
        // immediately. Source/audit panels are not part of the customer editor.
        setActiveTab('editor');
        return;
      }

      throw new Error('Conversion is still running. Keep this page open and try again shortly.');
    } catch (err: any) {
      const message = err.message || 'Conversion failed';
      setConversionError(message);
      showToast(message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveQuote = async (updatedQuote: Quote, label?: string) => {
    if (!currentQuote) return;
    try {
      const saved = await api.updateQuote(currentQuote.id, {
        ...updatedQuote,
        versionLabel: label,
      });
      setCurrentQuote(saved);
      showToast('Quotation saved successfully!');
      await loadProjects();
      if (currentProject) await selectProject(currentProject.id);
    } catch (err: any) {
      showToast('Failed to save quotation', 'error');
    }
  };

  const handleResolveException = async (exceptionId: string) => {
    if (!currentQuote) return;
    try {
      await api.resolveException(currentQuote.id, exceptionId, 'Manager Tan', 'Approved terminology mapping.');
      showToast('Exception resolved successfully!');
      if (currentProject) await selectProject(currentProject.id);
    } catch (err: any) {
      showToast('Failed to resolve exception', 'error');
    }
  };

  const handleLockExchangeRate = async (managerName: string) => {
    if (!currentQuote) return;
    try {
      const updated = await api.lockExchangeRate(currentQuote.id, managerName);
      setCurrentQuote(updated);
      showToast(`Exchange rate locked at 1 CNY = ${updated.exchangeRate.rate} MYR`);
      if (currentProject) await selectProject(currentProject.id);
    } catch (err: any) {
      showToast('Failed to lock exchange rate', 'error');
    }
  };

  const handleApproveQuote = async () => {
    if (!currentQuote) return;
    try {
      const approved = await api.approveQuote(currentQuote.id);
      setCurrentQuote(approved);
      showToast('Quotation approved for customer export!');
      await loadProjects();
      if (currentProject) await selectProject(currentProject.id);
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    }
  };

  const handleExport = async (format: 'xlsx' | 'pdf') => {
    if (!currentQuote || !currentProject) {
      showToast('Open a customer quotation before exporting.', 'error');
      return;
    }

    try {
      showToast(`Preparing customer ${format.toUpperCase()} export...`);
      const response = await fetch(`/api/exports/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote: currentQuote, project: currentProject }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        let detail = '';
        if (contentType.includes('application/json')) {
          const error = await response.json().catch(() => null);
          detail = error?.detail || error?.error || '';
        } else {
          detail = await response.text();
        }
        throw new Error(detail || `${format.toUpperCase()} export failed (HTTP ${response.status})`);
      }

      const file = await response.blob();
      if (file.size === 0) throw new Error('The server returned an empty export file.');

      const objectUrl = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = format === 'xlsx'
        ? currentQuote.preservedTemplateWorkbook?.outputFileName
          || `MOCOF_Quotation_${currentProject.quotationNumber || 'Customer_Quote'}.xlsx`
        : `MOCOF_Quotation_${currentProject.quotationNumber || 'Customer_Quote'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      showToast(`Customer ${format.toUpperCase()} downloaded successfully!`);
    } catch (err: any) {
      console.error(`${format.toUpperCase()} export failed:`, err);
      showToast(err.message || `Failed to generate ${format.toUpperCase()} export`, 'error');
    }
  };

  const handleExportXlsx = () => void handleExport('xlsx');
  const handleExportPdf = () => void handleExport('pdf');

  const handleUpdateAdminProfile = async (updated: Partial<ConversionProfile>) => {
    try {
      const prof = await api.updateAdminProfile(updated);
      setProfile(prof);
      showToast('Conversion profile updated successfully!');
    } catch (err: any) {
      showToast('Failed to update admin profile', 'error');
    }
  };

  const handleResetSeed = async () => {
    try {
      await api.resetToSeed();
      showToast('Database reset to seed state.');
      await loadProjects();
      await loadProfile();
    } catch (err: any) {
      showToast('Failed to reset seed data', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col antialiased">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 max-w-md w-full p-4 rounded-xl shadow-2xl border flex items-center justify-between text-xs font-semibold backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'error'
              ? 'bg-rose-900/95 text-white border-rose-700 shadow-rose-950/20'
              : 'bg-[#0b1f3a]/95 text-white border-[#9eacc0] shadow-black/20'
          }`}
        >
          <div className="flex items-center space-x-3">
            {notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-300 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            )}
            <span className="leading-snug">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white p-1 rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main App Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projectName={currentProject?.name}
        quotationNumber={currentProject?.quotationNumber}
        onResetSeed={handleResetSeed}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeTab === 'upload' && (
          <UploadView
            onProcessFile={handleProcessFile}
            isProcessing={isProcessing}
            conversionError={conversionError}
            currentProjectName={currentProject?.name}
            quotationNumber={currentProject?.quotationNumber}
          />
        )}

        {activeTab === 'editor' && currentQuote && currentProject && (
          <QuotationEditor
            quote={currentQuote}
            project={currentProject}
            versions={versions}
            onSaveQuote={handleSaveQuote}
            onLockExchangeRate={handleLockExchangeRate}
            onApproveQuote={handleApproveQuote}
            onExportXlsx={handleExportXlsx}
            onExportPdf={handleExportPdf}
          />
        )}

        {activeTab === 'admin' && profile && (
          <AdminProfile
            profile={profile}
            onUpdateProfile={handleUpdateAdminProfile}
          />
        )}

        {activeTab === 'tests' && <TestRunner />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p className="font-medium tracking-wide">MOCOF SDN BHD • AI Integrated Chinese-to-English Customer Quotation System</p>
      </footer>
    </div>
  );
}
