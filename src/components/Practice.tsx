import * as React from 'react';
import {
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  Note,
  Song,
} from '../db/Song';
import { icons } from '../icons';
import {
  describeFingering,
  describeInterval,
  FingeringDiagram,
  fingeringHint,
  fingeringsFor,
  preferredFingering,
} from '../lib/ewi';
import { usePreference } from '../lib/preferences';
import { useHotkeys } from '../lib/useHotkeys';
import {
  displayNoteName,
  displayPitch,
  displayRange,
  isSharp,
  noteOctave,
  plural,
} from '../lib/utils';
import { AppContext } from './App';
import {
  MidiPill,
  SettingsButton,
} from './MidiControls';
import {
  Staff,
  StaffNote,
} from './Staff';

import '../styles/practice.scss';

interface Props {
  song: Song;
  startAt: number;
  goBack: () => void;
}

interface WrongNote {
  key: number;
  midi: number;
}

// how many notes the staff shows around the current one
const notesBefore = 2;
const notesAfter = 4;

// keys 2 to 9 jump to the bookmarks, 1 to the start
const bookmarkKey = (i: number) => i + 2;

export function Practice(props: Props): React.JSX.Element {
  const { goBack } = props;
  const { database, noteBeingPlayed, settingsOpen } = useContext(AppContext);

  // local copy so in-session edits (preferred fingerings, bookmarks) show up
  // when navigating around, without reloading from the database
  const [song, setSong] = useState<Song>(props.song);
  const [index, setIndex] = useState(
    Math.min(props.startAt, props.song.notes.length - 1),
  );
  const [wrongNote, setWrongNote] = useState<WrongNote | null>(null);
  const [finished, setFinished] = useState(false);

  const [showStaff] = usePreference('show-music-sheet');
  const [showNext] = usePreference('show-next-fingering');
  const [showShortcuts] = usePreference('show-shortcuts');

  const total = song.notes.length;
  const note = song.notes[index];
  const isBookmarked = song.bookmarks.includes(index);

  const goTo = (i: number) => {
    setIndex(i);
    setFinished(false);
    setWrongNote(null);
  };

  const skip = (delta: number) => goTo((index + delta + total) % total);

  const jumpToBookmark = (key: number) => {
    const target = key === 1 ? 0 : song.bookmarks[key - 2];
    target !== undefined && goTo(target);
  };

  const saveBookmarks = async (bookmarks: number[]) => {
    const updated = { ...song, bookmarks };
    setSong(updated);
    await database.saveSong(updated);
  };

  const toggleBookmark = () =>
    saveBookmarks(
      isBookmarked
        ? song.bookmarks.filter(b => b !== index)
        : [...song.bookmarks, index].sort((a, b) => a - b),
    );

  const setPreferred = async (fingeringId: string) => {
    // the first fingering is the default, no need to store it
    const stored = fingeringsFor(note.midi)[0].id === fingeringId
      ? null
      : fingeringId;
    const updated: Note = { ...note, preferredEwiFingering: stored };
    setSong({
      ...song,
      notes: song.notes.map(n => n.id === updated.id ? updated : n),
    });
    await database.savePreferredFingering(song.id, note.id, stored);
  };

  const cycleFingering = (delta: number) => {
    const fingerings = fingeringsFor(note.midi);
    const preferred = preferredFingering(note.midi, note.preferredEwiFingering);
    const current = fingerings.findIndex(f => f.id === preferred.id);
    const next = (current + delta + fingerings.length) % fingerings.length;
    setPreferred(fingerings[next].id);
  };

  const numberKeys = Object.fromEntries(
    [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => [String(n), () => jumpToBookmark(n)]),
  );

  useHotkeys({
    ...numberKeys,
    ' ': () => skip(1),
    ArrowRight: () => skip(1),
    ArrowLeft: () => skip(-1),
    Escape: goBack,
    ...(finished
      ? { r: () => goTo(0), R: () => goTo(0) }
      : {
        b: toggleBookmark,
        B: toggleBookmark,
        '[': () => cycleFingering(-1),
        ']': () => cycleFingering(1),
      }),
  }, !settingsOpen);

  useEffect(() => {
    // `noteOff` sets `noteBeingPlayed` to null
    if (noteBeingPlayed === null || finished) {
      return;
    }
    if (noteBeingPlayed === note.midi) {
      setWrongNote(null);
      index === total - 1 ? setFinished(true) : setIndex(index + 1);
    } else {
      setWrongNote({ key: Date.now(), midi: noteBeingPlayed });
    }
  }, [noteBeingPlayed]);

  useEffect(() => {
    database.saveProgress(song.id, finished ? undefined : index);
  }, [index, finished]);

  return <div className="practice">
    <header className="top-bar">
      <button type="button" className="back-link" onClick={goBack}>
        {icons.back}
        Library
      </button>
      <div className="divider"></div>
      <div className="song-title">
        <span className="song-name">{song.name}</span>
        <span className="song-meta">
          {plural(total, 'note')} · {displayRange(song.notes.map(n => n.midi))}
        </span>
      </div>
      <div className="spacer"></div>
      <MidiPill />
      <SettingsButton />
    </header>

    <ProgressRow
      song={song}
      index={finished ? total - 1 : index}
      finished={finished}
      isBookmarked={isBookmarked}
      goTo={goTo}
      toggleBookmark={toggleBookmark} />

    {finished
      ? <Complete
        song={song}
        restart={() => goTo(0)}
        goTo={goTo}
        goBack={goBack} />
      : <main className="stage">
        <NotePanel
          song={song}
          index={index}
          wrongNote={wrongNote}
          showStaff={showStaff} />
        <FingeringCard
          key={note.id}
          note={note}
          setPreferred={setPreferred} />
        {showNext && <NextNote next={song.notes[index + 1]} />}
      </main>}

    {showShortcuts && <KeyHints finished={finished} />}
  </div>;
}

