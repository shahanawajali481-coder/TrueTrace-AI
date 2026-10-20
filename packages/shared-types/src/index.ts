/**
 * TrueTrace AI - Shared Type Definitions
 * Core data contracts used across Web, Android, Desktop, and API Clients
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'INCONCLUSIVE';

export type ScanType = 'EMAIL' | 'INSTAGRAM' | 'FACEBOOK' | 'WHATSAPP';

export type EvidenceStatus =
  | 'CONFIRMED'
  | 'SUSPICIOUS'
  | 'INFO'
  | 'UNAVAILABLE'
  | 'FAILED';

export interface EvidenceRecord {
  id: string;
  checkId: string;
  name: string;
  status: EvidenceStatus;
  finding: string;
  source: string;
  timestamp: string;
  reliability: number; // 0.0 to 1.0 scale
  riskContribution: number; // Points added to risk score
  limitations?: string | null;
  details?: Record<string, any>;
}

export interface ScanResult {
  scanId: string;
  userId: string;
  scanType: ScanType;
  targetIdentifier: string;
  maskedIdentifier: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  summary: string;
  confidenceExplanation: string;
  evidence: EvidenceRecord[];
  limitations: string[];
  recommendations: string[];
  createdAt: string;
  completedAt: string;
  shareToken?: string | null;
  isShared?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  createdAt: string;
  notificationPreferences?: {
    scanCompleted: boolean;
    securityAlerts: boolean;
    productUpdates: boolean;
  };
}

export interface AuthTokens {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

export interface DashboardStats {
  totalScans: number;
  emailScans: number;
  socialScans: number;
  phoneScans: number;
  lowRiskCount: number;
  mediumRiskCount: number;
  highRiskCount: number;
  inconclusiveCount: number;
  recentActivity: ScanResult[];
  riskDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  scansByDate: Array<{
    date: string;
    count: number;
  }>;
  integrationsStatus: Array<{
    name: string;
    provider: string;
    category: 'dns' | 'disposable' | 'reputation' | 'social' | 'intelligence' | 'llm';
    status: 'operational' | 'limited' | 'unconfigured' | 'offline';
    lastChecked: string;
    notes: string;
  }>;
}

export interface ScanRequestPayload {
  identifier: string;
  additionalContext?: {
    claimedName?: string;
    suspectedImpersonationOf?: string;
    messageSnippet?: string;
    platformDetails?: Record<string, any>;
  };
}

export interface PublicScamReport {
  id: string;
  targetIdentifier: string;
  targetType: ScanType;
  description: string;
  reportedDate: string;
  source: string;
  verified: boolean;
}

export interface AdminSystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: 'connected' | 'error';
  version: string;
  uptimeSeconds: number;
  activeUsers: number;
  totalScansRecorded: number;
  queueDepth: number;
  systemMemoryMb: number;
}

export interface EmailValidationResult {
  isValid: boolean;
  normalizedEmail?: string | null;
  domain?: string | null;
  localPart?: string | null;
  isDisposable: boolean;
  isFreeProvider: boolean;
  hasDnsResolution: boolean;
  hasMxRecords: boolean;
  mxRecords: string[];
  hasImpersonationKeywords: boolean;
  matchedKeywords: string[];
  error?: string | null;
  details?: Record<string, any>;
}

export interface PhoneValidationResult {
  isValid: boolean;
  isPossible: boolean;
  e164?: string | null;
  international?: string | null;
  national?: string | null;
  countryCode?: number | null;
  regionCode?: string | null;
  regionDescription?: string | null;
  carrierName?: string | null;
  lineType: string;
  isVoip: boolean;
  isPremiumRate: boolean;
  error?: string | null;
  details?: Record<string, any>;
}

