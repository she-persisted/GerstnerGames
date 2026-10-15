/* ==========================================================================
   Toybox Layer 4: Content pack "r-w-initial"
   Pure data. No code, no markup.
   Pack type "minimal-pairs":
     items   [[wordA, wordB], ...]  pairs that differ by one sound
     sounds  [{label, cue}, {label, cue}]  matches position A and B
     source  where the words came from
   New homework sheet = copy this file, change the words, give it a new id.
   ========================================================================== */
(function (T) {
  'use strict';
  T.packs.add({
    id: 'r-w-initial',
    type: 'minimal-pairs',
    title: 'R and W at the start of words',
    source: "Child L's speech homework, October 2026 (Gliding sheet)",
    sounds: [
      { label: 'R', cue: 'Growl like a tiger! Tongue pulls back, lips stay open, no kiss. Rrrr!' },
      { label: 'W', cue: 'Kissy lips, then open them. W, w, w!' }
    ],
    items: [
      ['ring', 'wing'],
      ['rag', 'wag'],
      ['read', 'weed'],
      ['rake', 'wake'],
      ['rail', 'whale'],
      ['ripe', 'wipe'],
      ['rock', 'walk'],
      ['rich', 'witch'],
      ['reel', 'wheel'],
      ['run', 'one']
    ]
  });
})(window.Toybox);
