/**
 * @file assets/music/shadow-run.js
 * @about "Shadow Run": the chase through the Shadow Gate: sneaky and silly-spooky in a minor key, but still a bouncy dance. 156 bpm, D minor. Song format is described in kit/groove.js.
 * @provides Kit.songs.shadowRun
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  (Kit.songs = Kit.songs || {}).shadowRun = {
    title: "Shadow Run", bpm: 156, root: 50, form: ["A", "B", "A", "B"],
    lead: { wave: "pulse25", vol: 0.045, oct: 12, echo: 0.22, vib: true },
    arp: { wave: "pulse12", vol: 0.014, oct: 12 },
    bass: { wave: "pulse25", vol: 0.042, oct: -12, gate: 0.8 },
    drums: { kick: 0.32, clap: 0.12, hat: 0.02, open: 0.022 },
    sections: {
      A: { chords: [[0, 3, 7], [8, 12, 15], [10, 14, 17], [0, 3, 7]], arp: false,
        lead: "12 . 12 . 15 . 12 . 17 . 15 . 12 . 10 . | 8 . 8 . 12 . 8 . 15 . 12 . 8 . 7 . | 10 . 10 . 14 . 10 . 17 . 14 . 10 . 14 . | 12 - 14 - 15 - 17 - 19 - - - 24 - . .",
        bass: "1.8.1.8.1.8.1.8.", kick: "x...x...x...x...", clap: "....x.......x...", hat: "..x...x...x...x." },
      B: { chords: [[8, 12, 15], [10, 14, 17], [3, 7, 10], [7, 11, 14]], arp: true,
        lead: "15 - - - 12 - 10 - 15 - - - 17 - - - | 19 - - - 17 - 15 - 14 - - - 10 - - - | 15 - 17 - 19 - 22 - 24 - - - 19 - - - | 19 - - - 23 - - - 26 - - - . . . .",
        bass: "1.8.1.8.1.8.1.8.", kick: "x...x...x...x...x...x...x...x...x...x...x...x...x...x...x.x.xxxx", clap: "....x.......x.......x.......x.......x.......x.......x.......x.xx", hat: "x.x.x.x.x.x.x.x.", open: "..x...x...x...x." }
    }
  };
})(window.Kit = window.Kit || {});
