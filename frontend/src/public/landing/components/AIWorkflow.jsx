import React from 'react'
import { Globe, Cpu, BarChart3, Sparkles, FileSpreadsheet } from 'lucide-react'

const AIWorkflow = () => {
  const steps = [
    {
      number: '01',
      title: 'Submit Website',
      description: 'Enter your domain address to launch the process.',
      icon: Globe,
    },
    {
      number: '02',
      title: 'Deep Crawl',
      description: 'Our engine checks hundreds of indicators instantly.',
      icon: Cpu,
    },
    {
      number: '03',
      title: 'Prioritize Issues',
      description: 'We group problems by SEO severity rankings.',
      icon: BarChart3,
    },
    {
      number: '04',
      title: 'AI Fix Advice',
      description: 'AI provides clear, developer-ready instructions.',
      icon: Sparkles,
    },
    {
      number: '05',
      title: 'Export Audit',
      description: 'Download the final client-ready PDF report.',
      icon: FileSpreadsheet,
    },
  ]

  return (
    <section id="how-it-works" className="py-16 sm:py-24 px-6 max-w-7xl mx-auto">
      <div className="bg-deep-green rounded-[48px] p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-2xl border border-white/10 text-center">
        
        <div className="absolute inset-0 bg-[radial-gradient(#36E682_1px,transparent_1px)] opacity-[0.03] [background-size:32px_32px] pointer-events-none"></div>

        <div className="max-w-2xl mx-auto space-y-4 mb-16 relative z-10">
          <p className="text-growth-green text-[10px] font-black uppercase tracking-[0.25em]">Workflow Process</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            From raw URL to prioritised action plan
          </h2>
          <p className="text-muted-text text-sm sm:text-base leading-relaxed">
            Our step-by-step intelligence engine crawls, scores, and transforms raw technical data into client-ready insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-10 relative z-10">
          <div className="absolute top-[38px] left-[10%] right-[10%] h-[1px] bg-white/10 hidden md:block z-0"></div>

          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div 
                key={idx} 
                className="relative z-10 flex flex-col items-center text-center space-y-4 group"
              >
                <div className="w-16 h-16 rounded-full bg-deep-green border border-white/10 flex items-center justify-center text-growth-green shadow-xl group-hover:border-growth-green/40 group-hover:scale-105 transition-all duration-300 relative">
                  <Icon className="w-6 h-6" />
                  
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-growth-green text-deep-green border-2 border-deep-green text-[10px] font-black flex items-center justify-center">
                    {step.number}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-extrabold text-white text-base leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-muted-text text-xs leading-relaxed max-w-[170px] mx-auto">
                    {step.description}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="md:hidden text-growth-green/30 pt-2 animate-pulse">
                    &darr;
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default AIWorkflow
