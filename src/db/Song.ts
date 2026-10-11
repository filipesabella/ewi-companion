export interface Song {
  id: string;
  name: string;
  notes: Note[];
  bookmarks: number[];
  // index of the note practice stopped at, cleared when the song is finished
  lastPosition?: number;
  lastPracticedAt?: number;
}

export interface Note {
  id: string;
  midi: number;
  preferredEwiFingering: string | null;
}

export function isSongList(data: unknown): data is Song[] {
  return Array.isArray(data)
    && data.every(s =>
      typeof s?.id === 'string'
      && typeof s?.name === 'string'
      && Array.isArray(s?.notes)
      && Array.isArray(s?.bookmarks)
    );
}
