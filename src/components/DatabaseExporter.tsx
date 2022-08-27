import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useHotkeys } from '../lib/useHotkeys';
import '../styles/database-exporter.less';
import { AppContext } from './App';

interface Props {
  close: () => void;
}

export function DatabaseExporter({ close }: Props): JSX.Element {
  const { database } = useContext(AppContext);

  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    database.toJSON().then(setData);
  }, []);

  useHotkeys({}, {
    27: _ => close(),
  });

  return <div id="database-exporter">
    <div className="database">
      <p>Copy the text below and store it somewhere</p>
      <textarea defaultValue={data || ''}></textarea>
      <div className="actions">
        <p
          className="close"
          onClick={_ => close()}>Close</p>
      </div>
    </div>
  </div>;
}
