import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Search,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../services/adminApi';
import AdminStatusBadge from '../components/ui/AdminStatusBadge';
import AdminSkeleton from '../components/ui/AdminSkeleton';
import AdminErrorState from '../components/ui/AdminErrorState';

export default function AdminRevenueView() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'transactions'

  const loadRevenueData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getRevenueOverview();
      setData(res.data || null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load revenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenueData();
  }, []);

  const summary = data?.summary || {
    total_revenue: 0,
    total_credits_sold: 0,
    total_transactions: 0,
    paying_users_count: 0,
    avg_order_value: 0
  };

  const userLedger = data?.user_ledger || [];
  const transactions = data?.transactions || [];

  const filteredUsers = userLedger.filter((u) =>
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTransactions = transactions.filter((t) =>
    (t.user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.user_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.payment_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.order_id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error && loading) {
    return <AdminErrorState message={error} onRetry={loadRevenueData} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 text-left font-sans pb-12"
    >
      {/* 1. Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-zinc-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-100 rounded-lg text-zinc-950">
            <CreditCard className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black text-zinc-950 tracking-tight">Revenue</h1>
        </div>

        <button
          onClick={loadRevenueData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Revenue</span>
          <span className="text-2xl font-black text-zinc-950 font-mono block leading-none">
            ₹{summary.total_revenue.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Credits</span>
          <span className="text-2xl font-black text-zinc-950 font-mono block leading-none">
            {summary.total_credits_sold.toLocaleString()}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Transactions</span>
          <span className="text-2xl font-black text-zinc-950 font-mono block leading-none">
            {summary.total_transactions}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Customers</span>
          <span className="text-2xl font-black text-zinc-950 font-mono block leading-none">
            {summary.paying_users_count}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Average Order</span>
          <span className="text-2xl font-black text-zinc-950 font-mono block leading-none">
            ₹{summary.avg_order_value}
          </span>
        </div>
      </div>

      {/* 3. Controls & Tables */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-zinc-950 text-white shadow-2xs'
                  : 'bg-zinc-100 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/70'
              }`}
            >
              Customers ({userLedger.length})
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'transactions'
                  ? 'bg-zinc-950 text-white shadow-2xs'
                  : 'bg-zinc-100 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/70'
              }`}
            >
              Transactions ({transactions.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-950 font-semibold focus:outline-none focus:border-zinc-400"
            />
          </div>
        </div>

        {/* TAB 1: CUSTOMERS */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {loading ? (
              <AdminSkeleton rows={5} />
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-xs font-semibold text-zinc-400">
                No transactions yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 text-zinc-500 font-bold uppercase tracking-wider text-[10px] border-b border-zinc-200">
                    <tr>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Orders</th>
                      <th className="py-3 px-4">Credits</th>
                      <th className="py-3 px-4">Revenue</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-semibold text-zinc-950">
                    {filteredUsers.map((user) => (
                      <tr key={user.user_id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-zinc-950 block">{user.name}</span>
                            <span className="text-[11px] text-zinc-500 font-mono block">{user.email}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold">
                          {user.tx_count}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                          {user.total_credits}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-black text-zinc-950 text-sm">
                          ₹{user.total_spent.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-500 text-[11px]">
                          {user.last_purchase ? new Date(user.last_purchase).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => navigate(`/admin/users?search=${encodeURIComponent(user.email)}`)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-950 hover:text-emerald-700 transition-colors cursor-pointer"
                          >
                            <span>View</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            {loading ? (
              <AdminSkeleton rows={5} />
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-xs font-semibold text-zinc-400">
                No transactions yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 text-zinc-500 font-bold uppercase tracking-wider text-[10px] border-b border-zinc-200">
                    <tr>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Credits</th>
                      <th className="py-3 px-4">Gateway</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-semibold text-zinc-950">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-zinc-950">
                          {tx.payment_id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-zinc-950 block">{tx.user_name}</span>
                            <span className="text-[11px] text-zinc-500 font-mono block">{tx.user_email}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-black text-zinc-950 text-sm">
                          ₹{tx.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                          +{tx.credits_purchased}
                        </td>
                        <td className="py-3.5 px-4 uppercase text-[11px] font-bold text-zinc-500">
                          {tx.gateway}
                        </td>
                        <td className="py-3.5 px-4">
                          <AdminStatusBadge status={tx.status} />
                        </td>
                        <td className="py-3.5 px-4 text-zinc-500 text-[11px]">
                          {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
