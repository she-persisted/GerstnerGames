/**
 * @file assets/music/glacia.js
 * @about "Glacia Twinkle": a high, icy, plucked tune for the frozen planet. 92 bpm, E major. Song format is described in kit/music.js.
 * @provides Kit.songs.glacia
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  const _ = null;
  (Kit.songs = Kit.songs || {}).glacia = {
    title: "Glacia Twinkle", bpm: 92, root: 64, oct: 12, wave: "sine", pluck: true, leadLen: 3, leadVol: .055, pad: .025, bassWave: "sine", hatVol: .01,
    lead: [0,7,12,16, 12,7,4,7, 2,9,14,9, 4,9,12,_, 0,7,12,19, 16,12,7,12, 9,12,16,14, 12,_,_,_],
    chords: [[0,4,7],[-3,0,4],[-7,-3,0],[-5,-1,2]], bass: [1,0,0,0,0,0,1,0], hat: [0,0,0,1,0,0,0,1]
  };
})(window.Kit = window.Kit || {});
