import { useEffect } from 'react';

type KeyHandlers = { [key: number]: (key: number) => void };

export function useHotkeys(
  keyPress: KeyHandlers,
  keyDown: KeyHandlers): void {
  useEffect(() => {
    function handleKeysPress(e: KeyboardEvent): void {
      const key = e.which;
      keyPress[key] && keyPress[key](key);
    }
    function handleKeysDown(e: KeyboardEvent): void {
      const key = e.which;
      keyDown[key] && keyDown[key](key);
    }
    window.addEventListener('keypress', handleKeysPress);
    window.addEventListener('keydown', handleKeysDown);

    return () => {
      window.removeEventListener('keypress', handleKeysPress);
      window.removeEventListener('keydown', handleKeysDown);
    };
  }, [keyPress, keyDown]);
}
