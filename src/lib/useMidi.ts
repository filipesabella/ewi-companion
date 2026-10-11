import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  midi,
  MidiDevice,
} from './midi';

export interface MidiState {
  status: 'starting' | 'ready' | 'unavailable';
  devices: MidiDevice[];
  connected: MidiDevice | null;
  lastNote: number | null;
  connect: (id: string) => void;
}

const deviceKey = 'midi-device';

const rememberedDevice = (): string | null => {
  try {
    return localStorage.getItem(deviceKey);
  } catch {
    return null;
  }
};

const rememberDevice = (id: string): void => {
  try {
    localStorage.setItem(deviceKey, id);
  } catch (e) {
    console.error(e);
  }
};

export function useMidi(onNote: (note: number | null) => void): MidiState {
  const [status, setStatus] = useState<MidiState['status']>('starting');
  const [devices, setDevices] = useState<MidiDevice[]>([]);
  const [connectedId, setConnectedId] = useState<string | null>(null);
  const [lastNote, setLastNote] = useState<number | null>(null);

  const latestOnNote = useRef(onNote);
  latestOnNote.current = onNote;

  const connect = useCallback((id: string) => {
    midi.connect(id, note => {
      latestOnNote.current(note);
      note !== null && setLastNote(note);
    })
      .then(() => {
        setConnectedId(id);
        rememberDevice(id);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const stopWatching = midi.watch(found => {
      setStatus('ready');
      setDevices(found);
      setConnectedId(id => found.some(d => d.id === id) ? id : null);
    }).catch(e => {
      console.error(e);
      setStatus('unavailable');
      return () => {};
    });

    return () => {
      stopWatching.then(stop => stop());
    };
  }, []);

  // reconnect to the last used device, or to the only one there is
  useEffect(() => {
    if (connectedId !== null) {
      return;
    }
    const remembered = devices.find(d => d.id === rememberedDevice());
    const device = remembered ?? (devices.length === 1 ? devices[0] : null);
    device && connect(device.id);
  }, [devices, connectedId]);

  return {
    status,
    devices,
    connected: devices.find(d => d.id === connectedId) ?? null,
    lastNote,
    connect,
  };
}
