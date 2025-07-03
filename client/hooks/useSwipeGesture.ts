import { useState, useRef, useEffect } from "react";

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minSwipeDistance?: number;
  preventDefaultTouchmove?: boolean;
}

interface SwipeState {
  isSwiping: boolean;
  swipeDirection: "left" | "right" | null;
  swipeDistance: number;
}

export function useSwipeGesture(options: SwipeGestureOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    minSwipeDistance = 50,
    preventDefaultTouchmove = true,
  } = options;

  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwiping: false,
    swipeDirection: null,
    swipeDistance: 0,
  });

  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = (e: TouchEvent | React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    setSwipeState({
      isSwiping: true,
      swipeDirection: null,
      swipeDistance: 0,
    });
  };

  const handleTouchMove = (e: TouchEvent | React.TouchEvent) => {
    if (
      preventDefaultTouchmove &&
      Math.abs(e.touches[0].clientX - touchStartX.current) > 10
    ) {
      e.preventDefault();
    }

    touchCurrentX.current = e.touches[0].clientX;
    const distance = touchCurrentX.current - touchStartX.current;
    const direction = distance > 0 ? "right" : "left";

    setSwipeState({
      isSwiping: true,
      swipeDirection: direction,
      swipeDistance: Math.abs(distance),
    });
  };

  const handleTouchEnd = (e: TouchEvent | React.TouchEvent) => {
    touchEndX.current = touchCurrentX.current;
    const distance = touchEndX.current - touchStartX.current;
    const absDistance = Math.abs(distance);

    if (absDistance >= minSwipeDistance) {
      if (distance > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (distance < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    setSwipeState({
      isSwiping: false,
      swipeDirection: null,
      swipeDistance: 0,
    });
  };

  const swipeHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  return {
    swipeHandlers,
    swipeState,
  };
}
