/**
 * @file kit/side-hub.js
 * @about A walkable side-view home area. The hero walks left and right with the arrow keys or A and D, or walks to wherever you click. Stops along the way (like portals) can be entered with Enter, Space, or the up arrow, or by clicking them. The game draws everything; this module handles walking, the camera, clicks, and typed secret words.
 * @provides Kit.sidehub.create(canvas, options) -> { stop(), hero, view(), walkTo(x, enterId), setStops(stops), say(text, ms) }
 * @requires kit/util.js
 *
 * options = { width (tiles), start (tile x), speed (tiles per second), stops: [{ id, x, open }],
 *             draw(ctx, view, hero, bubble), onEnter(stop), onNear(stop or null), onTap(worldX, worldY, view) -> true if handled,
 *             onFirstMove(), onType(lastLetters) }
 * view = { w, h, T, camX, camY: 0, t, dpr, ground (pixel y of the floor) }; hero = { x, facing (1 right, -1 left), walking, near }
 * bubble = { text, until } for a speech bubble over the hero, set with say().
 */
(function (Kit) {
  "use strict";
  const { clamp } = Kit.util;

  function create(canvas, o) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, T = 60, dpr = 1, raf = 0, last = 0, stopped = false, moved = false;
    let stops = o.stops || [], keys = new Set(), target = null, enterId = null, typed = "", lastNear = null;
    const hero = { x: o.start || 2, facing: 1, walking: false, near: null };
    const bubble = { text: "", until: 0 };
    const speed = o.speed || 4.2;

    function size() {
      const r = canvas.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height; canvas.width = Math.max(1, Math.round(W * dpr)); canvas.height = Math.max(1, Math.round(H * dpr));
      // Tile size: about a seventh of the height, but at least 11 tiles fit across a narrow screen (like a phone).
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); T = Math.max(24, Math.min(H / 7.4, W / 11));
    }
    const ro = (() => { try { const x = new ResizeObserver(size); x.observe(canvas); return x; } catch (e) { addEventListener("resize", size); return null; } })();
    size();

    function view() {
      const span = W / T;
      const camX = clamp(hero.x - span / 2, 0, Math.max(0, o.width - span));
      return { w: W, h: H, T, camX, camY: 0, t: performance.now(), dpr, ground: H - 1.15 * T };
    }
    const nearStop = () => stops.find(s => s.open !== false && Math.abs(s.x - hero.x) < .9) || null;
    function firstMove() { if (!moved) { moved = true; if (o.onFirstMove) o.onFirstMove(); } }
    function enter(s) { if (!s || s.open === false) return; target = null; enterId = null; keys.clear(); if (o.onEnter) o.onEnter(s); }

    function kd(e) {
      if (stopped || e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const k = e.key;
      if (k === "ArrowLeft" || k === "a" || k === "A") { e.preventDefault(); keys.add("L"); target = null; firstMove(); }
      else if (k === "ArrowRight" || k === "d" || k === "D") { e.preventDefault(); keys.add("R"); target = null; firstMove(); }
      else if (k === "ArrowUp" || k === "Enter" || k === " ") {
        if (tag === "BUTTON" && k !== "ArrowUp") return;
        const s = nearStop(); if (s) { e.preventDefault(); e.stopPropagation(); enter(s); }
      }
      if (/^[a-z]$/i.test(k)) { typed = (typed + k.toLowerCase()).slice(-12); if (o.onType) o.onType(typed); }
    }
    function ku(e) {
      const k = e.key;
      if (k === "ArrowLeft" || k === "a" || k === "A") keys.delete("L");
      if (k === "ArrowRight" || k === "d" || k === "D") keys.delete("R");
    }
    function click(e) {
      const r = canvas.getBoundingClientRect(), v = view();
      const wx = v.camX + (e.clientX - r.left) / T, wy = (v.ground - (e.clientY - r.top)) / T;
      if (o.onTap && o.onTap(wx, wy, v)) return;
      const s = stops.find(s => s.open !== false && Math.abs(s.x - wx) < 1.2);
      firstMove();
      if (s) { if (Math.abs(s.x - hero.x) < .9) enter(s); else { target = s.x; enterId = s.id; } }
      else { target = clamp(wx, .5, o.width - .5); enterId = null; }
    }
    document.addEventListener("keydown", kd, true); document.addEventListener("keyup", ku, true);
    canvas.addEventListener("click", click);
    const blur = () => keys.clear(); addEventListener("blur", blur);

    function frame(now) {
      if (stopped) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
      let dir = (keys.has("R") ? 1 : 0) - (keys.has("L") ? 1 : 0);
      if (!dir && target != null) {
        const d = target - hero.x;
        if (Math.abs(d) < .06) { hero.x = target; target = null; const id = enterId; enterId = null; if (id) { const s = stops.find(x => x.id === id); if (s) enter(s); if (stopped) return; } }
        else dir = Math.sign(d);
      }
      hero.walking = !!dir;
      if (dir) { hero.facing = dir; hero.x = clamp(hero.x + dir * speed * dt, .5, o.width - .5); if (target != null && Math.sign(target - hero.x) !== dir) hero.x = target; }
      hero.near = nearStop();
      if (hero.near !== lastNear) { lastNear = hero.near; if (o.onNear) o.onNear(hero.near); }
      o.draw(ctx, view(), hero, bubble.until > now ? bubble : null);
    }
    raf = requestAnimationFrame(frame);

    return {
      hero, view,
      walkTo(x, id = null) { target = clamp(x, .5, o.width - .5); enterId = id; },
      setStops(s) { stops = s; },
      say(text, ms = 2600) { bubble.text = text; bubble.until = performance.now() + ms; },
      stop() { stopped = true; cancelAnimationFrame(raf); document.removeEventListener("keydown", kd, true); document.removeEventListener("keyup", ku, true); canvas.removeEventListener("click", click); removeEventListener("blur", blur); if (ro) ro.disconnect(); }
    };
  }
  Kit.sidehub = { create };
})(window.Kit = window.Kit || {});
