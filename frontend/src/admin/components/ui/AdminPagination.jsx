import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminPagination({ pagination, currentPage, onPageChange }) {
  if (!pagination) return null;

  const { count, next, previous } = pagination;
  const hasNext = Boolean(next);
  const hasPrevious = Boolean(previous);

  return (
    <div className="flex items-center justify-between px-5 py-4 border-t border-border-color/40 bg-soft-bg/30 rounded-b-2xl">
      <span className="text-xs text-muted-text font-medium">
        Total <strong className="text-deep-green font-bold">{count ?? 0}</strong> records
      </span>

      <div className="flex items-center gap-2">
        <button
          disabled={!hasPrevious}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-color/60 bg-white text-xs font-bold text-deep-green disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Previous
        </button>
        <span className="text-xs font-bold text-deep-green px-2 py-1 bg-white rounded-lg border border-border-color/60">
          {currentPage}
        </span>
        <button
          disabled={!hasNext}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-color/60 bg-white text-xs font-bold text-deep-green disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
