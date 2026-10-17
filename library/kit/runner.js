/**
 * @file kit/runner.js
 * @about Side-scrolling obstacle run, like a rhythm platformer: the hero runs by himself, hops over spikes (and hops again in the air for a double hop), bounces off pads, and flies a little ship through tunnels. Touching a spike or a wall sends him back to the start (or the last checkpoint, once checkpoints are on). Levels are built from chunks with flat ground between them for breathing room, and a built-in solver plays every chunk before it is used, so every level can be beaten.
 * @provides Kit.runner { sim: { DT, PHYS, Level, start, step, clone, solve }, generate(options), play(canvas, options) -> { stop, pause(on), checkpoints(on), state } }
 * @requires kit/util.js, kit/audio.js
 *
 * Units are tiles and seconds. The ground's top is y = 0, and y goes up. The physics runs in fixed 1/120 s steps,
 * so a list of button presses (one per step) always replays exactly the same way.
 * Hopping: hold the button on the ground to hop (keep holding to hop again on landing). Press again in the air for one double hop.
 * Running off a ledge still allows a normal hop for a few steps (coyote time). A quick tap always counts, even between frames.
 *
 * Chunk format (see content/levels/runner-chunks.js): { id, min, max, len, w, tag, gaps: [[x0, x1]], o: [[kind, x, y, w, h]] }
 *   kinds: b block (x, y, w, h), s spike pointing up (x, y), v spike hanging down (x, y = its top), p bounce pad (x, y),
 *          S ship portal (x), C hero portal (x), x secret box (x, y). Ground is added under the chunk except in gaps.
 *
 * generate({ chunks, level, speed, length, pieces, rng, secret, ships, space }) -> { L, inputs, checks, endX, secret: { from, inputs } | null, frames }
 *   Picks chunks for the level, proves each one can be beaten, then places memory pieces along the winning path.
 *   ships = how many ship tunnels to try for (0 = none), space = extra tiles of flat ground before each chunk.
 *
 * play(canvas, { gen, theme, label, drawBackground(ctx, view), drawHero(ctx, x, y, size, hero), onCrash(n),
 *               onCollect(obj), onMode(mode), onDouble(), onFinish(result), autopilot(), speedup(), tip })
 *   The screen shows no attempt counter. onCrash(n) gets a running count for this run only (so a game can offer help),
 *   and nothing is kept after the run. result = { crashes, pieces, piecesTotal, secret, usedCheckpoints, ms }
 *   hero (for drawHero) = { mode, vy, grounded, h, t, spin } where spin goes 0 to 1 during a double hop's flip, else -1.
 */
