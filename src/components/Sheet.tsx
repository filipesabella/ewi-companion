import * as React from 'react';
import { Note } from '../db/Song';
import { isSharp, midiToNoteName } from '../lib/utils';
import '../styles/sheet.less';

interface Props {
  currentNote: Note;
  lowestNote: number;
  highestNote: number;
}

const highestNoteNoVA = 80;
const lowestNoteNoVB = 38;
const highestNoteNoMA = 92;
const lowestNoteNoMB = 26;

const intervalHeight = 6.8;

export function Sheet({
  currentNote,
  lowestNote,
  highestNote, }: Props): JSX.Element {
  const midi = currentNote.midi;

  const sharp = isSharp(midi);
  const normalisedNote = sharp ? midi - 1 : midi;

  const va = midi > highestNoteNoVA && midi <= highestNoteNoMA;
  const vb = midi < lowestNoteNoVB && midi >= lowestNoteNoMB;
  const ma = midi > highestNoteNoMA;
  const mb = midi < lowestNoteNoMB;

  const noteRowIndex = rowIndexes[midiToNoteName(normalisedNote)] || 0;
  const sharpRowIndex =
    rowIndexes[midiToNoteName(normalisedSharpNotePosition(midi))] || 0;

  const noteTop = -15 + noteRowIndex * intervalHeight;
  const sharpTop = 2 + sharpRowIndex * intervalHeight;

  return <div id="sheet">
    <div className="clef">𝄞</div>
    <div className="ledger ledger-up">
      {highestNote >= 79 && <div></div>}
      {highestNote >= 76 && <div></div>}
      {highestNote >= 72 && <div></div>}
      {highestNote >= 69 && <div></div>}
    </div>
    <div className="staff">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
    <div className="ledger ledger-down">
      {lowestNote <= 49 && <div></div>}
      {lowestNote <= 46 && <div></div>}
      {lowestNote <= 42 && <div></div>}
      {lowestNote <= 39 && <div></div>}
    </div>
    <div className="sharp" style={{
      display: sharp ? 'block' : 'none',
      top: sharpTop + 'px'
    }}>♯</div>
    <div className="note" style={{ top: noteTop + 'px' }}>𝅝</div>
    <div className="octave"
      style={{ display: va ? 'block' : 'none' }}>𝄶</div>
    <div className="octave"
      style={{ display: vb ? 'block' : 'none' }}>𝄷</div>
    <div className="octave"
      style={{ display: ma ? 'block' : 'none' }}>𝄸</div>
    <div className="octave"
      style={{ display: mb ? 'block' : 'none' }}>𝄹</div>
  </div>;
}

function normalisedSharpNotePosition(sharpNote: number): number {
  // the # symbol is always placed between G4 and F5, so we map the note to
  // this interval
  while (sharpNote > 65) sharpNote -= 12;
  while (sharpNote < 55) sharpNote += 12;
  return sharpNote - 1; // remove the sharp
}

// was doing arithmethic gymnastics and the code looked unmaintainable. this is
// simpler
const rowIndexes: { [key: string]: number } = {
  'D9': 3, // midi 111
  'C9': 4,
  'B8': 5,
  'A8': 6,
  'G8': 0,
  'F8': 1,
  'E8': 2,
  'D8': 3,
  'C8': 4,
  'B7': 5,
  'A7': 6,
  'G7': 0,
  'F7': 1,
  'E7': 2,
  'D7': 3,
  'C7': 4,
  'B6': 5,
  'A6': 6,
  'G6': 0, // G#6 midi 80, no va limit
  'F6': 1,
  'E6': 2,
  'D6': 3,
  'C6': 4,
  'B5': 5,
  'A5': 6,
  'G5': 7,
  'F5': 8,
  'E5': 9,
  'D5': 10,
  'C5': 11,
  'B4': 12,
  'A4': 13,
  'G4': 14, // midi 55
  'F4': 15,
  'E4': 16,
  'D4': 17,
  'C4': 18,
  'B3': 19,
  'A3': 20,
  'G3': 21,
  'F3': 22,
  'E3': 23,
  'D3': 24, // midi 38, no vb limit
  'C3': 18,
  'B2': 19,
  'A2': 20,
  'G2': 21,
  'F2': 22,
  'E2': 23,
  'D2': 24,
  'C2': 18,
  'B1': 21,
  'A1': 22, // midi 22
};

