/**
 * @file assets/music/home-stomp.js
 * @about "Home Stomp": the ending: the lullaby turned into a big hardcore party. 170 bpm, C major. Song format is described in kit/music.js.
 * @provides Kit.songs.homeStomp
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  const _ = null;
  (Kit.songs = Kit.songs || {}).homeStomp = {
    title: "Home Stomp", bpm: 170, root: 60, oct: 12, wave: "square", pluck: true, leadVol: .032, leadLen: 1.2, pad: .018, padWave: "sawtooth", bassWave: "sawtooth", bassVol: .05, bassLen: .8, hatVol: .028,
    lead: [7,_,4,_,5,7,9,_, 7,_,4,_,2,_,0,_, 4,5,7,_,12,_,11,9, 7,_,12,_,7,_,12,_],
    chords: [[0,4,7],[-3,0,4],[5,9,12],[7,11,14]], bass: [0,1,0,1,0,1,0,2], kick: [1,0,1,0,1,0,1,0], hat: [0,1,0,1,0,1,1,1]
  };
})(window.Kit = window.Kit || {});
