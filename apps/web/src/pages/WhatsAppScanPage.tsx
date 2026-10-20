import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Search, CheckCircle2, AlertTriangle, Shield, Loader2, Sparkles, Check, X, Radio } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { PhoneValidationResult } from '../types';

export const WhatsAppScanPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [phoneInput, setPhoneInput] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<PhoneValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuickValidate = async () => {
    if (!phoneInput.trim()) return;
    setIsValidating(true);
    setError(null);
    try {
      const result = await api.validatePhone(phoneInput, countryCode);
      setValidationResult(result);
    } catch (err: any) {
      setError(err.message || 'Phone validation request failed.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;

    if (!user) {
      navigate(`/login?redirect=/whatsapp`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.scanWhatsapp({
        identifier: phoneInput,
        additional_context: { country_code: countryCode },
      });
      if (res?.scan_id) {
        navigate(`/reports/${res.scan_id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Phone analysis failed. Please verify format.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-3">
          <Phone size={14} /> WhatsApp & Phone Risk Analyzer
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Verify International Phone Numbers & VoIP Line Types
        </h1>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          Validate number syntax against ITU-T E.164 specifications, classify virtual VoIP and burner lines, resolve operating carrier and geographic numbering regions, and cross-reference public scam complaint feeds.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-navy-700/80">
        <form onSubmit={handleScan} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2">
                Default Country
              </label>
              <select
                value={countryCode}
                onChange={(e) => {
                  setCountryCode(e.target.value);
                  setValidationResult(null);
                }}
                className="w-full px-3 py-3 rounded-xl bg-navy-950 border border-navy-700 text-slate-100 text-sm focus:outline-none focus:border-brand-primary"
              >
                <option value="US">United States (+1)</option>
                <option value="GB">United Kingdom (+44)</option>
                <option value="IN">India (+91)</option>
                <option value="CA">Canada (+1)</option>
                <option value="AU">Australia (+61)</option>
                <option value="DE">Germany (+49)</option>
                <option value="FR">France (+33)</option>
                <option value="NG">Nigeria (+234)</option>
                <option value="BR">Brazil (+55)</option>
                <option value="AE">UAE (+971)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-200 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phoneInput}
                onChange={(e) => {
                  setPhoneInput(e.target.value);
                  setValidationResult(null);
                }}
                placeholder="+1 415 555 2671 or local format"
                className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-navy-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-primary font-mono"
              />
            </div>
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
                : validationResult.is_voip || validationResult.is_premium_rate
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            }`}>
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5">
                  {validationResult.is_valid ? <Check size={15} className="text-emerald-400" /> : <X size={15} className="text-red-400" />}
                  {validationResult.is_valid ? `Valid ITU-T E.164: ${validationResult.international || validationResult.e164}` : 'Invalid Telephone Pattern'}
                </span>
                <span className="text-[11px] opacity-75">{validationResult.region_description || 'Global'}</span>
              </div>

              {validationResult.is_valid && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="bg-navy-950/60 p-2 rounded-lg border border-navy-800">
                    <span className="block opacity-60">Line Type</span>
                    <strong className={validationResult.is_voip ? 'text-amber-400' : 'text-emerald-400'}>
                      {validationResult.line_type}
                    </strong>
                  </div>
                  <div className="bg-navy-950/60 p-2 rounded-lg border border-navy-800">
                    <span className="block opacity-60">Carrier</span>
                    <strong className="text-slate-100 truncate block">
                      {validationResult.carrier_name || 'Unassigned'}
                    </strong>
                  </div>
                  <div className="bg-navy-950/60 p-2 rounded-lg border border-navy-800">
                    <span className="block opacity-60">Standard E.164</span>
                    <strong className="text-slate-100 font-mono">
                      {validationResult.e164 || 'N/A'}
                    </strong>
                  </div>
                  <div className="bg-navy-950/60 p-2 rounded-lg border border-navy-800">
                    <span className="block opacity-60">VoIP Burner Risk</span>
                    <strong className={validationResult.is_voip ? 'text-amber-400' : 'text-emerald-400'}>
                      {validationResult.is_voip ? 'High (Virtual IP)' : 'Standard Telecom'}
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
              disabled={isLoading || !phoneInput.trim()}
              className="px-6 py-3 rounded-xl bg-brand-primary hover:bg-blue-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/25 disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Running Full Telephony Assessment...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Analyze Phone Number
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleQuickValidate}
              disabled={isValidating || !phoneInput.trim()}
              className="px-5 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 border border-navy-700 text-slate-200 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {isValidating ? (
                <>
                  <Loader2 size={15} className="animate-spin text-emerald-400" />
                  Validating Number Plan...
                </>
              ) : (
                <>
                  <Sparkles size={15} className="text-emerald-400" />
                  Quick Validate
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800">
          <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3">
            <CheckCircle2 size={16} /> Authoritative Telecom Data
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>• E.164 global normalization and validity check</li>
            <li>• Line type classification: Mobile, Landline, VoIP, Premium</li>
            <li>• Geographic allocation and region attribution</li>
            <li>• Carrier operating metadata</li>
            <li>• Known scam and spam incident logs</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800">
          <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-3">
            <AlertTriangle size={16} /> Privacy Boundaries
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>• We do not access private WhatsApp messages or chats</li>
            <li>• We do not retrieve device contacts or live GPS locations</li>
            <li>• A valid number does not prove who is on the other end</li>
            <li>• We never claim WhatsApp presence without authorized Meta verification</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
