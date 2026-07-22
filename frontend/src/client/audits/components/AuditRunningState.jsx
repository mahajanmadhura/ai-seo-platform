import React, { useMemo } from 'react';
import { ArrowUpRight, Compass, ShieldCheck, Zap, AlertTriangle, Clock } from 'lucide-react';
import AuditStageTimeline from './AuditStageTimeline';
import CrawlAnimation from './CrawlAnimation';

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

  // Dynamically map backend database progress percentage directly to the 8 timeline steps
  const currentStep = useMemo(() => {
    if (status === 'DONE') return 'DONE';
    if (status === 'FAILED') return 'SAVING_ISSUES';

    if (baseProgress <= 5) return 'QUEUED';
    if (baseProgress <= 15) return 'FETCHING_WEBSITE';
    if (baseProgress <= 25) return 'CHECKING_ROBOTS';
    if (baseProgress <= 55) return 'CRAWLING_PAGES';
    if (baseProgress <= 69) return 'CHECKING_LINKS';
    if (baseProgress <= 85) return 'PAGESPEED';
    return 'SAVING_ISSUES';
  }, [baseProgress, status]);

  const getActivityDetails = () => {
    switch (currentStep) {
      case 'QUEUED':
        return {
          title: 'Queuing crawler parameters',
          desc: 'Registering domain parameters in Celery broker. Preparing crawling queue.',
          icon: <Clock className="w-5 h-5 text-deep-green" />,
        };
      case 'FETCHING_WEBSITE':
        return {
          title: 'Validating domain SSL & headers',
          desc: 'Resolving domain headers, verifying SSL certificate, and HSTS parameters.',
          icon: <ShieldCheck className="w-5 h-5 text-deep-green" />,
        };
      case 'CHECKING_ROBOTS':
        return {
          title: 'Analyzing technical files',
          desc: 'Locating sitemap.xml and robots.txt. Parsing crawl regulations.',
          icon: <Compass className="w-5 h-5 text-deep-green" />,
        };
      case 'CRAWLING_PAGES':
        return {
          title: 'Crawling site structure',
          desc: 'Traversing website pages to collect DOM structure tags.',
          icon: <Zap className="w-5 h-5 text-deep-green" />,
        };
      case 'CHECKING_LINKS':
        return {
          title: 'Testing links & anchors',
          desc: 'Checking unique internal and external links for broken references.',
          icon: <ArrowUpRight className="w-5 h-5 text-deep-green" />,
        };
      case 'PAGESPEED':
        return {
          title: 'Analyzing Core Web Vitals',
          desc: 'Requesting Google PageSpeed Insights parameters to verify speed metrics.',
          icon: <Zap className="w-5 h-5 text-deep-green" />,
        };
      case 'SAVING_ISSUES':
        return {
          title: 'Compiling SEO issues list',
          desc: 'Filtering failed parameters, saving SEO recommendations, and writing to database.',
          icon: <ShieldCheck className="w-5 h-5 text-deep-green" />,
        };
      default:
        return {
          title: 'Processing database records',
          desc: 'Completing background execution.',
          icon: <ShieldCheck className="w-5 h-5 text-deep-green" />,
        };
    }
  };

  const activity = getActivityDetails();

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-border-color/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-black text-forest-green bg-[#E5F3EC] px-3 py-1 rounded-full border border-forest-green/10">
              {status}
            </span>
            <h2 className="text-xl font-black text-deep-green tracking-tight">{audit.website_domain}</h2>
          </div>
          <p className="text-xs text-muted-text font-semibold">
            {statusMessage}
          </p>
          <div className="text-[11px] text-muted-text font-bold flex items-center gap-2">
            <span>5 credits used for this audit</span>
            <span>•</span>
            <span>Running duration: {formatDuration(secondsElapsed)}</span>
          </div>
        </div>

        <div className="w-full md:w-64 space-y-1 text-left">
          <div className="flex justify-between text-[10px] font-black text-deep-green">
            <span>PROGRESS</span>
            <span>{Math.round(baseProgress)}%</span>
          </div>
          <div className="w-full bg-[#F5F7F6] rounded-full h-2 overflow-hidden border border-border-color/20">
            <div
              className="bg-[#36E682] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${baseProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <CrawlAnimation />

          <div className="bg-[#E5F3EC]/40 border border-[#36E682]/10 rounded-3xl p-6 flex gap-4 items-start text-left">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-[#36E682]/20 shadow-sm flex-shrink-0">
              {activity.icon}
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-deep-green">{activity.title}</h4>
              <p className="text-xs text-muted-text font-semibold leading-relaxed">
                {activity.desc}
              </p>
            </div>
          </div>
        </div>

        <div>
          <AuditStageTimeline currentStep={currentStep} status={status} />
        </div>
      </div>

      {secondsElapsed > 180 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-3xl text-xs font-semibold leading-relaxed flex items-start gap-3 shadow-sm text-left animate-fade-in">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5 animate-pulse" />
          <div className="space-y-0.5">
            <span className="font-black block text-amber-900">Notice: Slow Audit Progress</span>
            This audit is taking longer than usual. Large websites, slow external links, or PageSpeed checks can increase crawl time.
          </div>
        </div>
      )}

     
    </div>
  );
}
