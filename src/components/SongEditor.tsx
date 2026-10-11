import * as React from 'react';
import {
  useContext,
  useEffect,
  useState,
} from 'react';
import { Song } from '../db/Song';
import { icons } from '../icons';
import { useHotkeys } from '../lib/useHotkeys';
import {
  displayNoteName,
  displayRange,
  midiToNoteName,
  noteOctave,
  parseNote,
  plural,
  suggestNote,
  uuid,
} from '../lib/utils';
import { AppContext } from './App';
import { Staff } from './Staff';

import '../styles/song-editor.scss';

interface Props {
  song: Song;
  isNew: boolean;
  close: () => void;
}

interface Token {
  text: string;
  midi: number | null;
  suggestion: string | null;
}

const tokenize = (notes: string): Token[] =>
  notes
    .split(/[\s,]+/)
    .filter(t => t.length > 0)
    .reduce<{ tokens: Token[], octave: number }>(({ tokens, octave }, text) => {
      const midi = parseNote(text);
      return {
        tokens: [...tokens, {
          text,
          midi,
          suggestion: midi === null ? suggestNote(text, octave) : null,
        }],
        octave: midi === null ? octave : noteOctave(midi),
      };
    }, { tokens: [], octave: 4 })
    .tokens;

const errorMessage = (tokens: Token[]): string | null => {
  const invalid = tokens
    .map((token, i) => ({ token, position: i + 1 }))
    .filter(({ token }) => token.midi === null);

  if (invalid.length === 0) {
    return null;
  }

  const { token, position } = invalid[0];
  const first = `Note ${position}, “${token.text}”, isn't a note name.`
    + (token.suggestion ? ` Did you mean ${token.suggestion}?` : '');
  return invalid.length === 1
    ? first
    : `${first} ${plural(invalid.length - 1, 'more note')} to fix.`;
};

export function SongEditor({ song, isNew, close }: Props): React.JSX.Element {
  const { database, noteBeingPlayed, settingsOpen } = useContext(AppContext);

  const originalNotes = song.notes.map(n => midiToNoteName(n.midi)).join(' ');

  const [name, setName] = useState(song.name);
  const [notes, setNotes] = useState(originalNotes);
  const [recording, setRecording] = useState(false);

  const tokens = tokenize(notes);
  const midis = tokens.flatMap(t => t.midi === null ? [] : [t.midi]);
  const problems = tokens.length - midis.length;
  const error = errorMessage(tokens);
  const dirty = name !== song.name || notes !== originalNotes;

  const blocker = name.trim().length === 0
    ? 'Add a name to save'
    : tokens.length === 0
    ? 'Add some notes to save'
    : problems > 0
    ? `Fix ${plural(problems, 'note')} to save`
    : null;

  const save = () =>
    blocker === null && database.upsertSong({
      ...song,
      name: name.trim(),
      notes: midis.map(midi => ({
        id: uuid(),
        midi,
        preferredEwiFingering: null,
      })),
    }).then(close);

  // leaving with Esc would lose changes, so only allow it when there are none
  useHotkeys(dirty ? {} : { Escape: close }, !settingsOpen);

  useEffect(() => {
    if (recording && noteBeingPlayed !== null) {
      setNotes(n =>
        (n.trimEnd() + ' ' + midiToNoteName(noteBeingPlayed)).trim()
      );
    }
  }, [noteBeingPlayed]);

  return <div className="song-editor">
    <header className="top-bar bordered">
      <button type="button" className="back-link" onClick={close}>
        {icons.back}
        Library
      </button>
      <div className="divider"></div>
      <h1 className="editor-title">{isNew ? 'New song' : 'Edit song'}</h1>
      <div className="spacer"></div>
      {blocker && dirty && <span className="save-blocker">{blocker}</span>}
      <button type="button" className="button quiet" onClick={close}>
        Cancel
      </button>
      <button
        type="button"
        className="button primary"
        disabled={blocker !== null}
        onClick={save}>
        Save song
      </button>
    </header>

    <main className="editor-main">
      <div className="editor-fields">
        <div className="field">
          <label htmlFor="song-name">Name</label>
          <input
            id="song-name"
            type="text"
            autoFocus={isNew}
            value={name}
            onChange={e => setName(e.target.value)} />
        </div>

        <div className="field">
          <div className="notes-label-row">
            <div className="notes-label">
              <label htmlFor="song-notes">Notes</label>
              <span id="song-notes-hint" className="field-hint">
                Note names separated by spaces, like C4 or F#4
              </span>
            </div>
            <button
              type="button"
              className={'button record' + (recording ? ' active' : '')}
              aria-pressed={recording}
              onClick={() => setRecording(!recording)}>
              <span className="record-dot"></span>
              {recording
                ? 'Recording, play some notes'
                : 'Record from your EWI'}
            </button>
          </div>
          <textarea
            id="song-notes"
            aria-describedby="song-notes-hint song-notes-error"
            aria-invalid={problems > 0}
            rows={5}
            spellCheck={false}
            value={notes}
            onChange={e => setNotes(e.target.value)}>
          </textarea>

          {tokens.length > 0
            && <ol className="note-chips" aria-label="Parsed notes">
              {tokens.map((t, i) =>
                <li key={i} className={t.midi === null ? 'invalid' : ''}>
                  {t.midi === null ? t.text : displayNoteName(t.midi)}
                </li>
              )}
            </ol>}
          {error
            && <p id="song-notes-error" className="notes-error" role="alert">
              {icons.alert}
              {error}
            </p>}
        </div>
      </div>

      <aside className="preview" aria-labelledby="preview-title">
        <h2 id="preview-title" className="eyebrow">Preview</h2>
        <div className="preview-staff">
          {tokens.length > 0
            ? <Staff
              notes={tokens.map(t => ({ midi: t.midi, tone: 'plain' }))}
              extent={midis}
              label={'Staff preview: '
                + tokens.map(t =>
                  t.midi === null ? 'an invalid note' : displayNoteName(t.midi)
                ).join(', ')} />
            : <p className="preview-empty">Notes show up here as you type.</p>}
        </div>
        <dl className="stats">
          <div>
            <dt>Notes</dt>
            <dd>{tokens.length}</dd>
          </div>
          <div>
            <dt>Range</dt>
            <dd>{displayRange(midis).replace(' to ', '–') || '–'}</dd>
          </div>
          <div>
            <dt>Problems</dt>
            <dd className={problems > 0 ? 'bad' : ''}>{problems}</dd>
          </div>
        </dl>
      </aside>
    </main>
  </div>;
}
