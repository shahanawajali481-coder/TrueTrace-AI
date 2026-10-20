import React from 'react';
import { Shield, Lock } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-3">
          <Lock size={14} /> Privacy & Data Protection Policy
        </div>
        <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-400 mt-1">Last Updated: October 2026</p>
      </div>

      <div className="glass-card rounded-2xl p-8 border border-navy-800 text-xs sm:text-sm text-slate-300 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Core Privacy Philosophy</h2>
          <p>
            TrueTrace AI exists to protect users from fraud, not to harvest personal data. We collect only the minimum telemetry strictly required to execute authorized security assessments. We do not sell or monetize personal scan records to marketing brokers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Data We Process</h2>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Account Data:</strong> Email address, hashed password, and user name for authentication.</li>
            <li><strong>Query Identifiers:</strong> Email addresses, social handles, or phone numbers submitted for analysis.</li>
            <li><strong>Audit Logs:</strong> Timestamps, actions, and client IP addresses to enforce rate limiting and prevent abuse.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Masking & Protection</h2>
          <p>
            Identifiers displayed on shared reports or in public summaries are automatically masked (e.g. <code>j***n@domain.com</code> or <code>+1 *** *** 2671</code>) to protect individual privacy.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Your Rights & Account Deletion</h2>
          <p>
            Under GDPR, CCPA, and global privacy frameworks, you have full ownership of your data. You may export your complete scan history in standard JSON format or permanently purge your account at any time via the Account Settings portal.
          </p>
        </section>
      </div>
    </div>
  );
};