interface ProgressRowProps {
  song: Song;
  index: number;
  finished: boolean;
  isBookmarked: boolean;
  goTo: (index: number) => void;
  toggleBookmark: () => void;
}

function ProgressRow({
  song,
  index,
  finished,
  isBookmarked,
  goTo,
  toggleBookmark,
}: ProgressRowProps): React.JSX.Element {
  const last = Math.max(1, song.notes.length - 1);
  const fraction = (i: number) => i / last;
  const position = finished ? song.notes.length : index + 1;

  return <div className="progress-row">
    <span className="counter">
      <strong>{position}</strong> / {song.notes.length}
    </span>
    <div className="scrubber">
      {song.bookmarks.map((b, i) =>
        <button
          key={b}
          type="button"
          className="flag"
          style={{ '--at': fraction(b) } as React.CSSProperties}
          title={bookmarkKey(i) <= 9
            ? `Bookmark at note ${b + 1}, press ${bookmarkKey(i)}`
            : `Bookmark at note ${b + 1}`}
          onClick={() => goTo(b)}>
          <span className="flag-label">
            {bookmarkKey(i) <= 9 ? bookmarkKey(i) : '·'}
          </span>
          <span className="flag-pole"></span>
        </button>
      )}
      <input
        type="range"
        aria-label="Position in the song"
        min={0}
        max={song.notes.length - 1}
        value={index}
        style={{
          '--progress': (finished ? 1 : fraction(index)) * 100 + '%',
        } as React.CSSProperties}
        onChange={e => goTo(parseInt(e.target.value))} />
    </div>
    <button
      type="button"
      className={'button bookmark-toggle' + (isBookmarked ? ' active' : '')}
      aria-pressed={isBookmarked}
      disabled={finished}
      onClick={toggleBookmark}>
      {isBookmarked ? icons.starFilled : icons.star}
      <span className="bookmark-label" data-longest="Bookmarked">
        {isBookmarked ? 'Bookmarked' : 'Bookmark'}
      </span>
      <kbd>B</kbd>
    </button>
  </div>;
}

interface NotePanelProps {
  song: Song;
  index: number;
  wrongNote: WrongNote | null;
  showStaff: boolean;
}

function NotePanel({
  song,
  index,
  wrongNote,
  showStaff,
}: NotePanelProps): React.JSX.Element {
  const note = song.notes[index];
  const fingering = preferredFingering(note.midi, note.preferredEwiFingering);

  const window = Array.from(
    { length: notesBefore + 1 + notesAfter },
    (_, i) => index - notesBefore + i,
  );

  const staffNotes: (StaffNote | null)[] = window.map(i =>
    song.notes[i]
      ? {
        midi: song.notes[i].midi,
        tone: i < index ? 'played' : i === index ? 'current' : 'upcoming',
        distance: i - index,
        ghost: i === index ? wrongNote?.midi : null,
      }
      : null
  );

  const neighbours = window.filter(i => song.notes[i]);
  const staffLabel = 'Staff: '
    + neighbours.map(i =>
      displayNoteName(song.notes[i].midi)
      + (i === index ? ' now' : i < index ? ' played' : '')
    ).join(', ');

  const hint = wrongNote
    && fingeringHint(note.midi, fingering, wrongNote.midi);

  return <section className="note-panel">
    <div className="big-note" aria-label={displayNoteName(note.midi)}>
      <span className="pitch">
        {displayPitch(note.midi).slice(0, 1)}
        {isSharp(note.midi) && <span className="accidental">♯</span>}
      </span>
      <span className="octave">{noteOctave(note.midi)}</span>
    </div>

    {wrongNote && <div key={wrongNote.key} className="wrong-note" role="status">
      <span className="wrong-icon">
        {wrongNote.midi > note.midi ? icons.arrowUp : icons.arrowDown}
      </span>
      <div className="wrong-text">
        <span className="wrong-title">
          You played {displayNoteName(wrongNote.midi)},{' '}
          {describeInterval(note.midi, wrongNote.midi)}
        </span>
        <span className="wrong-hint">
          {hint ?? `Check the fingering for ${displayNoteName(note.midi)}.`}
        </span>
      </div>
    </div>}

    {showStaff
      ? <Staff
        notes={staffNotes}
        extent={song.notes.map(n => n.midi)}
        highlight={notesBefore}
        label={staffLabel} />
      : <ol className="note-chips" aria-label="Notes around the current one">
        {neighbours.map(i =>
          <li
            key={i}
            className={i < index ? 'played' : i === index ? 'current' : ''}
            style={{ '--distance': i - index } as React.CSSProperties}>
            {displayNoteName(song.notes[i].midi)}
          </li>
        )}
      </ol>}
  </section>;
}

