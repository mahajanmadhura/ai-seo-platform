import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getAuditDetail, getAuditIssues } from '../../services/audits';
import { getAIRecommendation } from '../../services/aiRecommendations';
import { getBranding } from '../../services/reports';
import {
  getCleanFilename,
  downloadReport,
  exportCSV,
  exportJSON,
  emailReport,
  generateReport
} from '../../services/reports';
import { useToast } from '../../context/ToastContext';
import EmailModal from './components/EmailModal';
import {
  Globe,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileText,
  Download,
  FileSpreadsheet,
  FileCode,
  Mail,
  Loader2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  Palette,
  Check,
  Clock,
  Layers
} from 'lucide-react';

export default function ReportDetail() {
  const { auditId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [audit, setAudit] = useState(null);
  const [issues, setIssues] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [loadingAction, setLoadingAction] = useState(null); // 'pdf' | 'csv' | 'json' | 'email' | null
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    loadReportDetails();
  }, [auditId]);

  const loadReportDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const detailRes = await getAuditDetail(auditId);
      if (detailRes.success && detailRes.data) {
        setAudit(detailRes.data);

        const [issuesRes, recRes, brandRes] = await Promise.all([
          getAuditIssues(auditId),
          getAIRecommendation(auditId),
          getBranding()
        ]);

        if (issuesRes.success) setIssues(issuesRes.data || []);
        if (recRes.success) setRecommendation(recRes.data);
        if (brandRes.success && brandRes.data) setBranding(brandRes.data);
      } else {
        setError(detailRes.message || 'Report not found.');
      }
    } catch (err) {
      setError('Failed to load report details.');
    } finally {
      setLoading(false);
    }
  };

  const domain = audit?.website_domain || 'website';

  const handleDownloadPDF = async () => {
    setLoadingAction('pdf');
    const filename = getCleanFilename(domain, 'pdf');
    const res = await downloadReport(auditId, filename);
    if (res.success) {
      addToast('PDF report downloaded successfully.', 'success');
    } else {
      const genRes = await generateReport(auditId);
      if (genRes.success) {
        const retryRes = await downloadReport(auditId, filename);
        if (retryRes.success) {
          addToast('PDF report downloaded successfully.', 'success');
        } else {
          addToast(retryRes.message || 'Failed to download PDF.', 'error');
        }
      } else {
        addToast(res.message || 'Failed to download PDF.', 'error');
      }
    }
    setLoadingAction(null);
  };

  const handleExportCSV = async () => {
    setLoadingAction('csv');
    const filename = getCleanFilename(domain, 'csv');
    const res = await exportCSV(auditId, filename);
    if (res.success) {
      addToast('CSV summary exported successfully.', 'success');
    } else {
      addToast(res.message || 'Failed to export CSV.', 'error');
    }
    setLoadingAction(null);
  };

  const handleExportJSON = async () => {
    setLoadingAction('json');
    const filename = getCleanFilename(domain, 'json');
    const res = await exportJSON(auditId, filename);
    if (res.success) {
      addToast('JSON summary exported successfully.', 'success');
    } else {
      addToast(res.message || 'Failed to export JSON.', 'error');
    }
    setLoadingAction(null);
  };

  const handleSendEmailSubmit = async (recipientEmail) => {
    setLoadingAction('email');
    await generateReport(auditId);
    const res = await emailReport(auditId, recipientEmail);
    if (res.success && res.data) {
      addToast(res.data.message || `Report sent to ${recipientEmail}`, 'success');
      setIsEmailModalOpen(false);
    } else {
      addToast(res.message || 'Failed to send email report.', 'error');
    }
    setLoadingAction(null);
  };

  const criticalErrors = issues.filter((i) => i.severity === 'ERROR' || i.category === 'ERROR');
  const warningIssues = issues.filter((i) => i.severity === 'WARNING' || i.category === 'WARNING');

  return (
    <DashboardLayout title="Report Workspace">
      <div className="space-y-6 max-w-6xl mx-auto text-left">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-border-color/40 pb-4">
          <Link
            to={domain ? `/reports/history/${encodeURIComponent(domain)}` : '/reports'}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-text hover:text-deep-green transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to {domain ? `${domain} History` : 'Reports'}
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#36E682]/10 border border-[#36E682]/30 text-[#053D34]">
            <CheckCircle2 className="w-3.5 h-3.5 text-forest-green" /> Report Status: Ready
          </span>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 border border-border-color/60 text-center flex flex-col items-center justify-center min-h-[250px] shadow-sm">
            <Loader2 className="w-8 h-8 text-deep-green animate-spin" />
            <p className="text-xs text-muted-text mt-3 font-bold">Loading executive report workspace...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-8 border border-border-color/60 text-center max-w-md mx-auto space-y-3 shadow-sm">
            <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
            <h3 className="text-sm font-black text-deep-green">Report Error</h3>
            <p className="text-xs text-muted-text font-semibold">{error}</p>
            <button
              onClick={() => navigate('/reports')}
              className="px-4 py-2 bg-deep-green text-white text-xs font-bold rounded-xl"
            >
              Return to Reports Library
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* 1. EXECUTIVE REPORT METADATA HEADER */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-color/60 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-color/40 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#E5F3EC] border border-border-color/40 flex items-center justify-center text-deep-green flex-shrink-0">
                    <Globe className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-deep-green tracking-tight">
                      Executive SEO Report — {domain}
                    </h1>
                    <p className="text-xs text-muted-text font-semibold mt-0.5">
                      Compiled on {audit?.started_at ? new Date(audit.started_at).toLocaleDateString() : 'N/A'} • Report Version v1.0
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-[#E5F3EC] border border-deep-green/10 px-5 py-2.5 rounded-2xl text-center">
                    <span className="text-[9px] uppercase font-black tracking-wider text-muted-text block">SEO Score</span>
                    <span className="text-2xl font-black text-deep-green">
                      {audit?.overall_score ?? 'N/A'}<span className="text-xs text-muted-text">/100</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-soft-bg p-3.5 rounded-2xl border border-border-color/40">
                  <span className="text-[9px] font-black uppercase text-muted-text tracking-wider block">Audit Date</span>
                  <span className="text-xs font-bold text-deep-green">
                    {audit?.started_at ? new Date(audit.started_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="bg-soft-bg p-3.5 rounded-2xl border border-border-color/40">
                  <span className="text-[9px] font-black uppercase text-muted-text tracking-wider block">Pages Crawled</span>
                  <span className="text-xs font-bold text-deep-green">{audit?.total_pages ?? 0} Pages</span>
                </div>
                <div className="bg-soft-bg p-3.5 rounded-2xl border border-border-color/40">
                  <span className="text-[9px] font-black uppercase text-muted-text tracking-wider block">Branding Applied</span>
                  <span className="text-xs font-bold text-deep-green truncate block">
                    {branding?.company_name ? branding.company_name : 'Default Athenura'}
                  </span>
                </div>
                <div className="bg-soft-bg p-3.5 rounded-2xl border border-border-color/40">
                  <span className="text-[9px] font-black uppercase text-muted-text tracking-wider block">Report Version</span>
                  <span className="text-xs font-mono font-bold text-deep-green">v1.0 (PDF/CSV/JSON)</span>
                </div>
              </div>
            </div>

            {/* 2. LIGHTWEIGHT ACTIVITY TIMELINE */}
            <div className="bg-white rounded-3xl p-6 border border-border-color/60 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-deep-green flex items-center gap-2">
                <Layers className="w-4 h-4 text-forest-green" /> Report Lifecycle Activity Timeline
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/60">
                  <Check className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase text-emerald-900 block">Audit Started</span>
                    <span className="text-[9px] text-emerald-700 font-semibold truncate block">
                      {audit?.started_at ? new Date(audit.started_at).toLocaleTimeString() : 'Completed'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/60">
                  <Check className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase text-emerald-900 block">Audit Completed</span>
                    <span className="text-[9px] text-emerald-700 font-semibold block">Crawl Finished</span>
                  </div>
                </div>

                <div className={`flex items-center gap-2.5 p-3 rounded-2xl border ${
                  recommendation ? 'bg-emerald-50/60 border-emerald-200/60' : 'bg-soft-bg border-border-color/40'
                }`}>
                  <Check className={`w-4 h-4 flex-shrink-0 ${recommendation ? 'text-emerald-700' : 'text-muted-text/40'}`} />
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase text-deep-green block">AI Recommendations</span>
                    <span className="text-[9px] text-muted-text font-semibold block">
                      {recommendation ? 'Generated' : 'Not Generated'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/60">
                  <Check className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase text-emerald-900 block">Report Compiled</span>
                    <span className="text-[9px] text-emerald-700 font-semibold block">Ready for Export</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. AI EXECUTIVE SUMMARY */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-color/60 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-border-color/40 pb-3">
                <Sparkles className="w-5 h-5 text-forest-green" />
                <h3 className="text-sm font-black text-deep-green">AI Executive Summary & Recommendations</h3>
              </div>

              {recommendation ? (
                <div className="space-y-4 text-xs text-deep-green leading-relaxed font-semibold">
                  {recommendation.summary && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-muted-text tracking-wider block">Key Summary</span>
                      <p>{recommendation.summary}</p>
                    </div>
                  )}

                  {recommendation.client_friendly_explanation && (
                    <div className="space-y-1 bg-soft-bg p-4 rounded-2xl border border-border-color/40">
                      <span className="text-[10px] font-black uppercase text-muted-text tracking-wider block">Client Overview</span>
                      <p>{recommendation.client_friendly_explanation}</p>
                    </div>
                  )}

                  {recommendation.quick_wins && recommendation.quick_wins.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase text-muted-text tracking-wider block">Quick Win Action Items</span>
                      <ul className="space-y-1.5">
                        {recommendation.quick_wins.map((win, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#36E682]" />
                            <span>{win}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-soft-bg p-5 rounded-2xl border border-border-color/40 text-xs font-semibold text-muted-text leading-relaxed">
                  AI recommendations were not generated for this audit.
                </div>
              )}
            </div>

            {/* 4. DEDICATED EXPORT & SHARING BENTO GRID */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-color/60 shadow-sm space-y-5">
              <div>
                <h3 className="text-sm sm:text-base font-black text-deep-green">Export & Deliverables Center</h3>
                <p className="text-xs text-muted-text font-semibold truncate">
                  Download or email report files for {domain}.
                </p>
              </div>

              {/* Responsive Bento Grid Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {/* Download PDF - Primary Bento Tile */}
                <button
                  onClick={handleDownloadPDF}
                  disabled={loadingAction !== null}
                  className="sm:col-span-2 lg:col-span-1 bg-deep-green hover:bg-[#36E682] text-white hover:text-deep-green p-4 rounded-2xl text-xs font-black transition-all flex items-center justify-between shadow-sm cursor-pointer disabled:opacity-50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 group-hover:bg-deep-green/10 flex items-center justify-center">
                      <Download className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-left min-w-0">
                      <span className="block font-black text-xs">Download PDF</span>
                      <span className="block text-[10px] opacity-80 font-normal">Full Executive PDF</span>
                    </div>
                  </div>
                  {loadingAction === 'pdf' && <Loader2 className="w-4 h-4 animate-spin" />}
                </button>

                {/* Export CSV Bento Tile */}
                <button
                  onClick={handleExportCSV}
                  disabled={loadingAction !== null}
                  className="bg-soft-bg hover:bg-mint-surface/80 text-deep-green border border-border-color/60 p-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100/60 text-forest-green flex items-center justify-center">
                      <FileSpreadsheet className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-left min-w-0">
                      <span className="block font-black text-xs">Export CSV</span>
                      <span className="block text-[10px] text-muted-text font-semibold">Structured Spreadsheet</span>
                    </div>
                  </div>
                  {loadingAction === 'csv' && <Loader2 className="w-4 h-4 animate-spin" />}
                </button>

                {/* Export JSON Bento Tile */}
                <button
                  onClick={handleExportJSON}
                  disabled={loadingAction !== null}
                  className="bg-soft-bg hover:bg-mint-surface/80 text-deep-green border border-border-color/60 p-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100/60 text-blue-600 flex items-center justify-center">
                      <FileCode className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-left min-w-0">
                      <span className="block font-black text-xs">Export JSON</span>
                      <span className="block text-[10px] text-muted-text font-semibold">Raw Data Schema</span>
                    </div>
                  </div>
                  {loadingAction === 'json' && <Loader2 className="w-4 h-4 animate-spin" />}
                </button>

                {/* Send Email Bento Tile */}
                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  disabled={loadingAction !== null}
                  className="bg-mint-surface hover:bg-deep-green text-deep-green hover:text-white border border-border-color/40 p-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer disabled:opacity-50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-deep-green/10 group-hover:bg-white/20 flex items-center justify-center">
                      <Mail className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-left min-w-0">
                      <span className="block font-black text-xs">Send Email</span>
                      <span className="block text-[10px] opacity-80 font-semibold">Deliver to Client</span>
                    </div>
                  </div>
                  {loadingAction === 'email' && <Loader2 className="w-4 h-4 animate-spin" />}
                </button>

                {/* Delete Report Bento Tile */}
                <button
                  onClick={() => {
                    addToast('Report dismissed from active detail view.', 'info');
                    navigate('/reports');
                  }}
                  className="bg-red-50/80 hover:bg-red-100 text-red-700 border border-red-200/80 p-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-200/50 text-red-700 flex items-center justify-center">
                      <Trash2 className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-left min-w-0">
                      <span className="block font-black text-xs">Delete Report</span>
                      <span className="block text-[10px] text-red-600/80 font-semibold">Remove Record</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Email Modal Dialog */}
        <EmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          onSendEmail={handleSendEmailSubmit}
          loading={loadingAction === 'email'}
        />
      </div>
    </DashboardLayout>
  );
}
