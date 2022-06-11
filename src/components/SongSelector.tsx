import { Midi, Track } from '@tonejs/midi';
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
  const [midi, setMidi] = useState<Midi | null>(null);

  useEffect(() => {
    database.listCurrentSongs().then(setSongs);
  }, [reload]);

  const importFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0];
    const fileReader = new FileReader();
    fileReader.onload = _ => {
      const midi = importMidi(file.name, fileReader.result as Buffer);

      if (midi.tracks.length === 1) {
        database.save(midi).then(_ => setReload({}));
      } else {
        setMidi(midi);
      }
    };

    fileReader.readAsArrayBuffer(file);
  };

  const selectTrack = (t: Track) => {
    midi!.tracks = [t];
    database.save(midi!).then(_ => {
      setMidi(null);
      setReload({});
    });
  };

  const selectSong = (s: Song) => {
    database.song(s.id).then(s => setCurrentSong(s!));
  };

  const deleteSong = (s: Song) => {
    if (confirm('Delete this song?')) {
      database.deleteSong(s.id).then(_ => setReload({}));
    }
  };

  return <div className="songSelector">
    {songs === null && <div>Loading songs...</div>}
    {songs !== null && <div className="currentSongs">
      <h1>Songs</h1>
      {songs.map(song => songContainer(song, selectSong, deleteSong,))}
      {!midi && <div className="importButton">
        <input
          type="file"
          id="importFileInput"
          onChange={e => importFile(e)}
          accept="midi">
        </input>
        <label htmlFor="importFileInput">Import a MIDI file</label>
      </div>}
    </div>}
    {midi && <div className="trackSelector">
      <div className="tracks">
        <p>
          This midi file has more than one track, which one
          would you like to import?
        </p>
        <ul>
          {midi.tracks.map((t, i) => <li
            key={t.name + '-' + i}
            onClick={_ => selectTrack(t)}>
            {t.name || 'Track ' + i} - {t.instrument.name}
          </li>)}
        </ul>
        <p
          className="cancel"
          onClick={_ => setMidi(null)}>Cancel</p>
      </div>
    </div>}

  </div>;
}

function songContainer(
  s: Song,
  selectSong: (song: Song) => void,
  deleteSong: (song: Song) => void): JSX.Element {

  return <div
    key={s.id}
    className="song">
    <p
      className="title"
      onClick={_ => selectSong(s)}>
      {s.name}
    </p>
    <div className="actions">
      <button onClick={_ => deleteSong(s)}>edit</button>
      <button onClick={_ => deleteSong(s)}>delete</button>
    </div>
  </div>;
}
