/**
 * @file kit/puzzle-ui.js
 * @about Shows one question with an answer box, helper buttons, and feedback. Works with every question kind in kit/questions.js (riddles, fill in the blank, scrambles, number patterns, odd one out, math).
 * @provides Kit.puzzleUI { render(panel, question, options), blankHTML }
 * @requires kit/util.js, kit/ui.js, kit/audio.js, kit/questions.js
 *
 * options:
 *   head        HTML above the question (place name, progress dots)
 *   leave       function for a "walk away" back button (optional)
 *   helpers     [{ key, type: "scan" | "clue" | "peek" | "clue2", label, iconHtml, color, who, onUse }] in display order
 *               scan = show how many letters; clue = show question.clue; peek = reveal a letter; clue2 = show question.clue2
 *   icons       { check, eye, back } HTML
 *   nextHtml    HTML for the Next button shown after a correct answer
 *   showAfter   wrong answers before "Show me" appears (default 3)
 *   onHint(type), onWrong(tries), onWin({ shown, tries, hints, spell }), onDone()
 */
(function (Kit) {
  "use strict";
  const { $, esc, squash, pick } = Kit.util;
  const Q = Kit.questions;

  const blankHTML = (q, filled) => {
    const [a, b] = q.split("___");
    return `${esc(a)}<span class="slot-blank ${filled ? "filled" : ""}">${filled ? esc(filled) : "?"}</span>${esc(b || "")}`;
  };
  const OOPS = ["Not quite!", "Try again!", "Almost! Think again.", "Nope! You've got this."];
  const CHEERS = ["Yes!", "Woo-hoo!", "Nailed it!", "Brain power!", "Right on!"];
  const NUDGE_ORDER = ["clue", "peek", "clue2", "scan"];

  function render(panel, p, o) {
    const sfx = Kit.audio.sfx, icons = o.icons || {};
    const ans = p.a[0], showAfter = o.showAfter || 3;
    let tries = 0, shown = false, hints = 0;
    const revealed = new Set(), used = new Set();
    const letters = [...ans].map((c, i) => ({ c, i })).filter(x => x.c !== " ");
    const numeric = /^\d+$/.test(ans);
    const helpers = o.helpers || [];
    const byKey = Object.fromEntries(helpers.map(h => [h.key, h]));

    let extra = "";
    if (p.kind === "scramble") { const s = Q.scrambled(ans); extra = `<div class="tiles" aria-label="Letters: ${s.split("").join(" ")}">${s.split("").map(c => `<span class="tile ice">${c}</span>`).join("")}</div>`; }
    if (p.kind === "pattern") extra = `<div class="tiles" aria-label="${p.seq.join(", ")}, and then what?">${p.seq.map(n => `<span class="tile num">${n}</span>`).join("")}<span class="tile num ask">?</span></div>`;
    if (p.kind === "odd") extra = `<div class="tiles">${p.tiles.map(w => `<span class="tile word">${esc(w)}</span>`).join("")}</div>`;
    const qText = p.kind === "blank" ? blankHTML(p.q, null) : p.kind === "odd" ? "Which one does not belong?" : esc(p.q);
    const helperBtns = helpers.map(h => `<button type="button" class="help" data-help="${h.key}" style="--who:${h.color}">${h.iconHtml || ""}<span>${esc(h.label)}</span></button>`).join("")
      + `<button type="button" class="help" data-help="show" style="--who:var(--dust)" hidden>${icons.eye || ""}<span>Show me</span></button>`;

    panel.innerHTML = `<div class="card puzzle">
      ${o.head || ""}
      <p class="kind">${Q.KIND[p.kind] || ""}</p>
      ${p.q || p.kind === "odd" || p.kind === "blank" ? `<p class="q ${p.eq ? "eq" : ""}" id="qtext">${qText}</p>` : ""}
      ${extra}
      <p class="blanks" id="blanks" hidden></p>
      <div class="clues" id="clues"></div>
      <form class="answer" id="ansForm" autocomplete="off">
        <label class="sr" for="ans">Your answer</label>
        <input id="ans" class="field" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="?" inputmode="${numeric ? "numeric" : "text"}">
        <button class="btn check" type="submit">${icons.check || "OK"}<span class="sr">Check</span></button>
      </form>
      <div class="helpers" id="helpers">${helperBtns}</div>
      <p class="feedback" id="fb" aria-live="assertive"></p>
      <div class="actions ${o.leave ? "split" : ""}" id="puzDone">${o.leave ? `<button type="button" class="btn ghost icon" id="leaveBtn" aria-label="Walk away">${icons.back || "Back"}</button>` : ""}</div>
    </div>`;

    const input = $("#ans", panel), fb = $("#fb", panel);
    const say = (html, cls = "") => { fb.className = "feedback " + cls; fb.innerHTML = html; };
    function paintBlanks() {
      const b = $("#blanks", panel); b.hidden = false;
      b.textContent = [...ans].map((c, i) => c === " " ? "  " : (shown || revealed.has(i) ? c.toUpperCase() : "_")).join(" ");
      b.setAttribute("aria-label", `${letters.length} ${numeric ? "digits" : "letters"}`);
    }
    function addClue(h, text) {
      $("#clues", panel).insertAdjacentHTML("beforeend", `<p class="clue" style="--who:${h.color}"><b>${esc(h.who || h.label)}:</b> ${esc(text)}</p>`);
    }
    function used1(h) {
      used.add(h.key); hints++; sfx.hint();
      panel.querySelectorAll(".help.nudge").forEach(x => x.classList.remove("nudge"));
      if (h.onUse) h.onUse();
      if (o.onHint) o.onHint(h.type);
    }
    if (o.leave) $("#leaveBtn", panel).addEventListener("click", o.leave);

    $("#helpers", panel).addEventListener("click", e => {
      const b = e.target.closest("[data-help]"); if (!b || b.disabled) return;
      const k = b.dataset.help;
      if (k === "show") {
        shown = true; paintBlanks();
        panel.querySelectorAll("[data-help]").forEach(x => { x.disabled = true; x.classList.remove("nudge"); });
        say(""); input.value = "";
      } else {
        const h = byKey[k];
        if (h.type === "scan") { paintBlanks(); b.disabled = true; used1(h); }
        if (h.type === "clue") { addClue(h, p.clue); b.disabled = true; used1(h); }
        if (h.type === "clue2") { addClue(h, p.clue2 || `It starts with ${ans[0].toUpperCase()}.`); b.disabled = true; used1(h); }
        if (h.type === "peek") {
          const hidden = letters.filter(x => !revealed.has(x.i));
          if (hidden.length > 1) { revealed.add(hidden[0].i); paintBlanks(); used1(h); }
          if (letters.filter(x => !revealed.has(x.i)).length <= 1) b.disabled = true;
        }
      }
      input.focus({ preventScroll: true });
    });

    $("#ansForm", panel).addEventListener("submit", e => {
      e.preventDefault();
      if (input.disabled) return;
      const res = Q.judge(p, input.value, shown);
      if (res.empty) { input.focus(); return; }
      if (res.ok) return win(res);
      tries++; sfx.wrong();
      if (o.onWrong) o.onWrong(tries);
      if (shown) { say(`<b>${esc(ans.toUpperCase())}</b>`, "oops"); input.select(); return; }
      say(res.anagram ? "Right letters, wrong order!" : OOPS[(tries - 1) % OOPS.length], "oops");
      if (tries === 2) {
        const nb = NUDGE_ORDER.map(t => helpers.find(h => h.type === t && !used.has(h.key)))
          .map(h => h && panel.querySelector(`[data-help="${h.key}"]`)).find(x => x && !x.disabled);
        if (nb) nb.classList.add("nudge");
      }
      if (tries >= showAfter) { const sb = panel.querySelector('[data-help="show"]'); sb.hidden = false; sb.classList.add("nudge"); }
      input.select();
    });

    function win(res) {
      input.disabled = true;
      panel.querySelectorAll(".answer button, [data-help]").forEach(x => { x.disabled = true; });
      sfx.right();
      if (p.kind === "blank") $("#qtext", panel).innerHTML = blankHTML(p.q, ans);
      let msg = shown ? "There you go!" : pick(CHEERS);
      if (res.spell && squash(res.spell) !== squash(input.value)) msg += ` <b>${esc(res.spell.toUpperCase())}</b>`;
      say(msg, "good");
      if (o.onWin) o.onWin({ shown, tries, hints, spell: res.spell });
      const done = $("#puzDone", panel);
      done.className = "actions";
      done.innerHTML = o.nextHtml || Kit.ui.nextBtn("Next");
      Kit.ui.bindPrimary(panel, o.onDone);
    }
    Kit.ui.focusSoon(input);
  }

  Kit.puzzleUI = { render, blankHTML };
})(window.Kit = window.Kit || {});
