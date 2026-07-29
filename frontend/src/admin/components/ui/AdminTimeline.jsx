import React from 'react';
import { CreditCard, CheckCircle2, UserPlus, LifeBuoy, ShieldAlert, DollarSign, Activity } from 'lucide-react';

export default function AdminTimeline({ events = [] }) {
  if (!events || events.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-zinc-400 font-medium">
        No operational timeline events recorded
      </div>
    );
  }

  const getEventBadge = (type) => {
    switch (type) {
      case 'payment_received':
        return { icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      case 'audit_completed':
        return { icon: CheckCircle2, color: 'text-zinc-950 bg-zinc-100 border-zinc-200' };
      case 'user_registered':
        return { icon: UserPlus, color: 'text-blue-600 bg-blue-50 border-blue-200' };
      case 'support_ticket':
        return { icon: LifeBuoy, color: 'text-amber-600 bg-amber-50 border-amber-200' };
      default:
        return { icon: Activity, color: 'text-zinc-700 bg-zinc-50 border-zinc-200' };
    }
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="relative pl-6 space-y-6 text-left font-sans before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
      {events.map((evt, idx) => {
        const badge = getEventBadge(evt.type);
        const Icon = badge.icon;

        return (
          <div key={idx} className="relative flex items-start gap-3 text-xs">
            {/* Timeline node */}
            <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center bg-white ${badge.color}`}>
              <Icon className="w-3 h-3" />
            </div>

            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-950">{evt.title}</span>
                <span className="text-[11px] font-mono text-zinc-400">{formatRelativeTime(evt.timestamp)}</span>
              </div>
              <p className="text-zinc-500 font-medium text-[11px]">{evt.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
