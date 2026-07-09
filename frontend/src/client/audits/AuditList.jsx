import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getAudits } from '../../services/audits';
import { Globe, Search, Calendar, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export default function AuditList() {
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAudits = async () => {
      setLoading(true);
      setError('');
      const res = await getAudits();
      if (res.success && res.data) {
        setAudits(res.data);
      } else {
        setError(res.message || 'Failed to load audits.');
      }
      setLoading(false);
    };
    fetchAudits();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DONE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E5F3EC] text-forest-green border border-forest-green/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Running
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Loader2 className="w-3.5 h-3.5 animate-pulse" /> Queued
          </span>
        );
      case 'FAILED':
        default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="w-3.5 h-3.5" /> Failed
          </span>
        );
    }
  };

  return (
    <DashboardLayout title="SEO Audit History">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-deep-green tracking-tight">Audit History</h2>
            <p className="text-xs text-muted-text mt-0.5 font-semibold">Monitor website crawl performance and SEO audits.</p>
          </div>
          <Link
            to="/websites"
            className="bg-deep-green hover:bg-[#36E682] text-white hover:text-deep-green px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            Start New Audit <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-16 border border-border-color/60 text-center flex flex-col items-center justify-center min-h-[300px] shadow-sm">
            <Loader2 className="w-10 h-10 text-deep-green animate-spin" />
            <p className="text-xs text-muted-text mt-4 font-bold">Loading audit logs...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-16 border border-border-color/60 text-center max-w-lg mx-auto space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-deep-green">Failed to load audits</h3>
            <p className="text-xs text-muted-text font-semibold">{error}</p>
          </div>
        ) : audits.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border border-border-color/60 text-center max-w-xl mx-auto space-y-6 shadow-sm">
            <div className="w-16 h-16 bg-[#E5F3EC] border border-border-color/30 rounded-full flex items-center justify-center mx-auto text-deep-green">
              <Globe className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-black text-deep-green">No audits yet</h3>
              <p className="text-xs text-muted-text max-w-md mx-auto leading-relaxed font-semibold">
                Add a verified website and start your first SEO audit using 5 credits.
              </p>
            </div>
            <div>
              <Link
                to="/websites"
                className="inline-flex items-center gap-1.5 bg-deep-green hover:bg-[#36E682] text-white hover:text-deep-green px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer"
              >
                Go to Websites <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-border-color/60 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-color/40 bg-mint-surface/30">
                    <th className="p-5 text-xs font-black uppercase text-deep-green tracking-wider">Website</th>
                    <th className="p-5 text-xs font-black uppercase text-deep-green tracking-wider">Keyword</th>
                    <th className="p-5 text-xs font-black uppercase text-deep-green tracking-wider">Status</th>
                    <th className="p-5 text-xs font-black uppercase text-deep-green tracking-wider">Overall Score</th>
                    <th className="p-5 text-xs font-black uppercase text-deep-green tracking-wider">Date Created</th>
                    <th className="p-5 text-xs font-black uppercase text-deep-green tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color/30">
                  {audits.map((audit) => (
                    <tr key={audit.id} className="hover:bg-mint-surface/10 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-mint-surface border border-border-color/40 flex items-center justify-center text-deep-green">
                            <Globe className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-deep-green truncate max-w-[200px]">{audit.website_domain}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        {audit.key_word ? (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-text">
                            <Search className="w-3.5 h-3.5" /> {audit.key_word}
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-muted-text/60">-</span>
                        )}
                      </td>
                      <td className="p-5">{getStatusBadge(audit.status)}</td>
                      <td className="p-5">
                        {audit.status === 'DONE' && audit.overall_score !== null ? (
                          <span className="text-sm font-black text-deep-green">{audit.overall_score}/100</span>
                        ) : (
                          <span className="text-xs font-semibold text-muted-text/50">-</span>
                        )}
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-text">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(audit.started_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <button
                          onClick={() => navigate(`/audits/${audit.id}`)}
                          className="bg-mint-surface hover:bg-deep-green border border-border-color/40 hover:border-transparent text-deep-green hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
