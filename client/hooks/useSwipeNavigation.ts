import { useEffect, useRef } from "react";

interface UseSwipeNavigationOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // Minimum distance (px) to trigger swipe
  enabled?: boolean;
}

/**
 * Hook for detecting swipe gestures on mobile devices
 * Useful for navigating booking steps with left/right swipes
 *
 * @example
 * const { ref } = useSwipeNavigation({
 *   onSwipeRight: () => console.log('Swiped right'),
 *   onSwipeLeft: () => console.log('Swiped left'),
 * });
 *
 * return <div ref={ref}>Swipeable content</div>;
 */
export function useSwipeNavigation({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  enabled = true,
}: UseSwipeNavigationOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const element = ref.current;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX.current = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const diff = touchStartX.current - touchEndX.current;
      const isLeftSwipe = diff > threshold;
      const isRightSwipe = diff < -threshold;

      if (isLeftSwipe) {
        onSwipeLeft?.();
      } else if (isRightSwipe) {
        onSwipeRight?.();
      }
    };

    element.addEventListener("touchstart", handleTouchStart, false);
    element.addEventListener("touchend", handleTouchEnd, false);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart, false);
      element.removeEventListener("touchend", handleTouchEnd, false);
    };
  }, [onSwipeLeft, onSwipeRight, threshold, enabled]);

  return { ref };
}

/**
 * Hook for detecting vertical swipe/pull-to-refresh gestures
 * Useful for pulling down to see booking summary on mobile
 */
export function useVerticalSwipe({
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  enabled = true,
}: {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  enabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const element = ref.current;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndY.current = e.changedTouches[0].screenY;
      handleSwipe();
    };

    const handleSwipe = () => {
      const diff = touchStartY.current - touchEndY.current;
      const isUpSwipe = diff > threshold;
      const isDownSwipe = diff < -threshold;

      if (isUpSwipe) {
        onSwipeUp?.();
      } else if (isDownSwipe) {
        onSwipeDown?.();
      }
    };

    element.addEventListener("touchstart", handleTouchStart, false);
    element.addEventListener("touchend", handleTouchEnd, false);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart, false);
      element.removeEventListener("touchend", handleTouchEnd, false);
    };
  }, [onSwipeUp, onSwipeDown, threshold, enabled]);

  return { ref };
}

/**
 * Hook for detecting combined horizontal and vertical swipes
 */
export function useSwipeDetection({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  enabled = true,
}: UseSwipeNavigationOptions & {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const element = ref.current;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.changedTouches[0].screenX;
      touchStartY.current = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX.current = e.changedTouches[0].screenX;
      touchEndY.current = e.changedTouches[0].screenY;
      handleSwipe();
    };

    const handleSwipe = () => {
      const diffX = touchStartX.current - touchEndX.current;
      const diffY = touchStartY.current - touchEndY.current;
      const absX = Math.abs(diffX);
      const absY = Math.abs(diffY);

      // Determine if swipe is more horizontal or vertical
      if (absX > absY) {
        // Horizontal swipe
        if (diffX > threshold) {
          onSwipeLeft?.();
        } else if (diffX < -threshold) {
          onSwipeRight?.();
        }
      } else {
        // Vertical swipe
        if (diffY > threshold) {
          onSwipeUp?.();
        } else if (diffY < -threshold) {
          onSwipeDown?.();
        }
      }
    };

    element.addEventListener("touchstart", handleTouchStart, false);
    element.addEventListener("touchend", handleTouchEnd, false);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart, false);
      element.removeEventListener("touchend", handleTouchEnd, false);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, enabled]);

  return { ref };
}
