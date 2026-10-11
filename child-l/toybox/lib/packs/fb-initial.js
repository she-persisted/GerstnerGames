/* ==========================================================================
   Toybox Layer 4: Content pack "fb-initial"
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
    id: 'fb-initial',
    type: 'minimal-pairs',
    title: 'F and B at the start of words',
    source: "Child L's speech homework, October 2026",
    sounds: [
      { label: 'F', cue: 'Bunny teeth on your bottom lip, then blow like wind. Ffff!' },
      { label: 'B', cue: 'Lips together, then pop! B, b, b!' }
    ],
    items: [
      ['fox', 'box'],
      ['fat', 'bat'],
      ['fit', 'bit'],
      ['fin', 'bin'],
      ['fall', 'ball'],
      ['feed', 'bead'],
      ['phone', 'bone'],
      ['funny', 'bunny'],
      ['fridge', 'bridge'],
      ['fair', 'bear']
    ]
  });
})(window.Toybox);
