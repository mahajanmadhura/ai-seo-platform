import React from 'react';
import { TrendingUp, Activity } from 'lucide-react';

export default function ScoreTrendChart({ audits, loading }) {
  const completed = [...audits]
    .filter((a) => a.status === 'DONE' && a.overall_score !== null)
    .sort((a, b) => new Date(a.started_at) - new Date(b.started_at))
    .slice(-10);

  const plotWidth = 360; 
  const plotHeight = 90; 
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 25;
  const width = 400;
  const height = 130;

  const getSVGCoordinates = () => {
    if (completed.length < 2) return '';
    const points = completed.map((audit, idx) => {
      const x = paddingLeft + (idx * plotWidth) / (completed.length - 1);
      const y = paddingTop + plotHeight - (audit.overall_score * plotHeight) / 100;
      return `${x},${y}`;
    });
    return points.join(' ');
  };

  const coordinates = getSVGCoordinates();

  return (
    <div className="bg-white rounded-[20px] p-4 border border-[#053D34]/10 shadow-sm flex flex-col justify-between h-[360px] text-left">
      <div className="space-y-3 flex flex-col h-full justify-between">
        <div className="flex items-center gap-2 pb-2.5 border-b border-[#053D34]/10 flex-shrink-0">
          <div className="p-1.5 bg-[#EEF5F1] rounded-lg text-brand-primary flex-shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-black text-brand-evergreen text-xs uppercase tracking-wide">SEO Score Trend</h3>
            <p className="text-[9px] text-brand-secondary font-bold">Latest score trend across completed audits.</p>
          </div>
        </div>

        {loading ? (
          <div className="h-44 bg-soft-bg rounded-xl animate-pulse flex-1 my-3"></div>
        ) : completed.length < 2 ? (
          <div className="flex-1 my-3 flex flex-col items-center justify-center text-center gap-2 border border-dashed border-outline-variant rounded-xl py-8">
            <div className="p-2.5 bg-brand-surface-high border border-[#053D34]/10 rounded-full text-brand-secondary">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div className="space-y-0.5 max-w-[200px]">
              <p className="text-[10px] text-brand-evergreen font-black uppercase">No trend data</p>
              <p className="text-[8px] text-brand-secondary font-bold leading-normal">Requires at least 2 completed audits to calculate SEO progression history.</p>
            </div>
          </div>
        ) : (
          <div className="relative pt-3 flex-1 flex flex-col justify-between">
            
            <div className="flex-1 h-36">
              <svg viewBox="0 0 400 130" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#36E682" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#36E682" stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="glowShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#36E682" floodOpacity="0.2" />
                  </filter>
                </defs>

                {/* Y-Axis Labels inside SVG for absolute alignment */}
                <text x="5" y="18" className="fill-[#6D8179] font-black text-[7.5px] select-none">100%</text>
                <text x="5" y="63" className="fill-[#6D8179] font-black text-[7.5px] select-none">50%</text>
                <text x="5" y="108" className="fill-[#6D8179] font-black text-[7.5px] select-none">0%</text>

                {/* Grid Lines */}
                <g className="opacity-[0.06]">
                  <line x1="30" y1="15" x2="390" y2="15" stroke="#053D34" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="30" y1="60" x2="390" y2="60" stroke="#053D34" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="30" y1="105" x2="390" y2="105" stroke="#053D34" strokeWidth="1" strokeDasharray="3 3" />
                </g>

                {/* Gradient Under-Fill Area */}
                <path
                  d={`M 30,105 L ${coordinates} L 390,105 Z`}
                  fill="url(#trendGradient)"
                />

                {/* Trend Stroke Line */}
                <polyline
                  fill="none"
                  stroke="#053D34"
                  strokeWidth="2.5"
                  points={coordinates}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glowShadow)"
                />

                {/* Interactive circles and tooltips */}
                {completed.map((audit, idx) => {
                  const x = paddingLeft + (idx * plotWidth) / (completed.length - 1);
                  const y = paddingTop + plotHeight - (audit.overall_score * plotHeight) / 100;
                  return (
                    <g key={audit.id} className="group cursor-pointer">
                      <circle
                        cx={x}
                        cy={y}
                        r="4"
                        className="fill-white stroke-brand-evergreen stroke-[2px] transition-all group-hover:r-5"
                      />
                      <text
                        x={x}
                        y={y - 8}
                        className="text-[8px] font-black fill-[#053D34] text-anchor-middle text-center opacity-0 group-hover:opacity-100 transition-opacity"
                        textAnchor="middle"
                      >
                        {audit.overall_score}%
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex justify-between items-center text-[8px] text-brand-secondary font-bold px-1.5 pt-2 border-t border-[#053D34]/10 mt-1 flex-shrink-0">
              <span>{new Date(completed[0].started_at).toLocaleDateString()}</span>
              <span>{completed.length} Audits Tracked</span>
              <span>{new Date(completed[completed.length - 1].started_at).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
