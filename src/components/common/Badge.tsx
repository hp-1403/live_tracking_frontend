import React from 'react';

export type BadgeStatus = 'active' | 'idle' | 'on_break' | 'paused' | 'offline' | 'completed';

export interface BadgeProps {
  status: BadgeStatus | string;
  label?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, label, size = 'md' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500 animate-pulse',
          text: label || 'Live Active',
        };
      case 'idle':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          text: label || 'Idle / Away',
        };
      case 'on_break':
      case 'paused':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          text: label || 'On Break',
        };
      case 'completed':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dot: 'bg-indigo-500',
          text: label || 'Completed',
        };
      case 'offline':
      default:
        return {
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
          text: label || 'Offline',
        };
    }
  };

  const config = getBadgeConfig();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px] sm:text-xs' : 'px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs 2xl:text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border whitespace-nowrap ${config.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      <span>{config.text}</span>
    </span>
  );
};
