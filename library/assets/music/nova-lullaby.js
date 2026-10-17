/**
 * @file assets/music/nova-lullaby.js
 * @about "Nova's Lullaby": the weird music itself: a high, squeaky music-box lullaby, with a soft tick-tock beat and twinkles. 112 bpm, C major. Song format is described in kit/groove.js.
 * @provides Kit.songs.lullaby
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  (Kit.songs = Kit.songs || {}).lullaby = {
    title: "Nova's Lullaby", bpm: 112, root: 72, form: ["A", "B"],
    lead: { wave: "triangle", vol: 0.08, oct: 0, echo: 0.3, gate: 1.4 },
    arp: { wave: "sine", vol: 0.02, oct: 12 },
    bass: { wave: "triangle", vol: 0.03, oct: -24, gate: 1.2 },
    drums: { kick: 0.1, hat: 0.012 },
    sections: {
      A: { chords: [[0, 4, 7], [0, 4, 7], [-3, 0, 4], [-5, -1, 2]], arp: false,
        lead: "7 - - - 4 - - - 5 - 7 - 9 - - - | 7 - - - 4 - - - 2 - - - 0 - - - | 4 - 5 - 7 - - - 12 - - - 11 - 9 - | 7 - - - - - - - . . . . . . . .",
        bass: "1.......5.......", kick: "x.......x.......", hat: "x...x...x...x..." },
      B: { chords: [[0, 4, 7], [0, 4, 7], [-3, 0, 4], [-5, -1, 2]], arp: true,
        lead: "7 - - - 4 - - - 5 - 7 - 9 - - - | 7 - - - 4 - - - 2 - - - 0 - - - | 4 - 5 - 7 - - - 12 - - - 11 - 9 - | 7 - - - 4 - - - 0 - - - - - - -",
        bass: "1.......5.......", kick: "x.......x.......", hat: "x...x...x...x..." }
    }
  };
})(window.Kit = window.Kit || {});
