import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  BarChart3,
  Coins,
  Activity,
  ShieldCheck,
  ChevronRight,
  LogOut
} from 'lucide-react';

export default function AdminWelcome() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user && !user.is_staff) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const previewCards = [
    {
      title: 'User Management',
      icon: Users,
      description: 'Manage users, view credit balances, and perform manual adjustments.',
      bullets: ['Manage user statuses', 'View credit balances', 'Adjust user credits'],
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      description: 'Track platform performance, credit sales, and user registrations.',
      bullets: ['Revenue overview', 'User growth timelines', 'Platform usage metrics'],
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
    },
    {
      title: 'Credit Activity',
      icon: Coins,
      description: 'Monitor transaction flows, deductions, and administrative operations.',
      bullets: ['Payment history', 'Audit deductions tracking', 'Admin adjustment logs'],
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    },
    {
      title: 'System Monitoring',
      icon: Activity,
      description: 'Keep track of background crawls, audit status, and recommendations.',
      bullets: ['SEO Audits queue', 'AI Recommendation runs', 'Celery background workers'],
      color: 'bg-sky-500/10 text-sky-600 border-sky-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between p-6 sm:p-8 font-sans relative overflow-hidden select-none">
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#36E682 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <header className="max-w-6xl w-full mx-auto flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-deep-green flex items-center justify-center text-growth-green font-black shadow-sm">
            A
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-deep-green">Athenura Admin</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs font-bold text-muted-text hover:text-red-600 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </header>

      <main className="max-w-4xl w-full mx-auto py-12 flex-grow flex flex-col justify-center items-center z-10 text-center space-y-10">
        <div className="space-y-4 max-w-2xl animate-fade-in">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.2 rounded-full bg-mint-surface border border-deep-green/10 text-deep-green text-[9px] font-black uppercase tracking-widest mx-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-growth-green" />
            Administration Session
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-deep-green tracking-tight">
            Welcome back, Admin 👋
          </h1>
          <p className="text-muted-text text-xs sm:text-sm leading-relaxed max-w-xl mx-auto font-medium">
            You're signed in to the Athenura Administration Console. Manage users, credits, analytics, and platform activity from one place.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 w-full text-left">
          {previewCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="group bg-white border border-border-color/80 p-5 rounded-2xl shadow-sm hover:shadow-[0_12px_24px_rgba(5,61,52,0.04)] hover:-translate-y-1 hover:border-growth-green/45 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className={`p-2.5 rounded-xl border ${card.color} shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-wider bg-mint-surface text-deep-green border border-deep-green/10 px-2 py-0.5 rounded-full">
                      Coming Soon
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-sm font-black text-deep-green flex items-center gap-1">
                      {card.title}
                    </h3>
                    <p className="text-muted-text text-[11px] font-semibold leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border-color/60">
                  <ul className="space-y-1.5">
                    {card.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-center gap-1.5 text-[10px] text-muted-text font-bold">
                        <ChevronRight className="w-3 h-3 text-growth-green flex-shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-full max-w-2xl bg-white border border-border-color/85 p-5 rounded-2xl text-center animate-slide-up shadow-sm">
          <p className="text-[11px] text-muted-text font-bold leading-relaxed">
            🚧 <strong>The Administration Portal is currently under development.</strong> Core backend APIs are complete and the frontend modules will be implemented next.
          </p>
        </div>
      </main>

      <footer className="text-center py-4 border-t border-border-color/60 max-w-6xl w-full mx-auto z-10">
        <p className="text-[10px] text-muted-text font-bold uppercase tracking-wider">
          &copy; 2026 Athenura Administration Console. Secured.
        </p>
      </footer>
    </div>
  );
}
