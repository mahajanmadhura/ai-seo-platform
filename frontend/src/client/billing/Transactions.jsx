import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCreditTransactions } from '../../services/payments';
import DashboardLayout from '../../components/DashboardLayout';
import {
  ArrowLeft,
  FileText,
  Loader2,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function Transactions() {
  const navigate = useNavigate();
  const { credits, refreshCredits } = useAuth();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      await refreshCredits();
      const res = await getCreditTransactions();
      if (res.success && res.data) {
        setTransactions(res.data || []);
      } else {
        setError('Failed to fetch transaction logs.');
      }
    } catch (err) {
      setError('Error loading transaction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getLabelAndStyle = (type) => {
    switch (type) {
      case 'purchase':
        return {
          label: 'Credit Purchase',
          class: 'bg-[#36E682]/10 text-[#053D34] border border-[#36E682]/30'
        };
      case 'audit_deduction':
        return {
          label: 'SEO Audit Deduction',
          class: 'bg-red-500/10 text-red-700 border border-red-500/20'
        };
      case 'admin_adjustment':
        return {
          label: 'Manual Credit Adjustment',
          class: 'bg-deep-green/10 text-deep-green border border-deep-green/20'
        };
      case 'refund':
        return {
          label: 'Credit Refund',
          class: 'bg-blue-500/10 text-blue-700 border border-blue-200'
        };
      default:
        return {
          label: type.replace('_', ' '),
          class: 'bg-gray-100 text-gray-700 border border-gray-200'
        };
    }
  };

  const totalPurchased = transactions
    .filter((tx) => tx.amount > 0 && tx.transaction_type === 'purchase')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalDeducted = transactions
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const auditDeductionsCount = transactions.filter(
    (tx) => tx.transaction_type === 'audit_deduction'
  ).length;

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'purchases') return tx.amount > 0 && tx.transaction_type === 'purchase';
    if (filter === 'deductions') return tx.amount < 0;
    if (filter === 'adjustments') return tx.transaction_type === 'admin_adjustment';
    return true;
  });

  return (
    <DashboardLayout title="Transaction History" backLink="/settings?tab=billing">
      <div className="space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-black text-deep-green tracking-tight font-sans">
              Transaction History
            </h2>
            <p className="text-xs text-muted-text font-semibold">
              Track credit purchases and deductions across your workspace.
            </p>
          </div>
          <button
            onClick={() => navigate('/settings?tab=billing')}
            className="inline-flex items-center gap-2 bg-[#E5F3EC] hover:bg-deep-green/10 text-deep-green border border-deep-green/10 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Billing
          </button>
        </div>

        <div className="bg-[#E5F3EC]/30 rounded-3xl p-5 border border-border-color/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <p className="text-xs text-[#053D34] font-semibold leading-relaxed">
              Transactions show how credits were added through purchases and deducted when audits were started.
            </p>
          </div>
          <div className="bg-white border border-border-color/50 px-4 py-2.5 rounded-2xl flex items-center gap-2 flex-shrink-0 shadow-sm">
            <HelpCircle className="w-4 h-4 text-[#0B5A4A]" />
            <span className="text-[10px] font-black uppercase text-deep-green">1 SEO Audit = 5 Credits</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/5 border border-red-500/15 text-red-700 p-4 rounded-xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-border-color/50 shadow-sm space-y-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-muted-text/80">Current Balance</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-deep-green">{credits ?? 0}</span>
              <span className="text-[9px] text-muted-text font-bold uppercase">Credits</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-border-color/50 shadow-sm space-y-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-muted-text/80">Total Purchased</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-forest-green">+{totalPurchased}</span>
              <span className="text-[9px] text-muted-text font-bold uppercase">Credits</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-border-color/50 shadow-sm space-y-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-muted-text/80">Total Used</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-red-600">-{totalDeducted}</span>
              <span className="text-[9px] text-muted-text font-bold uppercase">Credits</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-border-color/50 shadow-sm space-y-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-muted-text/80">Audit Count</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-deep-green">{auditDeductionsCount}</span>
              <span className="text-[9px] text-muted-text font-bold uppercase">Audits</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-border-color/60 shadow-sm overflow-hidden">
          <div className="border-b border-border-color/40 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-[#0B5A4A]" />
              <h3 className="font-black text-deep-green text-sm uppercase tracking-wider">
                Transaction Logs
              </h3>
            </div>

            <div className="flex gap-1 bg-[#E5F3EC]/40 p-1 rounded-xl border border-border-color/50 flex-shrink-0">
              {['all', 'purchases', 'deductions', 'adjustments'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase cursor-pointer transition-all ${
                    filter === type
                      ? 'bg-deep-green text-white shadow-sm'
                      : 'text-muted-text hover:text-deep-green'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-forest-green" />
              <span className="text-xs text-muted-text font-semibold">Loading transactions...</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-muted-text/50 mx-auto" />
              <p className="text-xs text-muted-text font-bold">
                No transactions found matching selection.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-color/40 bg-[#E5F3EC]/10 text-[9px] font-black uppercase text-muted-text/70">
                    <th className="py-3.5 pl-6">Date & Time</th>
                    <th className="py-3.5">Transaction Type</th>
                    <th className="py-3.5">Description</th>
                    <th className="py-3.5 text-right pr-6">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color/20">
                  {filteredTransactions.map((tx) => {
                    const isPositive = tx.amount > 0;
                    const details = getLabelAndStyle(tx.transaction_type);
                    return (
                      <tr key={tx.id} className="hover:bg-[#E5F3EC]/5">
                        <td className="py-4 font-medium text-muted-text pl-6">
                          {tx.created_at ? new Date(tx.created_at).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-4 text-[9px] font-black tracking-wider">
                          <span className={`px-2.5 py-0.5 rounded-full ${details.class}`}>
                            {details.label}
                          </span>
                        </td>
                        <td className="py-4 text-deep-green font-semibold">
                          {tx.description || 'N/A'}
                        </td>
                        <td className={`py-4 text-right pr-6 font-black ${isPositive ? 'text-forest-green' : 'text-red-600'}`}>
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
    </DashboardLayout>
  );
}
