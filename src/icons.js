// Consistent outline icons: 24px grid, 2px rounded strokes.
const svg = body => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;

export const icons = {
  atom: svg('<ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>'),
  flask: svg('<path d="M9 3h6M10 3v6L4.8 17.6A2 2 0 0 0 6.5 21h11a2 2 0 0 0 1.7-3.4L14 9V3"/><path d="M7.5 15h9"/>'),
  bulb: svg('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2.2h5.2c0-1 .4-1.7 1-2.2A6 6 0 0 0 12 3Z"/>'),
  notebook: svg('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>'),
  book: svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>'),
  path: svg('<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H16"/>'),
  student: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.2-4 4.2-6 8-6s6.8 2 8 6"/>'),
  arrowLeft: svg('<path d="M19 12H5m6-6-6 6 6 6"/>'),
  arrowRight: svg('<path d="M5 12h14m-6-6 6 6-6 6"/>'),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
  lock: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
};

// Light illustration for the home page. Flat shapes only, no gradients.
export const heroArt = `<svg viewBox="0 0 440 340" focusable="false">
  <rect width="440" height="340" rx="36" fill="#E4EEFF"/>
  <circle cx="220" cy="170" r="120" fill="#FFFFFF"/>
  <g fill="none" stroke="#2563EB" stroke-width="5" stroke-linecap="round">
    <ellipse cx="220" cy="170" rx="130" ry="48"/>
    <ellipse cx="220" cy="170" rx="130" ry="48" transform="rotate(60 220 170)"/>
    <ellipse cx="220" cy="170" rx="130" ry="48" transform="rotate(-60 220 170)"/>
  </g>
  <circle cx="220" cy="170" r="20" fill="#2563EB"/>
  <circle cx="350" cy="170" r="11" fill="#FF7A30"/>
  <circle cx="110" cy="150" r="9" fill="#059669"/>
  <g transform="translate(300 226) scale(3)" fill="none" stroke="#059669" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 3h6M10 3v6L4.8 17.6A2 2 0 0 0 6.5 21h11a2 2 0 0 0 1.7-3.4L14 9V3"/><path d="M7.5 15h9"/>
  </g>
  <g transform="translate(64 40) scale(2.2)" fill="none" stroke="#B45309" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2.2h5.2c0-1 .4-1.7 1-2.2A6 6 0 0 0 12 3Z"/>
  </g>
  <path d="M384 40l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="#FFC83D"/>
</svg>`;
