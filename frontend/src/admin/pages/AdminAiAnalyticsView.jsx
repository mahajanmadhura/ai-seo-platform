import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import adminApi from '../services/adminApi';
import AdminHeader from '../components/ui/AdminHeader';
import AdminMetricCard from '../components/ui/AdminMetricCard';
import AdminDonutChart from '../components/charts/AdminDonutChart';
import { AdminKPISkeleton, AdminDonutSkeleton } from '../components/ui/AdminSkeleton';
import AdminErrorState from '../components/ui/AdminErrorState';

export default function AdminAiAnalyticsView() {
  const [usage, setUsage] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const loadData = async (isSilent = false) => {
    if (!isSilent && !usage) setLoading(true);
    setError(null);
    try {
      const [usageRes, statsRes] = await Promise.all([
        adminApi.getGroqUsage(),
        adminApi.getAiStats(),
      ]);

      setUsage(usageRes.data);
      setStats(statsRes.data || {});
      setLastRefreshed(new Date());
    } catch (err) {
      if (!usage) setError(err.response?.data?.message || err.message || 'Failed to fetch usage stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (error && !usage) {
    return <AdminErrorState message={error} onRetry={() => loadData()} />;
  }

  const categoryEntries = Object.entries(stats).map(([issue_category, count]) => ({ issue_category, count }));

  const totalTokens = usage?.total_tokens || 0;
  const promptTokensCount = Math.round(totalTokens * 0.65);
  const completionTokensCount = totalTokens - promptTokensCount;

  const tokenRatioData = [
    { issue_category: "Input Processing", count: promptTokensCount },
    { issue_category: "Generated Output", count: completionTokensCount }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 text-left pb-16 font-sans overflow-x-hidden"
    >
      {/* Standardized Header */}
      <AdminHeader
        title="AI Usage"
        lastUpdated={lastRefreshed}
        onRefresh={() => loadData(true)}
        loading={loading && Boolean(usage)}
      />

      {/* Metric Tiles */}
      <div className="min-h-[105px]">
        {loading && !usage ? (
          <AdminKPISkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminMetricCard
              title="Processing Usage"
              value={usage ? usage.total_tokens.toLocaleString() : '0'}
              icon={Cpu}
            />
            <AdminMetricCard
              title="Processing Cost"
              value={usage ? `$${usage.cost_estimate}` : '$0.00'}
              icon={DollarSign}
            />
            <AdminMetricCard
              title="Average Response Time"
              value={usage ? `${usage.average_latency_ms} ms` : '0 ms'}
              icon={Clock}
            />
            <AdminMetricCard
              title="Service Health"
              value={usage ? `${(100 - usage.error_rate).toFixed(1)}%` : '100%'}
              icon={AlertTriangle}
            />
          </div>
        )}
      </div>

      {/* Bento Grid: Token Ratio Donut & Category Breakdown Donut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Token Ratio Donut */}
        <div className="min-w-0 overflow-hidden">
          {loading && !usage ? (
            <AdminDonutSkeleton size={140} />
          ) : (
            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-2xs space-y-4 min-w-0 overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950 truncate">
                  AI Activity
                </h3>
              </div>
              <AdminDonutChart data={tokenRatioData} size={140} />
            </div>
          )}
        </div>

        {/* SEO Category Distribution Donut */}
        <div className="min-w-0 overflow-hidden">
          {loading && !usage ? (
            <AdminDonutSkeleton size={140} />
          ) : (
            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-2xs space-y-4 min-w-0 overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950 truncate">
                  Issue Categories
                </h3>
              </div>
              <AdminDonutChart data={categoryEntries} size={140} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
