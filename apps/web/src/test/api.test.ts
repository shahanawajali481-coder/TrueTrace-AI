import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from '../services/api';

class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, value: string) { this.store[key] = value.toString(); }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}
globalThis.localStorage = new LocalStorageMock() as any;

describe('ApiClient Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('manages auth tokens in localStorage correctly', () => {
    expect(api.getToken()).toBeNull();

    api.setToken('test-jwt-token-12345');
    expect(api.getToken()).toBe('test-jwt-token-12345');
    expect(localStorage.getItem('truetrace_auth_token')).toBe('test-jwt-token-12345');

    api.setToken(null);
    expect(api.getToken()).toBeNull();
    expect(localStorage.getItem('truetrace_auth_token')).toBeNull();
  });

  it('formats export PDF and JSON download URLs correctly', () => {
    const pdfUrl = api.getPdfDownloadUrl('scan-uuid-999');
    expect(pdfUrl).toContain('/api/v1/scans/scan-uuid-999/export/pdf');

    const jsonUrl = api.getJsonDownloadUrl('scan-uuid-999');
    expect(jsonUrl).toContain('/api/v1/scans/scan-uuid-999/export/json');
  });

  it('sends correct payload for validateEmail', async () => {
    const mockResponse = {
      is_valid: true,
      normalized_email: 'analyst@domain.com',
      domain: 'domain.com',
      is_disposable: false,
      is_free_provider: false,
      has_dns_resolution: true,
      has_mx_records: true,
      mx_records: ['mail.domain.com'],
      has_impersonation_keywords: false,
      matched_keywords: [],
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    } as Response);

    const result = await api.validateEmail('analyst@domain.com');
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/validate/email'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'analyst@domain.com' }),
      })
    );
    expect(result.is_valid).toBe(true);
    expect(result.domain).toBe('domain.com');
  });

  it('sends correct payload for validatePhone', async () => {
    const mockResponse = {
      is_valid: true,
      is_possible: true,
      e164: '+14155552671',
      international: '+1 415-555-2671',
      national: '(415) 555-2671',
      country_code: 1,
      region_code: 'US',
      line_type: 'MOBILE',
      is_voip: false,
      is_premium_rate: false,
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    } as Response);

    const result = await api.validatePhone('+14155552671', 'US');
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/validate/phone'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ phone: '+14155552671', country_code: 'US' }),
      })
    );
    expect(result.is_valid).toBe(true);
    expect(result.e164).toBe('+14155552671');
    expect(result.line_type).toBe('MOBILE');
  });

  it('handles API errors gracefully', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ detail: 'Invalid scan identifier format' }),
    } as Response);

    await expect(api.scanEmail({ identifier: 'invalid' })).rejects.toThrow(
      'Invalid scan identifier format'
    );
  });
});
