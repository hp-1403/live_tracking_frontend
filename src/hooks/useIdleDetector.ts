import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '../services/socket';

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
    setIdleSeconds(0);
    if (isIdleRef.current) {
      isIdleRef.current = false;
      setIsIdle(false);
      if (onIdleStateChange) {
        onIdleStateChange(false, 0);
      }
    }
  }, [onIdleStateChange]);

  // =========================================================================
  // 1. SCREEN STREAM MOTION DETECTION (Works across all background tabs & windows)
  // When screen is shared ("Entire Screen"), any mouse move, typing,
  // or window switch in ANY other Chrome tab, window, or desktop app changes pixels.
  //
  // CRITICAL SMART FILTER:
  // - Excludes the top-left area where the "Work Shift Tracker" clock (00:06:10) is located.
  //   This ensures that the ticking clock digits NEVER reset the timer when sitting idle!
  // - Any real user activity in background tabs (scrolling pages, moving cursor, typing)
  //   changes pixels outside the timer area and immediately resets the timer to 0!
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
    let intervalId: any = null;

    // Offscreen sampling canvas (320x180)
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 180;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Video element placed in DOM (opacity 0.001, z-index -1)
    // Having it in the DOM guarantees Chromium never throttles or pauses frame decoding in background!
    const video = document.createElement('video');
    video.srcObject = screenStream;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.style.position = 'fixed';
    video.style.bottom = '0px';
    video.style.right = '0px';
    video.style.width = '320px';
    video.style.height = '180px';
    video.style.opacity = '0.001';
    video.style.pointerEvents = 'none';
    video.style.zIndex = '-1';
    document.body.appendChild(video);

    video.play().catch(() => {});

    let prevData: Uint8ClampedArray | null = null;

    const checkScreenMotion = () => {
      if (isDisposed) return;
      if (video.readyState >= 2 && ctx) {
        try {
          ctx.drawImage(video, 0, 0, 320, 180);
          const currentData = ctx.getImageData(0, 0, 320, 180).data;

          if (prevData && prevData.length === currentData.length) {
            let outsideTimerDiffCount = 0;
            let totalDiffCount = 0;

            // Sample every 2nd pixel (stride = 8 bytes: RGBA * 2) for high-sensitivity cursor & key typing detection
            for (let i = 0; i < currentData.length; i += 8) {
              const rDiff = Math.abs(currentData[i] - prevData[i]);
              const gDiff = Math.abs(currentData[i + 1] - prevData[i + 1]);
              const bDiff = Math.abs(currentData[i + 2] - prevData[i + 2]);

              if (rDiff + gDiff + bDiff > 28) {
                totalDiffCount++;
                const pixelIndex = i / 4;
                const x = pixelIndex % 320;
                const y = Math.floor(pixelIndex / 320);

                // Exclude the top-left area where the Work Shift Tracker clock is located (x: 0-210, y: 0-65)
                // This prevents the ticking clock digits (00:06:10 -> 00:06:11) from resetting the idle timer!
                const isInsideTimerArea = x < 210 && y < 65;
                if (!isInsideTimerArea) {
                  outsideTimerDiffCount++;
                }
              }
            }

            // Real user activity anywhere on the screen:
            // - Any mouse move, cursor click, typing letter, text caret blink, or scroll outside timer area
            if (outsideTimerDiffCount >= 3 || totalDiffCount >= 25) {
              handleUserActivity();
            }
          }
          prevData = new Uint8ClampedArray(currentData);
        } catch {
          // Ignore transient read errors
        }
      }
    };

    // Sample every 250ms (4 times per second for instant responsiveness)
    intervalId = setInterval(checkScreenMotion, 250);

    return () => {
      isDisposed = true;
      if (intervalId) clearInterval(intervalId);
      video.pause();
      video.srcObject = null;
      if (video.parentNode) {
        video.parentNode.removeChild(video);
      }
      setIsScreenMotionActive(false);
    };
  }, [screenStream, handleUserActivity]);

  // =========================================================================
  // 2. NATIVE IDLE DETECTOR API (OS-level mouse/keyboard across all apps)
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
  // 3. SYSTEM-WIDE LIVE KEYPAD AND MOUSE EVENT TRACKER (OS-Level via Socket)
  // Connects to the local native backend to monitor hardware keypad and mouse
  // activity across the ENTIRE macOS SYSTEM (all background tabs, windows, apps).
  // When user types or moves mouse ANYWHERE in the system, idle timer resets to 0.
  // =========================================================================
  useEffect(() => {
    const socket = getSocket();

    const handleSystemInput = () => {
      handleUserActivity();
    };

    socket.on('system-input-activity', handleSystemInput);

    return () => {
      socket.off('system-input-activity', handleSystemInput);
    };
  }, [handleUserActivity]);

  // =========================================================================
  // 4. LOCAL LIVE KEYPAD AND MOUSE EVENT TRACKER (In-Tab Fast-Path)
  // Real-time tracking of every keypad/keyboard keystroke and mouse event.
  // Captures:
  // - Keypad: keydown, keyup, keypress
  // - Mouse: mousemove, mousedown, mouseup, click, dblclick, contextmenu, wheel,
  //          pointerdown, pointermove, pointerup, scroll, touchstart, touchmove, touchend
  // Uses capture phase on both window and document to guarantee no child
  // component or input field can swallow the activity event.
  // Whenever any keypad or mouse event occurs, the idle timer immediately resets to 0.
  // =========================================================================
  useEffect(() => {
    const KEYPAD_EVENTS = ['keydown', 'keyup', 'keypress'] as const;
    const MOUSE_EVENTS = [
      'mousemove',
      'mousedown',
      'mouseup',
      'click',
      'dblclick',
      'contextmenu',
      'wheel',
      'pointerdown',
      'pointermove',
      'pointerup',
      'scroll',
      'touchstart',
      'touchmove',
      'touchend',
    ] as const;

    const allInputEvents = [...KEYPAD_EVENTS, ...MOUSE_EVENTS];
    const targets = [window, document];

    const handleLiveInputEvent = () => {
      handleUserActivity();
    };

    targets.forEach((target) => {
      allInputEvents.forEach((evt) => {
        target.addEventListener(evt, handleLiveInputEvent, {
          capture: true,
          passive: true,
        });
      });
    });

    return () => {
      targets.forEach((target) => {
        allInputEvents.forEach((evt) => {
          target.removeEventListener(evt, handleLiveInputEvent, {
            capture: true,
          } as any);
        });
      });
    };
  }, [handleUserActivity]);

  // =========================================================================
  // 4. TICKER & TIMEOUT ENGINE (1-second tick & heartbeat)
  // =========================================================================
  useEffect(() => {
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
        const currentIdleSecs = Math.floor((Date.now() - lastActivityTimestamp.current) / 1000);
        onHeartbeat(isIdleRef.current ? 'idle' : 'active', currentIdleSecs);
      }
    }, heartbeatIntervalSeconds * 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(ticker);
      clearInterval(heartbeatTicker);
    };
  }, [idleTimeoutSeconds, heartbeatIntervalSeconds, onIdleStateChange, onInactivityPause, onHeartbeat]);

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
