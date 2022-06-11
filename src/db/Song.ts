export interface Song {
  id: string;
  name: string;
  notes: Note[];
  bookmarks: number[];
}

export interface Note {
  id: string;
  name: string;
  midi: number;
  preferredEwiFingering: string | null;
}

export function noteIndex(song: Song, note: Note): number {
  for (let i = 0; i < song.notes.length; i++) {
    if (song.notes[i].id === note.id) {
      return i;
    }
  }
  return -1;
}
