import { useCallback, useEffect, useRef, useState } from 'react';

const REVEAL_SECONDS = 5;

export function useDemoResultReveal() {
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const revealAfterCountdown = useCallback((reveal: () => void) => {
    clearTimer();
    let remaining = REVEAL_SECONDS;
    setCountdown(remaining);
    timerRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearTimer();
        setCountdown(null);
        reveal();
        return;
      }
      setCountdown(remaining);
    }, 1_000);
  }, [clearTimer]);

  const cancelReveal = useCallback(() => {
    clearTimer();
    setCountdown(null);
  }, [clearTimer]);

  return { countdown, revealAfterCountdown, cancelReveal };
}
