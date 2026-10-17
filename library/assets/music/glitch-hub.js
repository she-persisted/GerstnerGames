/**
 * @file assets/music/glitch-hub.js
 * @about "Glitch Hub Bounce": the bouncy theme for the title screen and the crash pad: a happy, head-bobbing groove with claps and sparkly arpeggios. 128 bpm, F major. Song format is described in kit/groove.js.
 * @provides Kit.songs.glitchHub
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  (Kit.songs = Kit.songs || {}).glitchHub = {
    title: "Glitch Hub Bounce", bpm: 128, root: 53, form: ["A", "B", "A", "B"],
    lead: { wave: "pulse25", vol: 0.045, oct: 12, echo: 0.25, vib: true },
    arp: { wave: "pulse12", vol: 0.014, oct: 12 },
    bass: { wave: "pulse25", vol: 0.042, oct: -12, gate: 0.8 },
    drums: { kick: 0.3, clap: 0.12, hat: 0.02, open: 0.022 },
    sections: {
      A: { chords: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]], arp: true,
        lead: "7 - 9 - 12 - . . 9 - 7 - . . . . | 7 - 11 - 14 - . . 11 - 7 - . . . . | 9 - 12 - 16 - . . 14 - 12 - . . 9 - | 5 - 9 - 12 - 14 - 12 - - - . . . .",
        bass: "1...1.8.1...1.8.", kick: "x...x...x...x...", clap: "....x.......x...", hat: "..x...x...x...x." },
      B: { chords: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]], arp: true,
        lead: "12 - 12 . 14 - 12 - 9 - 7 . 9 - 12 - | 11 - 11 . 12 - 11 - 7 - . . 4 - 7 - | 9 - 9 . 12 - 14 - 16 - 14 . 12 - 9 - | 12 - 14 - 12 - 9 - 7 - - - . . . .",
        bass: "1.8.1.8.1.8.1.8.", kick: "x...x...x...x...", clap: "....x.......x.......x.......x.......x.......x.......x.......x.xx", hat: "x.x.x.x.x.x.x.x.", open: "..x...x...x...x." }
    }
  };
})(window.Kit = window.Kit || {});
