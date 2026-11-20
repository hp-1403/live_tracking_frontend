import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Activity, MousePointer, Eye, Wifi, MonitorCheck, MonitorOff, ShieldCheck, Sparkles } from 'lucide-react';

interface ActivityStatusWidgetProps {
  isIdle: boolean;
  idleSeconds: number;
  isTabActive: boolean;
  isScreenMotionActive?: boolean;
  hasIdleDetectorPermission?: boolean;
  onRequestIdlePermission?: () => void;
  onStartScreen?: () => void;
  lastPingTime: string | null;
}

export const ActivityStatusWidget: React.FC<ActivityStatusWidgetProps> = ({
  isIdle,
  idleSeconds,
  isTabActive,
  isScreenMotionActive = false,
  hasIdleDetectorPermission = false,
  onRequestIdlePermission,
  onStartScreen,
  lastPingTime,
}) => {
  const isCrossAppTrackingActive = isScreenMotionActive || hasIdleDetectorPermission;

  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            <h4 className="font-bold text-sm sm:text-base 2xl:text-lg text-slate-800">Live Activity Monitor</h4>
          </div>
          <Badge status={isIdle ? 'idle' : 'active'} />
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* Status Indicator */}
          <div className="p-3 sm:p-3.5 2xl:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-start justify-between gap-2 text-xs 2xl:text-sm text-slate-600 mb-1.5 font-medium">
              <span className="min-w-0 flex items-start gap-1.5">
                <MousePointer className="w-3.5 h-3.5 text-indigo-600" /> Inactivity (Auto-Pause at 180s)
              </span>
              <span className="font-mono text-slate-900 font-bold whitespace-nowrap">{idleSeconds}s / 180s</span>
            </div>
            {/* Progress bar to idle threshold (180s = 3 minutes) */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isIdle ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (idleSeconds / 180) * 100)}%` }}
              />
            </div>
          </div>

          {/* Cross-App Activity Detection State */}
          <div className="p-3 sm:p-3.5 2xl:p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs 2xl:text-sm space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 sm:gap-2 text-slate-700 font-semibold truncate">
                {isCrossAppTrackingActive ? (
                  <MonitorCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <MonitorOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
                )}
                <span className="truncate">Cross-Tab &amp; App Tracking</span>
              </span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] flex-shrink-0 ${
                  isCrossAppTrackingActive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isCrossAppTrackingActive ? 'Tracking Active' : 'Action Needed'}
              </span>
            </div>

            <p className="text-[11px] 2xl:text-xs text-slate-500 leading-relaxed">
              {isScreenMotionActive ? (
                <span className="text-emerald-700 font-medium">
                  ✓ Screen Motion Active: Detects scrolling, cursor &amp; typing across all Chrome tabs &amp; windows.
                </span>
              ) : hasIdleDetectorPermission ? (
                <span className="text-emerald-700 font-medium">
                  ✓ System Idle Detection Active: Monitoring OS-level mouse and keyboard activity.
                </span>
              ) : (
                <span className="text-amber-700 font-medium">
                  ⚠️ Background tabs are isolated by your browser. Share screen or grant idle permission so scrolling/typing in other tabs resets your timer!
                </span>
              )}
            </p>

            {/* Quick action buttons if neither is active */}
            {!isCrossAppTrackingActive && (
              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                {onStartScreen && (
                  <button
                    type="button"
                    onClick={onStartScreen}
                    className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] 2xl:text-xs font-semibold text-center transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Share Screen
                  </button>
                )}
                {onRequestIdlePermission && (
                  <button
                    type="button"
                    onClick={onRequestIdlePermission}
                    className="flex-1 py-1.5 px-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-[11px] 2xl:text-xs font-medium text-center transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Allow Idle API
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Active Tab State */}
          <div className="flex items-center justify-between p-3 sm:p-3.5 2xl:p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs 2xl:text-sm">
            <span className="flex items-center gap-2 text-slate-600 font-medium">
              <Eye className="w-3.5 h-3.5 text-indigo-600" /> Work Portal Window
            </span>
            <span
              className={`font-semibold text-xs 2xl:text-sm ${
                isTabActive ? 'text-emerald-700' : 'text-slate-500'
              }`}
            >
              {isTabActive ? 'Focused / Active' : 'Background / Minimized'}
            </span>
          </div>
        </div>
      </div>

      {/* Network Heartbeat Footer */}
      <div className="mt-4 sm:mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] sm:text-[11px] 2xl:text-xs text-slate-500 font-medium">
        <span className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> Live Server Sync
        </span>
        <span className="font-mono text-slate-600 whitespace-nowrap">
          {lastPingTime ? new Date(lastPingTime).toLocaleTimeString() : 'Syncing...'}
        </span>
      </div>
    </Card>
  );
};
