/**
 * @file assets/music/reborn.js
 * @about "Lumina Reborn": the happy ending tune when the Everlight comes home. 108 bpm, C major. Song format is described in kit/music.js.
 * @provides Kit.songs.reborn
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  const _ = null;
  (Kit.songs = Kit.songs || {}).reborn = {
    title: "Lumina Reborn", bpm: 108, root: 60, wave: "triangle", leadVol: .05, pad: .028,
    lead: [12,_,11,12, 14,_,12,_, 11,_,9,7, 7,_,_,_, 9,_,11,12, 16,_,14,12, 12,_,11,9, 12,_,_,_],
    chords: [[0,4,7],[-5,-1,2],[-3,0,4],[-7,-3,0]], bass: [1,0,1,0,1,0,2,0], hat: [0,1,0,1,0,1,0,1], kick: [1,0,0,0,1,0,0,0]
  };
})(window.Kit = window.Kit || {});
