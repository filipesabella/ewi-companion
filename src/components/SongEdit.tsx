import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { Song } from '../db/Song';
import { useHotkeys } from '../lib/useHotkeys';
import { midiToNoteName, noteNameToMidi, uuid } from '../lib/utils';
import { AppContext } from './App';

import '../styles/song-editor.less';

interface Props {
  song: Song;
  close: () => void;
}

export function SongEdit({ song, close }: Props): JSX.Element {
  const { database } = useContext(AppContext);

  const originalNotes = song.notes.map(n => midiToNoteName(n.midi)).join(' ');

  const [valid, setValid] = useState(true);
  const [name, setName] = useState(song.name);
  const [notes, setNotes] = useState(originalNotes);

  const save = () => {
    const normalisedNotes = notes.replace(/\s{2,}/g, ' ');

    database.upsertSong({
      ...song,
      name,
      notes: normalisedNotes.split(/\s/).map(n => ({
        id: uuid(),
        name: n.trim(),
        midi: noteNameToMidi(n),
        preferredEwiFingering: null,
      })),
    }).then(close);
  };

  useHotkeys({}, {
    27: _ => close(),
  });

  useEffect(() => {
    const nameValid = name.length > 0;

    const notesValid = notes
      .replace(/\s{2,}/g, ' ')
      .split(/\s/)
      .filter(n => n.length > 0)
      .every(n => n.match(/^(A|A#|B|C|C#|D|D#|E|F|F#|G|G#)\d\n?$/));

    setValid(nameValid && notesValid);
  }, [name, notes]);

  return <div className="song-editor">
    <div className="song">
      <label>Name</label>
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)} />
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

