import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus } from 'lucide-react';

const CTA = () => {
  const navigate = useNavigate();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-20 sm:py-28 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-growth-green/5 rounded-full blur-[140px] -z-10 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto bg-deep-green rounded-[40px] p-8 sm:p-16 md:p-20 text-center relative overflow-hidden shadow-2xl border border-white/10">
        
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(#36E682 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          ></div>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Give every website <br />
            <span className="text-growth-green">a clear SEO growth plan.</span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-muted-text max-w-2xl mx-auto leading-relaxed">
            Start with one audit, find what matters, and generate a report your client can understand.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto pt-4">
            <button
              onClick={handleScrollToTop}
              id="run-audit-cta-btn"
              className="w-full sm:w-auto bg-growth-green text-deep-green px-8 py-4 rounded-full font-black uppercase tracking-wider text-xs hover:bg-growth-green/90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" /> Create Workspace
            </button>
            <button
              onClick={() => navigate('/register')}
              id="create-account-cta-btn"
              className="w-full sm:w-auto bg-transparent border border-white/20 text-white px-8 py-4 rounded-full font-black uppercase tracking-wider text-xs hover:bg-white/5 hover:border-white/45 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Create Free Workspace
            </button>
          </div>

          <p className="text-[10px] text-muted-text font-black uppercase tracking-[0.25em] pt-4">
            Free workspace setup • Credits required for audits
          </p>
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-growth-green/10 blur-[130px] rounded-full -z-10 pointer-events-none"></div>
      </div>
    </section>
  );
};

export default CTA;