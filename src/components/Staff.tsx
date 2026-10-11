import * as React from 'react';
import {
  isSharp,
  noteOctave,
} from '../lib/utils';

import '../styles/staff.scss';

export type StaffTone = 'played' | 'current' | 'upcoming' | 'plain';

export interface StaffNote {
  // null for something that isn't a note, drawn as a question mark
  midi: number | null;
  tone: StaffTone;
  // how far ahead an upcoming note is, they fade out with distance
  distance?: number;
  // a wrong note played in place of this one
  ghost?: number | null;
}

interface Props {
  // null leaves an empty slot, e.g. before the first note of a song
  notes: (StaffNote | null)[];
  // every note that may be shown, keeps the height stable while moving
  extent: number[];
  label: string;
  highlight?: number;
}

// one unit is half the space between two staff lines
const unit = 6;
const slotWidth = 64;
const stemLength = 7;
// how far a note can go past the staff before it's moved by an octave
const lowestPosition = -8;
const highestPosition = 16;
const middleLine = 4;

// position of each pitch class on the staff, sharps sit on their natural
const letterIndexes = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];

interface Placed {
  // 0 is the bottom line (E4) and 8 the top line (F5)
  position: number;
  octaveShift: number;
}

const place = (midi: number): Placed => {
  const position = noteOctave(midi) * 7 + letterIndexes[midi % 12] - 30;
  const octaveShift = position > highestPosition
    ? -Math.ceil((position - highestPosition) / 7)
    : position < lowestPosition
    ? Math.ceil((lowestPosition - position) / 7)
    : 0;
  return { position: position + octaveShift * 7, octaveShift };
};

const octaveMark = (shift: number) =>
  ['15mb', '8vb', '', '8va', '15ma'][Math.max(-2, Math.min(2, -shift)) + 2];

const range = (from: number, to: number, step: number) =>
  Array.from(
    { length: Math.max(0, Math.floor((to - from) / step) + 1) },
    (_, i) => from + i * step,
  );

export function Staff({
  notes,
  extent,
  label,
  highlight,
}: Props): React.JSX.Element {
  const placed = extent.map(place);
  const positions = placed.map(p => p.position);
  const top = Math.max(10, ...positions) + 2
    + (placed.some(p => p.octaveShift < 0) ? 3 : 0);
  const bottom = Math.min(-3, ...positions) - 2
    - (placed.some(p => p.octaveShift > 0) ? 3 : 0);

  const width = Math.max(1, notes.length) * slotWidth;
  const height = (top - bottom) * unit;
  const y = (position: number) => (top - position) * unit;

  const ledgers = (x: number, position: number) =>
    [
      ...range(10, position, 2),
      ...range(position + (position % 2 === 0 ? 0 : 1), -2, 2),
    ].map(p =>
      <line
        key={p}
        className="ledger"
        x1={x - 13}
        x2={x + 13}
        y1={y(p)}
        y2={y(p)} />
    );

  const sharp = (x: number, cy: number) =>
    <path
      className="sharp"
      d={`M${x - 22} ${cy - 9}v18M${x - 17} ${cy - 10}v18`
        + `M${x - 25} ${cy - 1}l11 -3M${x - 25} ${cy + 5}l11 -3`} />;

  const head = (x: number, midi: number, hollow: boolean) => {
    const { position, octaveShift } = place(midi);
    const cy = y(position);
    const stemUp = position < middleLine;
    const mark = octaveMark(octaveShift);

    return <>
      {ledgers(x, position)}
      {isSharp(midi) && sharp(x, cy)}
      <ellipse
        className={hollow ? 'head hollow' : 'head'}
        cx={x}
        cy={cy}
        rx="7.5"
        ry="5.5"
        transform={`rotate(-20 ${x} ${cy})`} />
      {!hollow && <line
        className="stem"
        x1={stemUp ? x + 7 : x - 7}
        x2={stemUp ? x + 7 : x - 7}
        y1={cy + (stemUp ? -2 : 2)}
        y2={cy + (stemUp ? -1 : 1) * stemLength * unit} />}
      {mark && <text
        className="octave-mark"
        textAnchor="middle"
        fontSize="11"
        x={x}
        y={octaveShift < 0 ? y(Math.max(position, 8) + 3) : y(
          Math.min(position, 0) - 4,
        )}>
        {mark}
      </text>}
    </>;
  };

  return <svg
    className="staff"
    viewBox={`0 0 ${width} ${height}`}
    style={{ '--slots': notes.length } as React.CSSProperties}
    role="img"
    aria-label={label}>
    {highlight !== undefined && <rect
      className="highlight"
      x={highlight * slotWidth + 4}
      y={unit}
      width={slotWidth - 8}
      height={height - unit * 2}
      rx="10" />}
    <g className="lines">
      {range(0, 8, 2).map(p =>
        <line key={p} x1="0" x2={width} y1={y(p)} y2={y(p)} />
      )}
    </g>
    {notes.map((note, i) => {
      const x = slotWidth / 2 + i * slotWidth;
      return note && <g
        key={i}
        className={'note ' + note.tone}
        style={{ '--distance': note.distance ?? 0 } as React.CSSProperties}>
        {note.midi === null
          ? <g className="invalid">
            <rect x={x - 14} y={y(6)} width="28" height="32" rx="6" />
            <text x={x} y={y(6) + 22} textAnchor="middle" fontSize="16">
              ?
            </text>
          </g>
          : head(x, note.midi, false)}
        {note.ghost != null && <g className="ghost">
          {head(x, note.ghost, true)}
        </g>}
      </g>;
    })}
  </svg>;
}
