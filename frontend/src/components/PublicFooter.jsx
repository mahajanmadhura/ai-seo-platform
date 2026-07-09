import React from 'react';
import { Link } from 'react-router-dom';
import LogoWhite from '../assets/White.png';

const PublicFooter = () => {
  return (
    <footer className="public-footer">
      <div className="public-footer-container">
        <div className="space-y-[21px] md:col-span-2 flex flex-col items-start">
          <Link to="/" className="flex items-center">
            <img src={LogoWhite} alt="Athenura" className="h-[44px] w-auto object-contain" />
          </Link>
          <p className="text-muted-text text-sm max-w-sm leading-relaxed">
            AI-powered SEO auditing platform for agencies, freelancers, consultants, and businesses. Turn website audits into client-ready action plans.
          </p>
        </div>

        <div className="space-y-[13px]">
          <h4 className="text-white text-xs font-black uppercase tracking-widest">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-text">
            <li>
              <a href="#features" className="hover:text-growth-green transition-colors">Features</a>
            </li>
            <li>
              <a href="#reports" className="hover:text-growth-green transition-colors">Reports</a>
            </li>
            <li>
              <Link to="/register" className="hover:text-growth-green transition-colors">Run SEO Audit</Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-growth-green transition-colors">Sign In</Link>
            </li>
          </ul>
        </div>

        <div className="space-y-[13px]">
          <h4 className="text-white text-xs font-black uppercase tracking-widest">SEO Capabilities</h4>
          <ul className="space-y-2 text-sm text-muted-text">
            <li>
              <a href="#features" className="hover:text-growth-green transition-colors">Technical SEO</a>
            </li>
            <li>
              <a href="#features" className="hover:text-growth-green transition-colors">On-Page SEO</a>
            </li>
            <li>
              <a href="#features" className="hover:text-growth-green transition-colors">Performance</a>
            </li>
            <li>
              <a href="#features" className="hover:text-growth-green transition-colors">AI Recommendations</a>
            </li>
            <li>
              <a href="#features" className="hover:text-growth-green transition-colors">PDF Reports</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-[34px] pt-[21px] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-text/80 gap-4">
        <p>&copy; 2026 Athenura. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default PublicFooter;
