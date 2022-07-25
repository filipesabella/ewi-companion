import * as React from 'react';
import { useContext, useState } from 'react';
import { Note, Song } from '../db/Song';
import { icons } from '../icons';
import { useAwakeMouse } from '../lib/useAwakeMouse';
import { useHotkeys } from '../lib/useHotkeys';
import { AppContext } from './App';

require('../styles/progress-bar.less');

interface Props {
  song: Song;
  currentNote: Note;
  setCurrentNote: (note: Note) => void;
}

export function ProgressBar({
  song, currentNote, setCurrentNote }: Props): JSX.Element {
  const { database } = useContext(AppContext);

  const totalNotes = song.notes.length;
  const currentNoteIndex = song.notes.indexOf(currentNote);

  const completion = (currentNoteIndex + 1) * 100 / totalNotes;

  const [showBookmarks, setShowBookmarks] = useState(false);

  const gotoBookmark = (bookmark: number) => {
    setCurrentNote(song.notes[bookmark]);
  }

  const keyToBookmark = (key: number) => {

    // numbers 1 through 9
    const index = key - 48;
    const bookmark = song.bookmarks[index - 1];
    bookmark !== undefined && gotoBookmark(bookmark);
  }

  useHotkeys({
    49: keyToBookmark,
    50: keyToBookmark,
    51: keyToBookmark,
    52: keyToBookmark,
    53: keyToBookmark,
    54: keyToBookmark,
    55: keyToBookmark,
    56: keyToBookmark,
    57: keyToBookmark,
  }, {});

  useAwakeMouse(
    () => setShowBookmarks(true),
    () => setShowBookmarks(false),
    e => !!(e.target! as any).closest('.progress-bar') ? 5000 : 1000,
  );

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

  return <div className="progress-bar">
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
      className="create-bookmark"
      style={{ left: Math.min(completion, 98.5) + '%' }}>
      {icons.star}
    </div>}
    <div className="progress" style={{ width: completion + '%' }}>
      <p>{`${currentNoteIndex + 1}/${totalNotes}`}</p>
    </div>
  </div>;
}
