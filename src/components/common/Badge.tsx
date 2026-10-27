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
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-400 animate-pulse',
          text: label || 'Live Active',
        };
      case 'idle':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          dot: 'bg-amber-400',
          text: label || 'Idle / Away',
        };
      case 'on_break':
      case 'paused':
        return {
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          dot: 'bg-blue-400',
          text: label || 'On Break',
        };
      case 'completed':
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          dot: 'bg-indigo-400',
          text: label || 'Completed',
        };
      case 'offline':
      default:
        return {
          bg: 'bg-slate-700/20 text-slate-400 border-slate-700/30',
          dot: 'bg-slate-500',
          text: label || 'Offline',
        };
    }
  };

  const config = getBadgeConfig();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.text}</span>
    </span>
  );
};
