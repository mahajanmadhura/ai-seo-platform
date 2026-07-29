import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, X, Users, Activity, Cpu, ShieldCheck, ChevronRight, Sparkles, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminNavbar({ setMobileOpen }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef(null);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/admin':
      case '/admin/dashboard':
        return 'Operations Dashboard';
      case '/admin/revenue':
        return 'Revenue & Credit Purchases';
      case '/admin/users':
        return 'Customer Account Intelligence';
      case '/admin/websites':
        return 'Monitored Domains';
      case '/admin/audits':
        return 'Audit Execution Telemetry';
      case '/admin/ai':
        return 'Groq AI Model Telemetry';
      case '/admin/system':
        return 'Cluster System Health';
      default:
        return 'Platform Administration';
    }
  };

  const getInitials = () => {
    if (!user) return 'AD';
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'AD';
  };

  const quickLinks = [
    { label: 'Revenue & Customer Purchases', path: '/admin/revenue', icon: CreditCard, tag: 'Revenue' },
    { label: 'Customer Intelligence & Accounts', path: '/admin/users', icon: Users, tag: 'Users' },
    { label: 'Audit Telemetry & Dispatches', path: '/admin/audits', icon: Activity, tag: 'Audits' },
    { label: 'Groq LLM Tokens & Costs', path: '/admin/ai', icon: Cpu, tag: 'AI' },
    { label: 'System Health & Worker Cluster', path: '/admin/system', icon: ShieldCheck, tag: 'Cluster' },
  ];

  const filteredLinks = quickLinks.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close search dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsFocused(false);
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('admin-global-search')?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectLink = (path) => {
    navigate(path);
    setIsFocused(false);
    setSearchQuery('');
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-zinc-200 h-[64px] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 font-sans shadow-2xs">
      
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-sm sm:text-base font-black text-zinc-950 tracking-tight truncate">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Center/Right: Functional Global Search & Profile */}
      <div className="flex items-center gap-3 sm:gap-5" ref={dropdownRef}>
        
        {/* Working Global Search Box with Command Palette */}
        <div className="relative font-sans">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            <input
              id="admin-global-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Search platform..."
              className="w-40 sm:w-64 pl-8 pr-12 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all shadow-2xs"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-0.5 text-zinc-400 hover:text-zinc-950 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block absolute right-2.5 px-1.5 py-0.5 text-[9px] font-mono text-zinc-400 bg-white border border-zinc-200 rounded shadow-2xs pointer-events-none">
                ⌘K
              </kbd>
            )}
          </div>

          {/* Working Search Autocomplete Dropdown */}
          {isFocused && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl border border-zinc-200 shadow-xl overflow-hidden z-50 text-left space-y-1 p-2 font-sans">
              <div className="px-2 py-1 flex items-center justify-between border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                <span>Quick Navigation</span>
                <span className="text-zinc-500 font-mono">⌘K</span>
              </div>

              {filteredLinks.length > 0 ? (
                filteredLinks.map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectLink(item.path)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-100/80 transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 bg-zinc-100 rounded-lg text-zinc-900 group-hover:bg-zinc-950 group-hover:text-white transition-colors shrink-0">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-zinc-900 truncate">
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>
                  );
                })
              ) : (
                <div className="p-3 text-center text-xs text-zinc-400 font-medium">
                  No matching module found
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-zinc-200 hidden sm:block" />

        {/* Super Admin User Profile Pill */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-zinc-950 leading-none">
              {user?.first_name || 'Administrator'}
            </p>
            <span className="inline-block text-[8.5px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200 px-1.5 py-0.5 rounded mt-1">
              SUPER ADMIN
            </span>
          </div>

          <div className="w-8 h-8 rounded-full bg-zinc-950 text-white font-black text-xs flex items-center justify-center border border-zinc-800 shadow-2xs select-none">
            {getInitials()}
          </div>
        </div>

      </div>
    </header>
  );
}
