import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Globe,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getAllWebsites } from '../../services/websites';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await getAllWebsites();
      if (res?.success && res?.data) {
        setWebsites(res.data);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalCount = websites.length;
  const verifiedCount = websites.filter((w) => w.is_verified).length;
  const pendingCount = totalCount - verifiedCount;
  const recentWebsites = [...websites]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 3);

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        <div className="relative bg-gradient-to-br from-[#0A4B43] to-[#053D34] rounded-[28px] p-8 overflow-hidden text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg border border-white/5 text-left">
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#36E682 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-[#36E682]/10 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="space-y-2 relative z-10">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
              Welcome back,{' '}
              <span className="text-[#36E682]">
                {user?.first_name || 'User'} {user?.last_name || ''}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#E5F3EC]/80 font-medium max-w-lg leading-relaxed">
              Manage your websites and monitor search index setups. Verification is required before running technical crawlers.
            </p>
          </div>
          <div className="flex gap-3 relative z-10 flex-shrink-0">
            <Link
              to="?add=true"
              className="bg-[#36E682] hover:bg-white text-[#053D34] px-5 py-3 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Website
            </Link>
            <Link
              to="/websites"
              className="bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl text-xs font-black transition-all border border-white/10"
            >
              Manage Workspace
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-left">
          <div className="bg-white rounded-[20px] p-5 border border-border-color/60 shadow-sm flex flex-col justify-between min-h-[110px] hover:border-deep-green/20 transition-all">
            <div className="flex items-center justify-between text-muted-text text-[10px] font-black uppercase tracking-wider">
              <span>Websites Monitored</span>
              <div className="p-1.5 bg-[#EEF5F1] rounded-lg text-deep-green">
                <Globe className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-3xl font-black text-deep-green mt-2">
              {loading ? <span className="h-7 w-8 bg-soft-bg rounded animate-pulse block"></span> : totalCount}
            </div>
          </div>

          <div className="bg-mint-surface rounded-[20px] p-5 border border-[#0A4B43]/10 shadow-sm flex flex-col justify-between min-h-[110px] hover:border-deep-green/20 transition-all">
            <div className="flex items-center justify-between text-[#0B5A4A] text-[10px] font-black uppercase tracking-wider">
              <span>Verified Domains</span>
              <div className="p-1.5 bg-white/70 rounded-lg text-[#053D34]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#053D34]" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#053D34] mt-2">
              {loading ? <span className="h-7 w-8 bg-white/50 rounded animate-pulse block"></span> : verifiedCount}
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-5 border border-border-color/60 shadow-sm flex flex-col justify-between min-h-[110px] hover:border-deep-green/20 transition-all">
            <div className="flex items-center justify-between text-muted-text text-[10px] font-black uppercase tracking-wider">
              <span>Pending Ownership</span>
              <div className="p-1.5 bg-[#EEF5F1] rounded-lg text-amber-600">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-3xl font-black text-deep-green mt-2">
              {loading ? <span className="h-7 w-8 bg-soft-bg rounded animate-pulse block"></span> : pendingCount}
            </div>
          </div>

          <div className="bg-mint-surface rounded-[20px] p-5 border border-[#0A4B43]/10 shadow-sm flex flex-col justify-between min-h-[110px] hover:border-deep-green/20 transition-all">
            <div className="flex items-center justify-between text-[#0B5A4A] text-[10px] font-black uppercase tracking-wider">
              <span>Workspace Status</span>
              <div className="p-1.5 bg-white/70 rounded-lg text-deep-green">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-sm font-black text-[#053D34] mt-4 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-[#36E682] inline-block animate-ping"></span>
              Premium Active
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 text-left">
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-border-color/60 shadow-sm flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-border-color/40 pb-4">
                <div>
                  <h3 className="font-black text-deep-green text-base tracking-tight">Recent Websites</h3>
                  <p className="text-[10px] text-muted-text mt-0.5 font-semibold">Your registered workspace domains.</p>
                </div>
                <Link to="/websites" className="text-[10px] font-black uppercase tracking-wider text-[#0B5A4A] hover:text-[#36E682] transition-colors border-b border-transparent hover:border-[#36E682]">
                  View All Websites
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-soft-bg rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              ) : error ? (
                <div className="py-8 flex flex-col items-center justify-center text-center gap-3 text-xs text-red-700 font-bold">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span>Failed to load recent websites.</span>
                  <button onClick={fetchStats} className="bg-deep-green text-white px-4 py-1.5 rounded-lg font-black mt-1 shadow-sm">Retry</button>
                </div>
              ) : recentWebsites.length === 0 ? (
                <div className="py-10 text-center space-y-5">
                  <p className="text-xs text-muted-text font-semibold">No websites registered in your workspace yet.</p>
                  <Link
                    to="?add=true"
                    className="inline-flex items-center gap-1.5 bg-[#053D34] hover:bg-[#36E682] text-white hover:text-[#053D34] px-5 py-3 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer"
                  >
                    Add your first website <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentWebsites.map((web, idx) => (
                    <div
                      key={web.id}
                      onClick={() => navigate(`/websites/${web.id}`)}
                      className={`p-4 flex items-center justify-between gap-4 rounded-xl border border-border-color/30 hover:border-deep-green/20 transition-all cursor-pointer ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#E5F3EC]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 bg-[#E5F3EC] text-deep-green rounded-xl border border-[#0A4B43]/5 flex-shrink-0">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-deep-green truncate">{web.domain}</p>
                          <p className="text-[9px] text-muted-text font-semibold mt-0.5">
                            Added: {web.created_at ? new Date(web.created_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {web.is_verified ? (
                          <span className="text-[8px] font-black uppercase tracking-wider bg-[#36E682]/10 border border-[#36E682]/30 text-[#053D34] px-2.5 py-0.5 rounded-full">
                            Verified
                          </span>
                        ) : (
                          <span className="text-[8px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-700 px-2.5 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                        <span className="text-[10px] font-black text-[#0B5A4A] hover:text-[#36E682] transition-colors inline-flex items-center gap-0.5">
                          Configure <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 border border-border-color/60 shadow-sm flex flex-col justify-between">
            <div className="space-y-5">
              <div className="border-b border-border-color/40 pb-4">
                <h3 className="font-black text-deep-green text-base tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-4.5 h-4.5 text-[#0B5A4A]" /> SEO Score Trend
                </h3>
                <p className="text-[10px] text-muted-text mt-0.5 font-semibold">Historical audit performance.</p>
              </div>

              <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-full h-16 flex items-end justify-center gap-2 px-6">
                  {[25, 30, 20, 35, 15, 30, 25].map((h, i) => (
                    <div
                      key={i}
                      className="bg-[#E5F3EC]/50 border border-border-color/20 rounded-t-lg flex-grow transition-all"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-text leading-relaxed max-w-xs font-bold">
                  SEO score trend will appear after your first audit.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 border border-border-color/60 shadow-sm text-left">
          <div className="border-b border-border-color/40 pb-4 mb-6">
            <h3 className="font-black text-deep-green text-base tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-[#0B5A4A]" /> Workspace Next Steps
            </h3>
            <p className="text-[10px] text-muted-text mt-0.5 font-semibold">Follow these stages to configure registered URLs.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="?add=true"
              className="bg-[#E5F3EC]/20 hover:bg-[#E5F3EC]/50 p-5 rounded-2xl border border-border-color/40 flex flex-col justify-between min-h-[140px] transition-all group"
            >
              <div className="space-y-3">
                <div className="w-7 h-7 rounded-full bg-deep-green/5 border border-deep-green/10 text-deep-green font-black text-xs flex items-center justify-center group-hover:bg-[#36E682] group-hover:text-[#053D34] transition-all">
                  1
                </div>
                <h4 className="text-xs font-black text-deep-green">Add Domain</h4>
                <p className="text-[10px] text-muted-text leading-relaxed font-semibold">
                  Register your homepage address inside your account workspace.
                </p>
              </div>
              <span className="text-[10px] font-black text-[#0B5A4A] inline-flex items-center gap-0.5 mt-4">
                Add Now <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              to="/websites"
              className="bg-white hover:bg-[#E5F3EC]/30 p-5 rounded-2xl border border-border-color/40 flex flex-col justify-between min-h-[140px] transition-all group"
            >
              <div className="space-y-3">
                <div className="w-7 h-7 rounded-full bg-deep-green/5 border border-deep-green/10 text-deep-green font-black text-xs flex items-center justify-center group-hover:bg-[#36E682] group-hover:text-[#053D34] transition-all">
                  2
                </div>
                <h4 className="text-xs font-black text-deep-green">Install Meta Tag</h4>
                <p className="text-[10px] text-muted-text leading-relaxed font-semibold">
                  Embed the verification snippet into the head section of your site.
                </p>
              </div>
              <span className="text-[10px] font-black text-[#0B5A4A] inline-flex items-center gap-0.5 mt-4">
                Get Snippet <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              to="/websites"
              className="bg-[#E5F3EC]/20 hover:bg-[#E5F3EC]/50 p-5 rounded-2xl border border-border-color/40 flex flex-col justify-between min-h-[140px] transition-all group"
            >
              <div className="space-y-3">
                <div className="w-7 h-7 rounded-full bg-deep-green/5 border border-deep-green/10 text-deep-green font-black text-xs flex items-center justify-center group-hover:bg-[#36E682] group-hover:text-[#053D34] transition-all">
                  3
                </div>
                <h4 className="text-xs font-black text-deep-green">Verify Ownership</h4>
                <p className="text-[10px] text-muted-text leading-relaxed font-semibold">
                  Trigger our checker crawler to read the verification token.
                </p>
              </div>
              <span className="text-[10px] font-black text-[#0B5A4A] inline-flex items-center gap-0.5 mt-4">
                Verify Now <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              to="/settings"
              className="bg-white hover:bg-[#E5F3EC]/30 p-5 rounded-2xl border border-border-color/40 flex flex-col justify-between min-h-[140px] transition-all group"
            >
              <div className="space-y-3">
                <div className="w-7 h-7 rounded-full bg-deep-green/5 border border-deep-green/10 text-deep-green font-black text-xs flex items-center justify-center group-hover:bg-[#36E682] group-hover:text-[#053D34] transition-all">
                  4
                </div>
                <h4 className="text-xs font-black text-deep-green">Configure Profile</h4>
                <p className="text-[10px] text-muted-text leading-relaxed font-semibold">
                  Add developer tags and settings before running audit engine.
                </p>
              </div>
              <span className="text-[10px] font-black text-[#0B5A4A] inline-flex items-center gap-0.5 mt-4">
                Configure <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
