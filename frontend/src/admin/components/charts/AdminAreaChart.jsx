import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function AdminAreaChart({ data = [], dataKey = "amount", labelKey = "date", height = 185, color = "#18181B" }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-xs text-zinc-400 font-sans">
        No revenue telemetry available
      </div>
    );
  }

  // Tighter padding to maximize graph drawing area (~70% of card)
  const paddingX = 16;
  const paddingTop = 8;
  const paddingBottom = 20;
  const chartWidth = 500;
  const chartHeight = height - paddingTop - paddingBottom;

  const values = data.map((d) => Number(d[dataKey]) || 0);
  const dataMax = Math.max(...values, 1);
  const nonZeroValues = values.filter(v => v > 0);
  const dataMin = nonZeroValues.length > 0 ? Math.min(...nonZeroValues) : 0;

  // Dynamic Vertical Scaling logic
  let yMin = 0;
  let yMax = dataMax;

  if (dataMax > 0 && nonZeroValues.length > 1 && dataMax !== dataMin) {
    const range = dataMax - dataMin;
    yMin = Math.max(0, dataMin - range * 0.25);
    yMax = dataMax + range * 0.15;
  } else {
    yMin = 0;
    yMax = dataMax * 1.2;
  }

  const rangeY = yMax - yMin || 1;

  const points = data.map((d, i) => {
    const val = Number(d[dataKey]) || 0;
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * (chartWidth - paddingX * 2);
    const y = paddingTop + chartHeight - ((val - yMin) / rangeY) * chartHeight;
    return { x, y, value: val, label: d[labelKey] };
  });

  const pathD = points.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  return (
    <div className="w-full overflow-hidden relative font-sans">
      <svg viewBox={`0 0 ${chartWidth} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          {/* Enhanced Drop Shadow Filter for Enterprise Line Path */}
          <filter id="areaLineShadow" x="-10%" y="-10%" width="130%" height="160%">
            <feDropShadow dx="0" dy="5" stdDeviation="4.5" floodColor="#000000" floodOpacity="0.3" />
          </filter>

          {/* Visible Monochrome Area Fill Gradient */}
          <linearGradient id={`areaGradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.45" />
            <stop offset="55%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* 3 Subtle Horizontal Grid Lines */}
        {[0, 0.5, 1].map((ratio, idx) => (
          <line
            key={idx}
            x1={paddingX}
            y1={paddingTop + chartHeight * ratio}
            x2={chartWidth - paddingX}
            y2={paddingTop + chartHeight * ratio}
            stroke="#F4F4F6"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
        ))}

        {/* Animated Area Fill */}
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          d={areaD}
          fill={`url(#areaGradient-${dataKey})`}
        />

        {/* Animated 3px Stroke Line with Drop Shadow */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#areaLineShadow)"
        />

        {/* Points & Interactive Tooltip Nodes */}
        {points.map((pt, i) => {
          const isHovered = hoveredPoint?.label === pt.label;
          const isLast = i === points.length - 1;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
              className="cursor-pointer"
            >
              <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 + i * 0.04 }}
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? "7" : isLast ? "5" : "3.5"}
                fill={isHovered || isLast ? color : "#FFFFFF"}
                stroke={color}
                strokeWidth={isHovered ? "3" : "2.5"}
                className="transition-all duration-150 shadow-xs"
              />

              <text
                x={pt.x}
                y={height - 4}
                textAnchor="middle"
                fill={isHovered ? "#09090B" : "#A1A1AA"}
                fontSize="9.5"
                fontWeight={isHovered ? "800" : "600"}
              >
                {pt.label}
              </text>
            </g>
          );
        })}

        {/* Floating Enterprise Tooltip */}
        {hoveredPoint && (
          <g transform={`translate(${Math.min(Math.max(hoveredPoint.x - 55, 10), chartWidth - 120)}, ${Math.max(hoveredPoint.y - 32, 2)})`}>
            <rect
              width="110"
              height="26"
              rx="6"
              fill="#09090B"
              className="shadow-2xl border border-zinc-800"
            />
            <text
              x="55"
              y="16"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="10"
              fontWeight="bold font-mono"
            >
              {`${hoveredPoint.label}: ₹${typeof hoveredPoint.value === 'number' ? hoveredPoint.value.toLocaleString('en-IN') : hoveredPoint.value}`}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
