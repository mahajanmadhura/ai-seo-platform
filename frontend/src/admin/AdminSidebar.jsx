import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  History,
  LogOut,
  X,
  Eye
} from 'lucide-react';
import LogoWhite from '../assets/White.png';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminSidebar({ mobileOpen, setMobileOpen, handleLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { switchViewMode } = useAuth();
  const { addToast } = useToast();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Credit Activity', path: '/admin/audit-logs', icon: History }
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleSwitchToUserWorkspace = () => {
    setMobileOpen(false);
    switchViewMode('user');
    addToast('Switched to User Workspace — Testing platform as customer', 'success');
    navigate('/dashboard');
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0B0B0B] border-r border-neutral-900 text-neutral-400 font-sans w-[260px]">
      <div className="p-6 border-b border-neutral-900 flex justify-between items-center h-[72px]">
        <Link to="/admin" className="flex items-center group">
          <img
            src={LogoWhite}
            alt="Athenura"
            className="h-10 w-auto object-contain transition-transform"
          />
        </Link>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-white transition-colors md:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-xs font-semibold tracking-wide transition-all ${
                active
                  ? 'bg-white text-black font-black'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Simple, standard bottom section right above Sign Out */}
      <div className="p-4 border-t border-neutral-900 space-y-1">
        <button
          onClick={handleSwitchToUserWorkspace}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-xs font-semibold text-[#36E682] hover:bg-[#36E682]/10 transition-all cursor-pointer text-left"
        >
          <Eye className="w-4 h-4 text-[#36E682]" />
          <span>User Workspace</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[12px] text-xs font-semibold text-red-500 hover:bg-red-950/15 hover:text-red-400 transition-all cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex md:w-[260px] flex-col fixed inset-y-0 left-0 bg-[#0B0B0B] z-30 shadow-lg">
        {renderSidebarContent()}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex-grow max-w-[260px] w-full bg-[#0B0B0B] flex flex-col animate-slide-right">
            {renderSidebarContent()}
          </div>
        </div>
      )}
    </>
  );
}
