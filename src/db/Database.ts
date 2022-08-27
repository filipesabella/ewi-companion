import Dexie from 'dexie';
import { Song } from './Song';

// TODO add some default songs
const dbName = 'ewi-companion-db';

let db: DexieNonSense;

export class Database {
  constructor() {
    db = new DexieNonSense();
  }

  public async initialize(): Promise<void> {
    await db.open();
  }

  public async listCurrentSongs(): Promise<Song[]> {
    return (await db.songs.toArray())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  public async song(id: string): Promise<Song | undefined> {
    return await db.songs.get(id);
  }

  public async deleteSong(id: string): Promise<void> {
    await db.songs.delete(id);
  }

  public async saveSong(song: Song): Promise<void> {
    await db.songs.update(song.id, song);
  }

  public async upsertSong(song: Song): Promise<void> {
    const existingSong = await db.songs.get(song.id);
    if (existingSong) {
      const wereTheNotesUpdated = existingSong.notes.map(n => n.midi)
        .join(',') !== song.notes.map(n => n.midi).join(',');

      if (wereTheNotesUpdated) {
        // this erases bookmarks and preferred fingering
        await db.songs.update(song.id, song);
      } else {
        await db.songs.update(song.id, {
          ...existingSong,
          name: song.name,
        });
      }
    } else {
      await db.songs.add(song);
    }
  }

  public async savePreferredFingering(
    songId: string, noteId: string, fingeringId: string | null): Promise<void> {
    db.songs.where({ id: songId }).modify(song => {
      song.notes = song.notes.map(n =>
        n.id === noteId
          ? { ...n, preferredEwiFingering: fingeringId }
          : n)
    });
  }

  public async toJSON(): Promise<string> {
    return JSON.stringify(await this.listCurrentSongs());
  }

  public async import(data: any): Promise<boolean> {
    try {
      await db.transaction('rw', db.songs, async () => {
        await db.songs.clear();
        await db.songs.bulkAdd(data);
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}

class DexieNonSense extends Dexie {
  songs: Dexie.Table<Song, string>;

  constructor() {
    super(dbName);
    this.version(1).stores({
      songs: 'id, name, notes, bookmarks',
    });
  }
}
