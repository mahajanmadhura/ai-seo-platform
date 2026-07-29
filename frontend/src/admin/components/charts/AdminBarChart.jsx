import React, { useState } from 'react';

export default function AdminBarChart({ data = [], dataKey = "credits", labelKey = "date", height = 200, color = "#18181B" }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-xs text-zinc-400 font-sans">
        No chart data available
      </div>
    );
  }

  const padding = 35;
  const chartWidth = 500;
  const chartHeight = height - padding * 2;
  const values = data.map((d) => d[dataKey] || 0);
  const max = Math.max(...values, 1);

  const barWidth = Math.max((chartWidth - padding * 2) / data.length - 12, 12);

  return (
    <div className="w-full overflow-hidden relative font-sans">
      <svg viewBox={`0 0 ${chartWidth} ${height}`} className="w-full h-auto overflow-visible">
        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio, idx) => (
          <line
            key={idx}
            x1={padding}
            y1={padding + chartHeight * ratio}
            x2={chartWidth - padding}
            y2={padding + chartHeight * ratio}
            stroke="#E4E4E7"
            strokeDasharray="3 3"
          />
        ))}

        {/* Bars */}
        {data.map((d, i) => {
          const val = d[dataKey] || 0;
          const bHeight = (val / max) * chartHeight;
          const x = padding + (i / data.length) * (chartWidth - padding * 2) + 6;
          const y = height - padding - bHeight;

          const isHovered = hoveredBar?.index === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredBar({ index: i, x: x + barWidth / 2, y, val, label: d[labelKey] })}
              onMouseLeave={() => setHoveredBar(null)}
              className="cursor-pointer"
            >
              <title>{`${d[labelKey]}: ${val.toLocaleString()}`}</title>

              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(bHeight, 3)}
                rx="4"
                fill={color}
                opacity={isHovered ? 1 : 0.85}
                className="transition-opacity duration-150"
              />
              <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" fill="#71717A" fontSize="9" fontWeight="600">
                {d[labelKey]}
              </text>
            </g>
          );
        })}

        {/* Interactive Hover Tooltip Box */}
        {hoveredBar && (
          <g transform={`translate(${Math.min(Math.max(hoveredBar.x - 45, 10), chartWidth - 100)}, ${Math.max(hoveredBar.y - 32, 10)})`}>
            <rect
              width="90"
              height="24"
              rx="6"
              fill="#0B0B0B"
              className="shadow-lg"
            />
            <text
              x="45"
              y="15"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="9"
              fontWeight="bold"
            >
              {`${hoveredBar.label}: ${hoveredBar.val.toLocaleString()}`}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
