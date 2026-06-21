import React from 'react'
import { Search, UserPlus } from 'lucide-react'

const CTA = () => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="py-16 sm:py-24 md:py-32 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#84FF00]/5 rounded-full blur-[140px] -z-10 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto glass rounded-[32px] sm:rounded-[60px] p-8 sm:p-16 md:p-20 text-center relative overflow-hidden shadow-2xl border border-white/10">
        {/* Grid Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(#84FF00 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Ready to turn SEO issues <br />
            <span className="text-[#84FF00]">into a clear growth plan?</span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Start with a website audit, find the most important problems, and generate a professional action report.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto pt-4">
            <button
              onClick={handleScrollToTop}
              id="run-audit-cta-btn"
              className="w-full sm:w-auto bg-[#84FF00] text-black px-8 py-4 rounded-full font-bold hover:bg-[#a3ff47] hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_20px_rgba(132,255,0,0.3)] hover:shadow-[0_0_30px_rgba(132,255,0,0.5)] cursor-pointer text-sm flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" /> Run Your First Audit
            </button>
            <button
              id="create-account-cta-btn"
              className="w-full sm:w-auto bg-transparent border border-white/20 text-white px-8 py-4 rounded-full font-bold hover:bg-white/5 hover:border-white/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer text-sm flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Create Free Account
            </button>
          </div>

          <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em] pt-4">
            No credit card required • Instant results
          </p>
        </div>

        {/* Glowing Ambient Light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[#84FF00]/10 blur-[130px] rounded-full -z-10 pointer-events-none"></div>
      </div>
    </section>
  )
}

export default CTA