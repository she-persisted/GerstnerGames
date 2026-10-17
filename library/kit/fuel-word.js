/**
 * @file kit/fuel-word.js
 * @about A friendly letter-guessing game (no hangman): a secret word, a riddle-style hint, and a fuel tank. Type or tap letters to guess. Right letters light up in the word; each wrong letter drains one fuel cell. If the fuel runs out, the word is shown and the player types it to refuel and keep going, so nobody gets stuck.
 * @provides Kit.fuelWord.render(panel, options) -> { use(key) }
 * @requires kit/util.js, kit/ui.js, kit/audio.js
 *
 * options = { head (HTML), tip (one short line), word, hint, fuel (number of cells), cheers, autoNext (ms, default 1700),
 *             scanAfter (wrong letters before the Scan helper pulses, default 2), helperHtml (icon for the Scan button),
 *             onGuess(letter, ok), onScan(), onOut(), onWin({ misses, scans, out, fuelLeft, cheer }), onDone() }
 * use("scan") presses the Scan helper from outside the panel (for example, tapping the hero); it reveals one letter, once.
 */
(function (Kit) {
  "use strict";
  const { $, esc, pick } = Kit.util;
  const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  function render(panel, o) {
    const sfx = Kit.audio.sfx, word = o.word.toUpperCase(), cells = o.fuel || 6;
    let fuel = cells, misses = 0, scans = 0, out = false, done = false;
    const guessed = new Set(), revealed = new Set();
    panel.innerHTML = `<div class="card fuelword">
      ${o.head || ""}
      ${o.tip ? `<p class="digtip">${esc(o.tip)}</p>` : ""}
      <p class="fw-hint"><b>Hint:</b> ${esc(o.hint)}</p>
      <p class="fw-word" id="fwWord" aria-live="polite"></p>
      <div class="fw-tank" role="meter" aria-label="Fuel" aria-valuemin="0" aria-valuemax="${cells}" id="fwTank">${Array.from({ length: cells }, () => `<i class="cell on"></i>`).join("")}<span class="fw-lbl">FUEL</span></div>
      <div class="fw-keys" id="fwKeys">${[...ABC].map(c => `<button type="button" class="fw-key" data-k="${c}">${c}</button>`).join("")}</div>
      <div class="helpers"><button type="button" class="help" data-help="scan" style="--who:var(--c-hero,#5ee35b)">${o.helperHtml || ""}<span>Scan</span></button></div>
      <div id="fwOut"></div>
      <p class="feedback" id="fb" aria-live="assertive"></p>
    </div>`;
    const wordEl = $("#fwWord", panel), tank = $("#fwTank", panel), fb = $("#fb", panel), scanBtn = $('[data-help="scan"]', panel);
    const say = (html, cls = "") => { fb.className = "feedback " + cls; fb.innerHTML = html; };
    function paintWord() {
      wordEl.innerHTML = [...word].map(c => c === " " ? `<span class="sp"></span>` : `<span class="ch ${revealed.has(c) ? "on" : ""}">${revealed.has(c) || out ? c : ""}</span>`).join("");
      wordEl.setAttribute("aria-label", [...word].map(c => revealed.has(c) ? c : "blank").join(" "));
    }
    function paintTank() {
      [...tank.querySelectorAll(".cell")].forEach((el, i) => el.classList.toggle("on", i < fuel));
      tank.setAttribute("aria-valuenow", fuel); tank.classList.toggle("low", fuel <= 2);
    }
    function paintKey(c, ok) { const b = panel.querySelector(`[data-k="${c}"]`); if (b) { b.disabled = true; b.classList.add(ok ? "ok" : "no"); } }
    const solved = () => [...word].every(c => c === " " || revealed.has(c));

    function guess(c) {
      if (done || out || guessed.has(c)) return;
      guessed.add(c);
      const ok = word.includes(c);
      paintKey(c, ok);
      if (ok) { revealed.add(c); sfx.word(); say(""); }
      else {
        misses++; fuel--; sfx.wrong(); tank.classList.remove("zap"); void tank.offsetWidth; tank.classList.add("zap");
        say(pick(["Glitch zap! No " + c + ".", "Nope, no " + c + ".", "Bzzt! Not " + c + "."]), "oops");
        if (misses >= (o.scanAfter || 2) && !scans) { scanBtn.classList.remove("nudge"); void scanBtn.offsetWidth; scanBtn.classList.add("nudge"); }
      }
      paintTank(); paintWord();
      if (o.onGuess) o.onGuess(c, ok);
      if (solved()) return win();
      if (fuel <= 0) runOut();
    }
    function scan() {
      if (done || out || scans) return false;
      const left = [...new Set([...word].filter(c => c !== " " && !revealed.has(c)))];
      if (!left.length) return false;
      scans++; scanBtn.disabled = true; scanBtn.classList.remove("nudge");
      const c = pick(left); guessed.add(c); revealed.add(c); paintKey(c, true); sfx.hint();
      say(`Scan found a <b>${c}</b>!`, "good"); paintWord();
      if (o.onScan) o.onScan();
      if (solved()) win();
      return true;
    }
    function runOut() {
      out = true; paintWord(); sfx.lost();
      panel.querySelectorAll(".fw-key").forEach(b => { b.disabled = true; });
      scanBtn.disabled = true;
      say("Out of fuel! The glitch spilled the word.", "oops");
      $("#fwOut", panel).innerHTML = `<form class="answer" id="fwForm" autocomplete="off">
          <label class="sr" for="fwAns">Type the word to refuel</label>
          <input id="fwAns" class="field" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Type ${esc(word)} to refuel">
          <button class="btn check" type="submit">${o.checkHtml || "OK"}<span class="sr">Refuel</span></button></form>`;
      const inp = $("#fwAns", panel);
      $("#fwForm", panel).addEventListener("submit", e => {
        e.preventDefault();
        if (inp.value.trim().toUpperCase().replace(/\s+/g, " ") === word) { [...word].forEach(c => revealed.add(c)); fuel = cells; paintTank(); win(); }
        else { sfx.miss(); inp.select(); }
      });
      if (o.onOut) o.onOut();
      Kit.ui.focusSoon(inp);
    }
    function win() {
      if (done) return;
      done = true; cleanup(); paintWord(); wordEl.classList.add("won");
      panel.querySelectorAll(".fw-key,.help").forEach(b => { b.disabled = true; });
      const cheer = pick(o.cheers || ["Yes!", "Nailed it!", "Word power!"]);
      say(esc(cheer), "good cheer"); sfx.right();
      if (o.onWin) o.onWin({ misses, scans, out, fuelLeft: out ? 0 : fuel, cheer });
      setTimeout(() => { if (o.onDone) o.onDone(); }, o.autoNext || 1700);
    }
    function onKey(e) {
      if (done || out || e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (/^[a-z]$/i.test(e.key)) { e.preventDefault(); guess(e.key.toUpperCase()); }
    }
    const cleanup = () => document.removeEventListener("keydown", onKey, true);
    panel.querySelectorAll(".fw-key").forEach(b => b.addEventListener("click", () => guess(b.dataset.k)));
    scanBtn.addEventListener("click", scan);
    document.addEventListener("keydown", onKey, true);
    Kit.ui.blurActive();
    paintWord();
    return { use: k => (k === "scan" ? scan() : false), stop: cleanup };
  }
  Kit.fuelWord = { render };
})(window.Kit = window.Kit || {});
