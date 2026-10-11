/**
 * @file assets/music/corona.js
 * @about "Corona Blaze": a fast, driving adventure tune for the fiery nebula and the tower climb. 128 bpm, A minor. Song format is described in kit/music.js.
 * @provides Kit.songs.corona
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  const _ = null;
  (Kit.songs = Kit.songs || {}).corona = {
    title: "Corona Blaze", bpm: 128, root: 57, oct: 12, wave: "sawtooth", leadVol: .022, leadLen: 1.2, pad: .02, padWave: "triangle", bassVol: .07, bassLen: .9,
    lead: [0,_,3,7, 12,_,10,7, 8,_,7,5, 3,_,_,_, 3,_,7,10, 15,_,14,12, 10,_,12,14, 12,_,_,_],
    chords: [[0,3,7],[-4,0,3],[3,7,10],[-2,2,5]], bass: [1,1,1,1,1,1,1,2], hat: [0,1,0,1,0,1,0,1], kick: [1,0,0,0,1,0,0,0]
  };
})(window.Kit = window.Kit || {});
