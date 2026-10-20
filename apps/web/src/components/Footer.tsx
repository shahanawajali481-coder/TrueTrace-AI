import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Smartphone, Monitor, Globe, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-navy-800/80 bg-navy-950 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-primary flex items-center justify-center">
                <Shield size={16} className="text-white" />
              </div>
              <span className="font-extrabold text-sm text-white tracking-tight">
                TrueTrace <span className="text-brand-primary">AI</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Verify Signals. Detect Risks. Stay Safe.
              TrueTrace AI provides evidence-grounded risk indicators for emails, social media profiles, and reported scam numbers across Web, Android, and Windows.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <span className="flex items-center gap-1"><Globe size={14} className="text-brand-primary" /> Web PWA</span>
              <span className="flex items-center gap-1"><Smartphone size={14} className="text-emerald-400" /> Android</span>
              <span className="flex items-center gap-1"><Monitor size={14} className="text-brand-violet" /> Windows</span>
            </div>
          </div>

          {/* Scanners */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Analyzers
            </h4>
            <ul className="space-y-2">
              <li><Link to="/email" className="hover:text-brand-primary transition-colors">Email Risk Analyzer</Link></li>
              <li><Link to="/instagram" className="hover:text-brand-primary transition-colors">Instagram Profile Check</Link></li>
              <li><Link to="/facebook" className="hover:text-brand-primary transition-colors">Facebook URL Check</Link></li>
              <li><Link to="/whatsapp" className="hover:text-brand-primary transition-colors">WhatsApp & Phone Analyzer</Link></li>
              <li><Link to="/checks" className="hover:text-brand-primary transition-colors">Supported Checks</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Resources
            </h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="hover:text-brand-primary transition-colors">Product Features</Link></li>
              <li><Link to="/how-it-works" className="hover:text-brand-primary transition-colors">How It Works</Link></li>
              <li><Link to="/downloads" className="hover:text-brand-primary transition-colors">Download Applications</Link></li>
              <li><Link to="/faq" className="hover:text-brand-primary transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/contact" className="hover:text-brand-primary transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Trust & Legal
            </h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:text-brand-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-brand-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/checks#limitations" className="hover:text-brand-primary transition-colors">Security & Limitations</Link></li>
              <li><span className="text-slate-500">Zero Private Account Scraping</span></li>
              <li><span className="text-slate-500">Encrypted Transit (HTTPS)</span></li>
            </ul>
          </div>
        </div>

        {/* Ethical Disclaimer */}
        <div className="mt-10 pt-6 border-t border-navy-800/60 text-[11px] text-slate-400 leading-relaxed">
          <p className="flex items-start gap-2">
            <Lock size={14} className="mt-0.5 shrink-0 text-slate-400" />
            <span>
              <strong>Ethical Operations & Legal Disclaimer:</strong> TrueTrace AI never scrapes unauthorized private databases, accesses private direct messages, or seeks unauthorized OTPs or credentials. A low risk score does not guarantee real-world identity, nor does an inconclusive assessment imply malice. Assessments are evidence-based heuristics designed for user awareness and defense.
            </span>
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400">
            <span>© {new Date().getFullYear()} TrueTrace AI. All rights reserved.</span>
            <span className="flex items-center gap-1">Built with precision for cyber safety.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
