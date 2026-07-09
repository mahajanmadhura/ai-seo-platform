import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { getAllWebsites, updateWebsite, deleteWebsite } from '../../services/websites';
import {
  Globe,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Trash2,
  Edit2,
  Eye,
  ArrowRight,
  ExternalLink,
  Key
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

export default function WebsiteList() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editDomain, setEditDomain] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAllWebsites();
      if (res?.success && res?.data) {
        setWebsites(res.data);
      } else {
        setError(res?.message || 'Failed to fetch websites.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading websites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const getFailures = () => {
    try {
      return JSON.parse(localStorage.getItem('athenura_verification_failures') || '{}');
    } catch {
      return {};
    }
  };

  const getWebsiteStatus = (item) => {
    if (item.is_verified) return 'Verified';
    const failures = getFailures();
    if (failures[item.id]) return 'Failed';
    return 'Pending';
  };

  const filteredWebsites = websites.filter((item) => {
    const status = getWebsiteStatus(item);
    const matchesSearch = item.domain.toLowerCase().includes(search.toLowerCase());

    if (activeFilter === 'All') return matchesSearch;
    return matchesSearch && status === activeFilter;
  });

  const handleDeleteTrigger = (item, e) => {
    e.stopPropagation();
    setSelectedWebsite(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedWebsite) return;
    try {
      await deleteWebsite(selectedWebsite.id);
      addToast('Website deleted successfully.', 'success');

      const failures = getFailures();
      delete failures[selectedWebsite.id];
      localStorage.setItem('athenura_verification_failures', JSON.stringify(failures));

      setWebsites((prev) => prev.filter((w) => w.id !== selectedWebsite.id));
      setShowDeleteModal(false);
      setSelectedWebsite(null);
    } catch (err) {
      addToast('Failed to delete website.', 'error');
    }
  };

  const handleEditTrigger = (item, e) => {
    e.stopPropagation();
    setSelectedWebsite(item);
    setEditDomain(item.domain);
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');

    try {
      const parsed = new URL(editDomain);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        setEditError('URL must use http:// or https://');
        return;
      }
    } catch (_) {
      setEditError('Please enter a valid URL (e.g. https://example.com).');
      return;
    }

    setEditLoading(true);
    try {
      const res = await updateWebsite(selectedWebsite.id, editDomain.trim());
      if (res?.success && res?.data) {
        setWebsites((prev) =>
          prev.map((w) => (w.id === selectedWebsite.id ? res.data : w))
        );
        setShowEditModal(false);
        setSelectedWebsite(null);
        addToast('Website updated successfully.', 'success');
      } else {
        setEditError(res?.message || 'Failed to update website.');
      }
    } catch (err) {
      setEditError(err.response?.data?.domain?.[0] || err.response?.data?.message || 'Error updating website.');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Websites"
      cta={{ text: 'Add Website', link: '?add=true', icon: Plus }}
    >
      <div className="space-y-6 text-left">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-deep-green tracking-tight font-sans">Websites</h2>
          <p className="text-xs text-muted-text mt-1 font-semibold leading-relaxed max-w-2xl">
            Manage registered domains and verify ownership before running audits.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white p-4 rounded-2xl border border-border-color/60 shadow-sm">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
            <input
              type="text"
              placeholder="Search websites by domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-soft-bg border border-border-color rounded-xl pl-9 pr-4 py-2 text-xs text-deep-green focus:outline-none focus:border-[#36E682] transition-all placeholder:text-muted-text/50 font-medium"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Verified', 'Pending', 'Failed'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-deep-green text-white shadow-sm'
                    : 'bg-soft-bg border border-border-color/20 text-muted-text hover:text-deep-green hover:bg-mint-surface'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 border border-border-color/50 shadow-sm animate-pulse flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-soft-bg rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-soft-bg rounded w-48"></div>
                    <div className="h-2.5 bg-soft-bg rounded w-32"></div>
                  </div>
                </div>
                <div className="h-6 bg-soft-bg rounded w-24"></div>
                <div className="h-8 bg-soft-bg rounded w-32"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-10 border border-border-color/60 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-center text-red-500 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-deep-green">Failed to load websites</h3>
            <p className="text-xs text-muted-text font-semibold">{error}</p>
            <button
              onClick={fetchWebsites}
              className="bg-deep-green text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#36E682] hover:text-[#053D34] transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : filteredWebsites.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-border-color/60 text-center max-w-lg mx-auto space-y-6 shadow-sm">
            <div className="w-16 h-16 bg-[#E5F3EC] border border-border-color/30 rounded-full flex items-center justify-center mx-auto text-deep-green">
              <Globe className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-deep-green">
                {search ? 'No search results found' : 'No websites added yet.'}
              </h3>
              <p className="text-xs text-muted-text max-w-xs mx-auto leading-relaxed font-semibold">
                {search
                  ? 'Adjust your query keywords or filter tabs and try again.'
                  : 'Add your domain URL now to verify ownership and initialize audit analysis.'}
              </p>
            </div>
            {!search && (
              <div>
                <Link
                  to="?add=true"
                  className="inline-flex items-center gap-1.5 bg-[#053D34] hover:bg-[#36E682] text-white hover:text-[#053D34] px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer"
                >
                  Add your first website <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredWebsites.map((item, idx) => {
              const status = getWebsiteStatus(item);
              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/websites/${item.id}`)}
                  className={`rounded-2xl p-5 border border-border-color/60 hover:border-deep-green/20 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-[#E5F3EC]/35'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0 md:w-2/5">
                    <div className="p-2.5 bg-[#E5F3EC] rounded-xl text-deep-green border border-border-color/20 flex-shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 text-left">
                      <h3 className="font-black text-deep-green text-sm truncate flex items-center gap-1.5">
                        {item.domain}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.domain, '_blank', 'noopener,noreferrer');
                          }}
                          className="text-muted-text hover:text-[#36E682] transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 cursor-pointer" />
                        </span>
                      </h3>
                      <div className="flex items-center gap-1.5 text-[9px] text-muted-text font-semibold mt-0.5">
                        <Key className="w-3 h-3 text-muted-text/75" />
                        <span>
                          Token: <span className="font-mono text-deep-green/80">Available</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-muted-text font-bold text-left md:w-1/5">
                    <span className="block text-[8px] uppercase tracking-wider text-muted-text/60 font-semibold mb-0.5">Registered On</span>
                    <span className="text-deep-green">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-left md:w-1/5">
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider text-muted-text/60 font-semibold mb-0.5">Verification</span>
                      {status === 'Verified' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-[#36E682]/10 border border-[#36E682]/30 text-[#053D34]">
                          Verified
                        </span>
                      ) : status === 'Failed' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-700">
                          Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-700">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 border-border-color/40 pt-3 md:pt-0 md:w-1/5 animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.is_verified ? (
                      <button
                        onClick={() => navigate(`/websites/${item.id}`)}
                        className="bg-deep-green hover:bg-[#36E682] text-white hover:text-[#053D34] px-3.5 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer shadow-sm uppercase tracking-wider"
                      >
                        Start SEO Audit
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/websites/${item.id}`)}
                        className="bg-deep-green/5 hover:bg-deep-green/10 text-deep-green px-3.5 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer border border-deep-green/20 uppercase tracking-wider"
                      >
                        Verify & Audit
                      </button>
                    )}

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleEditTrigger(item, e)}
                        className="p-2 text-muted-text hover:text-deep-green hover:bg-deep-green/5 rounded-lg transition-colors cursor-pointer"
                        title="Edit Website"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteTrigger(item, e)}
                        className="p-2 text-muted-text hover:text-red-600 hover:bg-red-50/50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Website"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#053D34]/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-border-color p-6 max-w-md w-full shadow-2xl space-y-5 text-left animate-slide-down">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-deep-green text-base">Delete Website</h3>
                <p className="text-xs text-muted-text mt-0.5 font-semibold">This action is irreversible.</p>
              </div>
            </div>

            <p className="text-xs text-muted-text leading-relaxed font-semibold">
              Are you sure you want to delete <strong className="text-deep-green">{selectedWebsite?.domain}</strong>? All configurations and ownership mappings will be permanently removed.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDeleteConfirm}
                className="flex-grow bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm"
              >
                Yes, Delete Website
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedWebsite(null);
                }}
                className="flex-grow bg-deep-green/5 hover:bg-deep-green/10 text-deep-green border border-deep-green/10 py-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#053D34]/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-border-color p-6 max-w-md w-full shadow-2xl space-y-5 text-left animate-slide-down">
            <div>
              <h3 className="font-black text-deep-green text-base">Edit Website Details</h3>
              <p className="text-xs text-muted-text mt-0.5 font-semibold">Update the domain name configuration.</p>
            </div>

            {editError && (
              <div className="bg-red-500/5 border border-red-500/15 text-red-700 p-3.5 rounded-xl text-xs font-bold text-center">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-green uppercase tracking-widest pl-1 font-sans">
                  Website URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                  <input
                    type="text"
                    required
                    value={editDomain}
                    onChange={(e) => setEditDomain(e.target.value)}
                    className="auth-input auth-input-icon text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-grow bg-deep-green hover:bg-[#36E682] text-white hover:text-[#053D34] py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {editLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedWebsite(null);
                  }}
                  className="flex-grow bg-deep-green/5 hover:bg-deep-green/10 text-deep-green border border-deep-green/10 py-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
