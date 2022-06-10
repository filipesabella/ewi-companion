import { midiToPitchClass, midiToPitch } from '../tonejs/Note';

const cs = [0, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120];
const majors = new Set(cs.reduce<number[]>((acc, c) =>
  acc.concat([c, c + 2, c + 4, c + 5, c + 7, c + 9, c + 11]), []));
const sharps = new Set(cs.reduce<number[]>((acc, c) =>
  acc.concat([c + 1, c + 3, c + 6, c + 8, c + 10]), []));

export const midiHelper = {
  sharps,
  majors,
  midiToPitchClass: midiToPitchClass,
  midiToPitch: midiToPitch,
};
