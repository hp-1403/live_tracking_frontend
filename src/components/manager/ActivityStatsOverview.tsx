import React from 'react';
import { Card } from '../common/Card';
import { Users, Video, Clock, AlertTriangle } from 'lucide-react';
import { LiveEmployeeData, Shift } from '../../types';

interface ActivityStatsOverviewProps {
  liveEmployees: LiveEmployeeData[];
  activeShifts: Shift[];
}

export const ActivityStatsOverview: React.FC<ActivityStatsOverviewProps> = ({
  liveEmployees,
  activeShifts,
}) => {
  const activeCount = liveEmployees.filter((e) => e.status === 'active').length;
  const idleCount = liveEmployees.filter((e) => e.status === 'idle').length;
  const streamingCount = liveEmployees.filter((e) => e.hasScreen || e.hasWebcam).length;

  const stats = [
    {
      title: 'Active Employees',
      value: activeCount,
      total: `${liveEmployees.length} Connected`,
      icon: <Users className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
    },
    {
      title: 'Live Streams Running',
      value: streamingCount,
      total: 'Screen & Webcam',
      icon: <Video className="w-5 h-5 text-indigo-400" />,
      color: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/20',
    },
    {
      title: 'Idle / Inactive',
      value: idleCount,
      total: 'Away > 2 mins',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-500/20 to-amber-500/5 border-amber-500/20',
    },
    {
      title: 'Active Shifts',
      value: activeShifts.length,
      total: 'In Progress',
      icon: <Clock className="w-5 h-5 text-blue-400" />,
      color: 'from-blue-500/20 to-blue-500/5 border-blue-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={`p-5 rounded-2xl bg-gradient-to-br ${stat.color} border backdrop-blur-md glass-panel flex items-center justify-between`}
        >
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              {stat.title}
            </div>
            <div className="text-3xl font-extrabold text-slate-100 font-mono">
              {stat.value}
            </div>
            <div className="text-xs text-slate-400 mt-1">{stat.total}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
};
