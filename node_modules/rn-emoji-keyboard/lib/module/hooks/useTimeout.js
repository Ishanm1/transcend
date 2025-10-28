import { useCallback, useEffect, useRef } from 'react';
export const useTimeout = () => {
  const timeoutRef = useRef(null);
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  return useCallback((callback, time) => {
    timeoutRef.current = setTimeout(callback, time);
  }, []);
};
//# sourceMappingURL=useTimeout.js.map