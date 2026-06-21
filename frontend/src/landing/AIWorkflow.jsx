import React from 'react'
import { Globe, Cpu, BarChart3, Sparkles, FileSpreadsheet } from 'lucide-react'

const AIWorkflow = () => {
  const steps = [
    {
      number: '01',
      title: 'Submit Website',
      description: 'Enter a domain and start an audit.',
      icon: Globe,
    },
    {
      number: '02',
      title: 'Crawl & Analyze',
      description: 'The engine checks on-page, technical, mobile, security, performance, and link signals.',
      icon: Cpu,
    },
    {
      number: '03',
      title: 'Score & Prioritize',
      description: 'Issues are grouped by severity: Critical, High, Medium, and Low.',
      icon: BarChart3,
    },
    {
      number: '04',
      title: 'Generate AI Recommendations',
      description: 'AI converts audit data into clear fixes and quick wins.',
      icon: Sparkles,
    },
    {
      number: '05',
      title: 'Export Report',
      description: 'Download a professional client-ready SEO report.',
      icon: FileSpreadsheet,
    },
  ]

  return (
    <section className="py-16 sm:py-24 px-6 bg-[#060909] relative">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            From website URL to prioritized SEO action plan
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            Our step-by-step intelligence engine crawls, scores, and transforms raw technical data into client-ready insights.
          </p>
        </div>

        {/* Timeline Layout */}
        <div className="grid md:grid-cols-5 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="absolute top-[34px] left-[5%] right-[5%] h-0.5 bg-white/10 hidden md:block z-0"></div>

          {steps.map((step, idx) => {
            const IconComponent = step.icon
            return (
              <div key={idx} className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                {/* Step Circle */}
                <div className="w-16 h-16 rounded-full bg-[#0c0f0f] border border-white/10 flex items-center justify-center text-[#84FF00] shadow-xl hover:border-[#84FF00]/40 transition-colors duration-300">
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* Step Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="text-[10px] font-black text-gray-600 tracking-widest">{step.number}</span>
                    <h3 className="font-extrabold text-white text-base">{step.title}</h3>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-[200px] mx-auto md:mx-0">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default AIWorkflow
