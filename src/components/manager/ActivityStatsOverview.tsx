import React from 'react';
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
      icon: <Users className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50/50 border-emerald-100',
    },
    {
      title: 'Live Streams Running',
      value: streamingCount,
      total: 'Screen & Webcam',
      icon: <Video className="w-5 h-5 text-indigo-600" />,
      color: 'bg-indigo-50/50 border-indigo-100',
    },
    {
      title: 'Idle / Inactive',
      value: idleCount,
      total: 'Away > 2 mins',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-50/50 border-amber-100',
    },
    {
      title: 'Active Shifts',
      value: activeShifts.length,
      total: 'In Progress',
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-50/50 border-blue-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={`p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between transition-all hover:shadow-md`}
        >
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {stat.title}
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">
              {stat.value}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">{stat.total}</div>
          </div>
          <div className={`p-3 rounded-xl border ${stat.color}`}>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
};