interface FingeringCardProps {
  note: Note;
  setPreferred: (fingeringId: string) => void;
}

function FingeringCard({
  note,
  setPreferred,
}: FingeringCardProps): React.JSX.Element {
  const [previewId, setPreviewId] = useState<string | null>(null);

  const fingerings = fingeringsFor(note.midi);
  const preferred = fingerings.find(f => f.id === note.preferredEwiFingering)
    ?? fingerings[0];
  const shown = fingerings.find(f => f.id === previewId) ?? preferred;
  const name = displayNoteName(note.midi);

  return <div className="fingering-slot">
    <figure className="fingering-card">
      <div className="hero">
        <FingeringDiagram
          midi={note.midi}
          fingering={shown}
          variant="hero"
          label={`EWI fingering for ${name}: `
            + describeFingering(note.midi, shown)} />
      </div>
      {fingerings.length > 1 && <div
        className="alternatives"
        style={{
          '--columns': Math.ceil(fingerings.length / 4),
        } as React.CSSProperties}>
        <span className="alternatives-title">{fingerings.length} ways</span>
        {fingerings.map((f, i) =>
          <button
            key={f.id}
            type="button"
            className="alternative"
            aria-label={`Fingering ${i + 1}`
              + (f === preferred ? ', preferred' : '')}
            aria-pressed={f === preferred}
            onMouseEnter={() => setPreviewId(f.id)}
            onMouseLeave={() => setPreviewId(null)}
            onFocus={() => setPreviewId(f.id)}
            onBlur={() => setPreviewId(null)}
            onClick={() => {
              setPreferred(f.id);
              setPreviewId(null);
            }}>
            <FingeringDiagram midi={note.midi} fingering={f} variant="thumb" />
          </button>
        )}
      </div>}
    </figure>
  </div>;
}

function NextNote({ next }: { next: Note | undefined }): React.JSX.Element {
  return <aside className="next-note" aria-label="Next note">
    <span className="eyebrow">Next</span>
    {next
      ? <>
        <span className="next-name">{displayNoteName(next.midi)}</span>
        <FingeringDiagram
          midi={next.midi}
          fingering={preferredFingering(next.midi, next.preferredEwiFingering)}
          variant="dim"
          label={`Fingering for ${displayNoteName(next.midi)}`} />
      </>
      : <span className="next-name">Last note</span>}
  </aside>;
}

interface CompleteProps {
  song: Song;
  restart: () => void;
  goTo: (index: number) => void;
  goBack: () => void;
}

function Complete({
  song,
  restart,
  goTo,
  goBack,
}: CompleteProps): React.JSX.Element {
  const total = song.notes.length;
  const lastBookmark = song.bookmarks.length - 1;

  return <main className="complete">
    <span className="complete-icon">{icons.check}</span>
    <h1>{total === 1 ? 'Note played' : `All ${total} notes played`}</h1>
    <p>
      {song.name}, start to finish. {lastBookmark >= 0
        ? 'Go again, or pick up from a bookmark.'
        : 'Go again whenever you like.'}
    </p>
    <div className="button-row">
      <button
        type="button"
        className="button primary large"
        autoFocus
        onClick={restart}>
        Practice again
        <kbd>R</kbd>
      </button>
      {lastBookmark >= 0 && <button
        type="button"
        className="button large"
        onClick={() => goTo(song.bookmarks[lastBookmark])}>
        From bookmark {bookmarkKey(lastBookmark)}
        {bookmarkKey(lastBookmark) <= 9 && <kbd>
          {bookmarkKey(lastBookmark)}
        </kbd>}
      </button>}
      <button type="button" className="button quiet large" onClick={goBack}>
        Back to library
      </button>
    </div>
  </main>;
}

function KeyHints({ finished }: { finished: boolean }): React.JSX.Element {
  return <footer className="key-hints">
    <span>
      <kbd>Space</kbd> skip
    </span>
    <span>
      <kbd>←</kbd> back one
    </span>
    {!finished && <span>
      <kbd>[</kbd> <kbd>]</kbd> change fingering
    </span>}
    <span>
      <kbd>1</kbd>–<kbd>9</kbd> jump to bookmark
    </span>
    <span>
      <kbd>Esc</kbd> library
    </span>
  </footer>;
}
