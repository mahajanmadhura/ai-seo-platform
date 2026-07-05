import React from 'react'
import { CheckCircle2, ShieldAlert, FileText, Zap } from 'lucide-react'

const HeroStrip = () => {
  const stats = [
    {
      title: '6 Audit Categories',
      description: 'Technical, On-Page, Mobile, Performance, Security & Links',
      icon: Zap,
    },
    {
      title: 'AI-Prioritized Fixes',
      description: 'Issues sorted by search impact & complexity',
      icon: ShieldAlert,
    },
    {
      title: 'Client-Ready Reports',
      description: 'Download beautiful white-labeled PDF audits',
      icon: FileText,
    },
    {
      title: 'Project Workflow',
      description: 'Organize audits in dedicated workspaces',
      icon: CheckCircle2,
    },
  ]

  return (
    <section className="bg-gradient-to-b from-white via-soft-bg to-soft-bg/60 py-16 sm:py-24 px-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-growth-green/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-mint-surface/30 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch justify-between gap-8 lg:gap-12 relative z-10">
        
        <div className="bg-deep-green rounded-3xl p-8 sm:p-10 text-left flex flex-col justify-between lg:max-w-md w-full relative overflow-hidden border border-white/5 shadow-xl shadow-deep-green/[0.04]">
          <div className="absolute inset-0 bg-[radial-gradient(#36E682_1px,transparent_1px)] opacity-5 [background-size:20px_20px] pointer-events-none"></div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-growth-green/10 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10 space-y-3">
            <p className="text-growth-green text-[10px] font-black uppercase tracking-[0.25em] inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-growth-green animate-pulse"></span>
              Precision Engine
            </p>
            <h3 className="text-white text-2xl sm:text-3xl font-black leading-tight max-w-sm">
              Built for agencies, freelancers, & SEO teams.
            </h3>
          </div>
          
          <div className="relative z-10 mt-12 pt-6 border-t border-white/10 hidden lg:block">
            <p className="text-white/60 text-xs font-semibold leading-relaxed">
              Every crawl compiles comprehensive diagnostics and schedules actionable priorities to rank your domain.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full flex-1">
          {stats.map((item, idx) => {
            const Icon = item.icon
            return (
              <div 
                key={idx} 
                className="group bg-white border border-border-color/85 p-6 rounded-2xl text-left flex gap-5 hover:shadow-[0_12px_30px_rgba(5,61,52,0.04)] hover:border-growth-green/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-mint-surface flex items-center justify-center text-deep-green border border-border-color/50 group-hover:bg-growth-green/10 group-hover:text-deep-green group-hover:border-growth-green/20 flex-shrink-0 transition-all duration-300">
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-deep-green font-black text-sm sm:text-base leading-snug">{item.title}</h4>
                  <p className="text-muted-text text-xs font-semibold leading-relaxed">{item.description}</p>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

export default HeroStrip
