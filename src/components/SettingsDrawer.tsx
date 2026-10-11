import * as React from 'react';
import {
  useContext,
  useRef,
  useState,
} from 'react';
import {
  isSongList,
  Song,
} from '../db/Song';
import { icons } from '../icons';
import {
  Preference,
  usePreference,
} from '../lib/preferences';
import { useHotkeys } from '../lib/useHotkeys';
import { plural } from '../lib/utils';
import { AppContext } from './App';
import { DeviceList } from './MidiControls';

import '../styles/settings-drawer.scss';

interface Props {
  close: () => void;
}

type Restore =
  | { state: 'idle' }
  | { state: 'confirming', songs: Song[], current: number }
  | { state: 'done', count: number }
  | { state: 'failed', message: string };

export function SettingsDrawer({ close }: Props): React.JSX.Element {
  const { database, songsChanged } = useContext(AppContext);
  const [restore, setRestore] = useState<Restore>({ state: 'idle' });
  const fileInput = useRef<HTMLInputElement>(null);

  useHotkeys({ Escape: close });

  const backUp = async () => {
    const blob = new Blob([await database.toJSON()], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ewi-companion-${
      new Date().toISOString().slice(0, 10)
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const pickBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) {
      return;
    }

    try {
      const songs: unknown = JSON.parse(await file.text());
      if (!isSongList(songs)) {
        throw new Error('not a list of songs');
      }
      const current = (await database.listCurrentSongs()).length;
      setRestore({ state: 'confirming', songs, current });
    } catch (error) {
      console.error(error);
      setRestore({
        state: 'failed',
        message: `${file.name} isn't a backup made by EWI Companion.`,
      });
    }
  };

  const confirmRestore = async (songs: Song[]) => {
    const ok = await database.import(songs);
    setRestore(
      ok
        ? { state: 'done', count: songs.length }
        : { state: 'failed', message: 'Restoring failed, nothing changed.' },
    );
    ok && songsChanged();
  };

  return <div className="settings-layer">
    <div className="scrim" onClick={close}></div>
    <aside
      className="settings-drawer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title">
      <div className="drawer-header">
        <h2 id="settings-title">Settings</h2>
        <button
          type="button"
          className="icon-button"
          aria-label="Close settings"
          autoFocus
          onClick={close}>
          {icons.close}
        </button>
      </div>

      <div className="drawer-body">
        <fieldset className="drawer-section">
          <legend className="eyebrow">MIDI input</legend>
          <DeviceList />
        </fieldset>

        <fieldset className="drawer-section switches">
          <legend className="eyebrow">Practice</legend>
          <Switch
            preference="show-music-sheet"
            label="Show the staff"
            description="Notes on a treble staff, around the one you're playing" />
          <Switch
            preference="show-next-fingering"
            label="Show the next fingering"
            description="A dimmed preview of the note after this one" />
          <Switch
            preference="show-shortcuts"
            label="Show keyboard shortcuts"
            description="The hint row at the bottom of the practice screen" />
        </fieldset>

        <section className="drawer-section" aria-labelledby="data-title">
          <h3 id="data-title" className="eyebrow">Your songs</h3>
          <button type="button" className="action-card" onClick={backUp}>
            {icons.download}
            <span className="action-text">
              <span className="action-title">Back up all songs</span>
              <span className="action-description">
                Saves a .json file with every song and bookmark
              </span>
            </span>
          </button>
          <button
            type="button"
            className="action-card"
            onClick={() => fileInput.current?.click()}>
            {icons.upload}
            <span className="action-text">
              <span className="action-title">Restore from a backup</span>
              <span className="action-description">
                Pick a .json file saved from here. It replaces all your songs.
              </span>
            </span>
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={pickBackup} />

          {restore.state === 'confirming' && <div
            className="restore-confirm"
            role="alert">
            <p>
              Replace your {plural(restore.current, 'song')} with the{' '}
              {plural(restore.songs.length, 'song')}{' '}
              in this backup? Songs that aren't in the backup will be gone.
            </p>
            <div className="button-row">
              <button
                type="button"
                className="button danger"
                onClick={() => confirmRestore(restore.songs)}>
                Replace songs
              </button>
              <button
                type="button"
                className="button"
                onClick={() => setRestore({ state: 'idle' })}>
                Cancel
              </button>
            </div>
          </div>}
          {restore.state === 'done'
            && <p className="restore-result" role="status">
              {icons.check}
              Restored {plural(restore.count, 'song')}.
            </p>}
          {restore.state === 'failed' && <p
            className="restore-result error"
            role="alert">
            {icons.alert}
            {restore.message}
          </p>}
        </section>
      </div>
    </aside>
  </div>;
}

interface SwitchProps {
  preference: Preference;
  label: string;
  description: string;
}

function Switch({
  preference,
  label,
  description,
}: SwitchProps): React.JSX.Element {
  const [value, setValue] = usePreference(preference);

  return <label className="switch-row">
    <span className="switch-text">
      <span className="switch-label">{label}</span>
      <span className="switch-description">{description}</span>
    </span>
    <input
      type="checkbox"
      role="switch"
      checked={value}
      onChange={e => setValue(e.target.checked)} />
    <span className="switch" aria-hidden="true"></span>
  </label>;
}
