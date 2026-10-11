import { Midi } from '@tonejs/midi';
import * as React from 'react';
import {
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Song } from '../db/Song';
import { icons } from '../icons';
import { importMidi } from '../lib/MidiImporter';
import { useHotkeys } from '../lib/useHotkeys';
import {
  displayRange,
  plural,
  uuid,
} from '../lib/utils';
import {
  AppContext,
  Screen,
} from './App';
import {
  MidiPill,
  SettingsButton,
} from './MidiControls';

import '../styles/library.scss';

interface Props {
  go: (screen: Screen) => void;
}

const songFromNotes = (name: string, midis: number[]): Song => ({
  id: uuid(),
  name,
  notes: midis.map(midi => ({ id: uuid(), midi, preferredEwiFingering: null })),
  bookmarks: [],
});

const isMidiFile = (file: File) => /\.midi?$/i.test(file.name);

export function Library({ go }: Props): React.JSX.Element {
  const { database, songsVersion, settingsOpen } = useContext(AppContext);

  const [songs, setSongs] = useState<Song[] | null>(null);
  const [reload, setReload] = useState({});
  const [midi, setMidi] = useState<Midi | null>(null);
  const [songToDelete, setSongToDelete] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    database.listCurrentSongs().then(setSongs);
  }, [reload, songsVersion]);

  const edit = (song: Song, isNew = false) =>
    go({ name: 'editor', song, isNew });

  const practice = (song: Song, startAt = 0) =>
    go({ name: 'practice', song, startAt });

  const importFile = async (file: File) => {
    setImportError(null);
    try {
      const imported = importMidi(file.name, await file.arrayBuffer());
      if (imported.tracks.length === 0) {
        setImportError(`${file.name} has no notes in it.`);
      } else if (imported.tracks.length === 1) {
        edit(
          songFromNotes(
            imported.name,
            imported.tracks[0].notes.map(n => n.midi),
          ),
          true,
        );
      } else {
        setMidi(imported);
      }
    } catch (e) {
      console.error(e);
      setImportError(`${file.name} couldn't be read as a MIDI file.`);
    }
  };

  // dropping a file anywhere on the page imports it
  useEffect(() => {
    let depth = 0;
    const hasFiles = (e: DragEvent) =>
      e.dataTransfer?.types.includes('Files') ?? false;

    const onDragEnter = (e: DragEvent) => {
      if (hasFiles(e)) {
        depth++;
        setDragging(true);
      }
    };
    const onDragLeave = (e: DragEvent) => {
      if (hasFiles(e) && --depth === 0) {
        setDragging(false);
      }
    };
    const onDragOver = (e: DragEvent) => hasFiles(e) && e.preventDefault();
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      depth = 0;
      setDragging(false);
      const file = e.dataTransfer?.files[0];
      file && (isMidiFile(file)
        ? importFile(file)
        : setImportError(`${file.name} isn't a .mid file.`));
    };

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('drop', onDrop);
    };
  }, []);

  const deleteSong = (s: Song) => {
    setSongToDelete(null);
    database.deleteSong(s.id).then(_ => setReload({}));
  };

  const newSong = () => edit(songFromNotes('', []), true);

  const recent = (songs ?? [])
    .filter(s => s.lastPracticedAt !== undefined)
    .sort((a, b) => b.lastPracticedAt! - a.lastPracticedAt!)[0];
  const resumable = recent
      && recent.lastPosition !== undefined
      && recent.lastPosition > 0
      && recent.lastPosition < recent.notes.length
    ? recent
    : null;

  return <div className={'library' + (dragging ? ' dragging' : '')}>
    <header className="top-bar">
      <div className="brand">
        <span className="logo">{icons.logo}</span>
        <span className="brand-name">EWI Companion</span>
      </div>
      <div className="spacer"></div>
      <MidiPill />
      <SettingsButton />
    </header>

    <main className="library-main">
      {resumable && <ResumeCard
        song={resumable}
        resume={() => practice(resumable, resumable.lastPosition)} />}

      <section className="songs" aria-labelledby="songs-heading">
        <div className="songs-header">
          <h1 id="songs-heading">Songs</h1>
          {songs && <span className="songs-count">{songs.length}</span>}
          <div className="spacer"></div>
          <button type="button" className="button" onClick={newSong}>
            {icons.plus}
            New song
          </button>
          <button
            type="button"
            className="button"
            onClick={() => fileInput.current?.click()}>
            {icons.upload}
            Import MIDI file
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".mid,.midi,audio/midi"
            hidden
            onChange={e => {
              const file = e.target.files?.[0];
              e.target.value = '';
              file && importFile(file);
            }} />
        </div>

        {importError && <p className="import-error" role="alert">
          {icons.alert}
          {importError}
        </p>}

        {songs === null
          ? <p className="songs-empty">Loading songs…</p>
          : songs.length === 0
          ? <p className="songs-empty">
            No songs yet. Write one, or import a MIDI file.
          </p>
          : <ul className="song-list">
            {songs.map(song =>
              <SongRow
                key={song.id}
                song={song}
                highlighted={song.id === recent?.id}
                confirmingDelete={song.id === songToDelete}
                practice={() => practice(song)}
                edit={() => edit(song)}
                askDelete={() => setSongToDelete(song.id)}
                cancelDelete={() => setSongToDelete(null)}
                confirmDelete={() => deleteSong(song)} />
            )}
          </ul>}

        <p className="drop-zone">
          {icons.music}
          Drop a .mid file anywhere to import it
        </p>
      </section>
    </main>

    {midi && <TrackSelector
      midi={midi}
      enabled={!settingsOpen}
      select={(name, midis) => {
        setMidi(null);
        edit(songFromNotes(name, midis), true);
      }}
      cancel={() => setMidi(null)} />}
  </div>;
}

