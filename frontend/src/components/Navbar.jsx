import React, { useState } from 'react'
import { Zap, Menu, X } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav
      className={`fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl z-50 glass px-6 py-3 transition-all duration-300 ease-in-out ${isOpen ? 'rounded-[32px] py-5' : 'rounded-full'
        } shadow-2xl`}
    >
      <div className="flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#84FF00] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(132,255,0,0.5)]">
            <Zap className="text-black w-4.5 h-4.5 fill-black" />
          </div>
          <span className="font-bold text-lg tracking-tight uppercase text-white">
            SEO ECOSYSTEM
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a
            href="#features"
            id="nav-features-link"
            className="hover:text-[#84FF00] transition-colors duration-200"
          >
            Features
          </a>
          <a
            href="#reports"
            id="nav-reports-link"
            className="hover:text-[#84FF00] transition-colors duration-200"
          >
            Reports
          </a>
          <a
            href="#pricing"
            id="nav-pricing-link"
            className="hover:text-[#84FF00] transition-colors duration-200"
          >
            Pricing
          </a>
          <a
            href="#how-it-works"
            id="nav-how-link"
            className="hover:text-[#84FF00] transition-colors duration-200"
          >
            How It Works
          </a>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4 ml-10">
          <a
            href="#"
            id="nav-signin-btn"
            className="text-sm font-medium hover:text-white transition-colors duration-200"
          >
            Sign In
          </a>
          <button
            id="cta-run-audit-nav"
            className="bg-[#84FF00] text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#a3ff47] hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(132,255,0,0.4)] hover:shadow-[0_0_25px_rgba(132,255,0,0.6)] cursor-pointer"
          >
            Run Free Audit
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-400 hover:text-white p-1 focus:outline-none transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? (
            <X className="text-2xl w-6 h-6" />
          ) : (
            <Menu className="text-2xl w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Links Overlay/Dropdown */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${isOpen ? 'max-h-72 opacity-100 mt-5 pt-5 border-t border-white/10' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="flex flex-col gap-4 text-sm font-medium text-gray-400 px-2 pb-2">
          <a
            href="#features"
            onClick={() => setIsOpen(false)}
            className="hover:text-[#84FF00] py-1.5 transition-colors duration-200"
          >
            Features
          </a>
          <a
            href="#reports"
            onClick={() => setIsOpen(false)}
            className="hover:text-[#84FF00] py-1.5 transition-colors duration-200"
          >
            Reports
          </a>
          <a
            href="#pricing"
            onClick={() => setIsOpen(false)}
            className="hover:text-[#84FF00] py-1.5 transition-colors duration-200"
          >
            Pricing
          </a>
          <a
            href="#how-it-works"
            onClick={() => setIsOpen(false)}
            className="hover:text-[#84FF00] py-1.5 transition-colors duration-200"
          >
            How It Works
          </a>

          <div className="h-px bg-white/5 my-2"></div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <a
              href="#"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium hover:text-white transition-colors duration-200"
            >
              Sign In
            </a>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-[#84FF00] text-black px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#a3ff47] transition-all duration-200 shadow-[0_0_15px_rgba(132,255,0,0.4)] cursor-pointer"
            >
              Run Free Audit
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar