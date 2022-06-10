import { midiHelper } from '../lib/midiHelper';
import { roundNumber } from '../lib/utils';

export interface Song {
  id: string;
  name: string;
  tracks: Track[];
  selectedTrack: number;
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
  time: number;
  midi: number;
  duration: number;
  preferredEwiFingering: string | null;
}

export function lowestAndHighestMajorNotes(track: Track): [number, number] {
  const sortedNotes = track.notes.slice(0).sort((a, b) => a.midi - b.midi);
  let lowestNote = sortedNotes[0].midi;
  if (midiHelper.sharps.has(lowestNote)) lowestNote--;

  let highestNote = sortedNotes[sortedNotes.length - 1].midi;
  if (midiHelper.sharps.has(highestNote)) highestNote++;

  return [lowestNote, highestNote];
}

export function notesAt(track: Track, roundedCurrentTimeInSeconds: number)
  : Note[] {
  const result: Note[] = [];
  // doing it like this for performance
  for (let i = 0; i < track.notes.length; i++) {
    const notes = track.notes[i];
    const roundedNoteTime = roundNumber(notes.time);
    // give some error margin from the user
    const isCurrentNote =
      Math.abs(roundedNoteTime - roundedCurrentTimeInSeconds) < .01;
    if (isCurrentNote) result.push(notes);

    // assumes the notes are sorted by time
    if (roundedNoteTime > roundedCurrentTimeInSeconds) {
      break;
    }
  }

  return result;
}

export function noteAt(
  track: Track,
  roundedCurrentTimeInSeconds: number): Note | null {
  const ns = notesAt(track, roundedCurrentTimeInSeconds);
  return ns && ns[0];
}

export function noteIndex(track: Track, note: Note): number {
  for (let i = 0; i < track.notes.length; i++) {
    if (track.notes[i].id === note.id) {
      return i;
    }
  }
  return -1;
}

export function noteAtOrAfter(
  track: Track,
  roundedCurrentTimeInSeconds: number): Note | null {
  let n: Note | null = noteAt(track, roundedCurrentTimeInSeconds);
  for (let i = 0; i < 10000; i++) {
    if (n) break;
    n = noteAt(track, roundedCurrentTimeInSeconds + (i / 100));
  }
  return n;
}

