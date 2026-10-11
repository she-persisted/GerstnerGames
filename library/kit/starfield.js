/**
 * @file kit/starfield.js
 * @about A twinkling starfield on a canvas that can streak into warp speed during flights.
 * @provides Kit.starfield.create(canvas, { color, count }) -> { boost(), warp(on), pause(on) }
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  function create(canvas, { color = "#f1efff", count = 170 } = {}) {
    const ctx = canvas.getContext("2d");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, speed = .04, target = .04, paused = false;
    const stars = Array.from({ length: count }, () => ({ x: Math.random(), y: Math.random(), z: .15 + Math.random() * .85, p: Math.random() * 6.28 }));

    function size() {
      const r = canvas.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height; canvas.width = Math.max(1, Math.round(W * d)); canvas.height = Math.max(1, Math.round(H * d));
      ctx.setTransform(d, 0, 0, d, 0, 0);
      if (reduced) draw(0);
    }
    function draw(t) {
      if (!W) return;
      ctx.clearRect(0, 0, W, H);
      speed += (target - speed) * .04;
      for (const s of stars) {
        if (!reduced) { s.x -= speed * s.z * .0025; if (s.x < -.05) { s.x = 1.05; s.y = Math.random(); } }
        const x = s.x * W, y = s.y * H;
        const a = reduced ? .75 * s.z : (.35 + .65 * Math.abs(Math.sin(t * .0012 * s.z + s.p))) * s.z;
        ctx.globalAlpha = Math.min(1, a + .15);
        const len = reduced ? 0 : speed * s.z * 28;
        if (len > 1.5) { ctx.strokeStyle = color; ctx.lineWidth = s.z * 1.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke(); }
        else { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, s.z * 1.3, 0, 6.283); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
    }
    function loop(t) { if (!paused) draw(t); requestAnimationFrame(loop); }
    try { new ResizeObserver(size).observe(canvas); } catch (e) { window.addEventListener("resize", size); }
    size();
    if (!reduced) requestAnimationFrame(loop);

    return {
      boost() { if (!reduced) speed = Math.max(speed, 3.2); },
      warp(on) { target = on ? 1 : .04; },
      pause(v) { paused = !!v; }
    };
  }
  Kit.starfield = { create };
})(window.Kit = window.Kit || {});
