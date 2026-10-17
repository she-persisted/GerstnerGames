/**
 * @file content/levels/runner-chunks.js
 * @about Building blocks for obstacle runs: short stretches of spikes, steps, bounce pads, gaps, ship tunnels, and one secret stretch with a hidden box up high. A run is put together from these, easier ones at low levels and trickier ones at high levels.
 * @provides Kit.levels.runner (list of chunks)
 * @requires nothing
 *
 * Format is described in kit/runner.js. min and max are the run levels (1 to 5) a chunk can appear at, w is how often it is picked.
 * Every chunk starts with at least 2 tiles of flat ground. The hero's hop is tiny (about 1.25 tiles), so two spikes in a row
 * or anything 2 tiles high needs a bounce pad. The level generator plays each chunk with its solver before using it.
 * tag "ship" = a ship tunnel (between a ship portal S and a hero portal C). tag "secret" = holds the hidden box x, reached by
 * hopping onto a thin ledge with a pad on it; running straight under the ledge is the normal way through.
 */
(function (Kit) {
  "use strict";
  const C = [
    { id: "flat", min: 1, len: 5, w: .4, o: [] },
    { id: "spike", min: 1, len: 7, w: 3, o: [["s", 3]] },
    { id: "spike-spike", min: 1, len: 12, w: 2, o: [["s", 3], ["s", 8]] },
    { id: "pad-2", min: 1, max: 2, len: 10, w: 2, o: [["p", 2], ["s", 4], ["s", 5]] },
    { id: "pad-3", min: 2, len: 11, w: 2, o: [["p", 2], ["s", 4], ["s", 5], ["s", 6]] },
    { id: "step", min: 1, len: 10, w: 2, o: [["b", 3, 0, 3, 1]] },
    { id: "pad-ledge", min: 1, len: 12, w: 2, o: [["p", 2], ["b", 4.5, 0, 4, 2]] },
    { id: "hop-gap", min: 1, len: 8, w: 1.5, gaps: [[4, 5]], o: [] },
    { id: "pad-gap", min: 1, len: 12, w: 1.5, gaps: [[4, 7]], o: [["p", 2]] },
    { id: "stairs", min: 2, len: 13, w: 1.5, o: [["b", 3, 0, 2, 1], ["b", 5, 0, 3, 2]] },
    { id: "step-spike", min: 2, len: 12, w: 1.5, o: [["b", 3, 0, 6, 1], ["s", 6, 1]] },
    { id: "pad-4", min: 3, len: 12, w: 1.5, o: [["p", 2], ["s", 4], ["s", 5], ["s", 6], ["s", 7]] },
    { id: "spike-pit", min: 2, len: 11, w: 1.2, o: [["b", 3, 0, 2, 1], ["s", 5], ["b", 6, 0, 2, 1]] },
    { id: "spike-2", min: 3, len: 8, w: 1.5, o: [["s", 3], ["s", 4]] },
    { id: "pad-ledge-spike", min: 3, max: 4, len: 14, w: 1.2, o: [["p", 2], ["b", 4.5, 0, 6, 2], ["s", 7.5, 2]] },
    { id: "gap-2", min: 3, len: 9, w: 1, gaps: [[4, 6]], o: [] },
    { id: "pad-pad", min: 3, len: 17, w: 1, gaps: [[4, 7], [10, 13]], o: [["p", 2], ["p", 7.5]] },
    { id: "spike-run", min: 4, len: 14, w: 1.2, o: [["s", 3], ["s", 6.5], ["s", 10]] },
    { id: "tower", min: 4, len: 15, w: 1, o: [["p", 2], ["b", 4.5, 0, 3, 2], ["s", 6, 2], ["b", 7.5, 0, 3, 1]] },

    // Ship tunnels: S turns the hero into a little ship (hold to fly up), C turns him back. The roof keeps the ship on screen.
    { id: "ship-easy", tag: "ship", min: 1, max: 2, len: 24, o: [["S", 2], ["b", 2, 6.5, 20, 2], ["b", 8, 0, 2, 2], ["b", 14, 4, 2, 2.5], ["C", 21]] },
    { id: "ship-wave", tag: "ship", min: 2, max: 4, len: 26, o: [["S", 2], ["b", 2, 6.5, 22, 2], ["s", 4], ["s", 5], ["s", 6], ["b", 8, 0, 2, 2.5], ["b", 13, 3.6, 2, 2.9], ["b", 18, 0, 2, 2.5], ["s", 21], ["s", 22], ["C", 23]] },
    { id: "ship-zig", tag: "ship", min: 3, len: 28, o: [["S", 2], ["b", 2, 6.5, 24, 2], ["b", 7, 0, 2, 2.4], ["b", 11, 3.7, 2, 2.8], ["b", 15, 0, 2, 2.4], ["b", 19, 3.7, 2, 2.8], ["s", 23], ["s", 24], ["C", 25]] },

    // The secret: hop up onto the thin ledge, the pad launches you to the hidden box. Or just run underneath.
    { id: "secret", tag: "secret", min: 1, len: 16, o: [["b", 3, .82, 2, .25], ["p", 3.6, 1.07], ["b", 6, 3.4, 5, .4], ["x", 8.5, 4.4]] }
  ];
  (Kit.levels = Kit.levels || {}).runner = C;
})(window.Kit = window.Kit || {});
