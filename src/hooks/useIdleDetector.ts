import { useState, useEffect, useRef, useCallback } from 'react';

interface UseIdleDetectorOptions {
  screenStream?: MediaStream | null;
  idleTimeoutSeconds?: number; // Default 180s (3 minutes)
  onIdleStateChange?: (isIdle: boolean, idleSeconds: number) => void;
  onInactivityPause?: () => void; // Triggered when inactive for 3 minutes
  onHeartbeat?: (status: 'active' | 'idle', idleSeconds: number) => void;
  heartbeatIntervalSeconds?: number;
}

export const useIdleDetector = ({
  screenStream,
  idleTimeoutSeconds = 180, // 3 minutes of total inactivity = idle & paused
  onIdleStateChange,
  onInactivityPause,
  onHeartbeat,
  heartbeatIntervalSeconds = 15,
}: UseIdleDetectorOptions = {}) => {
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const [idleSeconds, setIdleSeconds] = useState<number>(0);
  const [isTabActive, setIsTabActive] = useState<boolean>(!document.hidden);
  const [hasIdleDetectorPermission, setHasIdleDetectorPermission] = useState<boolean>(false);
  const [isScreenMotionActive, setIsScreenMotionActive] = useState<boolean>(false);

  const lastActivityTimestamp = useRef<number>(Date.now());
  const isIdleRef = useRef<boolean>(false);
  const isTabActiveRef = useRef<boolean>(!document.hidden);
  const hasTriggeredPauseRef = useRef<boolean>(false);
  const detectorRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Activity event handler to reset idle clock
  const handleUserActivity = useCallback(() => {
    lastActivityTimestamp.current = Date.now();
    hasTriggeredPauseRef.current = false;
    if (isIdleRef.current) {
      isIdleRef.current = false;
      setIsIdle(false);
      setIdleSeconds(0);
      if (onIdleStateChange) {
        onIdleStateChange(false, 0);
      }
    }
  }, [onIdleStateChange]);

  // =========================================================================
  // 1. SCREEN STREAM MOTION DETECTION (Unthrottled Background Detection)
  // When screen is shared ("Entire Screen"), any mouse move, typing,
  // or window switch in ANY other tab (Chrome, Brave) or desktop app changes pixels.
  // We use WebCodecs MediaStreamTrackProcessor (raw frames, never throttled by Chromium)
  // with a fallback to in-viewport video element canvas diffing.
  // =========================================================================
  useEffect(() => {
    if (!screenStream) {
      setIsScreenMotionActive(false);
      return;
    }

    const videoTrack = screenStream.getVideoTracks()[0];
    if (!videoTrack || videoTrack.readyState === 'ended') {
      setIsScreenMotionActive(false);
      return;
    }

    setIsScreenMotionActive(true);
    let isDisposed = false;
    let trackReader: any = null;
    let intervalId: any = null;
    let fallbackVideo: HTMLVideoElement | null = null;

    // Canvas for sampling (160x90 = 14,400 pixels for microsecond comparisons)
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 90;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let prevData: Uint8ClampedArray | null = null;

    const processPixelDiff = (currentData: Uint8ClampedArray) => {
      if (prevData && prevData.length === currentData.length) {
        let diffCount = 0;
        // Sample every 4th pixel (stride = 16 bytes: RGBA * 4)
        for (let i = 0; i < currentData.length; i += 16) {
          const rDiff = Math.abs(currentData[i] - prevData[i]);
          const gDiff = Math.abs(currentData[i + 1] - prevData[i + 1]);
          const bDiff = Math.abs(currentData[i + 2] - prevData[i + 2]);

          if (rDiff + gDiff + bDiff > 35) {
            diffCount++;
            // 3 sampled pixels with contrast diff = genuine cursor move or keypress
            if (diffCount >= 3) {
              handleUserActivity();
              break;
            }
          }
        }
      }
      prevData = new Uint8ClampedArray(currentData);
    };

    // METHOD A: WebCodecs MediaStreamTrackProcessor (Native Chromium raw frames)
    if ('MediaStreamTrackProcessor' in window) {
      try {
        const processor = new (window as any).MediaStreamTrackProcessor({ track: videoTrack });
        trackReader = processor.readable.getReader();
        let lastSampleTime = 0;

        const readFrames = async () => {
          while (!isDisposed) {
            try {
              const { done, value: videoFrame } = await trackReader.read();
              if (done || !videoFrame) break;

              const now = Date.now();
              // Sample at most once every 400ms to keep CPU near 0%
              if (now - lastSampleTime >= 400 && ctx) {
                lastSampleTime = now;
                try {
                  ctx.drawImage(videoFrame, 0, 0, 160, 90);
                  const currentData = ctx.getImageData(0, 0, 160, 90).data;
                  processPixelDiff(currentData);
                } catch {
                  // Ignore frame read errors
                }
              }
              videoFrame.close();
            } catch {
              break;
            }
          }
        };

        readFrames();
      } catch (err) {
        console.warn('MediaStreamTrackProcessor unavailable, falling back to video:', err);
      }
    }

    // METHOD B: Fallback using rendered video element (kept in viewport to prevent Chromium throttling)
    if (!trackReader) {
      const video = document.createElement('video');
      video.srcObject = screenStream;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      // Keep in DOM viewport with near-zero opacity so Chromium compositor never suspends decoding
      video.style.position = 'fixed';
      video.style.bottom = '0px';
      video.style.right = '0px';
      video.style.width = '320px';
      video.style.height = '180px';
      video.style.opacity = '0.001';
      video.style.pointerEvents = 'none';
      video.style.zIndex = '-1';
      document.body.appendChild(video);
      fallbackVideo = video;

      video.play().catch(() => {});

      const checkVideoDiff = () => {
        if (isDisposed) return;
        if (video.readyState >= 2 && ctx) {
          try {
            ctx.drawImage(video, 0, 0, 160, 90);
            const currentData = ctx.getImageData(0, 0, 160, 90).data;
            processPixelDiff(currentData);
          } catch {}
        }
      };

      intervalId = setInterval(checkVideoDiff, 400);
    }

    return () => {
      isDisposed = true;
      if (trackReader) {
        try {
          trackReader.cancel();
        } catch {}
      }
      if (intervalId) clearInterval(intervalId);
      if (fallbackVideo) {
        fallbackVideo.pause();
        fallbackVideo.srcObject = null;
        if (fallbackVideo.parentNode) {
          fallbackVideo.parentNode.removeChild(fallbackVideo);
        }
      }
      setIsScreenMotionActive(false);
    };
  }, [screenStream, handleUserActivity]);

  // =========================================================================
  // 2. NATIVE IDLE DETECTOR API (Option B)
  // Queries OS-level user activity (mouse / keyboard across the entire system)
  // =========================================================================
  const startIdleDetectorInstance = useCallback(async () => {
    if (!('IdleDetector' in window)) return false;

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const detector = new (window as any).IdleDetector();

      detector.addEventListener('change', () => {
        const userState = detector.userState;     // 'active' | 'idle'
        const screenState = detector.screenState; // 'locked' | 'unlocked'

        if (userState === 'active' && screenState === 'unlocked') {
          handleUserActivity();
        }
      });

      await detector.start({
        threshold: 60000,
        signal: abortControllerRef.current.signal,
      });

      detectorRef.current = detector;
      setHasIdleDetectorPermission(true);
      return true;
    } catch (e: any) {
      console.warn('Could not start IdleDetector:', e.message);
      return false;
    }
  }, [handleUserActivity]);

  const requestIdleDetectorPermission = useCallback(async () => {
    if (!('IdleDetector' in window)) return false;
    try {
      const permission = await (window as any).IdleDetector.requestPermission();
      if (permission === 'granted') {
        setHasIdleDetectorPermission(true);
        return await startIdleDetectorInstance();
      }
    } catch (e: any) {
      console.warn('IdleDetector requestPermission error:', e.message);
    }
    return false;
  }, [startIdleDetectorInstance]);

  // Try starting IdleDetector on mount if permission already granted
  useEffect(() => {
    const checkExistingPermission = async () => {
      if (!('IdleDetector' in window)) return;
      try {
        if ('permissions' in navigator) {
          const status = await (navigator.permissions as any).query({ name: 'idle-detection' });
          if (status.state === 'granted') {
            await startIdleDetectorInstance();
          }
        }
      } catch {
        // Fallback or permission check unsupported
      }
    };

    checkExistingPermission();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [startIdleDetectorInstance]);

  // Global one-time click listener to auto-request permission on user interaction
  useEffect(() => {
    if (hasIdleDetectorPermission) return;

    const autoPrompt = async () => {
      if ('IdleDetector' in window && !hasIdleDetectorPermission) {
        try {
          await requestIdleDetectorPermission();
        } catch {}
      }
    };

    window.addEventListener('click', autoPrompt, { once: true });
    return () => {
      window.removeEventListener('click', autoPrompt);
    };
  }, [hasIdleDetectorPermission, requestIdleDetectorPermission]);

  // =========================================================================
  // 3. LOCAL DOM LISTENERS & TICKER (Fast-path + Ticker Engine)
  // =========================================================================
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'scroll', 'mousedown', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    const handleVisibilityChange = () => {
      const active = !document.hidden;
      isTabActiveRef.current = active;
      setIsTabActive(active);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic check for 3-minute idle timeout & auto-pause
    const ticker = setInterval(() => {
      // If user is working in another tab or app (!isTabActiveRef.current)
      // and OS IdleDetector confirms the user is active in the OS:
      if (!isTabActiveRef.current && detectorRef.current && detectorRef.current.userState === 'active') {
        lastActivityTimestamp.current = Date.now();
      }

      const elapsedSeconds = Math.floor((Date.now() - lastActivityTimestamp.current) / 1000);
      setIdleSeconds(elapsedSeconds);

      // Inactivity threshold reached (3 minutes = 180 seconds)
      if (elapsedSeconds >= idleTimeoutSeconds) {
        if (!isIdleRef.current) {
          isIdleRef.current = true;
          setIsIdle(true);
          if (onIdleStateChange) {
            onIdleStateChange(true, elapsedSeconds);
          }
        }

        // Trigger automatic shift pause if not already triggered for this idle spell
        if (!hasTriggeredPauseRef.current && onInactivityPause) {
          hasTriggeredPauseRef.current = true;
          onInactivityPause();
        }
      }
    }, 1000);

    // Heartbeat ticker
    const heartbeatTicker = setInterval(() => {
      if (onHeartbeat) {
        onHeartbeat(isIdleRef.current ? 'idle' : 'active', idleSeconds);
      }
    }, heartbeatIntervalSeconds * 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(ticker);
      clearInterval(heartbeatTicker);
    };
  }, [handleUserActivity, idleTimeoutSeconds, heartbeatIntervalSeconds, onIdleStateChange, onInactivityPause, onHeartbeat, idleSeconds]);

  return {
    isIdle,
    idleSeconds,
    isTabActive,
    isScreenMotionActive,
    hasIdleDetectorPermission,
    requestIdleDetectorPermission,
    resetIdle: handleUserActivity,
  };
};
