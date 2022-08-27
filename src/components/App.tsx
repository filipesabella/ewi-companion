import * as React from 'react';
import { createContext, useEffect, useState } from 'react';
import { Database } from '../db/Database';
import { Song } from '../db/Song';
import { InputChooser } from './InputChooser';
import { SongComponent } from './Song';
import { SongSelector } from './SongSelector';

const database = new Database();

export const AppContext = createContext({
  database,
  noteBeingPlayed: null as number | null,
});

export function App(): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  const [noteBeingPlayed, setNoteBeingPlayed] = useState<number | null>(null);

  useEffect(() => {
    database.initialize().then(_ => setLoading(false));

    // load a song on start for debugging
    const songIndex = window.location.search.split('?')[1]?.split('=')[1];
    if (songIndex) {
      database.listCurrentSongs().then(songs => {
        setCurrentSong(songs[parseInt(songIndex)]);
      });
    }
  }, []);


  const app = loading
    ? <div id="app">Loading...</div>
    : <AppContext.Provider value={{ database, noteBeingPlayed, }}>
      <div id="app">
        {!currentSong && <SongSelector
          setCurrentSong={setCurrentSong} />}
        {currentSong && <SongComponent
          goBack={() => setCurrentSong(null)}
          song={currentSong} />}
      </div>
      <InputChooser setNoteBeingPlayed={setNoteBeingPlayed} />
    </AppContext.Provider>;

  return app;
}
