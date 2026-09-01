import { useState, useEffect } from 'react';
import { ComplianceReportData, SupportingEvidence } from '../engine/rules';
import { INITIAL_ENFORCEMENT_RECORDS } from './sampleData';
import { Language } from './translations';

export type UserRole = 'consumer' | 'enforcement' | 'manufacturer' | 'officer' | 'landing';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'consumer' | 'enforcement' | 'manufacturer' | 'officer';
  organization?: string;
  badgeNumber?: string;
  jurisdiction?: string;
  verifiedGovtOfficer?: boolean;
  createdAt: string;
}

export interface AnonymousFeedback {
  id: string;
  comment: string;
  rating?: number; // 1 to 5
  category?: 'suggestion' | 'feature' | 'accuracy' | 'general';
  timestamp: number;
}

const STORAGE_KEY_REPORTS = 'labellex_reports_v2';
const STORAGE_KEY_ROLE = 'labellex_current_role_v2';
const STORAGE_KEY_LANG = 'labellex_lang_v2';
const STORAGE_KEY_USER = 'labellex_current_user_v2';
const STORAGE_KEY_USERS_DB = 'labellex_registered_users_v2';
const STORAGE_KEY_FEEDBACK = 'labellex_anonymous_feedback_v1';

export const INITIAL_ANONYMOUS_FEEDBACK: AnonymousFeedback[] = [
  {
    id: 'FB-9021',
    comment: 'The multi-angle scan orientation worked on my curved coffee jar label where other apps failed. Great accuracy!',
    rating: 5,
    category: 'accuracy',
    timestamp: Date.now() - 3600000 * 24 * 2
  },
  {
    id: 'FB-8842',
    comment: 'Super fast pre-market certificate generator for our packaging QA team. Saved us hours of manual cross-checking.',
    rating: 5,
    category: 'feature',
    timestamp: Date.now() - 3600000 * 24 * 1
  },
  {
    id: 'FB-7619',
    comment: 'Clear violation breakdown with legal references. Helpful for consumers to verify MRP and statutory tax disclosure.',
    rating: 4,
    category: 'general',
    timestamp: Date.now() - 3600000 * 6
  }
];

// Pre-seeded demo user directory for instant test login
export const DEFAULT_PRESET_USERS: Record<'consumer' | 'enforcement' | 'manufacturer' | 'officer', UserProfile> = {
  consumer: {
    id: 'USR-CONS-001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    role: 'consumer',
    createdAt: '2026-01-15T10:00:00Z'
  },
  enforcement: {
    id: 'USR-ENF-770',
    name: 'Central Enforcement Directorate',
    email: 'hq.surveillance@consumeraffairs.gov.in',
    role: 'enforcement',
    organization: 'Ministry of Consumer Affairs (Legal Metrology Division)',
    jurisdiction: 'National Central Repository',
    verifiedGovtOfficer: true,
    createdAt: '2026-01-01T08:00:00Z'
  },
  manufacturer: {
    id: 'USR-MFG-412',
    name: 'Priya Mehta',
    email: 'compliance@britannia.co.in',
    role: 'manufacturer',
    organization: 'Britannia Quality & Regulatory Compliance Unit',
    createdAt: '2026-02-10T11:30:00Z'
  },
  officer: {
    id: 'USR-OFF-882',
    name: 'Rajesh Varma',
    email: 'officer.rajesh@lm.gov.in',
    role: 'officer',
    badgeNumber: 'LM-MH-8821',
    jurisdiction: 'Mumbai Suburban District, Maharashtra',
    verifiedGovtOfficer: true,
    createdAt: '2026-01-10T09:00:00Z'
  }
};

class CentralStore {
  private reports: ComplianceReportData[] = [];
  private feedbacks: AnonymousFeedback[] = [];
  private currentRole: UserRole = 'landing';
  private language: Language = 'en';
  private currentUser: UserProfile | null = null;
  private registeredUsers: UserProfile[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof localStorage === 'undefined') {
      this.reports = [...INITIAL_ENFORCEMENT_RECORDS];
      this.registeredUsers = Object.values(DEFAULT_PRESET_USERS);
      return;
    }

    try {
      const savedReports = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (savedReports) {
        this.reports = JSON.parse(savedReports);
      } else {
        this.reports = [...INITIAL_ENFORCEMENT_RECORDS];
        this.saveReports();
      }

      const savedLang = localStorage.getItem(STORAGE_KEY_LANG) as Language;
      if (savedLang) this.language = savedLang;

      const savedUsers = localStorage.getItem(STORAGE_KEY_USERS_DB);
      if (savedUsers) {
        this.registeredUsers = JSON.parse(savedUsers);
      } else {
        this.registeredUsers = Object.values(DEFAULT_PRESET_USERS);
        localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(this.registeredUsers));
      }

