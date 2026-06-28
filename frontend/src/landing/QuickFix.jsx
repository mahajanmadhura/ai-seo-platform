import React from 'react'
import { AlertCircle, Zap, ShieldAlert, Sparkles, Link2, CheckCircle } from 'lucide-react'

const QuickFix = () => {
  const quickFixes = [
    {
      title: 'Slow Server Response & Script Overload',
      impact: 'Triggers page bounces and hurts search ranking score.',
      fix: 'Compress images, defer non-critical scripts, and implement CDN caching.',
      priority: 'Critical',
      icon: ShieldAlert,
      isDark: true,
      badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    {
      title: 'Missing Meta Descriptions',
      impact: 'Reduces search click-through rate (CTR) and limits listing space.',
      fix: 'Write unique meta descriptions between 120 and 160 characters for target pages.',
      priority: 'High',
      icon: Zap,
      isDark: false,
      badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    },
    {
      title: 'Broken Redirects & Links',
      impact: 'Disrupts client navigation flow and leaks crawl budget.',
      fix: 'Update target pages to remove redirects, or link directly to the correct destinations.',
      priority: 'High',
      icon: Link2,
      isDark: false,
      badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    },
    {
      title: 'Missing Image Alt Text',
      impact: 'Weakens web accessibility compliance and image search tags.',
      fix: 'Add descriptive alt tags targeting key semantic terms to all media references.',
      priority: 'Medium',
      icon: Sparkles,
      isDark: false,
      badgeClass: 'bg-deep-green/5 text-deep-green border-deep-green/10',
    },
  ]

  return (
    <section className="py-20 sm:py-28 px-6 max-w-7xl mx-auto border-t border-border-color">
      <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        <div className="lg:col-span-5 space-y-6 text-left lg:sticky lg:top-28">
          <p className="text-growth-green text-[10px] font-black uppercase tracking-[0.25em]">Prioritization Board</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-deep-green leading-tight">
            Fix the highest impact issues first.
          </h2>
          <p className="text-muted-text text-sm sm:text-base leading-relaxed">
            Rather than dump hundreds of errors in your lap, the platform groups tasks by search ranking weight and difficulty to resolve. We highlight "quick wins" so your developer and design teams can start optimizing today.
          </p>
          
          <div className="pt-4 space-y-3.5">
            <div className="flex items-center gap-3 text-xs font-bold text-deep-green">
              <CheckCircle className="w-5 h-5 text-growth-green" />
              <span>Prioritized by rank signal impact</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-deep-green">
              <CheckCircle className="w-5 h-5 text-growth-green" />
              <span>Clear step-by-step developer guidelines</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-deep-green">
              <CheckCircle className="w-5 h-5 text-growth-green" />
              <span>Validate fixes in real-time</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {quickFixes.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className={`p-6 sm:p-8 rounded-[28px] border transition-all duration-300 flex flex-col justify-between gap-6 text-left shadow-sm hover:shadow-md ${
                  item.isDark 
                    ? 'bg-deep-green text-white border-white/10 hover:border-growth-green/30' 
                    : 'bg-card-white text-deep-green border-border-color hover:border-forest-green/20'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      item.isDark 
                        ? 'bg-white/10 border-white/25 text-growth-green' 
                        : 'bg-deep-green/5 border-deep-green/10 text-deep-green'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${item.badgeClass}`}>
                      {item.priority}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h3 className={`font-black text-base sm:text-lg ${item.isDark ? 'text-white' : 'text-deep-green'}`}>
                      {item.title}
                    </h3>
                    
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-muted-text">
                        Impact Description
                      </p>
                      <p className={`text-xs sm:text-sm leading-relaxed ${item.isDark ? 'text-white/80' : 'text-muted-text'}`}>
                        {item.impact}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`pt-4 border-t space-y-1.5 ${item.isDark ? 'border-white/10' : 'border-border-color'}`}>
                  <p className="text-[9px] font-black text-growth-green uppercase tracking-widest">
                    Recommended Fix
                  </p>
                  <p className={`text-xs sm:text-sm leading-relaxed font-bold ${item.isDark ? 'text-white' : 'text-deep-green'}`}>
                    {item.fix}
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

export default QuickFix