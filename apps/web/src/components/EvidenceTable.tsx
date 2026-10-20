import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Shield,
} from 'lucide-react';
import type { EvidenceRecord } from '../types';

interface EvidenceTableProps {
  evidence: EvidenceRecord[];
}

export const EvidenceTable: React.FC<EvidenceTableProps> = ({ evidence }) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredEvidence = evidence.filter((ev) => {
    if (filter === 'ALL') return true;
    return ev.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <AlertOctagon size={16} className="text-red-400" />;
      case 'SUSPICIOUS':
        return <AlertTriangle size={16} className="text-amber-400" />;
      case 'INFO':
        return <CheckCircle2 size={16} className="text-emerald-400" />;
      case 'UNAVAILABLE':
      case 'FAILED':
      default:
        return <HelpCircle size={16} className="text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-medium">Confirmed Alert</span>;
      case 'SUSPICIOUS':
        return <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">Suspicious Indicator</span>;
      case 'INFO':
        return <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Verified Normal</span>;
      case 'UNAVAILABLE':
      default:
        return <span className="text-xs px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/20 font-medium">Unavailable</span>;
    }
  };

  return (
    <div className="rounded-xl border border-navy-700/60 bg-navy-900/40 overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-4 border-b border-navy-800 flex flex-wrap items-center justify-between gap-3 bg-navy-900/60">
        <div>
          <h3 className="font-semibold text-slate-100 flex items-center gap-2 text-sm md:text-base">
            <Shield size={18} className="text-brand-primary" />
            Auditable Evidence & Verification Signals ({evidence.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent breakdown of every check conducted with source attribution.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          {['ALL', 'CONFIRMED', 'SUSPICIOUS', 'INFO', 'UNAVAILABLE'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === s
                  ? 'bg-brand-primary text-white font-medium'
                  : 'bg-navy-800/80 text-slate-300 hover:bg-navy-700'
              }`}
            >
              {s === 'ALL' ? 'All Signals' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Evidence Rows */}
      <div className="divide-y divide-navy-800/60">
        {filteredEvidence.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No evidence records match the selected filter.
          </div>
        ) : (
          filteredEvidence.map((ev) => {
            const isExpanded = expandedId === ev.id;
            return (
              <div key={ev.id} className="p-4 hover:bg-navy-800/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getStatusIcon(ev.status)}</div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-200 text-sm">{ev.name}</span>
                        {getStatusBadge(ev.status)}
                        <span className="text-xs font-mono text-slate-400">({ev.check_id})</span>
                      </div>
                      <p className="text-sm text-slate-300 mt-1 leading-relaxed">{ev.finding}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                        <span>Source: <strong className="text-slate-300">{ev.source}</strong></span>
                        <span>Reliability: <strong className="text-slate-300">{Math.round((ev.reliability || 1) * 100)}%</strong></span>
                        {ev.risk_contribution > 0 && (
                          <span className="text-amber-400 font-medium">+{ev.risk_contribution} risk pts</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                    className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-navy-800"
                    title="View details"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Expanded Details / Limitations */}
                {isExpanded && (
                  <div className="mt-3 ml-7 pt-3 border-t border-navy-800/60 text-xs text-slate-400 space-y-1.5">
                    {ev.limitations && (
                      <div className="flex items-start gap-1.5 text-amber-300/90 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                        <Info size={14} className="mt-0.5 shrink-0" />
                        <div>
                          <strong>Methodological Limitation: </strong>
                          {ev.limitations}
                        </div>
                      </div>
                    )}
                    {ev.details && Object.keys(ev.details).length > 0 && (
                      <div className="bg-navy-950 p-2.5 rounded-lg font-mono text-[11px] text-slate-300 border border-navy-800 overflow-x-auto">
                        <pre>{JSON.stringify(ev.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
