import React from 'react'
import { Search, AlertCircle, Sparkles, Check, CheckCircle2, FileText, Smartphone, Gauge, Shield, Link2, Monitor } from 'lucide-react'

const Hero = () => {
  const trustPoints = [
    'No monthly commitment',
    'Agency-ready reports',
    'AI recommendations',
    'Technical + on-page audit',
  ]

  const scores = [
    { label: 'Technical SEO', score: 78, icon: Monitor, color: 'text-blue-500' },
    { label: 'On-Page SEO', score: 86, icon: FileText, color: 'text-emerald-500' },
    { label: 'Performance', score: 72, icon: Gauge, color: 'text-yellow-500' },
    { label: 'Mobile SEO', score: 90, icon: Smartphone, color: 'text-purple-500' },
    { label: 'Security', score: 95, icon: Shield, color: 'text-cyan-500' },
    { label: 'Link Analysis', score: 81, icon: Link2, color: 'text-[#84FF00]' },
  ]

  return (
    <header className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 px-6 max-w-7xl mx-auto overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-[#84FF00]/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Column: Copy & Form */}
        <div className="space-y-8 text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#84FF00]/20 bg-[#84FF00]/5 text-[#84FF00] text-xs font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-[#84FF00] animate-pulse"></span>
            AI SEO Precision Lab
          </div>

          {/* Headline & Subheadline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-white">
              AI SEO audits that turn website issues into client-ready action plans.
            </h1>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed">
              Analyze technical SEO, on-page signals, performance, mobile readiness, security, and links. Get AI-powered recommendations and professional reports in minutes.
            </p>
          </div>

          {/* Analyzer Widget */}
          <div className="space-y-4">
            <div className="relative max-w-md group">
              <div className="absolute -inset-0.5 bg-[#84FF00] rounded-full blur opacity-15 group-hover:opacity-20 transition-all duration-300"></div>
              <div className="relative flex bg-[#0c0f0f] border border-white/10 rounded-full overflow-hidden p-1.5 focus-within:border-[#84FF00]/40 focus-within:ring-2 focus-within:ring-[#84FF00]/5 transition-all duration-300">
                <input
                  type="text"
                  placeholder="Enter website URL"
                  className="bg-transparent border-none focus:ring-0 text-white flex-1 px-4 py-3 outline-none text-sm font-medium placeholder-gray-600"
                />
                <button
                  id="hero-analyze-btn"
                  className="bg-[#84FF00] text-black px-6 py-3 rounded-full font-bold hover:bg-[#a3ff47] hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(132,255,0,0.3)] cursor-pointer text-sm flex-shrink-0"
                >
                  Run SEO Audit
                </button>
              </div>
            </div>

            {/* CTAs Secondary Row */}
            <div className="flex items-center gap-4">
              <button
                className="text-xs font-bold text-[#84FF00] hover:text-white transition-colors duration-200 border-b border-[#84FF00]/30 hover:border-white pb-0.5"
                onClick={() => window.open('#reports', '_self')}
              >
                View Sample Report &rarr;
              </button>
            </div>
          </div>

          {/* Trust Points */}
          <div className="grid grid-cols-2 gap-y-3 sm:flex sm:items-center sm:gap-x-6 gap-x-4 pt-2">
            {trustPoints.map((point, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <CheckCircle2 className="w-4 h-4 text-[#84FF00]" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Visualization Card */}
        <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
          <div className="absolute -bottom-10 -left-10 w-[350px] h-[350px] bg-[#84FF00]/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

          {/* Dashboard Card */}
          <div className="warm-glass rounded-[40px] p-6 sm:p-8 text-black min-h-[480px] relative z-10 overflow-hidden shadow-2xl border border-white/20">
            {/* Header info */}
            <div className="flex items-center justify-between mb-6 border-b border-black/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Search className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-none">Domain Analysis</p>
                  <p className="text-sm font-extrabold text-black">stellar-studio.co</p>
                </div>
              </div>
              <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Audit Ready
              </div>
            </div>

            {/* Score Grid & Overall Score */}
            <div className="flex flex-col sm:flex-row gap-6 mb-6">
              {/* Overall */}
              <div className="bg-black text-white rounded-3xl p-6 flex flex-col justify-between sm:w-[40%] text-left relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Sparkles className="w-8 h-8 text-[#84FF00]" />
                </div>
                <p className="text-[9px] uppercase tracking-widest font-black text-gray-500 mb-4">Overall Score</p>
                <div>
                  <h3 className="text-5xl font-black text-[#84FF00]">84</h3>
                  <p className="text-xs text-gray-400 font-bold mt-1">/100 points</p>
                </div>
              </div>

              {/* Six Dimensions */}
              <div className="flex-1 grid grid-cols-2 gap-3 text-left">
                {scores.map((stat, idx) => {
                  const Icon = stat.icon
                  return (
                    <div key={idx} className="bg-black/5 rounded-2xl p-3.5 border border-black/5 flex items-center justify-between hover:bg-black/10 transition-colors">
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 font-bold leading-none">{stat.label}</p>
                        <span className="text-base font-black text-black">{stat.score}</span>
                      </div>
                      <Icon className={`w-4 h-4 ${stat.color} opacity-80`} />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Issues Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-red-500 w-4 h-4" />
                  <span className="text-xs sm:text-sm font-bold text-gray-800">12 Critical Issues found</span>
                </div>
                <span className="text-[10px] font-black uppercase text-red-500">Fix Immediately</span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-yellow-500 w-4 h-4" />
                  <span className="text-xs sm:text-sm font-bold text-gray-700">28 Recommendations</span>
                </div>
                <span className="text-[10px] font-black uppercase text-yellow-600">Quick Wins</span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2">
                  <Check className="text-green-600 w-4 h-4" />
                  <span className="text-xs sm:text-sm font-bold text-gray-600">PDF Report Ready</span>
                </div>
                <span className="text-[10px] bg-black text-[#84FF00] px-2 py-0.5 rounded font-black uppercase tracking-wider">
                  Download
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Hero