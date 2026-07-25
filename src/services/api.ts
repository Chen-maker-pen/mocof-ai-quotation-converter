/**
 * Frontend API Service Client for MOCOF AI Integrated Quotation Converter
 */

import {
  Project,
  Quote,
  ConversionProfile,
  ExceptionItem,
  AuditLog,
  QuoteVersion,
} from '../types.js';

export interface ProjectDetailResponse {
  project: Project;
  quote: Quote;
  exceptions: ExceptionItem[];
  auditLogs: AuditLog[];
  versions: QuoteVersion[];
}

export const api = {
  // Projects
  async getProjects(): Promise<Project[]> {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async getProjectDetail(id: string): Promise<ProjectDetailResponse> {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) throw new Error('Failed to fetch project detail');
    return res.json();
  },

  async createProject(data: Partial<Project>): Promise<{ project: Project; quote: Quote }> {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  },

  // Conversion
  async convertSupplierFile(quoteId: string, file?: File): Promise<any> {
    const formData = new FormData();
    if (file) {
      formData.append('supplierFile', file);
    }

    const res = await fetch(`/api/quotes/${quoteId}/convert`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Conversion failed');
    }
    return res.json();
  },

  // Update Quote Workspace
  async updateQuote(quoteId: string, quoteData: Partial<Quote>): Promise<Quote> {
    const res = await fetch(`/api/quotes/${quoteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteData),
    });
    if (!res.ok) throw new Error('Failed to save quote');
    return res.json();
  },

  // Resolve Exception
  async resolveException(
    quoteId: string,
    exceptionId: string,
    managerName: string,
    notes?: string
  ): Promise<any> {
    const res = await fetch(`/api/quotes/${quoteId}/resolve-exception`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exceptionId, managerName, resolutionNotes: notes }),
    });
    if (!res.ok) throw new Error('Failed to resolve exception');
    return res.json();
  },

  // Lock Exchange Rate
  async lockExchangeRate(quoteId: string, managerName: string): Promise<Quote> {
    const res = await fetch(`/api/quotes/${quoteId}/lock-exchange-rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ managerName }),
    });
    if (!res.ok) throw new Error('Failed to lock exchange rate');
    return res.json();
  },

  // Approve Quote
  async approveQuote(quoteId: string): Promise<Quote> {
    const res = await fetch(`/api/quotes/${quoteId}/approve`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to approve quotation');
    }
    return res.json();
  },

  // Admin Profile
  async getAdminProfile(): Promise<ConversionProfile> {
    const res = await fetch('/api/admin/profile');
    if (!res.ok) throw new Error('Failed to fetch admin profile');
    return res.json();
  },

  async updateAdminProfile(data: Partial<ConversionProfile>): Promise<ConversionProfile> {
    const res = await fetch('/api/admin/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update admin profile');
    return res.json();
  },

  // Live Exchange Rates
  async getExchangeRates(): Promise<any> {
    const res = await fetch('/api/exchange-rates');
    if (!res.ok) throw new Error('Failed to fetch live exchange rates');
    return res.json();
  },

  // Reset to Seed
  async resetToSeed(): Promise<void> {
    await fetch('/api/seed-reset', { method: 'POST' });
  },
};
