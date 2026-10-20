import React from 'react';
import { Shield, CheckCircle2, ArrowRight, Layers, Database, Lock, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-violet/10 text-brand-violet border border-brand-violet/20 text-xs font-semibold mb-3">
          Architecture & Methodology
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          The Science of Evidence-Based Risk
        </h1>
        <p className="text-base text-slate-300 mt-4 leading-relaxed">
          How TrueTrace AI processes digital signals into transparent, auditable conclusions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-navy-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-brand-primary flex items-center justify-center font-bold">1</div>
          <h3 className="text-base font-semibold text-white">Signal Capture & Syntax Normalization</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The identifier is validated against international RFC and ITU-T standards, removing evasion whitespace and parsing canonical subdomains.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-navy-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-brand-violet flex items-center justify-center font-bold">2</div>
          <h3 className="text-base font-semibold text-white">Authoritative Telemetry Querying</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Active DNS nameservers, MX records, telephony number plans, and scam complaint databases are interrogated in real time.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-navy-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">3</div>
          <h3 className="text-base font-semibold text-white">Deduplication & Weighting</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Duplicate signals are discarded. Missing auxiliary services are marked unavailable rather than penalized as negative evidence.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-navy-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">4</div>
          <h3 className="text-base font-semibold text-white">Explainable Synthesis</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Generates deterministic score from 0-100, assigns one of four strict risk levels, and exports auditable PDF and JSON proof records.
          </p>
        </div>
      </div>
    </div>
  );
};
