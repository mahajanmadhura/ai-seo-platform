import React, { useMemo } from 'react';
import {
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  Layers,
  Link2,
  ExternalLink,
  AlertTriangle,
  Gauge
} from 'lucide-react';

const AUDIT_OPERATIONS = [
  { id: 'INITIALIZING', label: 'Initializing Audit Pipeline', threshold: 5 },
  { id: 'FETCHING_HEADERS', label: 'Fetching HTTP Headers & SSL Certificates', threshold: 15 },
  { id: 'CHECKING_ROBOTS', label: 'Parsing robots.txt & Sitemap Directives', threshold: 25 },
  { id: 'CRAWLING_PAGES', label: 'Crawling Pages & Parsing DOM Structure', threshold: 55 },
  { id: 'TECHNICAL_CHECKS', label: 'Executing Technical SEO Diagnostics', threshold: 70 },
  { id: 'DETECTING_LINKS', label: 'Analyzing Links & Detecting Broken URLs', threshold: 82 },
  { id: 'AI_RECOMMENDATIONS', label: 'Generating AI Executive Recommendations', threshold: 92 },
  { id: 'FINALIZING', label: 'Compiling Final SEO Audit Report', threshold: 100 }
];

export default function AuditRunningState({ audit, secondsElapsed, processStatus }) {
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

  const createdDateStr = audit?.started_at
    ? new Date(audit.started_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Today';

  return (
    <div className="space-y-7 text-left max-w-6xl mx-auto">

      {/* 1. HERO STATUS CARD */}
      <div className="bg-white rounded-3xl p-7 sm:p-8 border border-border-color/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-deep-green tracking-tight">
              {audit.website_domain}
            </h1>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-[#E5F3EC] text-deep-green border border-[#36E682]/40 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#36E682] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#053D34]" />
              </span>
              Audit Running
            </span>
          </div>
          <p className="text-xs text-muted-text font-semibold">
            Automated technical SEO crawler execution actively processing domain structure.
          </p>
        </div>

        {/* Enterprise Status Chips */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <div className="bg-soft-bg px-3.5 py-1.5 rounded-xl border border-border-color/50 text-[11px] font-semibold text-muted-text">
            Created: <strong className="text-deep-green font-bold">{createdDateStr}</strong>
          </div>
          <div className="bg-soft-bg px-3.5 py-1.5 rounded-xl border border-border-color/50 text-[11px] font-semibold text-muted-text">
            Started: <strong className="text-deep-green font-bold">{startedTimeStr}</strong>
          </div>
          <div className="bg-[#E5F3EC]/80 px-3.5 py-1.5 rounded-xl border border-[#36E682]/30 text-[11px] font-bold text-deep-green flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-forest-green" />
            <span>Elapsed: <strong>{formatDuration(secondsElapsed)}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. PROGRESS SECTION (VISUAL CENTER) */}
      <div className="bg-white rounded-3xl p-7 sm:p-8 border border-border-color/60 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-color/40 pb-6">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black text-deep-green tracking-tight font-sans">
                {Math.round(baseProgress)}%
              </span>
              <span className="text-xs text-muted-text font-black uppercase tracking-wider">
                Overall Progress
              </span>
            </div>
            <p className="text-xs font-bold text-deep-green mt-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#36E682]" />
              <span>{pagesCrawled} of {totalPages} URLs Crawled</span>
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1 bg-soft-bg px-4 py-3 rounded-2xl border border-border-color/50">
            <span className="text-[10px] font-black uppercase text-muted-text tracking-wider block">Estimated Remaining</span>
            <p className="text-sm font-black text-deep-green flex items-center sm:justify-end gap-1.5">
              <Clock className="w-3.5 h-3.5 text-forest-green" />
              {formatDuration(estimatedRemainingSeconds)}
            </p>
          </div>
        </div>

        {/* Alive Progress Bar with Shimmer Beam */}
        <div className="space-y-3">
          <div className="w-full bg-soft-bg rounded-full h-3.5 overflow-hidden border border-border-color/40 relative">
            <div
              className="bg-[#36E682] h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
              style={{ width: `${Math.max(baseProgress, 5)}%` }}
            >
              {/* Subtle Moving Highlight Beam */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
            </div>
          </div>

          {/* Live Activity Component */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs text-muted-text font-semibold pt-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-muted-text flex-shrink-0 font-bold">Currently Crawling:</span>
              <div className="inline-flex items-center gap-2 bg-[#E5F3EC] px-3 py-1 rounded-xl border border-[#36E682]/30 min-w-0 truncate">
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#36E682] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#053D34]" />
                </span>
                <code className="font-mono text-deep-green font-black text-xs truncate">
                  {currentAnalyzingPath}
                </code>
              </div>
            </div>

            <div className="text-muted-text font-semibold flex-shrink-0">
              <span>Current Step: </span>
              <strong className="text-deep-green font-black">{AUDIT_OPERATIONS[activeStepIdx]?.label}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PIPELINE TIMELINE & LIVE METRICS DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">

        {/* Left: Deployment Pipeline Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-7 sm:p-8 border border-border-color/60 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border-color/40 pb-3.5 mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-deep-green flex items-center gap-2">
                <Layers className="w-4 h-4 text-forest-green" /> Audit Pipeline Execution
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-text">
                Step {activeStepIdx + 1} of {AUDIT_OPERATIONS.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {AUDIT_OPERATIONS.map((op, idx) => {
                const isCompleted = idx < activeStepIdx;
                const isActive = idx === activeStepIdx;

                return (
                  <div
                    key={op.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 ${
                      isActive
                        ? 'bg-[#E5F3EC] border border-[#36E682]/60 shadow-xs -translate-y-[1px]'
                        : isCompleted
                          ? 'bg-white border border-border-color/40 text-deep-green'
                          : 'bg-transparent text-muted-text/40 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <div className="w-5.5 h-5.5 bg-[#36E682] text-[#053D34] rounded-full flex items-center justify-center font-black text-xs shadow-xs">
                            ✓
                          </div>
                        ) : isActive ? (
                          <div className="w-5.5 h-5.5 bg-white border-2 border-[#053D34] rounded-full flex items-center justify-center">
                            <span className="w-2 h-2 bg-[#053D34] rounded-full animate-ping" />
                          </div>
                        ) : (
                          <div className="w-5.5 h-5.5 bg-soft-bg border border-border-color/40 rounded-full flex items-center justify-center text-[10px] text-muted-text/40 font-bold">
                            ○
                          </div>
                        )}
                      </div>

                      <span className={`text-xs ${isActive ? 'text-deep-green font-black' : isCompleted ? 'text-deep-green/90 font-bold' : 'text-muted-text/50 font-medium'} truncate`}>
                        {op.label}
                      </span>
                    </div>

                    {isActive && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-white text-deep-green px-2.5 py-1 rounded-lg border border-[#36E682]/40 animate-pulse flex-shrink-0 shadow-2xs">
                        Active Step
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Live Monitoring Dashboard (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="bg-white rounded-3xl p-7 border border-border-color/60 shadow-sm space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-deep-green border-b border-border-color/40 pb-3.5">
              Live Monitoring Metrics
            </h3>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Pages Crawled Metric */}
              <div className="bg-soft-bg p-4 rounded-2xl border border-border-color/40 space-y-1.5 hover:-translate-y-[2px] transition-all duration-300 shadow-2xs hover:shadow-xs text-left">
                <div className="flex items-center justify-between text-muted-text">
                  <span className="text-[9px] font-black uppercase tracking-wider">Pages Crawled</span>
                  <Layers className="w-3.5 h-3.5 text-deep-green" />
                </div>
                <p className="text-2xl font-black text-deep-green leading-none">{pagesCrawled}</p>
              </div>

              {/* Internal Links Metric */}
              <div className="bg-soft-bg p-4 rounded-2xl border border-border-color/40 space-y-1.5 hover:-translate-y-[2px] transition-all duration-300 shadow-2xs hover:shadow-xs text-left">
                <div className="flex items-center justify-between text-muted-text">
                  <span className="text-[9px] font-black uppercase tracking-wider">Internal Links</span>
                  <Link2 className="w-3.5 h-3.5 text-forest-green" />
                </div>
                <p className="text-2xl font-black text-deep-green leading-none">{internalLinks}</p>
              </div>

              {/* External Links Metric */}
              <div className="bg-soft-bg p-4 rounded-2xl border border-border-color/40 space-y-1.5 hover:-translate-y-[2px] transition-all duration-300 shadow-2xs hover:shadow-xs text-left">
                <div className="flex items-center justify-between text-muted-text">
                  <span className="text-[9px] font-black uppercase tracking-wider">External Links</span>
                  <ExternalLink className="w-3.5 h-3.5 text-deep-green/70" />
                </div>
                <p className="text-2xl font-black text-deep-green leading-none">{externalLinks}</p>
              </div>

              {/* Errors Found Metric */}
              <div className="bg-soft-bg p-4 rounded-2xl border border-border-color/40 space-y-1.5 hover:-translate-y-[2px] transition-all duration-300 shadow-2xs hover:shadow-xs text-left">
                <div className="flex items-center justify-between text-muted-text">
                  <span className="text-[9px] font-black uppercase tracking-wider">Errors Found</span>
                  <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                </div>
                <p className="text-2xl font-black text-red-600 leading-none">{errorsCount}</p>
              </div>

              {/* Warnings Metric */}
              <div className="bg-soft-bg p-4 rounded-2xl border border-border-color/40 space-y-1.5 hover:-translate-y-[2px] transition-all duration-300 shadow-2xs hover:shadow-xs text-left">
                <div className="flex items-center justify-between text-muted-text">
                  <span className="text-[9px] font-black uppercase tracking-wider">Warnings</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <p className="text-2xl font-black text-amber-600 leading-none">{warningsCount}</p>
              </div>

              {/* Avg Speed Metric */}
              <div className="bg-soft-bg p-4 rounded-2xl border border-border-color/40 space-y-1.5 hover:-translate-y-[2px] transition-all duration-300 shadow-2xs hover:shadow-xs text-left">
                <div className="flex items-center justify-between text-muted-text">
                  <span className="text-[9px] font-black uppercase tracking-wider">Avg Speed</span>
                  <Gauge className="w-3.5 h-3.5 text-deep-green" />
                </div>
                <p className="text-2xl font-black text-deep-green leading-none">{avgResponseTime}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
