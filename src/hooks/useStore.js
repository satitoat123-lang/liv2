import { useState, useEffect, useCallback } from 'react';
import Store from '../data/store';

/**
 * React hook that subscribes to Store updates.
 * Re-renders the component whenever Store.notify() is called.
 */
export function useStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = Store.subscribe(() => setTick(t => t + 1));
    return unsub;
  }, []);

  return Store;
}

/**
 * Simple timer hook (for booking countdown)
 */
export function useCountdown(seconds) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const start = useCallback(() => {
    setTimeLeft(seconds);
    setIsRunning(true);
  }, [seconds]);

  const stop = useCallback(() => setIsRunning(false), []);

  const formatTime = useCallback(() => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  return { timeLeft, formatTime, start, stop, isRunning };
}
