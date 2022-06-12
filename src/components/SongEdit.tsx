import * as React from 'react';
import { useEffect, useState } from 'react';
import { Database } from '../db/Database';
import { Song } from '../db/Song';
import { noteNameToMidi, uuid } from '../lib/utils';
import '../styles/song-editor.less';

interface Props {
  song: Song;
  close: () => void;
  database: Database;
}

export function SongEdit({ song, close, database }: Props): JSX.Element {
  const originalNotes = song.notes.map(n => n.name).join(' ');

  const [valid, setValid] = useState(true);
  const [name, setName] = useState(song.name);
  const [notes, setNotes] = useState(originalNotes);

  const save = () => {
    const normalisedNotes = notes.replace(/\s{2,}/g, ' ');

    database.upsertSong({
      ...song,
      name,
      notes: normalisedNotes.split(' ').map(n => ({
        id: uuid(),
        name: n,
        midi: noteNameToMidi(n),
        preferredEwiFingering: null,
      })),
    }).then(close);
  };

  useEffect(() => {
    const nameValid = name.length > 0;
    const notesValid = notes
      .replace(/\s{2,}/g, ' ')
      .split(' ')
      .filter(n => n.length > 0)
      .every(n => n.match(/^(A|A#|B|C|C#|D|D#|E|F|F#|G|G#)\d$/));

    setValid(nameValid && notesValid);
  }, [name, notes]);

  return <div className="songEditor">
    <div className="song">
      <label>Name</label>
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value.trim())} />
      <label>Notes</label>
      <textarea
        placeholder={
          'valid notes (in any octave): A1 A#1 B1 C1 C#1 D1 D#1 ' +
          'E1 F1 F#1 G1 G#1'}
        defaultValue={notes}
        onChange={e => setNotes(e.target.value.trim())}></textarea>
      <div className="actions">
        <p
          className="cancel"
          onClick={_ => close()}>Cancel</p>
        <button
          className="save"
          disabled={!valid}
          onClick={_ => save()}>Save</button>
      </div>
    </div>
  </div>;
}

