/**
 * @file games/mini-game-survival/scene.js
 * @about Everything Mini Game Survival draws in the scene window: story scenes (T-Rexy's faces and hops, Shadowspine on the clouds, Nova, the ship, the family), the walkable crash pad with its portals and Easter eggs (poke Shadowspine, type ROAR, tiny footprints, a hidden glitch message), and the obstacle runs. Also the music, the toggles, the top bar, and toasts.
 * @requires kit/runner.js, kit/side-hub.js, kit/music.js, assets/characters/trexy.js, assets/characters/nova.js, assets/ship/glitch-ship.js, assets/worlds/glitch-nebula.js, games/mini-game-survival/state.js
 */
const nebula = Kit.art.nebula.create();
const THEMES = Kit.art.nebula.THEMES;
const music = Kit.music.create(Kit.songs);
const toastEl = $("#toast"), toast = Kit.ui.toaster(toastEl);
const THEME_SONG = { night: "lullaby", whirl: "whirl", hub: "glitchHub", echo: "echo", fern: "fern", lantern: "lantern", shadow: "shadowRun", valley: "homeStomp" };

/* Images: SVG art turned into pictures the canvas can draw */
const IMG = new Map();
function img(key, url) {
  let im = IMG.get(key);
  if (!im) { im = new Image(); im.src = url; IMG.set(key, im); }
  return im;
}
const heroImg = (o = {}) => img(`t|${o.pose || "stand"}|${o.face || "smile"}|${o.acc || "none"}|${o.who || "trexy"}|${o.flip ? 1 : 0}`, Kit.art.trexy.url(o, 240));
const novaImg = (o = {}) => img(`n|${o.face || "smile"}|${o.flip ? 1 : 0}`, Kit.art.nova.url(o, 200));
const pilotHead = `<g transform="translate(13,-14) scale(.27)">${Kit.art.trexy.g({ face: "happy" })}</g>`;
const shipImg = (flame, pilot = true) => img(`s|${JSON.stringify(shipCfg())}|${flame ? 1 : 0}|${pilot ? 1 : 0}`, SHIP.url(shipCfg(), { flame, ghost: !allParts(), pilot: pilot ? pilotHead : "" }, 320));
function drawImg(ctx, im, x, y, h, anchor = "bottom") {
  if (!im.complete || !im.naturalWidth) return;
  const w = h * im.naturalWidth / im.naturalHeight;
  ctx.drawImage(im, x - w / 2, anchor === "bottom" ? y - h : y - h / 2, w, h);
}
function warmImages() {
  ["smile", "happy", "worried", "surprised", "think", "dizzy", "sleepy"].forEach(f => { heroImg({ face: f }); heroImg({ face: f, acc: "cap" }); });
  ["run1", "run2", "hop"].forEach(p => heroImg({ pose: p, face: "smile" }));
  [false, true].forEach(fl => ["run1", "run2", "stand"].forEach(p => heroImg({ pose: p, face: "smile", flip: fl })));
  novaImg({ face: "surprised", flip: true }); novaImg({ face: "happy", flip: true });
}

/* Top bar */
function paintHud() {
  const ul = $("#partSlots");
  ul.querySelectorAll(".slot").forEach(x => x.remove());
  SHIP.PART_ORDER.forEach(k => ul.insertAdjacentHTML("beforeend", `<li class="slot ${S.parts[k] ? "on" : ""}" data-part="${k}" title="${esc(SHIP.PARTS[k].name)}">${SHIP.partIcons[k]}</li>`));
  $("#clueCount b").textContent = `${S.clues.length}/4`;
}

