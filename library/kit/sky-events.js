/**
 * @file kit/sky-events.js
 * @about Little surprises that cross a canvas sky every few seconds, to keep eyes on the story: shooting stars (the most common), now and then a short meteor shower, a slow comet with a glowing two-color tail, a satellite drifting by with a gently pulsing light, a tiny rocket zooming past, and a star that swells into a sparkle and fades. Calm on purpose: nothing flashes, the satellite's light fades in and out about once a second, and with "reduce motion" turned on nothing appears at all.
 * @provides Kit.skyEvents.create(options) -> { draw(ctx, view, colors), clear(), next(kind) }
 * @requires nothing
 *
 * options = { every: [min, max] seconds between events (default [3.5, 7]), first: seconds until the first one (default 1.2),
 *             area: [top, bottom] as fractions of the height where events may cross (default [.04, .42]),
 *             kinds: { meteor, shower, comet, satellite, rocket, twinkle } weights (missing kinds don't appear) }
 * draw(ctx, view, colors): call once per frame after drawing the sky and before the characters. view = { w, h, t (ms) };
 * colors = up to three accent colors from the scene (meteor trails and comet tails use them). clear() empties the sky,
 * for example when a new story scene starts. next(kind) starts one event of that kind right now (for tests and screenshots).
 */
