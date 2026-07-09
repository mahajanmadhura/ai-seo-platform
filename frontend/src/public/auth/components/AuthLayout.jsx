import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowLeft, Mail, Lock, CheckCircle, Shield, User, Sparkles, AlertCircle } from 'lucide-react';
import LogoWhite from '../../../assets/White.png';

const AuthLayout = ({ pageType = 'login', title, subtitle, error, success, children, footerLink, backLink = '/', backText = 'Back to Home' }) => {
  const contentMap = {
    login: {
      title: 'Welcome back to your SEO workspace.',
      text: 'Access audits, reports, website health insights, and AI recommendations from one focused dashboard.',
      visual: (
        <div className="space-y-4 w-full max-w-[280px] mx-auto animate-levitate">
          <div className="bg-white border border-border-color p-4 rounded-2xl shadow-sm text-left">
            <span className="text-[9px] font-black uppercase text-muted-text tracking-widest block mb-1">Overall SEO Score</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-deep-green">84</span>
              <span className="text-xs font-bold text-muted-text">/100</span>
            </div>
          </div>
          <div className="bg-[#E8F7EF] border border-border-color p-4 rounded-2xl shadow-sm text-left flex justify-between items-center">
            <span className="text-xs font-black text-deep-green uppercase tracking-wide">PDF Report Ready</span>
            <CheckCircle className="w-4 h-4 text-deep-green" />
          </div>
          <div className="bg-white border border-border-color p-4 rounded-2xl shadow-sm text-left">
            <span className="text-[9px] font-black uppercase text-muted-text tracking-widest block mb-1">Active Insights</span>
            <span className="text-xs font-black text-deep-green">28 Recommendations</span>
          </div>
        </div>
      )
    },
    register: {
      title: 'Start your SEO audit workspace.',
      text: 'Create your account to run audits, track website health, get AI recommendations, and prepare professional client-ready reports.',
      visual: (
        <div className="grid grid-cols-2 gap-3 w-full max-w-[280px] mx-auto animate-levitate">
          <div className="bg-white p-3.5 rounded-xl border border-border-color shadow-sm text-left">
            <p className="text-[8px] text-muted-text font-black uppercase tracking-widest leading-none mb-1">Technical SEO</p>
            <span className="text-xs font-black text-deep-green">Audit Ready</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-border-color shadow-sm text-left">
            <p className="text-[8px] text-muted-text font-black uppercase tracking-widest leading-none mb-1">On-Page SEO</p>
            <span className="text-xs font-black text-deep-green">Fully Scanned</span>
          </div>
          <div className="bg-[#E8F7EF] p-3.5 rounded-xl border border-border-color shadow-sm text-left col-span-2">
            <p className="text-[8px] text-deep-green font-black uppercase tracking-widest leading-none mb-1">AI Fixes</p>
            <span className="text-xs font-black text-deep-green">28 Priorities</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-border-color shadow-sm text-left col-span-2">
            <p className="text-[8px] text-muted-text font-black uppercase tracking-widest leading-none mb-1">Reports</p>
            <span className="text-xs font-black text-deep-green">PDF Reports</span>
          </div>
        </div>
      )
    },
    forgotPassword: {
      title: 'Recover access securely.',
      text: 'Enter your email and return safely to your SEO ecosystem.',
      visual: (
        <div className="bg-white border border-border-color p-5 rounded-2xl shadow-sm w-full max-w-[280px] mx-auto space-y-3.5 text-left animate-levitate">
          <div className="w-10 h-10 bg-[#E8F7EF] border border-border-color rounded-xl flex items-center justify-center text-deep-green">
            <Mail className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black text-deep-green">Secure recovery email</p>
            <p className="text-[10px] text-muted-text">Verification ready</p>
          </div>
        </div>
      )
    },
    resetPassword: {
      title: 'Create a stronger password.',
      text: 'Protect your reports, audit history, client data, and profile access.',
      visual: (
        <div className="bg-white border border-border-color p-5 rounded-2xl shadow-sm w-full max-w-[280px] mx-auto space-y-3.5 text-left animate-levitate">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-muted-text uppercase tracking-wider block">Password strength</span>
            <div className="h-1.5 w-full bg-[#E8F7EF] rounded-full overflow-hidden">
              <div className="h-full bg-deep-green rounded-full" style={{ width: '85%' }} />
            </div>
          </div>
          <div className="pt-2 flex items-center gap-2 text-xs font-black text-deep-green">
            <Shield className="w-4 h-4" />
            <span>Secure access</span>
          </div>
        </div>
      )
    },
    verifyEmail: {
      title: 'Verify your email.',
      text: 'Email verification protects your account before accessing audits and reports.',
      visual: (
        <div className="bg-white border border-border-color p-5 rounded-2xl shadow-sm w-full max-w-[280px] mx-auto text-center space-y-3.5 animate-levitate">
          <div className="w-12 h-12 bg-[#E8F7EF] border border-border-color rounded-full flex items-center justify-center mx-auto text-deep-green">
            <CheckCircle className="w-6 h-6 text-deep-green" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black text-deep-green">Verification email sent</p>
            <p className="text-[10px] text-muted-text">Open Gmail to continue</p>
          </div>
        </div>
      )
    },
    changePassword: {
      title: 'Keep your SEO workspace protected.',
      text: 'Update your password regularly to protect audit reports and account access.',
      visual: (
        <div className="bg-white border border-border-color p-5 rounded-2xl shadow-sm w-full max-w-[280px] mx-auto text-left space-y-3 animate-levitate">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#E8F7EF] text-deep-green rounded-lg border border-border-color">
              <Shield className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-black text-deep-green">Security updated</p>
              <p className="text-[10px] text-muted-text">Current & New Password</p>
            </div>
          </div>
        </div>
      )
    },
    profile: {
      title: 'Manage your SEO ecosystem profile.',
      text: 'Keep your account details updated for reports, branding, and workflows.',
      visual: (
        <div className="bg-white border border-border-color p-5 rounded-2xl shadow-sm w-full max-w-[280px] mx-auto text-left space-y-3.5 animate-levitate">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-deep-green text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
              <User className="w-4 h-4 text-growth-green" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-black text-deep-green">Profile details</p>
              <p className="text-[10px] text-muted-text">Account status: Active</p>
            </div>
          </div>
        </div>
      )
    }
  };

  const { title: leftTitle, text: leftText, visual: leftVisual } = contentMap[pageType] || contentMap.login;

  return (
    <div className="min-h-screen w-full bg-[#F3FAF6] flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-[32px] border border-border-color shadow-2xl overflow-hidden grid md:grid-cols-12">
        <section className="hidden md:flex md:col-span-5 bg-gradient-to-br from-[#053D34] to-[#0B5A4A] text-white flex-col justify-between p-8 lg:p-10 relative overflow-hidden min-h-full">
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#36E682 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="flex flex-col h-full justify-between gap-[34px]">
            <div className="space-y-[34px]">
              <Link to="/" className="flex items-center relative z-10 group">
                <img src={LogoWhite} alt="Athenura" className="h-[44px] w-auto object-contain group-hover:scale-[1.02] transition-transform" />
              </Link>
              <div className="space-y-[13px] text-left">
                <h2 className="text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight">
                  {leftTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#E8F7EF]/75 font-medium leading-relaxed">
                  {leftText}
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-center py-[21px] my-auto">
              {leftVisual}
            </div>

            <div className="relative z-10 text-left mt-auto">
              <p className="text-growth-green font-black text-xs uppercase tracking-widest">Natural Precision</p>
            </div>
          </div>
        </section>

        <div className="col-span-12 md:col-span-7 flex flex-col justify-between p-6 sm:p-8 lg:p-12 bg-[#FFFDF8] text-deep-green min-h-full border-l border-border-color">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Link to={backLink} className="text-xs font-bold text-muted-text hover:text-deep-green transition-colors inline-flex items-center gap-1.5 border-b border-transparent hover:border-deep-green pb-0.5 animate-fade-in">
                <ArrowLeft className="w-3.5 h-3.5" /> {backText}
              </Link>
              <div className="flex md:hidden items-center">
                <Link to="/">
                  <img src={LogoWhite} alt="Athenura" className="h-[34px] w-auto logo-brand-color object-contain" />
                </Link>
              </div>
            </div>

            {(title || subtitle) && (
              <div className="text-left space-y-1">
                {title && <h2 className="text-xl font-black text-deep-green tracking-tight">{title}</h2>}
                {subtitle && <p className="text-xs text-muted-text font-medium">{subtitle}</p>}
              </div>
            )}

            {error && (
              <div className="bg-red-500/5 border border-red-500/15 text-red-700 p-4 rounded-xl text-xs font-bold text-center leading-relaxed flex items-center justify-center gap-2 animate-pulse">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-growth-green/10 border border-growth-green/25 text-deep-green p-4 rounded-xl text-xs font-black text-center leading-relaxed flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 text-growth-green" />
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-6">
              {children}
            </div>
          </div>

          {footerLink && (
            <div className="text-center text-xs text-muted-text font-bold pt-8 mt-8 border-t border-border-color">
              {footerLink}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
