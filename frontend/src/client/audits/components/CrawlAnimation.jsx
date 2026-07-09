import React from 'react';
import { Globe, FileText, Link, Shield, Image, Sparkles } from 'lucide-react';

export default function CrawlAnimation() {
  return (
    <div className="bg-white rounded-3xl p-8 border border-border-color/60 shadow-sm flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-mint-surface/10 to-transparent pointer-events-none" />
      
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#36E682]/40 to-transparent animate-scan" style={{ animationDuration: '3s', animationIterationCount: 'infinite' }} />

      <div className="relative w-72 h-72 flex items-center justify-center">
        <div className="absolute w-56 h-56 border-2 border-dashed border-border-color/30 rounded-full animate-spin" style={{ animationDuration: '25s' }} />
        <div className="absolute w-40 h-40 border border-dashed border-[#36E682]/20 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />

        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-float" style={{ animationDelay: '0.2s' }}>
          <div className="w-10 h-10 bg-[#E5F3EC] text-forest-green rounded-2xl flex items-center justify-center border border-[#36E682]/30 shadow-sm">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-[9px] bg-white border border-border-color/60 px-2 py-0.5 rounded-full font-bold text-muted-text shadow-sm">H1 & Metadata</span>
        </div>

        <div className="absolute bottom-6 left-6 flex flex-col items-center gap-1 animate-float" style={{ animationDelay: '0.8s' }}>
          <div className="w-10 h-10 bg-[#E5F3EC] text-forest-green rounded-2xl flex items-center justify-center border border-[#36E682]/30 shadow-sm">
            <Link className="w-4 h-4" />
          </div>
          <span className="text-[9px] bg-white border border-border-color/60 px-2 py-0.5 rounded-full font-bold text-muted-text shadow-sm">Anchor Check</span>
        </div>

        <div className="absolute bottom-6 right-6 flex flex-col items-center gap-1 animate-float" style={{ animationDelay: '1.4s' }}>
          <div className="w-10 h-10 bg-[#E5F3EC] text-forest-green rounded-2xl flex items-center justify-center border border-[#36E682]/30 shadow-sm">
            <Image className="w-4 h-4" />
          </div>
          <span className="text-[9px] bg-white border border-border-color/60 px-2 py-0.5 rounded-full font-bold text-muted-text shadow-sm">Img Alt Tags</span>
        </div>

        <div className="absolute top-1/2 -translate-y-1/2 -left-2 flex flex-col items-center gap-1 animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-10 h-10 bg-[#E5F3EC] text-forest-green rounded-2xl flex items-center justify-center border border-[#36E682]/30 shadow-sm">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-[9px] bg-white border border-border-color/60 px-2 py-0.5 rounded-full font-bold text-muted-text shadow-sm">SSL & Security</span>
        </div>

        <div className="z-10 w-20 h-20 bg-deep-green text-white rounded-3xl flex flex-col items-center justify-center shadow-lg border-4 border-white animate-pulse relative">
          <Globe className="w-8 h-8 text-[#36E682]" />
          <div className="absolute -inset-1 rounded-3xl border-2 border-[#36E682]/50 animate-ping pointer-events-none" />
        </div>
      </div>

      <div className="flex gap-4 mt-4">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-forest-green bg-[#E5F3EC] px-3 py-1 rounded-full border border-forest-green/10">
          <Sparkles className="w-3 h-3 text-[#36E682]" /> Crawling Active
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-text bg-[#F5F7F6] px-3 py-1 rounded-full border border-border-color/40">
          Scraping SEO Elements
        </span>
      </div>
    </div>
  );
}
