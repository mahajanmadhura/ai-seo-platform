import React from 'react'
import { FileText, Settings, Gauge, Smartphone, Shield, Link, Sparkles, FileDown } from 'lucide-react'

const Feature = () => {
  const features = [
    {
      title: 'On-Page SEO Analysis',
      description: 'Check title tags, meta descriptions, headings, image alt text, URL structure, canonical tags, and internal links.',
      icon: FileText,
    },
    {
      title: 'Technical SEO Checks',
      description: 'Detect robots.txt, sitemap, crawlability, indexability, redirects, broken pages, structured data, and hreflang issues.',
      icon: Settings,
    },
    {
      title: 'Performance Insights',
      description: 'Review speed-related signals such as response time, page weight, and Core Web Vitals-ready metrics.',
      icon: Gauge,
    },
    {
      title: 'Mobile SEO',
      description: 'Check viewport setup, mobile readiness, tap targets, and readability indicators.',
      icon: Smartphone,
    },
    {
      title: 'Security Analysis',
      description: 'Analyze HTTPS usage, SSL status, security headers, and mixed-content risks.',
      icon: Shield,
    },
    {
      title: 'Link Analysis',
      description: 'Review internal links, external links, broken links, redirects, nofollow, sponsored, and UGC attributes.',
      icon: Link,
    },
    {
      title: 'AI Recommendations',
      description: 'Convert raw audit issues into prioritized, actionable optimization steps.',
      icon: Sparkles,
    },
    {
      title: 'PDF Reports',
      description: 'Generate professional reports that can be shared with clients.',
      icon: FileDown,
    },
  ]

  return (
    <section id="features" className="py-16 sm:py-24 px-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
          Full-Spectrum Lab Tools
        </h2>
        <p className="text-gray-500 text-sm sm:text-base">
          Our audit engine scans over 300 data points to find growth opportunities others miss.
        </p>
      </div>

      {/* Grid of 8 Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon
          return (
            <div
              key={idx}
              className="glass group hover:border-[#84FF00]/30 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 rounded-[24px] cursor-pointer relative overflow-hidden flex flex-col justify-between text-left h-[260px] sm:h-[280px]"
            >
              <div className="space-y-4">
                {/* Icon Wrapper */}
                <div className="w-11 h-11 rounded-lg bg-[#84FF00]/10 flex items-center justify-center text-[#84FF00] group-hover:bg-[#84FF00]/20 transition-all duration-300 group-hover:scale-105">
                  <Icon className="w-5 h-5" />
                </div>
                
                {/* Content */}
                <div className="space-y-2">
                  <h3 className="font-extrabold text-white text-base leading-snug group-hover:text-[#84FF00] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-4">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default Feature
