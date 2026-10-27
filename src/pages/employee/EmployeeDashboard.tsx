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
  useStartShiftMutation,
  useUpdateShiftStatusMutation,
} from '../../hooks/queries/useShiftQueries';
import { useLogActivityMutation } from '../../hooks/queries/useActivityQueries';
import { getSocket } from '../../services/socket';
import { ShieldCheck, Video, Info } from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [lastPingTime, setLastPingTime] = useState<string | null>(null);

  // 1. React Query: Fetch active shift
  const { data: shift, isLoading: isShiftLoading } = useMyActiveShiftQuery(!!user);

  // 2. React Query: Mutations
  const startShiftMutation = useStartShiftMutation();
  const updateShiftStatusMutation = useUpdateShiftStatusMutation();
  const logActivityMutation = useLogActivityMutation();

  const isActionLoading =
    isShiftLoading ||
    startShiftMutation.isPending ||
    updateShiftStatusMutation.isPending;

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
    stopWebcam,
    startScreenShare,
    stopScreenShare,
    startAllStreams,
    stopAllStreams,
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

  // 5. Idle Detector Hook & Activity Logging
  const handleIdleChange = useCallback(
    async (idle: boolean, idleSecs: number) => {
      if (!user || !shift) return;
      const socket = getSocket();
      const status = idle ? 'idle' : 'active';

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
        status,
        hasWebcam: isWebcamActive,
        hasScreen: isScreenActive,
      });
      setLastPingTime(new Date().toISOString());

      // Log activity to API via React Query mutation
      logActivityMutation.mutate({
        shiftId: shift.id,
        isIdle: status === 'idle',
        idleDurationSeconds: idleSecs,
        tabActive: !document.hidden,
      });
    },
    [user, shift, isWebcamActive, isScreenActive, logActivityMutation]
  );

  const { isIdle, idleSeconds, isTabActive } = useIdleDetector({
    idleTimeoutSeconds: 120, // 2 mins idle
    onIdleStateChange: handleIdleChange,
    onHeartbeat: handleHeartbeat,
    heartbeatIntervalSeconds: 20,
  });

  // 6. Shift Handlers via React Query Mutations
  const handleStartShift = async () => {
    try {
      await startShiftMutation.mutateAsync();
      // Prompt employee for media permissions
      await startAllStreams();
    } catch (err: any) {
      alert(err.message || 'Failed to start shift');
    }
  };

  const handlePauseShift = async () => {
    if (!shift) return;
    try {
      await updateShiftStatusMutation.mutateAsync({
        shiftId: shift.id,
        status: 'paused',
      });
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
    } catch (err: any) {
      alert(err.message || 'Failed to resume shift');
    }
  };

  const handleEndShift = async () => {
    if (!shift) return;
    if (!window.confirm('Are you sure you want to end your shift and clock out?')) return;
    try {
      await updateShiftStatusMutation.mutateAsync({
        shiftId: shift.id,
        status: 'completed',
      });
      stopAllStreams();
    } catch (err: any) {
      alert(err.message || 'Failed to complete shift');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Top Shift Controller */}
        <ShiftControlCard
          shift={shift || null}
          onStartShift={handleStartShift}
          onPauseShift={handlePauseShift}
          onResumeShift={handleResumeShift}
          onEndShift={handleEndShift}
          isLoading={isActionLoading}
          isStreaming={isWebcamActive || isScreenActive}
        />

        {/* Dual Video Stream Preview & Activity Column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Cols: Main Live Video & Screen Sharing Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-400" /> Live Feed Broadcast Preview
              </h3>
              <span className="text-xs text-slate-400">
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
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">Continuous Monitoring Active:</strong> Media streams are broadcast directly to authorized management dashboards only during active shifts. Clocking out immediately terminates video capturing and activity logging.
              </div>
            </div>
          </div>

          {/* Right 1 Col: Activity Tracker Status */}
          <div className="lg:col-span-1 space-y-6">
            <ActivityStatusWidget
              isIdle={isIdle}
              idleSeconds={idleSeconds}
              isTabActive={isTabActive}
              lastPingTime={lastPingTime}
            />

            <Card>
              <h4 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" /> Shift Instructions
              </h4>
              <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                <li>Keep this browser tab open in background while working.</li>
                <li>Share your primary display screen for live monitoring.</li>
                <li>Ensure webcam lens is unblocked.</li>
                <li>Use "Take Break" button if stepping away from your desk.</li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
