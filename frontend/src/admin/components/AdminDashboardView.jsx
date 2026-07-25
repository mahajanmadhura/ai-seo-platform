import React, { useState, useEffect } from 'react';
import { getAdminAnalytics } from '../../services/admin';
import {
  Users,
  Coins,
  IndianRupee,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboardView() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    const res = await getAdminAnalytics();
    if (res.success && res.data) {
      setAnalytics(res.data);
    } else {
      setError(res.message || 'Failed to retrieve analytics data.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="bg-white border border-neutral-100 p-5 rounded-2xl shadow-sm h-28 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-20 bg-neutral-200 rounded" />
              <div className="h-7 w-7 bg-neutral-200 rounded-lg" />
            </div>
            <div className="h-6 w-16 bg-neutral-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-100 rounded-2xl p-8 text-center max-w-md mx-auto space-y-4 shadow-sm">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-black text-deep-green uppercase tracking-wider">Analytics Error</h3>
        <p className="text-xs text-muted-text font-semibold">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="bg-deep-green hover:bg-forest-green text-white px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Users',
      value: analytics?.total_users ?? 'Not Available',
      icon: Users,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      desc: 'Registered platform accounts'
    },
    {
      title: 'Total Revenue (INR)',
      value: analytics?.total_revenue !== undefined ? `₹${Number(analytics.total_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Not Available',
      icon: IndianRupee,
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
      desc: 'Successful checkout aggregates in INR'
    },
    {
      title: 'Total Credits Sold',
      value: analytics?.total_credits_sold !== undefined ? Number(analytics.total_credits_sold).toLocaleString() : 'Not Available',
      icon: Coins,
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      desc: 'Crawler token allocations'
    },
    {
      title: 'Successful Payments',
      value: analytics?.total_successful_payments ?? 'Not Available',
      icon: CheckCircle,
      color: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
      desc: 'Cleared checkout processes'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="text-left space-y-1">
        <h2 className="text-lg font-black text-deep-green tracking-tight uppercase">Dashboard Overview</h2>
        <p className="text-[10px] text-muted-text font-semibold">Real-time platform usage and sales metrics from the database.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-neutral-100 p-4 rounded-2xl shadow-sm hover:shadow-[0_8px_16px_rgba(5,61,52,0.03)] transition-all hover:scale-[1.01] flex flex-col justify-between h-28 text-left"
            >
              <div className="flex justify-between items-start">
                <span className="text-[8px] font-black uppercase tracking-wider text-muted-text">
                  {kpi.title}
                </span>
                <div className={`p-1.5 rounded-lg border ${kpi.color} shadow-sm flex-shrink-0`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1">
                <span className="text-xl font-black text-deep-green leading-none">
                  {kpi.value}
                </span>
                <p className="text-[8px] text-muted-text font-bold mt-1 leading-none">
                  {kpi.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
