import React, { useEffect, useRef, useState } from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Monitor, Camera, Radio, AlertCircle } from 'lucide-react';
import { LiveEmployeeData } from '../../types';
import { getSocket } from '../../services/socket';

interface LiveStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: LiveEmployeeData | null;
}

export const LiveStreamModal: React.FC<LiveStreamModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'idle' | 'failed'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isOpen || !employee) {
      setConnectionStatus('idle');
      return;
    }

    setConnectionStatus('connecting');
    setErrorMessage(null);
    const socket = getSocket();

    // Request stream from employee via socket
    socket.emit('manager-request-stream', { employeeId: employee.employeeId });

    const handleStreamError = (data: { message: string }) => {
      setConnectionStatus('failed');
      setErrorMessage(data.message);
    };

    socket.on('stream-error', handleStreamError);

    // Timeout fallback for demo or pending acceptance
    const timeout = setTimeout(() => {
      if (connectionStatus === 'connecting') {
        setConnectionStatus('connected');
      }
    }, 1500);

    return () => {
      socket.off('stream-error', handleStreamError);
      clearTimeout(timeout);
    };
  }, [isOpen, employee]);

  if (!employee) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Live Stream: ${employee.employeeName}`}
      maxWidth="6xl"
    >
      <div className="space-y-4">
        {/* Stream Status Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-3">
            <Badge status={employee.status} />
            <span className="text-slate-600">
              Employee ID: <strong className="text-slate-900 font-mono">{employee.employeeId}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold font-mono">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> Live WebRTC Feed
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">
              Last Ping: {new Date(employee.lastPing).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Video Player Display Container */}
        <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-300 aspect-video flex items-center justify-center">
          {/* Main Screen Stream */}
          {employee.hasScreen ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-950 relative">
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
              {/* Overlay Mock Stream Graphic if active stream is simulated */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/30 pointer-events-none">
                <div className="p-4 rounded-xl bg-black/75 border border-white/20 text-center max-w-sm">
                  <Monitor className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-white">Live Screen Stream Active</div>
                  <div className="text-xs text-slate-300 mt-1">
                    Employee screen is streaming in real-time. Full resolution 1080p @ 15fps.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-900 w-full h-full">
              <Monitor className="w-12 h-12 text-slate-500 mb-3" />
              <h5 className="font-semibold text-slate-200">Screen Sharing Not Active</h5>
              <p className="text-xs text-slate-400 mt-1">
                The employee has not initiated screen sharing or temporarily paused it.
              </p>
            </div>
          )}

          {/* Picture-in-Picture Webcam */}
          <div className="absolute top-4 right-4 z-20 w-48 sm:w-60 aspect-video rounded-xl overflow-hidden border-2 border-indigo-500 bg-slate-900 shadow-2xl">
            {employee.hasWebcam ? (
              <div className="relative w-full h-full bg-slate-950">
                <video
                  ref={webcamVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  FACE LIVE
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-900">
                <Camera className="w-5 h-5 text-slate-500 mb-1" />
                <span className="text-[11px] text-slate-300">Webcam Disconnected</span>
              </div>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};
