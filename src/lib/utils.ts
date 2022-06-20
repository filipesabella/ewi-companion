// from https://stackoverflow.com/questions/11832914
// /round-to-at-most-2-decimal-places-only-if-necessary
export function roundNumber(n: number, decimals: number = 100): number {
  return Math.round((n + 0.000001) * decimals) / decimals;
}

export function mapRange(
  value: number, low1: number, high1: number, low2: number, high2: number)
  : number {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const noteNames = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

export function noteNameToMidi(note: string): number {
  const noteName = note.toUpperCase().replace(/\d/, '');
  const octave = parseInt(note.slice(-1));
  const noteIndex = noteNames.indexOf(noteName);
  return noteIndex + octave * 12;
}

export function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12);
  const noteIndex = midi % 12;
  return noteNames[noteIndex] + octave;
}
