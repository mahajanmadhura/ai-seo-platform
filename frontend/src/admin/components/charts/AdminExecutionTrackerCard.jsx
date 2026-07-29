import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function AdminExecutionTrackerCard({ breakdown = {} }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs p-4 font-sans text-left min-w-0 overflow-hidden space-y-3 h-full flex flex-col justify-between">
      <div className="space-y-2.5">
        <span className="text-[8.5px] font-bold uppercase text-zinc-400 tracking-wider block border-b border-zinc-100 pb-1">
          Activity
        </span>

        {/* Hero Summary Card */}
        <div className="bg-zinc-950 text-white p-3 rounded-xl border border-zinc-800 relative overflow-hidden shadow-xs flex flex-col justify-between min-h-[64px]">
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)',
              backgroundSize: '10px 10px',
            }}
          />
          <div className="relative z-10 space-y-0.5">
            <span className="text-[8px] font-bold uppercase text-zinc-400 tracking-widest block leading-none">
              Total Audits
            </span>
            <div className="flex items-baseline justify-between pt-0.5">
              <span className="text-xl font-black text-white tracking-tight leading-none">
                {(breakdown.total_audits || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Audit Status Breakdown */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[8.5px] font-bold uppercase text-zinc-400 tracking-wider block">Status</span>
          
          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-semibold">
            <div className="p-1.5 bg-zinc-50 rounded-lg border border-zinc-200/80 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-zinc-600 text-[9px]">Completed</span>
              </div>
              <span className="font-bold text-zinc-950">{breakdown.completed || 0}</span>
            </div>

            <div className="p-1.5 bg-zinc-50 rounded-lg border border-zinc-200/80 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-zinc-600 text-[9px]">Running</span>
              </div>
              <span className="font-bold text-zinc-950">{breakdown.running || 0}</span>
            </div>

            <div className="p-1.5 bg-zinc-50 rounded-lg border border-zinc-200/80 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-zinc-600 text-[9px]">Pending</span>
              </div>
              <span className="font-bold text-zinc-950">{breakdown.pending || 0}</span>
            </div>

            <div className="p-1.5 bg-zinc-50 rounded-lg border border-zinc-200/80 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-zinc-600 text-[9px]">Failed</span>
              </div>
              <span className="font-bold text-red-600">{breakdown.failed || 0}</span>
            </div>
          </div>

          <div className="p-1.5 bg-zinc-100/70 rounded-lg border border-zinc-200 flex items-center justify-between text-[10px] font-semibold">
            <span className="text-zinc-600 text-[9px]">Credits Consumed</span>
            <span className="font-mono font-bold text-zinc-950">{(breakdown.credits_used || 0).toLocaleString()} CR</span>
          </div>
        </div>
      </div>

      {/* Ledger Navigation Link Action */}
      <button
        onClick={() => navigate('/admin/audits')}
        className="w-full flex items-center justify-center gap-1 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-xs mt-2"
      >
        <span>View All Audits</span>
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}
