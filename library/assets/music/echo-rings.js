/**
 * @file assets/music/echo-rings.js
 * @about "Echo Rings": the first portal: bouncy and bright, and it hides the first piece of the weird music. 168 bpm, A major. Song format is described in kit/music.js.
 * @provides Kit.songs.echo
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  const _ = null;
  (Kit.songs = Kit.songs || {}).echo = {
    title: "Echo Rings", bpm: 168, root: 57, oct: 12, wave: "square", pluck: true, leadVol: .03, leadLen: 1.2, pad: .016, padWave: "triangle", bassWave: "sawtooth", bassVol: .05, bassLen: .8, hatVol: .026,
    lead: [7,_,4,_,5,7,9,_, 12,_,12,_,9,_,7,_, 7,_,4,_,5,7,9,_, 12,14,12,9,7,_,4,_],
    chords: [[0,4,7],[5,9,12],[-3,0,4],[7,11,14]], bass: [0,1,0,1,0,1,0,1], kick: [1,0,1,0,1,0,1,0], hat: [0,1,0,1,0,1,0,1]
  };
})(window.Kit = window.Kit || {});