function ResumeCard({
  song,
  resume,
}: {
  song: Song,
  resume: () => void,
}): React.JSX.Element {
  const position = song.lastPosition ?? 0;
  return <section className="resume-card" aria-label="Continue practising">
    <div className="resume-text">
      <span className="eyebrow">Pick up where you left off</span>
      <span className="resume-name">{song.name}</span>
      <div className="resume-progress">
        <div className="bar" aria-hidden="true">
          <div
            className="fill"
            style={{
              '--progress': (position + 1) * 100 / song.notes.length + '%',
            } as React.CSSProperties}>
          </div>
        </div>
        <span className="resume-count">
          Note {position + 1} of {song.notes.length}
        </span>
      </div>
    </div>
    <button type="button" className="button primary large" onClick={resume}>
      {icons.play}
      Resume
    </button>
  </section>;
}

interface SongRowProps {
  song: Song;
  highlighted: boolean;
  confirmingDelete: boolean;
  practice: () => void;
  edit: () => void;
  askDelete: () => void;
  cancelDelete: () => void;
  confirmDelete: () => void;
}

function SongRow({
  song,
  highlighted,
  confirmingDelete,
  practice,
  edit,
  askDelete,
  cancelDelete,
  confirmDelete,
}: SongRowProps): React.JSX.Element {
  const midis = song.notes.map(n => n.midi);
  const meta = [
    plural(midis.length, 'note'),
    displayRange(midis),
    ...(song.bookmarks.length > 0
      ? [plural(song.bookmarks.length, 'bookmark')]
      : []),
  ].filter(Boolean).join(' · ');

  return <li className={'song-row' + (highlighted ? ' highlighted' : '')}>
    <Contour midis={midis} />
    <div className="song-text">
      <span className="song-name">{song.name}</span>
      <span className="song-meta">{meta}</span>
    </div>
    {confirmingDelete
      ? <div className="row-actions" role="group" aria-label="Confirm delete">
        <span className="confirm-question">Delete this song?</span>
        <button
          type="button"
          className="button danger"
          autoFocus
          onClick={confirmDelete}>
          Delete
        </button>
        <button type="button" className="button" onClick={cancelDelete}>
          Keep
        </button>
      </div>
      : <div className="row-actions">
        <button
          type="button"
          className={'button' + (highlighted ? ' primary' : '')}
          disabled={midis.length === 0}
          onClick={practice}>
          Practice
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label={`Edit ${song.name}`}
          onClick={edit}>
          {icons.edit}
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label={`Delete ${song.name}`}
          onClick={askDelete}>
          {icons.trash}
        </button>
      </div>}
  </li>;
}

// the melody's shape as a small line
function Contour({ midis }: { midis: number[] }): React.JSX.Element {
  const width = 112;
  const height = 36;
  const samples = 56;

  const sampled = midis.length <= samples
    ? midis
    : Array.from(
      { length: samples },
      (_, i) => midis[Math.round(i * (midis.length - 1) / (samples - 1))],
    );
  const low = Math.min(...sampled);
  const span = Math.max(1, Math.max(...sampled) - low);

  const points = sampled.map((midi, i) => {
    const x = sampled.length === 1
      ? width / 2
      : 2 + i * (width - 4) / (sampled.length - 1);
    const y = height - 3 - (midi - low) * (height - 6) / span;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return <svg
    className="contour"
    viewBox={`0 0 ${width} ${height}`}
    aria-hidden="true">
    {points.length > 0 && <polyline points={points.join(' ')} />}
  </svg>;
}

interface TrackSelectorProps {
  midi: Midi;
  enabled: boolean;
  select: (name: string, midis: number[]) => void;
  cancel: () => void;
}

function TrackSelector({
  midi,
  enabled,
  select,
  cancel,
}: TrackSelectorProps): React.JSX.Element {
  useHotkeys({ Escape: cancel }, enabled);

  return <div className="dialog-layer">
    <div className="scrim" onClick={cancel}></div>
    <div
      className="dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="track-title">
      <h2 id="track-title">Pick a track</h2>
      <p className="dialog-text">
        {midi.name} has {midi.tracks.length}{' '}
        tracks with notes. Which one do you want to practise?
      </p>
      <ul className="track-list">
        {midi.tracks.map((t, i) => {
          const midis = t.notes.map(n => n.midi);
          return <li key={i}>
            <button
              type="button"
              className="track"
              autoFocus={i === 0}
              onClick={() =>
                select(`${midi.name} - ${t.name || `Track ${i + 1}`}`, midis)}>
              <Contour midis={midis} />
              <span className="track-text">
                <span className="track-name">{t.name || `Track ${i + 1}`}</span>
                <span className="track-meta">
                  {[
                    t.instrument.name,
                    plural(midis.length, 'note'),
                    displayRange(midis),
                  ]
                    .filter(Boolean).join(' · ')}
                </span>
              </span>
            </button>
          </li>;
        })}
      </ul>
      <div className="button-row end">
        <button type="button" className="button quiet" onClick={cancel}>
          Cancel
        </button>
      </div>
    </div>
  </div>;
}
