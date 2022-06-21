import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { Note, Song } from '../db/Song';
import { icons } from '../icons';
import { AppContext } from './App';

require('../styles/progress-bar.less');

interface Props {
  song: Song;
  currentNote: Note;
  gotoBookmark: (key: number) => void;
}

export function ProgressBar({
  song, currentNote, gotoBookmark }: Props): JSX.Element {
  const { database } = useContext(AppContext);

  const totalNotes = song.notes.length;
  const currentNoteIndex = song.notes.indexOf(currentNote);

  const completion = (currentNoteIndex + 1) * 100 / totalNotes;

  const [showBookmarks, setShowBookmarks] = useState(false);

  useEffect(() => {
    let timeoutId = 0;
    const listener = (e: MouseEvent) => {
      setShowBookmarks(true);
      window.clearTimeout(timeoutId);

      const time = !!(e.target! as any).closest('.progressBar') ? 5000 : 1000;
      timeoutId = window.setTimeout(() => setShowBookmarks(false), time);
    };
    document.addEventListener('mousemove', listener);

    return () => document.removeEventListener('mousemove', listener);
  }, []);

  const saveBookmark = async () => {
    song.bookmarks = [...new Set(song.bookmarks).add(currentNoteIndex)].sort();
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
        style={{ left: Math.min(((b + 1) * 100 / totalNotes), 98.5) + '%' }}>
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
      style={{ left: Math.min(completion, 98.5) + '%' }}>
      {icons.star}
    </div>}
    <div className="progress" style={{ width: completion + '%' }}>
      <p>{`${currentNoteIndex + 1}/${totalNotes}`}</p>
    </div>
  </div>;
}
