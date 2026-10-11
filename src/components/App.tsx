import * as React from 'react';
import {
  createContext,
  useEffect,
  useState,
} from 'react';
import { Database } from '../db/Database';
import { Song } from '../db/Song';
import {
  MidiState,
  useMidi,
} from '../lib/useMidi';
import { Library } from './Library';
import { Practice } from './Practice';
import { SettingsDrawer } from './SettingsDrawer';
import { SongEditor } from './SongEditor';

const database = new Database();

export interface AppState {
  database: Database;
  noteBeingPlayed: number | null;
  midi: MidiState;
  openSettings: () => void;
  settingsOpen: boolean;
  // bumped whenever songs change outside of the current screen
  songsVersion: number;
  songsChanged: () => void;
}

export const AppContext = createContext<AppState>(null!);

export type Screen =
  | { name: 'library' }
  | { name: 'practice', song: Song, startAt: number }
  | { name: 'editor', song: Song, isNew: boolean };

export function App(): React.JSX.Element {
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>({ name: 'library' });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [songsVersion, setSongsVersion] = useState(0);
  const [noteBeingPlayed, setNoteBeingPlayed] = useState<number | null>(null);

  const midi = useMidi(setNoteBeingPlayed);

  useEffect(() => {
    database.initialize().then(_ => setLoading(false));

    // load a song on start for debugging, add ?song=<index> to url
    const songIndex = new URLSearchParams(window.location.search).get('song');
    if (songIndex) {
      database.listCurrentSongs().then(songs => {
        const song = songs[parseInt(songIndex)];
        song && setScreen({ name: 'practice', song, startAt: 0 });
      });
    }
  }, []);

  const state: AppState = {
    database,
    noteBeingPlayed,
    midi,
    openSettings: () => setSettingsOpen(true),
    settingsOpen,
    songsVersion,
    songsChanged: () => setSongsVersion(v => v + 1),
  };

  const goToLibrary = () => setScreen({ name: 'library' });

  return loading
    ? <div id="app" className="loading">Loading…</div>
    : <AppContext.Provider value={state}>
      <div id="app">
        {screen.name === 'library' && <Library go={setScreen} />}
        {screen.name === 'practice' && <Practice
          key={screen.song.id}
          song={screen.song}
          startAt={screen.startAt}
          goBack={goToLibrary} />}
        {screen.name === 'editor' && <SongEditor
          song={screen.song}
          isNew={screen.isNew}
          close={goToLibrary} />}
      </div>
      {settingsOpen && <SettingsDrawer close={() => setSettingsOpen(false)} />}
    </AppContext.Provider>;
}
