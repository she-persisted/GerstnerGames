/**
 * @file kit/questions.js
 * @about The question system: banks of written questions, generators that make new ones on the fly, a picker that matches the player's level and avoids repeats across games, and the answer checker.
 * @provides Kit.questions { addBank, banks, gens, KIND, createPicker, judge, scrambled }
 * @requires kit/util.js
 *
 * Question shape: { id, kind, q, a: [accepted answers; the first is the one shown], clue, clue2?, d (difficulty 1 easy, 2 medium, 3 hard), seq?, tiles?, eq?, len? }
 * Banks live in content/questions/*.js and register with addBank(name, kind, idPrefix, rows), rows = [id, d, question, answers, clue, clue2?].
 * Generators live in content/questions/*.js too: Kit.questions.gens.name = level => question.
 */
(function (Kit) {
  "use strict";
  const { shuffle, squash, lev, store } = Kit.util;
  const Q = Kit.questions = Kit.questions || {};
  Q.banks = Q.banks || {};
  Q.gens = Q.gens || {};
  Q.KIND = { riddle: "Riddle", blank: "Fill in the blank", scramble: "Frozen word", earth: "Earth question", pattern: "Number pattern", space: "Space riddle", math: "Math", odd: "Odd one out", order: "Planet order" };

  Q.addBank = (name, kind, prefix, rows) => {
    Q.banks[name] = rows.map(([id, d, q, a, clue, clue2]) => ({ id: prefix + id, kind, d, q, a, clue, clue2 }));
  };

  // A picker lives for one playthrough. It never repeats an answer within the game, and it remembers
  // (on this computer) which written questions were asked recently so the next game prefers new ones.
  Q.createPicker = ({ seenKey, keep = 300 }) => {
    let seen = store.get(seenKey, []);
    if (!Array.isArray(seen)) seen = [];
    const used = new Set();
    const key = p => squash(p.a[0]).replace(/s$/, "");
    const markSeen = id => {
      if (id.startsWith("g-")) return;
      seen = seen.filter(x => x !== id); seen.push(id);
      if (seen.length > keep) seen = seen.slice(-keep);
      store.set(seenKey, seen);
    };
    const take = p => { used.add(key(p)); markSeen(p.id); return p; };

    // Best match: exact difficulty and never seen. Score = 3 per step away from the level, plus 4 if seen before (older sightings cost less).
    function bank(name, level, filter) {
      const pool = (Q.banks[name] || []).filter(p => (!filter || filter(p)) && !used.has(key(p)));
      if (!pool.length) return null;
      const idx = new Map(seen.map((id, i) => [id, i]));
      let best = null, bestScore = Infinity;
      for (const p of shuffle(pool.slice())) {
        const si = idx.has(p.id) ? idx.get(p.id) : -1;
        const s = 3 * Math.abs((p.d || 2) - level) + (si >= 0 ? 4 + si / Math.max(1, seen.length) : 0);
        if (s < bestScore) { best = p; bestScore = s; }
      }
      return take(best);
    }
    function gen(name, level) {
      const g = Q.gens[name];
      for (let i = 0; i < 30; i++) { const p = g(level); if (!used.has(key(p))) return take(p); }
      return take(g(level));
    }
    // Mark a question from a saved game as used, so resuming never repeats it.
    function reserve(p) { if (p && p.a) used.add(key(p)); }
    return { bank, gen, reserve };
  };

  // Checks an answer. Forgives plurals, a leading "the", and one spelling slip on longer words (not for math or scrambles).
  Q.judge = (p, raw, shown) => {
    const nz = squash(raw);
    if (!nz) return { ok: false, empty: true };
    for (const ans of p.a) {
      const bz = squash(ans);
      if (nz === bz || nz === bz + "s" || nz + "s" === bz || nz === bz + "es") return { ok: true };
    }
    if (shown) return { ok: false };
    if (!["scramble", "pattern", "math"].includes(p.kind)) {
      for (const ans of p.a) {
        const bz = squash(ans);
        if (bz.length >= 5 && /^[a-z]+$/.test(bz)) { const d = lev(nz, bz); if (d <= 1 || (bz.length >= 8 && d <= 2)) return { ok: true, spell: ans }; }
      }
    }
    if (p.kind === "scramble") { const srt = x => [...x].sort().join(""); if (srt(nz) === srt(squash(p.a[0]))) return { ok: false, anagram: true }; }
    return { ok: false };
  };

  // Jumbles a word so it never starts with its real first two letters.
  Q.scrambled = w => {
    let s = w, n = 0;
    while ((s === w || s.slice(0, 2) === w.slice(0, 2)) && n < 40) { s = shuffle([...w]).join(""); n++; }
    return s;
  };
})(window.Kit = window.Kit || {});
