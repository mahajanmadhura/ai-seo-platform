import React from 'react';
import { Link } from 'react-router-dom';
import LogoWhite from '../assets/White.png';

const DashboardFooter = () => {
  return (
    <footer className="dashboard-footer">
      <div className="dashboard-footer-container">
        <div className="space-y-2 text-left">
          <div className="flex items-center">
            <img src={LogoWhite} alt="Athenura" className="h-7 w-auto logo-brand-color object-contain" />
            <span className="text-xs font-black uppercase tracking-wider text-deep-green">Workspace</span>
          </div>
          <p className="text-muted-text text-xs max-w-md leading-relaxed">
            Manage websites, verification, audits, and reports from one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs font-bold uppercase tracking-wider text-muted-text">
          <Link to="/dashboard" className="hover:text-deep-green transition-colors">
            Dashboard
          </Link>
          <Link to="/websites" className="hover:text-deep-green transition-colors">
            Websites
          </Link>
          <Link to="/profile" className="hover:text-deep-green transition-colors">
            Profile
          </Link>
          <Link to="/change-password" className="hover:text-deep-green transition-colors">
            Security
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
