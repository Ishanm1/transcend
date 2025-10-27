import { useState, useRef, useCallback, useEffect } from 'react';

export const useSessionTimer = () => {
  const [sessionTime, setSessionTime] = useState(0);
  const timerRef = useRef(null);

  const start = useCallback(() => {
    // Always start from 0
    setSessionTime(0);
    
    // Start interval to count up
    timerRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
  }, []);

  const stopAndReset = useCallback(() => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Reset to 0 immediately
    setSessionTime(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return { sessionTime, start, stopAndReset };
};

