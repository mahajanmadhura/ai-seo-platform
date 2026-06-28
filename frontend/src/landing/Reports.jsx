import React from 'react'
import { Layout, Download, AlertTriangle, Sparkles, CheckCircle, FileText } from 'lucide-react'

const Reports = () => {
  const previewSections = [
    'White-label agency logo header',
    'Executive analysis summary',
    'Prioritized task checkboard',
    'Page speed audit benchmarks',
    'Mobile friendliness metrics',
    'Detailed link outline list',
  ]

  return (
    <section id="reports" className="py-20 sm:py-28 px-6 bg-deep-green text-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-growth-green/5 rounded-full blur-[140px] -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-5 space-y-8 text-left">
          <div className="space-y-4">
            <p className="text-growth-green text-[10px] font-black uppercase tracking-[0.25em]">Report Generator</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Professional SEO reports your clients can understand
            </h2>
            <p className="text-muted-text text-sm sm:text-base leading-relaxed">
              Export clear, white-labeled, structured audit reports with scores, issues, recommendations, and page-level details. Build trust with clean reports that look custom-built for your clients.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 pt-2">
            {previewSections.map((section, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs font-bold text-white/90">
                <CheckCircle className="w-4.5 h-4.5 text-growth-green flex-shrink-0" />
                <span>{section}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-2">
            <button
              id="download-report-btn"
              className="bg-growth-green text-deep-green px-8 py-4 rounded-full font-black uppercase tracking-wider text-xs hover:bg-growth-green/90 active:scale-95 transition-all duration-200 shadow-lg cursor-pointer inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Sample Report
            </button>
            <p className="text-[10px] text-muted-text font-black uppercase tracking-[0.2em] pl-1">
              * White-label options available for agencies and consultants.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 relative w-full max-w-xl mx-auto lg:max-w-none">
          <div className="absolute -inset-2 bg-gradient-to-r from-growth-green/5 to-growth-green/10 rounded-[32px] blur-2xl -z-10 pointer-events-none"></div>

          <div className="bg-card-white rounded-[32px] p-6 sm:p-10 text-deep-green shadow-2xl relative z-10 border border-white/10 text-left flex flex-col justify-between min-h-[520px]">
            
            <div className="flex items-center justify-between border-b border-deep-green/10 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-deep-green rounded-lg flex items-center justify-center">
                  <Layout className="text-growth-green w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <span className="font-black text-xs text-deep-green uppercase tracking-tight block">SEO Audit Report</span>
                  <span className="text-[9px] text-muted-text font-bold uppercase tracking-wider leading-none">stellar-studio.co</span>
                </div>
              </div>
              <p className="text-[10px] bg-deep-green/5 border border-deep-green/10 text-deep-green px-2.5 py-0.5 rounded font-black uppercase tracking-wider">PDF Format</p>
            </div>

            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-text">Executive Summary</h4>
                <p className="text-xs sm:text-sm text-deep-green/90 leading-relaxed">
                  We conducted a technical crawl of <strong>stellar-studio.co</strong>. While mobile and security setups are strong, critical issues in performance speed and on-page descriptions are currently lowering organic search visibility.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="bg-mint-surface border border-deep-green/10 rounded-2xl p-3 text-center">
                  <p className="text-[8px] uppercase font-black text-muted-text leading-none mb-1.5">Overall</p>
                  <span className="text-lg sm:text-xl font-black text-deep-green">84%</span>
                </div>
                <div className="bg-mint-surface border border-deep-green/10 rounded-2xl p-3 text-center">
                  <p className="text-[8px] uppercase font-black text-muted-text leading-none mb-1.5">Speed</p>
                  <span className="text-lg sm:text-xl font-black text-deep-green">72%</span>
                </div>
                <div className="bg-mint-surface border border-deep-green/10 rounded-2xl p-3 text-center">
                  <p className="text-[8px] uppercase font-black text-muted-text leading-none mb-1.5">Mobile</p>
                  <span className="text-lg sm:text-xl font-black text-deep-green">90%</span>
                </div>
                <div className="bg-mint-surface border border-deep-green/10 rounded-2xl p-3 text-center">
                  <p className="text-[8px] uppercase font-black text-muted-text leading-none mb-1.5">Security</p>
                  <span className="text-lg sm:text-xl font-black text-deep-green">95%</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 p-3.5 bg-red-500/5 border border-red-500/15 text-red-700 rounded-xl text-xs font-bold">
                  <AlertTriangle className="w-4.5 h-4.5 text-red-500 flex-shrink-0" />
                  <span>Critical: Slow Server Response and Missing Metas</span>
                </div>

                <div className="p-4 bg-mint-surface border border-deep-green/10 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-deep-green uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-growth-green fill-growth-green/10" />
                    <span>AI Recommendation Preview</span>
                  </div>
                  <p className="text-xs text-muted-text italic leading-relaxed">
                    "Compress main hero images to WebP and defer unused scripts on landing viewports to improve speed score to A."
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-deep-green/10 flex items-center justify-between text-[8px] font-black text-muted-text uppercase tracking-widest">
              <p>Page 1 of 12 • Detailed Analysis</p>
              <p>SEO ECOSYSTEM ENGINE</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Reports
