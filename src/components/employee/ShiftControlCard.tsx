import React, { useState, useEffect } from 'react';
import { Play, Pause, LogOut, AlertCircle, Sparkles } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Shift } from '../../types';

interface ShiftControlCardProps {
  shift: Shift | null;
  onPauseShift: () => void;
  onResumeShift: () => void;
  onLogout: () => void;
  isLoading: boolean;
  isStreaming: boolean;
  isAutoPaused?: boolean;
}

export const ShiftControlCard: React.FC<ShiftControlCardProps> = ({
  shift,
  onPauseShift,
  onResumeShift,
  onLogout,
  isLoading,
  isStreaming,
  isAutoPaused = false,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Timer calculation
  useEffect(() => {
    if (!shift) {
      setElapsedSeconds(0);
      return;
    }

    const rawStartTime = shift.startedAt || (shift as any)?.started_at;
    const parsedStart = rawStartTime ? new Date(rawStartTime).getTime() : NaN;
    const validStartTime = !isNaN(parsedStart) ? parsedStart : Date.now();

    const calculateElapsed = () => {
      if (shift.status === 'paused' && shift.totalDurationSeconds !== undefined && shift.totalDurationSeconds > 0) {
        setElapsedSeconds(shift.totalDurationSeconds);
        return;
      }

      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - validStartTime) / 1000));
      setElapsedSeconds(isNaN(diff) ? 0 : diff);
    };

    calculateElapsed();

    if (shift.status === 'active') {
      const interval = setInterval(calculateElapsed, 1000);
      return () => clearInterval(interval);
    }
  }, [shift]);

  const formatTime = (totalSecs: number) => {
    const validSecs = isNaN(totalSecs) || totalSecs < 0 ? 0 : Math.floor(totalSecs);
    const hours = Math.floor(validSecs / 3600);
    const minutes = Math.floor((validSecs % 3600) / 60);
    const seconds = validSecs % 60;
    return `${hours.toString().padStart(2, '0')} : ${minutes
      .toString()
      .padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;
  };

  const getStartTimeLabel = () => {
    if (!shift) {
      return 'Initializing your active shift session...';
    }
    const raw = shift.startedAt || (shift as any)?.started_at;
    const date = raw ? new Date(raw) : null;
    if (date && !isNaN(date.getTime())) {
      return `Shift auto-started at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (upon login)`;
    }
    return 'Shift session active';
  };

  const isShiftActive = Boolean(shift && shift.status === 'active');
  const isShiftPaused = Boolean(shift && shift.status === 'paused');

  return (
    <Card glow={isShiftActive} className="relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Shift Information & Timer */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-slate-900">Work Shift Tracker</h3>
            <Badge status={shift ? shift.status : 'active'} />
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-indigo-600" /> Auto-Started at Login
            </span>
          </div>
          <p className="text-sm text-slate-500">{getStartTimeLabel()}</p>

          {/* Large Clock Display */}
          <div className="mt-4 flex items-baseline gap-3">
            <div className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent">
              {formatTime(elapsedSeconds)}
            </div>
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              {isShiftPaused ? 'Shift Paused' : 'Elapsed Active Time'}
            </span>
          </div>
        </div>

        {/* Right: Shift Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {isShiftActive ? (
            <Button
              variant="outline"
              size="md"
              onClick={onPauseShift}
              isLoading={isLoading}
              icon={<Pause className="w-4 h-4" />}
            >
              Take Break (Pause)
            </Button>
          ) : (
            <Button
              variant="success"
              size="md"
              onClick={onResumeShift}
              isLoading={isLoading}
              icon={<Play className="w-4 h-4 fill-current" />}
            >
              Resume Shift
            </Button>
          )}

          <Button
            variant="danger"
            size="md"
            onClick={onLogout}
            isLoading={isLoading}
            icon={<LogOut className="w-4 h-4" />}
          >
            Clock Out &amp; Logout
          </Button>
        </div>
      </div>

      {/* Auto-Paused Due to Inactivity Banner */}
      {isShiftPaused && isAutoPaused && (
        <div className="mt-6 flex items-center justify-between p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
            <span>
              <strong>Shift Auto-Paused:</strong> You were inactive for 3 minutes. Your shift timer has been paused to protect your work duration logs. Click <strong>Resume Shift</strong> to continue working.
            </span>
          </div>
          <Button
            variant="success"
            size="sm"
            onClick={onResumeShift}
            isLoading={isLoading}
            className="ml-3 flex-shrink-0"
          >
            Resume Now
          </Button>
        </div>
      )}

      {/* Compliance / Streaming Alert */}
      {isShiftActive && !isStreaming && (
        <div className="mt-6 flex items-center gap-3 p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-indigo-600" />
          <span>
            Notice: Screen or Webcam capture is not active. Please select a screen and allow webcam below to broadcast your live work feed.
          </span>
        </div>
      )}
    </Card>
  );
};
