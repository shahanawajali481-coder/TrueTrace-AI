import React from 'react';
import type { RiskLevel } from '../types';

interface RiskMeterProps {
  score: number;
  level: RiskLevel;
  confidence?: string;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score, level, confidence }) => {
  // Determine gradient and color
  let barColor = 'from-emerald-500 to-green-400';
  let textColor = 'text-emerald-400';

  if (level === 'MEDIUM') {
    barColor = 'from-amber-500 to-yellow-400';
    textColor = 'text-amber-400';
  } else if (level === 'HIGH') {
    barColor = 'from-red-600 to-rose-400';
    textColor = 'text-red-400';
  } else if (level === 'INCONCLUSIVE') {
    barColor = 'from-slate-600 to-slate-400';
    textColor = 'text-slate-400';
  }

  const boundedScore = Math.min(100, Math.max(0, score));

  return (
    <div className="p-5 rounded-xl bg-navy-900/60 border border-navy-700/60">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
          Risk Assessment Score
        </span>
        <span className={`text-2xl font-bold font-mono ${textColor}`}>
          {level === 'INCONCLUSIVE' ? 'N/A' : `${boundedScore}/100`}
        </span>
      </div>

      {/* Progress track */}
      <div className="w-full h-3 bg-navy-950 rounded-full overflow-hidden p-0.5 border border-navy-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${level === 'INCONCLUSIVE' ? 10 : boundedScore}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-3 text-xs text-slate-400">
        <span>0 (Low Risk)</span>
        <span>50 (Moderate)</span>
        <span>100 (Critical)</span>
      </div>

      {confidence && (
        <div className="mt-3 pt-3 border-t border-navy-800/60 text-xs text-slate-300">
          <span className="font-medium text-slate-400">Confidence Calibration: </span>
          {confidence}
        </div>
      )}
    </div>
  );
};
