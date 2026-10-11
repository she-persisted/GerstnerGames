/**
 * @file kit/flow.js
 * @about Runs a game's story as a list of steps (say a line, show a puzzle, fly, and so on). Each step type has a handler. Also holds the cleanup for whatever screen is showing, so leaving a screen always stops its timers and key listeners.
 * @provides Kit.flow.create({ steps, handlers, beforeStep }) -> { go, next, step, token, alive, bump, setCleanup, cleanupNow, replay }
 * @requires nothing
 *
 * A handler returns true when its step is instant (change world, add a friend); the flow then moves straight to the next step.
 * token() and alive(t) let slow actions (countdowns, walks) check they still belong to the current screen.
 * replay(upto, { type: fn }) re-applies instant steps when resuming a saved game.
 */
(function (Kit) {
  "use strict";
  function create({ steps, handlers, beforeStep = () => {} }) {
    let idx = 0, tok = 0, cleanup = null;
    function cleanupNow() { if (cleanup) { const c = cleanup; cleanup = null; c(); } }
    function go(i) {
      tok++; cleanupNow();
      idx = i; beforeStep(i);
      const st = steps[i]; if (!st) return;
      const h = handlers[st.t];
      if (!h) throw new Error("No handler for step type: " + st.t);
      if (h(st, i) === true) go(i + 1);
    }
    return {
      go,
      next: () => go(idx + 1),
      get step() { return idx; },
      token: () => tok,
      alive: t => t === tok,
      bump() { tok++; cleanupNow(); },
      setCleanup(fn) { cleanup = fn; },
      cleanupNow,
      replay(upto, replayers) { for (let i = 0; i < upto; i++) { const st = steps[i], r = replayers[st.t]; if (r) r(st, i); } }
    };
  }
  Kit.flow = { create };
})(window.Kit = window.Kit || {});
