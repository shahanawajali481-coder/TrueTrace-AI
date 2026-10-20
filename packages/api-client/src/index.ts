import type {
  AuthResponse,
  AuthTokens,
  DashboardStats,
  PublicScamReport,
  ScanRequestPayload,
  ScanResult,
  UserProfile,
  AdminSystemHealth,
  EmailValidationResult,
  PhoneValidationResult,
} from '@truetrace/shared-types';

export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
}

export class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
}

export interface ClientConfig {
  baseUrl: string;
  storage?: StorageAdapter;
  onUnauthorized?: () => void;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class TrueTraceClient {
  private baseUrl: string;
  private storage: StorageAdapter;
  private onUnauthorized?: () => void;
  private tokenKey = 'truetrace_token';

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.storage = config.storage || new MemoryStorageAdapter();
    this.onUnauthorized = config.onUnauthorized;
  }

  public async setToken(token: string | null): Promise<void> {
    if (token) {
      await this.storage.setItem(this.tokenKey, token);
    } else {
      await this.storage.removeItem(this.tokenKey);
    }
  }

  public async getToken(): Promise<string | null> {
    return await this.storage.getItem(this.tokenKey);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const token = await this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        await this.setToken(null);
        if (this.onUnauthorized) {
          this.onUnauthorized();
        }
        throw new ApiError(401, 'Unauthorized or session expired');
      }

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }
        const message =
          (typeof errorData === 'object' && errorData?.detail) ||
          response.statusText ||
          `Request failed with status ${response.status}`;
        throw new ApiError(response.status, message, errorData);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return (await response.json()) as T;
      }
      return (await response.text()) as unknown as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(0, err.message || 'Network request failed', err);
    }
  }

  // Auth Endpoints
  public auth = {
    register: async (payload: { email: string; password: string; fullName: string }): Promise<AuthResponse> => {
      const res = await this.request<AuthResponse>('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.tokens?.accessToken) {
        await this.setToken(res.tokens.accessToken);
      }
      return res;
    },

    login: async (payload: { email: string; password: string }): Promise<AuthResponse> => {
      const res = await this.request<AuthResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.tokens?.accessToken) {
        await this.setToken(res.tokens.accessToken);
      }
      return res;
    },

    logout: async (): Promise<{ message: string }> => {
      try {
        await this.request<{ message: string }>('/api/v1/auth/logout', {
          method: 'POST',
        });
      } finally {
        await this.setToken(null);
      }
      return { message: 'Logged out successfully' };
    },

    getMe: async (): Promise<UserProfile> => {
      return await this.request<UserProfile>('/api/v1/auth/me');
    },

    updateProfile: async (payload: Partial<UserProfile>): Promise<UserProfile> => {
      return await this.request<UserProfile>('/api/v1/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },

    deleteAccount: async (): Promise<{ message: string }> => {
      const res = await this.request<{ message: string }>('/api/v1/auth/me', {
        method: 'DELETE',
      });
      await this.setToken(null);
      return res;
    },
  };

  // Scans Endpoints
  public scans = {
    scanEmail: (payload: ScanRequestPayload): Promise<ScanResult> => {
      return this.request<ScanResult>('/api/v1/scans/email', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    scanInstagram: (payload: ScanRequestPayload): Promise<ScanResult> => {
      return this.request<ScanResult>('/api/v1/scans/instagram', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    scanFacebook: (payload: ScanRequestPayload): Promise<ScanResult> => {
      return this.request<ScanResult>('/api/v1/scans/facebook', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    scanWhatsapp: (payload: ScanRequestPayload): Promise<ScanResult> => {
      return this.request<ScanResult>('/api/v1/scans/whatsapp', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    list: (params?: { page?: number; limit?: number; type?: string; riskLevel?: string }): Promise<{ scans: ScanResult[]; total: number; page: number; limit: number }> => {
      const search = new URLSearchParams();
      if (params?.page) search.set('page', params.page.toString());
      if (params?.limit) search.set('limit', params.limit.toString());
      if (params?.type) search.set('type', params.type);
      if (params?.riskLevel) search.set('risk_level', params.riskLevel);
      const query = search.toString() ? `?${search.toString()}` : '';
      return this.request<{ scans: ScanResult[]; total: number; page: number; limit: number }>(`/api/v1/scans${query}`);
    },

    getById: (scanId: string): Promise<ScanResult> => {
      return this.request<ScanResult>(`/api/v1/scans/${scanId}`);
    },

    deleteById: (scanId: string): Promise<{ success: boolean; message: string }> => {
      return this.request<{ success: boolean; message: string }>(`/api/v1/scans/${scanId}`, {
        method: 'DELETE',
      });
    },

    shareReport: (scanId: string): Promise<{ shareUrl: string; shareToken: string; expiresAt: string }> => {
      return this.request<{ shareUrl: string; shareToken: string; expiresAt: string }>(`/api/v1/scans/${scanId}/share`, {
        method: 'POST',
      });
    },

    revokeShare: (scanId: string): Promise<{ success: boolean; message: string }> => {
      return this.request<{ success: boolean; message: string }>(`/api/v1/scans/${scanId}/share`, {
        method: 'DELETE',
      });
    },

    getPdfUrl: (scanId: string): string => {
      return `${this.baseUrl}/api/v1/scans/${scanId}/export/pdf`;
    },

    getJsonUrl: (scanId: string): string => {
      return `${this.baseUrl}/api/v1/scans/${scanId}/export/json`;
    },
  };

  // Dashboard Endpoints
  public dashboard = {
    getStats: (): Promise<DashboardStats> => {
      return this.request<DashboardStats>('/api/v1/dashboard/stats');
    },
  };

  // Integration Status
  public integrations = {
    getStatus: (): Promise<DashboardStats['integrationsStatus']> => {
      return this.request<DashboardStats['integrationsStatus']>('/api/v1/integrations/status');
    },
  };

  // System Health
  public health = {
    check: (): Promise<{ status: string; timestamp: string; version: string }> => {
      return this.request<{ status: string; timestamp: string; version: string }>('/api/v1/health');
    },
  };

  // Admin Endpoints
  public admin = {
    getSystemHealth: (): Promise<AdminSystemHealth> => {
      return this.request<AdminSystemHealth>('/api/v1/admin/health');
    },
    getAuditLogs: (params?: { page?: number; limit?: number }): Promise<any> => {
      const search = new URLSearchParams();
      if (params?.page) search.set('page', params.page.toString());
      if (params?.limit) search.set('limit', params.limit.toString());
      const query = search.toString() ? `?${search.toString()}` : '';
      return this.request<any>(`/api/v1/admin/audit-logs${query}`);
    },
    getScamReports: (): Promise<PublicScamReport[]> => {
      return this.request<PublicScamReport[]>('/api/v1/admin/scam-reports');
    },
  };

  // Validation Endpoints
  public validation = {
    validateEmail: (email: string): Promise<EmailValidationResult> => {
      return this.request<EmailValidationResult>('/api/v1/validate/email', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    validatePhone: (phone: string, countryCode: string = 'US'): Promise<PhoneValidationResult> => {
      return this.request<PhoneValidationResult>('/api/v1/validate/phone', {
        method: 'POST',
        body: JSON.stringify({ phone, country_code: countryCode }),
      });
    },
  };
}
