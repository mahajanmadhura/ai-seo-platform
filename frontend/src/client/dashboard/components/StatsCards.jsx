import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import CardMotion from '../../../components/motion/CardMotion';
import AnimatedNumber from '../../../components/motion/AnimatedNumber';

export default function StatsCards({ totalCount, credits, auditsCount, averageScore, loading }) {
  const getScoreStatus = (score) => {
    if (score === null || score === undefined) {
      return { label: 'Pending Audit', color: 'text-neutral-500 bg-neutral-50 border-neutral-200' };
    }
    if (score >= 80) return { label: 'Good Health', color: 'text-[#0B5A4A] bg-[#36E682]/10 border-[#36E682]/20' };
    if (score >= 50) return { label: 'Needs Work', color: 'text-amber-700 bg-amber-500/10 border-amber-500/20' };
    return { label: 'Critical State', color: 'text-brand-burnt-coral bg-brand-burnt-coral/10 border-brand-burnt-coral/20' };
  };

  const scoreStatus = getScoreStatus(averageScore);

  const stats = [
    {
      title: 'Websites Monitored',
      value: totalCount ?? 0,
      desc: 'Increased from last month',
      isPrimary: true,
      textColor: 'text-white',
      descColor: 'text-[#36E682]/85',
      link: '/websites',
    },
    {
      title: 'Credits Remaining',
      value: credits ?? 0,
      desc: 'Analysis credit balance',
      isPrimary: false,
      textColor: 'text-[#053D34]',
      descColor: 'text-[#6D8179]',
      badge: <span className="text-[8px] font-black uppercase text-[#0B5A4A] bg-[#E5F3EC] px-2 py-0.5 rounded border border-[#0A4B43]/10">Quota</span>,
      link: '/settings?tab=billing',
    },
    {
      title: 'Audits Performed',
      value: auditsCount ?? 0,
      desc: 'Website analysis logs',
      isPrimary: false,
      textColor: 'text-[#053D34]',
      descColor: 'text-[#6D8179]',
      link: '/audits',
    },
    {
      title: 'Average SEO Score',
      value: averageScore ?? 0,
      isScore: true,
      desc: 'Quality indicator score',
      isPrimary: false,
      textColor: 'text-[#053D34]',
      descColor: 'text-[#6D8179]',
      badge: (
        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${scoreStatus.color}`}>
          {scoreStatus.label}
        </span>
      ),
      link: '/audits',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 text-left">
      {stats.map((stat, idx) => (
        <CardMotion key={idx} delay={idx * 0.04}>
          <Link
            to={stat.link}
            className={`rounded-[20px] p-4 border shadow-sm flex flex-col justify-between h-[120px] transition-all block ${
              stat.isPrimary
                ? 'bg-gradient-to-br from-[#0A4B43] to-[#053D34] border-[#0A4B43]/10 hover:shadow-md'
                : 'bg-white border-[#053D34]/10 hover:border-[#0B5A4A]/25'
            }`}
          >
            <div className="flex items-center justify-between leading-none">
              <span className={`text-[9px] font-black uppercase tracking-wider ${stat.isPrimary ? 'text-white/70' : 'text-[#6D8179]'}`}>
                {stat.title}
              </span>
              <div className={`p-1 rounded-full border flex items-center justify-center ${
                stat.isPrimary ? 'bg-white/10 border-white/20 text-white' : 'bg-[#EEF5F1] border-[#053D34]/15 text-[#053D34]'
              }`}>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <div className={`text-2xl font-black tracking-tight leading-none ${stat.textColor}`}>
                {loading ? (
                  <span className={`h-7 w-12 rounded animate-pulse block ${stat.isPrimary ? 'bg-white/20' : 'bg-[#EEF5F1]'}`}></span>
                ) : stat.isScore ? (
                  <AnimatedNumber value={stat.value} suffix="%" />
                ) : (
                  <AnimatedNumber value={stat.value} />
                )}
              </div>
              {stat.badge}
            </div>

            <p className={`text-[9px] font-bold leading-none ${stat.descColor}`}>
              {stat.desc}
            </p>
          </Link>
        </CardMotion>
      ))}
    </div>
  );
}
