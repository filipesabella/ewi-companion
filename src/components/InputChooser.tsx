import * as React from 'react';
import { useEffect, useState } from 'react';
import { Input, WebMidi } from 'webmidi';
import { useAwakeMouse } from '../lib/useAwakeMouse';
require('../styles/input-chooser.less');

interface Props {
  setNoteBeingPlayed: (note: number | null) => void;
}

export function InputChooser({ setNoteBeingPlayed }: Props): JSX.Element {
  const [showing, setShowing] = useState(true);
  const [availableInputs, setAvailableInputs] = useState<Input[]>([]);
  const [connectedToId, setConnectedToId] = useState<string | null>(null);

  useEffect(() => {
    WebMidi.enable().then(() => {
      const inputs = WebMidi.inputs;
      setAvailableInputs(inputs);

      if (inputs.length === 1) {
        selectInput(inputs[0]);
      }

      WebMidi.addListener('connected', () => {
        setAvailableInputs([...WebMidi.inputs]);
      });

      WebMidi.addListener('disconnected', () => {
        setAvailableInputs([...WebMidi.inputs]);
      });
    }).catch(err => alert(err));

    return () => {
      WebMidi.removeListener('connected');
      WebMidi.removeListener('disconnected');
    };
  }, []);

  const selectInput = (input: Input) => {
    setConnectedToId(id(input));

    input.addListener('disconnected', () => setConnectedToId(null));

    input.addListener('noteon', e => {
      setNoteBeingPlayed(e.note.number);
    });

    input.addListener('noteoff', () => {
      setNoteBeingPlayed(null);
    });
  }

  useAwakeMouse(
    () => setShowing(true),
    () => setShowing(false),
    () => 3000,
  );

  return <div id="input-chooser"
    style={{ display: showing || connectedToId === null ? 'block' : 'none' }}>
    {availableInputs.length === 0
      ? <div>No input devices found</div>
      : <div>
        <p>
          Available MIDI devices
          {connectedToId === null ? ' (click to connect)' : ''}
        </p>
        <ul>
          {availableInputs.map(i => <li key={id(i)}
            className={id(i) === connectedToId ? 'selected' : ''}
            onClick={() => selectInput(i)}>
            {i.name} {i.manufacturer ? `(${i.manufacturer})` : ''}
          </li>)}
        </ul>
      </div>}
  </div>;
}

function id(input: Input): string {
  return input.id + input.name + input.manufacturer;
}
