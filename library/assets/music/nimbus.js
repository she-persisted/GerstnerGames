/**
 * @file assets/music/nimbus.js
 * @about "Nimbus Bounce": a bouncy square-wave tune for the cotton-candy cloud planet. 120 bpm, D major. Song format is described in kit/music.js.
 * @provides Kit.songs.nimbus
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  const _ = null;
  (Kit.songs = Kit.songs || {}).nimbus = {
    title: "Nimbus Bounce", bpm: 120, root: 62, wave: "square", leadVol: .026, leadLen: .8, pad: .015,
    lead: [0,4,7,4, 9,7,4,_, 2,7,11,7, 14,11,7,_, 9,_,7,9, 11,9,7,4, 5,7,9,7, 4,2,0,_],
    chords: [[0,4,7],[-5,-1,2],[-3,0,4],[-7,-3,0]], bass: [1,0,2,0,1,0,2,0], hat: [0,1,0,1,0,1,0,1], kick: [1,0,0,0,1,0,0,0]
  };
})(window.Kit = window.Kit || {});
