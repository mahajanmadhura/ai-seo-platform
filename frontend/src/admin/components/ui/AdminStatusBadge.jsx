import React from 'react';

export default function AdminStatusBadge({ status, label }) {
  const normalized = String(status || '').toUpperCase();

  let styles = 'bg-neutral-100 text-neutral-700 border-neutral-200';
  let dotColor = 'bg-neutral-400';

  if (['DONE', 'ACTIVE', 'SUCCESS', 'RESOLVED', 'VERIFIED', 'UP'].includes(normalized)) {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (['RUNNING', 'IN_PROGRESS', 'PENDING'].includes(normalized)) {
    styles = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500 animate-pulse';
  } else if (['FAILED', 'ERROR', 'DOWN', 'CLOSED', 'UNVERIFIED', 'INACTIVE'].includes(normalized)) {
    styles = 'bg-red-50 text-red-800 border-red-200';
    dotColor = 'bg-red-500';
  }

  const displayLabel = label || (normalized === 'ACTIVE' ? 'Active' : normalized === 'INACTIVE' ? 'Inactive' : status);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{displayLabel}</span>
    </span>
  );
}
