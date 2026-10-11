/**
 * @file kit/ui.js
 * @about Shared screen helpers: the main Next button, progress dots, toasts, focus, Enter-to-continue, and reading theme colors for canvas drawing.
 * @provides Kit.ui { reduced, focusSoon, bindPrimary, nextBtn, pips, toaster, enterAdvances, tokens, blurActive }
 * @requires kit/util.js
 */
(function (Kit) {
  "use strict";
  const { esc } = Kit.util;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function focusSoon(el) { if (el) setTimeout(() => { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }, 40); }

  // Wires the panel's [data-primary] button. Clicks in the first 220 ms are ignored so a held Enter key can't skip a screen.
  function bindPrimary(panel, fn) {
    const b = panel.querySelector("[data-primary]"); if (!b) return;
    const made = performance.now();
    b.addEventListener("click", () => { if (performance.now() - made < 220) return; fn(); });
    focusSoon(b);
  }

  const nextBtn = (label, iconHtml = "", cls = "") => `<button class="btn ${cls}" type="button" data-primary>${esc(label)} ${iconHtml}</button>`;

  // Three dots that fill in as challenges are finished.
  const pips = (done, total = 3) => `<span class="pips" role="img" aria-label="${done} of ${total} done">${Array.from({ length: total }, (x, i) => `<i class="pip ${i < done ? "on" : i === done ? "cur" : ""}"></i>`).join("")}</span>`;

  function toaster(el, ms = 2600) {
    let timer = 0;
    return msg => { el.textContent = msg; el.classList.add("show"); clearTimeout(timer); timer = setTimeout(() => el.classList.remove("show"), ms); };
  }

  // Pressing Enter anywhere (outside a text box or button) presses the panel's main button.
  function enterAdvances(panel) {
    document.addEventListener("keydown", e => {
      if (e.key !== "Enter") return;
      if (e.repeat) { e.preventDefault(); return; }
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === "INPUT" || tag === "BUTTON" || tag === "TEXTAREA") return;
      const b = panel.querySelector("[data-primary]:not([disabled])");
      if (b) { e.preventDefault(); b.click(); }
    }, true);
  }

  // Read CSS custom properties so canvas drawings use the same colors as the page. map = { name: "--css-var" }.
  function tokens(map) {
    const cs = getComputedStyle(document.documentElement), out = {};
    for (const k in map) out[k] = cs.getPropertyValue(map[k]).trim();
    return out;
  }

  const blurActive = () => { const a = document.activeElement; if (a && a.blur) a.blur(); };

  Kit.ui = { reduced, focusSoon, bindPrimary, nextBtn, pips, toaster, enterAdvances, tokens, blurActive };
})(window.Kit = window.Kit || {});
