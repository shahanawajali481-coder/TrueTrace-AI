import React from 'react';
import { Shield, CheckCircle2, AlertOctagon, HelpCircle, Lock } from 'lucide-react';

export const ChecksPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 space-y-12">
      <div>
        <h1 className="text-3xl font-extrabold text-white">
          Supported Checks & Technical Boundaries
        </h1>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          Detailed specification of what TrueTrace AI verifies, how signals are retrieved, and our strict ethical limitations.
        </p>
      </div>

      {/* Supported checks grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl glass-card border border-navy-800 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            Email Verification Checks
          </h2>
          <ul className="space-y-2 text-xs text-slate-300">
            <li><strong>Syntax:</strong> RFC 5322 compliance, illegal characters, domain format.</li>
            <li><strong>DNS A/AAAA:</strong> Direct authoritative root server resolution.</li>
            <li><strong>MX Records:</strong> Mail exchanger server existence and response.</li>
            <li><strong>Disposable Domain:</strong> Cross-checked against curated temporary inbox providers.</li>
            <li><strong>Heuristic Spoofing:</strong> Detection of "support", "billing", "security" local keywords.</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-navy-800 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            Phone & WhatsApp Checks
          </h2>
          <ul className="space-y-2 text-xs text-slate-300">
            <li><strong>E.164 Parsing:</strong> Normalizes international dial codes and numbering plans.</li>
            <li><strong>Line Classification:</strong> Identifies VoIP, mobile, fixed wireline, or premium rate.</li>
            <li><strong>Carrier / Region:</strong> Allocating telecom operator and geographic administrative area.</li>
            <li><strong>Scam Records:</strong> Verified complaints recorded in threat intelligence logs.</li>
          </ul>
        </div>
      </div>

      {/* Limitations Section */}
      <div id="limitations" className="p-8 rounded-3xl bg-navy-900/60 border border-amber-500/30 space-y-4">
        <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
          <AlertOctagon size={20} />
          Ethical & Technical Limitations Disclosure
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          TrueTrace AI is an intelligence advisory tool designed to assist human judgment, not replace it. We explicitly state the following operational constraints:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 pt-2">
          <div className="p-4 rounded-xl bg-navy-950 border border-navy-800">
            <strong className="text-white block mb-1">No Account Hacking</strong>
            We never attempt to recover, intercept, or guess user passwords, OTPs, or private direct messages.
          </div>
          <div className="p-4 rounded-xl bg-navy-950 border border-navy-800">
            <strong className="text-white block mb-1">No Unsolicited SMTP Probing</strong>
            We do not perform aggressive SMTP VRFY or mailbox dictionary harvesting that could trigger spam filters.
          </div>
          <div className="p-4 rounded-xl bg-navy-950 border border-navy-800">
            <strong className="text-white block mb-1">Low Risk ≠ Absolute Guarantee</strong>
            A Low Risk result indicates that no known suspicious flags were uncovered; it does not guarantee genuine real-world identity.
          </div>
          <div className="p-4 rounded-xl bg-navy-950 border border-navy-800">
            <strong className="text-white block mb-1">Unavailable ≠ Suspicious</strong>
            If an external service is offline or unconfigured, we report it honestly as unavailable without penalizing the score.
          </div>
        </div>
      </div>
    </div>
  );
};
