import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getAuditDetail, getAuditIssues } from '../../services/audits';
import { getAIRecommendation } from '../../services/aiRecommendations';
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
  Trash2
} from 'lucide-react';

export default function ReportDetail() {
  const { auditId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [audit, setAudit] = useState(null);
  const [issues, setIssues] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
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

        const [issuesRes, recRes] = await Promise.all([
          getAuditIssues(auditId),
          getAIRecommendation(auditId)
        ]);

        if (issuesRes.success) setIssues(issuesRes.data || []);
        if (recRes.success) setRecommendation(recRes.data);
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
    <DashboardLayout title="Report Details">
      <div className="space-y-6 max-w-6xl mx-auto text-left">
        
        {/* Navigation & Header */}
        <div className="space-y-2 border-b border-border-color/40 pb-4">
          <Link
            to={domain ? `/reports/history/${encodeURIComponent(domain)}` : '/reports'}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-text hover:text-deep-green transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to {domain ? `${domain} History` : 'Reports'}
          </Link>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E5F3EC] border border-border-color/40 flex items-center justify-center text-deep-green flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-deep-green tracking-tight">
                  SEO Report Details — {domain}
                </h1>
                <p className="text-xs text-muted-text font-semibold">
                  Audit Report #{auditId} • Generated on {audit?.started_at ? new Date(audit.started_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-deep-green bg-soft-bg px-3.5 py-1.5 rounded-xl border border-border-color/50">
                Score: {audit?.overall_score ?? 'N/A'}/100
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 border border-border-color/60 text-center flex flex-col items-center justify-center min-h-[250px] shadow-sm">
            <Loader2 className="w-8 h-8 text-deep-green animate-spin" />
            <p className="text-xs text-muted-text mt-3 font-bold">Loading report details...</p>
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
              Return to Reports
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Dedicated Actions Toolbar */}
            <div className="bg-white rounded-3xl p-6 border border-border-color/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-deep-green">Export & Share Report</h3>
                <p className="text-xs text-muted-text font-semibold">
                  Download or email formatted reports for {domain}.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={handleDownloadPDF}
                  disabled={loadingAction !== null}
                  className="bg-deep-green hover:bg-[#36E682] text-white hover:text-deep-green px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loadingAction === 'pdf' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Download PDF
                    </>
                  )}
                </button>

                <button
                  onClick={handleExportCSV}
                  disabled={loadingAction !== null}
                  className="bg-soft-bg hover:bg-mint-surface/60 text-deep-green border border-border-color/60 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loadingAction === 'csv' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4 text-forest-green" /> Export CSV
                    </>
                  )}
                </button>

                <button
                  onClick={handleExportJSON}
                  disabled={loadingAction !== null}
                  className="bg-soft-bg hover:bg-mint-surface/60 text-deep-green border border-border-color/60 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loadingAction === 'json' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <FileCode className="w-4 h-4 text-blue-600" /> Export JSON
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  disabled={loadingAction !== null}
                  className="bg-mint-surface hover:bg-deep-green text-deep-green hover:text-white border border-border-color/40 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loadingAction === 'email' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" /> Send Email
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    addToast('Report dismissed from active detail view.', 'info');
                    navigate('/reports');
                  }}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Delete/Dismiss Report"
                >
                  <Trash2 className="w-4 h-4" /> Delete Report
                </button>
              </div>
            </div>

            {/* AI Recommendations Summary */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-color/60 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-border-color/40 pb-3">
                <Sparkles className="w-5 h-5 text-forest-green" />
                <h3 className="text-sm font-black text-deep-green">AI Executive Summary</h3>
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
                      <span className="text-[10px] font-black uppercase text-muted-text tracking-wider block">Overview</span>
                      <p>{recommendation.client_friendly_explanation}</p>
                    </div>
                  )}

                  {recommendation.quick_wins && recommendation.quick_wins.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase text-muted-text tracking-wider block">Quick Win Actions</span>
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
                  No AI recommendations have been generated for this audit yet. Generate AI Recommendations from the Audit Results page to include personalized optimization suggestions in your report.
                </div>
              )}
            </div>

            {/* Audit Issues Overview */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-color/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border-color/40 pb-3">
                <h3 className="text-sm font-black text-deep-green">Issues & Findings Summary</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                    {criticalErrors.length} Errors
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {warningIssues.length} Warnings
                  </span>
                </div>
              </div>

              {issues.length === 0 ? (
                <p className="text-xs text-muted-text font-semibold">No critical issues recorded for this report.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {issues.slice(0, 10).map((issue) => (
                    <div
                      key={issue.id}
                      className="p-3.5 rounded-2xl border border-border-color/40 bg-soft-bg flex items-start gap-3 text-left"
                    >
                      {issue.severity === 'ERROR' || issue.category === 'ERROR' ? (
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-deep-green">{issue.message || issue.description}</p>
                        {issue.page_url && (
                          <span className="text-[10px] font-mono text-muted-text block">{issue.page_url}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
