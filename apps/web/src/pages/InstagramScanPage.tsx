import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram, Search, CheckCircle2, AlertTriangle, Shield, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const InstagramScanPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [handle, setHandle] = useState('');
  const [claimedBrand, setClaimedBrand] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) return;

    if (!user) {
      navigate(`/login?redirect=/instagram`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.scanInstagram({
        identifier: handle,
        additional_context: claimedBrand ? { claimed_name: claimedBrand } : undefined,
      });
      if (res?.scan_id) {
        navigate(`/reports/${res.scan_id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Instagram analysis failed. Please check handle format.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 text-xs font-semibold mb-3">
          <Instagram size={14} /> Instagram Profile Assessment
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Inspect Instagram Profiles for Impersonation Patterns
        </h1>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          Analyze handle syntax, detect spoofed customer service or recovery keywords, examine automated bot generation patterns, and query community scam registries.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-navy-700/80">
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-2">
              Instagram Username or Profile URL
            </label>
            <input
              type="text"
              required
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="e.g. @support_official_team or https://instagram.com/handle"
              className="w-full px-4 py-3.5 rounded-xl bg-navy-950 border border-navy-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-2">
              Claimed Brand or Entity (Optional)
            </label>
            <input
              type="text"
              value={claimedBrand}
              onChange={(e) => setClaimedBrand(e.target.value)}
              placeholder="e.g., Apple Support, Netflix Billing, Meta Agent"
              className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-navy-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-primary"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Used to compare handle discrepancy against legitimate known corporate handles.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !handle.trim()}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-primary hover:bg-blue-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/25 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Scanning Indicators...
              </>
            ) : (
              <>
                <Search size={16} />
                Evaluate Profile Risk
              </>
            )}
          </button>
        </form>
      </div>

      <div className="p-6 rounded-2xl bg-navy-900/40 border border-navy-800 text-xs text-slate-300 space-y-2">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2 text-sm">
          <Shield size={16} className="text-brand-primary" /> Ethical Data Policy Notice
        </h3>
        <p>
          TrueTrace AI operates under strict platform compliance. We do not bypass login restrictions, scrape private accounts, or attempt to extract hidden email addresses, passwords, or direct messages. Assessments represent public structural indicators only.
        </p>
      </div>
    </div>
  );
};
