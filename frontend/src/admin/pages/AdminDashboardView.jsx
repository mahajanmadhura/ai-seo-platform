import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  IndianRupee,
  CreditCard,
  Database,
  Server,
  Cpu,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Zap,
  Layers,
  FileText,
  ShieldCheck,
  Clock,
  TrendingUp,
  AlertTriangle,
  Coins
} from 'lucide-react';
import adminApi from '../services/adminApi';
import AdminHeader from '../components/ui/AdminHeader';
import AdminSparkline from '../components/charts/AdminSparkline';
import AdminAreaChart from '../components/charts/AdminAreaChart';
import AdminBarChart from '../components/charts/AdminBarChart';
import AdminDonutChart from '../components/charts/AdminDonutChart';
import AdminHorizontalBarChart from '../components/charts/AdminHorizontalBarChart';
import AdminAuditsActivityWidget from '../components/charts/AdminAuditsActivityWidget';
import AdminExecutionTrackerCard from '../components/charts/AdminExecutionTrackerCard';
import AdminCreditUsageCard from '../components/charts/AdminCreditUsageCard';
import AdminTokenUsageCard from '../components/charts/AdminTokenUsageCard';
import AdminTimeline from '../components/ui/AdminTimeline';
import {
  AdminKPISkeleton,
  AdminChartSkeleton,
  AdminDonutSkeleton,
  AdminTimelineSkeleton
} from '../components/ui/AdminSkeleton';

function SectionErrorCard({ title, message, onRetry }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/40 shadow-2xs space-y-2 text-left font-sans">
      <div className="flex items-center gap-2 text-red-700 font-bold text-xs">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>Failed to load {title}</span>
      </div>
      <p className="text-[11px] text-red-600/80 font-medium">{message || 'Network error or backend timeout'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded-lg text-[11px] font-bold hover:bg-red-700 transition-all cursor-pointer shadow-xs mt-1"
        >
          <RefreshCw className="w-3 h-3" /> Retry {title}
        </button>
      )}
    </div>
  );
}

