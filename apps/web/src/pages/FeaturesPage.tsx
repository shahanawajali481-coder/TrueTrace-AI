import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Mail,
  Instagram,
  Facebook,
  Phone,
  CheckCircle2,
  Lock,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Download,
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-xs font-semibold mb-3">
          TrueTrace AI Capabilities
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          Engineered for Rigorous Fraud Detection
        </h1>
        <p className="text-base text-slate-300 mt-4 leading-relaxed">
          Discover how TrueTrace AI inspects emails, social media handles, and phone numbers without relying on guesswork or violating user privacy.
        </p>
      </div>

      {/* Feature 1: Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-8 rounded-3xl glass-card border border-navy-800">
        <div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-4">
            <Mail size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Email Address Risk Analysis</h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            Attackers frequently use disposable temporary inboxes or freshly registered spoof domains. TrueTrace AI directly interrogates authoritative DNS servers for active MX exchange records and tests against curated disposable domain registries.
          </p>
          <ul className="space-y-2 text-xs text-slate-300 mb-6">
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> RFC 5322 strict syntax normalization</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> Live authoritative A and MX socket lookups</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> Curated disposable domain blocklist matching</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> Security keyword spoofing detection</li>
          </ul>
          <Link to="/email" className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-blue-600 transition-colors">
            Try Email Analyzer
          </Link>
        </div>
        <div className="p-6 rounded-2xl bg-navy-950 border border-navy-800 font-mono text-xs text-slate-300 space-y-2">
          <div className="text-slate-500">// Sample Email Telemetry</div>
          <div><span className="text-blue-400">DNS Query:</span> paypal-alert-support.xyz</div>
          <div><span className="text-emerald-400">A-Record:</span> 198.51.100.24 (Resolved)</div>
          <div><span className="text-red-400">MX-Record:</span> NXDOMAIN (No Inbound Server)</div>
          <div><span className="text-amber-400">Indicators:</span> Impersonation Keywords, Routing Blackhole</div>
          <div className="pt-2 text-red-400 font-bold">Assessment: HIGH RISK (Score 75/100)</div>
        </div>
      </div>

      {/* Feature 2: Phone & WhatsApp */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-8 rounded-3xl glass-card border border-navy-800">
        <div className="order-2 md:order-1 p-6 rounded-2xl bg-navy-950 border border-navy-800 font-mono text-xs text-slate-300 space-y-2">
          <div className="text-slate-500">// Telephony Classification</div>
          <div><span className="text-blue-400">ITU-T E.164:</span> +1 415 555 2671</div>
          <div><span className="text-purple-400">Line Type:</span> VOIP (Virtual Over-IP Burner)</div>
          <div><span className="text-emerald-400">Carrier:</span> Bandwidth.com CLEC</div>
          <div><span className="text-amber-400">Scam Registry:</span> 2 Prior Impersonation Complaints</div>
          <div className="pt-2 text-amber-400 font-bold">Assessment: MEDIUM-HIGH RISK (Score 60/100)</div>
        </div>
        <div className="order-1 md:order-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
            <Phone size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">WhatsApp & Phone Telemetry</h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            Combines Google's libphonenumber parsing with telephony carrier metadata to uncover VoIP virtual burner numbers commonly used in automated telemarketing and message scams.
          </p>
          <ul className="space-y-2 text-xs text-slate-300 mb-6">
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> Global E.164 normalization</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> Virtual VoIP vs. cellular line classification</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> Carrier operating metadata and geographic region</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> Public community fraud records</li>
          </ul>
          <Link to="/whatsapp" className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-blue-600 transition-colors">
            Try Phone Analyzer
          </Link>
        </div>
      </div>
    </div>
  );
};