(function (Kit) {
  "use strict";
  const DT = 1 / 120;
  // Tiny hop (about 1.25 tiles high), a double hop adds about 1.1 more, big bounce (about 3.6 tiles), gentle ship.
  // coyote = steps after running off a ledge when a normal hop still works.
  const PHYS = { g: 58, jump: 12.05, jump2: 11.2, air: 1, coyote: 8, pad: 20.4, shipUp: 28, shipDown: 24, shipMax: 6.5, cw: .64, ch: .8, sw: .92, sh: .62, floor: -3, snap: .06 };

  /* ---------- Level: objects stored in one-tile columns so collision checks stay fast ---------- */
  class Level {
    constructor(speed) { this.speed = speed; this.objs = []; this.cols = new Map(); this.stamp = 0; this.nextId = 1; this.endX = 1e9; }
    add(k, x, y, w = 1, h = 1) {
      const o = { id: this.nextId++, k, x, y, w, h, seen: 0 };
      if (k === "b") { o.bx0 = x; o.bx1 = x + w; o.by0 = y; o.by1 = y + h; }
      else if (k === "s") { o.bx0 = x + .36; o.bx1 = x + .64; o.by0 = y; o.by1 = y + .45; } // kinder than it looks
      else if (k === "v") { o.bx0 = x + .36; o.bx1 = x + .64; o.by0 = y - .45; o.by1 = y; }
      else if (k === "p") { o.bx0 = x + .1; o.bx1 = x + .9; o.by0 = y; o.by1 = y + .35; }
      else if (k === "S" || k === "C") { o.bx0 = x + .25; o.bx1 = x + .75; o.by0 = -2; o.by1 = 12; }
      else { o.bx0 = x - .38; o.bx1 = x + .38; o.by0 = y - .38; o.by1 = y + .38; } // m piece, x secret box
      this.objs.push(o);
      for (let c = Math.floor(o.bx0) - 1; c <= Math.floor(o.bx1) + 1; c++) {
        let a = this.cols.get(c); if (!a) this.cols.set(c, a = []); a.push(o);
      }
      return o;
    }
    remove(o) {
      const i = this.objs.indexOf(o); if (i >= 0) this.objs.splice(i, 1);
      for (let c = Math.floor(o.bx0) - 1; c <= Math.floor(o.bx1) + 1; c++) {
        const a = this.cols.get(c); if (a) { const j = a.indexOf(o); if (j >= 0) a.splice(j, 1); }
      }
    }
    near(x0, x1, fn) {
      const s = ++this.stamp;
      for (let c = Math.floor(x0); c <= Math.floor(x1); c++) {
        const a = this.cols.get(c); if (!a) continue;
        for (const o of a) if (o.seen !== s) { o.seen = s; fn(o); }
      }
    }
    ground(x0, x1) { return x1 > x0 ? this.add("b", x0, -4, x1 - x0, 4) : null; }
  }

  // air = double hops left, ph = was the button down last step, coy = coyote steps left, dbl = step of the last double hop.
  const start = (x = .5) => ({ x, y: 0, vy: 0, mode: "cube", grounded: true, alive: true, pad: 0, t: 0, why: "", touch: null, air: PHYS.air, ph: false, coy: 0, dbl: -1e9 });
  const clone = s => ({ x: s.x, y: s.y, vy: s.vy, mode: s.mode, grounded: s.grounded, alive: s.alive, pad: s.pad, t: s.t, why: s.why, touch: null, air: s.air, ph: s.ph, coy: s.coy, dbl: s.dbl });

  // One 1/120 s physics step. hold = jump button down. Sets s.touch to the pieces or secret boxes touched this step.
  function step(s, hold, L) {
    if (!s.alive) return s;
    const P = PHYS;
    if (s.mode === "cube") {
      const press = hold && !s.ph;
      if (hold && s.grounded) { s.vy = P.jump; s.grounded = false; s.coy = 0; }
      else if (press && s.coy > 0) { s.vy = P.jump; s.coy = 0; }
      else if (press && s.air > 0) { s.vy = Math.max(s.vy, P.jump2); s.air--; s.dbl = s.t; }
      s.vy -= P.g * DT;
    } else {
      s.vy += (hold ? P.shipUp : -P.shipDown) * DT;
      if (s.vy > P.shipMax) s.vy = P.shipMax; else if (s.vy < -P.shipMax) s.vy = -P.shipMax;
    }
    s.ph = hold;
    const y0 = s.y;
    s.x += L.speed * DT; s.y += s.vy * DT; s.t++;
    s.grounded = false; s.touch = null;
    let onPad = 0;
    const w = s.mode === "cube" ? P.cw : P.sw;
    L.near(s.x - 1, s.x + w + 1, o => {
      if (!s.alive) return;
      const h = s.mode === "cube" ? P.ch : P.sh;
      if (!(s.x + w > o.bx0 && s.x < o.bx1 && s.y + h > o.by0 && s.y < o.by1)) return;
      switch (o.k) {
        case "b":
          if (y0 >= o.by1 - P.snap && s.vy <= 0) { s.y = o.by1; s.vy = 0; s.grounded = true; }
          else if (y0 + h <= o.by0 + P.snap && s.vy >= 0) { s.y = o.by0 - h; s.vy = 0; } // bonk, no harm
          else { s.alive = false; s.why = "wall"; }
          break;
        case "s": case "v": s.alive = false; s.why = "spike"; break;
        case "p":
          onPad = o.id;
          if (s.mode === "cube" && s.pad !== o.id) { s.vy = P.pad; s.grounded = false; s.pad = o.id; s.coy = 0; }
          break;
        case "S": if (s.mode !== "ship") { s.mode = "ship"; s.vy = Math.min(s.vy, 3); } break;
        case "C": if (s.mode !== "cube") { s.mode = "cube"; s.air = P.air; } break;
        default: (s.touch || (s.touch = [])).push(o);
      }
    });
    if (!onPad) s.pad = 0;
    if (s.grounded) { s.air = P.air; s.coy = P.coyote; } else if (s.coy > 0) s.coy--;
    if (s.alive && s.y < P.floor) { s.alive = false; s.why = "fall"; }
    return s;
  }

  /* ---------- Solver: finds button presses that get from one state to a goal frame alive, standing on the ground ---------- */
  // want(o) optional: the path must touch an object for which want(o) is true (used to prove a secret box can be reached).
  function solve(L, from, endFrame, { want = null, maxNodes = 30000, every = 4 } = {}) {
    const seen = new Set();
    const root = { st: clone(from), parent: null, holds: null, got: !want };
    const stack = [root];
    let nodes = 0;
    while (stack.length) {
      const n = stack.pop();
      if (++nodes > maxNodes) return null;
      const opts = n.st.mode === "ship" ? (n.holds && n.holds[n.holds.length - 1] ? [false, true] : [true, false]) : [true, false];
      // Pushed in reverse: the last pushed is tried first (no-hold first for the hero, keep-doing-the-same for the ship).
      for (const hold of opts) {
        const s = clone(n.st), holds = [];
        let got = n.got, done = false;
        for (let i = 0; i < every; i++) {
          step(s, hold, L); holds.push(hold);
          if (!got && s.touch && s.touch.some(want)) got = true;
          if (!s.alive) break;
          if (s.t >= endFrame) { done = true; break; }
        }
        if (!s.alive) continue;
        const child = { st: s, parent: n, holds, got };
        if (done) {
          if (got && s.mode === "cube" && s.grounded && Math.abs(s.y) < 1e-6) {
            const out = []; let c = child;
            while (c && c.holds) { out.unshift(c.holds); c = c.parent; }
            return { inputs: out.flat(), state: s };
          }
          continue;
        }
        // The ship ignores double hops and coyote time, so those are left out of its key (fewer states to search).
        const hop = s.mode === "cube" ? `|${s.air}|${s.ph ? 1 : 0}|${s.coy}` : "";
        const key = `${s.t}|${Math.round(s.y * 40)}|${Math.round(s.vy * 8)}|${s.mode}|${s.grounded ? 1 : 0}|${got ? 1 : 0}|${s.pad}${hop}`;
        if (seen.has(key)) continue;
        seen.add(key);
        stack.push(child);
      }
    }
    return null;
  }

  /* ---------- Level generator ---------- */
  function place(L, c, x0) {
    const made = [];
    let gx = x0;
    for (const [a, b] of [...(c.gaps || [])].sort((p, q) => p[0] - q[0])) { made.push(L.ground(gx, x0 + a)); gx = x0 + b; }
    made.push(L.ground(gx, x0 + c.len));
    for (const [k, x, y = 0, w = 1, h = 1] of c.o || []) made.push(L.add(k, x0 + x, y, w, h));
    return made.filter(Boolean);
  }

  function generate({ chunks, level, speed, length, pieces = 9, rng = Math.random, secret = true, ships: shipCount = 1, space = 0 }) {
    const L = new Level(speed);
    const pickW = list => { let t = list.reduce((a, c) => a + (c.w || 1), 0) * rng(); for (const c of list) { t -= c.w || 1; if (t <= 0) return c; } return list[list.length - 1]; };
    const fits = c => (c.min || 1) <= level && level <= (c.max || 9);
    const pool = chunks.filter(c => fits(c) && !c.tag);
    const ships = chunks.filter(c => fits(c) && c.tag === "ship");
    const secrets = chunks.filter(c => fits(c) && c.tag === "secret");
    const flat = chunks.find(c => c.id === "flat") || { id: "flat", len: 5, o: [] };
    L.ground(-14, 8);
    let st = start(.5), x = 8; // a little run-up before the first obstacle
    const inputs = [], checks = [{ t: 0, x: .5 }];
    let sec = null, shipsPlaced = 0, secretPlaced = false, last = "";
    const wantShips = ships.length ? shipCount : 0;

    while (x < length) {
      const frac = x / length;
      let want = "any";
      if (shipsPlaced < wantShips && frac > (shipsPlaced ? .62 : .32)) want = "ship";
      else if (secret && !secretPlaced && secrets.length && frac > .5) want = "secret";
      const list = want === "ship" ? ships : want === "secret" ? secrets : pool.filter(c => c.id !== last);
      let ok = false;
      for (let tries = 0; tries < 8 && !ok; tries++) {
        const c = pickW(list.length ? list : [flat]);
        const x0 = x + space; // breathing room: flat ground before the chunk
        const made = [L.ground(x, x0), ...place(L, c, x0)].filter(Boolean);
        const tail = L.ground(x0 + c.len, x0 + c.len + 8);
        const endFrame = st.t + Math.ceil((x0 + c.len + .4 - st.x) / (speed * DT));
        const res = solve(L, st, endFrame);
        let alt = null;
        if (res && c.tag === "secret") alt = solve(L, st, endFrame, { want: o => o.k === "x", maxNodes: 120000, every: 3 });
        L.remove(tail);
        if (res && (c.tag !== "secret" || alt)) {
          if (alt) { sec = { from: st.t, inputs: alt.inputs }; secretPlaced = true; }
          inputs.push(...res.inputs); st = res.state;
          checks.push({ t: st.t, x: st.x });
          if (c.tag === "ship") shipsPlaced++;
          x = x0 + c.len; last = c.id; ok = true;
        } else made.forEach(o => L.remove(o));
      }
      if (!ok) {
        if (want === "ship") shipsPlaced++;          // give up on this ship section rather than loop forever
        else if (want === "secret") secretPlaced = true;
        else { place(L, flat, x); const endFrame = st.t + Math.ceil((x + flat.len + .4 - st.x) / (speed * DT)); const r = solve(L, st, endFrame); if (r) { inputs.push(...r.inputs); st = r.state; } x += flat.len; }
      }
    }
    // Finish line: a little more ground and the exit portal.
    L.ground(x, x + 16);
    L.endX = x + 3;
    while (st.x < L.endX) { step(st, false, L); inputs.push(false); }

    // Memory pieces go along the winning path, so a careful runner can catch every one.
    const path = [];
    const s = start(.5);
    for (let i = 0; i < inputs.length; i++) { step(s, inputs[i], L); path.push([s.x, s.y, s.mode]); }
    const a = Math.floor(path.length * .1), b = Math.floor(path.length * .92);
    for (let i = 0; i < pieces; i++) {
      const [px, py, mode] = path[Math.floor(a + (b - a) * (i + .5) / pieces)];
      L.add("m", px + (mode === "cube" ? PHYS.cw : PHYS.sw) / 2, py + (mode === "cube" ? PHYS.ch : PHYS.sh) / 2 + .05);
    }
    return { L, inputs, checks, endX: L.endX, secret: sec, frames: inputs.length };
  }

  /* ---------- Playing a level on a canvas ---------- */
  function play(canvas, o) {
    const ctx = canvas.getContext("2d"), sfx = Kit.audio.sfx;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const G = o.gen, L = G.L, th = o.theme || {};
    const pieceObjs = L.objs.filter(x => x.k === "m"), secretObj = L.objs.find(x => x.k === "x");
    let W = 0, H = 0, T = 60, raf = 0, last = 0, acc = 0, stopped = false, paused = false;
    let st = start(.5), crashes = 0, deadAt = 0, cpOn = false, cpUsed = false, cp = G.checks[0];
    let got = new Set(), secretGot = false, finished = false, t0 = performance.now(), hold = false, holdKeys = new Set(), pointer = false, tap = false;
    let camY = 0, sparks = [], lastMode = "cube", tipUntil = o.tip ? performance.now() + 4200 : 0;

    function size() {
      const r = canvas.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height; canvas.width = Math.max(1, Math.round(W * d)); canvas.height = Math.max(1, Math.round(H * d));
      ctx.setTransform(d, 0, 0, d, 0, 0); T = Math.max(30, H / 9.2);
    }
    const ro = (() => { try { const x = new ResizeObserver(size); x.observe(canvas); return x; } catch (e) { addEventListener("resize", size); return null; } })();
    size();

    const isJumpKey = e => e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW";
    function kd(e) {
      if (stopped) return;
      if (e.code === "Escape" || e.code === "KeyP") { e.preventDefault(); paused = !paused; return; }
      if (isJumpKey(e)) { e.preventDefault(); if (paused) { paused = false; return; } if (!e.repeat) tap = true; holdKeys.add(e.code); }
    }
    function ku(e) { if (isJumpKey(e)) holdKeys.delete(e.code); }
    const pd = e => { if (paused) { paused = false; return; } pointer = true; tap = true; e.preventDefault(); };
    const pu = () => { pointer = false; };
    document.addEventListener("keydown", kd, true); document.addEventListener("keyup", ku, true);
    canvas.addEventListener("pointerdown", pd); addEventListener("pointerup", pu); addEventListener("pointercancel", pu);
    const blur = () => { holdKeys.clear(); pointer = false; };
    addEventListener("blur", blur);

    const view = () => ({ w: W, h: H, T, camX: st.x - (W / T) * .26, camY, t: performance.now() });
    const sx = (x, v) => (x - v.camX) * T;
    const sy = (y, v) => H - 1.7 * T - (y - v.camY) * T;

    function respawn() {
      st = start(cp.x); st.t = cp.t;
      if (cp.t === 0) { got = new Set(); secretGot = false; }
      deadAt = 0; camY = 0; lastMode = "cube"; tap = false;
    }
    function crash() {
      crashes++; deadAt = performance.now(); sfx.lost();
      for (let i = 0; i < 26; i++) sparks.push({ x: st.x + .4, y: st.y + .4, vx: (Math.random() - .5) * 9, vy: Math.random() * 8 - 2, life: 1, c: i % 2 ? th.spark || "#ff3ec8" : th.edge || "#3ef2ff" });
      if (o.onCrash) o.onCrash(crashes);
    }
    function physics() {
      const ap = o.autopilot ? o.autopilot() : false;
      if (ap) {
        const sIn = ap === "secret" && G.secret && st.t >= G.secret.from && st.t < G.secret.from + G.secret.inputs.length ? G.secret.inputs[st.t - G.secret.from] : null;
        hold = sIn !== null ? sIn : !!G.inputs[st.t];
      } else { hold = pointer || holdKeys.size > 0 || tap; tap = false; } // a quick tap counts for one step even if already let go
      const air0 = st.air;
      step(st, hold, L);
      if (st.air < air0 && st.alive) { // double hop: a little ring of sparks under his feet
        Kit.audio.tone(660, .12, "triangle", .05, 0, 1320);
        for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; sparks.push({ x: st.x + .32 + Math.cos(a) * .2, y: st.y, vx: Math.cos(a) * 4, vy: Math.sin(a) * 1.5 - 1, life: .7, c: i % 2 ? th.pad || "#ffe94a" : th.edge || "#3ef2ff" }); }
        if (o.onDouble) o.onDouble();
      }
      if (st.touch) for (const x of st.touch) {
        if (x.k === "m" && !got.has(x.id)) { got.add(x.id); sfx.hint(); if (o.onCollect) o.onCollect(x); }
        if (x.k === "x" && !secretGot) { secretGot = true; sfx.found(); if (o.onCollect) o.onCollect(x); }
      }
      if (st.mode !== lastMode) { lastMode = st.mode; sfx.beep(); if (o.onMode) o.onMode(st.mode); }
      if (cpOn) for (const c of G.checks) if (c.t === st.t && c.t > cp.t) { cp = c; sfx.arrive(); }
      if (!st.alive) crash();
      else if (st.x >= G.endX) finish();
    }
    function finish() {
      finished = true; sfx.found();
      const res = { crashes, pieces: got.size, piecesTotal: pieceObjs.length, secret: secretGot, usedCheckpoints: cpUsed, ms: performance.now() - t0 };
      setTimeout(() => { if (!stopped && o.onFinish) o.onFinish(res); }, 650);
    }

    /* Drawing */
    function glowStroke(path, color, wide) {
      ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = .28; ctx.lineWidth = wide; ctx.stroke(path); ctx.restore();
      ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.5, wide / 3.2); ctx.stroke(path);
    }
    function drawObj(x, v, now) {
      const X = sx(x.x, v), Y = sy(x.y, v);
      if (x.k === "b") {
        const p = new Path2D(); p.rect(X, sy(x.y + x.h, v), x.w * T, x.h * T);
        ctx.fillStyle = th.block || "#1a0b3d"; ctx.fill(p);
        if (x.y < 0) { // ground: bright top edge only
          ctx.save(); ctx.beginPath(); ctx.rect(X, sy(0, v), x.w * T, T * .12); ctx.fillStyle = th.edge || "#3ef2ff"; ctx.globalAlpha = .9; ctx.fill(); ctx.restore();
          ctx.save(); ctx.globalAlpha = .18; ctx.strokeStyle = th.edge || "#3ef2ff"; ctx.lineWidth = 1;
          for (let gx = Math.ceil(x.x); gx < x.x + x.w; gx++) { ctx.beginPath(); ctx.moveTo(sx(gx, v), sy(0, v)); ctx.lineTo(sx(gx, v) - T * .6, sy(-1.6, v)); ctx.stroke(); }
          ctx.restore();
        } else glowStroke(p, th.edge || "#3ef2ff", T * .18);
      } else if (x.k === "s" || x.k === "v") {
        const p = new Path2D(), up = x.k === "s", base = up ? sy(x.y, v) : sy(x.y, v), tip = up ? sy(x.y + .92, v) : sy(x.y - .92, v);
        p.moveTo(X + T * .06, base); p.lineTo(X + T * .5, tip); p.lineTo(X + T * .94, base); p.closePath();
        ctx.fillStyle = th.spike || "#ff3ec8"; ctx.fill(p); glowStroke(p, th.spikeEdge || "#ffd1f3", T * .1);
      } else if (x.k === "p") {
        const p = new Path2D(); p.ellipse(X + T * .5, Y, T * .42, T * .26, 0, Math.PI, 0); p.closePath();
        ctx.fillStyle = th.pad || "#ffe94a"; ctx.fill(p); glowStroke(p, th.pad || "#ffe94a", T * .3);
        ctx.fillStyle = th.block || "#1a0b3d"; ctx.font = `800 ${T * .28}px system-ui, sans-serif`; ctx.textAlign = "center"; ctx.fillText("^", X + T * .5, Y - T * .02);
      } else if (x.k === "S" || x.k === "C") {
        const c = x.k === "S" ? (th.shipPortal || "#ff3ec8") : (th.cubePortal || "#5cffb0");
        const p = new Path2D(); p.ellipse(X + T * .5, sy(1.6, v), T * .42, T * 1.75, 0, 0, Math.PI * 2);
        glowStroke(p, c, T * .32);
        ctx.save(); ctx.globalAlpha = .16; ctx.fillStyle = c; ctx.fill(p); ctx.restore();
      } else if (x.k === "m") {
        if (got.has(x.id)) return;
        const bob = reduced ? 0 : Math.sin(now / 260 + x.x) * T * .08;
        drawPiece(X, Y + bob, T * .34, th.piece || "#5cffb0", reduced ? 0 : now / 900 + x.x);
      } else if (x.k === "x") {
        if (secretGot) return;
        const s = T * .7, hue = reduced ? 0 : Math.floor(now / 700) % 3;
        const cols = [th.spark || "#ff3ec8", th.edge || "#3ef2ff", th.pad || "#ffe94a"];
        const p = new Path2D(); p.rect(X - s / 2, Y - s / 2, s, s);
        ctx.fillStyle = th.block || "#1a0b3d"; ctx.fill(p); glowStroke(p, cols[hue], T * .2);
        ctx.fillStyle = cols[hue]; ctx.font = `800 ${T * .5}px system-ui, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("?", X, Y + T * .02); ctx.textBaseline = "alphabetic";
      }
    }
    function drawPiece(x, y, r, color, rot) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot * .3);
      const p = new Path2D(), k = r * .38;
      p.moveTo(-r, -r); p.lineTo(-k, -r); p.arc(0, -r, k, Math.PI, 0); p.lineTo(r, -r); p.lineTo(r, -k); p.arc(r, 0, k, -Math.PI / 2, Math.PI / 2);
      p.lineTo(r, r); p.lineTo(-r, r); p.closePath();
      ctx.fillStyle = color; ctx.globalAlpha = .9; ctx.fill(p); ctx.globalAlpha = 1;
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5; ctx.stroke(p);
      ctx.restore();
    }
    function draw(now) {
      const v = view();
      if (o.drawBackground) o.drawBackground(ctx, v); else { ctx.fillStyle = "#0a0620"; ctx.fillRect(0, 0, W, H); }
      // exit portal
      const ex = sx(G.endX, v), eh = sy(1.8, v);
      ctx.save(); ctx.translate(ex, eh);
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(0, 0, T * (1.4 - i * .28), T * (2 - i * .38), reduced ? 0 : now / (900 + i * 300), 0, Math.PI * 2); ctx.strokeStyle = [th.edge, th.spark, th.pad, th.piece][i] || "#fff"; ctx.lineWidth = 3; ctx.stroke(); }
      ctx.restore();
      L.near(v.camX - 2, v.camX + W / T + 2, x => drawObj(x, v, now));
      if (cpOn) for (const c of G.checks) { if (c.t === 0) continue; const X = sx(c.x + .36, v), Y = sy(.25, v); ctx.save(); ctx.fillStyle = c === cp ? (th.piece || "#5cffb0") : "rgba(255,255,255,.35)"; ctx.translate(X, Y); ctx.rotate(Math.PI / 4); ctx.fillRect(-T * .15, -T * .15, T * .3, T * .3); ctx.restore(); }
      if (!deadAt && o.drawHero) {
        const w = st.mode === "cube" ? PHYS.cw : PHYS.sw, h = st.mode === "cube" ? PHYS.ch : PHYS.sh;
        const sp = (st.t - st.dbl) / 42;
        o.drawHero(ctx, sx(st.x + w / 2, v), sy(st.y, v), T, { mode: st.mode, vy: st.vy, grounded: st.grounded, h: h * T, t: now, spin: !st.grounded && sp >= 0 && sp < 1 ? sp : -1 });
      }
      // sparks
      for (const p of sparks) { ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.c; ctx.fillRect(sx(p.x, v) - 4, sy(p.y, v) - 4, 8, 8); }
      ctx.globalAlpha = 1;
      // top bar: progress, the run's name, pieces
      const prog = Math.max(0, Math.min(1, st.x / G.endX));
      ctx.fillStyle = "rgba(10,6,32,.6)"; ctx.fillRect(W * .2, 12, W * .6, 10);
      ctx.fillStyle = th.edge || "#3ef2ff"; ctx.fillRect(W * .2, 12, W * .6 * prog, 10);
      ctx.font = `400 ${Math.max(11, T * .2)}px "Press Start 2P", ui-monospace, monospace`; ctx.textAlign = "left"; ctx.fillStyle = "#f6f0ff";
      if (o.label) ctx.fillText(o.label.toUpperCase(), 16, 24);
      ctx.textAlign = "right"; ctx.fillStyle = th.piece || "#5cffb0";
      ctx.fillText(`${got.size}/${pieceObjs.length}`, W - 16, 24);
      drawPiece(W - 16 - ctx.measureText(`${got.size}/${pieceObjs.length}`).width - 18, 18, 7, th.piece || "#5cffb0", 0);
      if (tipUntil && now < tipUntil && o.tip) {
        ctx.font = `700 ${Math.max(15, T * .3)}px "Baloo 2", system-ui, sans-serif`; ctx.textAlign = "center";
        ctx.fillStyle = "rgba(10,6,32,.7)"; const tw = ctx.measureText(o.tip).width; ctx.fillRect(W / 2 - tw / 2 - 16, 40, tw + 32, T * .5);
        ctx.fillStyle = th.pad || "#ffe94a"; ctx.fillText(o.tip, W / 2, 40 + T * .36);
      }
      if (paused) {
        ctx.fillStyle = "rgba(10,6,32,.72)"; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#f6f0ff"; ctx.textAlign = "center"; ctx.font = `400 ${Math.max(16, T * .4)}px "Press Start 2P", ui-monospace, monospace`;
        ctx.fillText("PAUSED", W / 2, H / 2); ctx.font = `600 ${Math.max(14, T * .26)}px system-ui, sans-serif`; ctx.fillText("Space to keep going", W / 2, H / 2 + T * .6);
      }
    }
    function frame(now) {
      if (stopped) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min(.1, (now - (last || now)) / 1000); last = now;
      for (const p of sparks) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 20 * dt; p.life -= dt * 1.6; }
      sparks = sparks.filter(p => p.life > 0);
      if (!paused && !finished) {
        if (deadAt) { if (now - deadAt > 700) respawn(); }
        else {
          const speed = Math.max(1, (o.speedup && o.speedup()) || 1);
          acc += dt * speed;
          while (acc >= DT && st.alive && !finished) { acc -= DT; physics(); }
          if (!st.alive || finished) acc = 0;
        }
        const wantY = Math.max(0, st.y - 3.6);
        camY += (wantY - camY) * Math.min(1, dt * 4);
      }
      draw(now);
    }
    raf = requestAnimationFrame(frame);

    return {
      stop() { stopped = true; cancelAnimationFrame(raf); document.removeEventListener("keydown", kd, true); document.removeEventListener("keyup", ku, true); canvas.removeEventListener("pointerdown", pd); removeEventListener("pointerup", pu); removeEventListener("pointercancel", pu); removeEventListener("blur", blur); if (ro) ro.disconnect(); },
      pause(v) { paused = !!v; },
      checkpoints(v) { cpOn = !!v; if (cpOn) cpUsed = true; },
      get state() { return { x: st.x, t: st.t, crashes, pieces: got.size, alive: st.alive, mode: st.mode, finished, secret: secretGot, checkpoints: cpOn, air: st.air, grounded: st.grounded, speed: L.speed }; }
    };
  }

  Kit.runner = { sim: { DT, PHYS, Level, start, step, clone, solve }, generate, play };
})(window.Kit = window.Kit || {});
