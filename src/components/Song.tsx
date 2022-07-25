import * as React from 'react';
import { Song } from '../db/Song';
import { useHotkeys } from '../lib/useHotkeys';
import { Ewi } from './Ewi';

require('../styles/song.less');

interface Props {
  goBack: () => void;
  song: Song;
}

// TODO delete this component
export function SongComponent({ song, goBack }: Props): JSX.Element {
  useHotkeys({}, {
    27: _ => goBack(),
  });

  return <div id="song">
    <Ewi song={song} />
  </div>;
}

