import React from 'react';
import { DollarSign, Users, Activity, Cpu, Coins, CheckCircle2 } from 'lucide-react';

export default function ReportSelector({ selectedReport, onSelectReport }) {
  const reportCards = [
    {
      id: 'revenue',
      title: 'Revenue',
      subtitle: 'Financial performance',
      icon: DollarSign,
    },
    {
      id: 'customers',
      title: 'Users',
      subtitle: 'Customer analytics',
      icon: Users,
    },
    {
      id: 'audits',
      title: 'Audit Activity',
      subtitle: 'SEO crawling telemetry',
      icon: Activity,
    },
    {
      id: 'ai_usage',
      title: 'AI Usage',
      subtitle: 'AI unit consumption',
      icon: Cpu,
    },
    {
      id: 'credits',
      title: 'Credit Report',
      subtitle: 'Wallet credit balances',
      icon: Coins,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 font-sans text-left">
      {reportCards.map((rc) => {
        const Icon = rc.icon;
        const isSelected = selectedReport === rc.id || (selectedReport === 'users' && rc.id === 'customers');

        return (
          <button
            key={rc.id}
            onClick={() => onSelectReport(rc.id)}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              isSelected
                ? 'bg-zinc-950 text-white border-zinc-950 shadow-md ring-2 ring-zinc-950/10'
                : 'bg-white text-zinc-950 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`p-2 rounded-lg ${
                  isSelected ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>

            <div>
              <h3 className={`text-xs font-black ${isSelected ? 'text-white' : 'text-zinc-950'}`}>
                {rc.title}
              </h3>
              <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {rc.subtitle}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
