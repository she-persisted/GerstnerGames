/* ==========================================================================
   Toybox Layer 4: Content pack "l-y-initial"
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
    id: 'l-y-initial',
    type: 'minimal-pairs',
    title: 'L and Y at the start of words',
    source: "Child L's speech homework, October 2026 (Gliding sheet)",
    sounds: [
      { label: 'L', cue: 'Tongue tip up behind your top teeth, then let it drop. La, la, la!' },
      { label: 'Y', cue: 'Big smile, then start to say yes. Y, y, y!' }
    ],
    items: [
      ['lap', 'yap'],
      ['lay', 'yay'],
      ['lawn', 'yawn'],
      ['lot', 'yacht'],
      ['lose', 'use'],
      ['lung', 'young'],
      ['less', 'yes'],
      ['lamb', 'yam'],
      ['luck', 'yuck'],
      ['lip', 'yip']
    ]
  });
})(window.Toybox);
