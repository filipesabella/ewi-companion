import { useEffect } from 'react';

type KeyHandlers = { [key: number]: (key: number, e: KeyboardEvent) => void };

/**
 * A hook that shows and auto-hides an element when the user moves the mouse.
 */
export function useAwakeMouse(
  show: () => void,
  hide: () => void,
  time?: (e: MouseEvent) => number): void {
  useEffect(() => {
    let timeoutId = 0;
    const listener = (e: MouseEvent) => {
      show();
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => hide(), time ? time(e) : 1000);
    };
    document.addEventListener('mousemove', listener);

    return () => document.removeEventListener('mousemove', listener);
  }, []);;
}
