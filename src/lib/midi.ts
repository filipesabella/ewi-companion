import {
  Channel,
  invoke,
  isTauri,
} from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import {
  Input,
  WebMidi,
} from 'webmidi';

export interface MidiDevice {
  id: string;
  label: string;
}

type OnNote = (note: number | null) => void;

export interface Midi {
  // Calls onDevices with the current inputs and again whenever they change.
  // Resolves to a function that stops watching.
  watch: (onDevices: (devices: MidiDevice[]) => void) => Promise<() => void>;
  // Connecting to a device replaces any previous connection.
  connect: (id: string, onNote: OnNote) => Promise<void>;
}

const webMidiDevice = (input: Input): MidiDevice => ({
  id: input.id + input.name + input.manufacturer,
  label: input.name + (input.manufacturer ? ` (${input.manufacturer})` : ''),
});

const webMidi: Midi = {
  watch: async onDevices => {
    await WebMidi.enable();

    const emit = () => onDevices(WebMidi.inputs.map(webMidiDevice));
    emit();

    WebMidi.addListener('connected', emit);
    WebMidi.addListener('disconnected', emit);

    return () => {
      WebMidi.removeListener('connected', emit);
      WebMidi.removeListener('disconnected', emit);
    };
  },

  connect: async (id, onNote) => {
    WebMidi.inputs.forEach(input => {
      input.removeListener('noteon');
      input.removeListener('noteoff');
    });

    const input = WebMidi.inputs.find(i => webMidiDevice(i).id === id);
    input?.addListener('noteon', e => onNote(e.note.number));
    input?.addListener('noteoff', () => onNote(null));
  },
};

const tauriMidi: Midi = {
  watch: async onDevices => {
    const unlisten = await listen<MidiDevice[]>(
      'midi-inputs',
      e => onDevices(e.payload),
    );
    onDevices(await invoke<MidiDevice[]>('midi_inputs'));
    return unlisten;
  },

  connect: (id, onNote) =>
    invoke('midi_connect', { id, onNote: new Channel(onNote) }),
};

export const midi: Midi = isTauri() ? tauriMidi : webMidi;
