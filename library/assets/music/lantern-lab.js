/**
 * @file assets/music/lantern-lab.js
 * @about "Lantern Lab": the third portal: glowing and sparkly, full of twinkling arpeggios, with the third piece of the weird music. 148 bpm, D major. Song format is described in kit/groove.js.
 * @provides Kit.songs.lantern
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  (Kit.songs = Kit.songs || {}).lantern = {
    title: "Lantern Lab", bpm: 148, root: 50, form: ["A", "B", "A", "B"],
    lead: { wave: "pulse25", vol: 0.045, oct: 12, echo: 0.3, vib: true },
    arp: { wave: "pulse12", vol: 0.02, oct: 24 },
    bass: { wave: "pulse25", vol: 0.042, oct: -12, gate: 0.8 },
    drums: { kick: 0.3, clap: 0.12, hat: 0.02, open: 0.022 },
    sections: {
      A: { chords: [[0, 4, 7], [4, 7, 11], [5, 9, 12], [7, 11, 14]], arp: true,
        lead: "16 . 14 . 12 . 14 . 16 - - - 12 - - - | 16 . 14 . 12 . 14 . 16 - - - 19 - - - | 17 - 16 - 14 - 12 - 14 - - - 7 - - - | 14 - 16 - 19 - - - 16 - - - . . . .",
        bass: "1...8.1.1...8.1.", kick: "x...x...x...x...", clap: "....x.......x...", hat: "..x...x...x...x." },
      B: { chords: [[9, 12, 16], [7, 11, 14], [5, 9, 12], [7, 11, 14]], arp: true,
        lead: "4 - 5 - 7 - - - 12 - - - 11 - 9 - | 7 - - - 4 - 2 - 4 - - - . . . . | 4 - 5 - 7 - - - 12 - - - 14 - 16 - | 19 - - - 16 - 14 - 16 - - - 12 - - -",
        bass: "1.8.1.8.1.8.1.8.", kick: "x...x...x...x...", clap: "....x.......x.......x.......x.......x.......x.......x.......x.xx", hat: "x.x.x.x.x.x.x.x.", open: "..x...x...x...x." }
    }
  };
})(window.Kit = window.Kit || {});
