import * as React from 'react';
import {
  useEffect,
  useState,
} from 'react';
import {
  midi,
  MidiDevice,
} from '../lib/midi';
import { useAwakeMouse } from '../lib/useAwakeMouse';

import '../styles/input-chooser.scss';

interface Props {
  setNoteBeingPlayed: (note: number | null) => void;
}

export function InputChooser({ setNoteBeingPlayed }: Props): React.JSX.Element {
  const [showing, setShowing] = useState(true);
  const [availableInputs, setAvailableInputs] = useState<MidiDevice[]>([]);
  const [connectedToId, setConnectedToId] = useState<string | null>(null);

  useEffect(() => {
    const stopWatching = midi.watch(devices => {
      setAvailableInputs(devices);
      setConnectedToId(id => devices.some(d => d.id === id) ? id : null);

      if (devices.length === 1) {
        selectInput(devices[0]);
      }
    }).catch(e => {
      console.error(e);

      const message = 'Sadly, the MIDI api does not work on this browser, '
        + 'please try with Chrome/Edge/Brave.';

      alert(message);

      return () => {};
    });

    return () => {
      stopWatching.then(stop => stop());
    };
  }, []);

  const selectInput = (device: MidiDevice) =>
    midi.connect(device.id, setNoteBeingPlayed)
      .then(() => setConnectedToId(device.id))
      .catch(console.error);

  useAwakeMouse(
    () => setShowing(true),
    () => setShowing(false),
    () => 3000,
  );

  return <div
    id="input-chooser"
    style={{ display: showing || connectedToId === null ? 'block' : 'none' }}>
    {availableInputs.length === 0
      ? <div>No input devices found</div>
      : <>
        <p>
          Available MIDI devices:
          {connectedToId === null ? ' (click to connect)' : ''}
        </p>
        <ul>
          {availableInputs.map(device => {
            const connected = device.id === connectedToId;

            return <li
              key={device.id}
              className={connected ? 'selected' : ''}
              onClick={() => selectInput(device)}>
              {device.label}
              {connected ? ' (connected)' : ''}
            </li>;
          })}
        </ul>
      </>}
  </div>;
}
