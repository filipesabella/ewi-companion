export interface Song {
  id: string;
  name: string;
  track: Track;
  bookmarks: number[];
}

export interface Track {
  id: string;
  name: string;
  notes: Note[];
}

export interface Note {
  id: string;
  name: string;
  midi: number;
  preferredEwiFingering: string | null;
}

export function noteIndex(track: Track, note: Note): number {
  for (let i = 0; i < track.notes.length; i++) {
    if (track.notes[i].id === note.id) {
      return i;
    }
  }
  return -1;
}
