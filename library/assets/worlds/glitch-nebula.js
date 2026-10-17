/**
 * @file assets/worlds/glitch-nebula.js
 * @about Canvas backgrounds for the Glitch Nebula: bright neon clouds, swirling galaxies, stars, a landmark for each world (a ringed planet, a fern moon, a giant lantern star, a whirlpool galaxy), and gentle glitches that nudge a stripe of the sky sideways now and then. Can also draw the giant black Shadowspine on the clouds, with an optional tiny lantern glow at its feet. Each world has its own colors for runs, too.
 * @provides Kit.art.nebula { THEMES, create() -> { draw(ctx, view, options) } }
 * @requires assets/characters/nova.js, assets/memories/memories.js
 *
 * view = { w, h, T (pixels per tile), camX, camY, t (ms), dpr }
 * options = { theme, shadow: { x (screen fraction 0 to 1), k (size, 1 = normal), lantern: true | false } | null, whisper: true (rarely
 *             shows a tiny hidden message inside a glitch), glitch: false to turn glitches off }
 * Gentle on purpose: glitches happen at most about once a second, last a tenth of a second, and only shift a thin stripe.
 * Nothing flashes more than three times a second. With "reduce motion" turned on there are no glitches and nothing spins.
 */
(function (Kit) {
  "use strict";
  const art = Kit.art = Kit.art || {};
  const THEMES = {
    hub:     { sky: ["#0b0526", "#2c0d62"], blobs: ["#ff3ec8", "#7b3dff", "#21d9ff"], feature: "",       edge: "#3ef2ff", block: "#160a3a", spike: "#ff3ec8", spikeEdge: "#ffd1f3", pad: "#ffe94a", piece: "#5cffb0", spark: "#ff3ec8", shipPortal: "#ff3ec8", cubePortal: "#5cffb0" },
    echo:    { sky: ["#03102c", "#0d3a72"], blobs: ["#21d9ff", "#3b6bff", "#9b6bff"], feature: "rings",  edge: "#21d9ff", block: "#06183a", spike: "#ff4fd8", spikeEdge: "#ffd1f3", pad: "#ffe94a", piece: "#b8ff3b", spark: "#21d9ff", shipPortal: "#ff4fd8", cubePortal: "#b8ff3b" },
    fern:    { sky: ["#03140f", "#0e4a3a"], blobs: ["#5cff8a", "#21d9ff", "#b8ff3b"], feature: "moon",   edge: "#8cff3b", block: "#082418", spike: "#ff9b45", spikeEdge: "#ffe2c2", pad: "#ffe94a", piece: "#ff6be0", spark: "#8cff3b", shipPortal: "#ff6be0", cubePortal: "#ffe94a" },
    lantern: { sky: ["#1a0826", "#5c2a12"], blobs: ["#ffc21a", "#ff6b3d", "#ff3ec8"], feature: "lamp",   edge: "#ffd43b", block: "#200a24", spike: "#ff3ec8", spikeEdge: "#ffd1f3", pad: "#5cffb0", piece: "#21d9ff", spark: "#ffd43b", shipPortal: "#21d9ff", cubePortal: "#5cffb0" },
    whirl:   { sky: ["#12052e", "#4c0f60"], blobs: ["#ff6be0", "#9b6bff", "#ffe94a"], feature: "spiral", edge: "#ff6be0", block: "#1a0838", spike: "#21d9ff", spikeEdge: "#d6fcff", pad: "#ffe94a", piece: "#5cffb0", spark: "#ff6be0", shipPortal: "#21d9ff", cubePortal: "#ffe94a" },
    shadow:  { sky: ["#05020f", "#2c0838"], blobs: ["#ff2e7a", "#5a1fff", "#21d9ff"], feature: "",       edge: "#ff2e7a", block: "#0a0418", spike: "#ffe94a", spikeEdge: "#fff6c2", pad: "#5cffb0", piece: "#21d9ff", spark: "#ff2e7a", shipPortal: "#21d9ff", cubePortal: "#5cffb0" },
    night:   { sky: ["#070420", "#26145e"], blobs: ["#9b6bff", "#21d9ff", "#ff6be0"], feature: "moon",   edge: "#8cff3b", block: "#0b1a2e", spike: "#ff3ec8", spikeEdge: "#ffd1f3", pad: "#ffe94a", piece: "#5cffb0", spark: "#9b6bff", shipPortal: "#ff3ec8", cubePortal: "#5cffb0" },
    valley:  { sky: ["#2a1470", "#ff9ab8"], blobs: ["#ffc21a", "#ff6be0", "#9b6bff"], feature: "sun",    edge: "#8cff3b", block: "#1d5a36", spike: "#ff3ec8", spikeEdge: "#ffd1f3", pad: "#ffe94a", piece: "#5cffb0", spark: "#ffe94a", shipPortal: "#ff3ec8", cubePortal: "#5cffb0" }
  };

  function create() {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cache = new Map();
    let gl = { until: 0, next: 0, bands: [], whisper: false };

    function rng(seed) { return () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }; }
    function sprite(theme, w, h) {
      const key = `${theme}|${Math.round(w)}|${Math.round(h)}`;
      if (cache.has(key)) return cache.get(key);
      const th = THEMES[theme] || THEMES.hub, W = Math.max(600, Math.round(w * 1.6)), H = Math.max(300, Math.round(h));
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const x = c.getContext("2d"), r = rng(theme.length * 977 + 13);
      const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, th.sky[0]); g.addColorStop(1, th.sky[1]);
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      // soft neon clouds, drawn three times across so the strip tiles without a seam
      for (let i = 0; i < 16; i++) {
        const cx = r() * W, cy = H * (.15 + r() * .7), rad = H * (.18 + r() * .35), col = th.blobs[i % th.blobs.length];
        for (const off of [-W, 0, W]) {
          const rg = x.createRadialGradient(cx + off, cy, 0, cx + off, cy, rad);
          rg.addColorStop(0, col + "55"); rg.addColorStop(.55, col + "1f"); rg.addColorStop(1, col + "00");
          x.fillStyle = rg; x.fillRect(cx + off - rad, cy - rad, rad * 2, rad * 2);
        }
      }
      for (let i = 0; i < 220; i++) {
        const sx = r() * W, sy = r() * H, s = .5 + r() * 1.6;
        x.globalAlpha = .35 + r() * .65; x.fillStyle = r() < .15 ? th.blobs[i % 3] : "#ffffff";
        x.fillRect(sx, sy, s, s);
      }
      x.globalAlpha = 1;
      const out = { c, W, H, th, galaxies: [0, 1, 2].map(i => ({ x: r(), y: .12 + r() * .45, s: .35 + r() * .5, turn: r() * 360, cols: [th.blobs[i % 3], th.blobs[(i + 1) % 3], "#ffffff"] })) };
      cache.set(key, out);
      return out;
    }
    function galaxyImg(cols, size) {
      const key = `g|${cols.join()}|${size}`;
      if (cache.has(key)) return cache.get(key);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-110 -110 220 220">${art.memories.galaxy(0, 0, 100, 0, cols)}</svg>`;
      const img = new Image(); img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      cache.set(key, img);
      return img;
    }

    function feature(ctx, kind, th, w, h, px, t) {
      ctx.save();
      if (kind === "rings") {
        const x = w * .72 - px * .08, y = h * .3, r = h * .14;
        ctx.translate(x, y); ctx.rotate(-.25);
        ctx.strokeStyle = th.blobs[2]; ctx.lineWidth = r * .1; ctx.globalAlpha = .7;
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(0, 0, r * (1.7 + i * .35), r * (.42 + i * .09), 0, Math.PI, Math.PI * 2); ctx.stroke(); }
        ctx.globalAlpha = 1; ctx.fillStyle = th.blobs[1]; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = th.blobs[0] + "88"; ctx.fillRect(-r, -r * .2, r * 2, r * .25);
        ctx.strokeStyle = th.blobs[2]; ctx.globalAlpha = .7;
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(0, 0, r * (1.7 + i * .35), r * (.42 + i * .09), 0, 0, Math.PI); ctx.stroke(); }
      } else if (kind === "moon") {
        const x = w * .78 - px * .08, y = h * .26, r = h * .11;
        const g = ctx.createRadialGradient(x, y, r * .2, x, y, r * 2.4); g.addColorStop(0, "#efffd0aa"); g.addColorStop(1, "#efffd000");
        ctx.fillStyle = g; ctx.fillRect(x - r * 2.4, y - r * 2.4, r * 4.8, r * 4.8);
        ctx.fillStyle = "#e6ffc2"; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#5cbf48"; ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x - r * .5 + i * r * .3, y + r * .7); ctx.quadraticCurveTo(x - r * .4 + i * r * .3, y, x - r * .1 + i * r * .3, y - r * .5); ctx.stroke(); }
      } else if (kind === "lamp" || kind === "sun") {
        const x = w * .74 - px * .06, y = h * (kind === "sun" ? .62 : .28), r = h * (kind === "sun" ? .2 : .1);
        const pulse = reduced ? 1 : 1 + Math.sin(t / 1400) * .04;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.4 * pulse); g.addColorStop(0, "#fff6c2ee"); g.addColorStop(.3, "#ffd43b88"); g.addColorStop(1, "#ffd43b00");
        ctx.fillStyle = g; ctx.fillRect(x - r * 3.6, y - r * 3.6, r * 7.2, r * 7.2);
        if (kind === "lamp") {
          ctx.fillStyle = "#fff6c2"; ctx.translate(x, y); ctx.beginPath();
          for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * .45 : r; ctx.lineTo(Math.cos(a - Math.PI / 2) * rr, Math.sin(a - Math.PI / 2) * rr); }
          ctx.closePath(); ctx.fill();
        }
      } else if (kind === "spiral") {
        const img = galaxyImg(th.blobs, 512), s = h * .95;
        ctx.translate(w * .62 - px * .05, h * .42); if (!reduced) ctx.rotate(t / 26000);
        ctx.globalAlpha = .85; if (img.complete) ctx.drawImage(img, -s / 2, -s / 2, s, s);
      }
      ctx.restore();
    }

    function drawShadow(ctx, sh, w, h, t) {
      const parts = art.nova.path2d(), k = (h * .68 / 64) * (sh.k || 1), x = w * (sh.x == null ? .5 : sh.x), base = h * .9;
      ctx.save(); ctx.translate(x, base); ctx.scale(-k, k); // faces left, toward the hero
      ctx.shadowColor = "rgba(255,62,200,.45)"; ctx.shadowBlur = 18;
      ctx.fillStyle = "#000"; for (const p of parts) ctx.fill(p);
      ctx.shadowBlur = 0; ctx.restore();
      if (sh.lantern) {
        const lx = x + w * .03, ly = base - h * .02, r = h * (.03 + (reduced ? 0 : Math.sin(t / 900) * .004));
        const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, r * 3); g.addColorStop(0, "#fff6c2"); g.addColorStop(.4, "#ffd43b99"); g.addColorStop(1, "#ffd43b00");
        ctx.fillStyle = g; ctx.fillRect(lx - r * 3, ly - r * 3, r * 6, r * 6);
      }
    }

    function glitch(ctx, v, opts) {
      if (reduced || opts.glitch === false) return;
      const now = v.t;
      if (now > gl.next) {
        gl.until = now + 90 + Math.random() * 60;
        gl.next = now + 1100 + Math.random() * 1800;
        gl.bands = Array.from({ length: 1 + Math.floor(Math.random() * 2) }, () => ({ y: Math.random() * v.h * .8, hgt: 6 + Math.random() * v.h * .06, dx: (Math.random() < .5 ? -1 : 1) * (4 + Math.random() * 10) }));
        gl.whisper = !!opts.whisper && Math.random() < .09;
      }
      if (now > gl.until) return;
      const d = v.dpr || 1, cv = ctx.canvas;
      for (const b of gl.bands) {
        try { ctx.drawImage(cv, 0, Math.round(b.y * d), cv.width, Math.max(1, Math.round(b.hgt * d)), b.dx, b.y, v.w, b.hgt); } catch (e) { /* ignore */ }
        ctx.fillStyle = b.dx > 0 ? "rgba(33,217,255,.08)" : "rgba(255,62,200,.08)"; ctx.fillRect(0, b.y, v.w, b.hgt);
      }
      if (gl.whisper) {
        ctx.save(); ctx.font = `400 ${Math.max(10, v.h * .022)}px "Press Start 2P", ui-monospace, monospace`; ctx.fillStyle = "rgba(255,246,194,.55)";
        ctx.textAlign = "center"; ctx.fillText("i'm only small", v.w * .5, gl.bands[0].y + gl.bands[0].hgt * .8); ctx.restore();
      }
    }

    function draw(ctx, v, opts = {}) {
      const th = opts.theme || "hub", sp = sprite(th, v.w, v.h), px = (v.camX || 0) * (v.T || 60);
      const off = ((px * .12) % sp.W + sp.W) % sp.W;
      ctx.drawImage(sp.c, -off, 0, sp.W, v.h);
      ctx.drawImage(sp.c, sp.W - off, 0, sp.W, v.h);
      for (const g of sp.galaxies) {
        const img = galaxyImg(g.cols, 256), s = v.h * .3 * g.s;
        let gx = (g.x * v.w * 1.4 - px * .05) % (v.w * 1.4); if (gx < -s) gx += v.w * 1.4;
        ctx.save(); ctx.translate(gx, g.y * v.h); if (!reduced) ctx.rotate(g.turn + v.t / 30000); ctx.globalAlpha = .7;
        if (img.complete) ctx.drawImage(img, -s / 2, -s / 2, s, s);
        ctx.restore();
      }
      if (sp.th.feature) feature(ctx, sp.th.feature, sp.th, v.w, v.h, px, v.t);
      if (opts.shadow) drawShadow(ctx, opts.shadow, v.w, v.h, v.t);
      glitch(ctx, v, opts);
    }
    return { draw };
  }

  art.nebula = { THEMES, create };
})(window.Kit = window.Kit || {});
