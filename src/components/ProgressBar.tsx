import * as React from 'react';
import { useEffect, useState } from 'react';
import { Database } from '../db/Database';
import { Note, Song } from '../db/Song';
import { icons } from '../icons';

require('../styles/progress-bar.less');

interface Props {
  database: Database;
  song: Song;
  currentNote: Note;
  gotoBookmark: (key: number) => void;
}

export function ProgressBar({
  song, database, currentNote, gotoBookmark }: Props): JSX.Element {
  const totalNotes = song.track.notes.length;
  const currentNoteIndex = song.track.notes.indexOf(currentNote);

  const completion = (currentNoteIndex + 1) * 100 / totalNotes;

  const [showBookmarks, setShowBookmarks] = useState(true);

  useEffect(() => {
    let timeoutId = 0;
    const listener = (e: MouseEvent) => {
      setShowBookmarks(true);
      window.clearTimeout(timeoutId);

      if (!(e.target! as any).closest('.progressBar')) {
        timeoutId = window.setTimeout(() => setShowBookmarks(false), 1000);
      } else {
        timeoutId = window.setTimeout(() => setShowBookmarks(false), 5000);
      }
    };
    document.addEventListener('mousemove', listener);

    return () => document.removeEventListener('mousemove', listener);
  }, []);

  const saveBookmark = async () => {
    song.bookmarks = [...new Set(song.bookmarks).add(currentNoteIndex)];
    await database.saveSong(song);
    setShowBookmarks(false);
  };

  const deleteBookmark = async (b: number) => {
    song.bookmarks = song.bookmarks.filter(i => i !== b);
    await database.saveSong(song);
    setShowBookmarks(false);
  };

  return <div className="progressBar">
    {showBookmarks && <div className="bookmarks">
      {song.bookmarks.map((b, i) => <div
        key={b}
        style={{ left: ((b + 1) * 100 / totalNotes) + '%' }}>
        <div
          className="bookmark"
          onClick={() => gotoBookmark(b)}
          title={`Click or press ${i + 1} to navigate`}>{icons.star}</div>
        <div
          className="deleteBookmark"
          onClick={() => deleteBookmark(b)}
          title="Click to remove this bookmark">{icons.bin}</div>
      </div>)
      }
    </div>}
    {showBookmarks && <div onClick={() => saveBookmark()}
      className="createBookmark"
      style={{ left: completion + '%' }}>
      {icons.star}
    </div>}
    <div className="progress" style={{ width: completion + '%' }}>
      <p>{`${currentNoteIndex + 1}/${totalNotes}`}</p>
    </div>
  </div>;
}
