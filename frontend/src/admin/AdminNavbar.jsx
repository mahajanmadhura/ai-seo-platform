import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Search, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminNavbar({ setMobileOpen }) {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/admin':
        return 'Dashboard';
      case '/admin/users':
        return 'User Management';
      case '/admin/audit-logs':
        return 'Credit Activity';
      default:
        return 'Administration';
    }
  };

  const getInitials = () => {
    if (!user) return 'AD';
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'AD';
  };

  return (
    <header className="bg-white border-b border-neutral-100 h-[72px] flex items-center justify-between px-8 sticky top-0 z-40 font-sans">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-1.5 hover:bg-neutral-50 rounded-lg text-neutral-600 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-lg font-black text-neutral-900 tracking-tight pl-1">
          {getPageTitle()}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search platform..."
            disabled
            className="pl-10 pr-4 py-1.8 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold focus:outline-none w-52 opacity-60 cursor-not-allowed"
          />
        </div>

        <button
          disabled
          className="p-1.5 hover:bg-neutral-50 rounded-lg text-neutral-400 hover:text-neutral-600 transition-colors cursor-not-allowed opacity-60"
        >
          <Bell className="w-[18px] h-[18px]" />
        </button>

        <div className="h-6 w-px bg-neutral-200" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-neutral-800 leading-none">
              {user?.first_name || 'Admin'}
            </p>
            <span className="inline-block text-[8px] font-black uppercase tracking-wider bg-neutral-100 text-neutral-500 border border-neutral-200 px-2 py-0.5 rounded-md mt-1.5">
              SUPER ADMIN
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-black text-xs text-neutral-700 select-none">
            {getInitials()}
          </div>
        </div>
      </div>
    </header>
  );
}
