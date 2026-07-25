import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  getWebsite,
  verifyWebsite,
  updateWebsite,
  deleteWebsite,
  getVerificationStatus
} from '../../services/websites';
import { startAudit } from '../../services/audits';
import {
  Globe,
  Copy,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Trash2,
  Edit2,
  ExternalLink,
  ShieldAlert,
  Calendar,
  Key,
  ShieldCheck,
  Search,
  ArrowRight
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ModalMotion from '../../components/motion/ModalMotion';

export default function WebsiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { refreshCredits } = useAuth();

  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);
  const [showAuditConfirmModal, setShowAuditConfirmModal] = useState(false);

  const handleStartAudit = async () => {
    setShowAuditConfirmModal(false);
    setAuditLoading(true);
    const res = await startAudit({
      website_id: id,
      key_word: keyword.trim() || null
    });
    if (res.success && res.data) {
      addToast('SEO Audit started successfully.', 'success');
      await refreshCredits();
      navigate(`/audits/${res.data.audit_id}`);
    } else {
      addToast(res.message || 'Failed to start SEO audit.', 'error');
    }
    setAuditLoading(false);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDomain, setEditDomain] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedMeta, setCopiedMeta] = useState(false);

  const fetchDetailsAndStatus = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getWebsite(id);
      if (res?.success && res?.data) {
        setWebsite(res.data);
        setEditDomain(res.data.domain);

        try {
          const statusRes = await getVerificationStatus(id);
          if (statusRes) {
            setWebsite((prev) => ({
              ...prev,
              is_verified: statusRes.is_verified
            }));
          }
        } catch (_) {}
      } else {
        setError(res?.message || 'Failed to load website details.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching website details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetailsAndStatus();
  }, [id]);

  const handleCopy = (text, setCopied) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast('Copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerificationError('');
    try {
      const res = await verifyWebsite(id);
      if (res?.verified) {
        setWebsite((prev) => ({ ...prev, is_verified: true }));
        addToast('Website ownership verified successfully.', 'success');

        const failures = JSON.parse(localStorage.getItem('athenura_verification_failures') || '{}');
        delete failures[id];
        localStorage.setItem('athenura_verification_failures', JSON.stringify(failures));
      } else {
        setVerificationError('Token was not found in the website HTML. Add the token and try again.');
        addToast('Verification failed. Token not found.', 'error');

        const failures = JSON.parse(localStorage.getItem('athenura_verification_failures') || '{}');
        failures[id] = true;
        localStorage.setItem('athenura_verification_failures', JSON.stringify(failures));
      }
    } catch (err) {
      const msg = err.response?.data?.reason || 'Token was not found in the website HTML. Add the token and try again.';
      setVerificationError(msg);
      addToast('Verification failed.', 'error');

      const failures = JSON.parse(localStorage.getItem('athenura_verification_failures') || '{}');
      failures[id] = true;
      localStorage.setItem('athenura_verification_failures', JSON.stringify(failures));
    } finally {
      setVerifying(false);
    }
  };

  const handleEdit = async (e) => {
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
      const res = await updateWebsite(id, editDomain.trim());
      if (res?.success && res?.data) {
        setWebsite(res.data);
        setShowEditModal(false);
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

  const handleDelete = async () => {
    try {
      await deleteWebsite(id);
      addToast('Website deleted successfully.', 'success');

      const failures = JSON.parse(localStorage.getItem('athenura_verification_failures') || '{}');
      delete failures[id];
      localStorage.setItem('athenura_verification_failures', JSON.stringify(failures));

      navigate('/websites');
    } catch (err) {
      addToast('Failed to delete website.', 'error');
    }
  };

  const hasFailedBefore = () => {
    const failures = JSON.parse(localStorage.getItem('athenura_verification_failures') || '{}');
    return !!failures[id];
  };

  if (loading) {
    return (
      <DashboardLayout title="Website Details" backLink="/websites">
        <div className="max-w-4xl w-full mx-auto py-12 flex flex-col justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0B5A4A]" />
          <p className="text-xs text-muted-text mt-3 font-semibold">Loading website details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !website) {
    return (
      <DashboardLayout title="Website Details" backLink="/websites">
        <div className="max-w-lg w-full mx-auto py-12 flex flex-col justify-center items-center text-center">
          <div className="w-12 h-12 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-center text-red-500 mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-deep-green">Failed to load website details</h3>
          <p className="text-xs text-muted-text mt-2 max-w-sm font-semibold">{error || 'The website details could not be retrieved.'}</p>
          <button
            onClick={fetchDetailsAndStatus}
            className="mt-6 bg-deep-green text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-[#36E682] hover:text-[#053D34] transition-all"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const metaTagSnippet = `<meta name="athenura-verification" content="${website.verification_token}" />`;

  return (
    <DashboardLayout title="Website Details" backLink="/websites">
      <div className="max-w-4xl mx-auto space-y-6 text-left">
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-border-color/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#36E682]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-4 relative z-10 flex-grow">
            <div className="flex flex-wrap items-center gap-3">
              <div className="p-3 bg-[#E5F3EC] rounded-2xl text-deep-green border border-border-color/40">
                <Globe className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl md:text-2xl font-black text-deep-green tracking-tight flex items-center gap-2 truncate">
                  {website.domain}
                  <a
                    href={website.domain}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-text hover:text-[#36E682] transition-colors flex-shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </h2>
                <p className="text-[9px] text-muted-text font-mono mt-0.5">
                  ID: {website.id}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs font-semibold text-muted-text pt-4 border-t border-border-color/30">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#0B5A4A]" />
                <span>
                  Created On:{' '}
                  <span className="text-deep-green font-black">
                    {website.created_at
                      ? new Date(website.created_at).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0B5A4A]" />
                <span>
                  Status:{' '}
                  {website.is_verified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#36E682]/10 border border-[#36E682]/30 text-[#053D34]">
                      Verified
                    </span>
                  ) : hasFailedBefore() || verificationError ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-700">
                      Verification Failed
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-700">
                      Pending Verification
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Key className="w-3.5 h-3.5 text-[#0B5A4A] flex-shrink-0" />
                <span className="truncate">
                  Token:{' '}
                  <span className="font-mono text-deep-green font-bold text-[10px]">
                    {website.verification_token}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#0B5A4A]" />
                <span>
                  Updated On:{' '}
                  <span className="text-deep-green font-black">N/A</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto relative z-10 flex-shrink-0">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 bg-[#E5F3EC] hover:bg-deep-green/10 border border-deep-green/10 text-deep-green px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Website
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-600 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Website
            </button>
          </div>
        </div>

        {/* Start SEO Audit Panel (Always visible to allow audits) */}
        <div className="bg-gradient-to-br from-[#0A4B43] to-[#053D34] rounded-3xl p-6 md:p-8 border border-border-color/20 text-white relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#36E682]/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#36E682]/20 border border-[#36E682]/40 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#36E682]" />
              </div>
              <div>
                <h3 className="text-lg font-black">Start SEO Audit</h3>
                <p className="text-xs text-[#E5F3EC]/85 leading-relaxed font-semibold">
                  Analyze technical SEO parameters, speed performance, and mobile compatibility.
                </p>
              </div>
            </div>

            <div className="max-w-md space-y-4 pt-2">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-[#E5F3EC] uppercase tracking-widest pl-1">
                  Target Keyword (Optional)
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B5A4A]" />
                  <input
                    type="text"
                    placeholder="e.g. SEO Auditor"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full bg-white/15 border border-white/20 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold text-white placeholder-white/50 focus:outline-none focus:border-[#36E682] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-[#E5F3EC]/70 font-bold uppercase tracking-wider pl-1">
                  This audit costs 5 credits.
                </p>
                <button
                  onClick={() => setShowAuditConfirmModal(true)}
                  disabled={auditLoading}
                  className="w-full sm:w-auto bg-[#36E682] hover:bg-white text-[#053D34] px-6 py-3.5 rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  {auditLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Queuing Audit...
                    </>
                  ) : (
                    <>
                      Start SEO Audit <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Ownership Verification Panel (Only shown if NOT verified) */}
        {!website.is_verified && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-border-color/60 shadow-sm space-y-6">
            <div className="border-b border-border-color/50 pb-4">
              <h3 className="text-base font-black text-deep-green">Ownership Verification Panel</h3>
              <p className="text-xs text-muted-text mt-1 font-semibold">
                Please follow these 3 steps to verify your ownership of this website.
              </p>
            </div>

            {(verificationError || hasFailedBefore()) && (
              <div className="bg-red-500/5 border border-red-500/15 text-red-700 p-4 rounded-2xl text-xs font-semibold leading-relaxed flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5 text-red-800">Verification Failed</span>
                  {verificationError || 'Token was not found in the website HTML. Add the token and try again.'}
                </div>
              </div>
            )}

            <div className="grid gap-6">
              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-deep-green/5 border border-deep-green/10 text-deep-green font-black text-xs flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div className="flex-grow space-y-3">
                  <p className="text-xs font-bold text-deep-green">Copy verification token</p>
                  <div className="flex gap-2 bg-[#E5F3EC]/30 p-2 rounded-2xl border border-border-color/40">
                    <input
                      type="text"
                      readOnly
                      value={website.verification_token}
                      className="flex-grow text-xs font-mono py-2 bg-transparent text-deep-green border-none focus:outline-none pl-2 select-all overflow-ellipsis font-bold"
                    />
                    <button
                      onClick={() => handleCopy(website.verification_token, setCopiedToken)}
                      className="bg-deep-green hover:bg-[#36E682] text-white hover:text-[#053D34] px-4 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 shadow-sm"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedToken ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-deep-green/5 border border-deep-green/10 text-deep-green font-black text-xs flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div className="flex-grow space-y-3">
                  <p className="text-xs font-bold text-deep-green">Add it to website HTML/meta tag</p>
                  <p className="text-[11px] text-muted-text leading-relaxed font-semibold">
                    Insert the following meta tag inside the <code className="bg-soft-bg px-1.5 py-0.5 rounded text-deep-green font-mono font-bold">&lt;head&gt;</code> section of your homepage HTML:
                  </p>
                  <div className="flex gap-2 bg-[#E5F3EC]/30 p-2 rounded-2xl border border-border-color/40">
                    <input
                      type="text"
                      readOnly
                      value={metaTagSnippet}
                      className="flex-grow text-xs font-mono py-2 bg-transparent text-deep-green border-none focus:outline-none pl-2 select-all overflow-ellipsis font-bold"
                    />
                    <button
                      onClick={() => handleCopy(metaTagSnippet, setCopiedMeta)}
                      className="bg-deep-green hover:bg-[#36E682] text-white hover:text-[#053D34] px-4 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 shadow-sm"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedMeta ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-deep-green/5 border border-deep-green/10 text-deep-green font-black text-xs flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div className="flex-grow space-y-3">
                  <p className="text-xs font-bold text-deep-green">Click Verify Ownership</p>
                  <p className="text-[11px] text-muted-text leading-relaxed font-semibold">
                    Once the meta tag has been uploaded, trigger our verification system to crawl the homepage URL.
                  </p>
                  <div>
                    <button
                      onClick={handleVerify}
                      disabled={verifying}
                      className="bg-deep-green hover:bg-[#36E682] text-white hover:text-[#053D34] px-6 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md uppercase tracking-wider"
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                        </>
                      ) : (
                        'Verify Ownership'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Website Modal */}
      <ModalMotion isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="max-w-md">
        <div className="bg-white rounded-3xl border border-border-color p-6 shadow-2xl space-y-5 text-left">
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
            Are you sure you want to delete <strong className="text-deep-green">{website?.domain}</strong>? All configurations and ownership mappings will be permanently removed.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDelete}
              className="flex-grow bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm"
            >
              Yes, Delete Website
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-grow bg-deep-green/5 hover:bg-deep-green/10 text-deep-green border border-deep-green/10 py-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      </ModalMotion>

      {/* Edit Website Modal */}
      <ModalMotion isOpen={showEditModal} onClose={() => setShowEditModal(false)} className="max-w-md">
        <div className="bg-white rounded-3xl border border-border-color p-6 shadow-2xl space-y-5 text-left">
          <div>
            <h3 className="font-black text-deep-green text-base">Edit Website Details</h3>
            <p className="text-xs text-muted-text mt-0.5 font-semibold">Update the domain name configuration.</p>
          </div>

          {editError && (
            <div className="bg-red-500/5 border border-red-500/15 text-red-700 p-3.5 rounded-xl text-xs font-bold text-center">
              {editError}
            </div>
          )}

          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-deep-green uppercase tracking-widest pl-1">
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
                    <Loader2 className="w-4 h-4 animate-spin animate-fade-in" /> Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-grow bg-deep-green/5 hover:bg-deep-green/10 text-deep-green border border-deep-green/10 py-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </ModalMotion>

      {/* Confirm Audit Modal */}
      <ModalMotion isOpen={showAuditConfirmModal} onClose={() => setShowAuditConfirmModal(false)} className="max-w-md">
        <div className="bg-white rounded-3xl border border-border-color p-6 shadow-2xl space-y-5 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-mint-surface border border-border-color/40 text-deep-green flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-deep-green text-base">Confirm SEO Audit</h3>
              <p className="text-xs text-muted-text mt-0.5 font-semibold">Credit Deduction Notice</p>
            </div>
          </div>

          <p className="text-xs text-muted-text leading-relaxed font-semibold">
            Start SEO Audit for <strong className="text-deep-green">{website?.domain}</strong>? This audit costs 5 credits.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleStartAudit}
              className="flex-grow bg-deep-green hover:bg-[#36E682] text-white hover:text-[#053D34] py-3 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm uppercase tracking-wider"
            >
              Confirm & Start
            </button>
            <button
              onClick={() => setShowAuditConfirmModal(false)}
              className="flex-grow bg-deep-green/5 hover:bg-deep-green/10 text-deep-green border border-deep-green/10 py-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      </ModalMotion>
    </DashboardLayout>
  );
}
