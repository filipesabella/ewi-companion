import * as React from 'react';

const stroke = (...paths: React.ReactNode[]) =>
  <svg
    className="icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    {paths}
  </svg>;

const starPath = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 '
  + '3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

export const icons = {
  back: stroke(<path key="p" d="M15 18l-6-6 6-6" />),
  chevronDown: stroke(<path key="p" d="M6 9l6 6 6-6" />),
  close: stroke(<path key="p" d="M18 6L6 18M6 6l12 12" />),
  plus: stroke(<path key="p" d="M12 5v14M5 12h14" />),
  check: stroke(<path key="p" d="M20 6L9 17l-5-5" />),
  arrowUp: stroke(<path key="p" d="M12 19V5M5 12l7-7 7 7" />),
  arrowDown: stroke(<path key="p" d="M12 5v14M19 12l-7 7-7-7" />),
  alert: stroke(
    <circle key="c" cx="12" cy="12" r="10" />,
    <path key="p" d="M12 8v4M12 16h.01" />,
  ),
  star: stroke(<path key="p" d={starPath} />),
  starFilled: <svg
    className="icon"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true">
    <path d={starPath} />
  </svg>,
  play: <svg
    className="icon"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true">
    <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />
  </svg>,
  edit: stroke(
    <path
      key="p"
      d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />,
  ),
  trash: stroke(
    <path
      key="p"
      d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />,
  ),
  upload: stroke(
    <path
      key="p"
      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />,
  ),
  download: stroke(
    <path
      key="p"
      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
  ),
  music: stroke(
    <path key="p" d="M9 18V5l12-2v13" />,
    <circle key="a" cx="6" cy="18" r="3" />,
    <circle key="b" cx="18" cy="16" r="3" />,
  ),
  settings: stroke(
    <circle key="c" cx="12" cy="12" r="3" />,
    <path
      key="p"
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />,
  ),
  logo: <svg className="logo-mark" viewBox="0 0 14 24" aria-hidden="true">
    <circle cx="7" cy="4" r="3" />
    <circle cx="7" cy="12" r="3" />
    <circle cx="7" cy="20" r="3" className="open" />
  </svg>,
};
