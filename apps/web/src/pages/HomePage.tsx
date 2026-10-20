import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Mail,
  Instagram,
  Facebook,
  Phone,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Lock,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Download,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'EMAIL' | 'INSTAGRAM' | 'FACEBOOK' | 'WHATSAPP'>('EMAIL');
  const [inputVal, setInputVal] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleHeroScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    if (!user) {
      // Prompt user to sign up or sign in
      navigate(`/register?scan_type=${activeTab}&id=${encodeURIComponent(inputVal)}`);
      return;
    }

    setIsScanning(true);
    setErrorMsg(null);
    try {
      let res;
      if (activeTab === 'EMAIL') res = await api.scanEmail({ identifier: inputVal });
      else if (activeTab === 'INSTAGRAM') res = await api.scanInstagram({ identifier: inputVal });
      else if (activeTab === 'FACEBOOK') res = await api.scanFacebook({ identifier: inputVal });
      else res = await api.scanWhatsapp({ identifier: inputVal });

      if (res?.scan_id) {
        navigate(`/reports/${res.scan_id}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Scan failed. Please verify input.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-brand-primary/15 via-brand-violet/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold mb-6">
          <Sparkles size={14} />
          <span>TrueTrace AI v1.0 — Evidence-Based Fraud Detection</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Verify Signals. Detect Risks.{' '}
          <span className="gradient-text">Stay Safe Online.</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Assess potentially fraudulent emails, suspicious social media accounts, impersonation attempts, and reported scam numbers with auditable, explainable evidence.
        </p>

        {/* Hero Interactive Scanner Widget */}
        <div className="mt-10 max-w-2xl mx-auto glass-card rounded-2xl p-4 sm:p-6 shadow-2xl shadow-navy-950/80 text-left border border-brand-primary/20">
          <div className="flex items-center justify-between mb-4 border-b border-navy-800 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Immediate Identity Risk Check
            </span>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live DNS & Intelligence Active
            </span>
          </div>

          {/* Selector Tabs */}
          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-navy-950 border border-navy-800 mb-4">
            <button
              onClick={() => { setActiveTab('EMAIL'); setInputVal(''); }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'EMAIL' ? 'bg-brand-primary text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail size={14} /> Email
            </button>
            <button
              onClick={() => { setActiveTab('INSTAGRAM'); setInputVal(''); }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'INSTAGRAM' ? 'bg-brand-primary text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Instagram size={14} /> Instagram
            </button>
            <button
              onClick={() => { setActiveTab('FACEBOOK'); setInputVal(''); }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'FACEBOOK' ? 'bg-brand-primary text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Facebook size={14} /> Facebook
            </button>
            <button
              onClick={() => { setActiveTab('WHATSAPP'); setInputVal(''); }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'WHATSAPP' ? 'bg-brand-primary text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Phone size={14} /> WhatsApp
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleHeroScan} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              required
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={
                activeTab === 'EMAIL'
                  ? 'Enter email address (e.g. security-alert@domain.com)'
                  : activeTab === 'INSTAGRAM'
                  ? 'Enter Instagram username or URL (e.g. @support_brand)'
                  : activeTab === 'FACEBOOK'
                  ? 'Enter Facebook profile or page link'
                  : 'Enter phone number with country code (e.g. +14155552671)'
              }
              className="flex-1 px-4 py-3 rounded-xl bg-navy-950 border border-navy-700 text-slate-100 text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-brand-primary"
            />
            <button
              type="submit"
              disabled={isScanning || !inputVal.trim()}
              className="px-6 py-3 rounded-xl bg-brand-primary hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/30 transition-all disabled:opacity-50"
            >
              {isScanning ? (
                <span>Evaluating...</span>
              ) : (
                <>
                  <Search size={16} />
                  <span>Verify Now</span>
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <p className="mt-3 text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
              {errorMsg}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Authoritative MX/DNS • Disposable domain filtering • Community scam databases</span>
            <span className="text-slate-500">100% Privacy-Conscious</span>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-navy-800/80">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-brand-primary mb-2">
            Multi-Signal Verification
          </h2>
          <h3 className="text-2xl sm:text-4xl font-bold text-white">
            Comprehensive Digital Risk Protection
          </h3>
          <p className="text-sm text-slate-400 mt-2">
            No single signal determines fraud. TrueTrace AI combines network topology, numbering metadata, and historical reports into an auditable assessment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Email */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 border border-navy-800">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-4">
              <Mail size={20} />
            </div>
            <h4 className="text-base font-semibold text-white mb-2">Email Address Analysis</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Live DNS/MX resolution, throwaway and disposable mailbox matching, RFC syntax verification, and phishing keywords.
            </p>
            <Link to="/email" className="text-xs text-brand-primary font-medium flex items-center gap-1 hover:underline">
              Analyze Email <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 2: Instagram */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 border border-navy-800">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center mb-4">
              <Instagram size={20} />
            </div>
            <h4 className="text-base font-semibold text-white mb-2">Instagram Profile Check</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Authority impersonation patterns, burner naming sequences, public scam logs, and ethical platform disclosure.
            </p>
            <Link to="/instagram" className="text-xs text-brand-primary font-medium flex items-center gap-1 hover:underline">
              Check Instagram <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 3: Facebook */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 border border-navy-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-4">
              <Facebook size={20} />
            </div>
            <h4 className="text-base font-semibold text-white mb-2">Facebook URL Check</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Domain spoofing and typo-squatting detection, Meta security impersonation pretexts, and user-provided evidence review.
            </p>
            <Link to="/facebook" className="text-xs text-brand-primary font-medium flex items-center gap-1 hover:underline">
              Verify Facebook <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 4: WhatsApp */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 border border-navy-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
              <Phone size={20} />
            </div>
            <h4 className="text-base font-semibold text-white mb-2">WhatsApp & Phone Check</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Google libphonenumber E.164 normalization, virtual VoIP line classification, telecom carrier routing, and scam complaints.
            </p>
            <Link to="/whatsapp" className="text-xs text-brand-primary font-medium flex items-center gap-1 hover:underline">
              Assess Phone <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Pipeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-navy-800/80 bg-navy-900/30 rounded-3xl my-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-brand-violet mb-2">
            The Explainable Assessment Pipeline
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            How TrueTrace AI Calculates Risk
          </h3>
          <p className="text-sm text-slate-400 mt-2">
            Zero black-box guesses. Every score is directly traceable to factual, cited evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-navy-950/60 border border-navy-800">
            <div className="text-brand-primary font-mono text-2xl font-bold mb-2">01</div>
            <h4 className="text-sm font-semibold text-white mb-1.5">Input & Protocol Validation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Syntactically validates identifiers against RFC 5322 (email) and ITU-T E.164 (telephony) before network probing.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-navy-950/60 border border-navy-800">
            <div className="text-brand-primary font-mono text-2xl font-bold mb-2">02</div>
            <h4 className="text-sm font-semibold text-white mb-1.5">Authoritative Telemetry</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Executes live socket DNS queries, checks verified blocklists, and queries community fraud report databases.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-navy-950/60 border border-navy-800">
            <div className="text-brand-primary font-mono text-2xl font-bold mb-2">03</div>
            <h4 className="text-sm font-semibold text-white mb-1.5">Anti-Double-Counting</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deduplicates related signals and weights indicators by source reliability so transient timeouts never count as malice.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-navy-950/60 border border-navy-800">
            <div className="text-brand-primary font-mono text-2xl font-bold mb-2">04</div>
            <h4 className="text-sm font-semibold text-white mb-1.5">Auditable Report & PDF</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates four transparent outcomes (Low, Medium, High, Inconclusive) with exportable PDF summaries and defense actions.
            </p>
          </div>
        </div>
      </section>

      {/* Ethical Boundaries Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-brand-primary/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-4">
              <CheckCircle2 size={14} /> Strict Ethical Engineering Guarantee
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Honest Intelligence, Not False Promises.
            </h3>

            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Unlike deceptive tools that promise to "hack" private accounts or intercept OTPs, TrueTrace AI adheres strictly to cybersecurity ethics and platform terms:
            </p>

            <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>We <strong>never</strong> claim an account is fraudulent merely because it has few followers or is new.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>We <strong>never</strong> attempt to discover hidden phone numbers, passwords, OTPs, or private DMs.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>Unavailable checks are clearly disclosed and <strong>never</strong> counted as suspicious evidence.</span>
              </li>
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/checks"
                className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-blue-600 transition-colors"
              >
                Read Security & Limitations
              </Link>
              <Link
                to="/privacy"
                className="px-5 py-2.5 rounded-xl bg-navy-800 text-slate-300 text-xs font-medium hover:bg-navy-700 transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-Platform Download Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-navy-800/80 text-center">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-brand-primary mb-2">
          Universal Availability
        </h2>
        <h3 className="text-2xl sm:text-3xl font-bold text-white">
          Access TrueTrace AI on Any Device
        </h3>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-2">
          One unified account, one shared risk engine. Seamless protection across your phone, desktop, and web browser.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 max-w-4xl mx-auto text-left">
          {/* Web PWA */}
          <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800 hover:border-brand-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-brand-primary flex items-center justify-center mb-4">
              <Monitor size={20} />
            </div>
            <h4 className="text-base font-semibold text-white mb-1">Web Application / PWA</h4>
            <p className="text-xs text-slate-400 mb-4">
              Install directly from any modern browser with instant updates and offline fallback.
            </p>
            <span className="inline-block px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium">
              Ready to Launch
            </span>
          </div>

          {/* Android */}
          <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800 hover:border-emerald-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Smartphone size={20} />
            </div>
            <h4 className="text-base font-semibold text-white mb-1">Native Android App</h4>
            <p className="text-xs text-slate-400 mb-4">
              React Native Expo app with SecureStore credentials and responsive mobile ergonomics.
            </p>
            <Link to="/downloads#android" className="text-xs text-brand-primary font-medium hover:underline">
              Android Release APK & Build Guide →
            </Link>
          </div>

          {/* Windows Desktop */}
          <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800 hover:border-violet-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-brand-violet flex items-center justify-center mb-4">
              <Download size={20} />
            </div>
            <h4 className="text-base font-semibold text-white mb-1">Windows Desktop App</h4>
            <p className="text-xs text-slate-400 mb-4">
              Dedicated Windows client with restricted external link security and local desktop menu.
            </p>
            <Link to="/downloads#desktop" className="text-xs text-brand-primary font-medium hover:underline">
              Windows Installer Instructions →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
