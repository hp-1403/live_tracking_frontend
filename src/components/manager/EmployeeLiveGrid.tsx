import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Monitor, Camera, Video, Clock, User, WifiOff } from 'lucide-react';
import { LiveEmployeeData, Shift } from '../../types';

interface EmployeeLiveGridProps {
  employees: LiveEmployeeData[];
  activeShifts: Shift[];
  onSelectEmployeeForStream: (employee: LiveEmployeeData) => void;
}

export const EmployeeLiveGrid: React.FC<EmployeeLiveGridProps> = ({
  employees,
  activeShifts,
  onSelectEmployeeForStream,
}) => {
  if (employees.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl glass-panel border border-slate-800">
        <WifiOff className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h4 className="text-lg font-semibold text-slate-200">No Employees Online</h4>
        <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
          Currently no employees are logged in or actively tracking shifts. Live updates will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {employees.map((emp) => {
        const matchingShift = activeShifts.find((s) => s.employeeId === emp.employeeId);
        const shiftStartTime = matchingShift
          ? new Date(matchingShift.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : null;

        return (
          <Card
            key={emp.employeeId}
            glow={emp.status === 'active'}
            className="flex flex-col justify-between hover:border-slate-700/80 transition-all"
          >
            <div>
              {/* Header: Avatar, Name & Live Badge */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-base shadow-md overflow-hidden">
                    {emp.avatarUrl ? (
                      <img src={emp.avatarUrl} alt={emp.employeeName} className="w-full h-full object-cover" />
                    ) : (
                      emp.employeeName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100">{emp.employeeName}</h4>
                    <span className="text-xs text-slate-400 font-mono">ID: {emp.employeeId.slice(0, 8)}</span>
                  </div>
                </div>
                <Badge status={emp.status} />
              </div>

              {/* Feed Capabilities Info */}
              <div className="grid grid-cols-2 gap-2 my-4">
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                    emp.hasScreen
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <Monitor className="w-4 h-4 flex-shrink-0" />
                  <span>Screen: {emp.hasScreen ? 'Live' : 'Off'}</span>
                </div>
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                    emp.hasWebcam
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <Camera className="w-4 h-4 flex-shrink-0" />
                  <span>Camera: {emp.hasWebcam ? 'Live' : 'Off'}</span>
                </div>
              </div>

              {/* Shift Information */}
              <div className="text-xs text-slate-400 space-y-1 mb-4">
                {shiftStartTime ? (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Clocked in since: <strong className="text-slate-200">{shiftStartTime}</strong></span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>No active shift session recorded</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action to Watch Live Stream */}
            <div className="pt-3 border-t border-slate-800/80">
              <Button
                variant={emp.hasScreen || emp.hasWebcam ? 'primary' : 'outline'}
                size="sm"
                className="w-full"
                onClick={() => onSelectEmployeeForStream(emp)}
                icon={<Video className="w-4 h-4" />}
              >
                Watch Live Video Stream
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
