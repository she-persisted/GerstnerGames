/**
 * @file kit/scoreboard.js
 * @about Arcade-style high score board. Uses the page's shared database when it's available and falls back to scores saved on this computer. Draws into every element marked data-scoreboard.
 * @provides Kit.scoreboard.create({ storeKey, collection, size }) -> { init(), render(), save(entry) -> rank, all() }
 * @requires kit/util.js
 *
 * The published page must declare capabilities: { db: {} } for the shared board.
 * Entry shape: { name, score, at (ISO date), ...any extra fields }
 */
(function (Kit) {
  "use strict";
  const { esc, store } = Kit.util;

  const cleanRow = (id, d) => {
    if (!d || typeof d !== "object") return null;
    const name = String(d.name || "").replace(/[^A-Za-z0-9 ]/g, "").trim().slice(0, 10) || "???";
    const score = Math.max(0, Math.min(999999, Math.round(Number(d.score) || 0)));
    return { id: String(id), name, score, at: String(d.at || "") };
  };

  function create({ storeKey, collection = "scores", size = 10 }) {
    let db = null, remote = [], mine = null, state = "loading";
    let local = (store.get(storeKey, []) || []).map(r => cleanRow(r.id, r)).filter(Boolean);

    function all() {
      const seen = new Set();
      return [...remote, ...local].filter(r => r && !seen.has(r.id) && seen.add(r.id))
        .sort((a, b) => b.score - a.score || a.at.localeCompare(b.at));
    }
    function html() {
      const rows = all().slice(0, size);
      let lis = "";
      for (let i = 0; i < size; i++) {
        const r = rows[i];
        lis += r ? `<li class="${i === 0 ? "first" : ""} ${r.id === mine ? "me" : ""}"><span class="rk">${i + 1}.</span><span class="nm">${esc(r.name)}</span><span class="sc">${r.score}</span></li>`
          : `<li class="empty"><span class="rk">${i + 1}.</span><span class="nm">----------</span><span class="sc">-----</span></li>`;
      }
      const note = state === "shared" ? "Everyone's scores" : state === "local" ? "Scores on this computer" : "";
      return `<h3>High Scores</h3><ol>${lis}</ol>${note ? `<p class="note">${note}</p>` : ""}`;
    }
    function render() { document.querySelectorAll("[data-scoreboard]").forEach(el => { el.innerHTML = html(); }); }

    async function init() {
      render();
      let d = null;
      try { d = window.claude && typeof window.claude.use === "function" ? await window.claude.use("db") : null; } catch (e) { d = null; }
      if (!d) { state = "local"; render(); return; }
      db = d;
      try {
        db.collection(collection).orderBy("score", "desc").limit(size).onSnapshot(snap => {
          remote = snap.docs.map(x => cleanRow(x.id, x.data())).filter(Boolean);
          state = "shared"; render();
        }, () => { db = null; state = "local"; render(); });
      } catch (e) { db = null; state = "local"; render(); }
    }

    // Saves one score and returns its rank (1 = top).
    async function save(entry) {
      if (db) {
        try {
          const ref = await db.collection(collection).add(entry);
          mine = ref.id;
          remote = [...remote.filter(r => r.id !== ref.id), cleanRow(ref.id, entry)];
          render();
          return all().findIndex(r => r.id === mine) + 1;
        } catch (e) { /* not allowed to write here: keep it on this computer */ }
      }
      const row = cleanRow("local-" + Date.now(), entry);
      local.push(row); local.sort((a, b) => b.score - a.score); local = local.slice(0, 25);
      store.set(storeKey, local); mine = row.id;
      if (state !== "shared") state = "local";
      render();
      return all().findIndex(r => r.id === mine) + 1;
    }

    return { init, render, save, all };
  }
  Kit.scoreboard = { create };
})(window.Kit = window.Kit || {});
