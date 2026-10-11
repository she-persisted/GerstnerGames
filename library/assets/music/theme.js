/**
 * @file assets/music/theme.js
 * @about "Starward Theme": the cheerful main tune for the title screen and flights. 104 bpm, C major. Song format is described in kit/music.js.
 * @provides Kit.songs.theme
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  const _ = null;
  (Kit.songs = Kit.songs || {}).theme = {
    title: "Starward Theme", bpm: 104, root: 60, wave: "triangle", leadVol: .05, pad: .022,
    lead: [0,_,4,7, 12,_,11,7, 9,_,7,4, 7,_,_,_, 5,_,9,12, 14,_,12,9, 11,_,7,2, 7,_,_,_],
    chords: [[0,4,7],[-3,0,4],[-7,-3,0],[-5,-1,2]], bass: [1,0,0,1,1,0,1,0], hat: [0,0,1,0,0,0,1,0], kick: [1,0,0,0,1,0,0,0]
  };
})(window.Kit = window.Kit || {});
