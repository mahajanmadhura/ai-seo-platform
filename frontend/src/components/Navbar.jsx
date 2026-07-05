import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Menu, X, LogOut, LayoutDashboard, Settings as SettingsIcon } from 'lucide-react';
import LogoWhite from '../assets/White.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsOpen(false);
    await logoutUser();
    navigate('/login');
  };

  const handleScrollToSection = (e, id) => {
    e.preventDefault();
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/#${id}`);
    }
  };

  return (
    <nav
      className={`fixed top-5 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-50 transition-all duration-300 ease-in-out px-6 py-3 rounded-[28px] ${isOpen
          ? 'bg-white border border-border-color shadow-2xl'
          : 'bg-white/90 backdrop-blur-md border border-border-color/50 shadow-[0_4px_30px_rgba(5,61,52,0.03)]'
        }`}
    >
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center group">
          <img src={LogoWhite} alt="Athenura" className="h-9 sm:h-8 w-auto logo-brand-color group-hover:scale-[1.02] transition-transform duration-200" />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-muted-text">
          <a
            href="#features"
            onClick={(e) => handleScrollToSection(e, 'features')}
            className="hover:text-deep-green transition-colors duration-200"
          >
            Features
          </a>
          <a
            href="#reports"
            onClick={(e) => handleScrollToSection(e, 'reports')}
            className="hover:text-deep-green transition-colors duration-200"
          >
            Reports
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => handleScrollToSection(e, 'how-it-works')}
            className="hover:text-deep-green transition-colors duration-200"
          >
            How It Works
          </a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                id="nav-dashboard-link"
                className="text-xs font-bold uppercase tracking-wider text-deep-green hover:text-forest-green transition-colors duration-200 flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link
                to="/settings"
                id="nav-settings-link"
                className="text-xs font-bold uppercase tracking-wider text-deep-green hover:text-forest-green transition-colors duration-200 flex items-center gap-1.5"
              >
                <SettingsIcon className="w-4 h-4" /> Settings
              </Link>
              <button
                onClick={handleLogout}
                id="nav-signout-btn"
                className="text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700 transition-colors duration-200 flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                id="nav-signin-btn"
                className="text-xs font-bold uppercase tracking-wider text-deep-green hover:text-forest-green transition-colors duration-200"
              >
                Sign In
              </Link>
              <button
                onClick={() => navigate('/register')}
                id="cta-run-audit-nav"
                className="bg-deep-green text-white px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider hover:bg-forest-green hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_14px_rgba(5,61,52,0.12)] cursor-pointer"
              >
                Start SEO Audit
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-deep-green hover:text-forest-green p-1 focus:outline-none transition-colors w-8 h-8 relative cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`absolute h-0.5 w-5.5 bg-current rounded-full transition-all duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'
                }`}
            />
            <span
              className={`absolute h-0.5 w-5.5 bg-current rounded-full transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0 scale-x-0' : 'opacity-100'
                }`}
            />
            <span
              className={`absolute h-0.5 w-5.5 bg-current rounded-full transition-all duration-300 ease-in-out ${isOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'
                }`}
            />
          </div>
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 350ms cubic-bezier(0.16, 1, 0.3, 1), opacity 350ms ease',
        }}
        className={`md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div className="overflow-hidden">
          <div className="pt-4 mt-4 border-t border-border-color">
            <div className="flex flex-col gap-4 text-xs font-bold uppercase tracking-wider text-muted-text px-2 pb-2">
              <a
                href="#features"
                onClick={(e) => handleScrollToSection(e, 'features')}
                className="hover:text-deep-green py-1.5 transition-colors duration-200"
              >
                Features
              </a>
              <a
                href="#reports"
                onClick={(e) => handleScrollToSection(e, 'reports')}
                className="hover:text-deep-green py-1.5 transition-colors duration-200"
              >
                Reports
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => handleScrollToSection(e, 'how-it-works')}
                className="hover:text-deep-green py-1.5 transition-colors duration-200"
              >
                How It Works
              </a>

              <div className="h-px bg-border-color my-1"></div>

              <div className="flex flex-col gap-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="hover:text-deep-green py-1.5 transition-colors duration-200 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsOpen(false)}
                      className="hover:text-deep-green py-1.5 transition-colors duration-200 flex items-center gap-2"
                    >
                      <SettingsIcon className="w-4 h-4" /> Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-left text-red-600 hover:text-red-700 py-1.5 transition-colors duration-200 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-between gap-4 pt-1">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="text-xs font-bold uppercase tracking-wider text-deep-green hover:text-forest-green transition-colors"
                    >
                      Sign In
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/register');
                      }}
                      className="bg-deep-green text-white px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider hover:bg-forest-green hover:scale-105 transition-all duration-200 shadow-md cursor-pointer"
                    >
                      Start SEO Audit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

  );
};

export default Navbar;