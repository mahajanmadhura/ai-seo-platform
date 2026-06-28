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
    <section className="bg-deep-green py-12 px-6 border-y border-white/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#36E682_1px,transparent_1px)] opacity-5 [background-size:24px_24px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
        <div className="text-center lg:text-left space-y-2 max-w-sm">
          <p className="text-growth-green text-[10px] font-black uppercase tracking-[0.25em]">Precision Engine</p>
          <h3 className="text-white text-xl sm:text-2xl font-black leading-tight">
            Built for agencies, freelancers, & SEO teams.
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full lg:w-auto flex-1 max-w-5xl">
          {stats.map((item, idx) => {
            const Icon = item.icon
            return (
              <div 
                key={idx} 
                className="bg-white/5 border border-white/10 p-5 rounded-2xl text-left flex gap-4 hover:bg-white/8 hover:border-white/15 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-growth-green/10 border border-growth-green/20 flex items-center justify-center text-growth-green flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-bold text-sm leading-snug">{item.title}</h4>
                  <p className="text-muted-text text-xs leading-relaxed">{item.description}</p>
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
