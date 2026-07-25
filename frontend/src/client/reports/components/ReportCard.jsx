import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Calendar, CheckCircle2, Eye, ArrowRight } from 'lucide-react';

export default function ReportCard({ audit, isSelected = false }) {
  const navigate = useNavigate();

  const website = audit.website_domain || 'example.com';
  const score = audit.overall_score !== null && audit.overall_score !== undefined ? audit.overall_score : 'N/A';
  const auditDate = audit.started_at
    ? new Date(audit.started_at).toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'N/A';

  const auditTime = audit.started_at
    ? new Date(audit.started_at).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  return (
    <div
      id={`report-card-${audit.id}`}
      className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 ${
        isSelected
          ? 'border-deep-green ring-2 ring-[#36E682]/40 bg-[#E5F3EC]/10'
          : 'border-border-color/60 hover:border-deep-green/30'
      }`}
    >
      {/* Card Top: Website & Audit Metadata */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-[#E5F3EC] border border-border-color/40 flex items-center justify-center text-deep-green flex-shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div className="truncate text-left">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-deep-green truncate" title={website}>
                  {website}
                </h3>
                {isSelected && (
                  <span className="text-[9px] font-black uppercase bg-[#36E682] text-deep-green px-1.5 py-0.5 rounded">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-text font-semibold flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-muted-text/70" /> Audit #{audit.id} • {auditDate} {auditTime}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-xs font-black text-deep-green bg-soft-bg px-2.5 py-1 rounded-lg border border-border-color/40">
              Score: {score}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-forest-green">
              <CheckCircle2 className="w-3 h-3" /> Completed
            </span>
          </div>
        </div>
      </div>

      {/* Card Bottom: Single Action "View Report" navigating to Report Detail Export Center */}
      <div className="pt-3 border-t border-border-color/40 flex items-center justify-end">
        <button
          onClick={() => navigate(`/reports/detail/${audit.id}`)}
          className="w-full flex items-center justify-center gap-1.5 bg-deep-green hover:bg-[#36E682] text-white hover:text-deep-green py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs"
        >
          <Eye className="w-3.5 h-3.5" /> View Report Details <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
