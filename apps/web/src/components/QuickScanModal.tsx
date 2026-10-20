import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Instagram, Facebook, Phone, Search, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import type { ScanType } from '../types';

interface QuickScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: ScanType;
}

export const QuickScanModal: React.FC<QuickScanModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'EMAIL',
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ScanType>(defaultType);
  const [identifier, setIdentifier] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [claimedName, setClaimedName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (activeTab === 'EMAIL') {
        result = await api.scanEmail({ identifier });
      } else if (activeTab === 'INSTAGRAM') {
        result = await api.scanInstagram({
          identifier,
          additional_context: claimedName ? { claimed_name: claimedName } : undefined,
        });
      } else if (activeTab === 'FACEBOOK') {
        result = await api.scanFacebook({
          identifier,
          additional_context: claimedName ? { claimed_name: claimedName } : undefined,
        });
      } else if (activeTab === 'WHATSAPP') {
        result = await api.scanWhatsapp({
          identifier,
          additional_context: { country_code: countryCode },
        });
      }

      if (result?.scan_id) {
        onClose();
        navigate(`/reports/${result.scan_id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Scan evaluation failed. Please verify the input and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'EMAIL':
        return 'e.g., support-alert@paypa1-security.com';
      case 'INSTAGRAM':
        return 'e.g., @official_support_care or instagram.com/user';
      case 'FACEBOOK':
        return 'e.g., facebook.com/profile.php?id=1000...';
      case 'WHATSAPP':
        return 'e.g., +1 415 555 2671';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-navy-900 border border-navy-700 shadow-2xl p-6 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-navy-800 transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Search size={20} className="text-brand-primary" />
          TrueTrace Quick Risk Scan
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Perform immediate evidence-based risk assessment on suspicious digital signals.
        </p>

        {/* Scan Type Tabs */}
        <div className="grid grid-cols-4 gap-2 mt-5 p-1 rounded-xl bg-navy-950 border border-navy-800">
          <button
            type="button"
            onClick={() => { setActiveTab('EMAIL'); setIdentifier(''); setError(null); }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'EMAIL' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail size={16} className="mb-1" />
            Email
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('INSTAGRAM'); setIdentifier(''); setError(null); }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'INSTAGRAM' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Instagram size={16} className="mb-1" />
            Instagram
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('FACEBOOK'); setIdentifier(''); setError(null); }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'FACEBOOK' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Facebook size={16} className="mb-1" />
            Facebook
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('WHATSAPP'); setIdentifier(''); setError(null); }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'WHATSAPP' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone size={16} className="mb-1" />
            WhatsApp
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Target {activeTab.charAt(0) + activeTab.slice(1).toLowerCase()} Identifier
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-navy-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
              />
            </div>
          </div>

          {activeTab === 'WHATSAPP' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Default Country Code (if unstated)
              </label>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-slate-200 text-xs focus:outline-none focus:border-brand-primary"
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
              </select>
            </div>
          )}

          {(activeTab === 'INSTAGRAM' || activeTab === 'FACEBOOK') && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Claimed Entity / Brand (Optional Context)
              </label>
              <input
                type="text"
                value={claimedName}
                onChange={(e) => setClaimedName(e.target.value)}
                placeholder="e.g. Bank Support, Customer Care, Celebrity Name"
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-slate-200 text-xs focus:outline-none focus:border-brand-primary"
              />
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-navy-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !identifier.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-brand-primary hover:bg-blue-600 text-white shadow-lg shadow-brand-primary/25 disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing Signals...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Run Assessment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
