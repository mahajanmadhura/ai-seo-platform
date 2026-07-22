import React, { useState, useEffect, useMemo } from 'react';
import { getAdminUsers } from '../../services/admin';
import { exportToCSV } from '../utils/csvHelper';
import { useToast } from '../../context/ToastContext';
import {
  Search,
  Coins,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  UserCheck,
  ArrowUpDown,
  Download
} from 'lucide-react';
import CreditAdjustmentModal from './CreditAdjustmentModal';

export default function AdminUsersView() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search, Sort, Filter, Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'email', 'credits'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal target user state
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    const res = await getAdminUsers();
    if (res.success && res.data) {
      setUsers(res.data);
    } else {
      setError(res.message || 'Failed to load user listing.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateSuccess = (userId, newBalance) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, credits: newBalance } : user
      )
    );
  };

  const handleExportCSV = () => {
    const headers = [
      { label: 'User ID', key: 'id' },
      { label: 'Name', key: 'first_name' },
      { label: 'Email', key: 'email' },
      { label: 'Active', key: 'is_active' },
      { label: 'Credits', key: 'credits' }
    ];
    exportToCSV(filteredUsers, headers, 'athenura_users.csv');
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

  const getInitials = (firstName, email) => {
    if (firstName) return firstName.substring(0, 1).toUpperCase();
    if (email) return email.substring(0, 1).toUpperCase();
    return 'U';
  };

  // 1. Filter (Memoized)
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.first_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.is_active) ||
        (statusFilter === 'inactive' && !user.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  // 2. Sort (Memoized)
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let valA = '';
      let valB = '';

      if (sortBy === 'name') {
        valA = (a.first_name || '').toLowerCase();
        valB = (b.first_name || '').toLowerCase();
      } else if (sortBy === 'email') {
        valA = (a.email || '').toLowerCase();
        valB = (b.email || '').toLowerCase();
      } else if (sortBy === 'credits') {
        valA = a.credits ?? 0;
        valB = b.credits ?? 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortBy, sortOrder]);

  // 3. Paginate (Memoized)
  const paginatedUsers = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
  }, [sortedUsers, currentPage]);

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  return (
    <div className="space-y-5">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-100 pb-4 text-left">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-deep-green tracking-tight uppercase">User Management</h2>
          <p className="text-[10px] text-muted-text font-semibold">Monitor registered platform accounts and adjust credit balances.</p>
        </div>
        
        {/* Search & Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-grow sm:flex-grow-0 sm:w-60">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-deep-green bg-white text-deep-green font-semibold"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-mint-surface p-1 rounded-xl border border-neutral-200">
            {['all', 'active', 'inactive'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-white text-deep-green shadow-sm'
                    : 'text-neutral-400 hover:text-deep-green'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={filteredUsers.length === 0}
            className="p-2 border border-neutral-200 rounded-xl bg-white hover:bg-neutral-50 text-deep-green flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 border border-neutral-100 text-center flex flex-col items-center justify-center min-h-[300px] shadow-sm">
          <Loader2 className="w-8 h-8 text-deep-green animate-spin" />
          <p className="text-[10px] text-muted-text mt-3 font-black uppercase tracking-wider">Retrieving user listings...</p>
        </div>
      ) : error ? (
        <div className="bg-white border border-red-100 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-deep-green uppercase tracking-wider">Data Fetch Failed</h3>
          <p className="text-xs text-muted-text font-semibold">{error}</p>
          <button
            onClick={fetchUsers}
            className="bg-deep-green hover:bg-forest-green text-white px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer"
          >
            Reload Listing
          </button>
        </div>
      ) : paginatedUsers.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-neutral-100 text-center shadow-sm min-h-[250px] flex flex-col items-center justify-center">
          <UserCheck className="w-10 h-10 text-neutral-300 mb-3" />
          <p className="text-xs font-black uppercase text-deep-green">No Users Found</p>
          <p className="text-[10px] text-muted-text font-semibold mt-1.5 max-w-xs leading-relaxed">
            No accounts match your current filtering parameters or search criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-neutral-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-150 text-[10px] font-black uppercase text-muted-text bg-[#F8FAFC]">
                    <th className="p-4 pl-6 cursor-pointer hover:text-deep-green transition-colors" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">
                        <span>Profile User</span>
                        <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                      </div>
                    </th>
                    <th className="p-4 cursor-pointer hover:text-deep-green transition-colors" onClick={() => handleSort('email')}>
                      <div className="flex items-center gap-1">
                        <span>Email Address</span>
                        <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                      </div>
                    </th>
                    <th className="p-4">Status</th>
                    <th className="p-4 cursor-pointer hover:text-deep-green transition-colors" onClick={() => handleSort('credits')}>
                      <div className="flex items-center gap-1">
                        <span>Credit Balance</span>
                        <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                      </div>
                    </th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {paginatedUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-mint-surface/5 transition-colors"
                    >
                      {/* User profile avatar / name */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-deep-green/5 border border-deep-green/10 text-deep-green font-black text-xs flex items-center justify-center flex-shrink-0">
                            {getInitials(user.first_name, user.email)}
                          </div>
                          <span className="text-xs font-black text-deep-green">
                            {user.first_name || 'Athenura User'}
                          </span>
                        </div>
                      </td>
                      
                      {/* Email */}
                      <td className="p-4">
                        <span className="text-xs text-muted-text font-semibold">{user.email}</span>
                      </td>
                      
                      {/* StatusBadge */}
                      <td className="p-4">
                        {user.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#E5F3EC] text-forest-green border border-forest-green/20">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </td>

                      {/* Credit balance */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <Coins className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-xs font-black text-deep-green">
                            {user.credits !== undefined ? user.credits : 0}
                          </span>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-1.5">
                          
                          {/* Adjust Credits */}
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="bg-deep-green hover:bg-forest-green border border-deep-green text-white p-1.5 rounded-lg hover:shadow-xs transition-all cursor-pointer flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
                            title="Adjust Credits"
                          >
                            <Coins className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Adjust</span>
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] text-muted-text font-bold">
                Page {currentPage} of {totalPages} ({sortedUsers.length} entries)
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

      {/* Credit adjustment Modal */}
      {selectedUser && (
        <CreditAdjustmentModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}

    </div>
  );
}
