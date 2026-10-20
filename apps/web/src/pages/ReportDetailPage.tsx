import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Download,
  Share2,
  Trash2,
  ArrowLeft,
  FileText,
  Copy,
  Check,
  AlertTriangle,
  Info,
  Calendar,
  Lock,
  Printer,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { ScanResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { RiskMeter } from '../components/RiskMeter';
import { EvidenceTable } from '../components/EvidenceTable';

export const ReportDetailPage: React.FC = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const [searchParams] = useSearchParams();
  const shareToken = searchParams.get('token') || undefined;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [scan, setScan] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sharing state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (!scanId) return;
    const fetchReport = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getScanById(scanId, shareToken);
        setScan(data);
        if (data.is_shared && data.share_token) {
          setShareUrl(`${window.location.origin}/reports/${data.scan_id}?token=${data.share_token}`);
        }
      } catch (err: any) {
        setError(err.message || 'Unable to load report. It may not exist or require authentication.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [scanId, shareToken]);

  const handleShare = async () => {
    if (!scan) return;
    setIsSharing(true);
    try {
      const res = await api.shareScan(scan.scan_id);
      const fullUrl = `${window.location.origin}/reports/${scan.scan_id}?token=${res.share_token}`;
      setShareUrl(fullUrl);
      setScan({ ...scan, is_shared: true, share_token: res.share_token });
      setShareModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Failed to generate share link');
    } finally {
      setIsSharing(false);
    }
  };

  const handleRevokeShare = async () => {
    if (!scan) return;
    try {
      await api.revokeShareScan(scan.scan_id);
      setShareUrl(null);
      setScan({ ...scan, is_shared: false, share_token: null });
      setShareModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to revoke link');
    }
  };

  const handleDelete = async () => {
    if (!scan) return;
    if (window.confirm('Are you sure you want to permanently delete this risk assessment report?')) {
      try {
        await api.deleteScan(scan.scan_id);
        navigate('/dashboard');
      } catch (err: any) {
        alert(err.message || 'Failed to delete scan');
      }
    }
  };

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 size={32} className="animate-spin text-brand-primary" />
        <p className="text-xs text-slate-400">Loading audit report...</p>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle size={24} />
        </div>
        <h2 className="text-xl font-bold text-white">Report Inaccessible</h2>
        <p className="text-xs text-slate-400">{error || 'This assessment report could not be found.'}</p>
        <Link
          to="/"
          className="inline-block px-4 py-2 rounded-xl bg-navy-800 text-xs font-semibold text-slate-200 hover:bg-navy-700"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-800 pb-4">
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {/* Print */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 text-slate-300 hover:text-white text-xs transition-colors"
            title="Print report"
          >
            <Printer size={14} /> Print
          </button>

          {/* JSON Export */}
          <a
            href={api.getJsonDownloadUrl(scan.scan_id)}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 text-slate-300 hover:text-white text-xs transition-colors"
          >
            <FileText size={14} /> Export JSON
          </a>

          {/* PDF Download */}
          <a
            href={api.getPdfDownloadUrl(scan.scan_id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-primary/20 text-brand-primary border border-brand-primary/30 hover:bg-brand-primary/30 text-xs font-semibold transition-colors"
          >
            <Download size={14} /> Download PDF
          </a>

          {/* Share */}
          {user && user.id === scan.user_id && (
            <button
              onClick={() => {
                if (scan.is_shared && shareUrl) {
                  setShareModalOpen(true);
                } else {
                  handleShare();
                }
              }}
              disabled={isSharing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-violet/20 text-brand-violet border border-brand-violet/30 hover:bg-brand-violet/30 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Share2 size={14} />
              {scan.is_shared ? 'Manage Sharing' : 'Share Report'}
            </button>
          )}

          {/* Delete */}
          {user && user.id === scan.user_id && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete report"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Report Header Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-navy-700/80">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-navy-800 text-slate-300 border border-navy-700">
                {scan.scan_type} Assessment
              </span>
              <RiskBadge level={scan.risk_level} score={scan.risk_score} size="md" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono break-all">
              {scan.masked_identifier}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1 font-mono">
                ID: {scan.scan_id.slice(0, 13)}...
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(scan.created_at).toLocaleString()}
              </span>
              {scan.is_shared && (
                <span className="text-brand-violet font-medium flex items-center gap-1">
                  <ExternalLink size={12} /> Shared Link Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Risk Meter Component */}
        <RiskMeter
          score={scan.risk_score}
          level={scan.risk_level}
          confidence={scan.confidence_explanation}
        />

        {/* Executive Summary */}
        <div className="mt-6 p-4 rounded-xl bg-navy-950/70 border border-navy-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Executive Summary
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed">{scan.summary}</p>
        </div>
      </div>

      {/* Auditable Evidence Table */}
      <EvidenceTable evidence={scan.evidence} />

      {/* Recommended Safety Actions & Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommended Actions */}
        <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800">
          <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3">
            <Shield size={16} /> Recommended Defensive Actions
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {(scan.recommendations || []).map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Methodological Limitations */}
        <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
            <Info size={16} className="text-brand-primary" /> Audit Limitations & Disclosure
          </h3>
          <ul className="space-y-2 text-xs text-slate-400">
            {(scan.limitations || []).map((lim, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-slate-500 font-bold shrink-0">•</span>
                <span>{lim}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-navy-900 border border-navy-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Share2 size={16} className="text-brand-violet" />
                Share Risk Assessment
              </h3>
              <button
                onClick={() => setShareModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Anyone with this revocable link can view this risk assessment report with masked personal identifiers.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl || ''}
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-slate-200 text-xs font-mono select-all focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 rounded-xl bg-brand-primary text-white text-xs font-medium flex items-center gap-1 hover:bg-blue-600 transition-colors shrink-0"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-navy-800">
              <button
                onClick={handleRevokeShare}
                className="text-xs text-red-400 hover:underline"
              >
                Revoke Link Access
              </button>
              <button
                onClick={() => setShareModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-navy-800 text-xs text-slate-300 hover:bg-navy-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
