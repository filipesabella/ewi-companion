import { Midi } from '@tonejs/midi';
import { Note as ToneJSNote } from '@tonejs/midi/dist/Note';
import Dexie from 'dexie';
import { uuid } from '../lib/utils';
import { Note, Song } from './Song';

const dbName = 'midi-thing-db';

let db: DixieNonSense;

export class Database {
  constructor() {
    db = new DixieNonSense();
  }

  public async initialize(): Promise<void> {
    await db.open();
  }

  public async listCurrentSongs(): Promise<Song[]> {
    return await db.songs.toArray();
  }

  public async song(id: string): Promise<Song | undefined> {
    return await db.songs.get(id);
  }

  public async deleteSong(id: string): Promise<void> {
    await db.songs.delete(id);
  }

  public async save(midi: Midi): Promise<void> {
    await db.songs.put({
      id: uuid(),
      name: midi.name,
      notes: midi.tracks[0].notes.map(toneJSNoteToNote),
      bookmarks: [],
    });
  }

  public async saveSong(song: Song): Promise<void> {
    await db.songs.update(song.id, song);
  }

  public async savePreferredFingering(
    song: Song, note: Note, fingeringId: string | null)
    : Promise<void> {
    await db.songs.update(song.id, {
      ...song,
      notes: song.notes.map(n =>
        n.id === note.id
          ? { ...n, preferredEwiFingering: fingeringId }
          : { ...n, preferredEwiFingering: null })
    });
  }
}

function toneJSNoteToNote(n: ToneJSNote): Note {
  return {
    id: uuid(),
    name: n.name,
    midi: n.midi,
    preferredEwiFingering: null,
  };
}

class DixieNonSense extends Dexie {
  songs: Dexie.Table<Song, string>;

  constructor() {
    super(dbName);
    this.version(1).stores({
      songs: 'id, name, notes, bookmarks',
    });
  }
}
