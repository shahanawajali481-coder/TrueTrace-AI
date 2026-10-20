import type {
  AuthResponse,
  DashboardStats,
  ScanRequestPayload,
  ScanResult,
  UserProfile,
  EmailValidationResult,
  PhoneValidationResult,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

class ApiClient {
  private tokenKey = 'truetrace_auth_token';

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public setToken(token: string | null): void {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
      // Only redirect if inside an authenticated path
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        // window.location.href = '/login';
      }
      throw new Error('Authentication expired. Please sign in again.');
    }

    if (!response.ok) {
      let errorMsg = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorMsg = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch {
        // ignore
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  // Auth
  public async register(email: string, password: string, fullName: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    if (res.tokens?.access_token) {
      this.setToken(res.tokens.access_token);
    }
    return res;
  }

  public async login(email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.tokens?.access_token) {
      this.setToken(res.tokens.access_token);
    }
    return res;
  }

  public async logout(): Promise<void> {
    try {
      await this.request('/api/v1/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  public async getMe(): Promise<UserProfile> {
    return this.request<UserProfile>('/api/v1/auth/me');
  }

  public async updateProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>('/api/v1/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  public async deleteAccount(): Promise<void> {
    await this.request('/api/v1/auth/me', { method: 'DELETE' });
    this.setToken(null);
  }

  // Scans
  public async scanEmail(payload: ScanRequestPayload): Promise<ScanResult> {
    return this.request<ScanResult>('/api/v1/scans/email', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async scanInstagram(payload: ScanRequestPayload): Promise<ScanResult> {
    return this.request<ScanResult>('/api/v1/scans/instagram', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async scanFacebook(payload: ScanRequestPayload): Promise<ScanResult> {
    return this.request<ScanResult>('/api/v1/scans/facebook', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async scanWhatsapp(payload: ScanRequestPayload): Promise<ScanResult> {
    return this.request<ScanResult>('/api/v1/scans/whatsapp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async listScans(params?: { page?: number; limit?: number; type?: string; riskLevel?: string }): Promise<{ scans: ScanResult[]; total: number; page: number; limit: number }> {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', params.page.toString());
    if (params?.limit) sp.set('limit', params.limit.toString());
    if (params?.type) sp.set('type', params.type);
    if (params?.riskLevel) sp.set('risk_level', params.riskLevel);
    const qs = sp.toString() ? `?${sp.toString()}` : '';
    return this.request(`/api/v1/scans${qs}`);
  }

  public async getScanById(scanId: string, shareToken?: string): Promise<ScanResult> {
    const qs = shareToken ? `?share_token=${shareToken}` : '';
    return this.request(`/api/v1/scans/${scanId}${qs}`);
  }

  public async deleteScan(scanId: string): Promise<void> {
    await this.request(`/api/v1/scans/${scanId}`, { method: 'DELETE' });
  }

  public async shareScan(scanId: string): Promise<{ share_url: string; share_token: string }> {
    return this.request(`/api/v1/scans/${scanId}/share`, { method: 'POST' });
  }

  public async revokeShareScan(scanId: string): Promise<void> {
    await this.request(`/api/v1/scans/${scanId}/share`, { method: 'DELETE' });
  }

  public getPdfDownloadUrl(scanId: string): string {
    return `${API_BASE}/api/v1/scans/${scanId}/export/pdf`;
  }

  public getJsonDownloadUrl(scanId: string): string {
    return `${API_BASE}/api/v1/scans/${scanId}/export/json`;
  }

  // Dashboard
  public async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/api/v1/dashboard/stats');
  }

  // Integrations
  public async getIntegrations(): Promise<DashboardStats['integrations_status']> {
    return this.request('/api/v1/integrations/status');
  }

  // Admin
  public async getAdminHealth(): Promise<any> {
    return this.request('/api/v1/admin/health');
  }

  public async getAdminAuditLogs(page = 1): Promise<any> {
    return this.request(`/api/v1/admin/audit-logs?page=${page}`);
  }

  public async getAdminScamReports(): Promise<any> {
    return this.request('/api/v1/admin/scam-reports');
  }

  // Validation
  public async validateEmail(email: string): Promise<EmailValidationResult> {
    return this.request<EmailValidationResult>('/api/v1/validate/email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  public async validatePhone(phone: string, countryCode = 'US'): Promise<PhoneValidationResult> {
    return this.request<PhoneValidationResult>('/api/v1/validate/phone', {
      method: 'POST',
      body: JSON.stringify({ phone, country_code: countryCode }),
    });
  }
}

export const api = new ApiClient();
