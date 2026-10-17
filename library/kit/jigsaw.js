/**
 * @file kit/jigsaw.js
 * @about Picture jigsaw: a picture is cut into a grid of tiles and shuffled. Swap two tiles to fix it. Works with arrow keys and Enter, or by clicking two tiles. Tiles that are home lock in place with a glow. Helpers can peek at the whole picture or put one tile home. Pieces the player never found can be left out: they stay as glitchy gaps in the finished picture, even when peeking.
 * @provides Kit.jigsaw.render(board, options) -> { peek(), fix(), stop(), placed(), total }
 * @requires kit/util.js, kit/audio.js
 *
 * options = { svg (a standalone <svg> string), rows, cols, label, missing (tile numbers to leave as gaps, counted left to right, top to bottom),
 *             onMove(placed, total), onDone({ moves, best, peeks, fixes, gaps }) }
 * best = the fewest swaps that could have solved it, so a game can score how close the player came.
 */
(function (Kit) {
  "use strict";
  const { shuffle, esc } = Kit.util;

  function render(board, o) {
    const sfx = Kit.audio.sfx, rows = o.rows, cols = o.cols, n = rows * cols;
    const gone = new Set((o.missing || []).filter(i => i >= 0 && i < n));
    // Gaps stay put. Shuffle the rest so that at most one of them starts at home.
    const free = [...Array(n).keys()].filter(i => !gone.has(i));
    let order;
    do {
      const mix = shuffle(free.slice());
      order = [...Array(n).keys()].map(i => gone.has(i) ? i : mix[free.indexOf(i)]);
    } while (free.length > 2 && free.filter(i => order[i] === i).length > 1);
    let moves = 0, peeks = 0, fixes = 0, sel = -1, cur = 0, done = false, peekTimer = 0;
    const seen = new Set(); let cycles = 0;
    for (let i = 0; i < n; i++) { if (seen.has(i)) continue; cycles++; let j = i; while (!seen.has(j)) { seen.add(j); j = order[j]; } }
    const best = n - cycles;
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(o.svg);

    board.innerHTML = `<div class="jig" role="grid" aria-label="${esc(o.label || "Picture puzzle")}" style="--rows:${rows};--cols:${cols};--img:url('${url}')">
      ${order.map((h, i) => `<button type="button" class="jt${gone.has(i) ? " gone" : ""}" role="gridcell" data-pos="${i}" data-home="${h}" aria-label="${gone.has(i) ? "Missing piece" : `Tile ${i + 1}`}"${gone.has(i) ? " disabled" : ""}></button>`).join("")}
      <div class="jpeek" aria-hidden="true"></div>
    </div>`;
    const grid = board.querySelector(".jig"), cells = [...grid.querySelectorAll(".jt")], peekEl = grid.querySelector(".jpeek");

    function paint() {
      cells.forEach((el, i) => {
        const h = order[i], r = Math.floor(h / cols), c = h % cols;
        el.dataset.home = h;
        el.style.backgroundPosition = `${cols > 1 ? c / (cols - 1) * 100 : 0}% ${rows > 1 ? r / (rows - 1) * 100 : 0}%`;
        el.classList.toggle("home", h === i);
        el.classList.toggle("sel", i === sel);
        el.classList.toggle("cur", i === cur && !done);
        el.tabIndex = i === cur ? 0 : -1;
      });
    }
    const placed = () => order.filter((h, i) => h === i).length;
    function swap(a, b) {
      [order[a], order[b]] = [order[b], order[a]];
      moves++;
      const homeNow = (order[a] === a) + (order[b] === b);
      if (homeNow) sfx.right(); else sfx.key();
      [a, b].forEach(i => { const el = cells[i]; el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); });
      paint();
      if (o.onMove) o.onMove(placed(), n);
      if (placed() === n) finish();
    }
    function finish() {
      done = true; sel = -1; paint(); grid.classList.add("solved"); sfx.found();
      cleanup();
      if (o.onDone) o.onDone({ moves, best, peeks, fixes, gaps: gone.size });
    }
    function choose(i) {
      if (done) return;
      cur = i;
      if (gone.has(i)) { paint(); return; } // a missing piece can't be moved
      if (order[i] === i && sel < 0) { paint(); return; } // home tiles stay put
      if (sel < 0) { sel = i; sfx.beep(); }
      else if (sel === i) sel = -1;
      else { const a = sel; sel = -1; swap(a, i); return; }
      paint();
    }
    function move(dr, dc) {
      const r = Math.floor(cur / cols), c = cur % cols;
      cur = Math.max(0, Math.min(rows - 1, r + dr)) * cols + Math.max(0, Math.min(cols - 1, c + dc));
      paint(); cells[cur].focus({ preventScroll: true });
    }
    function onKey(e) {
      if (done) return;
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const k = e.key;
      if (k === "ArrowLeft" || k === "a") { e.preventDefault(); move(0, -1); }
      else if (k === "ArrowRight" || k === "d") { e.preventDefault(); move(0, 1); }
      else if (k === "ArrowUp" || k === "w") { e.preventDefault(); move(-1, 0); }
      else if (k === "ArrowDown" || k === "s") { e.preventDefault(); move(1, 0); }
      else if (k === "Enter" || k === " ") {
        const onTile = document.activeElement && document.activeElement.classList.contains("jt");
        if (!onTile && document.activeElement && document.activeElement.tagName === "BUTTON") return;
        e.preventDefault(); e.stopPropagation(); choose(cur);
      }
    }
    cells.forEach((el, i) => el.addEventListener("click", e => { e.preventDefault(); if (e.detail === 0) return; choose(i); })); // keyboard presses are handled in onKey
    document.addEventListener("keydown", onKey, true);
    const cleanup = () => { document.removeEventListener("keydown", onKey, true); clearTimeout(peekTimer); };
    cur = Math.max(0, free[0] || 0);
    paint();
    setTimeout(() => { if (!done && cells[cur]) cells[cur].focus({ preventScroll: true }); }, 60);
    if (placed() === n) setTimeout(() => { if (!done) finish(); }, 400); // nothing left to swap

    return {
      total: n,
      placed,
      peek() { if (done) return; peeks++; peekEl.classList.add("on"); sfx.hint(); clearTimeout(peekTimer); peekTimer = setTimeout(() => peekEl.classList.remove("on"), 1700); },
      fix() {
        if (done) return false;
        const i = order.findIndex((h, j) => h !== j); if (i < 0) return false;
        const j = order.indexOf(i);
        fixes++; sel = -1; moves--; swap(i, j); return true;
      },
      stop: cleanup
    };
  }
  Kit.jigsaw = { render };
})(window.Kit = window.Kit || {});
