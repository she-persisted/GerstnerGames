/**
 * @file assets/music/glitch-hub.js
 * @about "Glitch Hub Stomp": the stompy theme for the title screen and the crash pad. 166 bpm, D minor, hardcore kick on every beat. Song format is described in kit/music.js.
 * @provides Kit.songs.glitchHub
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  const _ = null;
  (Kit.songs = Kit.songs || {}).glitchHub = {
    title: "Glitch Hub Stomp", bpm: 166, root: 50, oct: 12, wave: "square", pluck: true, leadVol: .032, leadLen: 1.1, pad: .016, padWave: "sawtooth", bassWave: "sawtooth", bassVol: .05, bassLen: .8, hatVol: .028,
    lead: [0,_,0,12, 0,_,10,_, 7,_,7,12, 7,_,5,3, 0,_,0,12, 0,_,10,_, 12,_,15,_, 14,12,10,7],
    chords: [[0,3,7],[-2,2,5],[-4,0,3],[-5,-1,2]], bass: [0,1,0,1,0,1,0,2], kick: [1,0,1,0,1,0,1,0], hat: [0,1,0,1,0,1,0,1]
  };
})(window.Kit = window.Kit || {});
