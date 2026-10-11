import {
  useEffect,
  useRef,
} from 'react';

// keyed by `KeyboardEvent.key`, e.g. 'ArrowLeft', ' ' or 'b'
type Handlers = { [key: string]: (e: KeyboardEvent) => void };

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement
  && (target.isContentEditable
    || target.matches(
      'textarea, select, input:not([type=range], [type=checkbox], '
        + '[type=radio], [type=button], [type=file])',
    ));

export function useHotkeys(handlers: Handlers, enabled = true): void {
  // always call the latest handlers without re-registering the listener
  const latest = useRef(handlers);
  latest.current = handlers;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) {
        return;
      }
      const handler = latest.current[e.key];
      if (handler) {
        e.preventDefault();
        handler(e);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
