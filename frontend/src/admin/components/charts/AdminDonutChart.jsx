import React, { useState } from 'react';

export default function AdminDonutChart({ data = [], size = 140 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height: size }} className="flex items-center justify-center text-xs text-zinc-400 font-sans">
        No category distribution records
      </div>
    );
  }

  const total = data.reduce((acc, d) => acc + (d.count || 0), 0) || 1;
  const colors = ['#09090B', '#27272A', '#52525B', '#71717A', '#A1A1AA', '#D4D4D8'];

  let accumulatedAngle = 0;
  const radius = size / 2 - 16;
  const center = size / 2;
  const strokeWidth = 22;

  const slices = data.map((d, i) => {
    const value = d.count || 0;
    const percentage = value / total;
    const strokeDasharray = `${percentage * 2 * Math.PI * radius} ${2 * Math.PI * radius}`;
    const strokeDashoffset = -accumulatedAngle * 2 * Math.PI * radius;
    accumulatedAngle += percentage;

    return {
      category: (d.issue_category || 'General').replace(/_/g, ' '),
      count: value,
      color: colors[i % colors.length],
      strokeDasharray,
      strokeDashoffset,
      percentage: Math.round(percentage * 100)
    };
  });

  const activeSlice = hoveredIdx !== null ? slices[hoveredIdx] : null;

  return (
    <div className="w-full max-w-full overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
      {/* Donut Ring Graphic Container */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 overflow-visible">
          {slices.map((slice, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="transition-all duration-150 cursor-pointer"
              />
            );
          })}
        </svg>

        {/* Center Callout Text inside the Ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-1">
          <span className="text-xl font-black text-zinc-950 tracking-tight leading-none">
            {activeSlice ? activeSlice.count : total}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mt-1 truncate max-w-[80px]">
            {activeSlice ? activeSlice.category : 'Total Issues'}
          </span>
        </div>
      </div>

      {/* Enterprise Legend Column with Truncation Bounds */}
      <div className="flex-1 min-w-0 w-full space-y-1.5 text-xs text-left overflow-hidden">
        {slices.map((s, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between p-1.5 rounded-lg transition-all cursor-pointer min-w-0 ${
                isHovered ? 'bg-zinc-100 font-bold' : 'hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span
                  className="capitalize text-zinc-800 font-semibold truncate text-[11px]"
                  title={s.category}
                >
                  {s.category}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0 text-right font-mono ml-2">
                <span className="font-black text-zinc-950 text-xs">{s.count}</span>
                <span className="text-[10px] font-bold text-zinc-400 text-right min-w-[28px]">
                  ({s.percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
