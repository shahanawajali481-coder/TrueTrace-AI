import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Activity,
  Users,
  Database,
  FileCheck,
  AlertTriangle,
  Server,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [health, setHealth] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [scamReports, setScamReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Scam Report state
  const [targetId, setTargetId] = useState('');
  const [targetType, setTargetType] = useState('EMAIL');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [hData, logsData, reportsData] = await Promise.all([
        api.getAdminHealth(),
        api.getAdminAuditLogs(1),
        api.getAdminScamReports(),
      ]);
      setHealth(hData);
      setAuditLogs(logsData?.logs || []);
      setScamReports(reportsData || []);
    } catch (err) {
      console.error('Error loading admin suite:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId.trim()) return;
    setIsSubmitting(true);
    try {
      // In real backend, admin can create scam report directly
      await fetch('/api/v1/admin/scam-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${api.getToken()}`,
        },
        body: JSON.stringify({
          target_identifier: targetId,
          target_type: targetType,
          description,
          source: 'Admin Verified Incident',
        }),
      });
      setTargetId('');
      setDescription('');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <ShieldAlert size={36} className="text-red-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400 mt-2">
          This portal is restricted to authorized platform administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert size={22} className="text-amber-400" />
            TrueTrace AI Administration Console
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time server telemetry, security audit log streaming, and threat feed curation.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2.5 rounded-xl bg-navy-800 text-slate-300 hover:text-white"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-navy-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>System Status</span>
            <Server size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono uppercase">
              {health?.status || 'Active'}
            </span>
            <span className="text-xs text-slate-400">v{health?.version || '1.0.0'}</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            DB: {health?.database || 'Connected'}
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-navy-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Registered Users</span>
            <Users size={16} className="text-brand-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono">
            {health?.active_users ?? 0}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Scoped with RBAC</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-navy-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total System Scans</span>
            <Activity size={16} className="text-brand-violet" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono">
            {health?.total_scans_recorded ?? 0}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Audited records in DB</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-navy-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Uptime Duration</span>
            <Database size={16} className="text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono">
            {Math.round((health?.uptime_seconds || 0) / 60)}m
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Memory: ~{health?.system_memory_mb || 128} MB</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scam Report Submission / Index */}
        <div className="p-6 rounded-2xl glass-card border border-navy-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileCheck size={16} className="text-emerald-400" />
              Community & Admin Scam Threat Registry ({scamReports.length})
            </h3>
          </div>

          <form onSubmit={handleCreateReport} className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300">Register Known Malicious Incident</h4>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                className="col-span-1 px-2 py-2 rounded-lg bg-navy-900 border border-navy-700 text-xs text-slate-200"
              >
                <option value="EMAIL">Email</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="FACEBOOK">Facebook</option>
                <option value="WHATSAPP">WhatsApp</option>
              </select>

              <input
                type="text"
                required
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder="Identifier (email/handle/phone)"
                className="col-span-2 px-3 py-2 rounded-lg bg-navy-900 border border-navy-700 text-xs text-slate-100 placeholder-slate-500"
              />
            </div>

            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Incident description (e.g. impersonated CEO bank transfer request)"
              className="w-full px-3 py-2 rounded-lg bg-navy-900 border border-navy-700 text-xs text-slate-100 placeholder-slate-500"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              Add to Threat Registry
            </button>
          </form>

          {/* Scam Reports List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-navy-800 text-xs">
            {scamReports.map((r) => (
              <div key={r.id} className="py-2.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-semibold text-slate-200">{r.target_identifier}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-navy-800 text-slate-400">{r.target_type}</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">{r.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security Audit Events */}
        <div className="p-6 rounded-2xl glass-card border border-navy-800 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity size={16} className="text-brand-primary" />
            Security Audit Events Log
          </h3>

          <div className="max-h-96 overflow-y-auto divide-y divide-navy-800 text-xs">
            {auditLogs.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No audit events recorded.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200 font-mono text-[11px]">{log.action}</span>
                      <span className={`text-[10px] px-1.5 rounded ${log.status === 'SUCCESS' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                        {log.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">{log.resource}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
