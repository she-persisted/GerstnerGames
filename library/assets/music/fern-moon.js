/**
 * @file assets/music/fern-moon.js
 * @about "Fern Moon Feast": the second portal: a happy, leafy stomp with the second piece of the weird music. 170 bpm, G major. Song format is described in kit/music.js.
 * @provides Kit.songs.fern
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  const _ = null;
  (Kit.songs = Kit.songs || {}).fern = {
    title: "Fern Moon Feast", bpm: 170, root: 55, oct: 12, wave: "triangle", pluck: true, leadVol: .055, leadLen: 1.2, pad: .018, padWave: "sawtooth", bassWave: "square", bassVol: .04, bassLen: .8, hatVol: .026,
    lead: [0,_,4,7, 12,_,7,4, 7,_,4,_,2,_,0,_, 0,_,4,7, 12,_,14,12, 7,_,4,_,2,_,0,_],
    chords: [[0,4,7],[-3,0,4],[5,9,12],[7,11,14]], bass: [0,1,0,1,0,1,0,2], kick: [1,0,1,0,1,0,1,0], hat: [0,1,0,1,0,1,1,1]
  };
})(window.Kit = window.Kit || {});
