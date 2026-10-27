import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Activity, MousePointer, Eye, Wifi } from 'lucide-react';

interface ActivityStatusWidgetProps {
  isIdle: boolean;
  idleSeconds: number;
  isTabActive: boolean;
  lastPingTime: string | null;
}

export const ActivityStatusWidget: React.FC<ActivityStatusWidgetProps> = ({
  isIdle,
  idleSeconds,
  isTabActive,
  lastPingTime,
}) => {
  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h4 className="font-semibold text-slate-100">Live Activity Monitor</h4>
          </div>
          <Badge status={isIdle ? 'idle' : 'active'} />
        </div>

        <div className="space-y-4">
          {/* Status Indicator */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5">
                <MousePointer className="w-3.5 h-3.5 text-indigo-400" /> Inactivity Incurred
              </span>
              <span className="font-mono text-slate-200">{idleSeconds}s</span>
            </div>
            {/* Progress bar to idle threshold (120s) */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isIdle ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, (idleSeconds / 120) * 100)}%` }}
              />
            </div>
          </div>

          {/* Active Tab State */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="flex items-center gap-2 text-slate-400">
              <Eye className="w-3.5 h-3.5 text-indigo-400" /> Work Portal Window
            </span>
            <span
              className={`font-medium ${
                isTabActive ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {isTabActive ? 'Focused / Active' : 'Background / Minimized'}
            </span>
          </div>
        </div>
      </div>

      {/* Network Heartbeat Footer */}
      <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Live Server Sync
        </span>
        <span className="font-mono">
          {lastPingTime ? new Date(lastPingTime).toLocaleTimeString() : 'Syncing...'}
        </span>
      </div>
    </Card>
  );
};
