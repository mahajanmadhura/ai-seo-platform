import React from 'react'
import { Layout, Download, Check, Sparkles, AlertTriangle, ShieldCheck, Gauge, Smartphone } from 'lucide-react'

const Reports = () => {
  const previewSections = [
    'Executive Summary',
    'Overall SEO Score',
    'Performance Score',
    'Mobile Score',
    'Security Score',
    'Critical Issues',
    'AI Recommendations',
    'Detailed Analysis',
    'Page-by-page Breakdown',
    'Appendix with full issue list',
  ]

  return (
    <section id="reports" className="py-16 sm:py-24 px-6 max-w-7xl mx-auto text-center relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#84FF00]/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Description, Checklist & Button */}
        <div className="lg:col-span-5 space-y-8 text-left">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Professional SEO reports your clients can understand
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Export clear, structured audit reports with scores, issues, recommendations, and page-level details.
            </p>
          </div>

          {/* Checklist of Preview Sections */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-2">
            {previewSections.map((section, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                <Check className="w-4 h-4 text-[#84FF00] flex-shrink-0" />
                <span>{section}</span>
              </div>
            ))}
          </div>

          {/* Button & Mention */}
          <div className="space-y-3 pt-2">
            <button
              id="download-report-btn"
              className="bg-[#84FF00] text-black px-8 py-4 rounded-full font-bold hover:bg-[#a3ff47] hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl cursor-pointer text-sm inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Sample Report
            </button>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider pl-2">
              * White-label options for agencies and consultants.
            </p>
          </div>
        </div>

        {/* Right Column: PDF Report Visual Preview */}
        <div className="lg:col-span-7 relative w-full max-w-xl mx-auto lg:max-w-none">
          {/* Card Ambient Glow */}
          <div className="absolute -inset-2 bg-gradient-to-r from-[#84FF00]/5 to-[#84FF00]/10 rounded-[32px] blur-2xl -z-10 pointer-events-none"></div>

          {/* PDF Visual Card */}
          <div className="warm-glass rounded-[32px] p-6 sm:p-10 text-black shadow-2xl relative z-10 border border-white/20 text-left flex flex-col justify-between min-h-[500px]">
            {/* Header / Brand */}
            <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <Layout className="text-white w-4.5 h-4.5" />
                </div>
                <span className="font-extrabold text-sm text-black uppercase tracking-tight">Audit Report Preview</span>
              </div>
              <p className="text-xs text-gray-400 font-bold">PDF Format Ready</p>
            </div>

            {/* Executive Summary */}
            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Executive Summary</h4>
                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                  We conducted a technical crawl of <strong>stellar-studio.co</strong>. While mobile and security setups are strong, critical issues in performance speed and on-page descriptions are currently lowering organic search visibility.
                </p>
              </div>

              {/* Scores Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-black/5 rounded-2xl p-3 border border-black/5 text-center">
                  <p className="text-[9px] uppercase font-black text-gray-400 leading-none mb-2">Overall</p>
                  <span className="text-xl sm:text-2xl font-black text-black">84%</span>
                </div>
                <div className="bg-black/5 rounded-2xl p-3 border border-black/5 text-center">
                  <p className="text-[9px] uppercase font-black text-gray-400 leading-none mb-2">Speed</p>
                  <span className="text-xl sm:text-2xl font-black text-black">72%</span>
                </div>
                <div className="bg-black/5 rounded-2xl p-3 border border-black/5 text-center">
                  <p className="text-[9px] uppercase font-black text-gray-400 leading-none mb-2">Mobile</p>
                  <span className="text-xl sm:text-2xl font-black text-black">90%</span>
                </div>
                <div className="bg-black/5 rounded-2xl p-3 border border-black/5 text-center">
                  <p className="text-[9px] uppercase font-black text-gray-400 leading-none mb-2">Security</p>
                  <span className="text-xl sm:text-2xl font-black text-black">95%</span>
                </div>
              </div>

              {/* Critical Issues & AI Recommendation Box */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-700 rounded-xl text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>Critical: Slow Server Response and Missing Metas</span>
                </div>

                <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-2 shadow-inner">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 fill-amber-500/20" />
                    <span>AI Recommendation Preview</span>
                  </div>
                  <p className="text-xs text-gray-600 italic leading-relaxed">
                    "Compress main hero images to WebP and defer unused scripts on landing viewports to improve speed score to A."
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Sign-off */}
            <div className="mt-8 pt-4 border-t border-black/10 flex items-center justify-between text-[10px] font-bold text-gray-400">
              <p>Page 1 of 12 • Detailed Analysis Included</p>
              <p>SEO ECOSYSTEM ENGINE</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Reports
