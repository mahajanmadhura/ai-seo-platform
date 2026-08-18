import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPaymentHistory, getCreditTransactions } from '../../services/payments';
import DashboardLayout from '../../components/DashboardLayout';
import {
  ArrowLeft,
  FileText,
  Loader2,
  CreditCard,
  Coins,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Ban
} from 'lucide-react';

export default function Transactions() {
  const navigate = useNavigate();
  const { credits, refreshCredits } = useAuth();

  const [activeTab, setActiveTab] = useState('payments'); // 'payments' | 'ledger'
  const [payments, setPayments] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [paymentFilter, setPaymentFilter] = useState('all'); // all | success | pending | failed | cancelled
  const [ledgerFilter, setLedgerFilter] = useState('all'); // all | purchase | audit_deduction | admin_adjustment

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      await refreshCredits();
      const [payRes, ledRes] = await Promise.all([
        getPaymentHistory(),
        getCreditTransactions(),
      ]);

      if (payRes.success) {
        setPayments(payRes.data || []);
      }
      if (ledRes.success) {
        setLedger(ledRes.data || []);
      }
    } catch (err) {
      setError('Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Datasets
  const filteredPayments = payments.filter((p) => {
    if (paymentFilter === 'all') return true;
    return p.status?.toLowerCase() === paymentFilter.toLowerCase();
  });

  const filteredLedger = ledger.filter((l) => {
    if (ledgerFilter === 'all') return true;
    return l.transaction_type === ledgerFilter;
  });

  // Calculate Payment History Metrics
  const totalAmountPaid = payments
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const successfulPaymentsCount = payments.filter((p) => p.status === 'success').length;
  const pendingPaymentsCount = payments.filter((p) => p.status === 'pending').length;
  const failedOrCancelledCount = payments.filter((p) => p.status === 'failed' || p.status === 'cancelled').length;

  // Calculate Credit Ledger Metrics
  const totalPurchasedCredits = ledger
    .filter((l) => l.amount > 0 && l.transaction_type === 'purchase')
    .reduce((sum, l) => sum + l.amount, 0);

  const totalUsedCredits = ledger
    .filter((l) => l.amount < 0)
    .reduce((sum, l) => sum + Math.abs(l.amount), 0);

  const renderStatusBadge = (statusStr) => {
    const s = String(statusStr).toLowerCase();
    switch (s) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Success
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600 animate-spin" /> Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3 text-red-600" /> Failed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-zinc-100 text-zinc-600 border border-zinc-200">
            <Ban className="w-3 h-3 text-zinc-500" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-zinc-100 text-zinc-700">
            {statusStr}
          </span>
        );
    }
  };

  return (
    <DashboardLayout title="Billing & Ledger History" backLink="/settings?tab=billing">
      <div className="space-y-6 text-left font-sans">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-black text-deep-green tracking-tight font-sans">
              Billing & Ledger Portal
            </h2>
            <p className="text-xs text-muted-text font-semibold">
              Separate financial payment receipts and credit wallet balance activity logs.
            </p>
          </div>
          <button
            onClick={() => navigate('/settings?tab=billing')}
            className="inline-flex items-center gap-2 bg-[#E5F3EC] hover:bg-deep-green/10 text-deep-green border border-deep-green/10 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Billing
          </button>
        </div>

        {error && (
          <div className="bg-red-500/5 border border-red-500/15 text-red-700 p-4 rounded-xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        {/* Primary Tabs Navigation */}
        <div className="flex border-b border-border-color/50 gap-2">
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider cursor-pointer transition-all border-b-2 ${activeTab === 'payments'
                ? 'border-deep-green text-deep-green bg-deep-green/5 rounded-t-xl'
                : 'border-transparent text-muted-text hover:text-deep-green'
              }`}
          >
            <CreditCard className="w-4 h-4" />
            Payment History ({payments.length})
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider cursor-pointer transition-all border-b-2 ${activeTab === 'ledger'
                ? 'border-deep-green text-deep-green bg-deep-green/5 rounded-t-xl'
                : 'border-transparent text-muted-text hover:text-deep-green'
              }`}
          >
            <Coins className="w-4 h-4" />
            Credit Ledger ({ledger.length})
          </button>
        </div>

        {/* TAB 1: FINANCIAL PAYMENT HISTORY */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* KPI Cards for Payment History */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-border-color/50 shadow-sm space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted-text/80">Total Amount Paid</span>
                <span className="text-2xl font-black text-deep-green font-mono block">₹{totalAmountPaid.toFixed(2)}</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-border-color/50 shadow-sm space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted-text/80">Successful Payments</span>
                <span className="text-2xl font-black text-emerald-600 block">{successfulPaymentsCount}</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-border-color/50 shadow-sm space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted-text/80">Pending Orders</span>
                <span className="text-2xl font-black text-amber-600 block">{pendingPaymentsCount}</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-border-color/50 shadow-sm space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted-text/80">Failed / Cancelled</span>
                <span className="text-2xl font-black text-zinc-500 block">{failedOrCancelledCount}</span>
              </div>
            </div>

            {/* Payment History Table Container */}
            <div className="bg-white rounded-3xl border border-border-color/60 shadow-sm overflow-hidden">
              <div className="border-b border-border-color/40 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4.5 h-4.5 text-[#0B5A4A]" />
                  <h3 className="font-black text-deep-green text-sm uppercase tracking-wider">
                    Financial Checkout Receipts
                  </h3>
                </div>

                {/* Status Filter */}
                <div className="flex gap-1 bg-[#E5F3EC]/40 p-1 rounded-xl border border-border-color/50 flex-shrink-0">
                  {['all', 'success', 'pending', 'failed', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setPaymentFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase cursor-pointer transition-all ${paymentFilter === st
                          ? 'bg-deep-green text-white shadow-sm'
                          : 'text-muted-text hover:text-deep-green'
                        }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="p-8 text-center flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-forest-green" />
                  <span className="text-xs text-muted-text font-semibold">Loading payment history...</span>
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-muted-text/50 mx-auto" />
                  <p className="text-xs text-muted-text font-bold">
                    No financial payments found matching selection.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border-color/40 bg-[#E5F3EC]/10 text-[9px] font-black uppercase text-muted-text/70">
                        <th className="py-3.5 pl-6">Date & Time</th>
                        <th className="py-3.5">Order ID</th>
                        <th className="py-3.5">Payment ID</th>
                        <th className="py-3.5 text-right">Amount (₹)</th>
                        <th className="py-3.5 text-right pr-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color/20 font-mono">
                      {filteredPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-[#E5F3EC]/5">
                          <td className="py-4 font-sans font-medium text-muted-text pl-6 whitespace-nowrap">
                            {p.created_at ? new Date(p.created_at).toLocaleString() : 'N/A'}
                          </td>
                          <td className="py-4 font-bold text-deep-green whitespace-nowrap">
                            {p.gateway_order_id || `ORD-${p.id}`}
                          </td>
                          <td className="py-4 text-zinc-500 whitespace-nowrap">
                            {p.gateway_payment_id || '—'}
                          </td>
                          <td className="py-4 text-right font-black text-deep-green whitespace-nowrap">
                            ₹{Number(p.amount).toFixed(2)}
                          </td>

                          <td className="py-4 text-right pr-6 whitespace-nowrap">
                            {renderStatusBadge(p.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CREDIT WALLET LEDGER */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            {/* KPI Cards for Credit Ledger */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-border-color/50 shadow-sm space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted-text/80">Available Balance</span>
                <span className="text-2xl font-black text-deep-green block">{credits ?? 0} Credits</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-border-color/50 shadow-sm space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted-text/80">Total Purchased</span>
                <span className="text-2xl font-black text-emerald-600 block">+{totalPurchasedCredits} Credits</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-border-color/50 shadow-sm space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted-text/80">Total Consumed</span>
                <span className="text-2xl font-black text-red-600 block">-{totalUsedCredits} Credits</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-border-color/50 shadow-sm space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted-text/80">Total Operations</span>
                <span className="text-2xl font-black text-deep-green block">{ledger.length}</span>
              </div>
            </div>

            {/* Credit Ledger Table Container */}
            <div className="bg-white rounded-3xl border border-border-color/60 shadow-sm overflow-hidden">
              <div className="border-b border-border-color/40 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-4.5 h-4.5 text-[#0B5A4A]" />
                  <h3 className="font-black text-deep-green text-sm uppercase tracking-wider">
                    Wallet Credit Activity Ledger
                  </h3>
                </div>

                {/* Ledger Activity Filter */}
                <div className="flex gap-1 bg-[#E5F3EC]/40 p-1 rounded-xl border border-border-color/50 flex-shrink-0">
                  {['all', 'purchase', 'audit_deduction', 'admin_adjustment'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setLedgerFilter(type)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase cursor-pointer transition-all ${ledgerFilter === type
                          ? 'bg-deep-green text-white shadow-sm'
                          : 'text-muted-text hover:text-deep-green'
                        }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="p-8 text-center flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-forest-green" />
                  <span className="text-xs text-muted-text font-semibold">Loading credit ledger...</span>
                </div>
              ) : filteredLedger.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-muted-text/50 mx-auto" />
                  <p className="text-xs text-muted-text font-bold">
                    No credit movements found matching selection.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border-color/40 bg-[#E5F3EC]/10 text-[9px] font-black uppercase text-muted-text/70">
                        <th className="py-3.5 pl-6">Date & Time</th>
                        <th className="py-3.5">Activity Type</th>
                        <th className="py-3.5">Description</th>
                        <th className="py-3.5 text-right pr-6">Credit Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color/20 font-mono">
                      {filteredLedger.map((tx) => {
                        const isPositive = tx.amount > 0;
                        return (
                          <tr key={tx.id} className="hover:bg-[#E5F3EC]/5">
                            <td className="py-4 font-sans font-medium text-muted-text pl-6 whitespace-nowrap">
                              {tx.created_at ? new Date(tx.created_at).toLocaleString() : 'N/A'}
                            </td>
                            <td className="py-4 font-sans text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-full ${tx.transaction_type === 'purchase'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : tx.transaction_type === 'audit_deduction'
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}>
                                {tx.transaction_type.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-4 font-sans text-deep-green font-semibold whitespace-nowrap">
                              {tx.description || 'N/A'}
                            </td>
                            <td className={`py-4 text-right pr-6 font-black ${isPositive ? 'text-emerald-600' : 'text-red-600'} whitespace-nowrap`}>
                              {isPositive ? `+${tx.amount}` : tx.amount} credits
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
