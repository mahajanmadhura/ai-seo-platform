import React, { useState, useEffect } from 'react';
import { ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { getAuditIssues } from '../../../services/audits';
import { Link } from 'react-router-dom';

export default function TopIssuesRecommendations({ audits }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllIssues = async () => {
      setLoading(true);
      try {
        const latestAuditsBySite = {};
        audits.forEach((audit) => {
          if (audit.status === 'DONE') {
            const domain = audit.website_domain;
            if (
              !latestAuditsBySite[domain] ||
              new Date(audit.started_at) > new Date(latestAuditsBySite[domain].started_at)
            ) {
              latestAuditsBySite[domain] = audit;
            }
          }
        });

        const activeAudits = Object.values(latestAuditsBySite);
        const reqs = activeAudits.map((a) => getAuditIssues(a.id));
        const results = await Promise.all(reqs);

        let allIssues = [];
        results.forEach((res, idx) => {
          if (res.success && res.data) {
            const domain = activeAudits[idx].website_domain;
            const auditId = activeAudits[idx].id;
            const tagged = res.data.map((issue) => ({
              ...issue,
              domain,
              auditId,
            }));
            allIssues = [...allIssues, ...tagged];
          }
        });

        setIssues(allIssues);
      } catch (err) {
        // Fail silently
      }
      setLoading(false);
    };

    if (audits && audits.length > 0) {
      fetchAllIssues();
    }
  }, [audits]);

  const criticalIssues = issues
    .filter((issue) => issue.severity === 'ERROR' || issue.category === 'ERROR')
    .slice(0, 3); 

  return (
    <div className="bg-white rounded-[20px] p-4 border border-[#053D34]/10 shadow-sm flex flex-col justify-between h-[280px] text-left">
      <div className="space-y-3 flex flex-col h-full justify-between">
        <div className="flex items-center gap-2 pb-2.5 border-b border-[#053D34]/10 flex-shrink-0">
          <div className="p-1.5 bg-[#EEF5F1] rounded-lg text-brand-primary flex-shrink-0">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-black text-brand-evergreen text-xs uppercase tracking-wide">Critical Issues</h3>
            <p className="text-[9px] text-brand-secondary font-bold">Top priority fixes across all domains.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 my-2 bg-soft-bg rounded-xl animate-pulse"></div>
        ) : audits.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
            <p className="text-[10px] text-brand-secondary font-bold">No websites monitored yet.</p>
          </div>
        ) : criticalIssues.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2.5 py-6">
            <div className="p-2 bg-[#E5F3EC] border border-[#36E682]/20 text-[#36E682] rounded-full">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-brand-evergreen font-black uppercase leading-none">No critical alerts</p>
              <p className="text-[8px] text-[#6D8179] font-bold max-w-[150px] leading-normal mx-auto">All of your monitored domains are clean of indexing blocker errors.</p>
            </div>
          </div>
        ) : (
          <div className="flex-grow space-y-2 overflow-y-auto pt-1 my-1">
            {criticalIssues.map((issue) => (
              <div
                key={issue.id}
                className="flex items-center justify-between p-2.5 h-[48px] rounded-xl border border-outline-variant bg-brand-surface-low hover:bg-white hover:border-[#0B5A4A]/15 transition-all shadow-sm group"
              >
                <div className="flex flex-col justify-center min-w-0 max-w-[80%] leading-none space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[7.5px] font-black uppercase text-[#0B5A4A] bg-[#E5F3EC] px-1.5 py-0.5 rounded border border-[#0A4B43]/10 flex-shrink-0">
                      {issue.domain}
                    </span>
                    <span className="text-[7.5px] font-black text-brand-burnt-coral uppercase tracking-widest leading-none">
                      {issue.severity || 'Error'}
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-brand-evergreen truncate leading-tight">
                    {issue.message}
                  </p>
                </div>
                <Link
                  to={`/audits/${issue.auditId}`}
                  className="w-7 h-7 rounded-lg bg-white border border-[#053D34]/10 flex items-center justify-center hover:bg-brand-evergreen hover:text-white text-brand-evergreen hover:border-brand-evergreen transition-all shadow-sm flex-shrink-0"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
