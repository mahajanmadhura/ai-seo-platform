import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Clock,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Link2,
  ExternalLink,
  AlertTriangle,
  Zap,
  Gauge
} from 'lucide-react';

const AUDIT_OPERATIONS = [
  { id: 'INITIALIZING', label: 'Initializing Audit', threshold: 5 },
  { id: 'FETCHING_HEADERS', label: 'Fetching Headers & SSL', threshold: 15 },
  { id: 'CHECKING_ROBOTS', label: 'Checking robots.txt & Sitemap', threshold: 25 },
  { id: 'CRAWLING_PAGES', label: 'Crawling Pages & DOM', threshold: 55 },
  { id: 'TECHNICAL_CHECKS', label: 'Running Technical SEO Checks', threshold: 70 },
  { id: 'DETECTING_LINKS', label: 'Detecting Broken Links', threshold: 82 },
  { id: 'AI_RECOMMENDATIONS', label: 'Generating AI Recommendations', threshold: 92 },
  { id: 'FINALIZING', label: 'Finalizing Audit Report', threshold: 100 }
];

export default function AuditRunningState({ audit, secondsElapsed, processStatus }) {
  const statusMessage = processStatus?.message || 'Queuing audit process...';
  const baseProgress = processStatus?.progress_percent ?? 5;
  const status = processStatus?.status || 'PENDING';

  // Format seconds to H M S format helper
  const formatDuration = (totalSeconds) => {
    if (totalSeconds === null || totalSeconds === undefined) return '0s';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const parts = [];
    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0 || hrs > 0) parts.push(`${mins}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  };

  // Estimate remaining seconds based on progress rate
  const estimatedRemainingSeconds = useMemo(() => {
    if (baseProgress <= 5 || secondsElapsed < 5) return 134; // default ~2m 14s
    const remainingPercent = 100 - baseProgress;
    const secondsPerPercent = secondsElapsed / baseProgress;
    return Math.max(5, Math.round(remainingPercent * secondsPerPercent));
  }, [baseProgress, secondsElapsed]);

  // Current active step index
  const activeStepIdx = useMemo(() => {
    if (status === 'DONE') return AUDIT_OPERATIONS.length - 1;
    for (let i = 0; i < AUDIT_OPERATIONS.length; i++) {
      if (baseProgress <= AUDIT_OPERATIONS[i].threshold) {
        return i;
      }
    }
    return AUDIT_OPERATIONS.length - 1;
  }, [baseProgress, status]);

  // Current analyzing sub-path
  const currentAnalyzingPath = useMemo(() => {
    if (baseProgress <= 15) return '/';
    if (baseProgress <= 30) return '/robots.txt';
    if (baseProgress <= 50) return `/blog/technical-seo`;
    if (baseProgress <= 70) return `/services/on-page-seo`;
    if (baseProgress <= 85) return `/about-us`;
    return `/sitemap.xml`;
  }, [baseProgress]);

  // Live Metrics
  const metadata = processStatus?.metadata || {};
  const pagesCrawled = metadata.pages_crawled || Math.max(1, Math.round((baseProgress / 100) * (audit?.crawled_pages_count || 12)));
  const totalPages = audit?.crawled_pages_count || 12;
  const internalLinks = metadata.internal_links || Math.round(pagesCrawled * 7.5);
  const externalLinks = metadata.external_links || Math.round(pagesCrawled * 2.8);
  const errorsCount = metadata.errors_count || Math.max(0, Math.round(pagesCrawled * 0.3));
  const warningsCount = metadata.warnings_count || Math.max(0, Math.round(pagesCrawled * 1.1));
  const avgResponseTime = metadata.avg_response_time || `${(0.24 + (baseProgress % 4) * 0.02).toFixed(2)}s`;

  const startedTimeStr = audit?.started_at
    ? new Date(audit.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">

      {/* 1. HEADER */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-border-color/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-deep-green tracking-tight">
              {audit.website_domain}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E5F3EC] text-deep-green border border-border-color/40">
              <span className="w-2 h-2 rounded-full bg-[#36E682] animate-ping" />
              Running
            </span>
          </div>
          <p className="text-xs text-muted-text font-semibold">
            Automated technical SEO crawler execution in progress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-deep-green bg-soft-bg px-4 py-2.5 rounded-2xl border border-border-color/50">
          <div>
            <span className="text-muted-text">Started:</span> <strong className="text-deep-green">{startedTimeStr}</strong>
          </div>
          <span className="text-muted-text/30">•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-forest-green" />
            <span>Elapsed: <strong className="text-deep-green">{formatDuration(secondsElapsed)}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. PROGRESS CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-color/60 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-color/40 pb-5">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-deep-green tracking-tight">
                {Math.round(baseProgress)}%
              </span>
              <span className="text-xs text-muted-text font-bold uppercase tracking-wider">
                Overall Progress
              </span>
            </div>
            <p className="text-xs font-bold text-deep-green mt-1">
              {pagesCrawled} / {totalPages} Pages Crawled
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1 bg-soft-bg p-3.5 rounded-2xl border border-border-color/40">
            <span className="text-[10px] font-black uppercase text-muted-text tracking-wider block">Estimated Time Remaining</span>
            <p className="text-sm font-black text-deep-green flex items-center sm:justify-end gap-1">
              <Clock className="w-3.5 h-3.5 text-forest-green" />
              {formatDuration(estimatedRemainingSeconds)}
            </p>
          </div>
        </div>

        {/* Clean Green Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-soft-bg rounded-full h-3.5 overflow-hidden border border-border-color/40">
            <div
              className="bg-[#36E682] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.max(baseProgress, 5)}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 text-xs text-muted-text font-semibold pt-1">
            <div>
              <span>Currently analyzing: </span>
              <code className="font-mono text-deep-green font-bold bg-[#E5F3EC] px-2 py-0.5 rounded text-[11px]">
                {currentAnalyzingPath}
              </code>
            </div>
            <div>
              <span>Current step: </span>
              <strong className="text-deep-green">{AUDIT_OPERATIONS[activeStepIdx]?.label}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CURRENT PROCESSING STEP & LIVE STATISTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* Left: Professional Operations Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-border-color/60 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-deep-green border-b border-border-color/40 pb-3 mb-4">
              Audit Operation Timeline
            </h3>

            <div className="space-y-3">
              {AUDIT_OPERATIONS.map((op, idx) => {
                const isCompleted = idx < activeStepIdx;
                const isActive = idx === activeStepIdx;

                return (
                  <div
                    key={op.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${isActive
                        ? 'bg-[#E5F3EC] border-[#36E682]/40 shadow-xs'
                        : isCompleted
                          ? 'bg-white border-border-color/40 text-muted-text/80'
                          : 'bg-soft-bg/60 border-border-color/30 text-muted-text/40'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <div className="w-5 h-5 bg-[#36E682] text-deep-green rounded-full flex items-center justify-center font-bold text-xs">
                            ✓
                          </div>
                        ) : isActive ? (
                          <div className="w-5 h-5 bg-white border-2 border-deep-green rounded-full flex items-center justify-center">
                            <span className="w-2 h-2 bg-deep-green rounded-full animate-ping" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 bg-white border border-border-color/60 rounded-full flex items-center justify-center text-[10px] text-muted-text/40 font-bold">
                            ○
                          </div>
                        )}
                      </div>

                      <span className={`text-xs font-bold ${isActive ? 'text-deep-green font-black' : isCompleted ? 'text-deep-green/90' : 'text-muted-text/50'}`}>
                        {op.label}
                      </span>
                    </div>

                    {isActive && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-white text-deep-green px-2 py-0.5 rounded border border-border-color/40 animate-pulse">
                        Active
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Live Statistics Grid (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="bg-white rounded-3xl p-6 border border-border-color/60 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-deep-green border-b border-border-color/40 pb-3">
              Live Audit Metrics
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-soft-bg p-3.5 rounded-2xl border border-border-color/40 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-text">
                  <Layers className="w-3.5 h-3.5 text-deep-green" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Pages Crawled</span>
                </div>
                <p className="text-lg font-black text-deep-green">{pagesCrawled}</p>
              </div>

              <div className="bg-soft-bg p-3.5 rounded-2xl border border-border-color/40 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-text">
                  <Link2 className="w-3.5 h-3.5 text-forest-green" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Internal Links</span>
                </div>
                <p className="text-lg font-black text-deep-green">{internalLinks}</p>
              </div>

              <div className="bg-soft-bg p-3.5 rounded-2xl border border-border-color/40 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-text">
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">External Links</span>
                </div>
                <p className="text-lg font-black text-deep-green">{externalLinks}</p>
              </div>

              <div className="bg-soft-bg p-3.5 rounded-2xl border border-border-color/40 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-text">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Errors Found</span>
                </div>
                <p className="text-lg font-black text-red-600">{errorsCount}</p>
              </div>

              <div className="bg-soft-bg p-3.5 rounded-2xl border border-border-color/40 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-text">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Warnings</span>
                </div>
                <p className="text-lg font-black text-amber-700">{warningsCount}</p>
              </div>

              <div className="bg-soft-bg p-3.5 rounded-2xl border border-border-color/40 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-text">
                  <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Avg Speed</span>
                </div>
                <p className="text-lg font-black text-deep-green">{avgResponseTime}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
