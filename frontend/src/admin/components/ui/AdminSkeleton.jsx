import React from 'react';

export function AdminKPISkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white p-4.5 rounded-xl border border-zinc-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-2.5 w-24 bg-zinc-200 rounded" />
            <div className="h-4 w-12 bg-zinc-100 rounded border border-zinc-200" />
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <div className="h-7 w-28 bg-zinc-300 rounded" />
            <div className="h-6 w-16 bg-zinc-100 rounded" />
          </div>
          <div className="h-2.5 w-36 bg-zinc-200 rounded pt-1" />
        </div>
      ))}
    </div>
  );
}

export function AdminChartSkeleton({ height = 170 }) {
  return (
    <div className="w-full bg-white p-5 rounded-xl border border-zinc-200 shadow-2xs space-y-4 animate-pulse">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
        <div className="h-3 w-40 bg-zinc-300 rounded" />
        <div className="h-3 w-24 bg-zinc-200 rounded" />
      </div>
      <div style={{ height }} className="w-full bg-zinc-50 rounded-lg flex items-end justify-between p-4 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="w-full bg-zinc-200 rounded-t"
            style={{ height: `${(i % 3 + 1) * 25 + 20}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function AdminDonutSkeleton({ size = 140 }) {
  return (
    <div className="w-full bg-white p-5 rounded-xl border border-zinc-200 shadow-2xs space-y-4 animate-pulse">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
        <div className="h-3 w-44 bg-zinc-300 rounded" />
        <div className="h-3 w-16 bg-zinc-200 rounded" />
      </div>
      <div className="flex items-center justify-between gap-6 py-2">
        <div style={{ width: size, height: size }} className="rounded-full border-8 border-zinc-200 flex items-center justify-center shrink-0">
          <div className="h-5 w-10 bg-zinc-300 rounded" />
        </div>
        <div className="flex-1 space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-3 w-24 bg-zinc-200 rounded" />
              <div className="h-3 w-10 bg-zinc-300 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminInfrastructureSkeleton() {
  return (
    <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-2xs space-y-3.5 animate-pulse">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
        <div className="h-3 w-48 bg-zinc-300 rounded" />
        <div className="h-4 w-32 bg-zinc-100 rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-3 rounded-lg border border-zinc-200 bg-zinc-50 space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-zinc-300 rounded" />
              <div className="h-2 w-2 bg-zinc-300 rounded-full" />
            </div>
            <div className="h-3 w-20 bg-zinc-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminTimelineSkeleton() {
  return (
    <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-2xs space-y-4 animate-pulse">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
        <div className="h-3 w-40 bg-zinc-300 rounded" />
        <div className="h-3 w-24 bg-zinc-200 rounded" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 py-2 border-b border-zinc-100">
            <div className="w-8 h-8 rounded-lg bg-zinc-200 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-48 bg-zinc-300 rounded" />
              <div className="h-2.5 w-64 bg-zinc-200 rounded" />
            </div>
            <div className="h-3 w-12 bg-zinc-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="w-full space-y-3 animate-pulse p-4 font-sans">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4 py-2 border-b border-zinc-100">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <div
              key={cIdx}
              className="h-4 bg-zinc-200/80 rounded-md flex-1"
              style={{ width: `${Math.floor(Math.random() * 40 + 60)}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
