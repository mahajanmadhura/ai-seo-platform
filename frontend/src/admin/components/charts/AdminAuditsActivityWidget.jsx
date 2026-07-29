import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';

export default function AdminAuditsActivityWidget({ data = [], breakdown = {} }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const maxVal = Math.max(...data.map((d) => d.count || 0), 1);
  const selectedIdx = hoveredIdx !== null ? hoveredIdx : data.length - 1;
  const activeDay = data[selectedIdx] || {};

  // Compute Peak Day & Average
  const peakDayObj = data.reduce((prev, current) => ((prev.count || 0) > (current.count || 0) ? prev : current), data[0] || {});
  const peakDayName = peakDayObj.day_name || peakDayObj.date || 'N/A';
  
  const totalCount = data.reduce((acc, d) => acc + (d.count || 0), 0);
  const avgPerDay = (totalCount / 7).toFixed(1);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs p-4 font-sans text-left min-w-0 overflow-hidden space-y-3 h-full flex flex-col justify-between hover:border-zinc-300 hover:shadow-xs transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-zinc-100 rounded-lg text-zinc-950 flex-shrink-0">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-950 text-xs uppercase tracking-wide">Daily Audit Activity</h3>
            <p className="text-[9px] text-zinc-400 font-semibold">Heatmap telemetry of audit executions.</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
          Last 7 Days
        </span>
      </div>

      {/* Main Grid: Left Heatmap Bars (65%), Right Summary (35%) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch flex-1">
        
        {/* LEFT: Dynamic Heatmap Capsule Bars */}
        <div className="sm:col-span-7 flex flex-col justify-between sm:border-r sm:border-zinc-100 sm:pr-3 min-h-[110px] relative pt-6 pb-1">
          
          {/* Tooltip on Hover */}
          <AnimatePresence>
            {hoveredIdx !== null && activeDay && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 bg-zinc-950 text-white rounded-lg p-2 shadow-xl border border-zinc-800 text-[10px] w-44 pointer-events-none space-y-1"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-0.5 font-bold text-[9px]">
                  <span className="text-zinc-300">{activeDay.date} ({activeDay.day_name})</span>
                  <span className="text-emerald-400 font-mono font-bold">+{activeDay.count || 0} Audits</span>
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Done:</span>
                    <span className="font-bold text-emerald-400">{activeDay.completed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Failed:</span>
                    <span className="font-bold text-red-400">{activeDay.failed || 0}</span>
                  </div>
                  <div className="flex justify-between col-span-2 pt-0.5 border-t border-zinc-800/80">
                    <span className="text-zinc-400">Credits Used:</span>
                    <span className="font-bold text-zinc-100">{activeDay.credits_consumed || 0} CR</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Capsule Bars Row */}
          <div className="flex items-end justify-between h-[95px] gap-2 px-1 relative">
            {data.map((item, idx) => {
              const val = item.count || 0;
              const ratio = maxVal > 0 ? val / maxVal : 0;
              const heightPercent = Math.max(ratio * 75 + 15, 15);
              const opacity = 0.15 + ratio * 0.85;
              const isSelected = idx === selectedIdx;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                >
                  <div className="w-full max-w-[28px] h-full flex items-end justify-center">
                    <motion.div
                      initial={{ height: "0%", opacity: 0 }}
                      animate={{ height: `${heightPercent}%`, opacity: opacity }}
                      transition={{ duration: 0.7, delay: idx * 0.05 }}
                      whileHover={{ scaleY: 1.06, y: -4 }}
                      className={`w-5 rounded-full bg-zinc-950 transition-all duration-200 ${
                        isSelected ? 'shadow-md border border-zinc-800' : ''
                      }`}
                    />
                  </div>

                  <span className={`text-[9px] block mt-1 leading-none ${isSelected ? 'text-zinc-950 font-black' : 'text-zinc-400 font-semibold'}`}>
                    {item.day_name || item.date?.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-[8px] text-zinc-400 font-bold text-center border-t border-zinc-100 pt-1 uppercase tracking-wider flex-shrink-0">
            Audit Execution Heatmap
          </div>
        </div>

        {/* RIGHT: Operational Summary Panel */}
        <div className="sm:col-span-5 flex flex-col justify-between space-y-2 text-[10.5px]">
          <span className="text-[8.5px] font-bold uppercase text-zinc-400 tracking-wider block">Summary Telemetry</span>

          <div className="space-y-2 flex-1 flex flex-col justify-center">
            <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-100 flex items-center justify-between">
              <span className="text-zinc-500 font-semibold text-[10px]">Total Audits</span>
              <span className="font-black text-zinc-950 font-mono text-sm">{(breakdown.total_audits || 0).toLocaleString()}</span>
            </div>

            <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-100 flex items-center justify-between">
              <span className="text-zinc-500 font-semibold text-[10px]">Peak Day</span>
              <span className="font-bold text-zinc-950 font-mono text-sm">{peakDayName}</span>
            </div>

            <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-100 flex items-center justify-between">
              <span className="text-zinc-500 font-semibold text-[10px]">Average</span>
              <span className="font-bold text-zinc-950 font-mono text-sm">{avgPerDay} / day</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
