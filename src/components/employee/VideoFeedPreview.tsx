import React, { useEffect, useRef } from 'react';
import { Camera, Monitor, VideoOff } from 'lucide-react';
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
    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-300 shadow-md aspect-video flex items-center justify-center group">
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
        <div className="flex flex-col items-center justify-center p-4 sm:p-8 text-center max-w-xs sm:max-w-md">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-3 sm:mb-4 text-indigo-400">
            <Monitor className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h4 className="text-base sm:text-lg 2xl:text-xl font-semibold text-slate-100 mb-1">Screen Sharing Inactive</h4>
          <p className="text-xs sm:text-sm text-slate-400 mb-4 sm:mb-6">
            To fulfill employee live monitoring requirements, please share your entire screen during your shift.
          </p>
          <Button
            onClick={onStartScreen}
            variant="primary"
            size="sm"
            icon={<Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            className="text-xs sm:text-sm"
          >
            Select Screen to Share
          </Button>
        </div>
      )}

      {/* 2. Floating Picture-in-Picture Webcam View */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 w-28 sm:w-44 lg:w-56 2xl:w-64 aspect-video rounded-lg sm:rounded-xl overflow-hidden border sm:border-2 border-indigo-500 bg-slate-900 shadow-xl">
        {isWebcamActive && webcamStream ? (
          <div className="relative w-full h-full">
            <video
              ref={webcamVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100" // Mirror webcam
            />
            <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 px-1 sm:px-1.5 py-0.5 rounded bg-black/70 text-[8px] sm:text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              CAM LIVE
            </div>
            {isWebcamMuted && (
              <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-[10px] sm:text-xs text-rose-300 font-medium">
                Camera Muted
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-1.5 sm:p-3 text-center bg-slate-900">
            <VideoOff className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-400 mb-0.5 sm:mb-1" />
            <span className="text-[9px] sm:text-[11px] text-slate-200 font-medium">Webcam Off</span>
            <button
              onClick={onStartWebcam}
              className="mt-0.5 text-[8px] sm:text-[10px] text-indigo-400 hover:text-indigo-300 underline font-medium"
            >
              Enable Camera
            </button>
          </div>
        )}
      </div>

      {/* 3. Bottom Video Controls Bar */}
      <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-4 bg-gradient-to-t from-black/85 via-black/50 to-transparent flex flex-col sm:flex-row gap-2 sm:gap-0 items-stretch sm:items-center justify-between opacity-95">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] sm:text-xs text-slate-200">
            <Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400" />
            <span>Screen: {isScreenActive ? 'Active' : 'Off'}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] sm:text-xs text-slate-200">
            <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400" />
            <span>Cam: {isWebcamActive ? 'Active' : 'Off'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {isWebcamActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleWebcam}
              icon={isWebcamMuted ? <VideoOff className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400" /> : <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
              className="bg-black/60 border-white/20 text-white text-[11px] sm:text-xs hover:bg-black/80 flex-1 sm:flex-initial py-1 sm:py-1.5"
            >
              {isWebcamMuted ? 'Unmute' : 'Mute'}
            </Button>
          )}
          {!isScreenActive && (
            <Button
              variant="primary"
              size="sm"
              onClick={onStartScreen}
              icon={<Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
              className="text-[11px] sm:text-xs flex-1 sm:flex-initial py-1 sm:py-1.5"
            >
              Share Screen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
