import * as React from 'react';
import { Database } from '../db/Database';
import { Song, Track } from '../db/Song';

require('../styles/tracks.less');

interface Props {
  song: Song;
  currentTrack: Track;
  setCurrentTrack: (track: Track) => void;
  database: Database;
}

export function Tracks({
  song,
  currentTrack,
  setCurrentTrack,
  database, }: Props): JSX.Element {
  return <div className="tracks">
    {song.tracks.map((t, i) => track(t, i,
      currentTrack.id === t.id,
      setCurrentTrack,
      song,
      database))}
  </div>;
}

function track(
  track: Track,
  index: number,
  isCurrentTrack: boolean,
  setCurrentTrack: (track: Track) => void,
  song: Song,
  database: Database, ) {

  async function doSetCurrentTrack(): Promise<void> {
    song.selectedTrack = index;
    setCurrentTrack(track);
    await database.saveSong(song);
  }

  return <div
    key={track.name + '-' + index}
    className={'track ' + (isCurrentTrack ? 'current' : '')}
    onClick={_ => doSetCurrentTrack()}>
    <p>{track.name || 'Track ' + index}</p>
  </div>;
}
