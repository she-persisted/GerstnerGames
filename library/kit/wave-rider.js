/**
 * @file kit/wave-rider.js
 * @about A ride over rolling neon hills, like sledding on waves: the hero slides along a wavy floor by himself. Holding the button makes him heavy, so he sticks to the hills and dives down the slopes to pick up speed; letting go makes him light, so a fast climb launches him off the top of a wave. Landing along a downhill slope is a smooth landing and keeps his speed (smooth landings in a row make a combo); landing nose-first into an uphill is a bonk that slows him down. Stars float along the best flying path, big air and smooth landings score bonus points, and the ride lasts a set time. There is nothing to crash into. A built-in rider plans the stars so every one can be caught, and the physics runs in fixed steps, so a list of presses always replays the same way.
 * @provides Kit.waveRider { sim: { DT, PHYS, hills(options), ground(hills, x), start(hills), step(state, hold, hills), coach(state, hills), clone(state) }, plan(options), play(canvas, options) -> { stop, pause(on), state } }
 * @requires kit/util.js, kit/audio.js
 *
 * Units are tiles and seconds, and y goes up. The physics runs in fixed 1/120 s steps.
 * hills({ rng, level, length }) -> the floor: a row of hilltops and valleys joined by smooth curves (a cosine between each
 *   top and the valley after it), starting with a flat stretch on a hilltop. level 1 to 3 makes the hills taller and closer
 *   together, and they grow a little the farther he goes. ground(hills, x) -> { y, s (slope), c (how it curves) }.
 * step(state, hold, hills): on the floor, the slope speeds him up going down and slows him going up (holding pulls harder
 *   both ways); he leaves the floor where it curves away faster than he can be pulled along it (over a hilltop, going fast,
 *   not holding). In the air he falls (faster while holding). state.ev is set on a takeoff or a landing:
 *   { kind: takeoff | smooth | land | bonk, air (seconds up), height (tiles above the floor at the top), combo }.
 * coach(state, hills) -> the press a good rider would make now: hold on the way down, let go on the way up, and in the air
 *   hold or not, whichever lands closer to the slope's angle.
 * plan({ rng, level, secs }) -> { hills, inputs (one press per step), stars: [{ x, y }], dist }: rides the coach for the whole
 *   ride and puts stars along its flights (and a few in the valleys), so the coach's ride catches every one.
 *
 * play(canvas, { plan, secs, theme, label, tip, pauseTip, drawBackground(ctx, view), drawHero(ctx, x, y, size, hero),
 *               onEvent(ev), onClock(seconds, running), onFinish(result), autopilot(), speedup() })
 *   hero (for drawHero) = { grounded, vx, vy, angle (radians, nose up is positive), diving, t, air }. The view passed to
 *   drawBackground is { w, h, T, camX, camY, t }, like kit/runner.js. Hold Space, Down, S, a click, or a touch to dive;
 *   Esc or P pauses. Points: 10 a star, 25 times the combo for each smooth landing (up to 5 times), and 30 a second for big air
 *   (a flight of 0.8 seconds or more). result = { score, stars, starsTotal, bestAir, bestHeight, smooth, bonks, maxCombo, dist, pressed, ms }.
 *   state = { x, y, vx, grounded, t, secsLeft, score, stars, combo, smooth, bonks, paused, finished, tile }.
 */
