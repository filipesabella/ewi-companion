import { Midi, Track } from '@tonejs/midi';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { Song } from '../db/Song';
import { importMidi } from '../lib/MidiImporter';
import { uuid } from '../lib/utils';
import { AppContext } from './App';
import { Settings } from './Settings';
import { SongEdit } from './SongEdit';

import '../styles/song-selector.less';

interface Props {
  setCurrentSong: (song: Song) => void;
}

export function SongSelector({
  setCurrentSong, }: Props): JSX.Element {
  const { database } = useContext(AppContext);

  const [songs, setSongs] = useState<Song[] | null>(null);
  const [reload, setReload] = useState({});
  const [midi, setMidi] = useState<Midi | null>(null);
  const [songToEdit, setSongToEdit] = useState<Song | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  useEffect(() => {
    database.listCurrentSongs().then(setSongs);
  }, [reload]);

  const importFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0];
    const fileReader = new FileReader();
    fileReader.onload = _ => {
      const midi = importMidi(file.name, fileReader.result as Buffer);

      if (midi.tracks.length === 1) {
        setSongToEdit({
          id: uuid(),
          name: midi.name,
          notes: midi.tracks[0].notes.map(n => ({
            id: uuid(),
            midi: n.midi,
            preferredEwiFingering: null,
          })),
          bookmarks: [],
        });
      } else {
        setMidi(midi);
      }
    };

    fileReader.readAsArrayBuffer(file);
  };

  const selectTrack = (t: Track) => {
    setSongToEdit({
      id: uuid(),
      name: midi!.name + ' - ' + t.name,
      notes: t.notes.map(n => ({
        id: uuid(),
        name: n.name,
        midi: n.midi,
        preferredEwiFingering: null,
      })),
      bookmarks: [],
    })
  };

  const selectSong = (s: Song) => {
    database.song(s.id).then(s => setCurrentSong(s!));
  };

  const deleteSong = (s: Song) => {
    if (confirm('Delete this song?')) {
      database.deleteSong(s.id).then(_ => setReload({}));
    }
  };

  const newSong = () => {
    setSongToEdit({
      id: uuid(),
      name: '',
      notes: [],
      bookmarks: [],
    });
  };

  return <div id="songSelector">
    {songs === null && <div>Loading songs...</div>}
    {songs !== null && <div className="currentSongs">
      <h1>Songs</h1>
      {songs.map(song =>
        songContainer(song, selectSong, setSongToEdit, deleteSong))}
      {!midi && <div className="actions">
        <div className="importButton">
          <input
            type="file"
            id="importFileInput"
            onChange={e => importFile(e)}
            accept="midi">
          </input>
          <label htmlFor="importFileInput">Import a MIDI file</label>
        </div>
        <div><label onClick={() => newSong()}>Write song</label></div>
        <div><label onClick={() => setShowSettings(true)}>Settings</label></div>
      </div>}
    </div>}
    {showSettings && <Settings close={() => setShowSettings(false)} />}
    {midi && <div className="track-selector">
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
    {songToEdit && <SongEdit song={songToEdit}
      close={() => {
        setSongToEdit(null);
        setMidi(null);
        setReload({});
      }} />}
  </div>;
}

function songContainer(
  s: Song,
  selectSong: (song: Song) => void,
  editSong: (song: Song) => void,
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
      <button onClick={_ => editSong(s)}>edit</button>
      <button onClick={_ => deleteSong(s)}>delete</button>
    </div>
  </div>;
}
