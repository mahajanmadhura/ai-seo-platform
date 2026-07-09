import React from 'react';
import { Check, Circle } from 'lucide-react';

const STEPS = [
  { key: 'QUEUED', label: 'Queued' },
  { key: 'FETCHING_WEBSITE', label: 'Fetching website' },
  { key: 'CHECKING_ROBOTS', label: 'Checking robots' },
  { key: 'CRAWLING_PAGES', label: 'Crawling pages' },
  { key: 'CHECKING_LINKS', label: 'Checking links' },
  { key: 'PAGESPEED', label: 'PageSpeed' },
  { key: 'SAVING_ISSUES', label: 'Saving issues' },
  { key: 'DONE', label: 'Done' }
];

export default function AuditStageTimeline({ currentStep, status }) {
  const currentIdx = STEPS.findIndex(s => s.key === currentStep);

  return (
    <div className="bg-white rounded-3xl p-6 border border-border-color/60 shadow-sm">
      <h4 className="text-xs font-black text-deep-green uppercase tracking-wider mb-6">Crawl Sequence Progress</h4>
      <div className="relative pl-6 border-l-2 border-border-color/30 space-y-6">
        {STEPS.map((step, index) => {
          const isCompleted = status === 'DONE' || (currentIdx !== -1 && index < currentIdx);
          const isActive = status !== 'DONE' && status !== 'FAILED' && step.key === currentStep;
          
          return (
            <div key={step.key} className="relative flex items-center gap-4">
              <div className="absolute -left-[33px] flex items-center justify-center">
                {isCompleted ? (
                  <div className="w-5 h-5 bg-[#36E682] text-white rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                    <Check className="w-2.5 h-2.5 stroke-[4]" />
                  </div>
                ) : isActive ? (
                  <div className="w-5 h-5 bg-white border-2 border-[#36E682] rounded-full flex items-center justify-center shadow-sm relative">
                    <span className="w-2 h-2 bg-[#36E682] rounded-full animate-ping absolute" />
                    <span className="w-1.5 h-1.5 bg-[#36E682] rounded-full" />
                  </div>
                ) : (
                  <div className="w-5 h-5 bg-white border-2 border-border-color/60 rounded-full flex items-center justify-center shadow-sm">
                    <div className="w-1 h-1 bg-muted-text/30 rounded-full" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-xs font-bold transition-colors duration-300 ${
                  isActive ? 'text-deep-green' : isCompleted ? 'text-muted-text/80 font-semibold' : 'text-muted-text/50 font-medium'
                }`}>
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
