import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, CreditCard, Shield, Globe, Terminal, Download, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';

export default function AdminQuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (actionName, route) => {
    setIsOpen(false);
    if (route) {
      navigate(route);
    } else {
      addToast(`Action triggered: ${actionName}`, 'info');
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-950 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
      >
        <span>Quick Actions</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl bg-white border border-zinc-200 shadow-xl z-50 divide-y divide-zinc-100 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-1.5 space-y-0.5">
            <button
              onClick={() => handleAction('Adjust Credits', '/admin/users')}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer text-left"
            >
              <CreditCard className="w-4 h-4 text-zinc-600" />
              <span>Adjust User Credits</span>
            </button>
            <button
              onClick={() => handleAction('Promote User', '/admin/users')}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer text-left"
            >
              <Shield className="w-4 h-4 text-zinc-600" />
              <span>Promote / Edit Role</span>
            </button>
            <button
              onClick={() => handleAction('Verify Website', '/admin/websites')}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer text-left"
            >
              <Globe className="w-4 h-4 text-zinc-600" />
              <span>Verify Website</span>
            </button>
          </div>

          <div className="p-1.5 space-y-0.5">
            <button
              onClick={() => handleAction('View System Logs', '/admin/system')}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer text-left"
            >
              <Terminal className="w-4 h-4 text-zinc-600" />
              <span>View System Logs</span>
            </button>
            <button
              onClick={() => handleAction('Export Data')}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer text-left"
            >
              <Download className="w-4 h-4 text-zinc-600" />
              <span>Export Telemetry</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
