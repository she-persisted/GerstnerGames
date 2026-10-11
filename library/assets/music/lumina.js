/**
 * @file assets/music/lumina.js
 * @about "Lumina in the Dark": a slow, soft music-box tune for the sleeping home world. 74 bpm, A minor. Song format is described in kit/music.js.
 * @provides Kit.songs.lumina
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  const _ = null;
  (Kit.songs = Kit.songs || {}).lumina = {
    title: "Lumina in the Dark", bpm: 74, root: 57, oct: 12, wave: "sine", pluck: true, leadLen: 6, leadVol: .06, pad: .03, bassWave: "sine", bassVol: .07,
    lead: [12,_,_,_, 10,_,7,_, 8,_,_,_, 7,_,_,_, 5,_,_,_, 7,_,3,_, 2,_,_,_, 3,_,_,_],
    chords: [[0,3,7],[-4,0,3],[3,7,10],[-2,2,5]], bass: [1,0,0,0,0,0,0,0]
  };
})(window.Kit = window.Kit || {});
