/**
 * @file kit/typing-challenges.js
 * @about Two untimed typing challenges. dig: type the words written on clumps of dirt to dig something up. line: type one sentence exactly (like a brave promise).
 * @provides Kit.typing { dig(panel, options) -> stop, line(panel, options) -> stop }
 * @requires kit/util.js, kit/ui.js, kit/audio.js
 *
 * dig options:  { head, words, shovelHtml, backHtml, onBack, onWord(i), onDone(stats) }
 * line options: { text, onDone(stats, doneEl) }    doneEl is an empty .actions element for the Next button
 * stats = { hits, misses, ms, chars }
 */
(function (Kit) {
  "use strict";
  const { $, esc } = Kit.util;

  function dig(panel, o) {
    const sfx = Kit.audio.sfx, words = o.words;
    let wi = 0, typed = 0, hits = 0, misses = 0, first = 0, done = false;
    panel.innerHTML = `<div class="card">
      ${o.head || ""}
      <div class="digrow">${o.shovelHtml || ""}<div class="clods">${words.map((w, i) => `<div class="clod" data-i="${i}"></div>`).join("")}</div></div>
      <div class="actions start"><button class="btn ghost icon" type="button" id="leaveBtn" aria-label="Walk away">${o.backHtml || "Back"}</button></div>
    </div>`;
    const clods = [...panel.querySelectorAll(".clod")];
    function paint() {
      clods.forEach((el, i) => {
        if (i < wi) return;
        el.classList.toggle("cur", i === wi);
        el.innerHTML = [...words[i]].map((ch, j) => `<span class="${i === wi && j < typed ? "ok" : i === wi && j === typed ? "cur" : "todo"}">${esc(ch)}</span>`).join("");
      });
    }
    function onKey(e) {
      if (done || e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault(); e.stopPropagation();
      if (!first) first = performance.now();
      const w = words[wi];
      if (e.key.toLowerCase() === w[typed]) {
        hits++; typed++; sfx.key();
        if (typed >= w.length) {
          sfx.dig(); if (o.onWord) o.onWord(wi);
          const el = clods[wi]; el.classList.remove("cur"); el.classList.add("gone");
          wi++; typed = 0;
          if (wi >= words.length) return finish();
        }
      } else { misses++; sfx.miss(); const el = clods[wi]; el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
      paint();
    }
    const stop = () => document.removeEventListener("keydown", onKey, true);
    function finish() { done = true; stop(); o.onDone({ hits, misses, ms: performance.now() - first, chars: words.join("").length }); }
    $("#leaveBtn", panel).addEventListener("click", () => { stop(); if (o.onBack) o.onBack(); });
    Kit.ui.blurActive();
    document.addEventListener("keydown", onKey, true);
    paint();
    return stop;
  }

  function line(panel, o) {
    const sfx = Kit.audio.sfx, text = o.text;
    let typed = 0, hits = 0, misses = 0, first = 0, done = false;
    panel.innerHTML = `<div class="card fly"><p class="target" id="lineText"></p><div class="actions" id="lineDone"></div></div>`;
    const paint = () => { $("#lineText", panel).innerHTML = [...text].map((c, i) => `<span class="${i < typed ? "ok" : i === typed ? "cur" : "todo"}">${c === " " ? " " : esc(c)}</span>`).join(""); };
    function onKey(e) {
      if (done || e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault();
      if (!first) first = performance.now();
      if (e.key.toLowerCase() === text[typed].toLowerCase()) { typed++; hits++; sfx.key(); if (typed >= text.length) finish(); }
      else { misses++; sfx.miss(); }
      paint();
    }
    const stop = () => document.removeEventListener("keydown", onKey, true);
    function finish() { done = true; stop(); sfx.word(); o.onDone({ hits, misses, ms: performance.now() - first, chars: text.length }, $("#lineDone", panel)); }
    Kit.ui.blurActive();
    document.addEventListener("keydown", onKey, true);
    paint();
    return stop;
  }

  Kit.typing = { dig, line };
})(window.Kit = window.Kit || {});
