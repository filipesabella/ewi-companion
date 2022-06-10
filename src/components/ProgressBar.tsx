import * as React from 'react';
import { Database } from '../db/Database';
import { Note, Song } from '../db/Song';

require('../styles/progress-bar.less');

interface Props {
  database: Database;
  song: Song;
  currentNote: Note;
}

export function ProgressBar({ song, database, currentNote }: Props)
  : JSX.Element {
  const totalNotes = song.track.notes.length;
  const currentNoteIndex = song.track.notes.indexOf(currentNote);
  const completion = (currentNoteIndex + 1) * 100 / totalNotes;

  const bookmark = async (n: number) => {
    // const time = note.time * 1000;
    // const bookmarks = song.bookmarks || [];
    // bookmarks[n] = time;
    // await database.saveSong({
    //   ...song,
    //   bookmarks,
    // });
  };

  return <div className="progressBar">
    <div className="progress" style={{ width: completion + '%' }}>
      <p>{`${currentNoteIndex + 1}/${totalNotes}`}</p>
    </div>
  </div>;
}
