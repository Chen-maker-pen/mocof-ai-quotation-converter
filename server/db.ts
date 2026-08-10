/**
 * MOCOF In-Memory & File-Persisted Database Store
 */

import fs from 'fs';
import path from 'path';
import {
  Project,
  Quote,
  ConversionProfile,
  ExceptionItem,
  AuditLog,
  QuoteVersion,
} from '../src/types';
import {
  DEFAULT_CONVERSION_PROFILE,
  SEED_PROJECTS,
  SEED_QUOTES,
  SEED_EXCEPTIONS,
  SEED_AUDIT_LOGS,
} from './seedData';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'mocof_db.json');

interface DbSchema {
  projects: Project[];
  quotes: Record<string, Quote>;
  exceptions: ExceptionItem[];
  auditLogs: AuditLog[];
  conversionProfile: ConversionProfile;
  quoteVersions: QuoteVersion[];
}

class Database {
  private data: DbSchema;

  constructor() {
    this.data = {
      projects: [...SEED_PROJECTS],
      quotes: { ...SEED_QUOTES },
      exceptions: [...SEED_EXCEPTIONS],
      auditLogs: [...SEED_AUDIT_LOGS],
      conversionProfile: { ...DEFAULT_CONVERSION_PROFILE },
      quoteVersions: [],
    };

    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.projects && parsed.quotes) {
          // Migrate existing local profiles when a new version adds default rules.
          this.data = {
            ...parsed,
            conversionProfile: {
              ...DEFAULT_CONVERSION_PROFILE,
              ...parsed.conversionProfile,
              bossEditingRules: String(parsed.conversionProfile?.bossEditingRules || '').includes('Determine the Area number from the number of real room')
                ? parsed.conversionProfile.bossEditingRules
                : DEFAULT_CONVERSION_PROFILE.bossEditingRules,
              areaPromptRules:
                parsed.conversionProfile?.areaPromptRules?.length > 0 &&
                !parsed.conversionProfile.areaPromptRules.some((rule: any) =>
                  String(rule.instructions || '').includes('awaiting boss row-layout differences') ||
                  String(rule.label || '').includes('standard 13-row') ||
                  String(rule.instructions || '').includes('Preserve the area-specific row positions') ||
                  !String(rule.instructions || '').includes('CHANGE THE TOP HEADINGS PROMPT:')
                )
                  ? parsed.conversionProfile.areaPromptRules
                  : DEFAULT_CONVERSION_PROFILE.areaPromptRules,
            },
          };
        }
      } else {
        this.saveToDisk();
      }
    } catch (err) {
      console.warn('Database load fallback to memory seed:', err);
    }
  }

  public saveToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save DB to disk:', err);
    }
  }

  public resetToSeed() {
    this.data = {
      projects: [...SEED_PROJECTS],
      quotes: { ...SEED_QUOTES },
      exceptions: [...SEED_EXCEPTIONS],
      auditLogs: [...SEED_AUDIT_LOGS],
      conversionProfile: { ...DEFAULT_CONVERSION_PROFILE },
      quoteVersions: [],
    };
    this.saveToDisk();
  }

  // Projects
  public getProjects(): Project[] {
    return this.data.projects;
  }

  public getProjectById(id: string): Project | undefined {
    return this.data.projects.find((p) => p.id === id);
  }

  public createProject(project: Project): Project {
    this.data.projects.unshift(project);
    this.saveToDisk();
    return project;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const idx = this.data.projects.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.data.projects[idx] = {
        ...this.data.projects[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveToDisk();
      return this.data.projects[idx];
    }
    return undefined;
  }

  // Quotes
  public getQuoteById(id: string): Quote | undefined {
    return this.data.quotes[id];
  }

  public saveQuote(quote: Quote): Quote {
    this.data.quotes[quote.id] = {
      ...quote,
      updatedAt: new Date().toISOString(),
    };
    this.saveToDisk();
    return quote;
  }

  // Exceptions
  public getExceptionsByQuoteId(quoteId: string): ExceptionItem[] {
    return this.data.exceptions.filter((e) => e.quoteId === quoteId);
  }

  public resolveException(id: string, resolvedBy: string, notes?: string): ExceptionItem | undefined {
    const exc = this.data.exceptions.find((e) => e.id === id);
    if (exc) {
      exc.resolved = true;
      exc.resolvedBy = resolvedBy;
      exc.resolvedAt = new Date().toISOString();
      exc.resolutionNotes = notes;

      // Check if all exceptions resolved for quote
      const remainingUnresolved = this.data.exceptions.filter(
        (e) => e.quoteId === exc.quoteId && !e.resolved
      );
      if (remainingUnresolved.length === 0) {
        const q = this.data.quotes[exc.quoteId];
        if (q) {
          q.status = 'Generated – Ready for Approval';
          this.updateProject(q.projectId, { status: 'Generated – Ready for Approval' });
        }
      }

      this.saveToDisk();
      return exc;
    }
    return undefined;
  }

  public addException(exc: ExceptionItem) {
    this.data.exceptions.push(exc);
    this.saveToDisk();
  }

  // Audit Logs
  public getAuditLogs(projectId?: string): AuditLog[] {
    if (projectId) {
      return this.data.auditLogs.filter((a) => a.projectId === projectId);
    }
    return this.data.auditLogs;
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const fullLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(fullLog);
    this.saveToDisk();
    return fullLog;
  }

  // Conversion Profile & Mappings
  public getConversionProfile(): ConversionProfile {
    return this.data.conversionProfile;
  }

  public updateConversionProfile(updates: Partial<ConversionProfile>): ConversionProfile {
    this.data.conversionProfile = {
      ...this.data.conversionProfile,
      ...updates,
    };
    this.saveToDisk();
    return this.data.conversionProfile;
  }

  // Quote Versions
  public getQuoteVersions(quoteId: string): QuoteVersion[] {
    return this.data.quoteVersions.filter((v) => v.quoteId === quoteId);
  }

  public addQuoteVersion(version: QuoteVersion) {
    this.data.quoteVersions.unshift(version);
    this.saveToDisk();
  }
}

export const db = new Database();
