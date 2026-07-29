import React from 'react';
import { RefreshCw } from 'lucide-react';
import AdminQuickActions from './AdminQuickActions';
import AdminSearch from './AdminSearch';

export default function AdminHeader({ title, subtitle, lastUpdated, onRefresh, loading, searchValue, onSearchChange, searchPlaceholder }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 text-left font-sans">
      <div>
        <h1 className="text-2xl font-black text-zinc-950 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {onSearchChange && (
          <AdminSearch
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder || "Search..."}
          />
        )}

        {lastUpdated && (
          <span className="text-[11px] font-semibold text-zinc-400 hidden sm:inline">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-zinc-200 text-xs font-bold text-zinc-950 rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        )}

        <AdminQuickActions />
      </div>
    </div>
  );
}
