import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { getAllWebsites } from '../../services/websites';
import { getAudits, startAudit, getDashboardStats } from '../../services/audits';
import { getCreditBalance } from '../../services/payments';

import StatsCards from './components/StatsCards';
import RecentAuditsList from './components/RecentAuditsList';
import ScoreTrendChart from './components/ScoreTrendChart';
import WebsiteHealthGauge from './components/WebsiteHealthGauge';
import TopIssuesRecommendations from './components/TopIssuesRecommendations';
import CreditUsageChart from './components/CreditUsageChart';
import QuickAuditBox from './components/QuickAuditBox';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [audits, setAudits] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [webRes, auditRes, statsRes] = await Promise.all([
        getAllWebsites(),
        getAudits(),
        getDashboardStats()
      ]);

      if (webRes?.success && webRes?.data) {
        setWebsites(webRes.data);
      } else {
        setError(true);
      }

      if (auditRes?.success && auditRes?.data) {
        setAudits(auditRes.data);
      }

      if (statsRes?.success && statsRes?.data) {
        setDashboardStats(statsRes.data);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStartQuickAudit = async (data) => {
    try {
      const res = await startAudit(data);
      if (res.success && res.data) {
        navigate(`/audits/${res.data.id}`);
      } else {
        alert(res.message || 'Failed to start audit.');
      }
    } catch (err) {
      alert('An error occurred starting the audit.');
    }
  };

  const totalCount = dashboardStats?.total_websites_monitored;
  const credits = dashboardStats?.credits_remaining;
  const auditsCount = dashboardStats?.total_audits_performed;
  const averageScore = dashboardStats?.average_seo_score;

  const step1 = websites.length > 0;
  const step2 = websites.some((w) => w.is_verified);
  const step3 = audits.length > 0;
  const step4 = audits.some((a) => a.status === 'DONE');

  const getStepStatus = (stepIndex) => {
    if (stepIndex === 1) {
      return step1
        ? { label: 'Completed', style: 'bg-[#E5F3EC] text-[#0B5A4A] border-[#0A4B43]/10' }
        : { label: 'Pending', style: 'bg-red-50 text-red-700 border-red-200' };
    }
    if (stepIndex === 2) {
      return step2
        ? { label: 'Completed', style: 'bg-[#E5F3EC] text-[#0B5A4A] border-[#0A4B43]/10' }
        : step1
          ? { label: 'In Progress', style: 'bg-amber-50 text-amber-700 border-amber-200' }
          : { label: 'Pending', style: 'bg-red-50 text-red-700 border-red-200' };
    }
    if (stepIndex === 3) {
      return step3
        ? { label: 'Completed', style: 'bg-[#E5F3EC] text-[#0B5A4A] border-[#0A4B43]/10' }
        : step2
          ? { label: 'In Progress', style: 'bg-amber-50 text-amber-700 border-amber-200' }
          : { label: 'Pending', style: 'bg-red-50 text-red-700 border-red-200' };
    }
    return step4
      ? { label: 'Completed', style: 'bg-[#E5F3EC] text-[#0B5A4A] border-[#0A4B43]/10' }
      : step3
        ? { label: 'In Progress', style: 'bg-amber-50 text-amber-700 border-amber-200' }
        : { label: 'Pending', style: 'bg-red-50 text-red-700 border-red-200' };
  };

  const getAvatarInitials = (label) => {
    return label.substring(0, 1).toUpperCase();
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-5 text-left">

        {/* Pro UI/UX Green Card Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0A4B43] to-[#04332B] text-white p-6 md:p-8 rounded-[24px] border border-[#0A4B43]/15 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Glowing Background Blobs for Visual Depth */}
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-[#36E682] opacity-10 blur-2xl pointer-events-none" />
          <div className="absolute left-1/3 -bottom-12 w-32 h-32 rounded-full bg-[#EEF5F1] opacity-5 blur-xl pointer-events-none" />

          <div className="relative z-10 space-y-1 max-w-xl">
            <span className="text-[8.5px] font-black uppercase tracking-widest text-[#36E682]/90 block">
              Workspace Overview
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
              Welcome back, {user?.first_name || 'User'}
            </h2>
            <div className="text-[11px] md:text-xs text-[#E5F3EC]/80 font-semibold leading-relaxed pt-0.5 flex flex-wrap items-center gap-1.5">
              <span>Plan, prioritize, and monitor search index rankings with ease.</span>

            </div>
          </div>

          <div className="relative z-10 flex flex-wrap gap-2.5 flex-shrink-0">
            <button
              onClick={() => navigate('?add=true')}
              className="bg-[#36E682] hover:bg-[#2CD074] text-[#053D34] px-5 py-2.5 rounded-full text-[10px] font-black transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider border border-[#36E682] hover:border-[#2CD074]"
            >
              <Plus className="w-3.5 h-3.5" /> Add Website
            </button>
            <button
              onClick={() => navigate('/websites')}
              className="bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-full text-[10px] font-black transition-all border border-white/20 hover:border-white/35 uppercase tracking-wider cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
            >
              Manage Workspace
            </button>
          </div>
        </div>

        {/* Row 1: Stats summary cards */}
        <StatsCards
          totalCount={totalCount}
          credits={credits}
          auditsCount={auditsCount}
          averageScore={averageScore}
          loading={loading}
        />

        {/* Row 2: Recent Audits (7 cols) + Score Trend (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-7 flex flex-col h-full">
            <RecentAuditsList audits={audits} loading={loading} error={error} />
          </div>
          <div className="lg:col-span-5 flex flex-col h-full">
            <ScoreTrendChart audits={audits} loading={loading} />
          </div>
        </div>

        {/* Row 3: Website Health (4 cols) + Critical Issues (4 cols) + Quick Audit (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-4 flex flex-col h-full">
            <WebsiteHealthGauge averageScore={averageScore} loading={loading} />
          </div>
          <div className="lg:col-span-4 flex flex-col h-full">
            <TopIssuesRecommendations audits={audits} />
          </div>
          <div className="lg:col-span-4 flex flex-col h-full">
            <QuickAuditBox websites={websites} onStartAudit={handleStartQuickAudit} />
          </div>
        </div>

        {/* Row 4: Credit Usage (6 cols) + Onboarding Steps Checklist (6 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-6 flex flex-col h-full">
            <CreditUsageChart />
          </div>
          <div className="lg:col-span-6 flex flex-col h-full">
            <div className="bg-white rounded-[20px] p-4 border border-[#053D34]/10 shadow-sm text-left h-[300px] flex flex-col justify-between">
              <div className="border-b border-[#053D34]/10 pb-2.5 mb-2.5 flex-shrink-0 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-brand-evergreen text-xs tracking-tight uppercase">
                    Onboarding Checklist
                  </h3>
                  <p className="text-[9px] text-brand-secondary mt-0.5 font-bold">Follow these steps to fully configure your space.</p>
                </div>
                <button
                  onClick={() => navigate('?add=true')}
                  className="px-2 py-0.5 rounded-full border border-[#053D34]/10 text-[8px] font-black uppercase text-brand-primary hover:text-brand-electric-sprout"
                >
                  + Start Step
                </button>
              </div>

              {/* Checklist structured exactly like the Team Collaboration rows */}
              <div className="space-y-2 flex-grow overflow-y-auto">
                {[
                  { id: 1, title: 'Add Domain', desc: 'Register your homepage URL inside your workspace.' },
                  { id: 2, title: 'Verify Ownership', desc: 'Embed snippet code token inside homepage.' },
                  { id: 3, title: 'Run Technical Audit', desc: 'Start crawler scanning process and calculations.' },
                  { id: 4, title: 'AI Recommendations', desc: 'Review technical optimization roadmap.' }
                ].map((step) => {
                  const status = getStepStatus(step.id);
                  return (
                    <div
                      key={step.id}
                      className="flex items-center justify-between p-2 rounded-xl border border-outline-variant bg-brand-surface-low shadow-sm leading-none h-[46px]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 max-w-[70%]">
                        <div className="w-7 h-7 rounded-full bg-[#E5F3EC] border border-[#0A4B43]/10 text-[#053D34] flex items-center justify-center font-black text-[10px] flex-shrink-0">
                          {getAvatarInitials(step.title)}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[10px] font-black text-brand-evergreen block truncate leading-tight">
                            {step.title}
                          </span>
                          <span className="text-[8px] text-brand-secondary font-bold block truncate leading-tight">
                            {step.desc}
                          </span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${status.style} flex-shrink-0`}>
                        {status.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
