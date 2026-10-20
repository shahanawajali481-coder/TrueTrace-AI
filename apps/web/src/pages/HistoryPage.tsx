import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Trash2,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import type { ScanResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';

export const HistoryPage: React.FC = () => {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchScans = async () => {
    setIsLoading(true);
    try {
      const data = await api.listScans({
        page,
        limit: 10,
        type: typeFilter || undefined,
        riskLevel: riskFilter || undefined,
      });
      setScans(data.scans);
      setTotal(data.total);
    } catch (err) {
      console.error('Error fetching scan history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [page, typeFilter, riskFilter]);

  const handleDelete = async (scanId: string) => {
    if (window.confirm('Delete this report?')) {
      try {
        await api.deleteScan(scanId);
        fetchScans();
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  const totalPages = Math.ceil(total / 10) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History size={22} className="text-brand-primary" />
            Scan History & Assessments
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full auditable log of your generated identity risk evaluations.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
          >
            <option value="">All Types</option>
            <option value="EMAIL">Email</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
          >
            <option value="">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="INCONCLUSIVE">Inconclusive</option>
          </select>

          <button
            onClick={fetchScans}
            className="p-2 rounded-xl bg-navy-800 text-slate-300 hover:text-white"
            title="Refresh list"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Scans Table */}
      <div className="glass-card rounded-2xl border border-navy-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading history...</div>
        ) : scans.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <Search size={28} className="mx-auto opacity-30" />
            <p className="font-semibold text-slate-300">No matching scan reports found</p>
            <p className="text-slate-500">Try clearing filters or running a new scan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-900/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-navy-800">
                <tr>
                  <th className="py-3.5 px-4">Identifier</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Assessment</th>
                  <th className="py-3.5 px-4">Evidence Checks</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {scans.map((scan) => (
                  <tr key={scan.scan_id} className="hover:bg-navy-800/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                      {scan.masked_identifier}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-semibold text-[11px]">
                      {scan.scan_type}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={scan.risk_level} score={scan.risk_score} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {scan.evidence?.length || 0} checks logged
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(scan.created_at).toLocaleDateString()} {new Date(scan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/reports/${scan.scan_id}`}
                          className="px-2.5 py-1 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 font-medium transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(scan.scan_id)}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                          title="Delete report"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="p-4 border-t border-navy-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing {scans.length} of {total} records
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono text-slate-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
