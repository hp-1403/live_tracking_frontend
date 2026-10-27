import { useState, useEffect, useRef, useCallback } from 'react';

interface UseIdleDetectorOptions {
  idleTimeoutSeconds?: number;
  onIdleStateChange?: (isIdle: boolean, idleSeconds: number) => void;
  onHeartbeat?: (status: 'active' | 'idle', idleSeconds: number) => void;
  heartbeatIntervalSeconds?: number;
}

export const useIdleDetector = ({
  idleTimeoutSeconds = 120, // 2 minutes of no input = idle
  onIdleStateChange,
  onHeartbeat,
  heartbeatIntervalSeconds = 15,
}: UseIdleDetectorOptions = {}) => {
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const [idleSeconds, setIdleSeconds] = useState<number>(0);
  const [isTabActive, setIsTabActive] = useState<boolean>(!document.hidden);

  const lastActivityTimestamp = useRef<number>(Date.now());
  const isIdleRef = useRef<boolean>(false);

  // Activity event handler
  const handleUserActivity = useCallback(() => {
    lastActivityTimestamp.current = Date.now();
    if (isIdleRef.current) {
      isIdleRef.current = false;
      setIsIdle(false);
      setIdleSeconds(0);
      if (onIdleStateChange) {
        onIdleStateChange(false, 0);
      }
    }
  }, [onIdleStateChange]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'scroll', 'mousedown', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    const handleVisibilityChange = () => {
      const active = !document.hidden;
      setIsTabActive(active);
      if (active) {
        handleUserActivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic check for idle timeout & heartbeat
    const ticker = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - lastActivityTimestamp.current) / 1000);
      setIdleSeconds(elapsedSeconds);

      if (elapsedSeconds >= idleTimeoutSeconds && !isIdleRef.current) {
        isIdleRef.current = true;
        setIsIdle(true);
        if (onIdleStateChange) {
          onIdleStateChange(true, elapsedSeconds);
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
  }, [handleUserActivity, idleTimeoutSeconds, heartbeatIntervalSeconds, onIdleStateChange, onHeartbeat, idleSeconds]);

  return {
    isIdle,
    idleSeconds,
    isTabActive,
    resetIdle: handleUserActivity,
  };
};
