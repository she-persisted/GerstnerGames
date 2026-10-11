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
    { id: 'bear', emoji: '\uD83D\uDC3B' }
  ]);
})(window.Toybox);
