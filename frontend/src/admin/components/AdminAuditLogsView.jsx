import React, { useState, useEffect, useMemo } from 'react';
import { getAdminAuditLogs } from '../../services/admin';
import { exportToCSV } from '../utils/csvHelper';
import {
  History,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Search,
  ArrowUpDown,
  Download
} from 'lucide-react';

export default function AdminAuditLogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search, Sort, Filter, Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'amount'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    const res = await getAdminAuditLogs();
    if (res.success && res.data) {
      setLogs(res.data);
    } else {
      setError(res.message || 'Failed to retrieve transaction logs.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportCSV = () => {
    const headers = [
      { label: 'Log ID', key: 'id' },
      { label: 'Date', key: 'created_at' },
      { label: 'Type', key: 'transaction_type' },
      { label: 'Amount', key: 'amount' },
      { label: 'Description', key: 'description' }
    ];
    exportToCSV(filteredLogs, headers, 'credit_activity_logs.csv');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'purchase':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-[#E5F3EC] text-forest-green border border-forest-green/20">
            Purchase
          </span>
        );
      case 'audit_deduction':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
            Audit Deduction
          </span>
        );
      case 'admin_adjustment':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
            Admin Adjustment
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-gray-50 text-gray-700 border border-gray-200">
            {type ? type.replace('_', ' ') : 'Transaction'}
          </span>
        );
    }
  };

  // Helper to categorize log dates
  const getGroupTitle = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (compareDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (compareDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else if (compareDate.getTime() >= sevenDaysAgo.getTime()) {
      return 'Last 7 Days';
    } else {
      return 'Older';
    }
  };

  // 1. Filter (Memoized)
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = (log.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        typeFilter === 'all' ||
        (typeFilter === 'purchase' && log.transaction_type === 'purchase') ||
        (typeFilter === 'deduction' && log.transaction_type === 'audit_deduction') ||
        (typeFilter === 'adjustment' && log.transaction_type === 'admin_adjustment');

      return matchesSearch && matchesType;
    });
  }, [logs, searchTerm, typeFilter]);

  // 2. Sort (Memoized)
  const sortedLogs = useMemo(() => {
    return [...filteredLogs].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else if (sortBy === 'amount') {
        const amtA = a.amount || 0;
        const amtB = b.amount || 0;
        return sortOrder === 'desc' ? amtB - amtA : amtA - amtB;
      }
      return 0;
    });
  }, [filteredLogs, sortBy, sortOrder]);

  // 3. Paginate (Memoized)
  const currentLogs = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortedLogs.slice(indexOfFirstItem, indexOfLastItem);
  }, [sortedLogs, currentPage]);

  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);

  // Grouped paginated records visually
  const groupedLogs = useMemo(() => {
    const groups = [];
    currentLogs.forEach((log) => {
      const title = getGroupTitle(log.created_at);
      let group = groups.find((g) => g.title === title);
      if (!group) {
        group = { title, items: [] };
        groups.push(group);
      }
      group.items.push(log);
    });
    // Order groups Today -> Yesterday -> Last 7 Days -> Older
    const order = ['Today', 'Yesterday', 'Last 7 Days', 'Older'];
    return groups.sort((a, b) => order.indexOf(a.title) - order.indexOf(b.title));
  }, [currentLogs]);

  return (
    <div className="space-y-5">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-100 pb-4 text-left">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-deep-green tracking-tight uppercase">Credit Activity Logs</h2>
          <p className="text-[10px] text-muted-text font-semibold">Historical audit log tracking purchases, usage deductions, and admin credit adjustments.</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-grow sm:flex-grow-0 sm:w-60">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search descriptions..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-deep-green bg-white text-deep-green font-semibold"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-mint-surface p-1 rounded-xl border border-neutral-200">
            {[
              { label: 'All', value: 'all' },
              { label: 'Purchases', value: 'purchase' },
              { label: 'Deductions', value: 'deduction' },
              { label: 'Adjustments', value: 'adjustment' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => {
                  setTypeFilter(filter.value);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${
                  typeFilter === filter.value
                    ? 'bg-white text-deep-green shadow-sm'
                    : 'text-neutral-400 hover:text-deep-green'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="p-2 border border-neutral-200 rounded-xl bg-white hover:bg-neutral-50 text-deep-green flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 border border-neutral-100 text-center flex flex-col items-center justify-center min-h-[300px] shadow-sm animate-pulse">
          <Loader2 className="w-8 h-8 text-deep-green animate-spin" />
          <p className="text-[10px] text-muted-text mt-3 font-black uppercase tracking-wider">Fetching transaction logs...</p>
        </div>
      ) : error ? (
        <div className="bg-white border border-red-100 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-deep-green uppercase tracking-wider">Retrieval Failed</h3>
          <p className="text-xs text-muted-text font-semibold">{error}</p>
          <button
            onClick={fetchLogs}
            className="bg-deep-green hover:bg-forest-green text-white px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer"
          >
            Reload Logs
          </button>
        </div>
      ) : groupedLogs.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-neutral-100 text-center shadow-sm min-h-[250px] flex flex-col items-center justify-center">
          <History className="w-10 h-10 text-neutral-300 mb-3" />
          <p className="text-xs font-black uppercase text-deep-green">No Logs Registered</p>
          <p className="text-[10px] text-muted-text font-semibold mt-1.5 max-w-xs leading-relaxed">
            There are currently no credit transactions matching your criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-neutral-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-150 text-[10px] font-black uppercase text-muted-text bg-[#F8FAFC]">
                    <th className="p-4 pl-6 cursor-pointer hover:text-deep-green transition-colors" onClick={() => handleSort('date')}>
                      <div className="flex items-center gap-1">
                        <span>Date</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-neutral-450" />
                      </div>
                    </th>
                    <th className="p-4">Transaction Type</th>
                    <th className="p-4 cursor-pointer hover:text-deep-green transition-colors" onClick={() => handleSort('amount')}>
                      <div className="flex items-center gap-1">
                        <span>Amount</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-neutral-455" />
                      </div>
                    </th>
                    <th className="p-4 pr-6">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedLogs.map((group) => (
                    <React.Fragment key={group.title}>
                      {/* Date Bucket divider */}
                      <tr className="bg-neutral-50/80 border-y border-neutral-100">
                        <td colSpan={4} className="px-6 py-2 text-[9px] font-black uppercase text-muted-text tracking-wider">
                          {group.title}
                        </td>
                      </tr>
                      {group.items.map((log) => {
                        const isPositive = log.amount > 0;
                        return (
                          <tr key={log.id} className="hover:bg-mint-surface/5 transition-colors">
                            
                            {/* Date */}
                            <td className="p-4 pl-6 text-xs text-neutral-400 font-semibold">
                              {new Date(log.created_at).toLocaleString()}
                            </td>

                            {/* Transaction Type */}
                            <td className="p-4">
                              {getTypeBadge(log.transaction_type)}
                            </td>

                            {/* Amount */}
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-black px-2 py-0.5 rounded-lg border ${
                                isPositive 
                                  ? 'bg-[#E5F3EC] text-forest-green border-forest-green/20' 
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}>
                                {isPositive ? (
                                  <>
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    +{log.amount} tokens
                                  </>
                                ) : (
                                  <>
                                    <TrendingDown className="w-3.5 h-3.5" />
                                    {log.amount} tokens
                                  </>
                                )}
                              </span>
                            </td>

                            {/* Description */}
                            <td className="p-4 pr-6 text-xs text-deep-green font-semibold">
                              {log.description}
                            </td>

                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] text-muted-text font-bold">
                Page {currentPage} of {totalPages} ({sortedLogs.length} entries)
              </span>
              <div className="flex gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 rounded-lg border border-neutral-250 bg-white hover:bg-neutral-50 text-[10px] font-black uppercase text-deep-green disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-3 py-1.5 rounded-lg border border-neutral-250 bg-white hover:bg-neutral-50 text-[10px] font-black uppercase text-deep-green disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
