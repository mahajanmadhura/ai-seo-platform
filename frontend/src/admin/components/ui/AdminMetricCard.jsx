import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminMetricCard({
  title,
  value,
  badge,
  icon: Icon,
  description,
  linkTo,
  onClick,
}) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (linkTo) {
      navigate(linkTo);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && (onClick || linkTo)) {
      e.preventDefault();
      handleClick(e);
    }
  };

  const isClickable = Boolean(onClick || linkTo);

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : undefined}
      className={`bg-white p-5 rounded-xl border border-zinc-200 shadow-2xs space-y-3 font-sans text-left transition-all duration-200 outline-none ${
        isClickable
          ? 'hover:border-zinc-400 hover:shadow-xs cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-zinc-950'
          : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{title}</span>
        {badge && (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-100 text-zinc-800 border border-zinc-200">
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-black text-zinc-950 tracking-tight">{value}</span>
        {Icon && <Icon className="w-5 h-5 text-zinc-400 shrink-0" />}
      </div>

      {description && (
        <p className="text-[11px] text-zinc-500 font-medium">{description}</p>
      )}
    </div>
  );
}
