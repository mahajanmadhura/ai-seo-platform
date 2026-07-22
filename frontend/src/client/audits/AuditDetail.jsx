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
  const [activeTab, setActiveTab] = useState('overview');

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

  const averageOnPage = audit.average_on_page_score;
  const averagePerformance = audit.average_performance_score;

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
                  <span className="text-3xl font-black text-deep-green">
                    {audit.overall_score !== null && audit.overall_score !== undefined ? audit.overall_score : 'Not Available'}
                  </span>
                  <span className="text-xs text-muted-text font-bold">/100</span>
                </div>
                <div className="w-full bg-mint-surface h-1 rounded-full overflow-hidden mt-3">
                  <div className="bg-growth-green h-full rounded-full" style={{ width: `${audit.overall_score || 0}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-border-color/60 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-muted-text tracking-wider">Avg On-Page Score</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-deep-green">
                    {averageOnPage !== null && averageOnPage !== undefined ? averageOnPage : 'Not Available'}
                  </span>
                  <span className="text-xs text-muted-text font-bold">/100</span>
                </div>
                <div className="w-full bg-mint-surface h-1 rounded-full overflow-hidden mt-3">
                  <div className="bg-[#36E682] h-full rounded-full" style={{ width: `${averageOnPage || 0}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-border-color/60 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-muted-text tracking-wider">Avg Speed Score</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-deep-green">
                    {averagePerformance !== null && averagePerformance !== undefined ? averagePerformance : 'Not Available'}
                  </span>
                  <span className="text-xs text-muted-text font-bold">/100</span>
                </div>
                <div className="w-full bg-mint-surface h-1 rounded-full overflow-hidden mt-3">
                  <div className="bg-[#FFB020] h-full rounded-full" style={{ width: `${averagePerformance || 0}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-border-color/60 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-muted-text tracking-wider">Crawled Pages</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-deep-green">
                    {audit.crawled_pages_count !== null && audit.crawled_pages_count !== undefined ? audit.crawled_pages_count : 'Not Available'}
                  </span>
                  <span className="text-xs text-muted-text font-bold">URLs</span>
                </div>
                <div className="text-[10px] text-muted-text font-semibold mt-3">Crawling BFS queue limit of 5</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-border-color/60 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-muted-text tracking-wider">Issues Identified</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-red-600">
                    {audit.issues_count !== null && audit.issues_count !== undefined ? audit.issues_count : 'Not Available'}
                  </span>
                  <span className="text-xs text-muted-text font-bold">alerts</span>
                </div>
                <div className="text-[10px] text-muted-text font-semibold mt-3">
                  {audit.errors_count !== null && audit.errors_count !== undefined ? `${audit.errors_count} Errors` : '0 Errors'} • {audit.warnings_count !== null && audit.warnings_count !== undefined ? `${audit.warnings_count} Warnings` : '0 Warnings'}
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
              <div className="p-5 border-b border-border-color/30 bg-mint-surface/30 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-deep-green uppercase tracking-wider">Crawled Website Pages ({pages.length})</h3>
                  <p className="text-[10px] text-muted-text font-semibold">Indexed page metrics including responsiveness, performance load speeds, and title tags.</p>
                </div>
                <div className="flex flex-wrap gap-1 bg-mint-surface p-1 rounded-xl border border-border-color/40">
                  {['overview', 'vitals', 'technical', 'security', 'links'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                        activeTab === tab
                          ? 'bg-white text-deep-green shadow-sm'
                          : 'text-muted-text hover:text-deep-green'
                      }`}
                    >
                      {tab === 'vitals' ? 'Core Web Vitals' : tab === 'technical' ? 'Technical & Mobile' : tab}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === 'overview' && (
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
                              <span className="text-xs font-black text-deep-green">
                                {page.on_page_score !== null && page.on_page_score !== undefined ? `${page.on_page_score}/100` : 'N/A'}
                              </span>
                              <div className="w-16 bg-mint-surface h-1 rounded-full overflow-hidden">
                                <div className="bg-[#36E682] h-full" style={{ width: `${page.on_page_score || 0}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-deep-green">
                                {page.performance_score !== null && page.performance_score !== undefined ? `${page.performance_score}/100` : 'N/A'}
                              </span>
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
              )}

              {activeTab === 'vitals' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border-color/40 text-[10px] font-black uppercase text-muted-text bg-mint-surface/10">
                        <th className="p-4 pl-6">Crawl URL</th>
                        <th className="p-4">LCP (Paint)</th>
                        <th className="p-4">FCP (First Paint)</th>
                        <th className="p-4">CLS (Shift)</th>
                        <th className="p-4">TTFB (Response)</th>
                        <th className="p-4">FID (Delay)</th>
                        <th className="p-4 pr-6 text-right">CWV Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color/30">
                      {pages.map((page) => (
                        <tr key={page.id} className="hover:bg-mint-surface/5 transition-colors">
                          <td className="p-4 pl-6">
                            <span className="text-xs font-bold text-deep-green block truncate max-w-[200px]" title={page.url}>{page.url}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-muted-text">{page.largest_contentful_paint ? `${page.largest_contentful_paint.toFixed(2)}s` : '0.00s'}</span>
                              <span className={`text-[9px] font-bold ${page.largest_contentful_paint < 2.5 ? 'text-forest-green' : 'text-red-500'}`}>
                                {page.largest_contentful_paint < 2.5 ? 'Good (< 2.5s)' : 'Needs Improve'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-muted-text">{page.first_contentful_paint ? `${page.first_contentful_paint.toFixed(2)}s` : '0.00s'}</span>
                              <span className={`text-[9px] font-bold ${page.first_contentful_paint < 1.8 ? 'text-forest-green' : 'text-red-500'}`}>
                                {page.first_contentful_paint < 1.8 ? 'Good (< 1.8s)' : 'Needs Improve'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-muted-text">{page.cumulative_layout_shift ? page.cumulative_layout_shift.toFixed(3) : '0.000'}</span>
                              <span className={`text-[9px] font-bold ${page.cumulative_layout_shift < 0.1 ? 'text-forest-green' : 'text-red-500'}`}>
                                {page.cumulative_layout_shift < 0.1 ? 'Good (< 0.1)' : 'Needs Improve'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-bold text-muted-text">{page.time_to_first_byte ? `${page.time_to_first_byte.toFixed(0)}ms` : '0ms'}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-bold text-muted-text">{page.first_input_delay ? `${page.first_input_delay.toFixed(0)}ms` : '0ms'}</span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                              page.core_web_vitals_performance_score === null || page.core_web_vitals_performance_score === undefined ? 'bg-gray-50 text-gray-600 border border-gray-200' :
                              page.core_web_vitals_performance_score >= 90 ? 'bg-green-50 text-green-700 border border-green-200' :
                              page.core_web_vitals_performance_score >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {page.core_web_vitals_performance_score !== null && page.core_web_vitals_performance_score !== undefined ? `${page.core_web_vitals_performance_score}%` : 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'technical' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border-color/40 text-[10px] font-black uppercase text-muted-text bg-mint-surface/10">
                        <th className="p-4 pl-6">Crawl URL</th>
                        <th className="p-4">Technical Score</th>
                        <th className="p-4">Mobile Responsive</th>
                        <th className="p-4">Mobile Font</th>
                        <th className="p-4">Tap Targets</th>
                        <th className="p-4">Schema Data</th>
                        <th className="p-4">Hreflang Tags</th>
                        <th className="p-4 pr-6 text-right">Crawlable</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color/30">
                      {pages.map((page) => (
                        <tr key={page.id} className="hover:bg-mint-surface/5 transition-colors">
                          <td className="p-4 pl-6">
                            <span className="text-xs font-bold text-deep-green block truncate max-w-[200px]" title={page.url}>{page.url}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-black text-deep-green">
                              {page.technical_score !== null && page.technical_score !== undefined ? `${page.technical_score}/100` : 'N/A'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs font-bold ${page.has_mobile_viewport_configuration ? 'text-forest-green' : 'text-red-500'}`}>
                              {page.has_mobile_viewport_configuration ? '✅ Responsive' : '❌ Viewport Missing'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs font-bold ${page.mobile_font_readability ? 'text-forest-green' : 'text-red-500'}`}>
                              {page.mobile_font_readability ? '✅ Legible' : '❌ Too Small'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs font-bold ${page.mobile_tap_targets ? 'text-forest-green' : 'text-red-500'}`}>
                              {page.mobile_tap_targets ? '✅ Optimized' : '❌ Too Close'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs font-bold ${page.is_schema_json ? 'text-forest-green' : 'text-muted-text/40'}`}>
                              {page.is_schema_json ? '✅ Valid Schema' : '❌ Missing'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs font-bold ${page.is_hreflang ? 'text-forest-green' : 'text-muted-text/40'}`}>
                              {page.is_hreflang ? '✅ Configured' : 'None'}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <span className={`text-xs font-bold ${page.is_crawlable ? 'text-forest-green' : 'text-red-500'}`}>
                              {page.is_crawlable ? '✅ Yes' : '❌ Noindex'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border-color/40 text-[10px] font-black uppercase text-muted-text bg-mint-surface/10">
                        <th className="p-4 pl-6">Crawl URL</th>
                        <th className="p-4">SSL Certificate</th>
                        <th className="p-4">HSTS Headers</th>
                        <th className="p-4">CSP Config</th>
                        <th className="p-4">X-Frame-Options</th>
                        <th className="p-4 pr-6 text-right">Mixed Content</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color/30">
                      {pages.map((page) => (
                        <tr key={page.id} className="hover:bg-mint-surface/5 transition-colors">
                          <td className="p-4 pl-6">
                            <span className="text-xs font-bold text-deep-green block truncate max-w-[200px]" title={page.url}>{page.url}</span>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs font-bold ${page.has_valid_SSL ? 'text-forest-green' : 'text-red-500'}`}>
                              {page.has_valid_SSL ? '✅ Valid Certificate' : '❌ Invalid Certificate'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs font-bold ${page.has_strict_transport_security ? 'text-forest-green' : 'text-red-500'}`}>
                              {page.has_strict_transport_security ? '✅ Enabled' : '❌ Missing'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs font-bold ${page.has_content_security_policy ? 'text-forest-green' : 'text-amber-500'}`}>
                              {page.has_content_security_policy ? '✅ Enabled' : '⚠️ Missing'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs font-bold ${page.has_x_frame_options ? 'text-forest-green' : 'text-red-500'}`}>
                              {page.has_x_frame_options ? '✅ Configured' : '❌ Clickjacking Risk'}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <span className={`text-xs font-bold ${!page.has_mixed_content ? 'text-forest-green' : 'text-red-500'}`}>
                              {!page.has_mixed_content ? '✅ Clean' : '❌ Warnings'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'links' && (() => {
                const allOutgoingLinks = pages.flatMap(page =>
                  (page.links || []).map(link => ({
                    ...link,
                    sourceUrl: page.url
                  }))
                );

                if (allOutgoingLinks.length === 0) {
                  return (
                    <div className="p-10 text-center text-xs text-muted-text font-semibold">
                      No outgoing links discovered on these pages.
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border-color/40 text-[10px] font-black uppercase text-muted-text bg-mint-surface/10">
                          <th className="p-4 pl-6">Source Page</th>
                          <th className="p-4">Target Link</th>
                          <th className="p-4">Anchor Text</th>
                          <th className="p-4">Rel Attribute</th>
                          <th className="p-4">Link Type</th>
                          <th className="p-4">Status Code</th>
                          <th className="p-4 pr-6 text-right">Condition</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-color/30">
                        {allOutgoingLinks.map((link, index) => (
                          <tr key={`${link.id}-${index}`} className="hover:bg-mint-surface/5 transition-colors">
                            <td className="p-4 pl-6">
                              <span className="text-xs font-bold text-deep-green block truncate max-w-[150px]" title={link.sourceUrl}>
                                {link.sourceUrl}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-xs text-muted-text block truncate max-w-[200px]" title={link.target_url}>
                                {link.target_url || '-'}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-xs font-semibold text-muted-text block truncate max-w-[120px]" title={link.anchor_text}>
                                {link.anchor_text || '(no anchor text)'}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-xs text-muted-text">{link.rel || '-'}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-[10px] font-bold uppercase">{link.is_internal ? 'Internal' : 'External'}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-xs font-bold">{link.status_code || '-'}</span>
                            </td>
                            <td className="p-4 pr-6 text-right">
                              {link.is_broken ? (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-red-50 text-red-700 text-[10px] font-bold border border-red-200">
                                  Broken
                                </span>
                              ) : link.redirects ? (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200" title={link.redirect_target}>
                                  Redirects
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-green-50 text-green-700 text-[10px] font-bold border border-green-200">
                                  OK
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
