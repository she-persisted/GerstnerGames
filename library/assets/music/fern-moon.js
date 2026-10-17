/**
 * @file assets/music/fern-moon.js
 * @about "Fern Moon Feast": the second portal: a hoppy, oom-pah dinner dance with the second piece of the weird music. 144 bpm, G major. Song format is described in kit/groove.js.
 * @provides Kit.songs.fern
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  (Kit.songs = Kit.songs || {}).fern = {
    title: "Fern Moon Feast", bpm: 144, root: 55, form: ["A", "B", "A", "B"],
    lead: { wave: "pulse25", vol: 0.045, oct: 12, echo: 0.18, vib: true, gate: 0.55 },
    arp: { wave: "pulse12", vol: 0.012, oct: 12 },
    bass: { wave: "pulse25", vol: 0.042, oct: -12, gate: 0.6 },
    drums: { kick: 0.3, clap: 0.12, hat: 0.02, open: 0.022 },
    sections: {
      A: { chords: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]], arp: false,
        lead: "12 . 11 . 12 . 7 . 4 . 7 . 12 . . . | 12 . 14 . 16 . 12 . 9 . 12 . 16 . . . | 14 . 12 . 11 . 9 . 7 . 9 . 11 . 14 . | 12 - 7 - 12 - . . 7 - 12 - - - . .",
        bass: "1...5...1...5...", kick: "x...x...x...x...", clap: "....x.......x...", hat: "..x...x...x...x." },
      B: { chords: [[0, 4, 7], [9, 12, 16], [5, 9, 12], [7, 11, 14]], arp: true,
        lead: "7 - - - 4 - - - 2 - - - 0 - - - | 4 - 7 - 11 - 7 - 4 - 7 - 11 - 12 - | 9 - 12 - 16 - 12 - 9 - 12 - 16 - 19 - | 19 - 17 - 14 - 11 - 14 - - - 7 - - -",
        bass: "1.5.1.5.1.5.1.5.", kick: "x...x...x...x...", clap: "....x.......x.......x.......x.......x.......x.......x.......x.xx", hat: "x.x.x.x.x.x.x.x.", open: "..x...x...x...x." }
    }
  };
})(window.Kit = window.Kit || {});
