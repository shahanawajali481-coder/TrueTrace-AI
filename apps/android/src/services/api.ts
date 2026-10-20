import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const TOKEN_KEY = 'truetrace_secure_jwt';
const CUSTOM_URL_KEY = 'truetrace_custom_api_base_url';

/**
 * Normalizes and joins a base URL with an API endpoint path.
 * Guarantees:
 * - Trailing slashes on baseUrl are trimmed.
 * - Leading slashes on endpoint are trimmed.
 * - The `/api/v1` prefix is never duplicated and never omitted.
 */
export function joinApiUrl(baseUrl: string, endpoint: string): string {
  const cleanBase = (baseUrl || '').trim().replace(/\/+$/, '');
  const cleanEndpoint = (endpoint || '').trim().replace(/^\/+/, '');

  if (!cleanBase) {
    return cleanEndpoint ? `/${cleanEndpoint}` : '';
  }

  // Base already contains /api/v1
  if (cleanBase.endsWith('/api/v1')) {
    if (cleanEndpoint.startsWith('api/v1/')) {
      return `${cleanBase}/${cleanEndpoint.slice('api/v1/'.length)}`;
    }
    if (cleanEndpoint === 'api/v1') {
      return cleanBase;
    }
    return `${cleanBase}/${cleanEndpoint}`;
  }

  // Base does NOT end with /api/v1
  if (cleanEndpoint.startsWith('api/v1')) {
    return `${cleanBase}/${cleanEndpoint}`;
  }

  // Default join
  return `${cleanBase}/${cleanEndpoint}`;
}

/**
 * Determines the smartest default API base URL for the current environment:
 * 1. Checks build-time environment variable: process.env.EXPO_PUBLIC_API_URL.
 * 2. Checks app.json extra config (EXPO_PUBLIC_API_URL or apiBaseUrl).
 * 3. In development (__DEV__), falls back to Metro packager host or emulator loopback.
 * 4. In production standalone builds, returns empty string so a clear error is shown instead of silent network failure.
 */
export function getDefaultApiBaseUrl(): string {
  // 1. Highest priority: Build-time environment variable baked in by Expo/EAS
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // 2. Second priority: Expo app config (app.json extra)
  const configExtraUrl =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiBaseUrl;
  if (
    configExtraUrl &&
    typeof configExtraUrl === 'string' &&
    configExtraUrl.trim().length > 0 &&
    !configExtraUrl.includes('10.0.2.2') &&
    !configExtraUrl.includes('localhost') &&
    !configExtraUrl.includes('127.0.0.1')
  ) {
    return configExtraUrl.trim().replace(/\/+$/, '');
  }

  // 3. Local Development (Metro / Android emulator only in __DEV__)
  if (__DEV__) {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return `http://${ip}:8000`;
      }
    }
    return 'http://10.0.2.2:8000';
  }

  // In production builds, no hardcoded localhost/emulator fallback
  return '';
}

export class AndroidApiClient {
  private activeBaseUrl: string | null = null;

  public async getBaseUrl(): Promise<string> {
    if (this.activeBaseUrl) {
      return this.activeBaseUrl;
    }
    try {
      const stored = await SecureStore.getItemAsync(CUSTOM_URL_KEY);
      if (stored && stored.trim().length > 0) {
        this.activeBaseUrl = stored.trim().replace(/\/+$/, '');
        return this.activeBaseUrl;
      }
    } catch {
      // ignore
    }
    this.activeBaseUrl = getDefaultApiBaseUrl();
    return this.activeBaseUrl;
  }

  public async setBaseUrl(url: string): Promise<void> {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    this.activeBaseUrl = cleanUrl;
    try {
      await SecureStore.setItemAsync(CUSTOM_URL_KEY, cleanUrl);
    } catch {
      // ignore
    }
  }

  public async resetBaseUrl(): Promise<string> {
    try {
      await SecureStore.deleteItemAsync(CUSTOM_URL_KEY);
    } catch {
      // ignore
    }
    this.activeBaseUrl = getDefaultApiBaseUrl();
    return this.activeBaseUrl;
  }

