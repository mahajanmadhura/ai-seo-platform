import React, { useState, useEffect } from 'react';
import { Coins, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getCreditTransactions } from '../../../services/payments';
import { Link } from 'react-router-dom';

export default function CreditUsageChart() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      const res = await getCreditTransactions();
      if (res.success && res.data) {
        setTransactions(res.data);
      }
      setLoading(false);
    };
    fetchTransactions();
  }, []);

  const totalUsed = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const getDaysData = () => {
    const days = [];
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const defaultHeights = [75, 80, 70, 95, 20, 90, 20];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const wDayIdx = d.getDay();
      days.push({
        date: d,
        label: weekdays[wDayIdx],
        amount: 0,
        defaultHeight: defaultHeights[6 - i]
      });
    }

    transactions.forEach((tx) => {
      if (tx.amount < 0) {
        const txDate = new Date(tx.created_at);
        const dayMatch = days.find((day) => day.date.toDateString() === txDate.toDateString());
        if (dayMatch) {
          dayMatch.amount += Math.abs(tx.amount);
        }
      }
    });

    return days;
  };

  const daysData = getDaysData();
  const maxAmt = Math.max(...daysData.map((d) => d.amount)) || 0;

  const highestDayIndex = maxAmt > 0
    ? daysData.findIndex((d) => d.amount === maxAmt)
    : -1;

  const getBarStyle = (day) => {
    if (day.amount > 0) {
      const maxCapacity = Math.max(maxAmt, 25);
      const ratio = Math.min(1, Math.max(0.05, day.amount / maxCapacity));
      const heightPercent = ratio * 75 + 15;
      
      // Dynamic continuous solid color from very light green (82% lightness) to darkest deep green (13% lightness)
      const hue = 145 + ratio * 23;
      const saturation = 70 + ratio * 15;
      const lightness = 82 - ratio * 69;

      return {
        height: `${heightPercent}%`,
        backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
        borderColor: `hsl(${hue}, ${saturation}%, ${Math.max(10, lightness - 10)}%)`,
        isUsed: true
      };
    }
    return {
      height: `${day.defaultHeight}%`,
      isUsed: false
    };
  };

  return (
    <div className="bg-white rounded-[20px] p-4 border border-[#053D34]/10 shadow-sm flex flex-col justify-between h-[300px] text-left">
      <div className="space-y-3 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#053D34]/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#EEF5F1] rounded-lg text-brand-primary flex-shrink-0">
              <Coins className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-black text-brand-evergreen text-xs uppercase tracking-wide">Credit Usage</h3>
              <p className="text-[9px] text-brand-secondary font-bold">Bar chart of credit consumption logs.</p>
            </div>
          </div>
          <Link to="/billing" className="text-[9px] font-black uppercase tracking-wider text-brand-primary hover:text-brand-electric-sprout transition-colors">
            Ledger
          </Link>
        </div>

        {loading ? (
          <div className="h-44 bg-soft-bg rounded-xl animate-pulse my-3 flex-1"></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1 flex-1 items-stretch">

            {/* Chart Area */}
            <div className="md:col-span-7 flex flex-col justify-between border-r border-[#053D34]/10 pr-3 min-h-[140px]">
              <div className="flex items-end justify-between h-[126px] gap-1.5 px-0.5 pb-1 relative pt-7">
                {daysData.map((day, idx) => {
                  const barStyle = getBarStyle(day);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full relative group">

                      {/* Interactive pointer tooltip on hover */}
                      <div
                        style={{ bottom: `calc(${barStyle.height} + 4px)` }}
                        className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <div className="bg-[#E5F3EC] border border-[#36E682]/40 text-[#0B5A4A] text-[7.5px] font-black px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap leading-none">
                          {day.amount > 0 ? `-${day.amount} cr` : '0 cr'}
                        </div>
                        <div className="w-[1px] h-1.5 bg-[#36E682]/70"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#36E682] border border-white -mt-0.5 shadow-sm"></div>
                      </div>

                      {/* Rounded Bar Pill with 400ms synchronized height & color transition */}
                      {!barStyle.isUsed ? (
                        <div
                          style={{
                            height: barStyle.height,
                            background: 'repeating-linear-gradient(135deg, #F4FAF7, #F4FAF7 4px, #CBE0D5 4px, #CBE0D5 8px)'
                          }}
                          className="w-5 rounded-full border border-[#CBE0D5]/50 transition-all duration-500 ease-out cursor-default"
                        />
                      ) : (
                        <div
                          style={{
                            height: barStyle.height,
                            backgroundColor: barStyle.backgroundColor,
                            borderColor: barStyle.borderColor
                          }}
                          className="w-5 rounded-full border transition-all duration-500 ease-out hover:opacity-90 cursor-pointer shadow-xs"
                        />
                      )}

                      <span className="text-[7.5px] text-brand-secondary font-black block mt-1.5 leading-none">
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="text-[7.5px] text-brand-secondary font-black text-center border-t border-[#053D34]/10 pt-1.5 uppercase tracking-wider flex-shrink-0 mt-1">
                Daily Deductions
              </div>
            </div>

            {/* Premium Ledger Panel (inspired by Time Tracker dark wavy style) */}
            <div className="md:col-span-5 flex flex-col justify-between pl-1 min-h-[140px]">
              <div className="space-y-2">
                <span className="text-[8px] font-black uppercase text-[#6D8179] tracking-wider block">Usage Tracker</span>

                <div className="bg-gradient-to-br from-[#0A4B43] to-[#053D34] text-white p-2.5 rounded-xl border border-white/5 relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[64px]">
                  <div
                    className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(#36E682 1px, transparent 1px)',
                      backgroundSize: '12px 12px',
                    }}
                  />
                  <div className="relative z-10 space-y-0.5">
                    <span className="text-[7.5px] font-black uppercase text-[#36E682]/85 tracking-widest block leading-none">
                      Total Credits Spent
                    </span>
                    <span className="text-xl font-black tracking-tight leading-none block pt-0.5">
                      {totalUsed} cr
                    </span>
                  </div>
                </div>
                <div className="space-y-1 mt-1.5 flex-grow flex flex-col justify-end">
                  <span className="text-[8px] font-black uppercase text-[#6D8179] tracking-wider block">Latest Activity</span>
                  {transactions.slice(0, 2).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between text-[8px] font-bold text-brand-evergreen bg-brand-surface-low p-1.5 rounded-lg border border-[#053D34]/5 leading-none">
                      <div className="flex items-center gap-1 min-w-0">
                        {tx.amount > 0 ? (
                          <ArrowUpRight className="w-2.5 h-2.5 text-brand-primary flex-shrink-0" />
                        ) : (
                          <ArrowDownRight className="w-2.5 h-2.5 text-brand-burnt-coral flex-shrink-0" />
                        )}
                        <span className="truncate max-w-[55px] block">{tx.description || 'Audit Scan'}</span>
                      </div>
                      <span className={tx.amount > 0 ? 'text-[#0B5A4A] font-black flex-shrink-0' : 'text-brand-burnt-coral font-black flex-shrink-0'}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
