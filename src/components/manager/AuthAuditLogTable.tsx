import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Search, ShieldAlert, LogIn, LogOut, Play, Pause, Square, Clock } from 'lucide-react';

interface AuthAuditLogTableProps {
  logs: any[];
  isLoading?: boolean;
}

export const AuthAuditLogTable: React.FC<AuthAuditLogTableProps> = ({ logs, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter((l) => {
    const term = searchTerm.toLowerCase();
    const name = (l.employee_name || l.employeeName || '').toLowerCase();
    const id = (l.employee_id || l.employeeId || '').toLowerCase();
    const action = (l.action || '').toLowerCase();
    const details = (l.details || '').toLowerCase();
    return name.includes(term) || id.includes(term) || action.includes(term) || details.includes(term);
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <LogIn className="w-3 h-3 text-emerald-600" /> Log In
          </span>
        );
      case 'LOGOUT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <LogOut className="w-3 h-3 text-rose-600" /> Log Out
          </span>
        );
      case 'SHIFT_STARTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Play className="w-3 h-3 text-indigo-600 fill-current" /> Shift Auto-Started
          </span>
        );
      case 'AUTO_PAUSED_INACTIVITY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
            <Pause className="w-3 h-3 text-amber-600" /> Auto-Paused (3m Inactivity)
          </span>
        );
      case 'SHIFT_PAUSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Pause className="w-3 h-3 text-amber-600" /> Shift Paused
          </span>
        );
      case 'SHIFT_RESUMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Play className="w-3 h-3 text-emerald-600" /> Shift Resumed
          </span>
        );
      case 'SHIFT_COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Square className="w-3 h-3 text-blue-600 fill-current" /> Shift Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {action}
          </span>
        );
    }
  };

  const formatTimestamp = (raw: string) => {
    if (!raw) return '-';
    const d = new Date(raw);
    return isNaN(d.getTime()) ? '-' : `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  };

  return (
    <Card className="mt-6 sm:mt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            <h3 className="text-base sm:text-lg 2xl:text-xl font-bold text-slate-800">Database Audit Trail: Employee Login &amp; Logout Activity</h3>
          </div>
          <p className="text-xs 2xl:text-sm text-slate-500 mt-0.5">
            Full authoritative system log of every employee login, logout, automatic shift start, and auto-pause event.
          </p>
        </div>

        <div className="relative w-full sm:w-64 lg:w-72 2xl:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs 2xl:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="responsive-table -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle px-4 sm:px-0">
          <table className="min-w-full text-left text-xs 2xl:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold bg-slate-50/60 text-[10px] sm:text-xs 2xl:text-sm">
                <th className="py-2.5 sm:py-3 pl-3 pr-2 whitespace-nowrap">Timestamp</th>
                <th className="py-2.5 sm:py-3 px-2 whitespace-nowrap">Employee</th>
                <th className="py-2.5 sm:py-3 px-2 whitespace-nowrap">Event Action</th>
                <th className="py-2.5 sm:py-3 px-2">Event Details</th>
                <th className="py-2.5 sm:py-3 pr-3 pl-2 whitespace-nowrap">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs 2xl:text-sm">
                    <div className="inline-flex items-center gap-2">
                      <Clock className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>Loading audit records from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs 2xl:text-sm">
                    No activity audit logs found yet.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => {
                  const empName = log.employee_name || log.employeeName || 'Employee';
                  const empId = log.employee_id || log.employeeId || 'ID';
                  const createdAt = log.created_at || log.createdAt;
                  const action = log.action;
                  const details = log.details || '-';
                  const ip = log.ip_address || log.ipAddress || '127.0.0.1';

                  return (
                    <tr key={log.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 sm:py-3.5 pl-3 pr-2 font-mono text-slate-600 text-[10px] sm:text-[11px] 2xl:text-xs whitespace-nowrap">
                        {formatTimestamp(createdAt)}
                      </td>
                      <td className="py-3 sm:py-3.5 px-2 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{empName}</div>
                        <div className="text-[10px] sm:text-xs text-slate-400 font-mono">{empId}</div>
                      </td>
                      <td className="py-3 sm:py-3.5 px-2 whitespace-nowrap">
                        {getActionBadge(action)}
                      </td>
                      <td className="py-3 sm:py-3.5 px-2 text-slate-600 min-w-[180px]">
                        {details}
                      </td>
                      <td className="py-3 sm:py-3.5 pr-3 pl-2 font-mono text-slate-500 text-[10px] sm:text-[11px] 2xl:text-xs whitespace-nowrap">
                        {ip}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};
