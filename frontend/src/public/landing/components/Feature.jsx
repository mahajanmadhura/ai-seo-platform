import React from 'react'
import { FileText, Settings, Gauge, Smartphone, Shield, Link, Sparkles, FileDown, ArrowRight } from 'lucide-react'

const Feature = () => {
  return (
    <section id="features" className="py-20 sm:py-28 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-16 gap-6 text-left">
        <div className="space-y-4 max-w-xl">
          <p className="text-growth-green text-[10px] font-black uppercase tracking-[0.25em]">Audit Capabilities</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-deep-green leading-tight">
            Full-Spectrum Audit Lab Tools
          </h2>
        </div>
        <p className="text-muted-text text-sm sm:text-base max-w-md">
          Our advanced crawl engine analyzes over 300 technical, speed, and architectural parameters to pinpoint every bottleneck limiting your rankings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        <div className="bg-deep-green text-white md:col-span-2 row-span-2 p-8 sm:p-10 rounded-[32px] border border-white/10 relative overflow-hidden flex flex-col justify-between group shadow-xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all duration-300">
            <Settings className="w-40 h-40 text-growth-green animate-spin-slow" />
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-growth-green/10 border border-growth-green/20 flex items-center justify-center text-growth-green">
              <Settings className="w-6 h-6" />
            </div>
            <div className="space-y-3 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-growth-green">Featured Module</span>
              <h3 className="text-2xl font-black text-white leading-tight">Technical SEO Crawl Engine</h3>
              <p className="text-muted-text text-sm leading-relaxed max-w-md">
                Detect missing sitemaps, indexability locks, robots.txt blocks, server performance issues, hreflang schema errors, incorrect status codes, and crawl-budget drain.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-wrap gap-2 text-left relative z-10">
            {['sitemaps', 'robots.txt', 'hreflang', 'status codes', 'redirect chains', 'canonical checks'].map((tag, idx) => (
              <span key={idx} className="text-[10px] font-bold bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider text-white">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-mint-surface text-deep-green p-6 sm:p-8 rounded-[28px] border border-border-color flex flex-col justify-between group shadow-sm hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-deep-green/5 border border-deep-green/10 flex items-center justify-center text-deep-green">
              <Sparkles className="w-5 h-5 text-deep-green" />
            </div>
            <div className="space-y-2 text-left">
              <h3 className="font-extrabold text-deep-green text-lg leading-snug group-hover:text-forest-green transition-colors">
                AI Action Recommender
              </h3>
              <p className="text-muted-text text-xs sm:text-sm leading-relaxed">
                Translate raw metric scores directly into readable, prioritized instructions for developer and content teams.
              </p>
            </div>
          </div>
          <div className="text-xs font-black text-deep-green uppercase tracking-widest pt-4 flex items-center gap-1.5 hover:gap-3 transition-all">
            <span>Prioritized list</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-card-white text-deep-green p-6 sm:p-8 rounded-[28px] border border-border-color flex flex-col justify-between group shadow-sm hover:shadow-md transition-all">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-deep-green/5 border border-deep-green/10 flex items-center justify-center text-deep-green">
              <FileDown className="w-5 h-5 text-deep-green" />
            </div>
            <div className="space-y-2 text-left">
              <h3 className="font-extrabold text-deep-green text-lg leading-snug group-hover:text-forest-green transition-colors">
                White-Label PDFs
              </h3>
              <p className="text-muted-text text-xs sm:text-sm leading-relaxed">
                Download fully styled audits with custom headers to hand directly to clients and stakeholders.
              </p>
            </div>
          </div>
          <div className="text-xs font-black text-deep-green uppercase tracking-widest pt-4 flex items-center gap-1.5 hover:gap-3 transition-all">
            <span>Agency ready</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-card-white text-deep-green p-6 rounded-[24px] border border-border-color flex flex-col justify-between group hover:border-forest-green/20 transition-all">
          <div className="space-y-3 text-left">
            <div className="w-9 h-9 rounded-lg bg-deep-green/5 flex items-center justify-center text-deep-green">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-bold text-deep-green text-base">On-Page Signals</h4>
            <p className="text-muted-text text-xs leading-relaxed">
              Scan page headers, meta descriptions, image titles, alt tags, URL strings, and outbound structures.
            </p>
          </div>
        </div>

        <div className="bg-mint-surface text-deep-green p-6 rounded-[24px] border border-border-color flex flex-col justify-between group hover:border-forest-green/20 transition-all">
          <div className="space-y-3 text-left">
            <div className="w-9 h-9 rounded-lg bg-deep-green/5 flex items-center justify-center text-deep-green">
              <Gauge className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-bold text-deep-green text-base">Core Web Vitals</h4>
            <p className="text-muted-text text-xs leading-relaxed">
              Track response speeds, page sizes, script load-order blockages, and server response efficiencies.
            </p>
          </div>
        </div>

        <div className="bg-card-white text-deep-green p-6 rounded-[24px] border border-border-color flex flex-col justify-between group hover:border-forest-green/20 transition-all">
          <div className="space-y-3 text-left">
            <div className="w-9 h-9 rounded-lg bg-deep-green/5 flex items-center justify-center text-deep-green">
              <Smartphone className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-bold text-deep-green text-base">Mobile Readiness</h4>
            <p className="text-muted-text text-xs leading-relaxed">
              Ensure responsive viewports, readable text, safe tap target sizing, and dynamic render compatibility.
            </p>
          </div>
        </div>

        <div className="bg-card-white text-deep-green p-6 rounded-[24px] border border-border-color flex flex-col justify-between group hover:border-forest-green/20 transition-all">
          <div className="space-y-3 text-left">
            <div className="w-9 h-9 rounded-lg bg-deep-green/5 flex items-center justify-center text-deep-green">
              <Link className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-bold text-deep-green text-base">Link Architecture</h4>
            <p className="text-muted-text text-xs leading-relaxed">
              Inspect internal pathways, anchor details, broken redirects, and missing index flags.
            </p>
          </div>
        </div>

        <div className="bg-deep-green text-white p-6 rounded-[24px] border border-white/10 flex flex-col justify-between group transition-all">
          <div className="space-y-3 text-left">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-growth-green">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-bold text-white text-base">SSL & Safety</h4>
            <p className="text-muted-text text-xs leading-relaxed">
              Verify SSL status, security headers, cross-origin security issues, and mixed protocol contents.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Feature
