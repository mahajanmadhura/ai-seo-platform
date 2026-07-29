import React, { useState } from 'react';

export default function AdminHorizontalBarChart({ data = [], valueKey = "value", labelKey = "label", color = "#18181B" }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-zinc-400 font-sans">
        No ranking data available
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d[valueKey] || 0), 1);

  return (
    <div className="w-full space-y-3 font-sans text-xs">
      {data.map((item, idx) => {
        const val = item[valueKey] || 0;
        const widthPct = Math.max(Math.round((val / maxVal) * 100), 4);
        const isHovered = hoveredIdx === idx;

        return (
          <div
            key={idx}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`p-2 rounded-lg transition-all cursor-pointer space-y-1.5 ${
              isHovered ? 'bg-zinc-100' : 'hover:bg-zinc-50'
            }`}
          >
            <div className="flex items-center justify-between min-w-0">
              <span className="font-semibold text-zinc-800 truncate text-[11px] max-w-[200px]" title={item[labelKey]}>
                {item[labelKey]}
              </span>
              <span className="font-black text-zinc-950 font-mono text-xs">
                {typeof val === 'number' ? val.toLocaleString() : val}
              </span>
            </div>

            <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: isHovered ? '#09090B' : color
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
