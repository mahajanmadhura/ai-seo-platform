import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getAudits } from '../../services/audits';
import ReportCard from './components/ReportCard';
import WhiteLabelSettings from './components/WhiteLabelSettings';
import {
  FileText,
  Palette,
  Loader2,
  AlertCircle,
  ArrowRight,
  Globe,
  History,
  Eye
} from 'lucide-react';

export default function Reports() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'branding'
  const [audits, setAudits] = useState([]);
  const [loadingAudits, setLoadingAudits] = useState(true);
  const [auditError, setAuditError] = useState('');
  const [selectedAuditId, setSelectedAuditId] = useState(null);

  useEffect(() => {
    // Check if audit_id parameter is passed in URL (e.g. /reports?audit_id=9)
    const params = new URLSearchParams(location.search);
    const paramAuditId = params.get('audit_id');
    if (paramAuditId) {
      setSelectedAuditId(Number(paramAuditId));
    }
  }, [location.search]);

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
      setAuditError(res.message || 'Failed to load audits.');
    }

    setLoadingAudits(false);
  };

  const handleDeleteCard = (auditId) => {
    setAudits((prev) => prev.filter((a) => a.id !== auditId));
  };

  // Group completed audits by website: ONLY ONE CARD PER WEBSITE (shows latest report)
  const websiteGroups = useMemo(() => {
    const completed = audits.filter((a) => a.status === 'DONE');
    const groups = {};

    completed.forEach((audit) => {
      const domain = audit.website_domain || 'Uncategorized';
      if (!groups[domain]) {
        groups[domain] = [];
      }
      groups[domain].push(audit);
    });

    // Sort each domain's audits newest first
    Object.keys(groups).forEach((domain) => {
      groups[domain].sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
    });

    return Object.entries(groups).map(([domain, websiteAudits]) => ({
      domain,
      latestReport: websiteAudits[0],
      totalCount: websiteAudits.length
    }));
  }, [audits]);

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Header & Top Right Tabs Switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-color/40 pb-4">
          <div>
            <h1 className="text-2xl font-black text-deep-green tracking-tight">Reports</h1>
            <p className="text-xs text-muted-text mt-1 font-semibold">
              Executive SEO audit reports grouped by website domain.
            </p>
          </div>

          {/* Top Right Tabs: Reports & White Label Branding */}
          <div className="flex items-center gap-1.5 bg-white border border-border-color/60 p-1.5 rounded-2xl shadow-xs">
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-deep-green text-white shadow-xs'
                  : 'text-muted-text hover:text-deep-green hover:bg-soft-bg'
              }`}
            >
              <FileText className="w-4 h-4" /> Reports
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

        {/* TAB 1: ONE WEBSITE CARD PER DOMAIN */}
        {activeTab === 'reports' && (
          <div>
            {loadingAudits ? (
              <div className="bg-white rounded-2xl p-12 border border-border-color/60 text-center flex flex-col items-center justify-center min-h-[250px] shadow-xs">
                <Loader2 className="w-8 h-8 text-deep-green animate-spin" />
                <p className="text-xs text-muted-text mt-3 font-bold">Loading reports...</p>
              </div>
            ) : auditError ? (
              <div className="bg-white rounded-2xl p-8 border border-border-color/60 text-center max-w-md mx-auto space-y-3 shadow-xs">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-deep-green">Failed to Load Reports</h3>
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
                  <h3 className="text-base font-black text-deep-green">No Reports Generated Yet</h3>
                  <p className="text-xs text-muted-text font-semibold leading-relaxed">
                    Complete an audit and click "Generate Report" on the Audit Results page to view reports here.
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
              /* One Website Card Per Domain showing Latest Report + View History Button */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {websiteGroups.map((group) => (
                  <div
                    key={group.domain}
                    className="bg-white rounded-3xl border border-border-color/60 p-6 shadow-sm space-y-6 text-left flex flex-col justify-between"
                  >
                    {/* Website Header & View History Action Button */}
                    <div className="flex items-center justify-between gap-3 border-b border-border-color/40 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#E5F3EC] border border-border-color/40 flex items-center justify-center text-deep-green flex-shrink-0">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-deep-green tracking-tight">
                            {group.domain}
                          </h3>
                          <p className="text-xs text-muted-text font-semibold">
                            {group.totalCount} {group.totalCount === 1 ? 'Report' : 'Reports'} Total
                          </p>
                        </div>
                      </div>

                      {/* View History Button -> Navigates to dedicated History Page */}
                      <Link
                        to={`/reports/history/${encodeURIComponent(group.domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/+$/, ''))}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-soft-bg hover:bg-mint-surface/50 text-deep-green border border-border-color/50 transition-all cursor-pointer flex-shrink-0"
                      >
                        <History className="w-4 h-4 text-forest-green" /> View History
                      </Link>
                    </div>

                    {/* Latest Report Display */}
                    <div className="space-y-2 flex-grow flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-text block">
                          Latest Generated Report
                        </span>
                        <button
                          onClick={() => navigate(`/reports/detail/${group.latestReport.id}`)}
                          className="text-[11px] font-bold text-deep-green hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-forest-green" /> View Details
                        </button>
                      </div>

                      <ReportCard
                        audit={group.latestReport}
                        isSelected={selectedAuditId === group.latestReport.id}
                        onDelete={handleDeleteCard}
                      />
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
