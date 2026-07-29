import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, CheckCircle2, ShieldCheck } from 'lucide-react';
import adminApi from '../services/adminApi';
import AdminHeader from '../components/ui/AdminHeader';
import AdminTable from '../components/ui/AdminTable';
import AdminPagination from '../components/ui/AdminPagination';
import AdminStatusBadge from '../components/ui/AdminStatusBadge';
import AdminErrorState from '../components/ui/AdminErrorState';

export default function AdminWebsitesView() {
  const [websites, setWebsites] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const loadWebsites = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page };
      if (searchQuery) params.search = searchQuery;
      if (verifiedFilter !== 'ALL') params.is_verified = verifiedFilter === 'VERIFIED' ? 'true' : 'false';

      const res = await adminApi.getWebsites(params);
      setWebsites(res.data || []);
      setPagination(res.pagination || null);
      setCurrentPage(page);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch website registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebsites(1);
  }, [searchQuery, verifiedFilter]);

  const verifiedCount = websites.filter((w) => w.is_verified).length;
  const verificationPercent = websites.length > 0 ? Math.round((verifiedCount / websites.length) * 100) : 0;
  const totalAuditsTriggered = websites.reduce((acc, w) => acc + (w.total_audits || 0), 0);

  const columns = [
    { header: 'Domain Name' },
    { header: 'Owner Email' },
    { header: 'Total Audits' },
    { header: 'Verification Status' },
    { header: 'Created Date' },
  ];

  if (error) {
    return <AdminErrorState message={error} onRetry={() => loadWebsites(currentPage)} />;
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
        title="Websites"
        lastUpdated={lastRefreshed}
        onRefresh={() => loadWebsites(currentPage)}
        loading={loading}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search..."
      />

      {/* Main Content Layout with Contextual Insight Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Websites Table (3 Col Span) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-900 focus:outline-none focus:border-zinc-950 cursor-pointer"
              >
                <option value="ALL">All Verification Statuses</option>
                <option value="VERIFIED">Verified Only</option>
                <option value="UNVERIFIED">Unverified Only</option>
              </select>
            </div>
            <span className="text-xs text-zinc-500 font-semibold">{websites.length} Domains Loaded</span>
          </div>

          <AdminTable
            columns={columns}
            data={websites}
            isLoading={loading}
            emptyTitle={searchQuery ? `No websites match "${searchQuery}"` : 'No registered websites found'}
            emptyDescription={searchQuery ? 'Try adjusting your search query or verification filter.' : 'There are no websites registered in the platform directory.'}
            renderRow={(site) => (
              <>
                <td className="px-5 py-4 font-bold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-zinc-700 shrink-0" />
                  <a
                    href={site.domain?.startsWith('http') ? site.domain : `https://${site.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-zinc-950"
                    title={`Open ${site.domain} in new tab`}
                  >
                    {site.domain}
                  </a>
                </td>
                <td className="px-5 py-4 text-zinc-500 font-mono text-xs" title={site.owner_email || ''}>
                  {site.owner_email || site.owner_id || 'Unassigned'}
                </td>
                <td className="px-5 py-4 font-bold text-zinc-950">
                  {site.total_audits ?? 0} Audits
                </td>
                <td className="px-5 py-4">
                  <AdminStatusBadge
                    status={site.is_verified ? 'VERIFIED' : 'UNVERIFIED'}
                    label={site.is_verified ? 'VERIFIED' : 'PENDING'}
                  />
                </td>
                <td className="px-5 py-4 text-zinc-500 text-[11px]">
                  {site.created_at ? new Date(site.created_at).toLocaleDateString() : '—'}
                </td>
              </>
            )}
          />

          <AdminPagination
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={loadWebsites}
          />
        </div>

        {/* Right-Side Insight Panel (1 Col Span) */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-100 pb-3">
              Domain Telemetry
            </h3>

            <div className="space-y-3 text-xs font-semibold">
              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/60 space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">Verification Rate</span>
                <span className="text-xl font-black text-emerald-800">{verificationPercent}% Verified</span>
              </div>

              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-zinc-500 block">Total Audits Executed</span>
                <span className="text-xl font-black text-zinc-950">{totalAuditsTriggered} Audits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