/* Music and sound toggles */
let musicOn = store.get(KEYS.music, "on") !== "off", soundOn = store.get(KEYS.sound, "on") !== "off";
function paintToggles() {
  const mb = $("#musicBtn"), sb = $("#soundBtn");
  mb.textContent = musicOn ? "Music on" : "Music off"; mb.setAttribute("aria-pressed", musicOn);
  sb.textContent = soundOn ? "Sound on" : "Sound off"; sb.setAttribute("aria-pressed", soundOn);
}
$("#musicBtn").addEventListener("click", () => { musicOn = !musicOn; store.set(KEYS.music, musicOn ? "on" : "off"); music.setEnabled(musicOn); paintToggles(); });
$("#soundBtn").addEventListener("click", () => { soundOn = !soundOn; store.set(KEYS.sound, soundOn ? "on" : "off"); Kit.audio.setEnabled(soundOn); paintToggles(); });
music.setEnabled(musicOn); Kit.audio.setEnabled(soundOn); paintToggles();
Kit.audio.onFirstGesture(() => music.unlock());
const songsOwned = () => store.get(KEYS.songs, []) || [];
function collectSong(id) { const s = songsOwned(); if (!s.includes(id)) { s.push(id); store.set(KEYS.songs, s); } }
function playSong(id) { if (id) music.set(id); }

/* Story stage */
const ST = { theme: "night", face: "smile", acc: "none", nova: false, novaFace: "surprised", shadow: 0, lantern: false, ship: false, family: false };
let faceOverride = null, faceUntil = 0, hopAt = -1e9, shrinkFrom = 0, shrinkAt = 0, shadowSay = { text: "", until: 0 }, flinchAt = -1e9;
function applyStage(st) {
  for (const k of Object.keys(ST)) if (k in st) ST[k] = st[k];
  if ("theme" in st) { scene.setAttribute("aria-label", sceneLabel()); playSong(THEME_SONG[st.theme]); }
}
function sceneLabel() {
  const where = { night: "Fern Valley at night", hub: "the glitchy crash pad", echo: "Echo Rings", fern: "Fern Moon", lantern: "Lantern Lab", whirl: "the Whirlpool Galaxy", shadow: "the Shadow Gate", valley: "Fern Valley at sunrise" }[ST.theme] || "the Glitch Nebula";
  return `T-Rexy in ${where}${ST.shadow ? ", with a giant black Spinosaurus shadow on the clouds" : ""}${ST.nova ? ", with Nova the tiny Spinosaurus" : ""}.`;
}
function express(face, ms = 2000) { faceOverride = face; faceUntil = performance.now() + ms; }
function hop() { hopAt = performance.now(); }
function flinch() { flinchAt = performance.now(); }
function sayShadow(text, ms = 2600) { shadowSay = { text, until: performance.now() + ms }; }
function startShrink() { shrinkFrom = ST.shadow || 1; shrinkAt = performance.now(); }
const shadowK = (now, base = ST.shadow) => {
  let k = base;
  if (shrinkAt) { const p = Math.min(1, (now - shrinkAt) / 2600); k = shrinkFrom * (1 - p * p); if (p >= 1) { ST.shadow = 0; shrinkAt = 0; k = 0; } }
  const f = (now - flinchAt) / 900; if (f >= 0 && f < 1) k *= 1 - .22 * Math.sin(f * Math.PI);
  return k;
};

let mode = "stage", stageRaf = 0, hubCtl = null, runCtl = null, ctx2d = cv.getContext("2d");
function sizeCanvas() {
  const r = cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.max(1, Math.round(r.width * d)); cv.height = Math.max(1, Math.round(r.height * d));
  ctx2d.setTransform(d, 0, 0, d, 0, 0);
  return { w: r.width, h: r.height, dpr: d };
}
let stageSize = null;
try { new ResizeObserver(() => { if (mode === "stage") stageSize = sizeCanvas(); }).observe(cv); } catch (e) { addEventListener("resize", () => { if (mode === "stage") stageSize = sizeCanvas(); }); }

