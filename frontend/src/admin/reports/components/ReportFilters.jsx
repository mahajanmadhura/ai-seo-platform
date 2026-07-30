import React from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import AdminDropdown from '../../components/ui/AdminDropdown';

export const REPORT_CONFIG = {
  revenue: {
    showDateRange: true,
    showUserFilter: true,
    showStatusFilter: true,
    showGatewayFilter: true,
    showWebsiteFilter: false,
    statusOptions: [
      { value: 'all', label: 'All Payment Statuses' },
      { value: 'success', label: 'Success' },
      { value: 'pending', label: 'Pending' },
      { value: 'failed', label: 'Failed' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
    gatewayOptions: [
      { value: 'all', label: 'All Payment Methods' },
      { value: 'online', label: 'Online Payment' },
      { value: 'wallet', label: 'Wallet Credit' },
      { value: 'manual', label: 'Manual Adjustment' },
    ],
  },
  customers: {
    showDateRange: true,
    showUserFilter: false,
    showStatusFilter: true,
    showGatewayFilter: false,
    showWebsiteFilter: false,
    statusOptions: [
      { value: 'all', label: 'All Account Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'verified', label: 'Verified' },
      { value: 'unverified', label: 'Unverified' },
    ],
  },
  users: {
    showDateRange: true,
    showUserFilter: false,
    showStatusFilter: true,
    showGatewayFilter: false,
    showWebsiteFilter: false,
    statusOptions: [
      { value: 'all', label: 'All Account Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'verified', label: 'Verified' },
      { value: 'unverified', label: 'Unverified' },
    ],
  },
  audits: {
    showDateRange: true,
    showUserFilter: false,
    showStatusFilter: true,
    showGatewayFilter: false,
    showWebsiteFilter: true,
    statusOptions: [
      { value: 'all', label: 'All Audit Statuses' },
      { value: 'completed', label: 'Completed' },
      { value: 'running', label: 'Running' },
      { value: 'failed', label: 'Failed' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
  ai_usage: {
    showDateRange: true,
    showUserFilter: true,
    showStatusFilter: false,
    showGatewayFilter: false,
    showWebsiteFilter: true,
    statusOptions: [],
  },
  credits: {
    showDateRange: true,
    showUserFilter: true,
    showStatusFilter: false,
    showGatewayFilter: false,
    showWebsiteFilter: true,
    statusOptions: [],
  },
};

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
  gatewayFilter,
  setGatewayFilter,
  websiteFilter,
  setWebsiteFilter,
  usersList = [],
  websitesList = [],
  loading,
  onRefresh,
}) {
  const todayStr = new Date().toISOString().split('T')[0];

  const config = REPORT_CONFIG[selectedReport] || REPORT_CONFIG.revenue;

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
    { value: 'all', label: 'All Customers' },
    ...usersList.map((u) => ({ value: String(u.id), label: u.email })),
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
            Filters — {selectedReport.replace(/_/g, ' ').toUpperCase()}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Live Preview Sync
          </span>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
            title="Force Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Date Range Dropdown */}
        {config.showDateRange && (
          <AdminDropdown
            label="Date Range"
            options={dateRangeOptions}
            value={dateRange}
            onChange={setDateRange}
          />
        )}

        {/* Custom Date Range Inputs (Max Date = Today) */}
        {config.showDateRange && dateRange === 'custom' && (
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

        {/* Customer Filter Dropdown */}
        {config.showUserFilter && (
          <AdminDropdown
            label="Customer"
            options={userOptions}
            value={userFilter}
            onChange={setUserFilter}
            searchable={usersList.length > 5}
          />
        )}

        {/* Status Filter Dropdown */}
        {config.showStatusFilter && (
          <AdminDropdown
            label="Status"
            options={config.statusOptions || []}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        )}

        {/* Payment Method Filter Dropdown */}
        {config.showGatewayFilter && (
          <AdminDropdown
            label="Payment Method"
            options={config.gatewayOptions || []}
            value={gatewayFilter}
            onChange={setGatewayFilter}
          />
        )}

        {/* Website Filter Dropdown */}
        {config.showWebsiteFilter && (
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
