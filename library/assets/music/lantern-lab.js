/**
 * @file assets/music/lantern-lab.js
 * @about "Lantern Lab": the third portal: glowing and quick, with the third piece of the weird music. 172 bpm, F major. Song format is described in kit/music.js.
 * @provides Kit.songs.lantern
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  const _ = null;
  (Kit.songs = Kit.songs || {}).lantern = {
    title: "Lantern Lab", bpm: 172, root: 53, oct: 12, wave: "sawtooth", pluck: true, leadVol: .024, leadLen: 1.1, pad: .016, padWave: "triangle", bassWave: "sawtooth", bassVol: .05, bassLen: .8, hatVol: .028,
    lead: [4,5,7,_,12,_,11,9, 7,_,5,_,4,_,2,_, 4,5,7,_,12,_,11,9, 12,_,14,_,16,_,_,_],
    chords: [[0,4,7],[2,5,9],[5,9,12],[7,11,14]], bass: [0,1,0,1,0,1,0,1], kick: [1,0,1,0,1,0,1,0], hat: [0,1,0,1,0,1,0,1]
  };
})(window.Kit = window.Kit || {});
