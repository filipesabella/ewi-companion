import * as React from 'react';
import {
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { icons } from '../icons';
import { midi as midiApi } from '../lib/midi';
import { displayNoteName } from '../lib/utils';
import { AppContext } from './App';

import '../styles/midi-controls.scss';

// Radio cards to pick the MIDI input, used in the pill popover and settings
export function DeviceList(): React.JSX.Element {
  const { midi } = useContext(AppContext);

  if (midi.status === 'unavailable') {
    return <p className="device-note error">{midiApi.unavailableMessage}</p>;
  }

  return <>
    {midi.devices.length === 0 && <p className="device-note">
      {midi.status === 'starting'
        ? 'Looking for MIDI devices…'
        : 'No MIDI devices found.'}
    </p>}
    {midi.devices.map(device => {
      const selected = device.id === midi.connected?.id;
      return <label
        key={device.id}
        className={'device' + (selected ? ' selected' : '')}>
        <input
          type="radio"
          name="midi-device"
          checked={selected}
          onChange={() => midi.connect(device.id)} />
        <span className="device-text">
          <span className="device-name">{device.label}</span>
          {selected && <span className="device-status">
            <span className="status-dot connected"></span>
            Connected{midi.lastNote !== null
              && ` · last note ${displayNoteName(midi.lastNote)}`}
          </span>}
        </span>
      </label>;
    })}
    <p className="device-note">
      Devices show up here as soon as you plug them in. Play a note to check the
      connection.
    </p>
  </>;
}

export function MidiPill(): React.JSX.Element {
  const { midi } = useContext(AppContext);
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (e: PointerEvent) =>
      container.current?.contains(e.target as Node) || setOpen(false);
    const onKeyDown = (e: KeyboardEvent) =>
      e.key === 'Escape' && setOpen(false);

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open]);

  const [label, dot] = midi.status === 'unavailable'
    ? ['MIDI unavailable', 'error']
    : midi.connected
    ? [midi.connected.label, 'connected']
    : midi.devices.length > 0
    ? ['Choose a MIDI input', 'idle']
    : ['No MIDI device', 'idle'];

  return <div className="midi-pill" ref={container}>
    <button
      type="button"
      className="pill"
      aria-expanded={open}
      aria-haspopup="true"
      onClick={() => setOpen(!open)}>
      <span className={'status-dot ' + dot}></span>
      <span className="pill-label">{label}</span>
      {icons.chevronDown}
    </button>
    {open && <div className="popover" role="group" aria-label="MIDI input">
      <DeviceList />
    </div>}
  </div>;
}

export function SettingsButton(): React.JSX.Element {
  const { openSettings } = useContext(AppContext);
  return <button
    type="button"
    className="icon-button"
    aria-label="Settings"
    onClick={openSettings}>
    {icons.settings}
  </button>;
}