(function (Kit) {
  "use strict";
  const KINDS = { meteor: 46, shower: 8, comet: 12, satellite: 12, rocket: 8, twinkle: 14 };
  const LIFE = { meteor: 900, shower: 2200, comet: 7000, satellite: 9000, rocket: 4200, twinkle: 1500 };

  function create(opts = {}) {
    const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const every = opts.every || [3.5, 7], area = opts.area || [.04, .42], weights = opts.kinds || KINDS;
    let live = [], due = null, forced = null;
    const rand = (a, b) => a + Math.random() * (b - a);
    function pick() {
      const list = Object.entries(weights).filter(([k, w]) => w > 0 && LIFE[k]), sum = list.reduce((s, [, w]) => s + w, 0);
      let r = Math.random() * sum;
      for (const [k, w] of list) { if ((r -= w) < 0) return k; }
      return "meteor";
    }
    // One event, laid out in fractions of the sky so it fits any canvas size.
    function spawn(kind, t) {
      const y = rand(area[0], area[1]), dir = Math.random() < .5 ? 1 : -1;
      const e = { kind, t0: t, life: LIFE[kind] * (kind === "meteor" ? rand(.8, 1.2) : 1), dir, y, x: rand(.15, .85), c: Math.floor(Math.random() * 3) };
      if (kind === "meteor") { e.x = dir > 0 ? rand(.05, .55) : rand(.45, .95); e.len = rand(.16, .26); e.drop = rand(.12, .26); }
      if (kind === "shower") e.parts = [0, 1, 2, 3].map(i => ({ dt: i * rand(320, 520), x: rand(.2, .8), y: y + rand(-.06, .06), len: rand(.1, .18) }));
      if (kind === "comet") e.y = rand(area[0], (area[0] + area[1]) / 2);
      return e;
    }
    function clear() { live = []; due = null; }
    function next(kind) { forced = kind || pick(); }

    function draw(ctx, v, colors = []) {
      if (reduced) return;
      const t = v.t, W = v.w, H = v.h, cols = [colors[0] || "#21d9ff", colors[1] || "#ff6be0", colors[2] || "#ffe94a"];
      if (due === null) due = t + (opts.first == null ? 1.2 : opts.first) * 1000;
      if (forced || t >= due) { live.push(spawn(forced || pick(), t)); forced = null; due = t + rand(every[0], every[1]) * 1000; }
      live = live.filter(e => t - e.t0 < e.life);
      ctx.save();
      for (const e of live) {
        const p = (t - e.t0) / e.life;
        if (e.kind === "meteor") meteor(ctx, W, H, e.x, e.y, e.dir, e.len, e.drop, p, cols[e.c]);
        else if (e.kind === "shower") e.parts.forEach(m => { const q = (t - e.t0 - m.dt) / 800; if (q > 0 && q < 1) meteor(ctx, W, H, m.x, m.y, e.dir, m.len, .14, q, cols[e.c], .7); });
        else if (e.kind === "comet") comet(ctx, W, H, e, p, cols);
        else if (e.kind === "satellite") satellite(ctx, W, H, e, p, t);
        else if (e.kind === "rocket") rocket(ctx, W, H, e, p, t, cols);
        else if (e.kind === "twinkle") twinkle(ctx, W, H, e, p, cols[e.c]);
      }
      ctx.restore();
    }
    return { draw, clear, next };
  }

  // A shooting star: a bright head racing down at a slant with a tapering trail that fades out.
  function meteor(ctx, W, H, x0, y0, dir, len, drop, p, col, k = 1) {
    const e = 1 - Math.pow(1 - p, 2), x = (x0 + dir * len * 1.6 * e) * W, y = (y0 + drop * e) * H;
    const tx = x - dir * len * W * Math.min(1, p * 3) * .55, ty = y - drop * H * Math.min(1, p * 3) * .34;
    const fade = p < .7 ? 1 : 1 - (p - .7) / .3, s = Math.max(1.2, H * .004) * k;
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createLinearGradient(x, y, tx, ty); g.addColorStop(0, "#ffffff"); g.addColorStop(.25, col); g.addColorStop(1, col + "00");
    ctx.globalAlpha = .9 * fade; ctx.strokeStyle = g; ctx.lineCap = "round";
    ctx.lineWidth = s * 1.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.lineWidth = s * .7; ctx.strokeStyle = "#ffffff"; ctx.globalAlpha = .7 * fade; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (tx - x) * .35, y + (ty - y) * .35); ctx.stroke();
    const r = s * 3.2, hg = ctx.createRadialGradient(x, y, 0, x, y, r); hg.addColorStop(0, "#ffffff"); hg.addColorStop(1, "#ffffff00");
    ctx.globalAlpha = fade; ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  }
  // A comet: a fuzzy glowing head drifting slowly across, with a wide dust tail and a thin blue ion tail behind it.
  function comet(ctx, W, H, e, p, cols) {
    const x = (e.dir > 0 ? -.1 + 1.2 * p : 1.1 - 1.2 * p) * W, y = (e.y + .05 * Math.sin(p * Math.PI)) * H, L = W * .2, s = H * .012;
    const fade = Math.min(1, p * 6, (1 - p) * 6);
    ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = .55 * fade;
    for (const [len, wide, col, bend] of [[L, s * 2.6, cols[2], .12], [L * 1.25, s * .9, "#9fe8ff", -.02]]) {
      const ex = x - e.dir * len, ey = y - len * bend, g = ctx.createLinearGradient(x, y, ex, ey);
      g.addColorStop(0, col + "dd"); g.addColorStop(1, col + "00");
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y - wide * .35);
      ctx.quadraticCurveTo(x - e.dir * len * .5, y - wide - len * bend * .5, ex, ey - wide * .2);
      ctx.lineTo(ex, ey + wide * .2); ctx.quadraticCurveTo(x - e.dir * len * .5, y + wide - len * bend * .5, x, y + wide * .35); ctx.closePath(); ctx.fill();
    }
    const hg = ctx.createRadialGradient(x, y, 0, x, y, s * 3); hg.addColorStop(0, "#ffffff"); hg.addColorStop(.35, cols[2] + "cc"); hg.addColorStop(1, cols[2] + "00");
    ctx.globalAlpha = fade; ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x, y, s * 3, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  }
  // A satellite: a small body with two solar panels, drifting across and turning slowly. Its light fades in and out about once a second.
  function satellite(ctx, W, H, e, p, t) {
    const x = (e.dir > 0 ? -.05 + 1.1 * p : 1.05 - 1.1 * p) * W, y = (e.y - .03 + .06 * p) * H, s = H * .014;
    ctx.save(); ctx.translate(x, y); ctx.rotate(p * 1.4 * e.dir); ctx.globalAlpha = Math.min(1, p * 8, (1 - p) * 8) * .95;
    ctx.lineWidth = Math.max(1, s * .16); ctx.strokeStyle = "#1b1030";
    for (const sx of [-1, 1]) { ctx.fillStyle = "#3b5bd9"; ctx.fillRect(sx * s * 1.1 - (sx < 0 ? s * 1.6 : 0), -s * .45, s * 1.6, s * .9); ctx.strokeRect(sx * s * 1.1 - (sx < 0 ? s * 1.6 : 0), -s * .45, s * 1.6, s * .9);
      ctx.strokeStyle = "#8fb0ff"; ctx.beginPath(); ctx.moveTo(sx * s * 1.1 + (sx < 0 ? -s * .8 : s * .8), -s * .45); ctx.lineTo(sx * s * 1.1 + (sx < 0 ? -s * .8 : s * .8), s * .45); ctx.stroke(); ctx.strokeStyle = "#1b1030"; }
    ctx.fillStyle = "#d9dcf2"; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(-s * .7, -s * .55, s * 1.4, s * 1.1, s * .25); else ctx.rect(-s * .7, -s * .55, s * 1.4, s * 1.1); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -s * .55); ctx.lineTo(0, -s * 1.1); ctx.stroke();
    const glow = .35 + .65 * (.5 + .5 * Math.sin(t / 160)); // fades in and out about once a second, never a flash
    ctx.globalAlpha *= glow; ctx.fillStyle = "#ff3ec8"; ctx.beginPath(); ctx.arc(0, -s * 1.2, s * .26, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // A tiny rocket zooming past on a gentle arc, with a flickering flame and a trail of puffs.
  function rocket(ctx, W, H, e, p, t, cols) {
    const P = q => [(e.dir > 0 ? -.06 + 1.12 * q : 1.06 - 1.12 * q) * W, (e.y + .08 - .16 * q + .05 * Math.sin(q * Math.PI * 2)) * H];
    const [x, y] = P(p), [x2, y2] = P(p + .01), a = Math.atan2(y2 - y, x2 - x), s = H * .016;
    for (let i = 1; i <= 6; i++) { const [px, py] = P(p - i * .018); ctx.globalAlpha = .35 * (1 - i / 7); ctx.fillStyle = "#e9e3ff"; ctx.beginPath(); ctx.arc(px, py, s * (.25 + i * .09), 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1; ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    const fl = s * (1 + .25 * Math.sin(t / 50));
    ctx.fillStyle = "#ff9a3c"; ctx.beginPath(); ctx.moveTo(-s * 1.1, -s * .32); ctx.lineTo(-s * 1.1 - fl, 0); ctx.lineTo(-s * 1.1, s * .32); ctx.fill();
    ctx.fillStyle = "#ffe94a"; ctx.beginPath(); ctx.moveTo(-s * 1.1, -s * .18); ctx.lineTo(-s * 1.1 - fl * .55, 0); ctx.lineTo(-s * 1.1, s * .18); ctx.fill();
    ctx.lineWidth = Math.max(1, s * .14); ctx.strokeStyle = "#1b1030"; ctx.lineJoin = "round";
    ctx.fillStyle = cols[1]; ctx.beginPath(); ctx.moveTo(-s * .7, -s * .4); ctx.lineTo(-s * 1.25, -s * .85); ctx.lineTo(-s * 1.15, -s * .3); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s * .7, s * .4); ctx.lineTo(-s * 1.25, s * .85); ctx.lineTo(-s * 1.15, s * .3); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#e8ecff"; ctx.beginPath(); ctx.moveTo(-s * 1.15, -s * .42); ctx.lineTo(s * .45, -s * .42); ctx.quadraticCurveTo(s * 1.3, 0, s * .45, s * .42); ctx.lineTo(-s * 1.15, s * .42); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#3ef2ff"; ctx.beginPath(); ctx.arc(-s * .1, 0, s * .2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  // A star that swells into a four-point sparkle, turns a little, and fades away.
  function twinkle(ctx, W, H, e, p, col) {
    const x = e.x * W, y = e.y * H, k = Math.sin(p * Math.PI), r = H * .03 * k;
    if (r < .5) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(p * .8); ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.4); g.addColorStop(0, "#ffffffcc"); g.addColorStop(.4, col + "66"); g.addColorStop(1, col + "00");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = .95; ctx.fillStyle = "#ffffff"; ctx.beginPath();
    [[0, -r], [r * .16, -r * .16], [r, 0], [r * .16, r * .16], [0, r], [-r * .16, r * .16], [-r, 0], [-r * .16, -r * .16]].forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b));
    ctx.closePath(); ctx.fill(); ctx.restore();
  }

  Kit.skyEvents = { create };
})(window.Kit = window.Kit || {});
