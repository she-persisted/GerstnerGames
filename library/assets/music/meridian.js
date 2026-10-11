/**
 * @file assets/music/meridian.js
 * @about "Meridian Stargazer": a thoughtful, wandering tune for the stony planet of the old stargazer. 88 bpm, G minor. Song format is described in kit/music.js.
 * @provides Kit.songs.meridian
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  const _ = null;
  (Kit.songs = Kit.songs || {}).meridian = {
    title: "Meridian Stargazer", bpm: 88, root: 55, oct: 12, wave: "triangle", leadVol: .055, pad: .025,
    lead: [7,_,5,3, 5,_,_,_, 2,3,5,7, 9,_,_,_, 10,_,9,7, 5,_,3,2, 3,_,2,0, 0,_,_,_],
    chords: [[0,3,7],[-7,-3,0],[-2,2,5],[0,3,7]], bass: [1,0,0,1,0,0,1,0], hat: [0,0,1,0,0,0,1,0], kick: [1,0,0,0,0,0,0,0]
  };
})(window.Kit = window.Kit || {});
