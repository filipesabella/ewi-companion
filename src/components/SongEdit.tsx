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
  const originalNotes = song.notes.map(n => n.name)
    .map(n => n.includes('#') ? n : n + ' ')
    .join(' ');

  const [valid, setValid] = useState(true);
  const [name, setName] = useState(song.name);
  const [notes, setNotes] = useState(originalNotes);

  const save = () => {
    const normalisedNotes = notes.replace(/\s{2,}/g, ' ');
    const notesUpdated = originalNotes
      .replace(/\s{2,}/g, ' ') !== normalisedNotes;

    if (notesUpdated) {
      database.saveSong({
        ...song,
        name,
        notes: normalisedNotes.split(' ').map(n => ({
          id: uuid(),
          name: n,
          midi: noteNameToMidi(n),
          preferredEwiFingering: null,
        })),
        bookmarks: [],
      }).then(close);
    } else {
      database.saveSong({
        ...song,
        name,
      }).then(close);
    }
  };

  useEffect(() => {
    const nameValid = name.length > 0;
    const notesValid = notes
      .replace(/\s{2,}/g, ' ')
      .split(' ')
      .every(n => n.match(/^([A-G]|[a-g])\#?\d$/));

    setValid(nameValid && notesValid);
  }, [name, notes]);

  return <div className="songEditor">
    <div className="song">
      <label>Name</label>
      <input
        value={name}
        onChange={e => setName(e.target.value.trim())} />
      <label>Notes</label>
      <textarea
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

