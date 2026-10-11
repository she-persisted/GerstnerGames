/* ==========================================================================
   Toybox Layer 1: Characters
   Each character is data plus one small render() that returns markup.
   Keep looks, names and voices stable: familiarity is the point.
   A character definition:
     id, name, role, look, personality,
     voice: {pitch, rate}            (browser voice settings)
     render(): markup                (uses .tb-host-* classes from theme.css)
     lines: {kind: ['text with {vars}', ...]}
   Line kinds the game types and shell ask for:
     hello, whichOne, find, praise, oops, sayPrompt, abracadabra, mixup,
     close, tryAgain, newOne, jarFull, and 'intro:<mechanic id>'.
   Vars available: {word}, {Word} (capitalized), {other}, {child}.
   ========================================================================== */
(function (T) {
  'use strict';

  function starPath(cx, cy, R) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? R * 0.45 : R;
      const a = (-90 + i * 36) * Math.PI / 180;
      d += (i ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1) + ' ';
    }
    return d + 'Z';
  }

  const wizardHat =
    '<svg class="tb-host-accessory" style="--acc-w:.66em;--acc-left:.2em;--acc-top:-.36em;--acc-rot:-10deg" viewBox="0 0 120 112" aria-hidden="true">' +
    '<path d="M60 6 C66 34 80 62 98 86 L22 86 C40 62 54 34 60 6Z" style="fill:var(--tb-candy);stroke:var(--tb-ink)" stroke-width="5" stroke-linejoin="round"/>' +
    '<ellipse cx="60" cy="90" rx="55" ry="13" style="fill:var(--tb-candy-deep);stroke:var(--tb-ink)" stroke-width="5"/>' +
    '<path d="' + starPath(58, 58, 9) + ' ' + starPath(61, 32, 5) + ' ' + starPath(44, 75, 5) + '" style="fill:var(--tb-sun)"/>' +
    '</svg>';

  /* Biscuit: a golden retriever pup, front view, in a 100x100 box. One warm gold
     all over (no white blaze, which reads as a beagle), fluffy cheeks and chest,
     and soft feathered ears drawn over the head so they hang past the cheeks. */
  const GOLD = '#eeb04e', GOLD_DEEP = '#d58f34', GOLD_LIGHT = '#f8d695', INK = 'var(--tb-ink)';
  const mirror = (d) => d.replace(/(-?[\d.]+) (-?[\d.]+)/g, (m, x, y) => (100 - x) + ' ' + y);
  const EAR_L = 'M33 25 C20 21 9 32 8 48 C7 60 9 69 13 74 Q16 71 18 76 Q21 72 24 76 Q26 70 29 72 C30 62 30 48 34 34 Z';
  const ear = (d, side) =>
    '<path class="tb-host-ear tb-host-ear-' + side + '" d="' + d + '" fill="' + GOLD_DEEP + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>';
  const eye = (cx) =>
    '<circle cx="' + cx + '" cy="45" r="5.2" style="fill:var(--tb-ink)"/>' +
    '<circle cx="' + (cx + 1.8) + '" cy="43.2" r="1.9" fill="#fff"/>';
  const retriever =
    '<svg class="tb-host-face" viewBox="0 0 100 100" aria-hidden="true">' +
    // fluffy chest and a pink collar with a star tag
    '<path d="M30 74 C27 86 33 93 37 96 Q41 99 45 96 Q50 100 55 96 Q59 99 63 96 C67 93 73 86 70 74 Z" fill="' + GOLD_LIGHT + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M32 81 Q50 90 68 81" fill="none" style="stroke:var(--tb-candy)" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="' + starPath(50, 90, 5.5) + '" style="fill:var(--tb-sun);stroke:var(--tb-ink)" stroke-width="1.2" stroke-linejoin="round"/>' +
    // head with fluffy cheeks
    '<path d="M50 15 C70 15 80 29 80 46 C80 57 77 65 73 71 Q75 76 69 77 Q68 81 62 80 Q57 84 50 82 Q43 84 38 80 Q32 81 31 77 Q25 76 27 71 C23 65 20 57 20 46 C20 29 30 15 50 15 Z" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<ellipse cx="50" cy="64" rx="16" ry="12.5" fill="' + GOLD_LIGHT + '"/>' +
    // floppy feathered ears
    ear(EAR_L, 'l') + ear(mirror(EAR_L), 'r') +
    // kind brows, eyes (blink together), rosy cheeks
    '<path d="M33 37 Q38 34 43 37 M57 37 Q62 34 67 37" fill="none" stroke="' + GOLD_DEEP + '" stroke-width="2.4" stroke-linecap="round"/>' +
    '<g class="tb-host-eyes">' + eye(38) + eye(62) + '</g>' +
    '<ellipse cx="34" cy="60" rx="5" ry="3" style="fill:var(--tb-candy)" opacity=".35"/>' +
    '<ellipse cx="66" cy="60" rx="5" ry="3" style="fill:var(--tb-candy)" opacity=".35"/>' +
    // tongue, smile, nose
    '<path d="M45.5 69 C45.5 79 54.5 79 54.5 69 Z" fill="#ff7c9e" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M50 62 L50 68 M41 66 Q45.5 72 50 68 Q54.5 72 59 66" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M42.5 55 Q50 51.5 57.5 55 Q57.5 61 50 63 Q42.5 61 42.5 55 Z" style="fill:var(--tb-ink)"/>' +
    '<ellipse cx="47" cy="55.5" rx="2.6" ry="1.4" fill="#fff" opacity=".6"/>' +
    '</svg>';

  T.characters.add({
    id: 'biscuit',
    name: 'Biscuit',
    role: 'Wizard pup. Host of every game so far.',
    look: 'Golden retriever pup with big feathered floppy ears, a fluffy chest and a happy tongue, in a tilted pink wizard hat with three yellow stars and a star tag on a pink collar.',
    personality: 'Cheerful, silly, a little clumsy with magic. Loves jokes. Never scolds.',
    voice: { pitch: 1.25, rate: 0.95 },
    render() {
      return '<span class="tb-host-inner">' + retriever + wizardHat + '</span>';
    },
    lines: {
      hello: ["Hi {child}! I'm Biscuit, a wizard pup. My magic works best with your best sounds. Pick a game!"],
      'intro:listen-tap': ["Listen game! I'll say a word. You tap the picture."],
      'intro:say-it': ['Magic word game! You say the word, and a grown-up listens.'],
      whichOne: ['Which one did I say?'],
      find: ['Tap the picture for', 'Show me'],
      praise: ['{Word}! You got it!', 'Yes! {Word}!', 'Woof woof! {Word}!'],
      oops: ['Oops, that one says {other}! Listen again.'],
      sayPrompt: ['Say the magic word!', 'Your turn! Say the magic word!'],
      abracadabra: ['Abracadabra! {Word}!', 'Poof! {Word}!'],
      mixup: ['Whoops! You said {other}! My magic got mixed up!'],
      close: ['So close! Try one more time.'],
      tryAgain: ['Try again!'],
      newOne: ['Great trying! Here comes a new one.'],
      jarFull: ['You filled the candy jar! Joke time!']
    }
  });
})(window.Toybox);
