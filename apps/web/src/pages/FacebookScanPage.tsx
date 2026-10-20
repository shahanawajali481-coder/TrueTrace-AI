import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Search, CheckCircle2, AlertTriangle, Shield, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const FacebookScanPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [urlInput, setUrlInput] = useState('');
  const [claimedBrand, setClaimedBrand] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    if (!user) {
      navigate(`/login?redirect=/facebook`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.scanFacebook({
        identifier: urlInput,
        additional_context: claimedBrand ? { claimed_name: claimedBrand } : undefined,
      });
      if (res?.scan_id) {
        navigate(`/reports/${res.scan_id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Facebook URL evaluation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-3">
          <Facebook size={14} /> Facebook Link Assessment
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Detect Phishing Links & Impersonated Facebook Pages
        </h1>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          Verify authentic Facebook hostnames, detect deceptive typo-squatted domains mimicking Meta Security Suite or page appeal notices, and query public threat records.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-navy-700/80">
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-2">
              Facebook Profile / Page / Link
            </label>
            <input
              type="text"
              required
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. https://www.facebook.com/meta.business.support.appeal..."
              className="w-full px-4 py-3.5 rounded-xl bg-navy-950 border border-navy-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-2">
              Context / Sender's Pretext (Optional)
            </label>
            <input
              type="text"
              value={claimedBrand}
              onChange={(e) => setClaimedBrand(e.target.value)}
              placeholder="e.g. Page Violation Warning, Copyright Notice, Account Suspension Appeal"
              className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-navy-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-primary"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !urlInput.trim()}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-primary hover:bg-blue-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/25 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Validating Domain Structure...
              </>
            ) : (
              <>
                <Search size={16} />
                Analyze Facebook Link
              </>
            )}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800">
          <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3">
            <CheckCircle2 size={16} /> What We Check
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>• Canonical domain validation (fb.com, facebook.com)</li>
            <li>• Detection of typo-squatting or punycode phishing links</li>
            <li>• Security/Support impersonation keywords in URL path</li>
            <li>• Public community fraud logs</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800">
          <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-3">
            <AlertTriangle size={16} /> What We Never Do
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>• Never attempt to bypass Facebook login screens</li>
            <li>• Never access private messages or private group posts</li>
            <li>• Never harvest user credentials or session cookies</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
