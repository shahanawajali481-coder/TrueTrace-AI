import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Mail,
  Instagram,
  Facebook,
  Phone,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  TrendingUp,
  Activity,
  Layers,
  ArrowRight,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { DashboardStats, ScanResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { QuickScanModal } from '../components/QuickScanModal';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quickScanOpen, setQuickScanOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-card border border-navy-700/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            Welcome back, {user?.full_name || 'Investigator'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time security telemetry scoped strictly to your account.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-navy-800 text-slate-300 hover:text-white border border-navy-700 transition-colors disabled:opacity-50"
            title="Refresh statistics"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => setQuickScanOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-blue-600 text-white text-xs font-semibold shadow-lg shadow-brand-primary/20 transition-all"
          >
            <Plus size={16} />
            New Assessment
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* 8 Primary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Scans */}
        <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800/80">
          <span className="text-[11px] font-medium text-slate-400 block truncate">Total Scans</span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">
            {stats?.total_scans ?? 0}
          </span>
        </div>

        {/* Email Scans */}
        <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800/80">
          <span className="text-[11px] font-medium text-blue-400 flex items-center gap-1 block truncate">
            <Mail size={12} /> Email Scans
          </span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">
            {stats?.email_scans ?? 0}
          </span>
        </div>

        {/* Social Scans */}
        <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800/80">
          <span className="text-[11px] font-medium text-purple-400 flex items-center gap-1 block truncate">
            <Instagram size={12} /> Social Scans
          </span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">
            {stats?.social_scans ?? 0}
          </span>
        </div>

        {/* Phone Scans */}
        <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800/80">
          <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 block truncate">
            <Phone size={12} /> Phone Scans
          </span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">
            {stats?.phone_scans ?? 0}
          </span>
        </div>

        {/* Low Risk */}
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
          <span className="text-[11px] font-medium text-emerald-400 block truncate">Low Risk</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
            {stats?.low_risk_count ?? 0}
          </span>
        </div>

        {/* Medium Risk */}
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <span className="text-[11px] font-medium text-amber-400 block truncate">Medium Risk</span>
          <span className="text-2xl font-bold text-amber-400 font-mono mt-1 block">
            {stats?.medium_risk_count ?? 0}
          </span>
        </div>

        {/* High Risk */}
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
          <span className="text-[11px] font-medium text-red-400 block truncate">High Risk</span>
          <span className="text-2xl font-bold text-red-400 font-mono mt-1 block">
            {stats?.high_risk_count ?? 0}
          </span>
        </div>

        {/* Inconclusive */}
        <div className="p-4 rounded-xl bg-slate-500/5 border border-slate-500/20">
          <span className="text-[11px] font-medium text-slate-400 block truncate">Inconclusive</span>
          <span className="text-2xl font-bold text-slate-400 font-mono mt-1 block">
            {stats?.inconclusive_count ?? 0}
          </span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <div className="p-6 rounded-2xl glass-card border border-navy-800 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-brand-primary" />
              Risk Level Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown across all completed assessments
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            {stats?.total_scans === 0 ? (
              <div className="text-center text-xs text-slate-500">
                <HelpCircle size={24} className="mx-auto mb-1 opacity-40" />
                No scans recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.risk_distribution || []}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(stats?.risk_distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a0f1d', borderColor: '#1e2c4f', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-navy-800 text-xs">
            {(stats?.risk_distribution || []).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}:
                </span>
                <strong className="font-mono text-white">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Activity Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-card border border-navy-800 flex flex-col justify-between">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity size={16} className="text-brand-violet" />
                Scan Activity (Last 7 Days)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily volume of completed risk evaluations
              </p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.scans_by_date || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2c4f" opacity={0.5} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0f1d', borderColor: '#1e2c4f', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-navy-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Aggregated by UTC day boundaries</span>
            <Link to="/history" className="text-brand-primary hover:underline flex items-center gap-1">
              View Complete History <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="p-6 rounded-2xl glass-card border border-navy-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Investigations</h3>
            <p className="text-xs text-slate-400 mt-0.5">Most recent identity evaluations</p>
          </div>
          <Link
            to="/history"
            className="text-xs text-brand-primary hover:underline flex items-center gap-1 font-medium"
          >
            All Reports ({stats?.total_scans ?? 0}) <ArrowRight size={14} />
          </Link>
        </div>

        {stats?.recent_activity.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Search size={28} className="mx-auto mb-2 opacity-30" />
            <p className="font-medium text-slate-300">No scans conducted yet.</p>
            <p className="mt-1 text-slate-500">Run your first email, phone, or profile check using the button below.</p>
            <button
              onClick={() => setQuickScanOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-primary/20 text-brand-primary border border-brand-primary/30 text-xs font-semibold hover:bg-brand-primary/30 transition-colors"
            >
              Start First Scan
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-navy-800">
                <tr>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Target Identifier</th>
                  <th className="py-3 px-3">Risk Assessment</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {(stats?.recent_activity || []).map((scan) => (
                  <tr key={scan.scan_id} className="hover:bg-navy-800/20 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-300">
                      {scan.scan_type}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-200">
                      {scan.masked_identifier}
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge level={scan.risk_level} score={scan.risk_score} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(scan.created_at).toLocaleDateString()} {new Date(scan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/reports/${scan.scan_id}`}
                        className="px-2.5 py-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-medium transition-colors"
                      >
                        View Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live Integrations Telemetry Status */}
      <div className="p-6 rounded-2xl glass-card border border-navy-800">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers size={16} className="text-emerald-400" />
            Active Service & Intelligence Telemetry
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent status of verification adapters (no fabricated claims)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(stats?.integrations_status || []).map((integration) => {
            const isOperational = integration.status === 'operational';
            return (
              <div
                key={integration.name}
                className="p-3.5 rounded-xl bg-navy-950/60 border border-navy-800 flex items-start justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOperational ? 'bg-emerald-400' : 'bg-slate-500'
                      }`}
                    />
                    <strong className="text-xs text-slate-200">{integration.name}</strong>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{integration.notes}</p>
                  <span className="text-[10px] text-slate-500 block mt-1">Provider: {integration.provider}</span>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium uppercase shrink-0 ${
                    isOperational
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}
                >
                  {integration.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Scan Modal */}
      <QuickScanModal isOpen={quickScanOpen} onClose={() => setQuickScanOpen(false)} />
    </div>
  );
};
