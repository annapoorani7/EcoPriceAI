import { useCallback } from 'react';

export const useDebounce = (callback, delay = 500) => {
  let timeoutId = null;

  return useCallback((...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};