function stopMode() {
  cancelAnimationFrame(stageRaf); stageRaf = 0;
  if (hubCtl) { hubCtl.stop(); hubCtl = null; }
  if (runCtl) { runCtl.stop(); runCtl = null; }
  stageEl.classList.remove("wide"); scene.classList.remove("jigmode");
  $("#runUi").innerHTML = ""; $("#boardHost").innerHTML = "";
}
function startStage() {
  if (mode === "stage" && stageRaf) return;
  stopMode(); mode = "stage"; stageSize = sizeCanvas();
  const loop = now => { stageRaf = requestAnimationFrame(loop); drawStage(ctx2d, now); };
  stageRaf = requestAnimationFrame(loop);
}
function drawFloor(ctx, w, h, gy, th, camX = 0, T = 60) {
  const g = ctx.createLinearGradient(0, gy, 0, h); g.addColorStop(0, th.block); g.addColorStop(1, "#05020f");
  ctx.fillStyle = g; ctx.fillRect(0, gy, w, h - gy);
  ctx.fillStyle = th.edge; ctx.globalAlpha = .9; ctx.fillRect(0, gy, w, 4); ctx.globalAlpha = .16;
  ctx.strokeStyle = th.edge; ctx.lineWidth = 1;
  const off = ((camX * T) % 60 + 60) % 60;
  for (let x = -off - 60; x < w + 120; x += 60) { ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x - (x - w / 2) * .5, h); ctx.stroke(); }
  for (let i = 1; i < 4; i++) { const y = gy + (h - gy) * (i / 4) ** 1.6; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  ctx.globalAlpha = 1;
}
function drawBubble(ctx, x, y, text, color = "#f6f0ff", ink = "#1a0420") {
  ctx.save(); ctx.font = `700 ${Math.max(15, Math.min(22, ctx.canvas.height / 40))}px "Baloo 2", system-ui, sans-serif`;
  const w = ctx.measureText(text).width + 26, hh = 34;
  const bx = Math.max(6, Math.min(ctx.canvas.width / (window.devicePixelRatio || 1) - w - 6, x - w / 2));
  ctx.fillStyle = color; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx, y - hh, w, hh, 14); else ctx.rect(bx, y - hh, w, hh); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 8, y - 1); ctx.lineTo(x, y + 10); ctx.lineTo(x + 8, y - 1); ctx.fill();
  ctx.fillStyle = ink; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, bx + w / 2, y - hh / 2 + 1);
  ctx.restore();
}
function drawShadowSay(ctx, w, h, now) {
  if (shadowSay.until < now) return;
  ctx.save(); ctx.font = `800 ${Math.max(16, h / 28)}px "Baloo 2", system-ui, sans-serif`; ctx.textAlign = "center";
  ctx.lineWidth = 5; ctx.strokeStyle = "#1a0420"; ctx.strokeText(shadowSay.text, w * .62, h * .12);
  ctx.fillStyle = "#ffd1e6"; ctx.fillText(shadowSay.text, w * .62, h * .12); ctx.restore();
}
function heroFace(now) { return faceUntil > now && faceOverride ? faceOverride : ST.face; }
function hopY(now, h) { const p = (now - hopAt) / 520; return p >= 0 && p < 1 ? -Math.sin(p * Math.PI) * h * .12 : 0; }

