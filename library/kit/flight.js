/**
 * @file kit/flight.js
 * @about The speed-typing round: words fall like shooting stars and must be typed before they reach the bottom. Missed words are not retyped. Also the 3, 2, 1, Liftoff countdown and the accuracy goal bar.
 * @provides Kit.flight { run(options) -> stop, countdown(options) -> Promise<boolean>, goalBar(pct, id, goal), starRow(n, results) }
 * @requires kit/util.js, kit/ui.js, kit/audio.js
 *
 * run options:
 *   arena      element the words fall through (position: absolute; inset: 0)
 *   panel      element for the typing display
 *   head       HTML shown at the top of the panel
 *   words      list of words or short phrases, in order
 *   timing     { base, per, slow }: seconds to fall = (base + per * letters) * slow
 *   maxFalling how many words can be on screen at once (default 2)
 *   alive()    returns false once the player has left this screen
 *   onCatch()  called when a word is finished (for effects)
 *   onEnd(result) result = { hits, misses, caught, n, typeMs, typeChars, acc, res }
 */
(function (Kit) {
  "use strict";
  const { $, esc, wait } = Kit.util;

  const goalBar = (pct, id = "", goal = 85) =>
    `<div class="goal" aria-label="${pct}% of ${goal}% needed"><div class="goal-bar"><span class="goal-fill ${pct < goal ? "low" : ""}" ${id ? `id="${id}"` : ""} style="width:${pct}%"></span><span class="goal-mark" style="left:${goal}%"></span><span class="goal-flag" style="left:${goal}%">${goal}%</span></div></div>`;
  const starRow = (n, res = []) => `<div class="starrow" aria-hidden="true">${Array.from({ length: n }, (x, i) => `<i class="st ${res[i] || ""}"></i>`).join("")}</div>`;

  // Shows 3, 2, 1, then the go text. Resolves false if the player left the screen part way.
  async function countdown({ el, alive = () => true, onStart, onStop, onGo, goText = "Liftoff!" }) {
    const sfx = Kit.audio.sfx, ms = Kit.ui.reduced ? 300 : 750;
    if (onStart) onStart();
    for (const n of ["3", "2", "1"]) {
      if (!alive()) { if (onStop) onStop(); return false; }
      el.innerHTML = `<span>${n}</span>`; sfx.beep(); await wait(ms);
    }
    if (onStop) onStop();
    if (!alive()) return false;
    el.innerHTML = `<span class="go">${esc(goText)}</span>`; sfx.liftoff();
    if (onGo) onGo();
    await wait(Kit.ui.reduced ? 300 : 850);
    if (!alive()) return false;
    el.innerHTML = "";
    return true;
  }

  function run(o) {
    const sfx = Kit.audio.sfx, arena = o.arena, words = o.words, tm = o.timing, maxFalling = o.maxFalling || 2;
    const alive = o.alive || (() => true);
    const items = [], res = [];
    let spawned = 0, hits = 0, misses = 0, caught = 0, typeMs = 0, typeChars = 0, lastResolve = -1e9, lastNow = 0, raf = 0, ended = false;

    o.panel.innerHTML = `<div class="card fly">${o.head || ""}<p class="bigword" id="bigword"></p>${goalBar(100, "accFill")}<div id="starRow">${starRow(words.length)}</div></div>`;
    const big = $("#bigword", o.panel), accFill = $("#accFill", o.panel), stars = [...o.panel.querySelectorAll("#starRow .st")];
    const accuracy = () => (hits + misses ? hits / (hits + misses) : 1);
    const target = () => items.find(i => i.state === "falling") || null;
    const letters = (w, typed) => [...w].map((c, i) => `<span class="${i < typed ? "ok" : i === typed ? "cur" : "todo"}">${c === " " ? " " : esc(c)}</span>`).join("");

    function paintChip(it) { it.el.innerHTML = `<span class="fw-star"></span><span class="fw-text">${letters(it.word, it === target() ? it.typed : -1)}</span>`; }
    function paintHud() {
      const t = target();
      big.innerHTML = t ? letters(t.word, t.typed) : `<span class="wait"><i></i><i></i><i></i></span>`;
      const a = Math.round(accuracy() * 100);
      accFill.style.width = a + "%"; accFill.classList.toggle("low", a < 85);
    }
    function refreshTargets() {
      const t = target();
      items.forEach(i => { if (i.state === "falling") i.el.classList.toggle("target", i === t); });
      if (t) paintChip(t);
      paintHud();
    }
    function position(it, now) {
      const p = Math.min(1, (now - it.born) / it.dur);
      const y = -it.h + p * (arena.clientHeight - it.h * .2);
      it.el.style.transform = `translate(${it.x}px, ${y}px)`; it.p = p;
    }
    function spawn(now) {
      const w = words[spawned++];
      const el = document.createElement("div"); el.className = "fw";
      const it = { idx: spawned - 1, word: w, el, x: 0, h: 0, p: 0, born: now, dur: (tm.base + tm.per * w.length) * 1000 * (tm.slow || 1), typed: 0, state: "falling", first: 0 };
      items.push(it); arena.appendChild(el); paintChip(it);
      const aw = arena.clientWidth, cw = el.offsetWidth, room = Math.max(0, aw - cw - 16);
      const prev = items.length > 1 ? items[items.length - 2].x : -9999;
      let x = 8 + Math.random() * room;
      if (Math.abs(x - prev) < cw && room > cw * 2) x = 8 + ((x - 8 + room / 2) % room);
      it.x = x; it.h = el.offsetHeight;
      position(it, now); refreshTargets();
    }
    function resolve(it, how, now) {
      it.state = how; lastResolve = now; res[it.idx] = how;
      if (stars[it.idx]) stars[it.idx].classList.add(how);
      if (how === "caught") {
        caught++;
        if (it.first) { typeMs += now - it.first; typeChars += it.word.length; }
        it.el.classList.add("caught");
        it.el.style.transform = `translate(${arena.clientWidth / 2 - it.el.offsetWidth / 2}px, ${arena.clientHeight * .6}px) scale(.2)`;
        sfx.word(); if (o.onCatch) o.onCatch();
      } else { misses += it.word.length - it.typed; it.el.classList.add("lost"); sfx.lost(); }
      const el = it.el; setTimeout(() => el.remove(), 650);
      refreshTargets();
    }
    function frame(now) {
      if (ended || !alive()) return;
      const gap = now - lastNow; lastNow = now;
      if (gap > 250) items.forEach(i => { if (i.state === "falling") i.born += gap - 16; }); // tab was hidden: don't punish
      const falling = items.filter(i => i.state === "falling");
      if (spawned < words.length) {
        const last = items[items.length - 1];
        const ready = falling.length === 0 ? now - lastResolve > 380 : (falling.length < maxFalling && last && (now - last.born) / last.dur >= .5);
        if (ready) spawn(now);
      }
      items.forEach(i => { if (i.state === "falling") { position(i, now); if (i.p >= 1) resolve(i, "lost", now); } });
      if (spawned >= words.length && !items.some(i => i.state === "falling")) return finish();
      raf = requestAnimationFrame(frame);
    }
    function onKey(e) {
      if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault(); e.stopPropagation();
      const t = target(); if (!t) return;
      if (e.key.toLowerCase() === t.word[t.typed].toLowerCase()) {
        if (!t.first) t.first = performance.now();
        t.typed++; hits++; sfx.key();
        if (t.typed >= t.word.length) resolve(t, "caught", performance.now()); else paintChip(t);
      } else { misses++; sfx.miss(); t.el.classList.remove("shake"); void t.el.offsetWidth; t.el.classList.add("shake"); }
      paintHud();
    }
    function stopLeg() { ended = true; cancelAnimationFrame(raf); document.removeEventListener("keydown", onKey, true); }
    function finish() {
      stopLeg();
      setTimeout(() => { if (alive()) arena.innerHTML = ""; }, 700);
      o.onEnd({ hits, misses, caught, n: words.length, typeMs, typeChars, acc: accuracy(), res });
    }
    document.addEventListener("keydown", onKey, true);
    paintHud();
    raf = requestAnimationFrame(t => { lastNow = t; frame(t); });
    return () => { stopLeg(); arena.innerHTML = ""; };
  }

  Kit.flight = { run, countdown, goalBar, starRow };
})(window.Kit = window.Kit || {});
