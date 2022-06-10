import { Midi } from '@tonejs/midi';
import { Note } from '@tonejs/midi/dist/Note';

export function importMidi(fileName: string, input: Buffer): Midi {
  const midi = new Midi(input);
  if (midi.tracks.length === 2) {
    // assume it's a single piano track with different tracks for left and
    // right hands
    const sameChannel = midi.tracks[0].channel === midi.tracks[1].channel;
    const sameInstrument = JSON.stringify(midi.tracks[0].instrument) ===
      JSON.stringify(midi.tracks[1].instrument);
    if (sameChannel && sameInstrument) {
      // merge tracks
      midi.tracks[0].notes = midi.tracks[0].notes.concat(midi.tracks[1].notes);
      midi.tracks = midi.tracks.slice(0, 1);
      midi.tracks[0].notes.sort((a, b) => a.time - b.time);
    }
  }

  const minWaitInSeconds = 3;
  const earliestNote = midi.tracks
    .reduce((acc, t) => acc.concat(t.notes), [] as Note[])
    .sort((a, b) => a.time - b.time)[0];
  if (earliestNote.time < minWaitInSeconds) {
    const diff = minWaitInSeconds - earliestNote.time;
    midi.tracks.forEach(t => t.notes.forEach(n => n.time = n.time + diff));
  }

  midi.tracks = midi.tracks.filter(t => t.notes.length > 0);

  midi.name = midi.name.trim() || fileName;

  return midi;
}
