/**
 * @file kit/topdown-map.js
 * @about A walkable top-down map on a canvas. The player moves with arrow keys, WASD, or by clicking; walking into a place triggers it. Includes fog with light holes, particle bursts, speech bubbles, and an arrow-key hint until the player first moves.
 * @provides Kit.topdownMap.create(options) -> map { start(pos), stop(), on, busy, pos, say(text, ms), burst(x, y, color, n), stepOutOf(site) }
 * @requires kit/ui.js, kit/canvas.js
 *
 * options:
 *   canvas, width, height       map size in map units (the canvas scales to fit)
 *   speed, enterRadius          walking speed (units per second) and how close counts as "arrived"
 *   bounds                      { minX, maxX, minY, maxY } where the player can walk
 *   sites                       [{ id, x, y }] places that trigger onArrive
 *   drawWorld(c, t)             draw ground and places (map units)
 *   drawPlayer(c, x, y, t, m)   draw the player; m = { moving, phase, fx, fy }
 *   drawAbove(c, t)             draw things that sit above the fog (beacons)
 *   fog                         { rgb: "r,g,b", alpha(), holes(pos) -> [{ x, y, r, a }] } (optional)
 *   onArrive(site), onMove(), showHint() -> boolean
 *   colors                      { light, dark } for bubbles and the arrow-key hint
 *   font                        font family for speech bubbles
 */
