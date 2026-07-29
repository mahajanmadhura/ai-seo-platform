import React from 'react';
import { FileText } from 'lucide-react';
import ExportButtons from './ExportButtons';
import AdminTable from '../../components/ui/AdminTable';
import AdminStatusBadge from '../../components/ui/AdminStatusBadge';

export default function ReportPreview({
  selectedReport,
  reportData,
  loading,
  exporting,
  onExport,
}) {
  const getColumnsForReport = () => {
    switch (selectedReport) {
      case 'revenue':
        return [
          { header: 'Transaction ID' },
          { header: 'Customer' },
          { header: 'Amount' },
          { header: 'Credits' },
          { header: 'Gateway' },
          { header: 'Status' },
          { header: 'Date & Time' },
        ];
      case 'customers':
      case 'users':
        return [
          { header: 'User ID' },
          { header: 'Customer' },
          { header: 'Purchased' },
          { header: 'Remaining' },
          { header: 'Websites' },
          { header: 'Audits' },
          { header: 'Last Active' },
          { header: 'Status' },
        ];
      case 'transactions':
        return [
          { header: 'Transaction ID' },
          { header: 'User' },
          { header: 'Amount' },
          { header: 'Credits Purchased' },
          { header: 'Payment Gateway' },
          { header: 'Status' },
          { header: 'Date & Time' },
        ];
      case 'audits':
        return [
          { header: 'Audit ID' },
          { header: 'Website Domain' },
          { header: 'Owner' },
          { header: 'Status' },
          { header: 'SEO Score' },
          { header: 'Pages Crawled' },
          { header: 'Credits' },
          { header: 'Started At' },
        ];
      case 'ai_usage':
      case 'ai-usage':
        return [
          { header: 'Request ID' },
          { header: 'User' },
          { header: 'AI Model' },
          { header: 'Prompt Tokens' },
          { header: 'Completion Tokens' },
          { header: 'Total Tokens' },
          { header: 'Estimated Cost' },
          { header: 'Timestamp' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-5 text-left font-sans">
      {/* 4 Executive Summary KPI Cards */}
      {reportData?.summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {Object.entries(reportData.summary).map(([key, val]) => {
            const labelStr = key.replace(/_/g, ' ');
            const isCurrency = key.includes('revenue') || key.includes('cost') || key.includes('amount') || key.includes('value');
            const valFormatted = isCurrency ? `₹${Number(val).toLocaleString('en-IN')}` : typeof val === 'number' ? val.toLocaleString() : String(val);

            return (
              <div key={key} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  {labelStr}
                </span>
                <span className="text-2xl font-black text-zinc-950 font-mono block leading-none">
                  {valFormatted}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Preview Table Container with Export Actions */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden w-full space-y-0">
        <div className="p-3.5 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
              Report Preview ({reportData?.records?.length || 0} Records)
            </h3>
          </div>

          <ExportButtons onExport={onExport} exporting={exporting} />
        </div>

        <AdminTable
          columns={getColumnsForReport()}
          data={reportData?.records || []}
          isLoading={loading}
          emptyTitle="No records"
          emptyDescription=""
          renderRow={(row, idx) => (
            <>
              {Object.entries(row).map(([k, v], cellIdx) => {
                const isStatus = k === 'status';
                const isCurrency = k.includes('amount') || k.includes('cost') || k.includes('revenue');

                if (isStatus) {
                  return (
                    <td key={cellIdx} className="px-5 py-3.5 whitespace-nowrap">
                      <AdminStatusBadge status={String(v)} />
                    </td>
                  );
                }

                return (
                  <td
                    key={cellIdx}
                    className={`px-5 py-3.5 text-xs whitespace-nowrap ${
                      cellIdx === 0 ? 'font-bold text-zinc-950' : 'text-zinc-600 font-mono'
                    }`}
                  >
                    {isCurrency && typeof v === 'number' ? `₹${v.toFixed(2)}` : String(v)}
                  </td>
                );
              })}
            </>
          )}
        />
      </div>
    </div>
  );
}
