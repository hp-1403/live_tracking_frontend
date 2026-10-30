import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';
import { Activity, LogOut, Shield, User as UserIcon, Clock } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isManager } = useAuth();
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 bg-clip-text text-transparent">
              LiveTracker
            </span>
            <div className="text-[10px] tracking-wider uppercase text-slate-500 font-semibold">
              Live Monitoring System
            </div>
          </div>
        </div>

        {/* Center Clock */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>{time || '--:--:--'}</span>
        </div>

        {/* User Info & Actions */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  user.fullName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  {user.fullName}
                  {isManager ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      <Shield className="w-2.5 h-2.5 text-purple-600" /> Manager
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <UserIcon className="w-2.5 h-2.5 text-indigo-600" /> Employee
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-mono truncate max-w-[140px]">
                  {user.employeeId || user.email}
                </div>
              </div>
            </div>


          </div>
        )}
      </div>
    </header>
  );
};
