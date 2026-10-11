/**
 * @file kit/adaptive.js
 * @about Adaptive difficulty. Tracks how the player is doing in each skill and moves that skill's level up or down. Levels are remembered on that computer for that game.
 * @provides Kit.adaptive.create({ key, skills, onChange }) -> { level(skill), record(skill, outcome), adjust(skill, delta), snapshot() }
 * @requires kit/util.js
 *
 * skills: { name: { min, max, start } }, for example { math: { min: 1, max: 5, start: 3 } }
 * record(skill, outcome) rules:
 *   "clean"    solved on the first try with no hints. Two in a row: level up.
 *   "ok"       solved after one miss or with a hint. Level stays the same.
 *   "struggle" solved after two or more misses. Two in a row: level down.
 *   "gaveup"   needed "Show me". Level down right away.
 * adjust(skill, +1 or -1) changes a level directly (typing rounds use this).
 * onChange(skill, newLevel, delta) runs whenever a level actually changes.
 */
(function (Kit) {
  "use strict";
  const { store, clamp } = Kit.util;

  function create({ key, skills, onChange = () => {} }) {
    const saved = store.get(key, {}) || {};
    const st = {};
    for (const [name, cfg] of Object.entries(skills)) {
      const lv = saved[name] && Number.isFinite(saved[name].level) ? saved[name].level : cfg.start;
      st[name] = { level: clamp(Math.round(lv), cfg.min, cfg.max), up: 0, down: 0 };
    }
    const persist = () => {
      const out = {};
      for (const [n, s] of Object.entries(st)) out[n] = { level: s.level };
      store.set(key, out);
    };
    function adjust(name, delta) {
      const s = st[name], cfg = skills[name]; if (!s) return 0;
      const before = s.level;
      s.level = clamp(s.level + delta, cfg.min, cfg.max); s.up = 0; s.down = 0; persist();
      const moved = s.level - before;
      if (moved) onChange(name, s.level, moved);
      return moved;
    }
    function record(name, outcome) {
      const s = st[name]; if (!s) return 0;
      if (outcome === "gaveup") return adjust(name, -1);
      if (outcome === "clean") { s.down = 0; if (++s.up >= 2) return adjust(name, 1); }
      else if (outcome === "struggle") { s.up = 0; if (++s.down >= 2) return adjust(name, -1); }
      else { s.up = 0; }
      return 0;
    }
    return {
      level: name => (st[name] ? st[name].level : 1),
      record, adjust,
      snapshot: () => Object.fromEntries(Object.entries(st).map(([n, s]) => [n, s.level]))
    };
  }
  Kit.adaptive = { create };
})(window.Kit = window.Kit || {});
