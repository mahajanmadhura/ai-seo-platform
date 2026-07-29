import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Globe,
  FileText,
  Cpu,
  Activity,
  LogOut,
  X,
  Eye,
  CreditCard
} from 'lucide-react';
import LogoWhite from '../assets/White.png';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminSidebar({ mobileOpen, setMobileOpen, handleLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { switchViewMode } = useAuth();
  const { addToast } = useToast();

  const sections = [
    {
      title: 'PLATFORM',
      items: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Revenue', path: '/admin/revenue', icon: CreditCard },
      ],
    },
    {
      title: 'CUSTOMERS',
      items: [
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Websites', path: '/admin/websites', icon: Globe },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Audits', path: '/admin/audits', icon: FileText },
        { name: 'System Health', path: '/admin/system', icon: Activity },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [{ name: 'AI Analytics', path: '/admin/ai', icon: Cpu }],
    },
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
    <div className="flex flex-col h-full bg-[#0B0B0B] border-r border-zinc-800 text-zinc-400 font-sans w-[260px]">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-800 flex justify-between items-center h-[72px]">
        <Link to="/admin" className="flex items-center gap-3 group">
          <img
            src={LogoWhite}
            alt="Athenura"
            className="h-9 w-auto object-contain transition-transform"
          />
          <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700">
            Admin
          </span>
        </Link>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors md:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Labeled Section Navigation */}
      <nav className="flex-grow p-4 space-y-6 overflow-y-auto">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1.5">
            <span className="px-3 text-[10px] font-black uppercase tracking-widest text-zinc-600 block">
              {section.title}
            </span>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      active
                        ? 'bg-zinc-100 text-zinc-950 font-bold shadow-xs'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Workspace Switcher & Sign Out */}
      <div className="p-4 border-t border-zinc-800 space-y-1.5">
        <button
          onClick={handleSwitchToUserWorkspace}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-emerald-950/30 transition-all cursor-pointer text-left"
        >
          <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>User Workspace</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/30 transition-all cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4 shrink-0" />
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
            className="fixed inset-0 bg-zinc-950/70 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex-grow max-w-[260px] w-full bg-[#0B0B0B] flex flex-col">
            {renderSidebarContent()}
          </div>
        </div>
      )}
    </>
  );
}
