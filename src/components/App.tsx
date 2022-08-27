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
    database.listCurrentSongs().then(songs => {
      // setCurrentSong(testSong);
      database.song(songs[0].id).then(s => {
        // setCurrentSong(s!);
      });
    });
  }, []);


  const app = loading
    ? <div className="app">Loading...</div>
    : <AppContext.Provider value={{ database, noteBeingPlayed, }}>
      <div className="app">
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

const notes = 'C C# D D# E F F# G G# A A# B'.split(' ');
const octaves = [/*0, 1, 2, */3, 4, 5, 6, 7, 8];

const testSong: Song = {
  id: '111',
  name: 'henlo',
  notes: octaves.flatMap(o => notes.map((n, ni) => ({
    id: `${n}${o}`,
    name: `${n}${o}`,
    midi: 24 + o * 12 + ni,
    preferredEwiFingering: null,
  }))),
  bookmarks: [],
};


const testSong2: Song = {
  id: '111',
  name: 'henlo',
  notes: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map((_, i) => ({
    id: `${i}`,
    name: 'A#4',
    midi: 58,
    preferredEwiFingering: null,
  })),
  bookmarks: [],
};
