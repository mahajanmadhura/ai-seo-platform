import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, AlertCircle, Sparkles, Check, FileText, Smartphone, Gauge, Shield, Link2, Monitor, ArrowRight, CheckCircle2 } from 'lucide-react'

const Hero = () => {
  const navigate = useNavigate()
  const [urlInput, setUrlInput] = useState('')

  const handleRunAudit = () => {
    navigate('/register')
  }

  const handleScrollToReports = () => {
    const el = document.getElementById('reports')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const trustPoints = [
    'No monthly commitment',
    'Agency-ready reports',
    'AI-prioritized actions',
  ]

  const categories = [
    { label: 'Technical SEO', icon: Monitor },
    { label: 'On-Page SEO', icon: FileText },
    { label: 'Performance', icon: Gauge },
    { label: 'Mobile SEO', icon: Smartphone },
    { label: 'Security', icon: Shield },
    { label: 'Link Analysis', icon: Link2 },
  ]

  return (
    <header className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-growth-green/5 rounded-full blur-[140px] -z-10 pointer-events-none"></div>

      <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-forest-green/10 bg-mint-surface text-deep-green text-[10px] font-black uppercase tracking-[0.25em]">
            <span className="w-2.5 h-2.5 rounded-full bg-growth-green shadow-[0_0_8px_rgba(54,230,130,0.8)] animate-pulse"></span>
            AI SEO Precision Lab
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight leading-[1.08] text-deep-green">
              AI SEO audits that turn website issues into client-ready action plans.
            </h1>
            <p className="text-muted-text text-sm sm:text-base md:text-lg max-w-xl leading-relaxed">
              Analyze technical SEO, on-page signals, performance, mobile readiness, security, and links. Get prioritized AI recommendations and export professional reports in minutes.
            </p>
          </div>

          <div className="space-y-4 max-w-xl">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-growth-green rounded-2xl blur opacity-15 group-focus-within:opacity-30 transition-all duration-300"></div>
              <div className="relative flex bg-white border border-border-color rounded-2xl p-1.5 focus-within:border-deep-green focus-within:ring-4 focus-within:ring-deep-green/5 shadow-lg shadow-deep-green/[0.03] transition-all duration-300">
                <input
                  type="text"
                  placeholder="Enter website URL (e.g. stellar-studio.co)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-deep-green flex-1 px-4 py-3 outline-none text-sm font-semibold placeholder-muted-text/40"
                />
                <button
                  id="hero-analyze-btn"
                  onClick={handleRunAudit}
                  className="bg-growth-green text-deep-green px-7 py-3 rounded-xl font-black uppercase tracking-wider text-xs hover:bg-growth-green/90 active:scale-95 transition-all duration-200 shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Run SEO Audit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="text-xs font-bold text-deep-green hover:text-forest-green transition-colors duration-200 border-b border-deep-green/30 hover:border-deep-green pb-0.5 cursor-pointer"
                onClick={handleScrollToReports}
              >
                View Sample Report &rarr;
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-y-3 gap-x-6 pt-2">
            {trustPoints.map((point, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-bold text-muted-text">
                <CheckCircle2 className="w-4.5 h-4.5 text-growth-green flex-shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 relative w-full max-w-lg mx-auto lg:max-w-none">
          <div className="absolute -inset-4 bg-deep-green rounded-[48px] shadow-2xl -z-10 pointer-events-none transform -rotate-1"></div>
          
          <div className="bg-deep-green rounded-[40px] p-6 sm:p-8 text-white min-h-[470px] relative z-10 overflow-hidden flex flex-col justify-between border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-growth-green shadow-inner">
                  <Search className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] uppercase font-black text-muted-text tracking-widest leading-none">Domain Snapshot</p>
                  <p className="text-xs font-black text-white tracking-wide mt-1">stellar-studio.co</p>
                </div>
              </div>
              <div className="bg-growth-green/10 text-growth-green border border-growth-green/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                Audit Active
              </div>
            </div>

            <div className="relative flex-1 min-h-[250px] mb-4">
              <div className="bg-card-white text-deep-green rounded-3xl p-5 shadow-xl w-[60%] text-left transform -rotate-2 relative z-20 border border-border-color">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[8px] uppercase tracking-widest font-black text-muted-text">Overall SEO</span>
                  <Sparkles className="w-4 h-4 text-growth-green fill-growth-green/20" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tight text-deep-green">84</span>
                  <span className="text-xs font-bold text-muted-text">/100</span>
                </div>
                <div className="w-full bg-mint-surface h-1.5 rounded-full overflow-hidden mt-3.5">
                  <div className="bg-growth-green h-full rounded-full" style={{ width: '84%' }} />
                </div>
                <p className="text-[10px] font-bold text-forest-green mt-3.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-growth-green"></span>
                  Passed 82% of checks
                </p>
              </div>

              <div className="bg-mint-surface text-deep-green rounded-2xl p-4 shadow-lg absolute right-[-10px] top-[20px] z-30 max-w-[190px] border border-border-color transform rotate-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="text-left space-y-0.5">
                  <span className="text-[8px] font-black uppercase text-red-600 tracking-wider">Critical Issues</span>
                  <p className="text-lg font-black text-deep-green leading-none">12</p>
                  <p className="text-[9px] text-muted-text font-semibold">Immediate fixes required</p>
                </div>
              </div>

              <div className="bg-card-white text-deep-green rounded-2xl p-4 shadow-md absolute right-[-20px] bottom-[70px] z-25 max-w-[180px] border border-border-color transform -rotate-1 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-growth-green/10 border border-growth-green/20 text-forest-green flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-growth-green" />
                </div>
                <div className="text-left space-y-0.5">
                  <span className="text-[8px] font-black uppercase text-forest-green tracking-wider">Recommendations</span>
                  <p className="text-lg font-black text-deep-green leading-none">28</p>
                  <p className="text-[9px] text-muted-text font-semibold">Quick organic wins</p>
                </div>
              </div>

              <div className="bg-deep-green border border-white/10 text-white rounded-xl px-4 py-2.5 shadow-md absolute left-[-15px] bottom-[15px] z-30 flex items-center gap-2 transform rotate-1">
                <FileText className="w-4 h-4 text-growth-green" />
                <span className="text-[10px] font-bold tracking-wide uppercase">PDF Report Ready</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 mt-2">
              <p className="text-[9px] uppercase tracking-widest font-black text-muted-text mb-3 text-left">Audit Scope Includes</p>
              <div className="grid grid-cols-3 gap-2 text-left">
                {categories.map((cat, idx) => {
                  const Icon = cat.icon
                  return (
                    <div key={idx} className="bg-white/5 rounded-lg p-2 flex items-center gap-2 border border-white/5 hover:bg-white/10 transition-colors duration-200">
                      <Icon className="w-3.5 h-3.5 text-growth-green" />
                      <span className="text-[9px] font-bold text-white tracking-wide truncate">{cat.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Hero