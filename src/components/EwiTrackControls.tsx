import * as React from 'react';
import { Database } from '../db/Database';
import { Note, Song } from '../db/Song';

require('../styles/track-controls.less');

interface Props {
  database: Database;
  song: Song;
  note: Note;
}

export function EwiTrackControls({ song, database, note }: Props): JSX.Element {
  const bookmark = async (n: number) => {
    const time = note.time * 1000;
    const bookmarks = song.bookmarks || [];
    bookmarks[n] = time;
    await database.saveSong({
      ...song,
      bookmarks,
    });
  };

  return <div className="trackControls">
    <div className="bookmarks">
      <span onClick={_ => bookmark(1)}>1</span>
      <span onClick={_ => bookmark(2)}>2</span>
      <span onClick={_ => bookmark(3)}>3</span>
      <span onClick={_ => bookmark(4)}>4</span>
      <span onClick={_ => bookmark(5)}>5</span>
    </div>
  </div>;
}
