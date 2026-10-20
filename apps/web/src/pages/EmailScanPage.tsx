import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Search, CheckCircle2, AlertTriangle, Shield, Loader2, Sparkles, Check, X, Server } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { EmailValidationResult } from '../types';

export const EmailScanPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<EmailValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuickValidate = async () => {
    if (!emailInput.trim()) return;
    setIsValidating(true);
    setError(null);
    try {
      const result = await api.validateEmail(emailInput);
      setValidationResult(result);
    } catch (err: any) {
      setError(err.message || 'Validation service request failed.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    if (!user) {
      navigate(`/login?redirect=/email`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.scanEmail({ identifier: emailInput });
      if (res?.scan_id) {
        navigate(`/reports/${res.scan_id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Email analysis failed. Please check the address format.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold mb-3">
          <Mail size={14} /> Email Risk Analyzer
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Assess Email Authenticity & Routing Hygiene
        </h1>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          Evaluate email syntax against RFC 5322, inspect live DNS and MX mail exchanger records, check curated disposable domain blocklists, and detect known phishing patterns.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-navy-700/80">
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-2">
              Email Address to Verify
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setValidationResult(null);
                }}
                placeholder="e.g., billing-support@paypal-security-update.com"
                className="w-full px-4 py-3.5 rounded-xl bg-navy-950 border border-navy-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-primary"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              We never send unsolicited emails or spam the address. Analysis is strictly passive and authoritative.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Quick Validation Results Preview */}
          {validationResult && (
            <div className={`p-4 rounded-xl border text-xs space-y-2.5 transition-all ${
              !validationResult.is_valid
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : validationResult.is_disposable || validationResult.has_impersonation_keywords
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            }`}>
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5">
                  {validationResult.is_valid ? <Check size={15} className="text-emerald-400" /> : <X size={15} className="text-red-400" />}
                  {validationResult.is_valid ? 'Syntax Conforms to RFC 5322' : 'Invalid Email Syntax'}
                </span>
                <span className="text-[11px] opacity-75">{validationResult.domain || 'No Domain'}</span>
              </div>

              {validationResult.is_valid && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="bg-navy-950/60 p-2 rounded-lg border border-navy-800">
                    <span className="block opacity-60">Disposable Box</span>
                    <strong className={validationResult.is_disposable ? 'text-amber-400' : 'text-emerald-400'}>
                      {validationResult.is_disposable ? 'Yes (Burner)' : 'No (Legit)'}
                    </strong>
                  </div>
                  <div className="bg-navy-950/60 p-2 rounded-lg border border-navy-800">
                    <span className="block opacity-60">MX Records</span>
                    <strong className={validationResult.has_mx_records ? 'text-emerald-400' : 'text-amber-400'}>
                      {validationResult.has_mx_records ? `${validationResult.mx_records.length} Found` : 'None'}
                    </strong>
                  </div>
                  <div className="bg-navy-950/60 p-2 rounded-lg border border-navy-800">
                    <span className="block opacity-60">DNS Resolution</span>
                    <strong className={validationResult.has_dns_resolution ? 'text-emerald-400' : 'text-amber-400'}>
                      {validationResult.has_dns_resolution ? 'Active A/AAAA' : 'NXDOMAIN / Unresolved'}
                    </strong>
                  </div>
                  <div className="bg-navy-950/60 p-2 rounded-lg border border-navy-800">
                    <span className="block opacity-60">Impersonation</span>
                    <strong className={validationResult.has_impersonation_keywords ? 'text-red-400' : 'text-emerald-400'}>
                      {validationResult.has_impersonation_keywords ? 'Warning (Keywords)' : 'None Detected'}
                    </strong>
                  </div>
                </div>
              )}

              {validationResult.error && (
                <p className="text-red-400 pt-1 font-mono text-[11px]">{validationResult.error}</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading || !emailInput.trim()}
              className="px-6 py-3 rounded-xl bg-brand-primary hover:bg-blue-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/25 disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating Full Audit Report...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Analyze Email Address
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleQuickValidate}
              disabled={isValidating || !emailInput.trim()}
              className="px-5 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 border border-navy-700 text-slate-200 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {isValidating ? (
                <>
                  <Loader2 size={15} className="animate-spin text-cyan-400" />
                  Checking MX & Syntax...
                </>
              ) : (
                <>
                  <Sparkles size={15} className="text-cyan-400" />
                  Quick Validate
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Verification Capabilities & Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800">
          <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3">
            <CheckCircle2 size={16} /> Performed Checks
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>• RFC 5322 strict syntax normalization</li>
            <li>• Authoritative domain A/AAAA DNS resolution</li>
            <li>• Mail Exchange (MX) server lookup and reachability</li>
            <li>• Known disposable and burner domain matching</li>
            <li>• Authority and support keyword spoofing detection</li>
            <li>• Public community fraud incident matching</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800">
          <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-3">
            <AlertTriangle size={16} /> Important Caveats
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>• Valid syntax does not prove an individual mailbox exists</li>
            <li>• Valid MX records do not guarantee the owner is honest</li>
            <li>• We do not perform SMTP recipient enumeration (harvester prevention)</li>
            <li>• DNS server timeouts are treated as inconclusive, not malicious</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
