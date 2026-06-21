import React from 'react'
import { AlertCircle, Zap, ShieldAlert, Sparkles, Link2 } from 'lucide-react'

const QuickFix = () => {
  const quickFixes = [
    {
      title: 'Missing Meta Descriptions',
      impact: 'Low CTR and weak search snippets.',
      fix: 'Add unique 120–160 character meta descriptions.',
      priority: 'High',
      icon: Zap,
      colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
    },
    {
      title: 'Slow Page Speed',
      impact: 'Poor user experience and ranking risk.',
      fix: 'Compress images, reduce unused scripts, and improve caching.',
      priority: 'Critical',
      icon: ShieldAlert,
      colorClass: 'text-red-500 bg-red-500/10 border-red-500/20',
      badgeClass: 'bg-red-500/10 text-red-500 border-red-500/25',
    },
    {
      title: 'Missing Image Alt Text',
      impact: 'Weak accessibility and image SEO.',
      fix: 'Add descriptive alt attributes to important images.',
      priority: 'Medium',
      icon: Sparkles,
      colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      badgeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/25',
    },
    {
      title: 'Broken Links',
      impact: 'Bad crawl experience and poor trust.',
      fix: 'Replace, redirect, or remove broken URLs.',
      priority: 'High',
      icon: Link2,
      colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
    },
  ]

  return (
    <section className="py-16 sm:py-24 px-6 bg-[#070a0a] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#84FF00]/5 rounded-full blur-[140px] -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Quick wins your team can act on first
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            Instead of giving raw SEO data only, the platform prioritizes the fixes that matter most.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickFixes.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="glass p-6 sm:p-8 rounded-[24px] border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col justify-between gap-6 text-left"
              >
                <div className="space-y-4">
                  {/* Top Bar (Icon & Priority Badge) */}
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${item.badgeClass}`}>
                      {item.priority}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-white text-base sm:text-lg">{item.title}</h3>
                    
                    {/* Impact block */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Impact</p>
                      <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{item.impact}</p>
                    </div>
                  </div>
                </div>

                {/* Fix block */}
                <div className="pt-4 border-t border-white/5 space-y-1">
                  <p className="text-[10px] font-black text-[#84FF00] uppercase tracking-widest">Fix Recommendation</p>
                  <p className="text-white text-xs sm:text-sm leading-relaxed font-semibold">{item.fix}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default QuickFix