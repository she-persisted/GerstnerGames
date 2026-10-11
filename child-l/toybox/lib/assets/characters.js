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
    '<svg class="tb-host-accessory" style="--acc-w:.82em;--acc-left:.06em;--acc-top:-.5em;--acc-rot:-12deg" viewBox="0 0 120 112" aria-hidden="true">' +
    '<path d="M60 6 C66 34 80 62 98 86 L22 86 C40 62 54 34 60 6Z" style="fill:var(--tb-candy);stroke:var(--tb-ink)" stroke-width="5" stroke-linejoin="round"/>' +
    '<ellipse cx="60" cy="90" rx="55" ry="13" style="fill:var(--tb-candy-deep);stroke:var(--tb-ink)" stroke-width="5"/>' +
    '<path d="' + starPath(58, 58, 9) + ' ' + starPath(61, 32, 5) + ' ' + starPath(44, 75, 5) + '" style="fill:var(--tb-sun)"/>' +
    '</svg>';

  T.characters.add({
    id: 'biscuit',
    name: 'Biscuit',
    role: 'Wizard pup. Host of every game so far.',
    look: 'Cream puppy face (dog emoji) in a tilted pink wizard hat with three yellow stars.',
    personality: 'Cheerful, silly, a little clumsy with magic. Loves jokes. Never scolds.',
    voice: { pitch: 1.25, rate: 0.95 },
    render() {
      return '<span class="tb-host-inner">' + wizardHat + '<span class="tb-host-face">\uD83D\uDC36</span></span>';
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
