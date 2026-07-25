import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getAudits } from '../../services/audits';
import WhiteLabelSettings from './components/WhiteLabelSettings';
import {
  FileText,
  Palette,
  Loader2,
  AlertCircle,
  ArrowRight,
  Globe,
  History,
  Calendar,
  Layers,
  CheckCircle2
} from 'lucide-react';

export default function Reports() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'branding'
  const [audits, setAudits] = useState([]);
  const [loadingAudits, setLoadingAudits] = useState(true);
  const [auditError, setAuditError] = useState('');

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    setLoadingAudits(true);
    setAuditError('');

    const res = await getAudits();
    if (res.success && res.data) {
      setAudits(res.data || []);
    } else {
      setAuditError(res.message || 'Failed to load reports library.');
    }

    setLoadingAudits(false);
  };

  // Group all audits by website domain to display Project Summary Cards
  const websiteGroups = useMemo(() => {
    const groups = {};

    audits.forEach((audit) => {
      const domain = audit.website_domain || 'Uncategorized';
      if (!groups[domain]) {
        groups[domain] = [];
      }
      groups[domain].push(audit);
    });

    return Object.entries(groups).map(([domain, websiteAudits]) => {
      // Sort newest first
      websiteAudits.sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
      const completedAudits = websiteAudits.filter((a) => a.status === 'DONE');
      const reportsCompiled = websiteAudits.filter((a) => a.pdf_file || a.status === 'DONE');
      const latest = websiteAudits[0];

      return {
        domain,
        latestAudit: latest,
        totalAudits: websiteAudits.length,
        totalReports: reportsCompiled.length,
        latestScore: latest?.overall_score ?? 'N/A',
        lastAuditDate: latest?.started_at ? new Date(latest.started_at).toLocaleDateString() : 'N/A',
        lastReportDate: latest?.completed_at || latest?.started_at ? new Date(latest.completed_at || latest.started_at).toLocaleDateString() : 'N/A',
        reportStatus: reportsCompiled.length > 0 ? 'Ready' : 'Not Generated'
      };
    });
  }, [audits]);

  return (
    <DashboardLayout title="Report Library">
      <div className="space-y-8 max-w-7xl mx-auto text-left">
        
        {/* Header & Top Right Tabs Switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-color/40 pb-4">
          <div>
            <h1 className="text-2xl font-black text-deep-green tracking-tight">Report Library</h1>
            <p className="text-xs text-muted-text mt-1 font-semibold">
              Project summary cards grouped by website domain.
            </p>
          </div>

          {/* Top Right Tabs: Reports Library & White Label Branding Settings */}
          <div className="flex items-center gap-1.5 bg-white border border-border-color/60 p-1.5 rounded-2xl shadow-xs">
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-deep-green text-white shadow-xs'
                  : 'text-muted-text hover:text-deep-green hover:bg-soft-bg'
              }`}
            >
              <FileText className="w-4 h-4" /> Report Vault
            </button>
            <button
              onClick={() => setActiveTab('branding')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'branding'
                  ? 'bg-deep-green text-white shadow-xs'
                  : 'text-muted-text hover:text-deep-green hover:bg-soft-bg'
              }`}
            >
              <Palette className="w-4 h-4" /> White Label Branding
            </button>
          </div>
        </div>

        {/* TAB 1: PROJECT SUMMARY CARDS PER WEBSITE */}
        {activeTab === 'reports' && (
          <div>
            {loadingAudits ? (
              <div className="bg-white rounded-2xl p-12 border border-border-color/60 text-center flex flex-col items-center justify-center min-h-[250px] shadow-xs">
                <Loader2 className="w-8 h-8 text-deep-green animate-spin" />
                <p className="text-xs text-muted-text mt-3 font-bold">Loading report library...</p>
              </div>
            ) : auditError ? (
              <div className="bg-white rounded-2xl p-8 border border-border-color/60 text-center max-w-md mx-auto space-y-3 shadow-xs">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-deep-green">Failed to Load Library</h3>
                <p className="text-xs text-muted-text font-semibold">{auditError}</p>
                <button
                  onClick={fetchAudits}
                  className="px-4 py-2 bg-deep-green text-white text-xs font-bold rounded-xl hover:bg-[#36E682] hover:text-deep-green transition-all"
                >
                  Retry Loading
                </button>
              </div>
            ) : websiteGroups.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-border-color/60 text-center max-w-md mx-auto space-y-4 shadow-xs">
                <div className="w-12 h-12 bg-[#E5F3EC] border border-border-color/40 rounded-2xl flex items-center justify-center mx-auto text-deep-green">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-deep-green">No Reports or Projects Yet</h3>
                  <p className="text-xs text-muted-text font-semibold leading-relaxed">
                    Start an audit from the Dashboard or Website Detail page to initialize your project summary vault.
                  </p>
                </div>
                <Link
                  to="/websites"
                  className="inline-flex items-center gap-1.5 bg-deep-green text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#36E682] hover:text-deep-green transition-all"
                >
                  Go to Websites <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              /* Project Summary Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {websiteGroups.map((group) => (
                  <div
                    key={group.domain}
                    className="bg-white rounded-3xl border border-border-color/60 p-6 shadow-sm space-y-5 text-left flex flex-col justify-between"
                  >
                    {/* Website Header */}
                    {/* Website Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-color/40 pb-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-2xl bg-[#E5F3EC] border border-border-color/40 flex items-center justify-center text-deep-green flex-shrink-0">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base font-black text-deep-green tracking-tight truncate">
                            {group.domain}
                          </h3>
                          <p className="text-xs text-muted-text font-semibold">
                            Project Summary
                          </p>
                        </div>
                      </div>

                      {/* Single Action: View History Button */}
                      <Link
                        to={`/reports/history/${encodeURIComponent(group.domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/+$/, ''))}`}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-deep-green hover:bg-[#36E682] text-white hover:text-deep-green transition-all shadow-sm cursor-pointer flex-shrink-0"
                      >
                        <History className="w-4 h-4" /> View History
                      </Link>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="bg-soft-bg p-3 rounded-2xl border border-border-color/40">
                        <span className="text-[9px] font-black uppercase tracking-wider text-muted-text block">Latest Score</span>
                        <span className="text-base font-black text-deep-green">{group.latestScore}/100</span>
                      </div>

                      <div className="bg-soft-bg p-3 rounded-2xl border border-border-color/40">
                        <span className="text-[9px] font-black uppercase tracking-wider text-muted-text block">Total Audits</span>
                        <span className="text-base font-black text-deep-green">{group.totalAudits}</span>
                      </div>

                      <div className="bg-soft-bg p-3 rounded-2xl border border-border-color/40">
                        <span className="text-[9px] font-black uppercase tracking-wider text-muted-text block">Total Reports</span>
                        <span className="text-base font-black text-deep-green">{group.totalReports}</span>
                      </div>

                      <div className="bg-soft-bg p-3 rounded-2xl border border-border-color/40">
                        <span className="text-[9px] font-black uppercase tracking-wider text-muted-text block">Last Audit</span>
                        <span className="text-xs font-bold text-deep-green">{group.lastAuditDate}</span>
                      </div>

                      <div className="bg-soft-bg p-3 rounded-2xl border border-border-color/40">
                        <span className="text-[9px] font-black uppercase tracking-wider text-muted-text block">Last Report</span>
                        <span className="text-xs font-bold text-deep-green">{group.lastReportDate}</span>
                      </div>

                      <div className="bg-soft-bg p-3 rounded-2xl border border-border-color/40">
                        <span className="text-[9px] font-black uppercase tracking-wider text-muted-text block">Report Status</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${
                          group.reportStatus === 'Ready' ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          {group.reportStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WHITE LABEL BRANDING SETTINGS */}
        {activeTab === 'branding' && (
          <div>
            <WhiteLabelSettings />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
