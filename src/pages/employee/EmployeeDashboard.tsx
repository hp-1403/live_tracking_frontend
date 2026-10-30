import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../../components/common/Navbar';
import { ShiftControlCard } from '../../components/employee/ShiftControlCard';
import { VideoFeedPreview } from '../../components/employee/VideoFeedPreview';
import { ActivityStatusWidget } from '../../components/employee/ActivityStatusWidget';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { useMediaStream } from '../../hooks/useMediaStream';
import { useIdleDetector } from '../../hooks/useIdleDetector';
import {
  useMyActiveShiftQuery,
  useUpdateShiftStatusMutation,
} from '../../hooks/queries/useShiftQueries';
import { useLogActivityMutation } from '../../hooks/queries/useActivityQueries';
import { getSocket } from '../../services/socket';
import { ShieldCheck, Video, Info, AlertTriangle, Monitor, CheckCircle2 } from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [lastPingTime, setLastPingTime] = useState<string | null>(null);
  const [isAutoPaused, setIsAutoPaused] = useState<boolean>(false);

  // 1. React Query: Fetch active shift (auto-started at login)
  const { data: shift, isLoading: isShiftLoading } = useMyActiveShiftQuery(!!user);

  // 2. React Query: Mutations
  const updateShiftStatusMutation = useUpdateShiftStatusMutation();
  const logActivityMutation = useLogActivityMutation();

  const isActionLoading =
    isShiftLoading || updateShiftStatusMutation.isPending;

  // 3. Initialize Media Streams (Webcam + Screen Share)
  const handleScreenStoppedByUser = useCallback(() => {
    console.warn('Screen share stopped by user');
  }, []);

  const {
    webcamStream,
    screenStream,
    isWebcamActive,
    isScreenActive,
    isWebcamMuted,
    startWebcam,
    startScreenShare,
    toggleWebcamMute,
  } = useMediaStream(handleScreenStoppedByUser);

  // 4. Socket Registration and Heartbeats
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    // Register employee presence on socket
    socket.emit('employee-register', {
      employeeId: user.id,
      employeeName: user.fullName,
      status: shift ? (shift.status === 'paused' ? 'on_break' : 'active') : 'idle',
      hasWebcam: isWebcamActive,
      hasScreen: isScreenActive,
      shiftId: shift?.id,
    });

    setLastPingTime(new Date().toISOString());
  }, [user, shift, isWebcamActive, isScreenActive]);

  // 5. Shift pause / resume handlers
  const handlePauseShift = async () => {
    if (!shift) return;
    try {
      await updateShiftStatusMutation.mutateAsync({
        shiftId: shift.id,
        status: 'paused',
        reason: 'break',
      });
      setIsAutoPaused(false);
    } catch (err: any) {
      alert(err.message || 'Failed to pause shift');
    }
  };

  const handleResumeShift = async () => {
    if (!shift) return;
    try {
      await updateShiftStatusMutation.mutateAsync({
        shiftId: shift.id,
        status: 'active',
      });
      setIsAutoPaused(false);
    } catch (err: any) {
      alert(err.message || 'Failed to resume shift');
    }
  };

  // 6. Inactivity Auto-Pause Handler (Option B: Triggered when inactive for 3 minutes)
  const handleInactivityAutoPause = useCallback(async () => {
    if (!shift || shift.status === 'paused') return;
    try {
      console.warn('⚠️ 3 minutes of inactivity detected. Automatically pausing shift.');
      await updateShiftStatusMutation.mutateAsync({
        shiftId: shift.id,
        status: 'paused',
        reason: 'inactivity',
      });
      setIsAutoPaused(true);
    } catch (err: any) {
      console.error('Error auto-pausing shift:', err);
    }
  }, [shift, updateShiftStatusMutation]);

  // 7. Idle Detector Hook (Option B: System-wide with 3-minute threshold + Screen Motion Tracking)
  const handleIdleChange = useCallback(
    async (idle: boolean, idleSecs: number) => {
      if (!user || !shift) return;
      const socket = getSocket();
      const status = idle ? 'idle' : (shift.status === 'paused' ? 'on_break' : 'active');

      socket.emit('employee-ping', {
        employeeId: user.id,
        status,
        hasWebcam: isWebcamActive,
        hasScreen: isScreenActive,
      });

      // Log activity to API via React Query mutation
      logActivityMutation.mutate({
        shiftId: shift.id,
        isIdle: idle,
        idleDurationSeconds: idleSecs,
        tabActive: !document.hidden,
      });
    },
    [user, shift, isWebcamActive, isScreenActive, logActivityMutation]
  );

  const handleHeartbeat = useCallback(
    async (status: 'active' | 'idle', idleSecs: number) => {
      if (!user || !shift) return;
      const socket = getSocket();
      socket.emit('employee-ping', {
        employeeId: user.id,
        status: shift.status === 'paused' ? 'on_break' : status,
        hasWebcam: isWebcamActive,
        hasScreen: isScreenActive,
      });
      setLastPingTime(new Date().toISOString());

      logActivityMutation.mutate({
        shiftId: shift.id,
        isIdle: status === 'idle',
        idleDurationSeconds: idleSecs,
        tabActive: !document.hidden,
      });
    },
    [user, shift, isWebcamActive, isScreenActive, logActivityMutation]
  );

  const {
    isIdle,
    idleSeconds,
    isTabActive,
    isScreenMotionActive,
    hasIdleDetectorPermission,
    requestIdleDetectorPermission,
  } = useIdleDetector({
    screenStream,
    idleTimeoutSeconds: 180, // 3 minutes inactivity threshold
    onIdleStateChange: handleIdleChange,
    onInactivityPause: handleInactivityAutoPause,
    onHeartbeat: handleHeartbeat,
    heartbeatIntervalSeconds: 15,
  });

  const isCrossAppActive = isScreenMotionActive || hasIdleDetectorPermission;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to clock out and logout? Your shift will automatically end.')) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 sm:pb-16 2xl:pb-24">
      <Navbar />

      <main className="max-w-7xl 2xl:max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 2xl:px-12 pt-4 sm:pt-6 lg:pt-8 2xl:pt-10 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Cross-Tab Tracking Advisory Banner */}
        {!isCrossAppActive ? (
          <div className="p-3.5 sm:p-4 2xl:p-5 rounded-2xl bg-amber-50 border border-amber-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs sm:text-sm 2xl:text-base font-bold text-amber-900">
                  Cross-Tab Activity Tracking Inactive
                </h4>
                <p className="text-[11px] sm:text-xs 2xl:text-sm text-amber-700 mt-0.5">
                  Browsers strictly isolate tabs for security. To ensure your cursor and keyboard activity in <strong>other Chrome tabs and desktop apps</strong> reset your 3-minute timer, please share your screen or allow the idle API.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={startScreenShare}
                className="w-full sm:w-auto py-2 px-3.5 2xl:px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs 2xl:text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Monitor className="w-4 h-4" /> Share Entire Screen
              </button>
              <button
                type="button"
                onClick={requestIdleDetectorPermission}
                className="w-full sm:w-auto py-2 px-3 2xl:px-4 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs 2xl:text-sm font-medium shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> Allow Idle API
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 sm:p-3.5 2xl:p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs 2xl:text-sm text-emerald-900">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Cross-Tab &amp; Desktop Activity Tracking Active:</strong> Your mouse and keyboard activity across all Chrome tabs and desktop applications are actively tracking.
              </span>
            </div>
            <span className="font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] 2xl:text-xs flex-shrink-0 self-start sm:self-auto">
              {isScreenMotionActive ? 'Screen Motion Active' : 'System Idle API Active'}
            </span>
          </div>
        )}

        {/* Top Shift Controller */}
        <ShiftControlCard
          shift={shift || null}
          onPauseShift={handlePauseShift}
          onResumeShift={handleResumeShift}
          onLogout={handleLogout}
          isLoading={isActionLoading}
          isStreaming={isWebcamActive || isScreenActive}
          isAutoPaused={isAutoPaused}
        />

        {/* Dual Video Stream Preview & Activity Column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8 2xl:gap-10 items-start">
          {/* Main Live Video & Screen Sharing Feed: 2 cols on lg, 3 cols on 2xl */}
          <div className="lg:col-span-2 2xl:col-span-3 space-y-3.5 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
              <h3 className="text-base sm:text-lg 2xl:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" /> Live Feed Broadcast Preview
              </h3>
              <span className="text-[11px] sm:text-xs 2xl:text-sm text-slate-500 font-medium">
                Managers view this stream live
              </span>
            </div>

            <VideoFeedPreview
              webcamStream={webcamStream}
              screenStream={screenStream}
              isWebcamActive={isWebcamActive}
              isScreenActive={isScreenActive}
              isWebcamMuted={isWebcamMuted}
              onToggleWebcam={toggleWebcamMute}
              onStartScreen={startScreenShare}
              onStartWebcam={startWebcam}
            />

            {/* Privacy & Compliance Info */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs 2xl:text-sm text-indigo-950 flex items-start gap-2.5 sm:gap-3">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-indigo-900">Shift Started Automatically:</strong> Your work shift began as soon as you logged in and is automatically tracking. When you log out, your shift will automatically complete and clock out.
              </div>
            </div>
          </div>

          {/* Right 1 Col: Activity Tracker Status */}
          <div className="lg:col-span-1 2xl:col-span-1 space-y-4 sm:space-y-6">
            <ActivityStatusWidget
              isIdle={isIdle}
              idleSeconds={idleSeconds}
              isTabActive={isTabActive}
              isScreenMotionActive={isScreenMotionActive}
              hasIdleDetectorPermission={hasIdleDetectorPermission}
              onRequestIdlePermission={requestIdleDetectorPermission}
              onStartScreen={startScreenShare}
              lastPingTime={lastPingTime}
            />

            <Card>
              <h4 className="text-xs sm:text-sm 2xl:text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-600" /> Inactivity Policy &amp; Shift Info
              </h4>
              <ul className="text-xs 2xl:text-sm text-slate-600 space-y-1.5 sm:space-y-2 list-disc list-inside">
                <li>
                  <strong>3-Minute Auto-Pause:</strong> If no activity is detected for 3 minutes, your shift is paused automatically to preserve accurate hours.
                </li>
                <li>
                  {isCrossAppActive ? (
                    <span className="text-emerald-700 font-medium">
                      ✓ Cross-tab &amp; cross-app activity active. Moving cursor or typing in other tabs resets your timer.
                    </span>
                  ) : (
                    <span>Share entire screen or allow Idle API so cursor movement in other tabs resets your timer.</span>
                  )}
                </li>
                <li>
                  <strong>Automatic Clock Out:</strong> Click <strong>Logout</strong> when you are finished for the day.
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
