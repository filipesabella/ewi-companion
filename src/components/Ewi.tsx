import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { Note, noteIndex, Song } from '../db/Song';
import { noteToFingerings } from '../lib/ewi';
import { useHotkeys } from '../lib/useHotkeys';
import { midiToNoteName } from '../lib/utils';
import { AppContext } from './App';
import { ProgressBar } from './ProgressBar';

require('../styles/ewi.less');

interface Props {
  song: Song;
  noteBeingPlayed: number | null;
}

export function Ewi({ song, noteBeingPlayed }: Props): JSX.Element {
  const { database } = useContext(AppContext);

  const [currentNote, setCurrentNote] = useState<Note>(song.notes[0]);
  const [wrongNote, setWrongNote] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const changeCurrentNote = (n: Note | null) => {
    if (n) {
      setCurrentNote(n);
      setFinished(false);
      setWrongNote(null);
    } else {
      setFinished(true);
    }
  };

  const skipNote = (delta: number) => {
    const index = noteIndex(song, currentNote);
    const newIndex = index + delta;
    const normalisedIndex = newIndex < 0
      ? song.notes.length - 1
      : newIndex > song.notes.length - 1
        ? 0
        : newIndex;

    changeCurrentNote(song.notes[normalisedIndex]);
  }

  useHotkeys({}, {
    32: (_, e) => {
      skipNote(1);
      e.preventDefault();
    },
    39: _ => skipNote(1),
    37: _ => skipNote(-1),
  });

  const empty = (i: number) => <div key={i} className="note"></div>;
  const noteContainers = song.notes.map((n, i) =>
    <div key={i} className="note"><span>{midiToNoteName(n.midi)}</span></div>);

  const onClickFingering = async (fingeringId: string) => {
    // reset to null if clicking on currently preferred fingering
    const fingering =
      currentNote.preferredEwiFingering === fingeringId
        ? null : fingeringId;

    await database.savePreferredFingering(
      song.id,
      currentNote.id,
      fingering);

    setCurrentNote({
      ...currentNote,
      preferredEwiFingering: fingering
    });
  };

  useEffect(() => {
    scrollNotes(noteIndex(song, currentNote));
  });

  useEffect(() => {
    if (noteBeingPlayed === currentNote.midi) {
      changeCurrentNote(nextNote(song, currentNote));
    } else {
      noteBeingPlayed && setWrongNote(midiToNoteName(noteBeingPlayed));
    }
  }, [noteBeingPlayed]);

  return <div id="ewi">
    <div className="main-area">
      <ProgressBar
        song={song}
        currentNote={currentNote}
        setCurrentNote={setCurrentNote} />
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
        {wrongNote && <div key={wrongNote} className="wrong-note">
          {wrongNote}
        </div>}
        {finished && <div className="finished">
          End
        </div>}
        {!finished && <div className="ewi-fingerings">
          {noteToFingerings(
            currentNote.midi,
            currentNote.preferredEwiFingering,
            onClickFingering)}
        </div>}
      </div>
    </div>
  </div>;
}

function nextNote(
  song: Song,
  currentNote: Note): Note | null {
  const nextIndex = noteIndex(song, currentNote) + 1;
  return song.notes[nextIndex];
}

function scrollNotes(index: number): void {
  const noteWidth =
    getComputedStyle(document.querySelector('#ewi .note')!).width || '0';

  const container = document.querySelector<HTMLElement>('#ewi .notes')!;
  const newLeft = parseFloat(noteWidth) * index * -1;
  container.style.left = newLeft + 'px';
}
