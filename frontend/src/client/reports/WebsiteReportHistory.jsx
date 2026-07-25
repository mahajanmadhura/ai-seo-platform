import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getAudits } from '../../services/audits';
import {
  Globe,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileText,
  Loader2,
  AlertCircle,
  Eye,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function WebsiteReportHistory() {
  const params = useParams();
  const navigate = useNavigate();

  const rawParam = params['*'] || params.domain || '';
  const decodedDomain = decodeURIComponent(rawParam).replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/+$/, '');

  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [decodedDomain]);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');

    const res = await getAudits();
    if (res.success && res.data) {
      // Filter for this domain and sort newest first
      const domainAudits = (res.data || [])
        .filter((a) => {
          const aDomain = (a.website_domain || '').replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/+$/, '');
          return aDomain.toLowerCase() === decodedDomain.toLowerCase() || a.website_domain === decodedDomain;
        })
        .sort((a, b) => new Date(b.started_at) - new Date(a.started_at));

      setAudits(domainAudits);
    } else {
      setError(res.message || 'Failed to load audit history.');
    }
    setLoading(false);
  };

  return (
    <DashboardLayout title="Website Report History">
      <div className="space-y-6 max-w-7xl mx-auto text-left">
        
        {/* Back Navigation & Domain Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-color/40 pb-4">
          <div className="space-y-1">
            <Link
              to="/reports"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-text hover:text-deep-green transition-colors mb-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Report Library
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E5F3EC] border border-border-color/40 flex items-center justify-center text-deep-green flex-shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-deep-green tracking-tight">
                  {decodedDomain} — Audit & Report History
                </h1>
                <p className="text-xs text-muted-text font-semibold">
                  Chronological ledger of audits and compiled reports for {decodedDomain}.
                </p>
              </div>
            </div>
          </div>

          <span className="text-xs font-black text-deep-green bg-soft-bg px-3.5 py-2 rounded-xl border border-border-color/50">
            {audits.length} {audits.length === 1 ? 'Audit Record' : 'Audit Records'}
          </span>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 border border-border-color/60 text-center flex flex-col items-center justify-center min-h-[250px] shadow-sm">
            <Loader2 className="w-8 h-8 text-deep-green animate-spin" />
            <p className="text-xs text-muted-text mt-3 font-bold">Loading audit history ledger...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-8 border border-border-color/60 text-center max-w-md mx-auto space-y-3 shadow-sm">
            <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
            <h3 className="text-sm font-black text-deep-green">Failed to Load History</h3>
            <p className="text-xs text-muted-text font-semibold">{error}</p>
            <button
              onClick={fetchHistory}
              className="px-4 py-2 bg-deep-green text-white text-xs font-bold rounded-xl hover:bg-[#36E682] hover:text-deep-green transition-all"
            >
              Retry
            </button>
          </div>
        ) : audits.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-border-color/60 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <FileText className="w-8 h-8 text-deep-green mx-auto" />
            <h3 className="text-base font-black text-deep-green">No Audit History Found</h3>
            <p className="text-xs text-muted-text font-semibold">
              Start an audit for {decodedDomain} to generate reports and audit history records.
            </p>
          </div>
        ) : (
          /* History Ledger List */
          <div className="space-y-3.5">
            {audits.map((audit) => {
              const auditDate = audit.started_at
                ? new Date(audit.started_at).toLocaleDateString(undefined, {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'N/A';

              const reportStatus = (audit.pdf_file || audit.status === 'DONE') ? 'Ready' : 'Not Generated';
              const aiStatus = (audit.ai_recommendation || audit.has_ai_recommendations) ? 'Generated' : 'Not Generated';

              return (
                <div
                  key={audit.id}
                  className="bg-white rounded-2xl border border-border-color/60 p-4.5 sm:p-5 shadow-sm hover:border-deep-green/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
                >
                  <div className="flex items-center justify-between gap-2 min-w-0 md:w-1/4">
                    <div>
                      <span className="text-sm font-black text-deep-green block">
                        Audit #{audit.id}
                      </span>
                      <p className="text-[11px] text-muted-text font-semibold flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-text/70" /> {auditDate}
                      </p>
                    </div>

                    {/* Mobile Score Badge (Visible on < md) */}
                    <div className="md:hidden text-right">
                      <span className="text-[8px] font-black uppercase text-muted-text tracking-wider block">Score</span>
                      <span className="text-sm font-black text-deep-green">
                        {audit.status === 'DONE' && audit.overall_score !== null && audit.overall_score !== undefined
                          ? `${audit.overall_score}/100`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 md:flex md:items-center md:gap-6 md:w-1/2 border-t border-b md:border-0 border-border-color/30 py-3 md:py-0">
                    {/* Audit Status */}
                    <div>
                      <span className="text-[9px] font-black uppercase text-muted-text tracking-wider block mb-1">Audit</span>
                      {audit.status === 'DONE' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                          Completed
                        </span>
                      ) : audit.status === 'FAILED' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-red-800 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 uppercase">
                          Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 uppercase">
                          Pending
                        </span>
                      )}
                    </div>

                    {/* Report Status */}
                    <div>
                      <span className="text-[9px] font-black uppercase text-muted-text tracking-wider block mb-1">Report</span>
                      <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${
                        reportStatus === 'Ready' ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {reportStatus}
                      </span>
                    </div>

                    {/* AI Status */}
                    <div>
                      <span className="text-[9px] font-black uppercase text-muted-text tracking-wider block mb-1">AI Insights</span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-deep-green/80 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-forest-green flex-shrink-0" /> {aiStatus}
                      </span>
                    </div>
                  </div>

                  {/* Desktop SEO Score & Single Action Button */}
                  <div className="flex items-center justify-between md:justify-end gap-4 md:w-1/4">
                    <div className="hidden md:block text-left">
                      <span className="text-[9px] font-black uppercase text-muted-text tracking-wider block">SEO Score</span>
                      <span className="text-base font-black text-deep-green">
                        {audit.status === 'DONE' && audit.overall_score !== null && audit.overall_score !== undefined
                          ? `${audit.overall_score}/100`
                          : 'N/A'}
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/reports/detail/${audit.id}`)}
                      className="w-full md:w-auto bg-deep-green hover:bg-[#36E682] text-white hover:text-deep-green px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Eye className="w-4 h-4" /> View Report
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
