import * as React from 'react';
import { useEffect, useState } from 'react';
import { WebMidi } from 'webmidi';
import { Database } from '../db/Database';
import { Song } from '../db/Song';
import { useHotkeys } from '../lib/useHotkeys';
import { Ewi } from './Ewi';
import { Tracks } from './Tracks';

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

  const [currentTrack, setCurrentTrack] = useState(
    song.tracks[song.selectedTrack]);

  const [notesDown, setNotesDown] = useState(new Set<number>());

  useEffect(() => {
    WebMidi.enable({
      callback: (err: any) => {
        if (err) throw err;
        if (WebMidi.inputs.length === 0) {
          console.error('No webmidi inputs');
          return;
        }
        const inputs = WebMidi.inputs
          // filter out the mac virtual midi input thing
          .filter(i => !i.name.startsWith('IAC Driver Bus'));

        const input = inputs[0];
        console.log('Input', JSON.stringify(input));

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
  });

  // force re-render on resize
  const [, setState] = useState();
  useEffect(() => {
    window.addEventListener('resize', () => {
      setState({} as any);
    });
  });

  useHotkeys({}, {
    27: _ => goBack(),
  });

  return <div id="song">
    <Tracks
      song={song}
      database={database}
      setCurrentTrack={setCurrentTrack}
      currentTrack={currentTrack} />
    <Ewi
      database={database}
      song={song}
      track={currentTrack}
      notesDown={notesDown} />
  </div>;
}

