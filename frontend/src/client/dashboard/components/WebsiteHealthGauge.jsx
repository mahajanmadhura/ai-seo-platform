import React from 'react';
import { Shield } from 'lucide-react';

export default function WebsiteHealthGauge({ websites, audits, loading }) {
  const doneAudits = audits.filter((a) => a.status === 'DONE' && a.overall_score !== null);
  const averageScore = doneAudits.length > 0
    ? Math.round(doneAudits.reduce((acc, curr) => acc + (curr.overall_score || 0), 0) / doneAudits.length)
    : 0;

  const radius = 50;
  const circumference = Math.PI * radius;
  const filledOffset = circumference - (averageScore / 100) * circumference;

  const getGaugeColor = (score) => {
    if (score >= 80) return '#053D34';
    if (score >= 50) return '#36E682';
    return '#E0705F';
  };

  const gaugeColor = getGaugeColor(averageScore);

  return (
    <div className="bg-white rounded-[20px] p-4 border border-[#053D34]/10 shadow-sm flex flex-col justify-between h-[280px] text-left">
      <div className="space-y-3 flex flex-col h-full justify-between">
        <div className="flex items-center gap-2 pb-2.5 border-b border-[#053D34]/10 flex-shrink-0">
          <div className="p-1.5 bg-[#EEF5F1] rounded-lg text-brand-primary flex-shrink-0">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-black text-brand-evergreen text-xs uppercase tracking-wide">Website Health</h3>
            <p className="text-[9px] text-brand-secondary font-bold">SEO status gauges per monitored site.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 my-3 bg-[#EEF5F1] rounded-xl animate-pulse"></div>
        ) : (
          <div className="flex-1 flex flex-col justify-between pt-2">

            {/* SVG Arc Gauge */}
            <div className="relative flex items-center justify-center h-28">
              <svg viewBox="0 0 140 85" className="w-40 h-24 overflow-visible">
                <defs>
                  <pattern id="stripes" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="6" stroke="#EEF5F1" strokeWidth="3" />
                    <line x1="3" y1="0" x2="3" y2="6" stroke="#6D8179" strokeWidth="1" className="opacity-20" />
                  </pattern>
                </defs>

                {/* Base stripe track */}
                <path
                  d="M 20,70 A 50,50 0 0,1 120,70"
                  fill="none"
                  stroke="url(#stripes)"
                  strokeWidth="12"
                  strokeLinecap="round"
                />

                {/* Filled portion based on average score */}
                {averageScore > 0 && (
                  <path
                    d="M 20,70 A 50,50 0 0,1 120,70"
                    fill="none"
                    stroke={gaugeColor}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={filledOffset}
                    strokeLinecap="round"
                  />
                )}

                {/* Inside SVG Text guaranteed to be mathematically centered */}
                <text
                  x="70"
                  y="65"
                  textAnchor="middle"
                  className="fill-[#053D34] font-black text-[22px] select-none"
                >
                  {averageScore}%
                </text>
                <text
                  x="70"
                  y="75"
                  textAnchor="middle"
                  className="fill-[#6D8179] font-black text-[7px] uppercase tracking-wider select-none"
                >
                  Average Score
                </text>
              </svg>
            </div>

            {/* Gauge Legend */}
            <div className="flex items-center justify-between text-[8px] font-black text-brand-secondary uppercase tracking-wider px-2 pt-2 border-t border-[#053D34]/5">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#053D34]" />
                <span>Good</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#36E682]" />
                <span>Needs Work</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#E0705F]" />
                <span>Critical</span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