(function (Kit) {
  "use strict";
  const D = Kit.draw;
  const KEYMAP = { ArrowLeft: "L", ArrowRight: "R", ArrowUp: "U", ArrowDown: "D", a: "L", d: "R", w: "U", s: "D", A: "L", D: "R", W: "U", S: "D" };

  function create(o) {
    const cv = o.canvas, ctx = cv.getContext("2d");
    const ov = document.createElement("canvas"), octx = ov.getContext("2d");
    const B = o.bounds, colors = o.colors || { light: "#fff", dark: "#000" }, font = o.font || "system-ui, sans-serif";
    const M = { on: false, busy: true, raf: 0, last: 0, scale: 1, ox: 0, oy: 0, dpr: 1, cw: 0, ch: 0, pos: { x: o.width / 2, y: o.height / 2 }, target: null, keys: new Set(), moving: false, phase: 0, fx: 0, fy: 1, inside: null, parts: [], bubble: null };

    function size() {
      const r = cv.getBoundingClientRect(); if (!r.width) return;
      M.dpr = Math.min(2, window.devicePixelRatio || 1); M.cw = r.width; M.ch = r.height;
      cv.width = ov.width = Math.round(r.width * M.dpr); cv.height = ov.height = Math.round(r.height * M.dpr);
      M.scale = Math.min(r.width / o.width, r.height / o.height); M.ox = (r.width - o.width * M.scale) / 2; M.oy = (r.height - o.height * M.scale) / 2;
    }
    try { new ResizeObserver(() => { if (M.on) size(); }).observe(cv); } catch (e) { window.addEventListener("resize", () => { if (M.on) size(); }); }
    const worldT = c => c.setTransform(M.scale * M.dpr, 0, 0, M.scale * M.dpr, M.ox * M.dpr, M.oy * M.dpr);
    const clampPos = (x, y) => ({ x: Math.max(B.minX, Math.min(B.maxX, x)), y: Math.max(B.minY, Math.min(B.maxY, y)) });

    document.addEventListener("keydown", e => {
      if (!M.on || M.busy) return;
      const k = KEYMAP[e.key]; if (!k) return;
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault(); M.keys.add(k);
    });
    document.addEventListener("keyup", e => { const k = KEYMAP[e.key]; if (k) M.keys.delete(k); });
    window.addEventListener("blur", () => M.keys.clear());
    cv.addEventListener("pointerdown", e => {
      if (!M.on || M.busy) return;
      const r = cv.getBoundingClientRect();
      let x = (e.clientX - r.left - M.ox) / M.scale, y = (e.clientY - r.top - M.oy) / M.scale;
      const s = o.sites.find(st => Math.hypot(st.x - x, st.y - y) < 70);
      if (s) { x = s.x; y = s.y; }
      M.target = clampPos(x, y);
      if (o.onMove) o.onMove();
    });

    function frame(t) {
      if (!M.on) return;
      const dt = Math.min(.05, (t - M.last) / 1000); M.last = t;
      let vx = 0, vy = 0;
      if (!M.busy) {
        if (M.keys.has("L")) vx -= 1; if (M.keys.has("R")) vx += 1; if (M.keys.has("U")) vy -= 1; if (M.keys.has("D")) vy += 1;
        if (vx || vy) { M.target = null; if (o.onMove) o.onMove(); }
        else if (M.target) { const dx = M.target.x - M.pos.x, dy = M.target.y - M.pos.y, d = Math.hypot(dx, dy); if (d < 4) M.target = null; else { vx = dx / d; vy = dy / d; } }
      }
      const len = Math.hypot(vx, vy);
      M.moving = len > 0;
      if (M.moving) {
        vx /= len; vy /= len;
        M.pos = clampPos(M.pos.x + vx * o.speed * dt, M.pos.y + vy * o.speed * dt);
        M.phase += dt * 11; M.fx = vx; M.fy = vy;
      }
      if (!M.busy) {
        const here = o.sites.find(s => Math.hypot(s.x - M.pos.x, s.y - (M.pos.y - 6)) < o.enterRadius);
        if (here && M.inside !== here.id) { M.inside = here.id; o.onArrive(here); }
        else if (!here) M.inside = null;
      }
      M.parts = M.parts.filter(p => (p.life -= dt) > 0);
      M.parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt; });
      draw(t);
      M.raf = requestAnimationFrame(frame);
    }

    function bubble(c, x, y, text) {
      c.font = `700 15px ${font}`;
      const w = c.measureText(text).width + 22, h = 30, bx = Math.max(6, Math.min(o.width - w - 6, x - w / 2)), by = y - h;
      c.fillStyle = colors.light; D.rr(c, bx, by, w, h, 12); c.fill();
      c.beginPath(); c.moveTo(x - 7, by + h - 1); c.lineTo(x, by + h + 9); c.lineTo(x + 7, by + h - 1); c.fill();
      c.fillStyle = colors.dark; c.textBaseline = "middle"; c.fillText(text, bx + 11, by + h / 2 + 1);
    }
    function arrowHint(c, t) {
      c.setTransform(M.dpr, 0, 0, M.dpr, 0, 0);
      const a = .55 + .35 * Math.sin(t / 350), k = 30, gx = M.cw - 3 * k - 22, gy = M.ch - 2 * k - 22;
      c.globalAlpha = a;
      [[1, 0, "U"], [0, 1, "L"], [1, 1, "D"], [2, 1, "R"]].forEach(([i, j, d]) => {
        const x = gx + i * (k + 4), y = gy + j * (k + 4), cx = x + k / 2, cy = y + k / 2, q = 7;
        c.fillStyle = colors.light; D.rr(c, x, y, k, k, 6); c.fill();
        c.fillStyle = colors.dark; c.beginPath();
        if (d === "U") { c.moveTo(cx, cy - q); c.lineTo(cx + q, cy + q * .6); c.lineTo(cx - q, cy + q * .6); }
        if (d === "D") { c.moveTo(cx, cy + q); c.lineTo(cx + q, cy - q * .6); c.lineTo(cx - q, cy - q * .6); }
        if (d === "L") { c.moveTo(cx - q, cy); c.lineTo(cx + q * .6, cy - q); c.lineTo(cx + q * .6, cy + q); }
        if (d === "R") { c.moveTo(cx + q, cy); c.lineTo(cx - q * .6, cy - q); c.lineTo(cx - q * .6, cy + q); }
        c.closePath(); c.fill();
      });
      c.globalAlpha = 1;
    }
    function draw(t) {
      const c = ctx;
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
      worldT(c);
      o.drawWorld(c, t);
      o.drawPlayer(c, M.pos.x, M.pos.y, t, { moving: M.moving, phase: M.phase, fx: M.fx, fy: M.fy });
      if (o.fog) {
        octx.setTransform(1, 0, 0, 1, 0, 0); octx.globalCompositeOperation = "source-over"; octx.clearRect(0, 0, ov.width, ov.height);
        octx.fillStyle = `rgba(${o.fog.rgb},${o.fog.alpha()})`; octx.fillRect(0, 0, ov.width, ov.height);
        worldT(octx); octx.globalCompositeOperation = "destination-out";
        o.fog.holes(M.pos).forEach(h => D.hole(octx, h.x, h.y, h.r, h.a == null ? 1 : h.a));
        octx.globalCompositeOperation = "source-over";
        c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(ov, 0, 0);
      }
      worldT(c);
      if (o.drawAbove) o.drawAbove(c, t);
      M.parts.forEach(p => { c.globalAlpha = Math.min(1, p.life * 1.6); c.fillStyle = p.color; D.circle(c, p.x, p.y, 3.2); });
      c.globalAlpha = 1;
      if (M.bubble && t < M.bubble.until) bubble(c, M.pos.x, M.pos.y - 100, M.bubble.text); else M.bubble = null;
      if (!M.busy && o.showHint && o.showHint()) arrowHint(c, t);
    }

    return {
      start(pos) {
        if (M.on) return;
        M.on = true; size();
        if (pos) M.pos = { ...pos };
        M.inside = null; M.last = performance.now();
        cancelAnimationFrame(M.raf); M.raf = requestAnimationFrame(frame);
      },
      stop() { if (!M.on) return; M.on = false; M.busy = true; cancelAnimationFrame(M.raf); M.keys.clear(); M.target = null; },
      get on() { return M.on; },
      get busy() { return M.busy; },
      set busy(v) { M.busy = !!v; if (v) { M.keys.clear(); M.target = null; } },
      get pos() { return { ...M.pos }; },
      say(text, ms = 3500) { M.bubble = { text, until: performance.now() + ms }; },
      burst(x, y, color, n = 14) {
        for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = 40 + Math.random() * 120; M.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: .7 + Math.random() * .5, color }); }
      },
      // Moves the player just outside a place so walking back in triggers it again.
      stepOutOf(site) {
        let vx = M.pos.x - site.x, vy = M.pos.y - site.y; const d = Math.hypot(vx, vy);
        if (d < 1) { vx = 0; vy = 1; } else { vx /= d; vy /= d; }
        M.pos = clampPos(site.x + vx * (o.enterRadius + 22), site.y + vy * (o.enterRadius + 22));
        M.inside = site.id;
      }
    };
  }
  Kit.topdownMap = { create };
})(window.Kit = window.Kit || {});
