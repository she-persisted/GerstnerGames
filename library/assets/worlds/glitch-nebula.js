/**
 * @file assets/worlds/glitch-nebula.js
 * @about Canvas backgrounds for the Glitch Nebula, each world a neon take on a famous NASA space picture: the Cosmic Cliffs of the Carina Nebula (the crash pad), the Southern Ring Nebula (Echo Rings), the Pillars of Creation (Fern Moon), a blazing Wolf-Rayet star in its clumpy shell (Lantern Lab), the Whirlpool Galaxy and its little companion (Whirlpool Galaxy), and the Horsehead Nebula (the Shadow Gate), plus the Milky Way and the Andromeda Galaxy over Fern Valley at night, and a neon sunset for the Wave Rider bonus level. Every sky also gets glowing gas made from noise, dark dust lanes, stars with Webb-style eight-point spikes, tiny far-away galaxies like a deep field, and a mix of drifting galaxies (spirals, tilted spirals, and edge-on ones like the Sombrero). Gentle glitches nudge a stripe of the sky sideways now and then. Can also draw the giant black Shadowspine on the clouds, with an optional tiny lantern glow at its feet. Each world has its own colors for runs, too.
 * @provides Kit.art.nebula { THEMES, create() -> { draw(ctx, view, options) } }
 * @requires assets/characters/nova.js, assets/memories/memories.js
 *
 * view = { w, h, T (pixels per tile), camX, camY, t (ms), dpr }
 * options = { theme, shadow: { x (screen fraction 0 to 1), k (size, 1 = normal), lantern: true | false, jaw (degrees open), shake (0 to 1) } | null, whisper: true (rarely
 *             shows a tiny hidden message inside a glitch), glitch: false to turn glitches off,
 *             sky: a function (ctx, view) that draws things crossing the far sky, in front of the landmark and behind the shadow (like Kit.skyEvents) }
 * Each theme: sky (top and bottom colors), blobs (three glow colors), scene (how its gas is shaped), land (its big landmark),
 * plus the colors runs use (edge, block, spike, pad, piece, spark, portals). Skies and landmarks are painted once and reused,
 * so drawing a frame is just a few pictures. The sky strip repeats seamlessly as the camera moves: every noise layer uses a whole number of
 * repeats across the strip, so its two ends always match.
 * Gentle on purpose: glitches happen at most about once a second, last a tenth of a second, and only shift a thin stripe.
 * Nothing flashes more than three times a second. With "reduce motion" turned on there are no glitches and nothing spins.
 * Inspired by NASA, ESA, CSA, and STScI pictures from the Hubble and Webb space telescopes; everything here is drawn by code.
 */