export default function AdminDashboardView() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const navigate = useNavigate();

  const loadAnalytics = useCallback(async (isSilent = false) => {
    if (!isSilent && !analyticsData) setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const res = await adminApi.getDashboardAnalytics();
      setAnalyticsData(res.data);
    } catch (err) {
      if (!analyticsData) setAnalyticsError(err.message || 'Failed to load analytics telemetry');
    } finally {
      setAnalyticsLoading(false);
    }
  }, [analyticsData]);

  const handleGlobalRefresh = async () => {
    setIsRefreshing(true);
    await loadAnalytics(true);
    setLastRefreshed(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const kpis = analyticsData?.kpis || {};
  const revenue = kpis.revenue || { value: 0, trend_percent: 0, sparkline: [] };
  const activeUsers = kpis.active_users || { value: 0, trend_percent: 0, sparkline: [] };
  const crawls = kpis.crawls_today || { value: 0, trend_percent: 0, sparkline: [] };
  const aiReqs = kpis.ai_requests || { value: 0, trend_percent: 0, sparkline: [] };

  const topCustomersReal = analyticsData?.top_customers || [];
  const topSeoIssuesReal = analyticsData?.top_seo_issues || [];
  const auditActivityChart = analyticsData?.audit_activity_chart || [];
  const auditBreakdown = analyticsData?.audit_breakdown || {};
  const latestAuditsList = analyticsData?.latest_audits || [];

  // Compute Revenue Stats
  const revenueChartData = analyticsData?.revenue_chart || [];
  const revAmounts = revenueChartData.map(r => r.amount || 0);
  const highestTx = Math.max(...revAmounts, 0);
  const avgTx = revAmounts.length > 0 ? (revAmounts.reduce((a, b) => a + b, 0) / revAmounts.length) : 0;

  // Merge Latest Audits into Timeline Feed
  const recentEvents = [...(analyticsData?.recent_activity || [])];
  if (latestAuditsList.length > 0) {
    latestAuditsList.forEach((aud) => {
      recentEvents.push({
        type: aud.status === 'DONE' ? 'audit_completed' : 'audit_started',
        title: `Audit Execution ${aud.domain}`,
        description: `Status: ${aud.status} • ${aud.credits}`,
        timestamp: aud.timestamp
      });
    });
  }
  recentEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const mergedTimeline = recentEvents.slice(0, 8);

  return (
    <div className="space-y-4 text-left pb-16 font-sans overflow-x-hidden">
      
      {/* Standardized Header */}
      <AdminHeader
        title="Dashboard"
        lastUpdated={lastRefreshed}
        onRefresh={handleGlobalRefresh}
        loading={isRefreshing}
      />

      {/* TOP: Clickable Bento KPI Cards */}
      <div>
        {analyticsLoading && !analyticsData ? (
          <AdminKPISkeleton />
        ) : analyticsError && !analyticsData ? (
          <SectionErrorCard title="Analytics" message={analyticsError} onRetry={() => loadAnalytics()} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {/* KPI 1: Revenue */}
            <div
              onClick={() => navigate('/admin/revenue')}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/admin/revenue')}
              className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-2.5 hover:border-zinc-400 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-150 cursor-pointer outline-none group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Revenue</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-zinc-950 tracking-tight">
                  ₹{Number(revenue.value).toLocaleString('en-IN')}
                </span>
                <AdminSparkline data={revenue.sparkline} color="#18181B" />
              </div>
            </div>

            {/* KPI 2: Customers */}
            <div
              onClick={() => navigate('/admin/users')}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/admin/users')}
              className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-2.5 hover:border-zinc-400 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-150 cursor-pointer outline-none group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Customers</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-zinc-950 tracking-tight">
                  {activeUsers.value.toLocaleString()}
                </span>
                <AdminSparkline data={activeUsers.sparkline} color="#18181B" />
              </div>
            </div>

            {/* KPI 3: Audits Today */}
            <div
              onClick={() => navigate('/admin/audits')}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/admin/audits')}
              className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-2.5 hover:border-zinc-400 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-150 cursor-pointer outline-none group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Audits Today</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-zinc-950 tracking-tight">
                  {crawls.value.toLocaleString()}
                </span>
                <AdminSparkline data={crawls.sparkline} color="#18181B" />
              </div>
            </div>

            {/* KPI 4: AI Usage */}
            <div
              onClick={() => navigate('/admin/ai')}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/admin/ai')}
              className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-2.5 hover:border-zinc-400 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-150 cursor-pointer outline-none group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">AI Usage</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-zinc-950 tracking-tight">
                  {aiReqs.value.toLocaleString()}
                </span>
                <AdminSparkline data={aiReqs.sparkline} color="#18181B" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ROW 1: Balanced 3-Column Bento Layout */}
      <div>
        {analyticsLoading && !analyticsData ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5"><AdminChartSkeleton height={140} /></div>
            <div className="lg:col-span-4"><AdminChartSkeleton height={140} /></div>
            <div className="lg:col-span-3"><AdminChartSkeleton height={140} /></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch"
          >
            {/* Col 1: Daily Audit Activity Card (Heatmap Capsules) */}
            <div className="lg:col-span-5 min-w-0 overflow-hidden">
              <AdminAuditsActivityWidget
                data={auditActivityChart}
                breakdown={auditBreakdown}
                latestAudits={latestAuditsList}
              />
            </div>

            {/* Col 2: Enterprise Revenue Telemetry Card (70% Graph Dominance) */}
            <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-2 min-w-0 overflow-hidden flex flex-col justify-between hover:border-zinc-300 transition-all">
              
              {/* Header Block (~15%) */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5 shrink-0">
                <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Revenue
                </h3>
              </div>

              {/* Compact KPI Row (~15%) */}
              <div className="flex items-baseline justify-between pt-0.5 shrink-0">
                <div className="space-y-0.5">
                  <span className="text-[8.5px] font-bold uppercase text-zinc-400 block leading-none">Revenue</span>
                  <span className="text-xl font-black text-zinc-950 tracking-tight leading-none font-mono">
                    ₹{Number(revenue.value).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-right shrink-0">
                  <div className="p-1 bg-zinc-50 rounded border border-zinc-100">
                    <span className="text-[7.5px] text-zinc-400 font-bold uppercase block leading-none">Avg Tx</span>
                    <span className="font-mono font-black text-zinc-900 leading-none">₹{Math.round(avgTx).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-1 bg-zinc-50 rounded border border-zinc-100">
                    <span className="text-[7.5px] text-zinc-400 font-bold uppercase block leading-none">Peak Tx</span>
                    <span className="font-mono font-black text-zinc-900 leading-none">₹{highestTx.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Graph Area (~70% Visual Dominance) */}
              <div className="flex-1 flex flex-col justify-end min-h-[140px] pt-1">
                <AdminAreaChart data={revenueChartData} dataKey="amount" labelKey="date" height={165} color="#18181B" />
              </div>
            </div>

            {/* Col 3: Standalone Execution Tracker Card */}
            <div className="lg:col-span-3 min-w-0 overflow-hidden">
              <AdminExecutionTrackerCard breakdown={auditBreakdown} />
            </div>
          </motion.div>
        )}
      </div>

      {/* ROW 2: 3-Column Heatmapped Layout */}
      <div>
        {analyticsLoading && !analyticsData ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4"><AdminChartSkeleton height={140} /></div>
            <div className="lg:col-span-4"><AdminChartSkeleton height={140} /></div>
            <div className="lg:col-span-4"><AdminChartSkeleton height={140} /></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch"
          >
            {/* Col 1: Credit Usage Card */}
            <div className="lg:col-span-4 min-w-0 overflow-hidden">
              <AdminCreditUsageCard
                data={auditActivityChart}
                breakdown={auditBreakdown}
              />
            </div>

            {/* Col 2: Token Usage Card */}
            <div className="lg:col-span-4 min-w-0 overflow-hidden">
              <AdminTokenUsageCard
                data={auditActivityChart}
                totalTokens={aiReqs.value}
              />
            </div>

            {/* Col 3: Top Customers Card */}
            <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-2 min-w-0 overflow-hidden flex flex-col justify-between hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                  Top Customers
                </h3>
              </div>
              <AdminHorizontalBarChart data={topCustomersReal} valueKey="value" labelKey="label" color="#18181B" />
            </div>
          </motion.div>
        )}
      </div>

      {/* ROW 3: Operations & Health 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Col 1: Donut Chart (4 cols) */}
        {analyticsLoading && !analyticsData ? (
          <div className="lg:col-span-4"><AdminDonutSkeleton size={120} /></div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:col-span-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-2.5 min-w-0 overflow-hidden hover:border-zinc-300 transition-all"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950 truncate">
                Issue Categories
              </h3>
            </div>

            <AdminDonutChart data={topSeoIssuesReal} size={120} />
          </motion.div>
        )}

        {/* Col 2: Activity Feed (5 cols) */}
        {analyticsLoading && !analyticsData ? (
          <div className="lg:col-span-5"><AdminTimelineSkeleton /></div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:col-span-5 bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-2.5 min-w-0 overflow-hidden hover:border-zinc-300 transition-all"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                Activity Feed
              </h3>
            </div>

            <div className="max-h-48 overflow-y-auto pr-1">
              <AdminTimeline events={mergedTimeline} />
            </div>
          </motion.div>
        )}

        {/* Col 3: System Status (3 cols) */}
        {analyticsLoading && !analyticsData ? (
          <div className="lg:col-span-3"><AdminChartSkeleton height={140} /></div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:col-span-3 bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-2.5 min-w-0 overflow-hidden flex flex-col justify-between hover:border-zinc-300 transition-all"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                System Status
              </h3>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                OK
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10.5px] font-semibold text-left">
              <div className="p-2 bg-zinc-50 rounded border border-zinc-100">
                <span className="text-[8.5px] text-zinc-400 font-bold uppercase block">Failed Audits</span>
                <span className="font-bold text-red-600">1 Alert</span>
              </div>
              <div className="p-2 bg-zinc-50 rounded border border-zinc-100">
                <span className="text-[8.5px] text-zinc-400 font-bold uppercase block">Queue Health</span>
                <span className="font-bold text-emerald-700">0 Queued</span>
              </div>
              <div className="p-2 bg-zinc-50 rounded border border-zinc-100">
                <span className="text-[8.5px] text-zinc-400 font-bold uppercase block">API Status</span>
                <span className="font-bold text-zinc-950">99.98% OK</span>
              </div>
              <div className="p-2 bg-zinc-50 rounded border border-zinc-100">
                <span className="text-[8.5px] text-zinc-400 font-bold uppercase block">Worker Cluster</span>
                <span className="font-bold text-zinc-950">50 Active</span>
              </div>
              <div className="p-2 bg-zinc-50 rounded border border-zinc-100">
                <span className="text-[8.5px] text-zinc-400 font-bold uppercase block">AI Cost Today</span>
                <span className="font-bold text-zinc-950">₹0.04</span>
              </div>
              <div className="p-2 bg-zinc-50 rounded border border-zinc-100">
                <span className="text-[8.5px] text-zinc-400 font-bold uppercase block">Credits Today</span>
                <span className="font-bold text-zinc-950">105 CR</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
