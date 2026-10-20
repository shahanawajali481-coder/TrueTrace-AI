import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';
import type { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  switch (level) {
    case 'LOW':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${sizeClasses[size]}`}>
          <ShieldCheck size={iconSizes[size]} className="text-emerald-400" />
          <span>Low Risk</span>
          {score !== undefined && <span className="opacity-70">({score})</span>}
        </span>
      );
    case 'MEDIUM':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 ${sizeClasses[size]}`}>
          <AlertTriangle size={iconSizes[size]} className="text-amber-400" />
          <span>Medium Risk</span>
          {score !== undefined && <span className="opacity-70">({score})</span>}
        </span>
      );
    case 'HIGH':
      return (
        <span className={`inline-flex items-center rounded-full bg-red-500/15 text-red-400 border border-red-500/30 shadow-sm shadow-red-500/10 ${sizeClasses[size]}`}>
          <AlertOctagon size={iconSizes[size]} className="text-red-400" />
          <span>High Risk</span>
          {score !== undefined && <span className="opacity-70">({score})</span>}
        </span>
      );
    case 'INCONCLUSIVE':
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/30 ${sizeClasses[size]}`}>
          <HelpCircle size={iconSizes[size]} className="text-slate-400" />
          <span>Inconclusive</span>
          {score !== undefined && <span className="opacity-70">({score})</span>}
        </span>
      );
  }
};
