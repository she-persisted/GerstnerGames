/* ==========================================================================
   Toybox Layer 1: Pictures
   One picture per word, keyed by the word itself. Reuse the same picture for
   the same word in every game so Child L learns it once.
   A picture definition:
     id     the word, lowercase ('fox')
     emoji  OR svg (inline markup drawn in a 100x100 viewBox)
     cls    optional extra class (e.g. 'tb-chubby' stretches the emoji wide)
     extra  optional small emoji in the corner (e.g. a bandage)
     note   optional: why this picture means this word, for grown-ups
   Words with no picture still work: the engine shows a letter tile.
   ========================================================================== */
(function (T) {
  'use strict';

  const SVG = {
    fridge:
      '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<rect x="30" y="88" width="9" height="9" rx="2" fill="#4d5d6b"/><rect x="61" y="88" width="9" height="9" rx="2" fill="#4d5d6b"/>' +
      '<rect x="24" y="4" width="52" height="86" rx="9" fill="#e4edf2" stroke="#4d5d6b" stroke-width="4"/>' +
      '<line x1="24" y1="36" x2="76" y2="36" stroke="#4d5d6b" stroke-width="4"/>' +
      '<rect x="63" y="14" width="6" height="14" rx="3" fill="#4d5d6b"/><rect x="63" y="44" width="6" height="22" rx="3" fill="#4d5d6b"/>' +
      '<circle cx="38" cy="20" r="5" fill="#ff5c8d"/><rect x="33" y="52" width="13" height="10" rx="2" fill="#ffc83d" transform="rotate(-8 39 57)"/>' +
      '</svg>',
    bead:
      '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<path d="M4 30 Q50 96 96 30" fill="none" stroke="#3b3550" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="22" cy="51" r="15" fill="#ff5f6d" stroke="#3b3550" stroke-width="2"/>' +
      '<circle cx="78" cy="51" r="15" fill="#ffa53a" stroke="#3b3550" stroke-width="2"/>' +
      '<circle cx="50" cy="63" r="17" fill="#4aa8ff" stroke="#3b3550" stroke-width="2"/>' +
      '<circle cx="17" cy="45" r="4.5" fill="#fff" opacity=".7"/><circle cx="73" cy="45" r="4.5" fill="#fff" opacity=".7"/>' +
      '<circle cx="44" cy="56" r="5" fill="#fff" opacity=".7"/>' +
      '</svg>',
    rag:
      '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<path d="M12 28 Q24 18 37 26 Q50 17 63 26 Q76 18 88 28 L84 74 Q71 84 58 76 Q45 86 33 76 Q21 84 16 74 Z" fill="#6cc5a0" stroke="#3b3550" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M16 74 L40 56 L33 76 Q21 84 16 74 Z" fill="#3f9b78" stroke="#3b3550" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<rect x="52" y="40" width="22" height="20" rx="2" fill="#ffc83d" stroke="#3b3550" stroke-width="2" transform="rotate(8 63 50)"/>' +
      '<path d="M53 44 l3 2 M53 52 l3 2 M71 47 l3 2 M70 56 l3 2" stroke="#3b3550" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="84" cy="14" r="7" fill="#d6efff" stroke="#4aa8ff" stroke-width="2"/><circle cx="72" cy="8" r="4.5" fill="#d6efff" stroke="#4aa8ff" stroke-width="2"/>' +
      '<circle cx="93" cy="27" r="4" fill="#d6efff" stroke="#4aa8ff" stroke-width="2"/>' +
      '</svg>',
    rake:
      '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<rect x="46" y="4" width="8" height="64" rx="4" fill="#b07a46" stroke="#3b3550" stroke-width="2"/>' +
      '<rect x="20" y="64" width="60" height="9" rx="3" fill="#8a9aa8" stroke="#3b3550" stroke-width="2"/>' +
      '<path d="M25 73 v15 M35 73 v15 M45 73 v15 M55 73 v15 M65 73 v15 M75 73 v15" stroke="#3b3550" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path d="M10 92 q6 -10 14 -4 q-6 8 -14 4z" fill="#ffa53a" stroke="#3b3550" stroke-width="1.5"/>' +
      '<path d="M78 94 q8 -9 14 -2 q-7 7 -14 2z" fill="#ff5f6d" stroke="#3b3550" stroke-width="1.5"/>' +
      '</svg>',
    whip:
      '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<path d="M70 58 q17 0 17 13 q0 13 -17 13" fill="none" stroke="#3b3550" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="M70 58 q17 0 17 13 q0 13 -17 13" fill="none" stroke="#ff7a59" stroke-width="5" stroke-linecap="round"/>' +
      '<rect x="22" y="50" width="50" height="42" rx="7" fill="#ff7a59" stroke="#3b3550" stroke-width="3"/>' +
      '<path d="M20 52 q-2 -14 12 -14 q2 -14 16 -12 q4 -16 14 -2 q16 -2 14 14 q12 2 8 14 z" fill="#fffaf0" stroke="#3b3550" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M45 26 q6 -14 4 -20 q8 8 4 20" fill="#fffaf0" stroke="#3b3550" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M32 46 q8 -6 14 0 M52 44 q8 -6 14 0" fill="none" stroke="#d9cfc0" stroke-width="2.5" stroke-linecap="round"/>' +
      '</svg>',
    lap:
      '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<rect x="14" y="20" width="6" height="46" rx="3" fill="#b07a46" stroke="#3b3550" stroke-width="2"/>' +
      '<rect x="14" y="60" width="46" height="7" rx="3" fill="#b07a46" stroke="#3b3550" stroke-width="2"/>' +
      '<path d="M20 67 v27 M55 67 v27" stroke="#3b3550" stroke-width="4" stroke-linecap="round"/>' +
      '<rect x="24" y="30" width="18" height="30" rx="8" fill="#4aa8ff" stroke="#3b3550" stroke-width="2"/>' +
      '<rect x="28" y="50" width="44" height="11" rx="5.5" fill="#3b6fd1" stroke="#3b3550" stroke-width="2"/>' +
      '<rect x="62" y="54" width="10" height="34" rx="5" fill="#3b6fd1" stroke="#3b3550" stroke-width="2"/>' +
      '<ellipse cx="72" cy="90" rx="9" ry="4.5" fill="#3b3550"/>' +
      '<circle cx="33" cy="20" r="10" fill="#f2c29b" stroke="#3b3550" stroke-width="2"/>' +
      '<ellipse cx="54" cy="44" rx="12" ry="7" fill="#ffa53a" stroke="#3b3550" stroke-width="2"/>' +
      '<circle cx="66" cy="38" r="7" fill="#ffa53a" stroke="#3b3550" stroke-width="2"/>' +
      '<path d="M61 33 l1 -7 l4 5 M67 31 l4 -6 l1 7" fill="#ffa53a" stroke="#3b3550" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M43 45 q-7 -3 -6 -11" fill="none" stroke="#3b3550" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M43 45 q-7 -3 -6 -11" fill="none" stroke="#ffa53a" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M36 38 q8 8 18 5" fill="none" stroke="#3b3550" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M36 38 q8 8 18 5" fill="none" stroke="#f2c29b" stroke-width="4" stroke-linecap="round"/>' +
      '</svg>',
    less:
      '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle cx="27" cy="62" r="21" fill="#fff" stroke="#3b3550" stroke-width="3"/>' +
      '<circle cx="73" cy="62" r="21" fill="#fff" stroke="#3b3550" stroke-width="3" opacity=".55"/>' +
      '<circle cx="27" cy="62" r="9" fill="#c98a4b" stroke="#3b3550" stroke-width="2"/>' +
      '<g opacity=".55"><circle cx="66" cy="55" r="7" fill="#c98a4b" stroke="#3b3550" stroke-width="2"/><circle cx="80" cy="55" r="7" fill="#c98a4b" stroke="#3b3550" stroke-width="2"/>' +
      '<circle cx="66" cy="69" r="7" fill="#c98a4b" stroke="#3b3550" stroke-width="2"/><circle cx="80" cy="69" r="7" fill="#c98a4b" stroke="#3b3550" stroke-width="2"/></g>' +
      '<path d="M27 8 v22 M18 22 l9 10 l9 -10" fill="none" stroke="#ff5c8d" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>'
  };

  T.pictures.addMany([
    { id: 'fox', emoji: '\uD83E\uDD8A' },
    { id: 'box', emoji: '\uD83D\uDCE6' },
    { id: 'fat', emoji: '\uD83D\uDC3B', cls: 'tb-chubby', note: 'A chubby bear, stretched wide.' },
    { id: 'bat', emoji: '\uD83E\uDD87' },
    { id: 'fit', emoji: '\uD83E\uDDE9', note: 'A puzzle piece that fits.' },
    { id: 'bit', emoji: '\uD83D\uDC1D', extra: '\uD83E\uDE79', note: 'A bee and a bandage: the bee bit me.' },
    { id: 'fin', emoji: '\uD83E\uDD88', note: 'The shark shows its fin.' },
    { id: 'bin', emoji: '\uD83D\uDDD1\uFE0F' },
    { id: 'fall', emoji: '\uD83C\uDF42', note: 'Leaves falling.' },
    { id: 'ball', emoji: '\uD83C\uDFC0' },
    { id: 'feed', emoji: '\uD83C\uDF7C', note: 'A bottle for feeding a baby.' },
    { id: 'bead', svg: SVG.bead, note: 'Three beads on a string.' },
    { id: 'phone', emoji: '\uD83D\uDCF1' },
    { id: 'bone', emoji: '\uD83E\uDDB4' },
    { id: 'funny', emoji: '\uD83D\uDE02' },
    { id: 'bunny', emoji: '\uD83D\uDC30' },
    { id: 'fridge', svg: SVG.fridge, note: 'A fridge with magnets.' },
    { id: 'bridge', emoji: '\uD83C\uDF09' },
    { id: 'fair', emoji: '\uD83C\uDFA1', note: 'A Ferris wheel at the fair.' },
    { id: 'bear', emoji: '\uD83D\uDC3B' },

    /* Gliding sheet (R/W, L/W, L/Y pairs), October 2026 */
    { id: 'ring', emoji: '\uD83D\uDC8D' },
    { id: 'wing', emoji: '\uD83E\uDEBD' },
    { id: 'wag', emoji: '\uD83D\uDC15', note: "A happy dog wags its tail." },
    { id: 'read', emoji: '\uD83D\uDCD6', note: "An open book to read." },
    { id: 'weed', emoji: '\uD83C\uDF3F', note: "A weed growing." },
    { id: 'wake', emoji: '\u23F0', note: "The alarm clock says wake up." },
    { id: 'rail', emoji: '\uD83D\uDEE4\uFE0F', note: "Train rails." },
    { id: 'whale', emoji: '\uD83D\uDC0B' },
    { id: 'ripe', emoji: '\uD83C\uDF4C', note: "A ripe yellow banana." },
    { id: 'wipe', emoji: '\uD83E\uDDFD', note: "A sponge to wipe the table." },
    { id: 'rock', emoji: '\uD83E\uDEA8' },
    { id: 'walk', emoji: '\uD83D\uDEB6' },
    { id: 'rich', emoji: '\uD83D\uDCB0', note: "A big bag of money." },
    { id: 'witch', emoji: '\uD83E\uDDD9\u200D\u2640\uFE0F', extra: '\uD83E\uDDF9', note: "A witch with her broom." },
    { id: 'reel', emoji: '\uD83C\uDFA3', note: "A fishing rod with a reel." },
    { id: 'wheel', emoji: '\uD83D\uDEDE' },
    { id: 'run', emoji: '\uD83C\uDFC3' },
    { id: 'one', emoji: '1\uFE0F\u20E3' },
    { id: 'link', emoji: '\uD83D\uDD17', note: "Chain links." },
    { id: 'wink', emoji: '\uD83D\uDE09' },
    { id: 'leak', emoji: '\uD83D\uDEB0', extra: '\uD83D\uDCA7', note: "A dripping tap leaks." },
    { id: 'week', emoji: '\uD83D\uDCC5', note: "A calendar shows the days of the week." },
    { id: 'lizard', emoji: '\uD83E\uDD8E' },
    { id: 'wizard', emoji: '\uD83E\uDDD9\u200D\u2642\uFE0F', extra: '\uD83E\uDE84', note: "A wizard with his wand, like Biscuit." },
    { id: 'lip', emoji: '\uD83D\uDC44' },
    { id: 'leather', emoji: '\uD83D\uDC5E', note: "A leather shoe." },
    { id: 'weather', emoji: '\uD83C\uDF26\uFE0F', note: "Sun and rain: the weather." },
    { id: 'light', emoji: '\uD83D\uDCA1' },
    { id: 'white', emoji: '\uD83E\uDD0D', note: "A white heart: the color white." },
    { id: 'leap', emoji: '\uD83E\uDD98', note: "A kangaroo leaps." },
    { id: 'weep', emoji: '\uD83D\uDE2D', note: "Weep means cry." },
    { id: 'lake', emoji: '\uD83C\uDFDE\uFE0F', note: "A lake by the mountains." },
    { id: 'lay', emoji: '\uD83D\uDC14', extra: '\uD83E\uDD5A', note: "A hen lays an egg." },
    { id: 'weigh', emoji: '\u2696\uFE0F', note: "Scales weigh things." },
    { id: 'lock', emoji: '\uD83D\uDD12' },
    { id: 'yap', emoji: '\uD83D\uDC36', extra: '\uD83D\uDCAC', note: "A puppy yapping." },
    { id: 'yay', emoji: '\uD83C\uDF89', note: "Yay! A party popper." },
    { id: 'lawn', emoji: '\uD83C\uDFE1', note: "The grass lawn by a house." },
    { id: 'yawn', emoji: '\uD83E\uDD71' },
    { id: 'lot', emoji: '\uD83C\uDD7F\uFE0F', note: "P for a parking lot." },
    { id: 'yacht', emoji: '\uD83D\uDEE5\uFE0F', note: "A yacht is a big boat." },
    { id: 'lose', emoji: '\uD83E\uDD37', extra: '\u2753', note: "Where did it go? You lose something." },
    { id: 'use', emoji: '\uD83D\uDEE0\uFE0F', note: "Tools to use." },
    { id: 'lung', emoji: '\uD83E\uDEC1', note: "Lungs fill with air when you breathe." },
    { id: 'young', emoji: '\uD83D\uDC76', note: "A young baby." },
    { id: 'yes', emoji: '\uD83D\uDC4D', note: "Thumbs up means yes." },
    { id: 'lamb', emoji: '\uD83D\uDC11', note: "A lamb is a baby sheep." },
    { id: 'yam', emoji: '\uD83C\uDF60', note: "A roasted yam." },
    { id: 'luck', emoji: '\uD83C\uDF40', note: "A four-leaf clover for luck." },
    { id: 'yuck', emoji: '\uD83E\uDD22' },
    { id: 'yip', emoji: '\uD83D\uDC29', extra: '\u2757', note: "A little dog gives a sharp yip." },
    { id: 'rag', svg: SVG.rag, note: "A cleaning rag with a patch." },
    { id: 'rake', svg: SVG.rake, note: "A rake for leaves." },
    { id: 'whip', svg: SVG.whip, note: "Whipped cream on cocoa." },
    { id: 'lap', svg: SVG.lap, note: "A kitty sits on a lap." },
    { id: 'less', svg: SVG.less, note: "Less: one cookie, not four." }
  ]);
})(window.Toybox);
