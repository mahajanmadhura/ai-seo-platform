import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, CheckCircle, Zap, AlertTriangle, Info, HelpCircle } from 'lucide-react';

export default function AIConsultingInsights({ recommendation, generatingAI, handleGenerateAI }) {
  const [loadingText, setLoadingText] = useState('Analyzing crawl...');

  useEffect(() => {
    let interval = null;
    if (generatingAI) {
      const phrases = [
        'Understanding audit context',
        'Prioritizing SEO fixes',
        'Composing recommendations',
        'Preparing client-ready insights'
      ];
      let idx = 0;
      setLoadingText(phrases[0]);
      interval = setInterval(() => {
        idx = (idx + 1) % phrases.length;
        setLoadingText(phrases[idx]);
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [generatingAI]);

  const renderActionItems = (input) => {
    if (!input) return null;

    let planLines = [];
    if (Array.isArray(input)) {
      planLines = input;
    } else if (typeof input === 'string') {
      try {
        const cleanJsonStr = input.replace(/'/g, '"');
        const parsedObj = JSON.parse(cleanJsonStr);
        if (parsedObj && Array.isArray(parsedObj['step-by-step_plan'])) {
          planLines = parsedObj['step-by-step_plan'];
        } else if (parsedObj && Array.isArray(parsedObj.recommendations)) {
          planLines = parsedObj.recommendations;
        } else if (Array.isArray(parsedObj)) {
          planLines = parsedObj;
        } else {
          planLines = input.split('\n');
        }
      } catch (_) {
        planLines = input.split('\n');
      }
    }

    if (!planLines || planLines.length === 0) {
      planLines = [];
    }

    const lines = planLines
      .map(line => String(line).trim())
      .filter(line => {
        if (line.length === 0) return false;
        if (line.endsWith(':')) return false;
        if (/follow these steps|do the following|here is the|here are the|to address these|below are/i.test(line)) return false;
        return true;
      });

    return (
      <div className="space-y-3 mt-3">
        {lines.map((line, index) => {
          const cleanLine = line.replace(/^[0-9]+[\.\u3002]\s*|^[-\*\u2022]\s*/, '');

          let impactTag = 'High Impact';
          let tagColor = 'bg-brand-burnt-coral/10 text-brand-burnt-coral border-brand-burnt-coral/20';
          if (index === 1) {
            impactTag = 'Medium Impact';
            tagColor = 'bg-amber-500/10 text-amber-700 border-amber-500/20';
          } else if (index >= 2) {
            impactTag = 'Standard Fix';
            tagColor = 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
          }

          return (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-surface-low border border-outline-variant p-4 rounded-xl hover:border-brand-evergreen/20 hover:bg-white transition-all shadow-sm">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-brand-evergreen text-white text-[11px] font-black flex items-center justify-center flex-shrink-0 shadow-sm self-start mt-0.5">
                  {index + 1}
                </span>
                <span className="text-xs text-brand-evergreen font-medium leading-relaxed pt-0.5">{cleanLine}</span>
              </div>
              <span className={`inline-flex self-start sm:self-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${tagColor} whitespace-nowrap`}>
                {impactTag}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (generatingAI) {
    return (
      <div className="bg-brand-surface rounded-[24px] border border-outline p-10 shadow-sm flex flex-col items-center justify-center space-y-6 min-h-[260px] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-surface-high/30 rounded-full blur-[80px] pointer-events-none animate-[aurora-glow_8s_infinite_alternate_ease-in-out]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-electric-sprout/5 rounded-full blur-[60px] pointer-events-none animate-[aurora-glow_6s_infinite_alternate-reverse_ease-in-out]"></div>

        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 border border-brand-electric-sprout/20 rounded-full animate-[ring-expand-1_3s_infinite_ease-out]"></div>
          <div className="absolute inset-0 border border-brand-primary/10 rounded-full animate-[ring-expand-2_3s_infinite_ease-out_1s]"></div>
          <div className="absolute inset-0 border border-brand-surface-high/30 rounded-full animate-[ring-expand-3_3s_infinite_ease-out_2s]"></div>

          <div className="absolute w-1.5 h-1.5 rounded-full bg-brand-electric-sprout/70 top-2 left-6 animate-[float-particle_2.5s_infinite_ease-out]"></div>
          <div className="absolute w-1 h-1 rounded-full bg-white top-8 right-4 animate-[float-particle_2.2s_infinite_ease-out_0.7s]"></div>
          <div className="absolute w-2 h-2 rounded-full bg-brand-surface-high/80 bottom-4 left-4 animate-[float-particle_2.8s_infinite_ease-out_1.3s]"></div>
          <div className="absolute w-1 h-1 rounded-full bg-brand-electric-sprout/60 bottom-2 right-8 animate-[float-particle_2.4s_infinite_ease-out_1.9s]"></div>

          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-evergreen via-brand-primary to-brand-electric-sprout p-[2.5px] shadow-[0_0_20px_rgba(54,230,130,0.25)] animate-[aura-pulse_3s_infinite_ease-in-out] relative z-10 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-primary animate-pulse" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-1 z-10">
          <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest animate-pulse">
            {loadingText}
          </p>
          <span className="text-[9px] text-brand-secondary font-black uppercase tracking-wider block opacity-70">
            Intelligence core active
          </span>
        </div>

        <style>{`
          @keyframes aurora-glow {
            0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 0.6; }
            50% { transform: translate(-45%, -55%) scale(1.15) rotate(120deg); opacity: 0.8; }
            100% { transform: translate(-50%, -50%) scale(1) rotate(360deg); opacity: 0.6; }
          }
          @keyframes aura-pulse {
            0% { transform: scale(1); box-shadow: 0 0 15px rgba(54,230,130,0.3), 0 0 30px rgba(5,61,52,0.15); }
            50% { transform: scale(1.08); box-shadow: 0 0 25px rgba(54,230,130,0.5), 0 0 45px rgba(11, 90, 74, 0.3); }
            100% { transform: scale(1); box-shadow: 0 0 15px rgba(54,230,130,0.3), 0 0 30px rgba(5, 61, 52, 0.15); }
          }
          @keyframes ring-expand-1 {
            0% { transform: scale(0.6); opacity: 0; }
            20% { opacity: 0.8; }
            100% { transform: scale(2); opacity: 0; }
          }
          @keyframes ring-expand-2 {
            0% { transform: scale(0.5); opacity: 0; }
            25% { opacity: 0.6; }
            100% { transform: scale(2.3); opacity: 0; }
          }
          @keyframes ring-expand-3 {
            0% { transform: scale(0.4); opacity: 0; }
            30% { opacity: 0.4; }
            100% { transform: scale(2.6); opacity: 0; }
          }
          @keyframes float-particle {
            0% { transform: translateY(20px) scale(0.7); opacity: 0; }
            40% { opacity: 0.9; }
            100% { transform: translateY(-40px) scale(1.2); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="bg-brand-surface rounded-[24px] border border-outline p-6 shadow-sm text-left relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-electric-sprout/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline/40 pb-5 mb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-surface-high border border-outline flex items-center justify-center text-brand-evergreen">
              <Sparkles className="w-4.5 h-4.5 text-brand-primary animate-pulse" />
            </div>
            <h3 className="text-sm font-black text-brand-evergreen uppercase tracking-wider">AI SEO Recommendations</h3>
          </div>
          <p className="text-[11px] text-brand-secondary font-bold">Prioritized suggestions based on your audit results.</p>
        </div>

        {recommendation && (
          <div className="flex items-center gap-3 self-start sm:self-center">
            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-sm ${recommendation.priority === 'High'
                ? 'bg-brand-burnt-coral/10 text-brand-burnt-coral border-brand-burnt-coral/25'
                : recommendation.priority === 'Medium'
                  ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                  : 'bg-green-500/10 text-green-700 border-green-500/20'
              }`}>
              {recommendation.priority} Priority
            </span>
            <button
              onClick={() => handleGenerateAI(true)}
              className="inline-flex items-center gap-1.5 bg-brand-surface-high hover:bg-brand-evergreen/10 text-brand-evergreen border border-outline px-3 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer shadow-sm uppercase tracking-wider"
            >
              <RefreshCw className="w-3 h-3" />
              Regenerate
            </button>
          </div>
        )}
      </div>

      {recommendation ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">

            {/* Card 1: AI SEO Score (1 Column) */}
            <div className="bg-gradient-to-br from-brand-evergreen to-[#053D34] text-white p-5 rounded-[24px] border border-white/5 flex flex-col justify-between shadow-md relative overflow-hidden min-h-[180px]">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-black uppercase tracking-wider text-brand-electric-sprout">AI Health Rating</span>
                <Sparkles className="w-4.5 h-4.5 text-brand-primary animate-pulse" />
              </div>
              <div className="my-auto flex items-center gap-4">
                <span className="text-4xl font-black tracking-tight">{recommendation.seo_score !== undefined && recommendation.seo_score !== null ? `${recommendation.seo_score}%` : '70%'}</span>
                <div className="text-[10px] text-[#E5F3EC]/80 font-semibold leading-relaxed">
                  Calculated by intelligence based on your critical crawling issues.
                </div>
              </div>
              <span className="text-[9px] font-black uppercase text-brand-electric-sprout tracking-wide">SEO Quality Index</span>
            </div>

            {/* Card 2: Priority & Impact (1 Column) */}
            <div className="bg-white p-5 rounded-[24px] border border-outline flex flex-col justify-between shadow-sm min-h-[180px]">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-black uppercase tracking-wider text-brand-secondary">Priority Level</span>
                <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase border shadow-sm ${recommendation.priority === 'High'
                    ? 'bg-brand-burnt-coral/10 text-brand-burnt-coral border-brand-burnt-coral/25'
                    : recommendation.priority === 'Medium'
                      ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                      : 'bg-green-500/10 text-green-700 border-green-500/20'
                  }`}>
                  {recommendation.priority}
                </span>
              </div>
              <div className="my-3">
                <p className="text-xs text-brand-evergreen font-bold leading-snug">
                  {recommendation.impact}
                </p>
              </div>
              <span className="text-[9px] font-black uppercase text-brand-secondary tracking-wide">Business & Traffic Impact</span>
            </div>

            {/* Card 3: Quick Wins (1 Column) */}
            <div className="bg-white p-5 rounded-[24px] border border-outline flex flex-col justify-between shadow-sm min-h-[180px]">
              <div className="flex justify-between items-start pb-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-brand-secondary">Quick Fixes</span>
                <Zap className="w-4 h-4 text-brand-primary" />
              </div>
              <div className="flex flex-wrap gap-1.5 my-2">
                {recommendation.quick_wins && recommendation.quick_wins.length > 0 ? (
                  recommendation.quick_wins.slice(0, 3).map((win, idx) => (
                    <span key={idx} className="text-[9px] text-brand-evergreen font-bold bg-[#36E682]/10 border border-[#36E682]/20 px-2.5 py-1 rounded-lg">
                      {win}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-brand-secondary font-bold">No simple quick wins detected.</span>
                )}
              </div>
              <span className="text-[9px] font-black uppercase text-brand-secondary tracking-wide">Under 15 min tasks</span>
            </div>

            {/* Card 4: What's happening? (2 Columns) */}
            <div className="bg-white p-6 rounded-[24px] border border-outline shadow-sm md:col-span-2 flex flex-col justify-between min-h-[180px]">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-brand-secondary block mb-2">Executive Summary</span>
                <p className="text-xs text-brand-evergreen leading-relaxed font-semibold border-l-2 border-brand-primary pl-3.5 py-1">
                  {recommendation.summary}
                </p>
              </div>
              <span className="text-[9px] font-black uppercase text-brand-secondary tracking-wide mt-4">Crawl Analysis Overview</span>
            </div>

            {/* Card 5: Client-Friendly Explanation (1 Column) */}
            <div className="bg-[#E5F3EC]/50 p-6 rounded-[24px] border border-brand-primary/20 flex flex-col justify-between min-h-[180px]">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-brand-secondary block mb-2">Client Analogy</span>
                <p className="text-[11px] text-brand-evergreen leading-relaxed font-bold italic">
                  "{recommendation.client_friendly_explanation}"
                </p>
              </div>
              <span className="text-[9px] font-black uppercase text-[#0B5A4A] tracking-wide mt-4">Jargon-Free explanation</span>
            </div>

            {/* Card 6: What to fix next (3 Columns - Full Width) */}
            <div className="bg-white p-6 rounded-[24px] border border-outline shadow-sm lg:col-span-3 space-y-4">
              <div className="flex items-center gap-1.5 border-b border-outline/40 pb-3">
                <Zap className="w-4 h-4 text-brand-primary" />
                <h4 className="text-xs font-black text-brand-evergreen uppercase tracking-wide">Primary Implementation Roadmap</h4>
              </div>
              {renderActionItems(recommendation.recommended_fix)}
            </div>

          </div>
        </div>
      ) : (
        <div className="text-center py-12 space-y-5 max-w-sm mx-auto">
          <div className="w-12 h-12 rounded-full bg-brand-surface-high border border-outline flex items-center justify-center text-brand-evergreen mx-auto shadow-sm">
            <Sparkles className="w-5 h-5 text-brand-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-brand-evergreen uppercase tracking-wider">No AI recommendations yet</h3>
            <p className="text-xs text-brand-secondary font-bold leading-relaxed">
              Generate SEO suggestions from this audit’s issues, pages, and scores.
            </p>
          </div>
          <button
            onClick={() => handleGenerateAI(false)}
            className="inline-flex items-center gap-2 bg-brand-evergreen hover:bg-brand-electric-sprout text-white hover:text-brand-evergreen px-6 py-3.5 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer uppercase tracking-wider mt-1"
          >
            <Sparkles className="w-4 h-4" /> Generate AI Recommendations
          </button>
        </div>
      )}
    </div>
  );
}
