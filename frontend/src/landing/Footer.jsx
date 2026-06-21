import React from 'react'
import { Zap } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-[#040606] border-t border-white/5 py-12 sm:py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
        {/* Brand & Description */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#84FF00] rounded-lg flex items-center justify-center">
              <Zap className="text-black w-4 h-4 fill-black" />
            </div>
            <span className="font-bold text-white text-base tracking-tight uppercase">
              SEO ECOSYSTEM
            </span>
          </div>
          <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
            AI-powered SEO auditing platform for agencies, freelancers, consultants, and businesses. Turn website audits into client-ready action plans.
          </p>
        </div>

        {/* Product Navigation */}
        <div className="space-y-4">
          <h4 className="text-white text-xs font-black uppercase tracking-widest">Platform</h4>
          <ul className="space-y-2.5 text-sm text-gray-500">
            <li>
              <a href="#features" className="hover:text-[#84FF00] transition-colors">Features</a>
            </li>
            <li>
              <a href="#reports" className="hover:text-[#84FF00] transition-colors">Reports</a>
            </li>
            <li>
              <a href="#" className="hover:text-[#84FF00] transition-colors">Dashboard</a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-[#84FF00] transition-colors">Pricing</a>
            </li>
            <li>
              <a href="#" className="hover:text-[#84FF00] transition-colors">Login</a>
            </li>
          </ul>
        </div>

        {/* SEO Categories */}
        <div className="space-y-4">
          <h4 className="text-white text-xs font-black uppercase tracking-widest">SEO Capabilities</h4>
          <ul className="space-y-2.5 text-sm text-gray-500">
            <li>
              <a href="#features" className="hover:text-[#84FF00] transition-colors">On-Page SEO</a>
            </li>
            <li>
              <a href="#features" className="hover:text-[#84FF00] transition-colors">Technical SEO</a>
            </li>
            <li>
              <a href="#features" className="hover:text-[#84FF00] transition-colors">AI Recommendations</a>
            </li>
            <li>
              <a href="#reports" className="hover:text-[#84FF00] transition-colors">PDF Reports</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom info */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 gap-4">
        <p>&copy; {new Date().getFullYear()} SEO ECOSYSTEM. All rights reserved.</p>
        <p>Built for search visibility and organic intelligence.</p>
      </div>
    </footer>
  )
}

export default Footer
