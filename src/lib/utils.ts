export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const noteNames = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

const letterSemitones: { [letter: string]: number } = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const accidentalSemitones: { [accidental: string]: number } = {
  '': 0,
  '#': 1,
  '♯': 1,
  'b': -1,
  '♭': -1,
};

// Accepts names like C4, F#4, F♯4, Bb4 or b♭4, returns null for anything else
export function parseNote(text: string): number | null {
  const match = text.match(/^([a-g])([#♯b♭]?)(\d)$/i);
  if (!match) {
    return null;
  }

  const [, letter, accidental, octave] = match;
  const midi = parseInt(octave) * 12
    + letterSemitones[letter.toUpperCase()]
    + accidentalSemitones[accidental];

  return midi >= 0 && midi <= 127 ? midi : null;
}

// A likely fix for a note name that doesn't parse, e.g. H5 -> B5 or F# -> F#4
export function suggestNote(text: string, octave: number): string | null {
  const candidates = [
    text.replace(/^h/i, 'B'),
    text + octave,
    text.replace(/^h/i, 'B') + octave,
  ];

  return candidates.find(c => c !== text && parseNote(c) !== null) ?? null;
}

export function noteOctave(midi: number): number {
  return Math.floor(midi / 12);
}

export function midiToNoteName(midi: number): string {
  return noteNames[midi % 12] + noteOctave(midi);
}

// The note name without octave, with a real sharp sign, e.g. F♯
export function displayPitch(midi: number): string {
  return noteNames[midi % 12].replace('#', '♯');
}

export function displayNoteName(midi: number): string {
  return displayPitch(midi) + noteOctave(midi);
}

export function isSharp(midi: number): boolean {
  return noteNames[midi % 12].includes('#');
}

export function noteRange(midis: number[]): [number, number] | null {
  return midis.length === 0
    ? null
    : [Math.min(...midis), Math.max(...midis)];
}

export function displayRange(midis: number[]): string {
  const range = noteRange(midis);
  return range === null
    ? ''
    : range[0] === range[1]
    ? displayNoteName(range[0])
    : `${displayNoteName(range[0])} to ${displayNoteName(range[1])}`;
}

export function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}