function drawStage(ctx, now) {
  const { w, h, dpr } = stageSize || sizeCanvas();
  const k = shadowK(now), th = THEMES[ST.theme] || THEMES.hub;
  nebula.draw(ctx, { w, h, T: h / 7.4, camX: now / 4000, camY: 0, t: now, dpr }, { theme: ST.theme, shadow: k > .01 ? { x: .74, k, lantern: ST.lantern } : null, whisper: ST.theme === "hub" });
  if (k <= .01 && ST.lantern && !ST.nova) { // the lantern stays where the shadow was
    const lx = w * .73, ly = h * .9, r = h * .05, g = ctx.createRadialGradient(lx, ly, 0, lx, ly, r * 3);
    g.addColorStop(0, "#fff6c2"); g.addColorStop(.4, "#ffd43b99"); g.addColorStop(1, "#ffd43b00"); ctx.fillStyle = g; ctx.fillRect(lx - r * 3, ly - r * 3, r * 6, r * 6);
  }
  const gy = h * .88;
  drawFloor(ctx, w, h, gy, th, now / 4000, h / 7.4);
  const heroH = h * (ST.family ? .34 : .42), hx = w * (ST.family ? .2 : ST.ship ? .22 : .26), hy = gy + hopY(now, h);
  if (ST.family) { // the welcome-home hug: everybody a little smaller so the whole family fits
    drawImg(ctx, heroImg({ who: "dad", acc: "glasses", face: "happy", flip: true }), w * .88, gy, h * .33);
    drawImg(ctx, heroImg({ who: "mom", acc: "flower", face: "happy", flip: true }), w * .7, gy, h * .31);
    drawImg(ctx, heroImg({ who: "sis", acc: "bow", face: "happy", flip: true }), w * .5, gy, h * .23);
  }
  if (ST.ship) {
    const im = shipImg(false, false), bob = reduced ? 0 : Math.sin(now / 700) * h * .01;
    if (ST.family) drawImg(ctx, im, w * .56, h * .3 + bob, h * .16, "center"); // parked up in the sky
    else drawImg(ctx, im, w * .62, gy - h * .04 + bob, h * .3);
  }
  const tremble = heroFace(now) === "worried" && !reduced ? Math.sin(now / 45) * 1.2 : 0;
  drawImg(ctx, heroImg({ face: heroFace(now), acc: ST.acc, pose: "stand" }), hx + tremble, hy, heroH);
  if (ST.nova) {
    const onHead = ST.theme === "valley";
    const nx = onHead ? hx - heroH * .05 : w * .6, ny = onHead ? hy - heroH * .74 : gy, nh = onHead ? heroH * .3 : heroH * .38;
    drawImg(ctx, novaImg({ face: onHead ? "happy" : ST.novaFace, flip: !onHead }), nx, ny, nh);
  }
  drawShadowSay(ctx, w, h, now);
}