  public async testConnection(targetUrl?: string): Promise<{ success: boolean; latencyMs: number; status?: string; message: string }> {
    const baseUrl = targetUrl ? targetUrl.trim().replace(/\/+$/, '') : await this.getBaseUrl();
    if (!baseUrl) {
      return {
        success: false,
        latencyMs: 0,
        message: 'No backend API URL configured. Please specify a server URL.',
      };
    }
    const start = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
      const healthUrl = joinApiUrl(baseUrl, '/api/v1/health');
      const res = await fetch(healthUrl, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      const latencyMs = Date.now() - start;
      if (res.ok) {
        const json = await res.json();
        return {
          success: true,
          latencyMs,
          status: json.status || 'healthy',
          message: `Connected (${latencyMs}ms) - DB: ${json.database || 'ok'}`,
        };
      }
      return {
        success: false,
        latencyMs,
        message: `HTTP Error ${res.status}: ${res.statusText}`,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      return {
        success: false,
        latencyMs,
        message: err.name === 'AbortError' ? 'Connection timed out (8s).' : `Network error: ${err.message || 'Cannot reach host'}`,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  public async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  public async setToken(token: string | null): Promise<void> {
    try {
      if (token) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch {
      // ignore
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getToken();
    const baseUrl = await this.getBaseUrl();
    if (!baseUrl) {
      throw new Error(
        'Backend API URL is not configured. Please build with EXPO_PUBLIC_API_URL configured, or enter the server URL in Settings.'
      );
    }
    const url = joinApiUrl(baseUrl, endpoint);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout for mobile network

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if (response.status === 401) {
        await this.setToken(null);
        throw new Error('Authentication expired. Please sign in again.');
      }

      if (!response.ok) {
        let msg = `Request failed (${response.status})`;
        try {
          const errData = await response.json();
          if (errData?.detail) {
            msg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
          }
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Network timeout. Please check your internet connection or server host.');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  // --- Auth Endpoints ---
  public async login(email: string, password: string): Promise<any> {
    const res = await this.request<any>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
    });
    if (res.tokens?.access_token) {
      await this.setToken(res.tokens.access_token);
    }
    return res;
  }

  public async register(email: string, password: string, fullName: string): Promise<any> {
    const res = await this.request<any>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password, full_name: fullName.trim() }),
    });
    if (res.tokens?.access_token) {
      await this.setToken(res.tokens.access_token);
    }
    return res;
  }

  public async logout(): Promise<void> {
    try {
      await this.request('/api/v1/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      await this.setToken(null);
    }
  }

  public async getMe(): Promise<any> {
    return this.request('/api/v1/auth/me');
  }

  public async updateProfile(data: { full_name?: string; notification_preferences?: any }): Promise<any> {
    return this.request('/api/v1/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public async deleteAccount(): Promise<void> {
    await this.request('/api/v1/auth/me', { method: 'DELETE' });
    await this.setToken(null);
  }

  // --- Pre-Validation Endpoints ---
  public async validateEmail(email: string): Promise<any> {
    return this.request('/api/v1/validate/email', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim() }),
    });
  }

  public async validatePhone(phone: string, countryCode = 'US'): Promise<any> {
    return this.request('/api/v1/validate/phone', {
      method: 'POST',
      body: JSON.stringify({ phone: phone.trim(), country_code: countryCode }),
    });
  }

  // --- Scans Endpoints ---
  public async scanEmail(identifier: string, context?: Record<string, any>): Promise<any> {
    return this.request('/api/v1/scans/email', {
      method: 'POST',
      body: JSON.stringify({
        identifier: identifier.trim(),
        additional_context: context || undefined,
      }),
    });
  }

  public async scanInstagram(identifier: string, context?: Record<string, any>): Promise<any> {
    return this.request('/api/v1/scans/instagram', {
      method: 'POST',
      body: JSON.stringify({
        identifier: identifier.trim(),
        additional_context: context || undefined,
      }),
    });
  }

  public async scanFacebook(identifier: string, context?: Record<string, any>): Promise<any> {
    return this.request('/api/v1/scans/facebook', {
      method: 'POST',
      body: JSON.stringify({
        identifier: identifier.trim(),
        additional_context: context || undefined,
      }),
    });
  }

  public async scanWhatsapp(identifier: string, context?: Record<string, any>): Promise<any> {
    return this.request('/api/v1/scans/whatsapp', {
      method: 'POST',
      body: JSON.stringify({
        identifier: identifier.trim(),
        additional_context: context || undefined,
      }),
    });
  }

  public async getScans(page = 1, limit = 20, type?: string, riskLevel?: string): Promise<any> {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    if (type) params.set('type', type);
    if (riskLevel) params.set('risk_level', riskLevel);
    return this.request(`/api/v1/scans?${params.toString()}`);
  }

  public async getScanById(scanId: string): Promise<any> {
    return this.request(`/api/v1/scans/${scanId}`);
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

  public async getDashboardStats(): Promise<any> {
    return this.request('/api/v1/dashboard/stats');
  }

  public async getPdfDownloadUrl(scanId: string): Promise<string> {
    const baseUrl = await this.getBaseUrl();
    return joinApiUrl(baseUrl, `/api/v1/scans/${scanId}/export/pdf`);
  }

  public async getJsonDownloadUrl(scanId: string): Promise<string> {
    const baseUrl = await this.getBaseUrl();
    return joinApiUrl(baseUrl, `/api/v1/scans/${scanId}/export/json`);
  }
}

export const androidApi = new AndroidApiClient();
