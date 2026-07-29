import React from 'react';

export default function ReportSkeleton() {
  return (
    <div className="space-y-5 animate-pulse font-sans">
      {/* 4 Skeleton KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-2">
            <div className="h-2.5 bg-zinc-200 rounded w-24" />
            <div className="h-7 bg-zinc-200 rounded w-16" />
          </div>
        ))}
      </div>

      {/* Skeleton Preview Table Container */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden w-full space-y-3 p-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="h-4 bg-zinc-200 rounded w-48" />
          <div className="flex gap-2">
            <div className="h-7 bg-zinc-200 rounded w-16" />
            <div className="h-7 bg-zinc-200 rounded w-16" />
          </div>
        </div>

        {/* Rows Skeleton */}
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((rowIdx) => (
            <div key={rowIdx} className="flex items-center justify-between gap-4 py-2 border-b border-zinc-100">
              <div className="h-3.5 bg-zinc-100 rounded w-1/5" />
              <div className="h-3.5 bg-zinc-100 rounded w-1/4" />
              <div className="h-3.5 bg-zinc-100 rounded w-1/6" />
              <div className="h-3.5 bg-zinc-100 rounded w-1/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
