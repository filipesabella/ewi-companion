import * as React from 'react';
import { useEffect, useState } from 'react';
import { WebMidi } from 'webmidi';
import { Database } from '../db/Database';
import { Song } from '../db/Song';
import { useHotkeys } from '../lib/useHotkeys';
import { Ewi } from './Ewi';

require('../styles/song.less');

interface Props {
  goBack: () => void;
  song: Song;
  database: Database;
}

export function SongComponent({
  song,
  goBack,
  database, }: Props): JSX.Element {

  const [notesDown, setNotesDown] = useState(new Set<number>());

  useEffect(() => {
    WebMidi.enable({
      callback: (err: any) => {
        if (err) throw err;
        if (WebMidi.inputs.length === 0) {
          console.error('No webmidi inputs');
          return;
        }

        const input = WebMidi.inputs[0];
        console.log('Input', input);

        input.addListener('noteon', e => {
          setNotesDown(notes => new Set(notes.add(e.note.number)));
        });
        input.addListener('noteoff', e => {
          setNotesDown(notes => {
            notes.delete(e.note.number);
            return new Set(notes);
          });
        });
      }
    });
  }, []);

  // force re-render on resize
  const [, setState] = useState();
  useEffect(() => {
    window.addEventListener('resize', () => {
      setState({} as any);
    });
  }, []);

  useHotkeys({}, {
    27: _ => goBack(),
  });

  return <div id="song">
    <Ewi
      database={database}
      song={song}
      track={song.track}
      notesDown={notesDown} />
  </div>;
}

