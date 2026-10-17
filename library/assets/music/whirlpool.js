/**
 * @file assets/music/whirlpool.js
 * @about "Whirlpool Warp": the fourth portal: swirly sixteenth-note runs, and its chorus is the whole weird tune at last. 152 bpm, E major. Song format is described in kit/groove.js.
 * @provides Kit.songs.whirl
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  (Kit.songs = Kit.songs || {}).whirl = {
    title: "Whirlpool Warp", bpm: 152, root: 52, form: ["A", "B", "A", "B"],
    lead: { wave: "pulse25", vol: 0.045, oct: 12, echo: 0.3, vib: true },
    arp: { wave: "pulse12", vol: 0.016, oct: 12 },
    bass: { wave: "pulse25", vol: 0.042, oct: -12, gate: 0.8 },
    drums: { kick: 0.3, clap: 0.12, hat: 0.02, open: 0.022 },
    sections: {
      A: { chords: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [7, 11, 14]], arp: true,
        lead: "12 11 9 7 4 7 9 11 12 . 16 . 12 . . . | 14 11 7 11 14 16 14 11 7 . 11 . 14 . . . | 16 12 9 12 16 19 16 12 9 . 12 . 16 . . . | 14 . 11 . 7 . 11 . 14 - - - 7 - - -",
        bass: "1.8.1.8.1.8.1.8.", kick: "x...x...x...x...", clap: "....x.......x...", hat: "x.x.x.x.x.x.x.x." },
      B: { chords: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [7, 11, 14]], arp: true,
        lead: "7 - - - 4 - - - 5 - 7 - 9 - - - | 7 - - - 4 - - - 2 - - - 0 - - - | 4 - 5 - 7 - - - 12 - - - 11 - 9 - | 7 - - - - - 7 - 9 - - - 12 - - -",
        bass: "1.8.1.8.1.8.1.8.", kick: "x...x...x...x...x...x...x...x...x...x...x...x...x...x...x.x.xxxx", clap: "....x.......x.......x.......x.......x.......x.......x.......x.xx", hat: "x.x.x.x.x.x.x.x.", open: "..x...x...x...x." }
    }
  };
})(window.Kit = window.Kit || {});
