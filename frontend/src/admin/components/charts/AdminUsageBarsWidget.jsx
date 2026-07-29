import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Cpu, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminUsageBarsWidget({
  title = "Usage Telemetry",
  subtitle = "Daily usage logs",
  icon: Icon = Coins,
  data = [],
  unit = "cr",
  summaryItems = []
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const maxVal = Math.max(...data.map(d => d.value || 0), 1);
  const selectedIdx = hoveredIdx !== null ? hoveredIdx : data.length - 1;
  const activeDay = data[selectedIdx] || {};

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs p-4 font-sans text-left min-w-0 overflow-hidden space-y-3 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-zinc-100 rounded-lg text-zinc-950 flex-shrink-0">
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-950 text-xs uppercase tracking-wide">{title}</h3>
            <p className="text-[9px] text-zinc-400 font-semibold">{subtitle}</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
          Last 7 Days
        </span>
      </div>

      {/* Main Grid: Left Bars (60%), Right Summary (40%) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch flex-1">
        
        {/* LEFT: Client-style Small Rounded Vertical Bars */}
        <div className="sm:col-span-7 flex flex-col justify-between sm:border-r sm:border-zinc-100 sm:pr-2.5 min-h-[110px] relative pt-5 pb-1">
          
          {/* Tooltip on Hover */}
          <AnimatePresence>
            {hoveredIdx !== null && activeDay && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 bg-zinc-950 text-white rounded-md px-2 py-1 text-[9px] font-mono shadow-md border border-zinc-800 pointer-events-none text-center"
              >
                {activeDay.date}: {activeDay.value ? activeDay.value.toLocaleString() : 0} {unit}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bars Row */}
          <div className="flex items-end justify-between h-[90px] gap-1.5 px-0.5 relative">
            {data.map((item, idx) => {
              const isSelected = idx === selectedIdx;
              const heightPercent = Math.max(Math.round((item.value / maxVal) * 100), 14);

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                >
                  <div className="w-full max-w-[22px] h-full flex items-end justify-center">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.35, delay: idx * 0.04 }}
                      className={`w-4 rounded-full transition-all duration-300 ${
                        isSelected
                          ? 'bg-zinc-950 border border-zinc-800 shadow-xs scale-105'
                          : 'bg-zinc-100 border border-zinc-200/80 group-hover:bg-zinc-200'
                      }`}
                    />
                  </div>

                  <span className={`text-[8.5px] block mt-1 leading-none ${isSelected ? 'text-zinc-950 font-black' : 'text-zinc-400 font-bold'}`}>
                    {item.day_name || item.date?.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-[8px] text-zinc-400 font-bold text-center border-t border-zinc-100 pt-1 uppercase tracking-wider flex-shrink-0">
            Daily Log
          </div>
        </div>

        {/* RIGHT: Side Summary Panel */}
        <div className="sm:col-span-5 flex flex-col justify-between space-y-1.5 text-[10px]">
          <span className="text-[8.5px] font-bold uppercase text-zinc-400 tracking-wider block">Telemetry Summary</span>

          <div className="space-y-1.5 flex-1 flex flex-col justify-center">
            {summaryItems.map((s, idx) => (
              <div key={idx} className="p-1.5 bg-zinc-50 rounded border border-zinc-100 flex items-center justify-between">
                <span className="text-zinc-500 font-semibold text-[9.5px]">{s.label}</span>
                <span className="font-bold text-zinc-950 font-mono text-[10.5px]">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
