/* ==========================================================================
   Toybox Layer 4: Content pack "l-w-initial"
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
    id: 'l-w-initial',
    type: 'minimal-pairs',
    title: 'L and W at the start of words',
    source: "Child L's speech homework, October 2026 (Gliding sheet)",
    sounds: [
      { label: 'L', cue: 'Tongue tip up behind your top teeth, then let it drop. La, la, la!' },
      { label: 'W', cue: 'Kissy lips, then open them. W, w, w!' }
    ],
    items: [
      ['link', 'wink'],
      ['leak', 'week'],
      ['lizard', 'wizard'],
      ['lip', 'whip'],
      ['leather', 'weather'],
      ['light', 'white'],
      ['leap', 'weep'],
      ['lake', 'wake'],
      ['lay', 'weigh'],
      ['lock', 'walk']
    ]
  });
})(window.Toybox);
