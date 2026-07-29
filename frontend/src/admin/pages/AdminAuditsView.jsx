import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Eye, Clock, CheckCircle2, AlertOctagon } from 'lucide-react';
import adminApi from '../services/adminApi';
import AdminHeader from '../components/ui/AdminHeader';
import AdminTable from '../components/ui/AdminTable';
import AdminPagination from '../components/ui/AdminPagination';
import AdminStatusBadge from '../components/ui/AdminStatusBadge';
import AdminDrawer from '../components/ui/AdminDrawer';
import AdminErrorState from '../components/ui/AdminErrorState';

export default function AdminAuditsView() {
  const [audits, setAudits] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const [selectedAudit, setSelectedAudit] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadAudits = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page };
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await adminApi.getAudits(params);
      setAudits(res.data || []);
      setPagination(res.pagination || null);
      setCurrentPage(page);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch audit executions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudits(1);
  }, [statusFilter]);

  const viewAuditDetails = (aud) => {
    setSelectedAudit(aud);
    setIsDrawerOpen(true);
  };

  const completedCount = audits.filter((a) => a.status === 'DONE').length;
  const runningCount = audits.filter((a) => a.status === 'RUNNING').length;
  const failedCount = audits.filter((a) => a.status === 'FAILED').length;
  const completionRate = audits.length > 0 ? Math.round((completedCount / audits.length) * 100) : 0;

  const columns = [
    { header: 'Audit ID' },
    { header: 'Website Reference' },
    { header: 'Overall Score' },
    { header: 'Status' },
    { header: 'Started Date' },
    { header: 'Actions' },
  ];

  if (error) {
    return <AdminErrorState message={error} onRetry={() => loadAudits(currentPage)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 text-left pb-16 font-sans"
    >
      {/* Standardized Header */}
      <AdminHeader
        title="Audits"
        lastUpdated={lastRefreshed}
        onRefresh={() => loadAudits(currentPage)}
        loading={loading}
      />

      {/* Main Content Layout with Contextual Insight Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Audits Table (3 Col Span) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
              {['ALL', 'DONE', 'RUNNING', 'FAILED', 'PENDING'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-zinc-950 text-white font-black'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {st === 'ALL' ? 'All Audits' : st}
                </button>
              ))}
            </div>

            <span className="text-xs text-zinc-500 font-semibold">{audits.length} Audits Loaded</span>
          </div>

          <AdminTable
            columns={columns}
            data={audits}
            isLoading={loading}
            emptyTitle="No audits found"
            emptyDescription="There are no audit runs matching the selected status filter."
            renderRow={(aud) => (
              <>
                <td className="px-5 py-4 font-mono font-bold">#{aud.id}</td>
                <td className="px-5 py-4 font-semibold text-zinc-950">Website #{aud.website_id || 'N/A'}</td>
                <td className="px-5 py-4 font-black">
                  {aud.score !== null ? (
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      aud.score >= 80 ? 'bg-emerald-100 text-emerald-800' :
                      aud.score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {aud.score} / 100
                    </span>
                  ) : (
                    <span className="text-zinc-400">N/A</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <AdminStatusBadge status={aud.status} />
                </td>
                <td className="px-5 py-4 text-zinc-500 text-[11px]">
                  {aud.started_at ? new Date(aud.started_at).toLocaleString() : '—'}
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => viewAuditDetails(aud)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-zinc-950 bg-zinc-100 rounded hover:bg-zinc-200 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>
                </td>
              </>
            )}
          />

          <AdminPagination
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={loadAudits}
          />
        </div>

        {/* Right-Side Contextual Insight Panel (1 Col Span) */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-100 pb-3">
              Crawl Performance
            </h3>

            <div className="space-y-3 text-xs font-semibold">
              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/60 space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">Completion Rate</span>
                <span className="text-xl font-black text-emerald-800">{completionRate}% Completed</span>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/60 space-y-1">
                <span className="text-[10px] font-bold uppercase text-blue-800 block">Active Running Jobs</span>
                <span className="text-xl font-black text-blue-800">{runningCount} Running</span>
              </div>

              <div className="p-3 bg-red-50/50 rounded-lg border border-red-200/60 space-y-1">
                <span className="text-[10px] font-bold uppercase text-red-800 block">Failed Task Errors</span>
                <span className="text-xl font-black text-red-800">{failedCount} Failed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Detail Drawer */}
      <AdminDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`Audit Inspection #${selectedAudit?.id}`}
      >
        {selectedAudit && (
          <div className="space-y-5 text-xs font-semibold text-zinc-900">
            <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">Overall Score</span>
              <div className="text-3xl font-black text-zinc-950">
                {selectedAudit.score !== null ? `${selectedAudit.score} / 100` : 'N/A'}
              </div>
            </div>

            <div className="space-y-2 border-t border-zinc-100 pt-4">
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Execution Status</span>
                <AdminStatusBadge status={selectedAudit.status} />
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Website ID</span>
                <span className="font-bold">Website #{selectedAudit.website_id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Started At</span>
                <span>{selectedAudit.started_at ? new Date(selectedAudit.started_at).toLocaleString() : '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Completed At</span>
                <span>{selectedAudit.completed_at ? new Date(selectedAudit.completed_at).toLocaleString() : 'In Progress'}</span>
              </div>
            </div>

            {selectedAudit.error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg space-y-1">
                <span className="text-[10px] font-bold uppercase text-red-700 block">Exception Details</span>
                <p className="text-red-900 font-mono text-[11px]">{selectedAudit.error}</p>
              </div>
            )}
          </div>
        )}
      </AdminDrawer>
    </motion.div>
  );
}
