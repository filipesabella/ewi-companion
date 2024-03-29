import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { Note, Song } from '../db/Song';
import { noteToFingerings } from '../lib/ewi';
import { useAwakeMouse } from '../lib/useAwakeMouse';
import { useHotkeys } from '../lib/useHotkeys';
import { midiToNoteName } from '../lib/utils';
import { AppContext } from './App';
import { ProgressBar } from './ProgressBar';
import { showMusicSheet } from './Settings';
import { Sheet } from './Sheet';

import '../styles/song.less';

interface Props {
  goBack: () => void;
  song: Song;
}

interface WrongNote {
  key: string;
  note: string;
}

export function SongComponent({ song, goBack }: Props): JSX.Element {
  const { database, noteBeingPlayed } = useContext(AppContext);

  const [currentNote, setCurrentNote] = useState<Note>(song.notes[0]);
  const [wrongNote, setWrongNote] = useState<WrongNote | null>(null);
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
    // `noteOff` event sets `noteBeingPlayed` to null
    if (noteBeingPlayed) {
      if (noteBeingPlayed === currentNote.midi) {
        changeCurrentNote(nextNote(song, currentNote));
      } else {
        setWrongNote({
          key: Math.random() + '',
          note: midiToNoteName(noteBeingPlayed),
        });
      }
    }
  }, [noteBeingPlayed]);

  const [showBack, setShowBack] = useState(false);
  useAwakeMouse(
    () => setShowBack(true),
    () => setShowBack(false),
    () => 1000,
  );

  useHotkeys({}, {
    27: _ => goBack(),
  });

  const [showControls, setShowControls] = useState(false);
  useAwakeMouse(
    () => setShowControls(true),
    () => setShowControls(false),
    () => 1000,
  );

  const lowestNote = React.useMemo(() =>
    [...song.notes].sort((a, b) => a.midi - b.midi)[0].midi, [song]);
  const highestNote = React.useMemo(() =>
    [...song.notes].sort((a, b) => b.midi - a.midi)[0].midi, [song]);

  const showSheet = React.useMemo(() => showMusicSheet(), []);

  return <div id="song">
    <div className="ewi">
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
            {showControls && <>
              <div className="go-left"
                onClick={() => skipNote(-1)}
                title="Press left-arrow to go back one note">‹
              </div>
              <div className="go-right"
                onClick={() => skipNote(1)}
                title="Press left-arrow or spacebar to go to the next note">›
              </div>
            </>}
          </div>
          {showSheet && <Sheet
            lowestNote={lowestNote}
            highestNote={highestNote}
            currentNote={currentNote} />}
          {wrongNote && <div key={wrongNote.key} className="wrong-note">
            {wrongNote.note}
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
    </div>
    {
      showBack && <div
        className="goBack"
        title="Press Esc to go back to song selection"
        onClick={() => goBack()}>Go back</div>
    }
  </div >;
}

function nextNote(
  song: Song,
  currentNote: Note): Note | null {
  const nextIndex = noteIndex(song, currentNote) + 1;
  return song.notes[nextIndex];
}

function scrollNotes(index: number): void {
  const noteWidth =
    getComputedStyle(document.querySelector('#song > .ewi .note')!).width || '0';

  const container = document.querySelector<HTMLElement>('#song > .ewi .notes')!;
  const newLeft = parseFloat(noteWidth) * index * -1;
  container.style.left = newLeft + 'px';
}

function noteIndex(song: Song, note: Note): number {
  for (let i = 0; i < song.notes.length; i++) {
    if (song.notes[i].id === note.id) {
      return i;
    }
  }
  return -1;
}
