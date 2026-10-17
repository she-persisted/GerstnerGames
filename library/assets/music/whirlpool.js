/**
 * @file assets/music/whirlpool.js
 * @about "Whirlpool Warp": the fourth portal: swirly and fast, and its melody is the whole weird tune at last. 174 bpm, E major. Song format is described in kit/music.js.
 * @provides Kit.songs.whirl
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  const _ = null;
  (Kit.songs = Kit.songs || {}).whirl = {
    title: "Whirlpool Warp", bpm: 174, root: 52, oct: 12, wave: "square", pluck: true, leadVol: .03, leadLen: 1.2, pad: .018, padWave: "sawtooth", bassWave: "sawtooth", bassVol: .05, bassLen: .8, hatVol: .028,
    lead: [7,_,4,_,5,7,9,_, 7,_,4,_,2,_,0,_, 4,5,7,_,12,_,11,9, 7,_,_,7,9,_,12,_],
    chords: [[0,4,7],[5,9,12],[-3,0,4],[7,11,14]], bass: [0,1,0,1,0,1,0,2], kick: [1,0,1,0,1,0,1,0], hat: [1,1,0,1,1,1,0,1]
  };
})(window.Kit = window.Kit || {});
