/**
 * @file assets/music/shadow-run.js
 * @about "Shadow Run": the chase through the Shadow Gate: dark, pounding, and a little spooky. 176 bpm, D minor. Song format is described in kit/music.js.
 * @provides Kit.songs.shadowRun
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  const _ = null;
  (Kit.songs = Kit.songs || {}).shadowRun = {
    title: "Shadow Run", bpm: 176, root: 50, oct: 12, wave: "sawtooth", pluck: true, leadVol: .026, leadLen: 1, pad: .02, padWave: "sawtooth", bassWave: "sawtooth", bassVol: .06, bassLen: .8, hatVol: .03,
    lead: [0,_,0,_,3,_,0,_, 6,_,5,_,3,_,0,_, 0,_,0,_,3,_,7,_, 6,_,3,_,1,_,0,_],
    chords: [[0,3,7],[0,3,6],[-2,1,5],[-4,0,3]], bass: [0,1,0,1,0,1,0,1], kick: [1,0,1,0,1,0,1,1], hat: [0,1,0,1,0,1,0,1]
  };
})(window.Kit = window.Kit || {});
