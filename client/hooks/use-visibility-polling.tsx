import { useEffect } from 'react';

// Simple hook to run a function periodically while the page is visible and online
export function useVisibilityPolling(fn: () => void | Promise<void>, intervalMs: number) {
  useEffect(() => {
    let intervalId: number | null = null;
    let isRunning = false;

    const start = () => {
      if (intervalId !== null) return;
      // Run once immediately
      void Promise.resolve().then(() => fn()).catch(() => {});
      intervalId = window.setInterval(() => {
        if (document.hidden || !navigator.onLine) return;
        if (isRunning) return;
        isRunning = true;
        Promise.resolve()
          .then(() => fn())
          .catch(() => {})
          .finally(() => {
            isRunning = false;
          });
      }, intervalMs) as unknown as number;
    };

    const stop = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', start);
    window.addEventListener('offline', stop);

    start();

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', start);
      window.removeEventListener('offline', stop);
    };
  }, [fn, intervalMs]);
}
