import React from 'react';
import { ArrowRight, AlertCircle, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecentAuditsList({ audits, loading, error }) {
  const getScoreBadge = (score) => {
    if (!score && score !== 0) return 'bg-gray-100 text-gray-500 border-gray-200';
    if (score >= 80) return 'bg-[#36E682]/10 text-brand-evergreen border-[#36E682]/25';
    if (score >= 50) return 'bg-amber-500/10 text-amber-700 border-amber-500/25';
    return 'bg-brand-burnt-coral/10 text-brand-burnt-coral border-brand-burnt-coral/25';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DONE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase bg-[#E5F3EC] text-brand-evergreen border border-[#0A4B43]/10">
            <CheckCircle className="w-2.5 h-2.5" /> Done
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
            <Clock className="w-2.5 h-2.5" /> Running
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-2.5 h-2.5" /> Queued
          </span>
        );
    }
  };

  const getRowAvatar = (domain) => {
    const chars = domain ? domain.replace(/^(https?:\/\/)?(www\.)?/, '').substring(0, 2).toUpperCase() : 'SE';
    return (
      <div className="w-8 h-8 rounded-full border border-[#0A4B43]/10 bg-[#E5F3EC] text-[#0B5A4A] flex items-center justify-center font-black text-[10px] uppercase tracking-wider flex-shrink-0">
        {chars}
      </div>
    );
  };

  const recent = [...audits]
    .sort((a, b) => new Date(b.started_at || 0) - new Date(a.started_at || 0))
    .slice(0, 4);

  return (
    <div className="bg-white rounded-[20px] p-4 border border-[#053D34]/10 shadow-sm flex flex-col justify-between h-[360px] text-left">
      <div className="space-y-3 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between border-b border-[#053D34]/10 pb-2.5 flex-shrink-0">
          <div>
            <h3 className="font-black text-brand-evergreen text-xs tracking-tight uppercase">Recent Audits</h3>
            <p className="text-[9px] text-brand-secondary mt-0.5 font-bold">Your latest crawling campaigns and scores.</p>
          </div>
          <Link to="/audits" className="px-2.5 py-1 rounded-full border border-[#053D34]/10 text-[9px] font-black uppercase tracking-wider text-brand-primary hover:text-brand-electric-sprout transition-colors">
            + View All
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2.5 py-1 flex-1 justify-center flex flex-col">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-soft-bg rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-2 text-[10px] text-brand-burnt-coral font-bold flex-1">
            <AlertCircle className="w-4 h-4" />
            <span>Failed to load recent audits.</span>
          </div>
        ) : recent.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-8">
            <div className="p-2.5 rounded-full bg-brand-surface-high border border-[#053D34]/10 text-brand-evergreen">
              <Sparkles className="w-4 h-4 text-brand-primary" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-brand-evergreen font-black uppercase">No audits yet</p>
              <p className="text-[9px] text-brand-secondary font-bold">Register a domain and start your first SEO crawl.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 flex-1 overflow-y-auto">
            {recent.map((audit, idx) => (
              <div
                key={audit.id}
                className="flex items-center justify-between p-2.5 h-[62px] rounded-xl border border-outline-variant bg-brand-surface-low hover:bg-white hover:border-[#0B5A4A]/15 transition-all shadow-sm group"
              >
                <div className="flex items-center gap-2.5 min-w-0 max-w-[55%]">
                  {getRowAvatar(audit.website_domain)}
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[11px] font-black text-brand-evergreen block truncate leading-tight">
                      {audit.website_domain}
                    </span>
                    <span className="text-[8px] text-brand-secondary font-bold flex items-center gap-1">
                      Keyword: <span className="text-brand-evergreen font-black truncate">{audit.key_word || 'N/A'}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right space-y-0.5">
                    <div className="flex items-center gap-1 justify-end">
                      {getStatusBadge(audit.status)}
                      {audit.overall_score !== null && (
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${getScoreBadge(audit.overall_score)}`}>
                          {audit.overall_score}%
                        </span>
                      )}
                    </div>
                    <span className="text-[8px] text-brand-secondary block font-bold">
                      {new Date(audit.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <Link
                    to={`/audits/${audit.id}`}
                    className="w-7 h-7 rounded-lg bg-white border border-[#053D34]/10 flex items-center justify-center hover:bg-brand-evergreen hover:text-white text-brand-evergreen hover:border-brand-evergreen transition-all shadow-sm"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
