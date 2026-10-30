import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, Clock } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const [time, setTime] = React.useState<string>('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
      <div className="max-w-7xl 2xl:max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 2xl:px-12 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20 flex-shrink-0">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <span className="text-base sm:text-lg 2xl:text-xl font-bold bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 bg-clip-text text-transparent">
              LiveTracker
            </span>
            <div className="text-[9px] sm:text-[10px] 2xl:text-[11px] tracking-wider uppercase text-slate-500 font-semibold truncate">
              Live Monitoring System
            </div>
          </div>
        </div>

        {/* Center Clock (Tablet, Desktop, 2XL) */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs 2xl:text-sm font-mono text-slate-700">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>{time || '--:--:--'}</span>
        </div>

        {/* User Info */}
        {user && (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 2xl:w-10 2xl:h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-sm overflow-hidden flex-shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                user.fullName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs sm:text-sm 2xl:text-base font-semibold text-slate-800">
                <span className="truncate max-w-[140px] lg:max-w-[200px] 2xl:max-w-[260px] inline-block">{user.fullName}</span>
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-mono truncate max-w-[120px] lg:max-w-[180px]">
                {user.employeeId || user.email}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