/* The crash pad (hub) */
function portalOpen(id) {
  if (id === "gate") return allParts() && !!S.paint;
  return id === nextPortal();
}
function drawPortal(ctx, v, p, id, now) {
  const x = (p.x - v.camX) * v.T, gy = v.ground, T = v.T, done = S.done.includes(id), open = portalOpen(id);
  const rx = T * .62, ry = T * 1.15, cy = gy - ry;
  ctx.save();
  ctx.globalAlpha = done ? .55 : open ? 1 : .32;
  const col = done ? "#5cffb0" : p.color;
  ctx.strokeStyle = col; ctx.lineWidth = T * .18; ctx.globalAlpha *= .35; ctx.beginPath(); ctx.ellipse(x, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = done ? .55 : open ? 1 : .32; ctx.lineWidth = T * .06; ctx.stroke();
  const spin = reduced ? 0 : now / 900;
  ctx.fillStyle = col + "26"; ctx.beginPath(); ctx.ellipse(x, cy, rx * .9, ry * .92, 0, 0, Math.PI * 2); ctx.fill();
  if (open && !reduced) { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.globalAlpha = .6; ctx.beginPath(); ctx.ellipse(x, cy, rx * .6, ry * .6, spin, 0, Math.PI * 1.4); ctx.stroke(); ctx.globalAlpha = 1; }
  // icon
  ctx.globalAlpha = done ? .8 : open ? 1 : .4; ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineCap = "round";
  const ix = x, iy = cy, s = T * .26;
  if (done) { ctx.beginPath(); ctx.moveTo(ix - s, iy); ctx.lineTo(ix - s * .2, iy + s * .8); ctx.lineTo(ix + s, iy - s * .8); ctx.stroke(); }
  else if (p.icon === "note") { ctx.beginPath(); ctx.ellipse(ix - s * .3, iy + s * .6, s * .45, s * .32, -.3, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(ix + s * .1, iy + s * .5); ctx.lineTo(ix + s * .1, iy - s); ctx.lineTo(ix + s * .7, iy - s * .6); ctx.stroke(); }
  else if (p.icon === "fern") { ctx.beginPath(); ctx.moveTo(ix - s * .6, iy + s); ctx.quadraticCurveTo(ix, iy, ix + s * .4, iy - s); ctx.stroke(); for (let i = 0; i < 4; i++) { const t = .25 + i * .2, px = ix - s * .6 + s * t, py = iy + s - s * 2 * t; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - s * .5, py - s * .1); ctx.moveTo(px, py); ctx.lineTo(px + s * .4, py - s * .4); ctx.stroke(); } }
  else if (p.icon === "lamp") { ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? s * .45 : s; ctx.lineTo(ix + Math.cos(a) * r, iy + Math.sin(a) * r); } ctx.closePath(); ctx.fill(); }
  else if (p.icon === "spiral") { ctx.beginPath(); for (let i = 0; i <= 30; i++) { const a = i / 30 * Math.PI * 4 + spin, r = s * i / 30; ctx.lineTo(ix + Math.cos(a) * r, iy + Math.sin(a) * r); } ctx.stroke(); }
  else if (p.icon === "gate") { ctx.fillStyle = "#000"; ctx.beginPath(); ctx.ellipse(x, cy, rx * .8, ry * .85, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke(); }
  if (!open && !done) { ctx.globalAlpha = .7; ctx.fillStyle = "#b7a9ea"; ctx.fillRect(ix - s * .45, iy + ry * .45, s * .9, s * .7); ctx.strokeStyle = "#b7a9ea"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(ix, iy + ry * .45, s * .3, Math.PI, 0); ctx.stroke(); }
  // name tag
  ctx.globalAlpha = done ? .7 : open ? 1 : .55;
  ctx.font = `700 ${Math.max(12, T * .2)}px "Baloo 2", system-ui, sans-serif`; ctx.textAlign = "center"; ctx.fillStyle = "#f6f0ff";
  ctx.fillText(p.name, x, gy + T * .42);
  if (open && !done) { const b = reduced ? 0 : Math.abs(Math.sin(now / 300)) * T * .14; ctx.fillStyle = THEMES.hub.pad; ctx.beginPath(); ctx.moveTo(x - T * .16, cy - ry - T * .34 - b); ctx.lineTo(x + T * .16, cy - ry - T * .34 - b); ctx.lineTo(x, cy - ry - T * .12 - b); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function drawHub(ctx, v, hero, bubble) {
  const now = v.t, k = shadowK(now, 1); // Shadowspine always looms over the crash pad
  nebula.draw(ctx, v, { theme: "hub", shadow: k > .01 ? { x: .66 - v.camX * .006, k, lantern: S.done.includes("whirl") } : null, whisper: true });
  const th = THEMES.hub;
  drawFloor(ctx, v.w, v.h, v.ground, th, v.camX, v.T);
  // tiny footprints (they show up after Fern Moon): three toes each, leading off toward the light
  if (S.done.includes("fern")) {
    ctx.save(); ctx.fillStyle = "#36c9d8"; ctx.globalAlpha = .75;
    for (let i = 0; i < 14; i++) { const fx = (20.5 + i * 1.05 - v.camX) * v.T, fy = v.ground + v.T * (.18 + (i % 2) * .14), s = v.T * .05;
      ctx.beginPath(); ctx.ellipse(fx, fy, s * 1.3, s, 0, 0, Math.PI * 2); ctx.fill();
      for (let t = -1; t <= 1; t++) { ctx.beginPath(); ctx.arc(fx + s * 1.4, fy + t * s * 1.1, s * .5, 0, Math.PI * 2); ctx.fill(); } }
    ctx.restore();
  }
  // the ship wreck in the middle of the pad
  const wx = (WRECK_X - v.camX) * v.T, tilt = allParts() ? 0 : -.18;
  ctx.save(); ctx.translate(wx, v.ground - v.T * .55); ctx.rotate(tilt); drawImg(ctx, shipImg(false, false), 0, 0, v.T * 1.7, "center"); ctx.restore();
  ctx.font = `700 ${Math.max(12, v.T * .2)}px "Baloo 2", system-ui, sans-serif`; ctx.textAlign = "center"; ctx.fillStyle = "#b7a9ea"; ctx.fillText("Your ship", wx, v.ground + v.T * .42);
  for (const id of [...PORTAL_ORDER, "gate"]) drawPortal(ctx, v, PORTALS[id], id, now);
  // T-Rexy
  const pose = hero.walking ? (Math.floor(now / 140) % 2 ? "run1" : "run2") : "stand";
  const hx = (hero.x - v.camX) * v.T;
  drawImg(ctx, heroImg({ pose, face: heroFace(now) === "worried" ? "worried" : "smile", flip: hero.facing < 0 }), hx, v.ground + hopY(now, v.h), v.T * 1.35);
  if (bubble) drawBubble(ctx, hx, v.ground - v.T * 1.5, bubble.text);
  drawShadowSay(ctx, v.w, v.h, now);
}
function startHub(onEnter, onFirstMove) {
  stopMode(); mode = "hub";
  ST.theme = "hub"; playSong("glitchHub");
  const stops = [...PORTAL_ORDER, "gate"].map(id => ({ id, x: PORTALS[id].x, open: portalOpen(id) }));
  hubCtl = Kit.sidehub.create(cv, {
    width: HUB_W, start: S.hubX || WRECK_X, speed: 4.4, stops,
    draw: drawHub,
    onEnter: s => { S.hubX = hubCtl.hero.x; save(); sfx.liftoff(); onEnter(s); },
    onNear: s => { if (s) sfx.arrive(); },
    onFirstMove: () => { if (!S.moved) { S.moved = true; save(); if (onFirstMove) onFirstMove(); } },
    onTap: (wx, wy) => {
      if (wy < 3.2) return false;
      S.pokes = (S.pokes || 0) + 1; save(); flinch();
      sayShadow(POKES[(S.pokes - 1) % POKES.length]); sfx.beep();
      return true;
    },
    onType: typed => {
      if (!typed.endsWith("roar")) return;
      hubCtl.say("Rawr!", 1600); hop(); flinch(); roar();
      setTimeout(() => sayShadow("EEP! ...I mean, ha ha. Not scared. At ALL."), 500);
      if (!S.roared) { S.roared = true; save(); }
    }
  });
  return hubCtl;
}
const roar = () => { Kit.audio.tone(210, .35, "sawtooth", .05, 0, 120); Kit.audio.tone(300, .25, "square", .02, .05, 160); };

/* Obstacle runs */
function heroDraw(ctx, x, y, T, hero) {
  if (hero.mode === "ship") {
    ctx.save(); ctx.translate(x, y - T * .3); ctx.rotate(Math.max(-.5, Math.min(.5, -hero.vy * .05)));
    drawImg(ctx, shipImg(true), 0, 0, T * 1.15, "center"); ctx.restore();
    return;
  }
  const pose = !hero.grounded ? "hop" : (Math.floor(hero.t / 110) % 2 ? "run1" : "run2");
  ctx.save(); ctx.translate(x, y);
  if (!hero.grounded) ctx.rotate(Math.max(-.3, Math.min(.3, -hero.vy * .018)));
  drawImg(ctx, heroImg({ pose, face: "smile" }), 0, 0, T * 1.2);
  ctx.restore();
}
function startRun(opts) {
  stopMode(); mode = "run";
  stageEl.classList.add("wide");
  const th = THEMES[opts.theme] || THEMES.hub;
  const ctl = Kit.runner.play(cv, {
    gen: opts.gen, theme: th, tip: opts.tip,
    drawBackground: (ctx, v) => nebula.draw(ctx, { ...v, dpr: Math.min(2, window.devicePixelRatio || 1) }, { theme: opts.theme, shadow: opts.shadow ? { x: .78, k: .9, lantern: false } : null }),
    drawHero: heroDraw,
    autopilot: () => window.__mgsAutopilot || false,
    speedup: () => window.__mgsSpeedup || 1,
    onAttempt: opts.onAttempt, onCrash: opts.onCrash, onCollect: opts.onCollect, onMode: opts.onMode, onFinish: opts.onFinish
  });
  runCtl = ctl;
  return ctl;
}
