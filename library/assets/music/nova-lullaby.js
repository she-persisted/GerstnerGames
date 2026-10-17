/**
 * @file assets/music/nova-lullaby.js
 * @about "Nova's Lullaby": the weird music itself: a high, squeaky music-box lullaby. 100 bpm, C major, no drums. Song format is described in kit/music.js.
 * @provides Kit.songs.lullaby
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  const _ = null;
  (Kit.songs = Kit.songs || {}).lullaby = {
    title: "Nova's Lullaby", bpm: 100, root: 72, oct: 0, wave: "sine", pluck: true, leadVol: .07, leadLen: 2.4, pad: .012, padWave: "sine", bassWave: "sine", bassVol: .03, bassLen: 6,
    lead: [7,_,4,_,5,7,9,_, 7,_,4,_,2,_,0,_, 4,5,7,_,12,_,11,9, 7,_,_,_,_,_,_,_],
    chords: [[0,4,7],[0,4,7],[-3,0,4],[-5,-1,2]], bass: [1,0,0,0,0,0,0,0]
  };
})(window.Kit = window.Kit || {});
