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
  check_id: string;
  name: string;
  status: EvidenceStatus;
  finding: string;
  source: string;
  timestamp: string;
  reliability: number;
  risk_contribution: number;
  limitations?: string | null;
  details?: Record<string, any>;
}

export interface ScanResult {
  scan_id: string;
  user_id: string;
  scan_type: ScanType;
  target_identifier: string;
  masked_identifier: string;
  risk_score: number;
  risk_level: RiskLevel;
  summary: string;
  confidence_explanation: string;
  evidence: EvidenceRecord[];
  limitations: string[];
  recommendations: string[];
  created_at: string;
  completed_at: string;
  share_token?: string | null;
  is_shared?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at: string;
  notification_preferences?: {
    scanCompleted: boolean;
    securityAlerts: boolean;
    productUpdates: boolean;
  };
}

export interface AuthResponse {
  user: UserProfile;
  tokens: {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
}

export interface DashboardStats {
  total_scans: number;
  email_scans: number;
  social_scans: number;
  phone_scans: number;
  low_risk_count: number;
  medium_risk_count: number;
  high_risk_count: number;
  inconclusive_count: number;
  recent_activity: ScanResult[];
  risk_distribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  scans_by_date: Array<{
    date: string;
    count: number;
  }>;
  integrations_status: Array<{
    name: string;
    provider: string;
    category: string;
    status: 'operational' | 'limited' | 'unconfigured' | 'offline';
    last_checked: string;
    notes: string;
  }>;
}

export interface ScanRequestPayload {
  identifier: string;
  additional_context?: {
    claimed_name?: string;
    country_code?: string;
    suspected_impersonation?: string;
    message_snippet?: string;
  };
}

export interface EmailValidationResult {
  is_valid: boolean;
  normalized_email?: string | null;
  domain?: string | null;
  local_part?: string | null;
  is_disposable: boolean;
  is_free_provider: boolean;
  has_dns_resolution: boolean;
  has_mx_records: boolean;
  mx_records: string[];
  has_impersonation_keywords: boolean;
  matched_keywords: string[];
  error?: string | null;
  details?: Record<string, any>;
}

export interface PhoneValidationResult {
  is_valid: boolean;
  is_possible: boolean;
  e164?: string | null;
  international?: string | null;
  national?: string | null;
  country_code?: number | null;
  region_code?: string | null;
  region_description?: string | null;
  carrier_name?: string | null;
  line_type: string;
  is_voip: boolean;
  is_premium_rate: boolean;
  error?: string | null;
  details?: Record<string, any>;
}