(function (Kit) {
  "use strict";
  const art = Kit.art = Kit.art || {};
  const THEMES = {
    hub:     { sky: ["#0b0526", "#2c0d62"], blobs: ["#ff3ec8", "#7b3dff", "#21d9ff"], scene: "cliffs",  land: "",          edge: "#3ef2ff", block: "#160a3a", spike: "#ff3ec8", spikeEdge: "#ffd1f3", pad: "#ffe94a", piece: "#5cffb0", spark: "#ff3ec8", shipPortal: "#ff3ec8", cubePortal: "#5cffb0" },
    echo:    { sky: ["#03102c", "#0d3a72"], blobs: ["#21d9ff", "#3b6bff", "#ff6be0"], scene: "clouds",  land: "ring",      edge: "#21d9ff", block: "#06183a", spike: "#ff4fd8", spikeEdge: "#ffd1f3", pad: "#ffe94a", piece: "#b8ff3b", spark: "#21d9ff", shipPortal: "#ff4fd8", cubePortal: "#b8ff3b" },
    fern:    { sky: ["#03140f", "#0e4a3a"], blobs: ["#5cff8a", "#21d9ff", "#b8ff3b"], scene: "clouds",  land: "pillars",   edge: "#8cff3b", block: "#082418", spike: "#ff9b45", spikeEdge: "#ffe2c2", pad: "#ffe94a", piece: "#ff6be0", spark: "#8cff3b", shipPortal: "#ff6be0", cubePortal: "#ffe94a" },
    lantern: { sky: ["#1a0826", "#5c2a12"], blobs: ["#ffc21a", "#ff6b3d", "#ff3ec8"], scene: "clouds",  land: "star",      edge: "#ffd43b", block: "#200a24", spike: "#ff3ec8", spikeEdge: "#ffd1f3", pad: "#5cffb0", piece: "#21d9ff", spark: "#ffd43b", shipPortal: "#21d9ff", cubePortal: "#5cffb0" },
    whirl:   { sky: ["#12052e", "#4c0f60"], blobs: ["#ff6be0", "#9b6bff", "#ffe94a"], scene: "clouds",  land: "whirlpool", edge: "#ff6be0", block: "#1a0838", spike: "#21d9ff", spikeEdge: "#d6fcff", pad: "#ffe94a", piece: "#5cffb0", spark: "#ff6be0", shipPortal: "#21d9ff", cubePortal: "#ffe94a" },
    shadow:  { sky: ["#05020f", "#2c0838"], blobs: ["#ff2e7a", "#5a1fff", "#ff8a5c"], scene: "streaks", land: "horsehead", edge: "#ff2e7a", block: "#0a0418", spike: "#ffe94a", spikeEdge: "#fff6c2", pad: "#5cffb0", piece: "#21d9ff", spark: "#ff2e7a", shipPortal: "#21d9ff", cubePortal: "#5cffb0" },
    night:   { sky: ["#070420", "#26145e"], blobs: ["#9b6bff", "#21d9ff", "#ff6be0"], scene: "milkyway", land: "andromeda", edge: "#8cff3b", block: "#0b1a2e", spike: "#ff3ec8", spikeEdge: "#ffd1f3", pad: "#ffe94a", piece: "#5cffb0", spark: "#9b6bff", shipPortal: "#ff3ec8", cubePortal: "#5cffb0" },
    surf:    { sky: ["#120840", "#ff5f9e"], blobs: ["#21d9ff", "#ff6be0", "#ffe94a"], scene: "dawn",    land: "sun",       edge: "#3ef2ff", block: "#1a0a48", spike: "#ff3ec8", spikeEdge: "#ffd1f3", pad: "#ffe94a", piece: "#5cffb0", spark: "#ff6be0", shipPortal: "#ff3ec8", cubePortal: "#5cffb0" },
    valley:  { sky: ["#2a1470", "#ff9ab8"], blobs: ["#ffc21a", "#ff6be0", "#9b6bff"], scene: "dawn",    land: "sun",       edge: "#8cff3b", block: "#1d5a36", spike: "#ff3ec8", spikeEdge: "#ffd1f3", pad: "#ffe94a", piece: "#5cffb0", spark: "#ffe94a", shipPortal: "#ff3ec8", cubePortal: "#5cffb0" }
  };

  /* ---------- Noise: smooth random clouds that repeat across the sky strip ---------- */
  function rng(seed) { return () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }; }
  function noiseMaker(seed) {
    const R = rng(seed), N = 256, tab = new Float32Array(N * N);
    for (let i = 0; i < tab.length; i++) tab[i] = R();
    const val = (ix, iy, P) => tab[(((ix % P) + P) % P) + (((iy % N) + N) % N) * N];
    const sm = t => t * t * (3 - 2 * t);
    function noise(x, y, P) {
      const xi = Math.floor(x), yi = Math.floor(y), u = sm(x - xi), v = sm(y - yi);
      const a = val(xi, yi, P), b = val(xi + 1, yi, P), c = val(xi, yi + 1, P), d = val(xi + 1, yi + 1, P);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    }
    // P = how many cells across before it repeats (keep P x 2^octaves at or under 256)
    function fbm(x, y, P, oct = 5) { let s = 0, amp = .5, f = 1, n = 0; for (let i = 0; i < oct; i++) { s += amp * noise(x * f, y * f, P * f); n += amp; amp *= .5; f *= 2; } return s / n; }
    function ridged(x, y, P, oct = 4) { let s = 0, amp = .5, f = 1, n = 0; for (let i = 0; i < oct; i++) { const r = 1 - Math.abs(noise(x * f, y * f, P * f) * 2 - 1); s += amp * r * r; n += amp; amp *= .5; f *= 2; } return s / n; }
    return { noise, fbm, ridged };
  }
  const rgb = hex => { const n = parseInt(hex.slice(1, 7), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  // A bright star with Webb's eight-point spikes (six long ones and two short ones across).
  function spikeStar(x, cx, cy, size, color, long = 7) {
    x.save(); x.globalCompositeOperation = "lighter";
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, size * 1.6);
    g.addColorStop(0, "#ffffff"); g.addColorStop(.22, color + "cc"); g.addColorStop(1, color + "00");
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, size * 1.6, 0, Math.PI * 2); x.fill();
    for (const [deg, k] of [[30, 1], [90, 1], [150, 1], [210, 1], [270, 1], [330, 1], [0, .45], [180, .45]]) {
      const a = deg * Math.PI / 180, L = size * long * k, ex = cx + Math.cos(a) * L, ey = cy + Math.sin(a) * L, wd = size * .2;
      const gr = x.createLinearGradient(cx, cy, ex, ey);
      gr.addColorStop(0, "#ffffffee"); gr.addColorStop(.25, color + "99"); gr.addColorStop(1, color + "00");
      x.fillStyle = gr; x.beginPath();
      x.moveTo(cx + Math.cos(a + Math.PI / 2) * wd, cy + Math.sin(a + Math.PI / 2) * wd); x.lineTo(ex, ey);
      x.lineTo(cx + Math.cos(a - Math.PI / 2) * wd, cy + Math.sin(a - Math.PI / 2) * wd); x.closePath(); x.fill();
    }
    x.restore();
  }
  // A tiny far-away galaxy, like the smudges in Webb's deep field pictures.
  function tinyGalaxy(x, cx, cy, s, color, ang) {
    x.save(); x.translate(cx, cy); x.rotate(ang); x.scale(1, .45 + (s % 1) * .4);
    const g = x.createRadialGradient(0, 0, 0, 0, 0, s);
    g.addColorStop(0, "#fff6e0"); g.addColorStop(.3, color + "aa"); g.addColorStop(1, color + "00");
    x.globalCompositeOperation = "lighter"; x.fillStyle = g; x.beginPath(); x.arc(0, 0, s, 0, Math.PI * 2); x.fill();
    x.restore();
  }

  /* ---------- Sky strips: glowing gas, dust, stars, all painted once per theme and size ---------- */
  function paintGas(th, W, H, seed) {
    const tw = Math.max(160, Math.round(W / 3.5)), tH = Math.max(80, Math.round(H / 3.5));
    const c = document.createElement("canvas"); c.width = tw; c.height = tH;
    const g = c.getContext("2d"), img = g.createImageData(tw, tH), d = img.data;
    const N = noiseMaker(seed), P = 6, s0 = rgb(th.sky[0]), s1 = rgb(th.sky[1]);
    const [A, B, C] = th.blobs.map(rgb), sc = th.scene;
    const ridgeY = new Float32Array(tw);
    for (let i = 0; i < tw; i++) {
      const X = i / tw * P;
      ridgeY[i] = sc === "cliffs" ? .6 + .78 * (N.fbm(X * 7 / 6, 3.3, 7, 5) - .5) - .07 * N.ridged(X * 3, 1.7, P, 3)
        : sc === "streaks" ? .8 + .16 * (N.fbm(X * 5 / 3, 9.1, 10, 4) - .5) : 2;
    }
    let k = 0;
    for (let j = 0; j < tH; j++) {
      const vy = j / tH;
      for (let i = 0; i < tw; i++, k += 4) {
        const X = i / tw * P, Y = j / tw * P;
        let r = s0[0] + (s1[0] - s0[0]) * vy, gg = s0[1] + (s1[1] - s0[1]) * vy, b = s0[2] + (s1[2] - s0[2]) * vy;
        const cl = N.fbm(X, Y, P), wi = N.ridged(X * 5 / 3 + 5, Y * 5 / 3 + 2, 10), du = N.fbm(X * 4 / 3 + 20, Y * 4 / 3 + 7, 8, 4);
        let glowA = sstep(.42, .82, cl), glowB = Math.pow(wi, 3) * sstep(.3, .7, cl + .2), dark = sstep(.55, .78, du);
        let kA = .55, kB = .45, kC = .5;
        if (sc === "milkyway") { // a band of stars and glow with a dark dust lane down the middle
          const yb = .4 + .07 * Math.sin(X / P * Math.PI * 2), band = Math.exp(-Math.pow((vy - yb) / .13, 2)), lane = Math.exp(-Math.pow((vy - yb - .01) / .035, 2));
          glowA *= .35 + band; glowB *= band; dark = Math.max(dark * .4, lane * sstep(.35, .6, du)); kA = .3; kB = .25;
          r += 120 * band * cl; gg += 110 * band * cl; b += 140 * band * cl;
        } else if (sc === "dawn") { glowA *= .5; glowB *= .3; dark *= .3; }
        else if (sc === "streaks") { // glowing gas in long up-and-down streaks, like the cloud behind the Horsehead
          const st = N.fbm(X * 4, Y * .55 + 3, P, 4); glowA = sstep(.3, .9, st * .55 + cl * .45) * (1 - vy * .35); glowB *= .6; kA = .7;
        }
        r += A[0] * glowA * kA + B[0] * glowB * kB + C[0] * glowA * glowB * kC;
        gg += A[1] * glowA * kA + B[1] * glowB * kB + C[1] * glowA * glowB * kC;
        b += A[2] * glowA * kA + B[2] * glowB * kB + C[2] * glowA * glowB * kC;
        const dk = 1 - .6 * dark; r *= dk; gg *= dk; b *= dk;
        if (sc === "cliffs" || sc === "streaks") { // a cliff of thick dust along the bottom with a glowing rim and steam rising off it
          const yr = ridgeY[i], below = vy - yr;
          if (below > 0) {
            const tex = .5 + .5 * N.fbm(X * 3 + 9, Y * 3, P, 4), rim = Math.exp(-below / .022);
            const lit = sc === "cliffs" ? Math.pow(N.ridged(X * 4 + 2, Y * 4, P, 3), 3) * Math.exp(-below / .14) : 0;
            const base = sc === "cliffs" ? [58, 12, 78] : [6, 2, 12], hot = sc === "cliffs" ? A : B;
            r = base[0] * tex + hot[0] * rim * .9 + 255 * lit * .55; gg = base[1] * tex + hot[1] * rim * .9 + 150 * lit * .55; b = base[2] * tex + hot[2] * rim * .9 + 90 * lit * .55;
          } else if (sc === "cliffs") {
            const mist = N.ridged(X * 13 / 6 + 1, Y * 1.1 - vy * 2, 13) * Math.exp(below / .16);
            r += C[0] * mist * .55 + 255 * mist * .12; gg += C[1] * mist * .55 + 255 * mist * .12; b += C[2] * mist * .55 + 255 * mist * .12;
          }
        }
        d[k] = Math.min(255, r); d[k + 1] = Math.min(255, gg); d[k + 2] = Math.min(255, b); d[k + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  // Where a landmark's center goes as the camera moves: it slides by slowly and comes back around.
  const wrapX = (x, w, size) => { const span = w + size * 2; return ((x + size) % span + span) % span - size; };

  function create() {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cache = new Map();
    let gl = { until: 0, next: 0, bands: [], whisper: false };

    function sprite(theme, w, h) {
      const key = `${theme}|${Math.round(w)}|${Math.round(h)}`;
      if (cache.has(key)) return cache.get(key);
      const th = THEMES[theme] || THEMES.hub, W = Math.max(600, Math.round(w * 1.6)), H = Math.max(300, Math.round(h));
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const x = c.getContext("2d"), seed = [...theme].reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7) % 9973, r = rng(seed + 13);
      x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high";
      x.drawImage(paintGas(th, W, H, seed), 0, 0, W, H);
      const wrap = (fn, px, pad) => { fn(px); if (px < pad) fn(px + W); if (px > W - pad) fn(px - W); };
      // deep field: lots of tiny galaxies far away
      for (let i = 0; i < 46; i++) { const gx = r() * W, gy = r() * H * .8, s = 2 + r() * 5, col = r() < .5 ? "#ffb35c" : th.blobs[i % 3], a = r() * Math.PI; wrap(px => tinyGalaxy(x, px, gy, s, col, a), gx, 12); }
      // stars (more of them along the Milky Way at night)
      const many = th.scene === "milkyway" ? 620 : 260;
      for (let i = 0; i < many; i++) {
        let sx = r() * W, sy = r() * H;
        if (th.scene === "milkyway" && i % 3) sy = H * (.4 + .07 * Math.sin(sx / W * Math.PI * 2) + (r() + r() + r() - 1.5) * .14);
        const s = .5 + r() * 1.5; x.globalAlpha = .35 + r() * .65; x.fillStyle = r() < .18 ? th.blobs[i % 3] : "#ffffff"; x.fillRect(sx, sy, s, s);
      }
      x.globalAlpha = 1;
      // a few big bright stars with Webb's spikes
      for (let i = 0; i < 7; i++) { const sx = r() * W, sy = r() * H * .7, s = 1.6 + r() * 2.6, col = r() < .5 ? "#ffffff" : th.blobs[i % 3]; wrap(px => spikeStar(x, px, sy, s, col), sx, 40); }
      // drifting galaxies: a mix of face-on spirals, tilted spirals, and edge-on ones
      const kinds = ["spiral", "tilt", "edge"];
      const out = { c, W, H, th, galaxies: [0, 1, 2].map(i => ({ kind: kinds[(i + seed) % 3], x: r(), y: .1 + r() * .45, s: .3 + r() * .45, turn: r() * 360, cols: [th.blobs[i % 3], th.blobs[(i + 1) % 3], "#ffffff"] })) };
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
    // An edge-on galaxy with a bright middle and a dark dust lane, like the Sombrero Galaxy.
    function edgeOn(ctx, s, cols) {
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      let g = ctx.createRadialGradient(0, 0, 0, 0, 0, s); g.addColorStop(0, "#fff6e0"); g.addColorStop(.25, cols[0] + "aa"); g.addColorStop(1, cols[1] + "00");
      ctx.save(); ctx.scale(1, .22); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      g = ctx.createRadialGradient(0, 0, 0, 0, 0, s * .32); g.addColorStop(0, "#ffffff"); g.addColorStop(.5, "#ffe9a8aa"); g.addColorStop(1, "#ffe9a800");
      ctx.fillStyle = g; ctx.save(); ctx.scale(1, .7); ctx.beginPath(); ctx.arc(0, 0, s * .32, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.restore();
      ctx.save(); ctx.globalAlpha = .55; ctx.fillStyle = "#0a0418"; ctx.beginPath(); ctx.ellipse(0, s * .015, s * .85, s * .035, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }

    /* ---------- Landmarks: one big thing in each world's sky, painted once and reused ---------- */
    function landmark(kind, th, h) {
      const key = `L|${kind}|${Math.round(h)}`;
      if (cache.has(key)) return cache.get(key);
      const R = rng(kind.length * 131 + 7), N = noiseMaker(kind.length * 17 + 3);
      let c = null;
      const canvas = (w, hh) => { c = document.createElement("canvas"); c.width = Math.max(2, Math.round(w)); c.height = Math.max(2, Math.round(hh)); return c.getContext("2d"); };
      if (kind === "ring") { // the Southern Ring Nebula: glowing shells around a pair of stars
        const S = h * .78, x = canvas(S, S), cx = S / 2, cy = S / 2, R0 = S * .44;
        x.globalCompositeOperation = "lighter"; x.translate(cx, cy); x.scale(1, .84);
        let g = x.createRadialGradient(0, 0, R0 * .2, 0, 0, R0 * 1.12); g.addColorStop(0, "#21d9ff22"); g.addColorStop(.75, th.blobs[2] + "30"); g.addColorStop(1, th.blobs[2] + "00");
        x.fillStyle = g; x.beginPath(); x.arc(0, 0, R0 * 1.12, 0, Math.PI * 2); x.fill();
        for (let k = 0; k < 64; k++) {
          const f = k / 63, rr = R0 * (.3 + .7 * f), col = f > .62 ? th.blobs[2] : f > .4 ? "#9bf6ff" : th.blobs[0];
          x.strokeStyle = col; x.globalAlpha = .07 + .09 * Math.sin(f * Math.PI); x.lineWidth = S * (.004 + .006 * R()); x.beginPath();
          for (let i = 0; i <= 90; i++) { const a = i / 90 * Math.PI * 2, wob = 1 + .07 * (N.noise(i / 90 * 8, k * .37, 8) - .5) * 2; x.lineTo(Math.cos(a) * rr * wob, Math.sin(a) * rr * wob); }
          x.closePath(); x.stroke();
        }
        x.globalAlpha = .07; x.strokeStyle = "#d6fcff"; x.lineWidth = 1.2;
        for (let i = 0; i < 140; i++) { const a = R() * Math.PI * 2, r0 = R0 * (.3 + R() * .2), r1 = r0 + R0 * (.2 + R() * .45); x.beginPath(); x.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); x.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); x.stroke(); }
        x.globalAlpha = 1;
        g = x.createRadialGradient(0, 0, 0, 0, 0, R0 * .34); g.addColorStop(0, "#d6fcffaa"); g.addColorStop(1, "#3b6bff00");
        x.fillStyle = g; x.beginPath(); x.arc(0, 0, R0 * .34, 0, Math.PI * 2); x.fill();
        x.setTransform(1, 0, 0, 1, 0, 0);
        spikeStar(x, cx, cy, S * .012, "#ffffff", 9); spikeStar(x, cx + S * .03, cy - S * .01, S * .006, "#ffb35c", 5);
      } else if (kind === "pillars") { // the Pillars of Creation, in glowing fern green
        const Wl = h * .9, Hl = h * .95, x = canvas(Wl, Hl), lw = Math.round(Wl / 2.5), lh = Math.round(Hl / 2.5);
        const lc = document.createElement("canvas"); lc.width = lw; lc.height = lh;
        const lx = lc.getContext("2d"), img = lx.createImageData(lw, lh), d = img.data;
        const pil = [{ x: .27, top: .14, w: .13, lean: .06 }, { x: .57, top: .38, w: .095, lean: -.03 }, { x: .82, top: .55, w: .075, lean: .02 }];
        const rim = rgb(th.blobs[2]), rim2 = rgb(th.blobs[1]);
        for (let j = 0, k = 0; j < lh; j++) for (let i = 0; i < lw; i++, k += 4) {
          const u = i / lw, v = j / lh;
          let best = 9, side = 0, tip = 0;
          for (const p of pil) {
            if (v < p.top - p.w * 1.6) continue;
            const cx = p.x + p.lean * (1 - v) + .025 * (N.fbm(v * 5, p.x * 9, 8, 3) - .5);
            const hw = p.w * (.75 + .6 * Math.max(0, v - p.top) / (1 - p.top)) * (.85 + .3 * N.fbm(v * 9, p.x * 5 + 2, 16, 3));
            const dx = (u - cx) / hw, dy = v < p.top ? (p.top - v) / (hw * 1.1) : 0;
            const dist = Math.sqrt(dx * dx + dy * dy) + .4 * (N.fbm(u * 14, v * 14, 32, 4) - .5);
            if (dist < best) { best = dist; side = dx; tip = v < p.top + .06 ? 1 : 0; }
          }
          const dens = sstep(1.08, .78, best), edge = Math.exp(-Math.pow(best - .9, 2) / .018) * (1.1 - side * .45) * (1 + tip * .9);
          const tex = .45 + .55 * N.fbm(u * 10 + 3, v * 10, 32, 4), streak = Math.pow(N.ridged(u * 18, v * 6, 32, 3), 4) * dens * (1.4 - v);
          const a = Math.min(1, Math.max(dens, edge * .85));
          d[k] = Math.min(255, 14 * tex + rim[0] * (edge * .8 + streak * .35) + rim2[0] * edge * .2);
          d[k + 1] = Math.min(255, 46 * tex + rim[1] * (edge * .8 + streak * .35) + rim2[1] * edge * .2);
          d[k + 2] = Math.min(255, 34 * tex + rim[2] * (edge * .8 + streak * .35) + rim2[2] * edge * .2);
          d[k + 3] = Math.round(a * 255 * sstep(1.02, .86, v * .25 + .75));
        }
        lx.putImageData(img, 0, 0);
        x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high"; x.drawImage(lc, 0, 0, Wl, Hl);
        x.globalCompositeOperation = "lighter";
        for (const p of pil) for (let i = 0; i < 6; i++) { const tx = (p.x + p.lean * (1 - p.top) + (R() - .5) * p.w) * Wl, ty = (p.top - p.w * (.6 + R() * 1.4)) * Hl; const g = x.createRadialGradient(tx, ty, 0, tx, ty, Wl * .02); g.addColorStop(0, "#efffd0aa"); g.addColorStop(1, "#b8ff3b00"); x.fillStyle = g; x.fillRect(tx - Wl * .02, ty - Wl * .02, Wl * .04, Wl * .04); }
      } else if (kind === "star") { // a blazing Wolf-Rayet star inside its clumpy shell, casting long shadow rays
        const S = h * .8, x = canvas(S, S), cx = S / 2, cy = S / 2;
        x.globalCompositeOperation = "lighter";
        const cols = ["#ff6be0", "#ff9b45", "#ffd43b", "#9b6bff"];
        for (let i = 0; i < 190; i++) {
          const a = R() * Math.PI * 2, rr = S * (.13 + .26 * Math.pow(R(), .7)), bs = S * (.012 + .04 * R()), bx = cx + Math.cos(a) * rr, by = cy + Math.sin(a) * rr * .9;
          const g = x.createRadialGradient(bx, by, 0, bx, by, bs); g.addColorStop(0, cols[i % 4] + "88"); g.addColorStop(1, cols[i % 4] + "00");
          x.fillStyle = g; x.fillRect(bx - bs, by - bs, bs * 2, bs * 2);
        }
        x.globalCompositeOperation = "source-over"; x.fillStyle = "#1a0826";
        for (let i = 0; i < 9; i++) { // long, stretchy shadows streaming away from the clumps
          const a = R() * Math.PI * 2, wa = .025 + R() * .03, r0 = S * (.16 + R() * .12);
          x.globalAlpha = .22; x.beginPath(); x.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
          x.lineTo(cx + Math.cos(a - wa) * S * .7, cy + Math.sin(a - wa) * S * .7); x.lineTo(cx + Math.cos(a + wa) * S * .7, cy + Math.sin(a + wa) * S * .7); x.closePath(); x.fill();
        }
        x.globalAlpha = 1; x.globalCompositeOperation = "lighter";
        const g = x.createRadialGradient(cx, cy, 0, cx, cy, S * .17); g.addColorStop(0, "#fff6c2"); g.addColorStop(.35, "#ffd43b88"); g.addColorStop(1, "#ffd43b00");
        x.fillStyle = g; x.beginPath(); x.arc(cx, cy, S * .17, 0, Math.PI * 2); x.fill();
        spikeStar(x, cx, cy, S * .03, "#ffe9a8", 16);
      } else if (kind === "horsehead") { // a dark nebula shaped like a horse's head, glowing at the edges
        const Wl = h * .66, Hl = h * .86, x = canvas(Wl, Hl);
        const P = (pts) => pts.map(([a, b]) => `${(a * Wl).toFixed(1)} ${(b * Hl).toFixed(1)}`).join(" ");
        const pth = new Path2D(`M${P([[0, 1]])} C${P([[.05, .9], [.15, .86], [.3, .84]])} C${P([[.4, .82], [.45, .74], [.43, .64]])}
          C${P([[.41, .58], [.34, .56], [.26, .56]])} C${P([[.18, .56], [.1, .55], [.07, .5]])} C${P([[.03, .46], [.02, .4], [.07, .36]])}
          C${P([[.12, .31], [.2, .23], [.28, .16]])} C${P([[.31, .12], [.33, .05], [.36, .02]])} C${P([[.38, .06], [.4, .1], [.44, .12]])}
          C${P([[.52, .14], [.58, .2], [.6, .28]])} C${P([[.63, .36], [.59, .44], [.63, .52]])} C${P([[.66, .6], [.7, .7], [.78, .76]])}
          C${P([[.88, .82], [.96, .9], [1, 1]])} Z`);
        x.save(); x.shadowColor = th.blobs[0]; x.shadowBlur = h * .05; x.fillStyle = "#07020c"; x.fill(pth); x.restore();
        x.save(); x.globalCompositeOperation = "lighter"; x.strokeStyle = th.blobs[2]; x.globalAlpha = .55; x.lineWidth = 2; x.stroke(pth); x.restore();
        x.save(); x.clip(pth); x.globalAlpha = .18; x.fillStyle = "#2c0838";
        for (let i = 0; i < 30; i++) { x.beginPath(); x.ellipse(R() * Wl, Hl * (.2 + R() * .8), Wl * (.03 + R() * .08), Hl * (.01 + R() * .03), R() * 3, 0, Math.PI * 2); x.fill(); }
        x.restore();
      } else if (kind === "andromeda") { // the Andromeda Galaxy: a big tilted spiral with two little companions
        const Wl = h * .9, Hl = h * .4, x = canvas(Wl, Hl), cx = Wl / 2, cy = Hl / 2;
        x.globalCompositeOperation = "lighter"; x.translate(cx, cy); x.rotate(-.32);
        for (let i = 0; i < 6; i++) { const rr = Wl * (.46 - i * .07); const g = x.createRadialGradient(0, 0, 0, 0, 0, rr); g.addColorStop(0, "#fff6e0" + (i ? "33" : "aa")); g.addColorStop(.5, th.blobs[i % 3] + "22"); g.addColorStop(1, th.blobs[i % 3] + "00"); x.save(); x.scale(1, .26); x.fillStyle = g; x.beginPath(); x.arc(0, 0, rr, 0, Math.PI * 2); x.fill(); x.restore(); }
        x.globalCompositeOperation = "source-over"; x.strokeStyle = "#070420"; x.globalAlpha = .4; x.lineWidth = Hl * .02;
        for (const k of [.3, .38]) { x.beginPath(); x.ellipse(0, Hl * .02, Wl * k, Wl * k * .2, 0, Math.PI * 1.05, Math.PI * 1.95); x.stroke(); }
        x.globalAlpha = 1; x.setTransform(1, 0, 0, 1, 0, 0);
        tinyGalaxy(x, cx + Wl * .1, cy - Hl * .22, Hl * .08, "#fff6e0", 0); tinyGalaxy(x, cx - Wl * .14, cy + Hl * .3, Hl * .1, "#ffe9a8", .6);
      }
      else if (kind === "moon") { // a crescent moon with a soft glow
        const r = h * .065, S = r * 5, x = canvas(S, S), cx = S / 2, cy = S / 2;
        x.fillStyle = "#fff3b0"; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
        x.globalCompositeOperation = "destination-out"; x.beginPath(); x.arc(cx + r * .5, cy - r * .25, r * .88, 0, Math.PI * 2); x.fill();
        const g = x.createRadialGradient(cx, cy, r * .5, cx, cy, S / 2); g.addColorStop(0, "#fff3b040"); g.addColorStop(1, "#fff3b000");
        x.globalCompositeOperation = "destination-over"; x.fillStyle = g; x.fillRect(0, 0, S, S);
      }
      cache.set(key, c);
      return c;
    }

    function feature(ctx, kind, th, w, h, px, t) {
      if (!kind) return;
      ctx.save();
      if (kind === "sun") {
        const x = wrapX(w * .74 - px * .06, w, h * .5), y = h * .62, r = h * .2, pulse = reduced ? 1 : 1 + Math.sin(t / 1400) * .04;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.4 * pulse); g.addColorStop(0, "#fff6c2ee"); g.addColorStop(.3, "#ffd43b88"); g.addColorStop(1, "#ffd43b00");
        ctx.fillStyle = g; ctx.fillRect(x - r * 3.6, y - r * 3.6, r * 7.2, r * 7.2);
      } else if (kind === "whirlpool") { // the Whirlpool Galaxy and its little companion galaxy at the end of one arm
        const img = galaxyImg(th.blobs, 512), s = h * .95;
        ctx.translate(wrapX(w * .62 - px * .05, w, s * .6), h * .42); if (!reduced) ctx.rotate(t / 26000);
        ctx.globalAlpha = .9; if (img.complete) ctx.drawImage(img, -s / 2, -s / 2, s, s);
        const a = 4.6, cxp = Math.cos(a) * s * .455, cyp = Math.sin(a) * s * .455 * .72, rr = s * .085;
        const g = ctx.createRadialGradient(cxp, cyp, 0, cxp, cyp, rr * 2.2); g.addColorStop(0, "#fffbe8"); g.addColorStop(.3, "#ffe9a8bb"); g.addColorStop(1, "#ffd43b00");
        ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cxp, cyp, rr * 2.2, 0, Math.PI * 2); ctx.fill();
      } else {
        const L = landmark(kind, th, h);
        const pos = { ring: [.7, .32, .08], pillars: [.6, 1.0, .05], star: [.72, .3, .06], horsehead: [.26, .98, .04], andromeda: [.68, .2, .05] }[kind] || [.7, .3, .06];
        const x = wrapX(w * pos[0] - px * pos[2], w, L.width * .6), cx = x - L.width / 2;
        const cy = kind === "pillars" || kind === "horsehead" ? h * pos[1] - L.height : h * pos[1] - L.height / 2;
        if (kind === "star" && !reduced) { ctx.globalAlpha = .92 + Math.sin(t / 1400) * .08; }
        ctx.drawImage(L, cx, cy);
        if (kind === "pillars") { // the fern moon still rises over the pillars
          const mx = wrapX(w * .86 - px * .08, w, h * .2), my = h * .2, r = h * .07;
          const g = ctx.createRadialGradient(mx, my, r * .2, mx, my, r * 2.4); g.addColorStop(0, "#efffd0aa"); g.addColorStop(1, "#efffd000");
          ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(mx - r * 2.4, my - r * 2.4, r * 4.8, r * 4.8);
          ctx.fillStyle = "#e6ffc2"; ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "#5cbf48"; ctx.lineWidth = 2.5;
          for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(mx - r * .5 + i * r * .3, my + r * .7); ctx.quadraticCurveTo(mx - r * .4 + i * r * .3, my, mx - r * .1 + i * r * .3, my - r * .5); ctx.stroke(); }
        }
        if (kind === "andromeda") { // and a crescent moon over Fern Valley
          const M = landmark("moon", th, h), mx = wrapX(w * .14 - px * .07, w, h * .2), my = h * .18;
          ctx.globalAlpha = 1; ctx.drawImage(M, mx - M.width / 2, my - M.height / 2);
        }
      }
      ctx.restore();
    }

    // Shadowspine: Nova's one-piece outline, huge and black. He breathes, sways a little, shakes when he laughs,
    // and his jaw moves (sh.jaw in degrees, sh.shake 0 to 1 while laughing).
    function drawShadow(ctx, sh, w, h, t) {
      const P = art.nova.path2d(), [hx, hy] = art.nova.HINGE, k = (h * .68 / 64) * (sh.k || 1), x = w * (sh.x == null ? .5 : sh.x), base = h * .9;
      const breathe = reduced ? 0 : Math.sin(t / 650) * .014, sway = reduced ? 0 : Math.sin(t / 1700) * .014;
      const shake = reduced ? 0 : (sh.shake || 0) * Math.sin(t / 38) * 1.1;
      ctx.save(); ctx.translate(x, base); ctx.rotate(sway); ctx.scale(-k, k * (1 + breathe)); ctx.translate(0, shake); // faces left, toward the hero
      ctx.shadowColor = "rgba(255,62,200,.45)"; ctx.shadowBlur = 18;
      ctx.fillStyle = "#000"; ctx.fill(P.body); ctx.fill(P.arm);
      ctx.translate(hx, hy); ctx.rotate((sh.jaw == null ? 6 : sh.jaw) * Math.PI / 180); ctx.translate(-hx, -hy); ctx.fill(P.jaw);
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
        const s = v.h * .3 * g.s;
        let gx = (g.x * v.w * 1.4 - px * .05) % (v.w * 1.4); if (gx < -s) gx += v.w * 1.4;
        ctx.save(); ctx.translate(gx, g.y * v.h); ctx.globalAlpha = .7;
        if (g.kind === "edge") { ctx.rotate(g.turn * Math.PI / 180); edgeOn(ctx, s * .55, g.cols); }
        else {
          const img = galaxyImg(g.cols, 256);
          ctx.rotate(g.turn * Math.PI / 180); if (g.kind === "tilt") ctx.scale(1, .42);
          if (!reduced) ctx.rotate(v.t / 30000);
          if (img.complete) ctx.drawImage(img, -s / 2, -s / 2, s, s);
        }
        ctx.restore();
      }
      feature(ctx, sp.th.land, sp.th, v.w, v.h, px, v.t);
      if (opts.sky) opts.sky(ctx, v);
      if (opts.shadow) drawShadow(ctx, opts.shadow, v.w, v.h, v.t);
      glitch(ctx, v, opts);
    }
    return { draw };
  }

  art.nebula = { THEMES, create };
})(window.Kit = window.Kit || {});
