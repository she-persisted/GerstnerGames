/**
 * @file assets/music/wave-rider.js
 * @about "Wave Rider": the bonus level's song, a bouncy surf-rock chiptune with a twangy echo lead that swoops up and down like the hills. 152 bpm, A major. Song format is described in kit/groove.js.
 * @provides Kit.songs.waveRider
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  (Kit.songs = Kit.songs || {}).waveRider = {
    title: "Wave Rider", bpm: 152, root: 57, form: ["A", "A", "B", "A", "B"],
    lead: { wave: "pulse25", vol: 0.042, oct: 0, echo: 0.3, vib: true },
    arp: { wave: "pulse12", vol: 0.015, oct: 12 },
    bass: { wave: "pulse25", vol: 0.042, oct: -12, gate: 0.75 },
    drums: { kick: 0.3, clap: 0.11, hat: 0.02, open: 0.022 },
    sections: {
      A: { chords: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [5, 9, 12]], arp: true,
        lead: "12 . 14 . 16 - 19 . 16 . 14 . 12 - 9 . | 14 . 17 . 21 - 17 . 14 . 12 . 14 - - . | 16 . 19 . 23 - 19 . 16 . 14 . 11 - 14 . | 12 . 14 . 16 . 17 . 19 - - - 16 - - -",
        bass: "1.1.8.1.1.1.8.5.", kick: "x...x...x...x...", clap: "....x.......x...", hat: "x.x.x.x.x.x.x.x.", open: "..x...x...x...x." },
      B: { chords: [[9, 12, 16], [5, 9, 12], [0, 4, 7], [7, 11, 14]], arp: true,
        lead: "21 - - . 19 . 21 . 24 - 21 . 19 . 16 . | 17 - - . 16 . 17 . 21 - 17 . 16 . 14 . | 16 . 19 . 24 . 19 . 16 . 19 . 24 - - . | 23 - 21 - 19 - 16 - 14 - 11 - 12 - 14 -",
        bass: "1.1.8.1.1.1.8.5.", kick: "x...x...x...x...x...x...x...x...x...x...x...x...x...x...x.x.xxxx", clap: "....x.......x.......x.......x.......x.......x.......x.......x.xx", hat: "x.x.x.x.x.x.x.x.", open: "..x...x...x...x." }
    }
  };
})(window.Kit = window.Kit || {});
