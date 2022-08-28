import * as React from 'react';
import { useState } from 'react';
import { useHotkeys } from '../lib/useHotkeys';
import { DatabaseExporter } from './DatabaseExporter';
import { DatabaseImporter } from './DatabaseImporter';

import '../styles/settings.less';

interface Props {
  close: () => void;
}
export function Settings({ close }: Props): JSX.Element {
  const [exportingSongs, setExportingSongs] = useState<boolean>(false);
  const [importingSongs, setImportingSongs] = useState<boolean>(false);

  useHotkeys({}, {
    27: _ => close(),
  });

  const [showSheet, setShowSheet] = useState(showMusicSheet());
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    storeShowMusicSheet(checked);
    setShowSheet(checked);
  }

  return <div id="settings">
    <div className="settings">
      <div className="container">
        <fieldset>
          <legend>Settings</legend>
          <div className="showSheet">
            <input id="showSheetCheckbox"
              type="checkbox"
              checked={showSheet}
              onChange={onChange}></input>
            <label htmlFor="showSheetCheckbox">Show music sheet</label>
          </div>
        </fieldset>
        <fieldset>
          <legend>Backup & Restore</legend>
          <button onClick={() => setExportingSongs(true)}>Export songs</button>
          <button onClick={() => setImportingSongs(true)}>Import songs</button>
        </fieldset>
      </div>
      <div className="actions">
        <p
          className="close"
          onClick={_ => close()}>Close</p>
      </div>
    </div>
    {exportingSongs && <DatabaseExporter
      close={() => setExportingSongs(false)} />}
    {importingSongs && <DatabaseImporter
      close={() => setImportingSongs(false)} />}
  </div>;
}

export function showMusicSheet(): boolean {
  return (localStorage.getItem('show-music-sheet') || 'false') === 'true';
}

function storeShowMusicSheet(show:boolean): void {
  localStorage.setItem('show-music-sheet', String(show));
}
