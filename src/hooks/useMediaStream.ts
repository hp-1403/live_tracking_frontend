import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseMediaStreamReturn {
  webcamStream: MediaStream | null;
  screenStream: MediaStream | null;
  isWebcamActive: boolean;
  isScreenActive: boolean;
  isWebcamMuted: boolean;
  isScreenPaused: boolean;
  startWebcam: () => Promise<MediaStream | null>;
  stopWebcam: () => void;
  startScreenShare: () => Promise<MediaStream | null>;
  stopScreenShare: () => void;
  startAllStreams: () => Promise<{ webcam: MediaStream | null; screen: MediaStream | null }>;
  stopAllStreams: () => void;
  toggleWebcamMute: () => void;
  error: string | null;
}

export const useMediaStream = (onScreenShareStoppedByUser?: () => void): UseMediaStreamReturn => {
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isWebcamMuted, setIsWebcamMuted] = useState<boolean>(false);
  const [isScreenPaused, setIsScreenPaused] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const webcamStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // 1. Start Webcam
  const startWebcam = useCallback(async (): Promise<MediaStream | null> => {
    try {
      setError(null);
      if (webcamStreamRef.current) {
        return webcamStreamRef.current;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 360 },
          frameRate: { ideal: 15, max: 20 },
        },
        audio: false,
      });

      webcamStreamRef.current = stream;
      setWebcamStream(stream);
      return stream;
    } catch (err: any) {
      const msg = err.name === 'NotAllowedError'
        ? 'Webcam permission denied. Please allow camera access in your browser.'
        : `Could not start webcam: ${err.message}`;
      setError(msg);
      console.error(msg, err);
      return null;
    }
  }, []);

  // 2. Stop Webcam
  const stopWebcam = useCallback(() => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((track) => track.stop());
      webcamStreamRef.current = null;
      setWebcamStream(null);
    }
  }, []);

  // 3. Start Screen Share
  const startScreenShare = useCallback(async (): Promise<MediaStream | null> => {
    try {
      setError(null);
      if (screenStreamRef.current) {
        return screenStreamRef.current;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { ideal: 15, max: 24 },
        } as MediaTrackConstraints,
        audio: false,
      });

      // Handle user clicking the native browser "Stop sharing" button
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          stopScreenShare();
          if (onScreenShareStoppedByUser) {
            onScreenShareStoppedByUser();
          }
        };
      }

      screenStreamRef.current = stream;
      setScreenStream(stream);
      return stream;
    } catch (err: any) {
      const msg = err.name === 'NotAllowedError'
        ? 'Screen sharing cancelled or permission denied.'
        : `Could not start screen capture: ${err.message}`;
      setError(msg);
      console.error(msg, err);
      return null;
    }
  }, [onScreenShareStoppedByUser]);

  // 4. Stop Screen Share
  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      setScreenStream(null);
    }
  }, []);

  // 5. Start All Streams (Webcam + Screen)
  const startAllStreams = useCallback(async () => {
    const webcam = await startWebcam();
    const screen = await startScreenShare();
    return { webcam, screen };
  }, [startWebcam, startScreenShare]);

  // 6. Stop All Streams
  const stopAllStreams = useCallback(() => {
    stopWebcam();
    stopScreenShare();
  }, [stopWebcam, stopScreenShare]);

  // Toggle Mute / Hide Webcam video
  const toggleWebcamMute = useCallback(() => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsWebcamMuted(!track.enabled);
      });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllStreams();
    };
  }, [stopAllStreams]);

  return {
    webcamStream,
    screenStream,
    isWebcamActive: !!webcamStream,
    isScreenActive: !!screenStream,
    isWebcamMuted,
    isScreenPaused,
    startWebcam,
    stopWebcam,
    startScreenShare,
    stopScreenShare,
    startAllStreams,
    stopAllStreams,
    toggleWebcamMute,
    error,
  };
};
