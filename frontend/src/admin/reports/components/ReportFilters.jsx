import React from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import AdminDropdown from '../../components/ui/AdminDropdown';

export default function ReportFilters({
  selectedReport,
  dateRange,
  setDateRange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  userFilter,
  setUserFilter,
  statusFilter,
  setStatusFilter,
  websiteFilter,
  setWebsiteFilter,
  usersList = [],
  websitesList = [],
  loading,
  onGenerate,
}) {
  const todayStr = new Date().toISOString().split('T')[0];

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const userOptions = [
    { value: 'all', label: 'All Users' },
    ...usersList.map((u) => ({ value: String(u.id), label: u.email })),
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active / Success' },
    { value: 'inactive', label: 'Inactive / Failed' },
    { value: 'pending', label: 'Pending / Running' },
  ];

  const websiteOptions = [
    { value: 'all', label: 'All Websites' },
    ...websitesList.map((w) => ({ value: String(w.id), label: w.domain || w.url })),
  ];

  return (
    <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-4 text-left font-sans">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
            Parameters — {selectedReport.replace(/_/g, ' ').toUpperCase()}
          </h3>
        </div>

        <button
          onClick={onGenerate}
          disabled={loading}
          className="px-4 py-2 bg-zinc-950 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Generating...' : 'Generate Report'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Date Range Dropdown */}
        <AdminDropdown
          label="Date Range"
          options={dateRangeOptions}
          value={dateRange}
          onChange={setDateRange}
        />

        {/* Custom Date Range Inputs (Max Date = Today) */}
        {dateRange === 'custom' && (
          <>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Start Date
              </label>
              <input
                type="date"
                max={endDate || todayStr}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 font-semibold text-xs text-zinc-950 focus:outline-none focus:border-zinc-950 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                End Date (Max Today)
              </label>
              <input
                type="date"
                max={todayStr}
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-50 font-semibold text-xs text-zinc-950 focus:outline-none focus:border-zinc-950 cursor-pointer"
              />
            </div>
          </>
        )}

        {/* User Filter Dropdown */}
        <AdminDropdown
          label="Customer"
          options={userOptions}
          value={userFilter}
          onChange={setUserFilter}
          searchable={usersList.length > 5}
        />

        {/* Status Filter Dropdown */}
        <AdminDropdown
          label="Status"
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />

        {/* Website Filter Dropdown (Audits report) */}
        {selectedReport === 'audits' && (
          <AdminDropdown
            label="Website"
            options={websiteOptions}
            value={websiteFilter}
            onChange={setWebsiteFilter}
            searchable={websitesList.length > 5}
          />
        )}
      </div>
    </div>
  );
}
