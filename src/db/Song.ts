export interface Song {
  id: string;
  name: string;
  notes: Note[];
  bookmarks: number[];
}

export interface Note {
  id: string;
  midi: number;
  preferredEwiFingering: string | null;
}
