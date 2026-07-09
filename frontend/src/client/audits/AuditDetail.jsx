import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getAuditDetail, getAuditPages, getAuditIssues, getAuditStatus } from '../../services/audits';
import { getAIRecommendation, generateAIRecommendation } from '../../services/aiRecommendations';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Sparkles,
  Server,
  Zap,
  Layers,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getAuditProcessStatus } from '../../services/processStatus';
import AuditRunningState from './components/AuditRunningState';
import AIConsultingInsights from './components/AIConsultingInsights';

export default function AuditDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [audit, setAudit] = useState(null);
  const [processStatus, setProcessStatus] = useState(null);
  const [pages, setPages] = useState([]);
  const [issues, setIssues] = useState([]);
  const [recommendation, setRecommendation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [issueFilter, setIssueFilter] = useState('all');
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const pollIntervalRef = useRef(null);

  const renderActionItems = (text) => {
    if (!text) return null;
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        if (line.length === 0) return false;
        if (line.endsWith(':')) return false;
        if (/follow these steps|do the following|here is the|here are the|to address these|below are/i.test(line)) return false;
        return true;
      });

    return (
      <ul className="space-y-2.5 mt-2">
        {lines.map((line, index) => {
          const cleanLine = line.replace(/^[0-9]+[\.\u3002]\s*|^[-\*\u2022]\s*/, '');
          return (
            <li key={index} className="flex items-start gap-2.5 text-xs text-muted-text leading-relaxed font-semibold">
              <span className="w-5 h-5 rounded-lg bg-deep-green/5 border border-deep-green/10 text-deep-green text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5 animate-fade-in">
                {index + 1}
              </span>
              <span className="flex-grow">{cleanLine}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  const loadAllData = async () => {
    try {
      const detailRes = await getAuditDetail(id);
      if (detailRes.success && detailRes.data) {
        setAudit(detailRes.data);
        if (detailRes.data.status === 'DONE') {
          const [pagesRes, issuesRes, recRes] = await Promise.all([
            getAuditPages(id),
            getAuditIssues(id),
            getAIRecommendation(id)
          ]);

          if (pagesRes.success) setPages(pagesRes.data || []);
          if (issuesRes.success) setIssues(issuesRes.data || []);
          if (recRes.success) setRecommendation(recRes.data);
        } else if (detailRes.data.status === 'PENDING' || detailRes.data.status === 'RUNNING') {
          const procRes = await getAuditProcessStatus(id);
          if (procRes.success && procRes.data) {
            setProcessStatus(procRes.data);
          }
        }
      } else {
        setError(detailRes.message || 'Failed to load audit details.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (audit && (audit.status === 'PENDING' || audit.status === 'RUNNING')) {
      if (!pollIntervalRef.current) {
        pollIntervalRef.current = setInterval(async () => {
          const procRes = await getAuditProcessStatus(id);
          if (procRes.success && procRes.data) {
            setProcessStatus(procRes.data);
            const currentStatus = procRes.data.status;
            if (currentStatus === 'DONE' || currentStatus === 'FAILED') {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
              loadAllData();
            } else if (currentStatus !== audit.status) {
              setAudit(prev => prev ? { ...prev, status: currentStatus } : null);
            }
          }
        }, 4000);
      }
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [audit]);

  useEffect(() => {
    let timer = null;
    if (audit && (audit.status === 'PENDING' || audit.status === 'RUNNING')) {
      const calculateElapsed = () => {
        const startedTime = new Date(audit.started_at).getTime();
        const currentTime = new Date().getTime();
        return Math.max(0, Math.floor((currentTime - startedTime) / 1000));
      };

      setSecondsElapsed(calculateElapsed());

      timer = setInterval(() => {
        setSecondsElapsed(calculateElapsed());
      }, 1000);
    } else {
      setSecondsElapsed(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [audit]);

  const handleGenerateAI = async (regenerate = false) => {
    setGeneratingAI(true);
    const res = await generateAIRecommendation(id, regenerate);
    if (res.success && res.data) {
      setRecommendation(res.data);
      addToast(
        regenerate ? 'Structured AI recommendations updated.' : 'Structured AI recommendations generated.',
        'success'
      );
    } else {
      addToast(res.message || 'Failed to compile AI recommendations.', 'error');
    }
    setGeneratingAI(false);
  };

  if (loading) {
    return (
      <DashboardLayout title="Audit Report">
        <div className="bg-white rounded-3xl p-16 border border-border-color/60 text-center flex flex-col items-center justify-center min-h-[400px] shadow-sm">
          <Loader2 className="w-10 h-10 text-deep-green animate-spin" />
          <p className="text-xs text-muted-text mt-4 font-bold">Loading audit report data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !audit) {
    return (
      <DashboardLayout title="Audit Report">
        <div className="bg-white rounded-3xl p-16 border border-border-color/60 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-deep-green">Audit report not found</h3>
          <p className="text-xs text-muted-text font-semibold">{error || 'Unable to retrieve the requested audit details.'}</p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/audits')}
              className="bg-deep-green hover:bg-forest-green text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer"
            >
              Back to Audit History
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const averageOnPage = pages.length > 0 ? Math.round(pages.reduce((acc, p) => acc + (p.on_page_score || 0), 0) / pages.length) : 0;
  const averagePerformance = pages.length > 0 ? Math.round(pages.reduce((acc, p) => acc + (p.performance_score || 0), 0) / pages.length) : 0;

  const filteredIssues = issues.filter(issue => {
    if (issueFilter === 'error') return issue.severity === 'ERROR';
    if (issueFilter === 'warning') return issue.severity === 'WARNING';
    return true;
  });

  return (
    <DashboardLayout title="Report">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-color/30 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate('/audits')}
                className="text-muted-text hover:text-deep-green p-1 transition-colors"
                aria-label="Back to audits"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-lg font-black text-deep-green tracking-tight">{audit.website_domain}</h2>
              {audit.status === 'DONE' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E5F3EC] text-forest-green border border-forest-green/20">
                  <CheckCircle2 className="w-3 h-3" /> Completed
                </span>
              )}
              {audit.status === 'RUNNING' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <Loader2 className="w-3 h-3 animate-spin" /> Running
                </span>
              )}
              {audit.status === 'PENDING' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <Loader2 className="w-3 h-3 animate-pulse" /> Queued
                </span>
              )}
              {audit.status === 'FAILED' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                  <AlertCircle className="w-3 h-3" /> Failed
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-[11px] text-muted-text font-semibold pl-7">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Created: {new Date(audit.started_at).toLocaleString()}</span>
              <span>•</span>
              <span className="text-forest-green font-bold">5 credits used for this audit</span>
            </div>
          </div>
        </div>

        {(audit.status === 'PENDING' || audit.status === 'RUNNING') && (
          <AuditRunningState
            audit={audit}
            secondsElapsed={secondsElapsed}
            processStatus={processStatus}
          />
        )}

        {audit.status === 'FAILED' && (
          <div className="bg-white rounded-3xl p-10 border border-border-color/60 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-red-600 border border-red-200 shadow-inner">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-deep-green">Audit Analysis Failed</h3>
              <p className="text-xs text-muted-text max-w-xs mx-auto font-semibold">
                The crawler was unable to crawl your website domain. Please check if the domain is active, responsive, and allows crawler connections.
              </p>
            </div>
          </div>
        )}

        {audit.status === 'DONE' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-border-color/60 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-muted-text tracking-wider">Overall Score</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-deep-green">{audit.overall_score || 0}</span>
                  <span className="text-xs text-muted-text font-bold">/100</span>
                </div>
                <div className="w-full bg-mint-surface h-1 rounded-full overflow-hidden mt-3">
                  <div className="bg-growth-green h-full rounded-full" style={{ width: `${audit.overall_score || 0}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-border-color/60 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-muted-text tracking-wider">Avg On-Page Score</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-deep-green">{averageOnPage}</span>
                  <span className="text-xs text-muted-text font-bold">/100</span>
                </div>
                <div className="w-full bg-mint-surface h-1 rounded-full overflow-hidden mt-3">
                  <div className="bg-[#36E682] h-full rounded-full" style={{ width: `${averageOnPage}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-border-color/60 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-muted-text tracking-wider">Avg Speed Score</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-deep-green">{averagePerformance}</span>
                  <span className="text-xs text-muted-text font-bold">/100</span>
                </div>
                <div className="w-full bg-mint-surface h-1 rounded-full overflow-hidden mt-3">
                  <div className="bg-[#FFB020] h-full rounded-full" style={{ width: `${averagePerformance}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-border-color/60 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-muted-text tracking-wider">Crawled Pages</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-deep-green">{pages.length}</span>
                  <span className="text-xs text-muted-text font-bold">URLs</span>
                </div>
                <div className="text-[10px] text-muted-text font-semibold mt-3">Crawling BFS queue limit of 5</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-border-color/60 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-muted-text tracking-wider">Issues Identified</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-red-600">{issues.length}</span>
                  <span className="text-xs text-muted-text font-bold">alerts</span>
                </div>
                <div className="text-[10px] text-muted-text font-semibold mt-3">
                  {issues.filter(i => i.severity === 'ERROR').length} Errors • {issues.filter(i => i.severity === 'WARNING').length} Warnings
                </div>
              </div>
            </div>

            <AIConsultingInsights
              recommendation={recommendation}
              generatingAI={generatingAI}
              handleGenerateAI={handleGenerateAI}
            />

            <div className="bg-white rounded-3xl border border-border-color/60 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-border-color/30 bg-mint-surface/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-deep-green uppercase tracking-wider">Scanned SEO Issues ({filteredIssues.length})</h3>
                  <p className="text-[10px] text-muted-text font-semibold">Specific warnings and errors compiled from HTML headers, links, and speed scores.</p>
                </div>
                <div className="flex gap-1.5 bg-mint-surface p-1 rounded-xl border border-border-color/40">
                  <button
                    onClick={() => setIssueFilter('all')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${issueFilter === 'all' ? 'bg-white text-deep-green shadow-sm' : 'text-muted-text hover:text-deep-green'
                      }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setIssueFilter('error')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${issueFilter === 'error' ? 'bg-white text-red-600 shadow-sm' : 'text-muted-text hover:text-red-600'
                      }`}
                  >
                    Errors
                  </button>
                  <button
                    onClick={() => setIssueFilter('warning')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${issueFilter === 'warning' ? 'bg-white text-amber-600 shadow-sm' : 'text-muted-text hover:text-amber-600'
                      }`}
                  >
                    Warnings
                  </button>
                </div>
              </div>

              {filteredIssues.length === 0 ? (
                <div className="p-10 text-center text-xs text-muted-text font-semibold">
                  No issues match the selected filter query.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border-color/40 text-[10px] font-black uppercase text-muted-text bg-mint-surface/10">
                        <th className="p-4 pl-6">Severity</th>
                        <th className="p-4">SEO Category</th>
                        <th className="p-4">Issue Description</th>
                        <th className="p-4 pr-6 text-right">Target URL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color/30">
                      {filteredIssues.map((issue) => (
                        <tr key={issue.id} className="hover:bg-mint-surface/5 transition-colors">
                          <td className="p-4 pl-6">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${issue.severity === 'ERROR'
                              ? 'bg-red-50 text-red-700 border border-red-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}>
                              {issue.severity === 'ERROR' ? 'Error' : 'Warning'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-bold text-deep-green uppercase tracking-wider">{issue.category}</span>
                          </td>
                          <td className="p-4">
                            <p className="text-xs text-muted-text leading-relaxed font-semibold">{issue.message}</p>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            {issue.page_url ? (
                              <a
                                href={issue.page_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-forest-green hover:underline cursor-pointer"
                              >
                                View Page <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-xs text-muted-text/50">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-border-color/60 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-border-color/30 bg-mint-surface/30">
                <h3 className="text-sm font-black text-deep-green uppercase tracking-wider">Crawled Website Pages ({pages.length})</h3>
                <p className="text-[10px] text-muted-text font-semibold">Indexed page metrics including responsiveness, performance load speeds, and title tags.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-color/40 text-[10px] font-black uppercase text-muted-text bg-mint-surface/10">
                      <th className="p-4 pl-6">Crawl URL</th>
                      <th className="p-4">On-Page SEO</th>
                      <th className="p-4">Vitals Speed</th>
                      <th className="p-4">Load Time</th>
                      <th className="p-4 pr-6 text-right">Title Tag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color/30">
                    {pages.map((page) => (
                      <tr key={page.id} className="hover:bg-mint-surface/5 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-deep-green truncate max-w-[200px]">{page.url}</span>
                            <span className="text-[10px] text-muted-text font-semibold">HTTP {page.status_code}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-deep-green">{page.on_page_score || 0}/100</span>
                            <div className="w-16 bg-mint-surface h-1 rounded-full overflow-hidden">
                              <div className="bg-[#36E682] h-full" style={{ width: `${page.on_page_score || 0}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-deep-green">{page.performance_score || 0}/100</span>
                            <div className="w-16 bg-mint-surface h-1 rounded-full overflow-hidden">
                              <div className="bg-[#FFB020] h-full" style={{ width: `${page.performance_score || 0}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-bold text-muted-text">{page.load_time ? `${page.load_time.toFixed(2)}s` : '-'}</span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <span className="text-xs font-semibold text-muted-text block truncate max-w-[220px]" title={page.title}>
                            {page.title || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
