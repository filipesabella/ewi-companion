import * as React from 'react';
import { useEffect, useState } from 'react';
import { Database } from '../db/Database';
import { Song } from '../db/Song';
import { importMidi } from '../lib/MidiImporter';

require('../styles/song-selector.less');

interface Props {
  database: Database;
  setCurrentSong: (song: Song) => void;
}

export function SongSelector({
  database,
  setCurrentSong, }: Props): JSX.Element {
  const [songs, setSongs] = useState<Song[] | null>(null);
  const [reload, setReload] = useState({});

  useEffect(() => {
    database.listCurrentSongs().then(setSongs);
  }, [reload]);

  function songContainer(s: Song): JSX.Element {
    return <div
      key={s.id}
      className="song">
      <p
        className="title"
        onClick={_ => database.song(s.id).then(s => setCurrentSong(s!))}>
        {s.name}</p>
    </div>;
  }

  const importFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0];
    const fileReader = new FileReader();
    fileReader.onload = _ => {
      const midi = importMidi(file.name, fileReader.result as Buffer);
      database.save(midi).then(_ => setReload({}));
    };
    fileReader.readAsArrayBuffer(file);
  };

  return <div className="songSelector">
    {songs === null && <div>Loading songs...</div>}
    {songs !== null && <div className="currentSongs">
      <h1>Songs</h1>
      {songs.map(songContainer)}
      <div className="importButton">
        <input
          type="file"
          id="importFileInput"
          onChange={e => importFile(e)}
          accept="midi">
        </input>
        <label htmlFor="importFileInput">Import a MIDI file</label>
      </div>
    </div>}
  </div>;
}
