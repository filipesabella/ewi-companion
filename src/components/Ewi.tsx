import * as React from 'react';
import { useEffect, useState } from 'react';
import { Database } from '../db/Database';
import { Note, noteAtOrAfter, noteIndex, Song, Track } from '../db/Song';
import { noteToFingerings } from '../lib/ewi';
import { useHotkeys } from '../lib/useHotkeys';
import { roundNumber } from '../lib/utils';
import { EwiTrackControls } from './EwiTrackControls';

require('../styles/ewi.less');

interface Props {
  database: Database;
  song: Song;
  track: Track;
  notesDown: Set<number>;
}

export function Ewi({
  song,
  track,
  notesDown,
  database, }: Props): JSX.Element {
  const [currentNote, setCurrentNote] = useState<Note>(track.notes[0]);

  function gotoBookmark(key: number): void {
    // numbers 1 through 5
    const index = key - 48;
    const bookmark = song.bookmarks[index];
    if (bookmark) {
      const note = noteAtOrAfter(track, roundNumber(bookmark / 1000))!;
      setCurrentNote(note);
    }
  }

  function skipNote(delta: number): void {
    const index = noteIndex(track, currentNote);
    const newIndex = Math.min(
      Math.max(0, index + delta),
      track.notes.length - 1);

    setCurrentNote(track.notes[newIndex]);
  }

  useHotkeys({
    49: gotoBookmark,
    50: gotoBookmark,
    51: gotoBookmark,
    52: gotoBookmark,
    53: gotoBookmark,
  }, {
    38: _ => skipNote(1),
    40: _ => skipNote(-1),
  });

  const empty = (i: number) => <div key={i} className="note"></div>;
  const noteContainers = track.notes.map((n, i) =>
    <div key={i} className="note"><span>{n.name}</span></div>);

  const onClickFingering = async (fingeringId: string) => {
    // reset to null if clicking on currently preferred fingering
    const fingering =
      currentNote.preferredEwiFingering === fingeringId
        ? null : fingeringId;

    await database.savePreferredFingering(
      song,
      track,
      currentNote,
      fingering);

    setCurrentNote({
      ...currentNote,
      preferredEwiFingering: fingering
    });

    // to go around funky business with the setInterval up there. ugly
    currentNote.preferredEwiFingering = fingering;
  };

  const onSeekClick = (time: number): void => {
    const note = noteAtOrAfter(track, roundNumber(time / 1000))!;
    setCurrentNote(note);
  };

  useEffect(() => {
    scrollNotes(noteIndex(track, currentNote));
  });

  useEffect(() => {
    setCurrentNote(checkPressedNotes(track, notesDown, currentNote))
  }, [notesDown]);

  return <div id="ewi">
    <div className="main-area">
      <EwiTrackControls
        database={database}
        song={song}
        note={currentNote} />
      <div className="notes-and-fingerings">
        <div className="notes-container">
          <div className="notes">
            {[empty(-1), empty(-2)]
              .concat(noteContainers)
              .concat([empty(999998), empty(999999)])}
          </div>
          <div className="notes-mask notes-mask-left"></div>
          <div className="notes-mask notes-mask-right"></div>
        </div>
        <div className="ewi-fingerings">
          <div className="fingerings-container">
            {noteToFingerings(
              currentNote.name,
              currentNote.preferredEwiFingering,
              onClickFingering)}
          </div>
        </div>
      </div>
    </div>
  </div>;
}

function checkPressedNotes(
  track: Track,
  notesDown: Set<number>,
  currentNote: Note): Note {
  if (notesDown.has(currentNote.midi)) {
    const nextIndex = noteIndex(track, currentNote) + 1;

    if (nextIndex < track.notes.length) {
      return track.notes[nextIndex];
    } else {
      return currentNote;
    }
  }

  return currentNote;
}

function scrollNotes(index: number): void {
  const noteWidth =
    getComputedStyle(document.querySelector('#ewi .note')!).width || '0';

  const container = document.querySelector<HTMLElement>('#ewi .notes')!;
  const newLeft = parseInt(noteWidth) * index * -1;
  container.style.left = newLeft + 'px';
}
