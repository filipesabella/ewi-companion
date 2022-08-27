import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useHotkeys } from '../lib/useHotkeys';
import '../styles/database-exporter.less';
import { AppContext } from './App';

interface Props {
  close: () => void;
}

export function DatabaseImporter({ close }: Props): JSX.Element {
  const { database } = useContext(AppContext);

  const [data, setData] = useState({} as any);
  const [hasSongs, setHasSongs] = useState(false);
  const [valid, setValid] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    database.listCurrentSongs().then(songs => setHasSongs(songs.length > 0));
  }, []);

  useHotkeys({}, {
    27: _ => close(),
  });

  const onChange = (s: string) => {
    setError(false);
    try {
      setData(JSON.parse(s));
      setValid(true);
    } catch {
      setValid(false);
    }
  };

  const save = async () => {
    if (await database.import(data)) {
      window.location.reload();
    } else {
      setError(true);
    }
  };

  return <div id="database-exporter">
    <div className="database">
      <p>Paste the data below and click 'save'</p>
      {hasSongs && <h1>THIS WILL OVERRIDE ALL CURRENT SONGS</h1>}
      {error && <h2>Error importing data</h2>}
      <textarea onChange={e => onChange(e.target.value.trim())}></textarea>
      <div className="actions">
        <p
          className="close"
          onClick={_ => close()}>Close</p>
        <button
          className="save"
          disabled={!valid}
          title={!valid ? 'The data is invalid' : ''}
          onClick={_ => save()}>Save</button>
      </div>
    </div>
  </div>;
}
