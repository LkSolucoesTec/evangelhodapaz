import { useEffect, useRef, useState } from 'react';

export type ScrollDirection = 'up' | 'down' | 'idle';

interface UseScrollDirectionOptions {
  /** Scroll offset (px) before smart-hiding activates */
  topThreshold?: number;
  /** Minimum pixel delta to register a direction change (prevents jitter/flicker) */
  deltaThreshold?: number;
  /** Delay (ms) before automatically showing navbar after scrolling stops */
  idleDelayMs?: number;
  /** When true, prevents hiding (e.g. mobile menu open, keyboard focus, hover) */
  isLocked?: boolean;
}

interface UseScrollDirectionResult {
  scrollDirection: ScrollDirection;
  isVisible: boolean;
  isScrolled: boolean;
}

export function useScrollDirection({
  topThreshold = 96,
  deltaThreshold = 8,
  idleDelayMs = 700,
  isLocked = false,
}: UseScrollDirectionOptions = {}): UseScrollDirectionResult {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>('idle');
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const lastScrollYRef = useRef(0);
  const idleTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    setIsScrolled(window.scrollY > 24);

    const clearIdleTimer = () => {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };

    const scheduleIdleReveal = () => {
      clearIdleTimer();
      idleTimerRef.current = window.setTimeout(() => {
        setScrollDirection('idle');
        setIsVisible(true);
      }, idleDelayMs);
    };

    const handleScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        const currentY = Math.max(0, window.scrollY);
        const delta = currentY - lastScrollYRef.current;

        setIsScrolled(currentY > 24);

        if (currentY <= 24) {
          clearIdleTimer();
          setScrollDirection('up');
          setIsVisible(true);
        } else if (delta < -Math.abs(deltaThreshold - 2)) {
          clearIdleTimer();
          setScrollDirection('up');
          setIsVisible(true);
        } else if (delta > deltaThreshold && currentY > topThreshold) {
          setScrollDirection('down');
          setIsVisible(false);
          scheduleIdleReveal();
        } else if (currentY > topThreshold) {
          scheduleIdleReveal();
        }

        lastScrollYRef.current = currentY;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearIdleTimer();
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [topThreshold, deltaThreshold, idleDelayMs]);

  return {
    scrollDirection,
    isVisible: isLocked || isVisible,
    isScrolled,
  };
}
