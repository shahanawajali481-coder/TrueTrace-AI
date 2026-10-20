import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Trash2,
  Save,
  Download,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [scanCompletedNotif, setScanCompletedNotif] = useState(
    user?.notification_preferences?.scanCompleted ?? true
  );
  const [securityAlertsNotif, setSecurityAlertsNotif] = useState(
    user?.notification_preferences?.securityAlerts ?? true
  );
  const [productUpdatesNotif, setProductUpdatesNotif] = useState(
    user?.notification_preferences?.productUpdates ?? false
  );

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    try {
      await api.updateProfile({
        full_name: fullName,
        notification_preferences: {
          scanCompleted: scanCompletedNotif,
          securityAlerts: securityAlertsNotif,
          productUpdates: productUpdatesNotif,
        },
      });
      await refreshUser();
      setSuccessMsg('Account preferences successfully saved.');
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.deleteAccount();
      await logout();
      navigate('/');
    } catch (err: any) {
      alert(err.message || 'Failed to delete account');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <SettingsIcon size={22} className="text-brand-primary" />
          Account & Privacy Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your profile details, in-app alert triggers, and data controls.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* Profile Form */}
      <div className="glass-card rounded-2xl p-6 border border-navy-800">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
          <User size={16} className="text-brand-primary" /> Personal Information
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-800 text-slate-400 text-xs cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Account identifier cannot be altered.</span>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-slate-100 text-xs focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="pt-4 border-t border-navy-800/80 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Bell size={14} className="text-brand-violet" /> In-App Notification Preferences
            </h3>

            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-navy-950/60 border border-navy-800/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scanCompletedNotif}
                  onChange={(e) => setScanCompletedNotif(e.target.checked)}
                  className="rounded bg-navy-900 border-navy-700 text-brand-primary focus:ring-brand-primary"
                />
                <div>
                  <span className="text-xs font-medium text-slate-200 block">Assessment Completion Alerts</span>
                  <span className="text-[11px] text-slate-400">Receive in-app confirmation when long-running threat queries finish.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-navy-950/60 border border-navy-800/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={securityAlertsNotif}
                  onChange={(e) => setSecurityAlertsNotif(e.target.checked)}
                  className="rounded bg-navy-900 border-navy-700 text-brand-primary focus:ring-brand-primary"
                />
                <div>
                  <span className="text-xs font-medium text-slate-200 block">Threat Intelligence Updates</span>
                  <span className="text-[11px] text-slate-400">Alert me if an identifier I scanned is later confirmed in new public fraud logs.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-blue-600 text-white text-xs font-semibold transition-all disabled:opacity-50"
            >
              <Save size={14} />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-3">
        <h2 className="text-sm font-semibold text-red-400 flex items-center gap-2">
          <Trash2 size={16} /> Danger Zone: Permanent Account Deletion
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          In compliance with GDPR and digital privacy standards, clicking delete permanently purges your user profile, scan logs, and cached reports from TrueTrace AI servers with zero recovery.
        </p>

        <button
          onClick={() => setDeleteModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold hover:bg-red-500/30 transition-colors"
        >
          Delete Account & Purge My Data
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-navy-900 border border-red-500/30 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle size={18} /> Confirm Permanent Deletion
            </h3>
            <p className="text-xs text-slate-300">
              Are you completely certain? All your historical scans, reports, and evidence trails will be deleted immediately and cannot be restored.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 text-xs hover:bg-navy-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
