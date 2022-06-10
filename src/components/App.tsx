import * as React from 'react';
import { useEffect, useState } from 'react';
import { Database } from '../db/Database';
import { Song } from '../db/Song';
import { SongComponent } from './Song';
import { SongSelector } from './SongSelector';

const database = new Database();

export function App(): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  useEffect(() => {
    database.initialize().then(_ => setLoading(false));

    // load a song on start for debugging
    database.listCurrentSongs().then(songs => {
      // setCurrentSong(testSong);
      // database.song(songs[0].id).then(s => {
      //   setCurrentSong(s!);
      // });
    });
  }, []);

  const app = loading
    ? <div className="app">Loading...</div>
    : <div className="app">
      {!currentSong && <SongSelector
        database={database}
        setCurrentSong={setCurrentSong} />}
      {currentSong && <SongComponent
        goBack={() => setCurrentSong(null)}
        song={currentSong}
        database={database} />}
    </div>;

  return app;
}
