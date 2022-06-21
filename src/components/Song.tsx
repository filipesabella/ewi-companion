import * as React from 'react';
import { useEffect, useState } from 'react';
import { WebMidi } from 'webmidi';
import { Song } from '../db/Song';
import { useHotkeys } from '../lib/useHotkeys';
import { Ewi } from './Ewi';

require('../styles/song.less');

interface Props {
  goBack: () => void;
  song: Song;
}

export function SongComponent({ song, goBack }: Props): JSX.Element {
  const [noteDown, setNoteDown] = useState<number | null>(null);

  useEffect(() => {
    WebMidi.enable().then(() => {
      if (WebMidi.inputs.length === 0) {
        console.error('No webmidi inputs');
        return;
      }

      const input = WebMidi.inputs[0];
      console.log('Input', WebMidi.inputs);

      input.addListener('noteon', e => {
        setNoteDown(e.note.number);
      });
      input.addListener('noteoff', () => {
        setNoteDown(null);
      });
    }).catch(err => alert(err));
  }, []);

  useHotkeys({}, {
    27: _ => goBack(),
  });

  return <div id="song">
    <Ewi song={song} noteDown={noteDown} />
  </div>;
}

