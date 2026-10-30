import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Shift } from '../../types';
import { Search, Calendar } from 'lucide-react';

interface ShiftHistoryTableProps {
  shifts: Shift[];
}

export const ShiftHistoryTable: React.FC<ShiftHistoryTableProps> = ({ shifts }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredShifts = shifts.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      (s.employeeName && s.employeeName.toLowerCase().includes(term)) ||
      (s.employeeEmail && s.employeeEmail.toLowerCase().includes(term)) ||
      s.status.toLowerCase().includes(term)
    );
  });

  const formatDuration = (seconds?: number) => {
    if (seconds === undefined || seconds === null || isNaN(seconds)) return '0h 0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const formatDateSafe = (iso?: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
  };

  const formatTimeSafe = (iso?: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '-' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="mt-8">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Shift Activity History</h3>
          <p className="text-xs text-slate-500">Past employee shifts, working hours, and recorded idle time</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold bg-slate-50/60">
              <th className="py-2.5 pl-3">Employee</th>
              <th className="py-2.5">Shift Date</th>
              <th className="py-2.5">Start - End Time</th>
              <th className="py-2.5">Duration</th>
              <th className="py-2.5">Idle Time</th>
              <th className="py-2.5 pr-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredShifts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No shift records found matching your search.
                </td>
              </tr>
            ) : (
              filteredShifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 pl-3 font-semibold text-slate-800">
                    <div>{shift.employeeName || 'Unknown Employee'}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{shift.employeeEmail}</div>
                  </td>
                  <td className="py-3.5 text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      {formatDateSafe(shift.startedAt)}
                    </span>
                  </td>
                  <td className="py-3.5 font-mono text-slate-600">
                    {formatTimeSafe(shift.startedAt)}
                    {' - '}
                    {shift.endedAt ? formatTimeSafe(shift.endedAt) : 'Active'}
                  </td>
                  <td className="py-3.5 font-mono font-medium text-slate-800">
                    {formatDuration(shift.totalDurationSeconds)}
                  </td>
                  <td className="py-3.5 font-mono font-medium text-amber-700">
                    {formatDuration(shift.idleDurationSeconds)}
                  </td>
                  <td className="py-3.5 pr-3">
                    <Badge status={shift.status} size="sm" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
