import React, { useEffect, useRef } from 'react';
import { Camera, Monitor, VideoOff, Maximize2, ShieldAlert } from 'lucide-react';
import { Button } from '../common/Button';

interface VideoFeedPreviewProps {
  webcamStream: MediaStream | null;
  screenStream: MediaStream | null;
  isWebcamActive: boolean;
  isScreenActive: boolean;
  isWebcamMuted: boolean;
  onToggleWebcam: () => void;
  onStartScreen: () => void;
  onStartWebcam: () => void;
}

export const VideoFeedPreview: React.FC<VideoFeedPreviewProps> = ({
  webcamStream,
  screenStream,
  isWebcamActive,
  isScreenActive,
  isWebcamMuted,
  onToggleWebcam,
  onStartScreen,
  onStartWebcam,
}) => {
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);

  // Bind screen stream to video element
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  // Bind webcam stream to video element
  useEffect(() => {
    if (webcamVideoRef.current && webcamStream) {
      webcamVideoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl aspect-video flex items-center justify-center group">
      {/* 1. Main Screen View */}
      {isScreenActive && screenStream ? (
        <video
          ref={screenVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-contain bg-black"
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
            <Monitor className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-semibold text-slate-200 mb-1">Screen Sharing Inactive</h4>
          <p className="text-sm text-slate-400 mb-6">
            To fulfill employee live monitoring requirements, please share your entire screen during your shift.
          </p>
          <Button
            onClick={onStartScreen}
            variant="primary"
            icon={<Monitor className="w-4 h-4" />}
          >
            Select Screen to Share
          </Button>
        </div>
      )}

      {/* 2. Floating Picture-in-Picture Webcam View */}
      <div className="absolute top-4 right-4 z-20 w-44 sm:w-56 aspect-video rounded-xl overflow-hidden border-2 border-indigo-500/40 bg-slate-900 shadow-2xl backdrop-blur-md">
        {isWebcamActive && webcamStream ? (
          <div className="relative w-full h-full">
            <video
              ref={webcamVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100" // Mirror webcam
            />
            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              CAM LIVE
            </div>
            {isWebcamMuted && (
              <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-xs text-rose-300 font-medium">
                Camera Muted
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-900/90">
            <VideoOff className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[11px] text-slate-300 font-medium">Webcam Off</span>
            <button
              onClick={onStartWebcam}
              className="mt-1 text-[10px] text-indigo-400 hover:text-indigo-300 underline font-medium"
            >
              Enable Camera
            </button>
          </div>
        )}
      </div>

      {/* 3. Bottom Video Controls Bar */}
      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-90 transition-opacity">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs text-slate-300">
            <Monitor className="w-3.5 h-3.5 text-indigo-400" />
            <span>Screen: {isScreenActive ? 'Active' : 'Disconnected'}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs text-slate-300">
            <Camera className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cam: {isWebcamActive ? 'Active' : 'Disconnected'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isWebcamActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleWebcam}
              icon={isWebcamMuted ? <VideoOff className="w-3.5 h-3.5 text-rose-400" /> : <Camera className="w-3.5 h-3.5" />}
              className="bg-black/50 border-white/10 text-xs"
            >
              {isWebcamMuted ? 'Unmute Cam' : 'Mute Cam'}
            </Button>
          )}
          {!isScreenActive && (
            <Button
              variant="primary"
              size="sm"
              onClick={onStartScreen}
              icon={<Monitor className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Share Screen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