      const savedFeedback = localStorage.getItem(STORAGE_KEY_FEEDBACK);
      if (savedFeedback) {
        this.feedbacks = JSON.parse(savedFeedback);
      } else {
        this.feedbacks = [...INITIAL_ANONYMOUS_FEEDBACK];
        this.saveFeedbacks();
      }

      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
      // Always start on landing portal selector on first load unless actively in a session
      this.currentRole = 'landing';
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
      this.reports = [...INITIAL_ENFORCEMENT_RECORDS];
      this.feedbacks = [...INITIAL_ANONYMOUS_FEEDBACK];
    }
  }

  private saveReports() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(this.reports));
    } catch (e) {
      console.warn('Error saving reports to localStorage:', e);
    }
  }

  private saveFeedbacks() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_FEEDBACK, JSON.stringify(this.feedbacks));
    } catch (e) {
      console.warn('Error saving feedbacks to localStorage:', e);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.saveReports();
    this.saveFeedbacks();
    for (const listener of this.listeners) {
      listener();
    }
  }

  // --- Authentication & RBAC ---

  public loginAsUser(user: UserProfile) {
    this.currentUser = user;
    this.currentRole = user.role;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_ROLE, user.role);
    }
    this.notify();
  }

  public signupNewUser(profile: Omit<UserProfile, 'id' | 'createdAt'>): UserProfile {
    const newUser: UserProfile = {
      ...profile,
      id: `USR-${profile.role.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    };
    this.registeredUsers = [newUser, ...this.registeredUsers];
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(this.registeredUsers));
    }
    this.loginAsUser(newUser);
    return newUser;
  }

  public logout() {
    this.currentUser = null;
    this.currentRole = 'landing';
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.setItem(STORAGE_KEY_ROLE, 'landing');
    }
    this.notify();
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  // --- Reports Management ---

  public getReports(): ComplianceReportData[] {
    return [...this.reports];
  }

  public getReportById(id: string): ComplianceReportData | undefined {
    return this.reports.find(r => r.id === id);
  }

  public getReportsBySource(source: ComplianceReportData['source']): ComplianceReportData[] {
    return this.reports.filter(r => r.source === source);
  }

  public addReport(report: ComplianceReportData) {
    // If logged in, attach user audit metadata
    if (this.currentUser) {
      report.sourceMetadata = {
        ...report.sourceMetadata,
        officerId: report.sourceMetadata?.officerId || (this.currentUser.role === 'officer' ? this.currentUser.badgeNumber : undefined),
        inspectorName: this.currentUser.name
      };
    }
    this.reports = [report, ...this.reports];
    this.notify();
  }

  public updateReport(id: string, updates: Partial<ComplianceReportData>) {
    this.reports = this.reports.map(r => (r.id === id ? { ...r, ...updates } : r));
    this.notify();
  }

  public deleteReport(id: string) {
    this.reports = this.reports.filter(r => r.id !== id);
    this.notify();
  }

  public addSupportingEvidenceToReport(
    reportId: string, 
    evidenceItem: Omit<SupportingEvidence, 'id' | 'timestamp'>
  ): SupportingEvidence {
    const newEvidence: SupportingEvidence = {
      ...evidenceItem,
      id: `EVD-${Date.now().toString().slice(-6)}`,
      timestamp: Date.now()
    };

    this.reports = this.reports.map(r => {
      if (r.id === reportId) {
        const existing = r.supportingEvidence || [];
        return {
          ...r,
          supportingEvidence: [...existing, newEvidence]
        };
      }
      return r;
    });

    this.notify();
    return newEvidence;
  }

  public reportViolationToEnforcement(reportId: string, grievanceNotes?: string): string {
    const grievanceId = `GRV-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    this.reports = this.reports.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          source: 'consumer',
          sourceMetadata: {
            ...r.sourceMetadata,
            grievanceId,
            actionTaken: 'Under Investigation' as any
          }
        };
      }
      return r;
    });
    this.notify();
    return grievanceId;
  }

  public saveOfficerInspection(
    report: ComplianceReportData, 
    officerDetails: { officerId: string; location: string; actionTaken: 'No Action' | 'Warning Issued' | 'Samples Seized' | 'Compounding Notice' }
  ) {
    const updatedReport: ComplianceReportData = {
      ...report,
      source: 'officer',
      sourceMetadata: {
        ...report.sourceMetadata,
        officerId: officerDetails.officerId,
        location: officerDetails.location,
        actionTaken: officerDetails.actionTaken,
        inspectorName: this.currentUser?.name || 'Authorized LM Officer'
      }
    };
    this.addReport(updatedReport);
  }

  public saveManufacturerCertificate(report: ComplianceReportData, batchNo: string): string {
    const certNumber = `CERT-LMPC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const updatedReport: ComplianceReportData = {
      ...report,
      source: 'manufacturer',
      sourceMetadata: {
        ...report.sourceMetadata,
        manufacturerBatch: batchNo,
        certificateNumber: certNumber
      }
    };
    this.addReport(updatedReport);
    return certNumber;
  }

  public resetToSampleData() {
    this.reports = [...INITIAL_ENFORCEMENT_RECORDS];
    this.notify();
  }

  public getCurrentRole(): UserRole {
    return this.currentRole;
  }

  public setCurrentRole(role: UserRole) {
    this.currentRole = role;
    if (role !== 'landing') {
      // Auto-assign corresponding preset profile so all tools and features are fully unlocked
      const targetRole = role === 'enforcement' ? 'enforcement' : role;
      if (DEFAULT_PRESET_USERS[targetRole as keyof typeof DEFAULT_PRESET_USERS]) {
        this.currentUser = DEFAULT_PRESET_USERS[targetRole as keyof typeof DEFAULT_PRESET_USERS];
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.currentUser));
        }
      }
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ROLE, role);
    }
    this.notify();
  }

  public getFeedbacks(): AnonymousFeedback[] {
    return this.feedbacks;
  }

  public submitFeedback(feedbackItem: { comment: string; rating?: number; category?: string }): AnonymousFeedback {
    const newFeedback: AnonymousFeedback = {
      id: `FB-${Math.floor(1000 + Math.random() * 9000)}`,
      comment: feedbackItem.comment.trim(),
      rating: feedbackItem.rating,
      category: (feedbackItem.category as any) || 'general',
      timestamp: Date.now()
    };
    this.feedbacks = [newFeedback, ...this.feedbacks];
    this.saveFeedbacks();
    this.notify();
    return newFeedback;
  }

  public getLanguage(): Language {
    return this.language;
  }

  public setLanguage(lang: Language) {
    this.language = lang;
    localStorage.setItem(STORAGE_KEY_LANG, lang);
    this.notify();
  }
}

export const sharedStore = new CentralStore();

/**
 * Custom React hook to subscribe to the shared store
 */
export function useSharedStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = sharedStore.subscribe(() => {
      setTick(t => t + 1);
    });
    return unsubscribe;
  }, []);

  return {
    reports: sharedStore.getReports(),
    feedbacks: sharedStore.getFeedbacks(),
    currentRole: sharedStore.getCurrentRole(),
    currentUser: sharedStore.getCurrentUser(),
    language: sharedStore.getLanguage(),
    setCurrentRole: (role: UserRole) => sharedStore.setCurrentRole(role),
    setLanguage: (lang: Language) => sharedStore.setLanguage(lang),
    loginAsUser: (user: UserProfile) => sharedStore.loginAsUser(user),
    signupNewUser: (profile: Omit<UserProfile, 'id' | 'createdAt'>) => sharedStore.signupNewUser(profile),
    logout: () => sharedStore.logout(),
    addReport: (report: ComplianceReportData) => sharedStore.addReport(report),
    getReportById: (id: string) => sharedStore.getReportById(id),
    addSupportingEvidenceToReport: (reportId: string, evidence: Omit<SupportingEvidence, 'id' | 'timestamp'>) => 
      sharedStore.addSupportingEvidenceToReport(reportId, evidence),
    reportViolation: (id: string, notes?: string) => sharedStore.reportViolationToEnforcement(id, notes),
    saveOfficerInspection: (report: ComplianceReportData, details: any) => sharedStore.saveOfficerInspection(report, details),
    saveManufacturerCertificate: (report: ComplianceReportData, batch: string) => sharedStore.saveManufacturerCertificate(report, batch),
    submitFeedback: (feedback: { comment: string; rating?: number; category?: string }) => sharedStore.submitFeedback(feedback),
    resetToSampleData: () => sharedStore.resetToSampleData(),
    deleteReport: (id: string) => sharedStore.deleteReport(id)
  };
}
