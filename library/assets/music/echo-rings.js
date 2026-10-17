/**
 * @file assets/music/echo-rings.js
 * @about "Echo Rings": the first portal: bright and bouncy with a big echo on the lead, and its chorus hides the first piece of the weird music. 140 bpm, A major. Song format is described in kit/groove.js.
 * @provides Kit.songs.echo
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  (Kit.songs = Kit.songs || {}).echo = {
    title: "Echo Rings", bpm: 140, root: 57, form: ["A", "B", "A", "B"],
    lead: { wave: "pulse25", vol: 0.045, oct: 12, echo: 0.42, vib: true },
    arp: { wave: "pulse12", vol: 0.014, oct: 12 },
    bass: { wave: "pulse25", vol: 0.042, oct: -12, gate: 0.8 },
    drums: { kick: 0.3, clap: 0.12, hat: 0.02, open: 0.022 },
    sections: {
      A: { chords: [[0, 4, 7], [5, 9, 12], [9, 12, 16], [7, 11, 14]], arp: true,
        lead: "0 - 4 - 7 - 4 - 12 - . 11 12 - 7 - | 5 - 9 - 12 - 9 - 14 - . 12 14 - 9 - | 9 - 12 - 16 - 12 - 21 - . 19 16 - 12 - | 11 - 14 - 19 - 14 - 11 - 7 - 4 - 7 -",
        bass: "1...8...1...8.8.", kick: "x...x...x...x...", clap: "....x.......x...", hat: "..x...x...x...x." },
      B: { chords: [[0, 4, 7], [5, 9, 12], [9, 12, 16], [7, 11, 14]], arp: true,
        lead: "7 - - - 4 - - - 5 - 7 - 9 - - - | 12 - - - 9 - - - 7 - 9 - 12 - - - | 7 - - - 4 - - - 5 - 7 - 9 - 12 - | 11 - 12 - 14 - - - 11 - - - 7 - - -",
        bass: "1.8.1.8.1.8.1.8.", kick: "x...x...x...x...", clap: "....x.......x.......x.......x.......x.......x.......x.......x.xx", hat: "x.x.x.x.x.x.x.x.", open: "..x...x...x...x." }
    }
  };
})(window.Kit = window.Kit || {});
