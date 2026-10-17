/**
 * @file assets/music/home-stomp.js
 * @about "Home Stomp": the ending: the lullaby turned into a huge, happy dance party. 160 bpm, C major. Song format is described in kit/groove.js.
 * @provides Kit.songs.homeStomp
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  (Kit.songs = Kit.songs || {}).homeStomp = {
    title: "Home Stomp", bpm: 160, root: 60, form: ["A", "B", "A", "B"],
    lead: { wave: "pulse25", vol: 0.045, oct: 0, echo: 0.25, vib: true },
    arp: { wave: "pulse12", vol: 0.016, oct: 12 },
    bass: { wave: "pulse25", vol: 0.042, oct: -12, gate: 0.8 },
    drums: { kick: 0.3, clap: 0.12, hat: 0.02, open: 0.022 },
    sections: {
      A: { chords: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]], arp: true,
        lead: "12 . 12 . 16 . 19 . 24 - 19 . 16 . 19 . | 11 . 11 . 14 . 19 . 23 - 19 . 14 . 19 . | 9 . 9 . 12 . 16 . 21 - 16 . 12 . 16 . | 5 . 9 . 12 . 17 . 21 - - - 19 - 17 -",
        bass: "1.8.1.8.1.8.1.8.", kick: "x...x...x...x...", clap: "....x.......x...", hat: "x.x.x.x.x.x.x.x.", open: "..x...x...x...x." },
      B: { chords: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [7, 11, 14]], arp: true,
        lead: "19 - - - 16 - - - 17 - 19 - 21 - - - | 19 - - - 16 - - - 14 - - - 12 - - - | 16 - 17 - 19 - - - 24 - - - 23 - 21 - | 19 - - - 24 - - - 19 - - - 24 - - -",
        bass: "1.8.1.8.1.8.1.8.", kick: "x...x...x...x...x...x...x...x...x...x...x...x...x...x...x.x.xxxx", clap: "....x.......x.......x.......x.......x.......x.......x.......x.xx", hat: "x.x.x.x.x.x.x.x.", open: "..x...x...x...x." }
    }
  };
})(window.Kit = window.Kit || {});
