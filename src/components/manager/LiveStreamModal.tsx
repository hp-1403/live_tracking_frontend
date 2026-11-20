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
  const [hasRemoteScreen, setHasRemoteScreen] = useState<boolean>(false);
  const [hasRemoteWebcam, setHasRemoteWebcam] = useState<boolean>(false);

  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const pcsRef = useRef<Record<string, RTCPeerConnection>>({});

  useEffect(() => {
    if (!isOpen || !employee) {
      setConnectionStatus('idle');
      setHasRemoteScreen(false);
      setHasRemoteWebcam(false);
      return;
    }

    setConnectionStatus('connecting');
    setErrorMessage(null);
    setHasRemoteScreen(false);
    setHasRemoteWebcam(false);
    const socket = getSocket();

    // Request stream from employee via socket
    socket.emit('manager-request-stream', { employeeId: employee.employeeId });

    const handleWebRtcOffer = async (data: {
      senderSocketId: string;
      sdp: any;
      streamType: 'screen' | 'webcam';
    }) => {
      console.log(`[WebRTC Manager] Received offer for ${data.streamType} from ${data.senderSocketId}`);
      try {
        if (pcsRef.current[data.streamType]) {
          pcsRef.current[data.streamType].close();
        }

        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        });
        pcsRef.current[data.streamType] = pc;

        pc.ontrack = (event) => {
          console.log(`[WebRTC Manager] Received track for ${data.streamType}:`, event.streams[0]);
          const remoteStream = event.streams[0];
          if (data.streamType === 'screen') {
            setHasRemoteScreen(true);
            if (screenVideoRef.current) {
              screenVideoRef.current.srcObject = remoteStream;
              screenVideoRef.current.play().catch((e) => console.warn('Screen play error:', e));
            }
          } else if (data.streamType === 'webcam') {
            setHasRemoteWebcam(true);
            if (webcamVideoRef.current) {
              webcamVideoRef.current.srcObject = remoteStream;
              webcamVideoRef.current.play().catch((e) => console.warn('Webcam play error:', e));
            }
          }
          setConnectionStatus('connected');
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('webrtc-ice-candidate', {
              targetSocketId: data.senderSocketId,
              candidate: event.candidate,
              streamType: data.streamType,
            });
          }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('webrtc-answer', {
          targetSocketId: data.senderSocketId,
          sdp: answer,
          streamType: data.streamType,
        });
      } catch (err: any) {
        console.error('[WebRTC Manager] Error handling offer:', err);
      }
    };

    const handleIceCandidate = async (data: {
      candidate: any;
      streamType: 'screen' | 'webcam';
    }) => {
      const pc = pcsRef.current[data.streamType];
      if (pc && data.candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.warn('[WebRTC Manager] ICE error:', err);
        }
      }
    };

    const handleStreamError = (data: { message: string }) => {
      setConnectionStatus('failed');
      setErrorMessage(data.message);
    };

    socket.on('webrtc-offer', handleWebRtcOffer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);
    socket.on('stream-error', handleStreamError);

    // Timeout fallback if employee device hasn't responded yet
    const timeout = setTimeout(() => {
      if (connectionStatus === 'connecting') {
        setConnectionStatus('connected');
      }
    }, 2000);

    return () => {
      socket.off('webrtc-offer', handleWebRtcOffer);
      socket.off('webrtc-ice-candidate', handleIceCandidate);
      socket.off('stream-error', handleStreamError);
      clearTimeout(timeout);
      Object.values(pcsRef.current).forEach((pc) => pc.close());
      pcsRef.current = {};
    };
  }, [isOpen, employee?.employeeId, employee?.hasScreen, employee?.hasWebcam]);

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs 2xl:text-sm">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Badge status={employee.status} size="sm" />
            <span className="text-slate-600">
              Employee ID: <strong className="text-slate-900 font-mono">{employee.employeeId}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold font-mono">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> Live WebRTC Feed
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-[11px] sm:text-xs">
            <span>
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
              {/* Crisp Live Status Badge when stream is connected */}
              {hasRemoteScreen ? (
                <div className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>LIVE SCREEN FEED</span>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 p-4">
                  <div className="p-3 sm:p-4 rounded-xl bg-black/80 border border-white/20 text-center max-w-xs sm:max-w-sm">
                    <Monitor className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400 mx-auto mb-1.5 sm:mb-2 animate-pulse" />
                    <div className="text-xs sm:text-sm font-semibold text-white">Connecting Live Screen Feed...</div>
                    <div className="text-[10px] sm:text-xs text-slate-300 mt-1">
                      Negotiating peer-to-peer connection with employee device.
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4 sm:p-8 bg-slate-900 w-full h-full">
              <Monitor className="w-8 h-8 sm:w-12 sm:h-12 text-slate-500 mb-2 sm:mb-3" />
              <h5 className="text-sm sm:text-base font-semibold text-slate-200">Screen Sharing Not Active</h5>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                The employee has not initiated screen sharing or temporarily paused it.
              </p>
            </div>
          )}

          {/* Picture-in-Picture Webcam */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 w-28 sm:w-48 lg:w-60 2xl:w-72 aspect-video rounded-lg sm:rounded-xl overflow-hidden border sm:border-2 border-indigo-500 bg-slate-900 shadow-2xl">
            {employee.hasWebcam ? (
              <div className="relative w-full h-full bg-slate-950">
                <video
                  ref={webcamVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
                <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 px-1 sm:px-1.5 py-0.5 rounded bg-black/70 text-[8px] sm:text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  FACE LIVE
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-3 text-center bg-slate-900">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 mb-0.5 sm:mb-1" />
                <span className="text-[9px] sm:text-[11px] text-slate-300">Webcam Off</span>
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
