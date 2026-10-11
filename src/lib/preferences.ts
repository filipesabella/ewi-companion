import { useSyncExternalStore } from 'react';

const defaults = {
  'show-music-sheet': true,
  'show-next-fingering': true,
  'show-shortcuts': true,
};

export type Preference = keyof typeof defaults;

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const read = (key: Preference): boolean => {
  try {
    const value = localStorage.getItem(key);
    return value === null ? defaults[key] : value === 'true';
  } catch {
    return defaults[key];
  }
};

const write = (key: Preference, value: boolean): void => {
  try {
    localStorage.setItem(key, String(value));
  } catch (e) {
    console.error(e);
  }
  listeners.forEach(l => l());
};

export function usePreference(
  key: Preference,
): [boolean, (value: boolean) => void] {
  const value = useSyncExternalStore(subscribe, () => read(key));
  return [value, v => write(key, v)];
}
