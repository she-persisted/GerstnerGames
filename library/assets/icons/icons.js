/**
 * @file assets/icons/icons.js
 * @about Simple filled icons used on buttons so the game needs fewer words: back, go, retry, rocket, check, eye, music note, play, stop, and a shovel.
 * @provides Kit.art.icons { back, go, retry, rocket, check, eye, note, play, stop, shovel } (SVG markup strings)
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  const art = Kit.art = Kit.art || {};
  art.icons = {
    back: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 5.3a1 1 0 0 1 0 1.4L9.4 12l5.3 5.3a1 1 0 1 1-1.4 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.4 0z"/></svg>`,
    go: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.3 5.3a1 1 0 0 1 1.4 0l6 6a1 1 0 0 1 0 1.4l-6 6a1 1 0 1 1-1.4-1.4l5.3-5.3-5.3-5.3a1 1 0 0 1 0-1.4z"/></svg>`,
    retry: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5a7 7 0 1 1-6.6 4.7 1 1 0 1 1 1.9.6A5 5 0 1 0 12 7H9.5l1.2 1.3a1 1 0 0 1-1.4 1.4L6.3 6.7a1 1 0 0 1 0-1.4l3-3a1 1 0 0 1 1.4 1.4L9.4 5H12z"/></svg>`,
    rocket: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c3 2 5 6 5 10l2 3v4l-3-2h-8l-3 2v-4l2-3c0-4 2-8 5-10zm0 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-2 10h4l-2 3z"/></svg>`,
    check: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 16.2 5.3 12l-1.4 1.4 5.6 5.6L20.1 8.4 18.7 7z"/></svg>`,
    eye: `<svg viewBox="0 0 24 24" aria-hidden="true" style="width:20px;height:20px;fill:currentColor"><path d="M12 5c5 0 9 4.5 10 7-1 2.5-5 7-10 7S3 14.5 2 12c1-2.5 5-7 10-7zm0 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>`,
    note: `<svg class="note-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18.5A3.5 3.5 0 1 1 7 15.3V4l12-2v13.5a3.5 3.5 0 1 1-2-3.2V6.4L9 7.7z"/></svg>`,
    play: `<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5 L12 7 L3 12.5 Z" fill="currentColor"/></svg>`,
    stop: `<svg viewBox="0 0 14 14" aria-hidden="true"><rect x="2.5" y="2.5" width="9" height="9" rx="1.5" fill="currentColor"/></svg>`,
    shovel: `<svg class="shovel" viewBox="0 0 48 48" aria-hidden="true"><path d="M30 6l12 12-4 4-3-3-9 9 3 5c1 2 0 4-1 5l-4 4c-3 3-9 3-13-1s-4-10-1-13l4-4c1-1 3-2 5-1l5 3 9-9-3-3z" fill="#b9a27a"/></svg>`
  };
})(window.Kit = window.Kit || {});
