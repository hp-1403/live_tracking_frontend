import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Shift } from '../../types';

interface ShiftControlCardProps {
  shift: Shift | null;
  onStartShift: () => void;
  onPauseShift: () => void;
  onResumeShift: () => void;
  onEndShift: () => void;
  isLoading: boolean;
  isStreaming: boolean;
}

export const ShiftControlCard: React.FC<ShiftControlCardProps> = ({
  shift,
  onStartShift,
  onPauseShift,
  onResumeShift,
  onEndShift,
  isLoading,
  isStreaming,
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
      return 'Clock in to start activity logging and live screen/webcam broadcasting to management.';
    }
    const raw = shift.startedAt || (shift as any)?.started_at;
    const date = raw ? new Date(raw) : null;
    if (date && !isNaN(date.getTime())) {
      return `Shift started at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return 'Shift currently in progress';
  };

  const isShiftActive = Boolean(shift && shift.status === 'active');

  return (
    <Card glow={isShiftActive} className="relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Shift Information & Timer */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-slate-100">Work Shift Tracker</h3>
            {shift ? (
              <Badge status={shift.status} />
            ) : (
              <Badge status="offline" label="Not Clocked In" />
            )}
          </div>
          <p className="text-sm text-slate-400">{getStartTimeLabel()}</p>

          {/* Large Clock Display */}
          <div className="mt-4 flex items-baseline gap-3">
            <div className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-indigo-100 bg-clip-text text-transparent">
              {formatTime(elapsedSeconds)}
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Elapsed Time
            </span>
          </div>
        </div>

        {/* Right: Shift Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {!shift ? (
            <Button
              variant="success"
              size="lg"
              onClick={onStartShift}
              isLoading={isLoading}
              icon={<Play className="w-5 h-5 fill-current" />}
            >
              Start Shift (Clock In)
            </Button>
          ) : (
            <>
              {isShiftActive ? (
                <Button
                  variant="outline"
                  size="md"
                  onClick={onPauseShift}
                  isLoading={isLoading}
                  icon={<Pause className="w-4 h-4" />}
                >
                  Take Break
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
                onClick={onEndShift}
                isLoading={isLoading}
                icon={<Square className="w-4 h-4 fill-current" />}
              >
                End Shift (Clock Out)
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Compliance / Streaming Alert */}
      {isShiftActive && !isStreaming && (
        <div className="mt-6 flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            Notice: Screen or Webcam capture is not active. Please grant browser permissions below to maintain continuous work tracking.
          </span>
        </div>
      )}
    </Card>
  );
};