(function (Kit) {
  "use strict";
  const DT = 1 / 120;
  // g = his weight letting go; dive = how much heavier holding makes him. Speeds in tiles a second.
  // lift = the fastest he can rise leaving a hilltop (so a flight tops out a few tiles up, never off the screen).
  // smooth / bonk = how far (radians) his path can be from the slope's angle for a smooth landing, or before it's a bonk.
  const PHYS = { g: 24, dive: 2.6, vmin: 5, vmax: 22, v0: 8, drag: .0012, lift: 13, bigAir: .8, smooth: .35, bonk: .8, boost: 1.06, bonkKeep: .72, catchR: .9, mid: .55 };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- The floor ---------- */
  // a = how far each top and valley sits from the middle, w = top-to-valley width (tiles). Hills this wide line up with his
  // flights, so a flight off one hilltop can come down on the far side of it. Higher levels: taller hills, a few narrower ones.
  const LEVELS = { 1: { a: [2.4, 3.6], grow: .9, w: [14, 17.5] }, 2: { a: [2, 3.5], grow: 1, w: [13, 17] }, 3: { a: [2.2, 3.8], grow: 1.1, w: [12.5, 17] } };
  function hills({ rng = Math.random, level = 1, length = 2600, shape = null } = {}) {
    const P = shape || LEVELS[level] || LEVELS[1], xs = [-40, 0], ys = [2.6, 2.6];
    let x = 0, up = false;
    while (x < length) {
      const far = Math.min(1, x / 1500);
      const a = P.a[0] + rng() * (P.a[1] - P.a[0]) + P.grow * far;
      const w = P.w[0] + rng() * (P.w[1] - P.w[0]);
      const y = up ? a : -a, prev = ys[ys.length - 1];
      // keep the steepest part of every slope gentle enough to ride (slope at most about 1.25)
      const dh = Math.min(Math.abs(y - prev), w * .8);
      x += w; xs.push(x); ys.push(prev + Math.sign(y - prev) * dh);
      up = !up;
    }
    return { xs: Float64Array.from(xs), ys: Float64Array.from(ys), n: xs.length, level };
  }
  function ground(H, x) {
    const xs = H.xs;
    if (x <= xs[0]) return { y: H.ys[0], s: 0, c: 0 };
    if (x >= xs[H.n - 1]) return { y: H.ys[H.n - 1], s: 0, c: 0 };
    let lo = 0, hi = H.n - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (xs[m] <= x) lo = m; else hi = m; }
    const x0 = xs[lo], w = xs[hi] - x0, y0 = H.ys[lo], d = H.ys[hi] - y0, u = (x - x0) / w, a = Math.PI * u;
    return { y: y0 + d * (1 - Math.cos(a)) / 2, s: d * Math.PI / (2 * w) * Math.sin(a), c: d * Math.PI * Math.PI / (2 * w * w) * Math.cos(a) };
  }

  /* ---------- The rider ---------- */
  function start(H) {
    const x = -6, q = ground(H, x);
    return { x, y: q.y, vx: PHYS.v0, vy: 0, grounded: true, t: 0, air: 0, peak: 0, combo: 0, maxCombo: 0, smooth: 0, bonks: 0, bestAir: 0, bestHeight: 0, ev: null };
  }
  const clone = s => ({ ...s, ev: null });
  function step(st, hold, H) {
    const G = PHYS.g * (hold ? PHYS.dive : 1);
    st.ev = null; st.t++;
    if (st.grounded) {
      const q = ground(H, st.x), k = 1 + q.s * q.s;
      st.vx = clamp(st.vx + (-G * q.s / k - PHYS.drag * st.vx * st.vx) * DT, PHYS.vmin, PHYS.vmax);
      // The floor curves away faster than he can follow it: up he goes (but not while it's still steep, so he never rises
      // faster than lift, and a flight tops out a few tiles up).
      if (q.c * st.vx * st.vx < -G && st.vx * q.s <= PHYS.lift) {
        st.grounded = false; st.vy = st.vx * q.s; st.air = 0; st.peak = 0;
        st.ev = { kind: "takeoff" };
      }
      st.x += st.vx * DT;
      if (st.grounded) st.y = ground(H, st.x).y; else st.y += st.vy * DT;
      return st;
    }
    st.vy -= G * DT; st.x += st.vx * DT; st.y += st.vy * DT; st.air++;
    const q = ground(H, st.x);
    st.peak = Math.max(st.peak, st.y - q.y);
    if (st.y > q.y) return st;
    // Landing: keep the part of his speed that runs along the slope. Matching the slope's angle is smooth; crashing into it is a bonk.
    const k = 1 + q.s * q.s, along = (st.vx + st.vy * q.s) / k, diff = Math.abs(Math.atan2(st.vy, st.vx) - Math.atan(q.s)), air = st.air * DT;
    let kind = "land", vx = along;
    if (air >= .3 && diff < PHYS.smooth) { kind = "smooth"; vx = along * PHYS.boost; st.smooth++; st.combo++; st.maxCombo = Math.max(st.maxCombo, st.combo); }
    else if (diff > PHYS.bonk && q.s > .1) { kind = "bonk"; vx = along * PHYS.bonkKeep; st.bonks++; st.combo = 0; }
    st.vx = clamp(vx, PHYS.vmin, PHYS.vmax); st.vy = 0; st.y = q.y; st.grounded = true;
    st.bestAir = Math.max(st.bestAir, air); st.bestHeight = Math.max(st.bestHeight, st.peak);
    st.ev = { kind, air, height: st.peak, combo: st.combo };
    return st;
  }
  // Where a flight would come down if he kept holding (or not): how far from the slope's angle he'd land, in radians.
  function landing(st, hold, H) {
    const s = clone(st);
    for (let i = 0; i < 600 && !s.grounded; i++) {
      const G = PHYS.g * (hold ? PHYS.dive : 1);
      s.vy -= G * DT; s.x += s.vx * DT; s.y += s.vy * DT;
      const q = ground(H, s.x);
      if (s.y <= q.y) return Math.abs(Math.atan2(s.vy, s.vx) - Math.atan(q.s));
    }
    return 9;
  }
  function coach(st, H) {
    if (st.grounded) return ground(H, st.x).s < .04;
    if (st.vy > 0) return false; // still going up: stay light and fly
    return landing(st, true, H) + .02 < landing(st, false, H);
  }

  /* ---------- Planning the stars ---------- */
  function plan({ rng = Math.random, level = 1, secs = 60, shape = null } = {}) {
    const H = hills({ rng, level, shape }), steps = Math.round(secs / DT), inputs = new Uint8Array(steps), stars = [];
    const st = start(H);
    let flight = [], lastGroundStar = -1e9;
    for (let t = 0; t < steps; t++) {
      const hold = st.grounded ? coach(st, H) : (t % 6 === 0 ? coach(st, H) : !!inputs[t - 1]);
      inputs[t] = hold ? 1 : 0;
      step(st, hold, H);
      if (!st.grounded) flight.push({ x: st.x, y: st.y + PHYS.mid, h: st.y - ground(H, st.x).y });
      else {
        if (flight.length) { // a flight just ended: stars along its high part, about every quarter second
          const n = flight.length * DT;
          if (n >= .5) { let put = 0; for (let i = 15; i < flight.length - 10 && put < 5; i += 30) if (flight[i].h > .8) { stars.push({ x: flight[i].x, y: flight[i].y }); put++; } }
          flight = [];
        }
        // a star or two waiting at the bottom of a valley now and then
        const q = ground(H, st.x);
        if (t - lastGroundStar > 240 && Math.abs(q.s) < .08 && q.c > 0 && st.x > 8) { stars.push({ x: st.x, y: st.y + PHYS.mid }); lastGroundStar = t; }
      }
    }
    return { hills: H, inputs, stars, dist: st.x, secs, level };
  }

  /* ---------- Playing ---------- */
  function play(canvas, o) {
    const ctx = canvas.getContext("2d"), sfx = Kit.audio.sfx;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const P = o.plan, H = P.hills, th = o.theme || {}, secs = o.secs || P.secs || 60, endStep = Math.round(secs / DT);
    let W = 0, Hh = 0, T = 40, raf = 0, last = 0, acc = 0, stopped = false, paused = false, finished = false;
    let st = start(H), hold = false, holdKeys = new Set(), pointer = false, tap = false, pressed = false, t0 = performance.now();
    let score = 0, got = new Set(), sparks = [], pops = [], rings = [], tipUntil = o.tip ? performance.now() + 4200 : 0, bumpAt = 0;
    let camX = st.x - 6, camY = -4, camT = 0;
    const clock = running => { if (o.onClock) o.onClock(st.t * DT, running); };

    function size() {
      const r = canvas.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; Hh = r.height; canvas.width = Math.max(1, Math.round(W * d)); canvas.height = Math.max(1, Math.round(Hh * d));
      ctx.setTransform(d, 0, 0, d, 0, 0);
    }
    const ro = (() => { try { const x = new ResizeObserver(size); x.observe(canvas); return x; } catch (e) { addEventListener("resize", size); return null; } })();
    size();
    // The most tiles that fit: about 10 tall, and at least 13 across on a narrow screen (like an upright phone).
    const baseT = () => Math.max(14, Math.min(Hh / 10, W / 13));

    const isKey = e => e.code === "Space" || e.code === "ArrowDown" || e.code === "KeyS" || e.code === "ArrowUp" || e.code === "KeyW";
    function kd(e) {
      if (stopped) return;
      if (e.code === "Escape" || e.code === "KeyP") { if (finished) return; e.preventDefault(); setPaused(!paused); return; }
      if (isKey(e)) { e.preventDefault(); if (paused) { setPaused(false); return; } if (!e.repeat) tap = true; pressed = true; holdKeys.add(e.code); }
    }
    function ku(e) { if (isKey(e)) holdKeys.delete(e.code); }
    function setPaused(v) { if (finished || v === paused) return; paused = v; clock(!v); }
    const pd = e => { if (paused) { setPaused(false); return; } pointer = true; tap = true; pressed = true; e.preventDefault(); };
    const pu = () => { pointer = false; };
    const blur = () => { holdKeys.clear(); pointer = false; };
    document.addEventListener("keydown", kd, true); document.addEventListener("keyup", ku, true);
    canvas.addEventListener("pointerdown", pd); addEventListener("pointerup", pu); addEventListener("pointercancel", pu); addEventListener("blur", blur);

    const pop = (text, color, big = false) => pops.push({ x: st.x, y: st.y + 2, text, color: color || th.pad || "#ffe94a", life: 1, big });
    function physics() {
      const ap = o.autopilot ? o.autopilot() : false;
      if (ap) hold = !!P.inputs[st.t];
      else { hold = pointer || holdKeys.size > 0 || tap; tap = false; }
      step(st, hold, H);
      const ev = st.ev;
      if (ev) {
        if (ev.kind === "takeoff") Kit.audio.tone(520, .1, "triangle", .035, 0, 880);
        else {
          for (let i = 0; i < 6; i++) sparks.push({ x: st.x + (Math.random() - .5) * .6, y: st.y + .05, vx: (Math.random() - .5) * 3 - st.vx * .1, vy: Math.random() * 2, life: .5, c: "rgba(246,240,255,.75)", sz: 5 });
          if (ev.air >= PHYS.bigAir) { const p = Math.round(ev.air * 30); score += p; pop(`BIG AIR! +${p}`, th.edge || "#3ef2ff", true); }
          if (ev.kind === "smooth") {
            const p = 25 * Math.min(5, ev.combo); score += p;
            pop(ev.combo > 1 ? `SMOOTH x${ev.combo}! +${p}` : `SMOOTH! +${p}`);
            Kit.audio.tone(1175, .1, "triangle", .04); Kit.audio.tone(1568, .14, "triangle", .035, .06);
            for (let i = 0; i < 10; i++) sparks.push({ x: st.x, y: st.y + .2, vx: (Math.random() - .5) * 6, vy: Math.random() * 4 + 1, life: .7, c: th.pad || "#ffe94a", sz: 5 });
          } else if (ev.kind === "bonk") { pop("BONK!", th.spike || "#ff3ec8"); sfx.miss(); }
        }
        if (o.onEvent) o.onEvent(ev);
      }
      // stars within reach of his middle
      const mx = st.x, my = st.y + PHYS.mid;
      for (let i = 0; i < P.stars.length; i++) {
        const s = P.stars[i]; if (got.has(i) || s.x < mx - 2) continue; if (s.x > mx + 2) break;
        if ((s.x - mx) ** 2 + (s.y - my) ** 2 <= PHYS.catchR ** 2) {
          got.add(i); score += 10; bumpAt = performance.now(); sfx.hint();
          rings.push({ x: s.x, y: s.y, life: 1 });
          for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; sparks.push({ x: s.x, y: s.y, vx: Math.cos(a) * 4, vy: Math.sin(a) * 4 + 1.5, life: .6, c: k % 2 ? th.pad || "#ffe94a" : "#ffffff", sz: 5 }); }
        }
      }
      if (st.t >= endStep) finish();
    }
    function finish() {
      if (finished) return;
      finished = true; clock(false); sfx.found(); pops.push({ x: st.x + 3, y: st.y + 3.4, text: "TIME!", color: "#ffffff", life: 1.3, big: true });
      const res = { score, stars: got.size, starsTotal: P.stars.filter(s => s.x <= st.x + 1).length, bestAir: +st.bestAir.toFixed(1), bestHeight: +st.bestHeight.toFixed(1),
        smooth: st.smooth, bonks: st.bonks, maxCombo: st.maxCombo, dist: Math.round(st.x), pressed, ms: performance.now() - t0 };
      setTimeout(() => { if (!stopped && o.onFinish) o.onFinish(res); }, 1100);
    }

    /* Drawing */
    const sx = x => (x - camX) * T, sy = y => Hh - (y - camY) * T;
    function moveCamera(dt) {
      // Keep him about a third of the way in, and keep both him and the hills under him on screen: zoom out when he flies high.
      const q = ground(H, st.x), b = baseT(), span = W / b;
      let low = q.y; for (let x = st.x - span * .3; x < st.x + span * .7; x += 1.5) low = Math.min(low, ground(H, x).y);
      const top = Math.max(st.y + 2.6, q.y + 4.4), want = Math.min(b, Hh / Math.max(1, top - (low - 1.4)));
      T = camT ? camT + (want - camT) * Math.min(1, dt * 2.6) : want; camT = T;
      const wantY = low - 1.4;
      camY += (wantY - camY) * Math.min(1, dt * 3); camX = st.x - (W / T) * .3;
    }
    function star(x, y, r, rot, fill, line) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, k = i % 2 ? r * .45 : r; ctx.lineTo(Math.cos(a) * k, Math.sin(a) * k); }
      ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = Math.max(1, r * .16); ctx.strokeStyle = line; ctx.lineJoin = "round"; ctx.stroke(); ctx.restore();
    }
    function drawFloor(now) {
      const x0 = camX - 1, x1 = camX + W / T + 1, stepX = Math.max(.12, 6 / T);
      const p = new Path2D(); p.moveTo(sx(x0), Hh + 4);
      for (let x = x0; x <= x1 + stepX; x += stepX) p.lineTo(sx(x), sy(ground(H, x).y));
      p.lineTo(sx(x1 + stepX), Hh + 4); p.closePath();
      const gr = ctx.createLinearGradient(0, sy(camY + Hh / T * .55), 0, Hh);
      gr.addColorStop(0, th.block || "#1a0a48"); gr.addColorStop(1, "#05020f");
      ctx.fillStyle = gr; ctx.fill(p);
      // bright stripes across the hills, like a neon sled run
      ctx.save(); ctx.clip(p);
      const cols = [th.edge || "#3ef2ff", th.spark || "#ff6be0", th.pad || "#ffe94a"], band = 3.2;
      for (let k = Math.floor(x0 / band) - 4; k * band < x1 + 4; k++) {
        ctx.beginPath(); const bx = k * band;
        ctx.moveTo(sx(bx), Hh + 4); ctx.lineTo(sx(bx + 1.1), Hh + 4); ctx.lineTo(sx(bx + 1.1 + 4), sy(camY + Hh / T)); ctx.lineTo(sx(bx + 4), sy(camY + Hh / T)); ctx.closePath();
        ctx.globalAlpha = .1; ctx.fillStyle = cols[((k % 3) + 3) % 3]; ctx.fill();
      }
      ctx.restore();
      // the glowing top edge of the waves
      const edge = new Path2D();
      for (let x = x0; x <= x1 + stepX; x += stepX) { const X = sx(x), Y = sy(ground(H, x).y); if (x === x0) edge.moveTo(X, Y); else edge.lineTo(X, Y); }
      ctx.save(); ctx.strokeStyle = th.edge || "#3ef2ff"; ctx.globalAlpha = .3; ctx.lineWidth = Math.max(6, T * .4); ctx.lineJoin = "round"; ctx.stroke(edge); ctx.restore();
      ctx.save(); ctx.strokeStyle = th.edge || "#3ef2ff"; ctx.lineWidth = Math.max(2.5, T * .12); ctx.lineJoin = "round"; ctx.stroke(edge); ctx.restore();
    }
    function draw(now) {
      const view = { w: W, h: Hh, T, camX, camY, t: now };
      if (o.drawBackground) o.drawBackground(ctx, view); else { ctx.fillStyle = "#0a0620"; ctx.fillRect(0, 0, W, Hh); }
      drawFloor(now);
      // stars still to catch
      for (let i = 0; i < P.stars.length; i++) {
        const s = P.stars[i]; if (got.has(i)) continue; const X = sx(s.x); if (X < -40) continue; if (X > W + 40) break;
        const bob = reduced ? 0 : Math.sin(now / 300 + s.x) * T * .06;
        ctx.save(); ctx.globalAlpha = .35; ctx.fillStyle = th.pad || "#ffe94a"; ctx.beginPath(); ctx.arc(X, sy(s.y) + bob, T * .42, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        star(X, sy(s.y) + bob, T * .36, reduced ? 0 : Math.sin(now / 500 + i) * .25, th.pad || "#ffe94a", "#7a5a00");
      }
      // speed lines behind him when he's really moving
      if (st.vx > 17 && !reduced) {
        ctx.save(); ctx.strokeStyle = "rgba(246,240,255,.5)"; ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) { const y = sy(st.y + .3 + i * .28), len = T * (1 + (st.vx - 17) / 6) * (1 - i * .15), x = sx(st.x) - T * .9 - ((now / 30 + i * 37) % 20); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - len, y); ctx.stroke(); }
        ctx.restore();
      }
      if (o.drawHero) {
        const q = ground(H, st.x), angle = st.grounded ? Math.atan(q.s) : Math.atan2(st.vy, st.vx) * .7;
        o.drawHero(ctx, sx(st.x), sy(st.y), T, { grounded: st.grounded, vx: st.vx, vy: st.vy, angle, diving: hold, t: now, air: st.air * DT });
      }
      for (const p of sparks) { const z = p.sz || 6; ctx.globalAlpha = Math.max(0, Math.min(1, p.life)); ctx.fillStyle = p.c; ctx.fillRect(sx(p.x) - z / 2, sy(p.y) - z / 2, z, z); }
      for (const r of rings) { ctx.globalAlpha = Math.max(0, r.life) * .8; ctx.strokeStyle = th.pad || "#ffe94a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(sx(r.x), sy(r.y), T * (.35 + (1 - r.life) * .9), 0, Math.PI * 2); ctx.stroke(); }
      ctx.globalAlpha = 1;
      for (const q of pops) {
        const X = Math.min(W - 80, Math.max(80, sx(q.x))), Y = sy(q.y + (1.3 - q.life) * .9), s = Math.max(q.big ? 14 : 12, T * (q.big ? .32 : .26));
        ctx.globalAlpha = Math.min(1, q.life * 1.6); ctx.font = `400 ${s}px "Press Start 2P", ui-monospace, monospace`; ctx.textAlign = "center";
        ctx.lineWidth = 5; ctx.strokeStyle = "#1a0420"; ctx.strokeText(q.text, X, Y); ctx.fillStyle = q.color; ctx.fillText(q.text, X, Y);
      }
      ctx.globalAlpha = 1;
      // top bar: time left, the ride's name, stars caught, and points
      const left = Math.max(0, 1 - st.t / endStep), secsLeft = Math.ceil(Math.max(0, endStep - st.t) * DT), hudF = Math.max(11, Math.min(18, Hh / 30));
      ctx.fillStyle = "rgba(10,6,32,.6)"; ctx.fillRect(W * .25, 12, W * .5, 10);
      ctx.fillStyle = secsLeft <= 10 ? (th.spark || "#ff6be0") : (th.edge || "#3ef2ff"); ctx.fillRect(W * .25, 12, W * .5 * left, 10);
      ctx.font = `400 ${hudF}px "Press Start 2P", ui-monospace, monospace`; ctx.fillStyle = "#f6f0ff";
      ctx.textAlign = "center"; ctx.fillText(`${secsLeft}s`, W / 2, 42);
      ctx.textAlign = "left"; if (o.label) ctx.fillText(o.label.toUpperCase(), 16, 24);
      ctx.fillText(`${score}`, 16, 48);
      ctx.textAlign = "right"; ctx.fillStyle = th.pad || "#ffe94a";
      const bump = now - bumpAt < 220 && !reduced ? 1 + .35 * (1 - (now - bumpAt) / 220) : 1;
      ctx.save(); ctx.translate(W - 16, 20); ctx.scale(bump, bump); ctx.fillText(`${got.size}`, 0, 4); ctx.restore();
      star(W - 16 - ctx.measureText(`${got.size}`).width - 16, 19, 9, 0, th.pad || "#ffe94a", "#7a5a00");
      if (tipUntil && now < tipUntil && o.tip) {
        let fs = Math.max(15, Hh / 28); ctx.font = `700 ${fs}px "Baloo 2", system-ui, sans-serif`; ctx.textAlign = "center";
        const fit = (W - 48) / ctx.measureText(o.tip).width; if (fit < 1) { fs = Math.max(10, fs * fit); ctx.font = `700 ${fs}px "Baloo 2", system-ui, sans-serif`; }
        const tw = ctx.measureText(o.tip).width, bh = fs * 1.7;
        ctx.fillStyle = "rgba(10,6,32,.7)"; ctx.fillRect(W / 2 - tw / 2 - 16, 58, tw + 32, bh);
        ctx.fillStyle = th.pad || "#ffe94a"; ctx.fillText(o.tip, W / 2, 58 + bh * .7);
      }
      if (paused) {
        ctx.fillStyle = "rgba(10,6,32,.72)"; ctx.fillRect(0, 0, W, Hh);
        ctx.fillStyle = "#f6f0ff"; ctx.textAlign = "center"; ctx.font = `400 ${Math.max(16, Hh / 22)}px "Press Start 2P", ui-monospace, monospace`;
        ctx.fillText("PAUSED", W / 2, Hh / 2); ctx.font = `600 ${Math.max(14, Hh / 34)}px system-ui, sans-serif`; ctx.fillText(o.pauseTip || "Space to keep going", W / 2, Hh / 2 + Math.max(24, Hh / 16));
      }
    }
    function frame(now) {
      if (stopped) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min(.1, (now - (last || now)) / 1000); last = now;
      for (const p of sparks) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 20 * dt; p.life -= dt * 1.6; }
      sparks = sparks.filter(p => p.life > 0);
      for (const r of rings) r.life -= dt * 2.4;
      rings = rings.filter(r => r.life > 0);
      for (const q of pops) q.life -= dt * .9;
      pops = pops.filter(q => q.life > 0);
      if (!paused && !finished) {
        const speed = Math.max(1, (o.speedup && o.speedup()) || 1);
        acc += dt * speed;
        while (acc >= DT && !finished) { acc -= DT; physics(); }
        if (finished) acc = 0;
      }
      moveCamera(dt);
      draw(now);
    }
    raf = requestAnimationFrame(frame);
    clock(true);

    return {
      stop() { stopped = true; cancelAnimationFrame(raf); document.removeEventListener("keydown", kd, true); document.removeEventListener("keyup", ku, true); canvas.removeEventListener("pointerdown", pd); removeEventListener("pointerup", pu); removeEventListener("pointercancel", pu); removeEventListener("blur", blur); if (ro) ro.disconnect(); },
      pause(v) { setPaused(!!v); },
      get state() { return { x: st.x, y: st.y, vx: st.vx, grounded: st.grounded, t: st.t, secsLeft: Math.max(0, (endStep - st.t) * DT), score, stars: got.size, combo: st.combo, smooth: st.smooth, bonks: st.bonks, paused, finished, pressed, tile: T }; }
    };
  }

  Kit.waveRider = { sim: { DT, PHYS, hills, ground, start, step, coach, clone }, plan, play };
})(window.Kit = window.Kit || {});
