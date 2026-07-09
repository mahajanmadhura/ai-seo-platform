import React, { useState } from 'react';
import { Sparkles, Key, AlertCircle, ChevronDown } from 'lucide-react';

export default function QuickAuditBox({ websites, onStartAudit }) {
  const [selectedSite, setSelectedSite] = useState('');
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const activeSites = websites.filter((w) => w.is_verified);
  const selectedWebsiteObj = activeSites.find((s) => s.id === selectedSite);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSite) {
      setError('Please select a domain.');
      return;
    }
    setError('');
    onStartAudit({ website_id: selectedSite, key_word: keyword });
  };

  return (
    <div className="bg-white rounded-[20px] p-4 border border-[#053D34]/10 shadow-sm flex flex-col justify-between h-[280px] text-left">
      <div className="space-y-3 flex flex-col h-full justify-between">
        <div className="flex items-center gap-2 pb-2.5 border-b border-[#053D34]/10 flex-shrink-0">
          <div className="p-1.5 bg-[#EEF5F1] rounded-lg text-brand-primary flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-black text-brand-evergreen text-xs uppercase tracking-wide">Quick Audit</h3>
            <p className="text-[9px] text-brand-secondary font-bold">One-click audit trigger for verified domains.</p>
          </div>
        </div>

        {websites.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-1.5 py-4">
            <div className="p-2 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <AlertCircle className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-brand-secondary font-bold max-w-[160px] leading-normal">
              You must add and verify a domain first.
            </p>
          </div>
        ) : activeSites.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-1.5 py-4">
            <div className="p-2 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Key className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-brand-secondary font-bold max-w-[160px] leading-normal">
              No verified websites. Verify your domain setup to crawl.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2 flex-1 flex flex-col justify-center pt-1.5 relative">
            <div className="space-y-0.5 relative">
              <label className="text-[8px] font-black uppercase text-brand-secondary tracking-wider block">
                Target Website
              </label>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full bg-brand-surface-low border border-[#053D34]/10 p-2 rounded-lg text-xs font-semibold text-brand-evergreen flex items-center justify-between focus:outline-none focus:border-brand-evergreen transition-all cursor-pointer text-left"
                >
                  <span className="truncate">
                    {selectedWebsiteObj ? selectedWebsiteObj.domain : 'Select verified domain...'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#053D34]/60 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="absolute w-full mt-1 bg-white border border-[#053D34]/10 rounded-xl shadow-lg z-30 py-1 max-h-24 overflow-y-auto">
                    {activeSites.map((site) => (
                      <div
                        key={site.id}
                        onClick={() => {
                          setSelectedSite(site.id);
                          setIsOpen(false);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-brand-evergreen hover:bg-[#EEF5F1] cursor-pointer transition-colors"
                      >
                        {site.domain}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-0.5">
              <label className="text-[8px] font-black uppercase text-brand-secondary tracking-wider block">
                Focus Keyword <span className="lowercase font-bold">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. digital agency"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-brand-surface-low border border-[#053D34]/10 p-2 rounded-lg text-xs font-semibold text-brand-evergreen placeholder-brand-secondary/60 focus:outline-none focus:border-brand-evergreen transition-all"
              />
            </div>

            {error && <p className="text-[9px] text-brand-burnt-coral font-bold leading-none">{error}</p>}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 bg-[#053D34] hover:bg-[#36E682] hover:text-[#053D34] text-white py-2.5 rounded-full text-[10px] font-black transition-all shadow-md cursor-pointer uppercase tracking-wider mt-1"
            >
              <Sparkles className="w-3 h-3" /> Start Audit
            </button>
            <span className="text-[7.5px] text-brand-secondary font-black block text-center uppercase tracking-wider mt-0.5 leading-none">
              Cost: 5 credits per audit
            </span>
          </form>
        )}
      </div>
    </div>
  );
}
