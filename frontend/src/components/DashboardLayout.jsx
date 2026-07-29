import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Globe,
  Search,
  FileText,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronLeft,
  Shield
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import LogoWhite from '../assets/White.png';
import AddWebsiteModal from '../client/websites/components/AddWebsiteModal';
import DashboardFooter from './DashboardFooter';
import PageTransition from './motion/PageTransition';

export default function DashboardLayout({ children, title, cta, backLink }) {
  const { user, logoutUser, credits, refreshCredits, switchViewMode } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    refreshCredits();
  }, [location.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      setIsAddModalOpen(true);
    }
  }, [location.search]);

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      navigate(location.pathname, { replace: true });
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const coreNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, enabled: true },
    { name: 'Websites', path: '/websites', icon: Globe, enabled: true },
    { name: 'Audits', path: '/audits', icon: Search, enabled: true },
    { name: 'Reports', path: '/reports', icon: FileText, enabled: true },
  ];

  const getInitials = () => {
    if (!user) return 'US';
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';
  };

  const isPathActive = (path) => {
    if (path === '#') return false;
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0A4B43] text-left text-[#E5F3EC]">
      <div className="p-6 border-b border-[#083D36]">
        <Link to="/dashboard" className="block group">
          <img
            src={LogoWhite}
            alt="Athenura"
            className="h-9 w-auto brightness-0 invert object-contain group-hover:scale-[1.02] transition-transform duration-200"
          />
        </Link>
      </div>

      <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
        {coreNavItems.map((item) => {
          const active = isPathActive(item.path);
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <div
                key={item.name}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl text-[#E5F3EC]/30 cursor-not-allowed text-xs font-semibold"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[8px] font-black uppercase bg-black/20 border border-white/5 text-[#E5F3EC]/40 px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all relative ${active
                ? 'bg-[#083D36] text-white shadow-sm'
                : 'text-[#E5F3EC]/70 hover:text-white hover:bg-[#083D36]/40'
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#083D36] space-y-1">
        {(user?.is_staff || user?.is_superuser || user?.role === 'ADMIN' || user?.role === 'admin') && (
          <button
            onClick={() => {
              setMobileOpen(false);
              switchViewMode('admin');
              addToast('Returned to Admin Panel — Administrative tools active', 'success');
              navigate('/admin');
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold text-[#36E682] hover:bg-[#083D36] hover:text-[#36E682] transition-all cursor-pointer text-left"
          >
            <Shield className="w-4 h-4 text-[#36E682]" />
            <span>Admin Panel</span>
          </button>
        )}
        <Link
          to="/settings"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all relative ${isPathActive('/settings')
            ? 'bg-[#083D36] text-white shadow-sm'
            : 'text-[#E5F3EC]/70 hover:text-white hover:bg-[#083D36]/40'
            }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold text-red-300 hover:bg-[#083D36] hover:text-white transition-all cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#EEF5F1] text-deep-green flex">
      <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 left-0 bg-[#0A4B43] border-r border-border-color/60 z-30 shadow-lg">
        {renderSidebarContent()}
      </aside>

      <div className="flex-grow md:pl-64 flex flex-col min-w-0">
        <header className="bg-white/95 backdrop-blur-md border-b border-border-color/60 h-[72px] flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 hover:bg-soft-bg rounded-lg text-deep-green transition-colors cursor-cursor"
            >
              <Menu className="w-5 h-5" />
            </button>
            {backLink ? (
              <Link
                to={backLink}
                className="text-xs font-bold text-muted-text hover:text-deep-green transition-colors inline-flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </Link>
            ) : (
              <h1 className="text-base md:text-lg font-black tracking-tight text-deep-green uppercase">
                {title || 'Dashboard'}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-3.5">
            <Link
              to="/settings?tab=billing"
              className="flex items-center gap-1.5 bg-[#E5F3EC] border border-deep-green/10 text-[#053D34] px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm hover:bg-[#36E682] hover:text-[#053D34] transition-all group"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#36E682] group-hover:text-[#053D34] transition-colors" />
              <span>{credits ?? 0} Credits</span>
            </Link>

            <div className="h-6 w-px bg-border-color/60 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <Link
                to="/settings"
                className="w-9 h-9 rounded-full bg-[#E5F3EC] text-[#053D34] border border-deep-green/15 flex items-center justify-center font-black text-xs hover:bg-[#36E682] hover:text-[#053D34] transition-all shadow-sm"
                title="Profile Settings"
              >
                {getInitials()}
              </Link>
            </div>
          </div>
        </header>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-[#053D34]/35 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative flex-grow max-w-xs w-full bg-[#0A4B43] flex flex-col animate-slide-right">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-[#083D36] rounded-lg text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              {renderSidebarContent()}
            </div>
          </div>
        )}

        <main className="p-6 md:p-8 space-y-8 flex-grow">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        <DashboardFooter />
      </div>

      <AddWebsiteModal isOpen={isAddModalOpen} onClose={handleCloseModal} />
    </div>
  );
}
