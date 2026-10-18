/**
 * @file games/mini-game-survival/scene.js
 * @about Everything Mini Game Survival draws in the scene window (plus the hint bubble that appears when a player seems stuck): story scenes (T-Rexy's faces, hops, and double hops, Shadowspine on the clouds with his evil laugh and moving jaw, Nova, the ship, the family, and the dinosaurs' cute recorded noises, each in its own voice), shooting stars, comets, satellites, and tiny rockets crossing the sky now and then, T-Rexy sitting in the ship's cockpit in whatever he's wearing, the walkable crash pad with its portals, the Wave Rider bonus level (T-Rexy on a neon board over the hills, under a neon sunset), the ship wreck (smoking and cracked at first, with cartoon scrap all around, fixed a little more with every part, floating and glowing once it's done), and Easter eggs (poke Shadowspine, type ROAR, tiny footprints, a hidden glitch message), and the obstacle runs (with a flip on every double hop, and the music kept in time with the run). T-Rexy is drawn in whatever looks he has on (hats, back items, colors). Also the music, the toggles, the top bar, and toasts.
 * @requires kit/runner.js, kit/wave-rider.js, kit/side-hub.js, kit/groove.js, kit/voices.js, kit/sky-events.js, assets/style/ink.js, assets/characters/trexy.js, assets/characters/nova.js, assets/ship/glitch-ship.js, assets/worlds/glitch-nebula.js, games/mini-game-survival/state.js
 */
const nebula = Kit.art.nebula.create();
const sky = Kit.skyEvents.create(); // shooting stars and friends on the story screens
const THEMES = Kit.art.nebula.THEMES;
const music = Kit.groove.create(Kit.songs);
const toastEl = $("#toast"), toast = Kit.ui.toaster(toastEl);

/* Hints, only when a player seems stuck. [Key] in a hint shows as a key button. A hint can also be a tip() from touch.js,
   with keyboard words and touch-screen words; the right ones are picked when it shows. */
const hintEl = $("#hint");
let hintIdle = { text: "", ms: 0, timer: 0 }, hintHide = 0;
const keyHtml = text => esc(text).replace(/\[([^\]]+)\]/g, (m, k) => `<span class="kbd">${k}</span>`);
function showHint(text, ms = 6500) {
  hintEl.innerHTML = `<b>Hint:</b> ${keyHtml(typeof text === "function" ? text() : text)}`; hintEl.classList.add("on");
  clearTimeout(hintHide); if (ms) hintHide = setTimeout(() => hintEl.classList.remove("on"), ms);
}
function hideHint() { clearTimeout(hintHide); hintEl.classList.remove("on"); }
// Shows a hint after the player does nothing for a while on this screen. Doing anything hides it and starts the wait again.
function hintIfIdle(text, ms) { clearTimeout(hintIdle.timer); hintIdle = { text, ms, timer: setTimeout(() => showHint(text, 0), ms) }; }
function clearHints() { clearTimeout(hintIdle.timer); hintIdle = { text: "", ms: 0, timer: 0 }; hideHint(); }
function hintActivity() {
  if (!hintIdle.text) return;
  hideHint(); clearTimeout(hintIdle.timer);
  hintIdle.timer = setTimeout(() => showHint(hintIdle.text, 0), hintIdle.ms);
}
document.addEventListener("keydown", hintActivity, true);
document.addEventListener("pointerdown", hintActivity, true);
const THEME_SONG = { night: "lullaby", whirl: "whirl", hub: "glitchHub", echo: "echo", fern: "fern", lantern: "lantern", shadow: "shadowRun", valley: "homeStomp" };

/* Images: SVG art turned into pictures the canvas can draw */
const IMG = new Map();
function img(key, url) {
  let im = IMG.get(key);
  if (!im) { im = new Image(); im.src = url; IMG.set(key, im); }
  return im;
}
const heroImg = (o = {}) => img(`t|${o.pose || "stand"}|${o.face || "smile"}|${o.acc || "none"}|${o.who || "trexy"}|${o.flip ? 1 : 0}|${o.back || ""}|${o.skin || ""}|${o.outfit || ""}`, Kit.art.trexy.url(o, 240));
const novaImg = (o = {}) => img(`n|${o.face || "smile"}|${o.flip ? 1 : 0}`, Kit.art.nova.url(o, 200));
// T-Rexy wearing his looks (see LOOK in state.js). h = his height; a tall hat's picture has extra room on top, so it's drawn taller.
function drawTrexy(ctx, o, x, y, h) {
  const opts = { ...o, ...lookOpts(o.acc) };
  drawImg(ctx, heroImg(opts), x, y, Kit.art.trexy.isTall(opts) ? h * 1.3 : h);
}
// T-Rexy in the cockpit, in his color, his outfit, and any hat that fits under the glass (tall pointy hats and the mohawk stay
// in his closet while he flies; the outfit's surfboard and potion stay out of the cockpit too).
const PILOT_HATS = new Set(["helmet", "shades", "crown", "headphones", "goggles"]);
const pilotOf = face => {
  const outfitHat = (Kit.art.trexy.OUTFITS[LOOK.outfit] || {}).hat || "";
  return Kit.art.trexy.pilot({ face, skin: LOOK.skin, outfit: LOOK.outfit, acc: PILOT_HATS.has(LOOK.head) ? LOOK.head : "none", outfitHat: PILOT_HATS.has(outfitHat) });
};
// The ship picture. pilot = T-Rexy's face in the cockpit ("" for an empty cockpit); face = the ship's own face once it's alive.
// scale = the largest the pilot may be (the end ride keeps him the same size as his family riding on the hull).
const shipImg = (flame, pilot = "smile", face = "", scale = 0) => img(`s|${JSON.stringify(shipCfg())}|${flame ? 1 : 0}|${pilot ? `${pilot}|${LOOK.skin}|${LOOK.head}|${LOOK.outfit}|${scale}` : 0}|${face}`, SHIP.url(shipCfg(), { flame, ghost: !allParts(), pilot: pilot ? pilotOf(pilot) : null, pilotScale: scale || 0, face }, 320));
function drawImg(ctx, im, x, y, h, anchor = "bottom") {
  if (!im.complete || !im.naturalWidth) return;
  const w = h * im.naturalWidth / im.naturalHeight;
  ctx.drawImage(im, x - w / 2, anchor === "bottom" ? y - h : y - h / 2, w, h);
}
// Loads the pictures of T-Rexy in his current looks ahead of time, so they're ready when he first moves.
function warmLook() {
  ["smile", "blink", "happy", "excited", "worried", "surprised", "think", "dizzy", "sleepy"].forEach(f => heroImg({ face: f, ...lookOpts() }));
  [false, true].forEach(fl => ["run1", "run2", "stand"].forEach(p => ["smile", "blink", "excited"].forEach(f => heroImg({ pose: p, face: f, flip: fl, ...lookOpts() }))));
  ["run1", "run2", "hop"].forEach(p => ["happy", "excited", "determined", "blink"].forEach(f => heroImg({ pose: p, face: f, ...lookOpts() })));
}
function warmImages() {
  warmLook();
  ["smile", "blink", "happy", "worried", "surprised", "think", "dizzy", "sleepy"].forEach(f => { heroImg({ face: f }); heroImg({ face: f, acc: "cap" }); });
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
const ST = { theme: "night", face: "smile", acc: "none", nova: false, novaFace: "surprised", shadow: 0, lantern: false, ship: false, family: false, shipFace: "", ride: false };
let faceOverride = null, faceUntil = 0, hopAt = -1e9, hopKind = 1, shrinkFrom = 0, shrinkAt = 0, shadowSay = { text: "", until: 0 }, flinchAt = -1e9;
let laughUntil = 0, talkUntil = 0, shipTalkUntil = 0;
// Zoomasaurus talks in happy beeps and wiggles while he does.
function shipTalk() {
  shipTalkUntil = performance.now() + 1100;
  [0, 1, 2, 3, 4].forEach(i => Kit.audio.tone(700 + ((i * 377) % 900), .07, i % 2 ? "square" : "sine", .035, i * .1, 900 + ((i * 523) % 1100)));
}
function shipFaceNow(now) { return ST.shipFace === "awake" && now % 3400 < 150 ? "blink" : ST.shipFace; }
let themeShown = "";
function applyStage(st) {
  for (const k of Object.keys(ST)) if (k in st) ST[k] = st[k];
  if ("theme" in st) { scene.setAttribute("aria-label", sceneLabel()); playSong(THEME_SONG[st.theme]); if (st.theme !== themeShown) { themeShown = st.theme; sky.clear(); } } // a new place gets a shooting star soon
}
function sceneLabel() {
  const where = { night: "Fern Valley at night", hub: "the glitchy crash pad", echo: "Echo Rings", fern: "Fern Moon", lantern: "Lantern Lab", whirl: "the Whirlpool Galaxy", shadow: "the Shadow Gate", valley: "Fern Valley at sunrise" }[ST.theme] || "the Glitch Nebula";
  return `T-Rexy in ${where}${ST.shadow ? ", with a giant black Spinosaurus shadow on the clouds" : ""}${ST.nova ? ", with Nova the tiny Spinosaurus" : ""}.`;
}
function express(face, ms = 2000) { faceOverride = face; faceUntil = performance.now() + ms; }
function hop() { hopAt = performance.now(); hopKind = 1; }
function doubleHop() { hopAt = performance.now(); hopKind = 2; }
function flinch() { flinchAt = performance.now(); }
function sayShadow(text, ms = 2600) { shadowSay = { text, until: performance.now() + ms }; shadowTalk(Math.min(ms, 1400)); }
// Shadowspine's voice and jaw: an evil laugh, or a grumbly mutter while he talks. Now and then his jaw clacks by itself.
function shadowLaugh() { laughUntil = performance.now() + Kit.voices.evilLaugh() * 1000; }
function shadowTalk(ms = 1200) { talkUntil = performance.now() + Kit.voices.mutter(ms / 1000) * 1000; }
// Cute recorded dino noises (assets/sounds/dino-chirps.js). Each dinosaur has its own pitch: bigger dinosaurs sound lower.
// noise = a mood (happy, excited, curious) or one noise by name (chirp, ooh, hum, wee, huh, coo). delay is in seconds.
const DINO_PITCH = { trexy: 1, nova: 1.4, dad: .74, mom: .88, sister: 1.22 };
const DINO_MOODS = ["happy", "excited", "curious"];
let noiseAt = 0;
function dinoNoise(who = "trexy", noise = "happy", delay = 0) {
  const when = performance.now() + delay * 1000;
  if (Math.abs(when - noiseAt) < 350) return 0;   // no pile-ups when lots of happy things happen at once
  noiseAt = when;
  const pitch = (DINO_PITCH[who] || 1) * (.96 + Math.random() * .08);
  return Kit.voices.chirp(DINO_MOODS.includes(noise) ? { mood: noise, pitch, at: delay } : { clip: noise, pitch, at: delay });
}
// The whole family cheers, each in their own voice.
function familyCheer(delay = 0) {
  ["dad", "mom", "sister", "trexy"].forEach((w, i) => Kit.voices.chirp({ mood: i % 2 ? "excited" : "happy", pitch: DINO_PITCH[w], at: delay + i * .26 }));
  noiseAt = performance.now() + (delay + .8) * 1000;
}
function shadowAnim(now) {
  if (now < laughUntil) return { jaw: 7 + 17 * (.5 + .5 * Math.sin(now / 42)), shake: 1 };
  if (now < talkUntil) return { jaw: 5 + 11 * Math.abs(Math.sin(now / 80)), shake: 0 };
  const p = (now % 9000) / 9000;
  return { jaw: p > .94 ? 6 + 9 * Math.sin((p - .94) / .06 * Math.PI) : 6, shake: 0 };
}
function startShrink() { shrinkFrom = ST.shadow || 1; shrinkAt = performance.now(); }
const shadowK = (now, base = ST.shadow) => {
  let k = base;
  if (shrinkAt) { const p = Math.min(1, (now - shrinkAt) / 2600); k = shrinkFrom * (1 - p * p); if (p >= 1) { ST.shadow = 0; shrinkAt = 0; k = 0; } }
  const f = (now - flinchAt) / 900; if (f >= 0 && f < 1) k *= 1 - .22 * Math.sin(f * Math.PI);
  return k;
};

let mode = "stage", stageRaf = 0, hubCtl = null, runCtl = null, waveCtl = null, ctx2d = cv.getContext("2d");
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
  if (waveCtl) { waveCtl.stop(); waveCtl = null; }
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
// T-Rexy's face right now: a reaction (express) wins; otherwise the scene's face, with a quick blink every few seconds.
const BLINKS = new Set(["smile", "think", "worried", "surprised", "determined"]);
const blinkAt = now => !reduced && now % 3700 < 130;
function heroFace(now, base = ST.face) {
  if (faceUntil > now && faceOverride) return faceOverride;
  return BLINKS.has(base) && blinkAt(now) ? "blink" : base;
}
function hopY(now, h) {
  if (hopKind === 2) { // a hop, then a second hop from up in the air
    const p = (now - hopAt) / 900; if (p < 0 || p >= 1) return 0;
    if (p < .3) return -Math.sin(p / .3 * Math.PI / 2) * h * .1;
    const q = (p - .3) / .7; return -(h * .1 * (1 - q) + Math.sin(q * Math.PI) * h * .13);
  }
  const p = (now - hopAt) / 520; return p >= 0 && p < 1 ? -Math.sin(p * Math.PI) * h * .12 : 0;
}

function drawStage(ctx, now) {
  const { w, h, dpr } = stageSize || sizeCanvas();
  const k = shadowK(now), th = THEMES[ST.theme] || THEMES.hub;
  nebula.draw(ctx, { w, h, T: h / 7.4, camX: now / 4000, camY: 0, t: now, dpr }, { theme: ST.theme, shadow: k > .01 ? { x: .74, k, lantern: ST.lantern, ...shadowAnim(now) } : null, whisper: ST.theme === "hub",
    sky: (c, v) => sky.draw(c, v, th.blobs) });
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
  if (ST.ride) { drawRide(ctx, w, h, now); drawShadowSay(ctx, w, h, now); return; }
  if (ST.ship) {
    const im = shipImg(false, "", shipFaceNow(now)), bob = reduced ? 0 : Math.sin(now / 700) * h * .01;
    const wig = !reduced && now < shipTalkUntil ? Math.sin(now / 60) * .08 : 0;
    ctx.save();
    if (ST.family) { ctx.translate(w * .56, h * (ST.shipFace ? .27 : .3) + bob); ctx.rotate(wig); drawImg(ctx, im, 0, 0, h * (ST.shipFace ? .34 : .16), "center"); } // parked up in the sky
    else { ctx.translate(w * .62, gy - h * .04 + bob); ctx.rotate(wig); drawImg(ctx, im, 0, 0, h * .3); }
    ctx.restore();
  }
  const tremble = heroFace(now) === "worried" && !reduced ? Math.sin(now / 45) * 1.2 : 0;
  drawTrexy(ctx, { face: heroFace(now), acc: ST.acc, pose: "stand" }, hx + tremble, hy, heroH);
  if (ST.nova) {
    const onHead = ST.theme === "valley";
    const nx = onHead ? hx - heroH * .05 : w * .6, ny = onHead ? hy - heroH * .74 : gy, nh = onHead ? heroH * .3 : heroH * .38;
    drawImg(ctx, novaImg({ face: onHead ? "happy" : ST.novaFace, flip: !onHead }), nx, ny, nh);
  }
  drawShadowSay(ctx, w, h, now);
}

// The end clip: everybody rides Zoomasaurus in loop-de-loops across the sky, with a sparkly trail.
function drawRide(ctx, w, h, now) {
  const P = q => { const a = q * Math.PI * 2; return [w * (.5 + .34 * Math.sin(a)), h * (.38 + .13 * Math.sin(a * 2))]; };
  const p = reduced ? .2 : (now / 6400) % 1, [x, y] = P(p), [x2, y2] = P(p + .003);
  for (let k = 14; k >= 1; k--) {
    const [tx, ty] = P(p - k * .007);
    ctx.globalAlpha = (1 - k / 15) * .8; ctx.fillStyle = ["#ffe94a", "#ff6be0", "#5cffb0", "#21d9ff"][k % 4];
    ctx.beginPath(); ctx.arc(tx, ty + h * .03, h * .012 * (1 - k / 18), 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  const dir = x2 >= x ? 1 : -1, tilt = Math.max(-.35, Math.min(.35, Math.atan2(y2 - y, Math.abs(x2 - x) + 1e-6)));
  const sh = h * .38, u = sh / 84; // ship picture height, and its drawing units in pixels
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1); ctx.rotate(tilt);
  drawImg(ctx, shipImg(true, "excited", ST.shipFace || "happy", .3), 0, 0, sh, "center");
  // T-Rexy flies from the cockpit; his family rides along the top of the hull behind him, back to front, and Nova rides on Dad's head
  const riders = [[heroImg({ who: "sis", acc: "bow", face: "happy" }), -33, 19], [heroImg({ who: "mom", acc: "flower", face: "happy" }), -25.5, 24], [heroImg({ who: "dad", acc: "glasses", face: "happy" }), -16.5, 27]];
  riders.forEach(([im, rx, rh], i) => { const bounce = reduced ? 0 : Math.sin(now / 160 + i) * u * 1.2; drawImg(ctx, im, rx * u, -17 * u + bounce, rh * u); });
  drawImg(ctx, novaImg({ face: "happy" }), -18 * u, (-17 - 27 * .74) * u + (reduced ? 0 : Math.sin(now / 160 + 2) * u * 1.2), 12 * u);
  ctx.restore();
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
  edgeText(ctx, p.name, x, gy + T * .42, v.w);
  if (open && !done) { const b = reduced ? 0 : Math.abs(Math.sin(now / 300)) * T * .14; ctx.fillStyle = THEMES.hub.pad; ctx.beginPath(); ctx.moveTo(x - T * .16, cy - ry - T * .34 - b); ctx.lineTo(x + T * .16, cy - ry - T * .34 - b); ctx.lineTo(x, cy - ry - T * .12 - b); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function drawHub(ctx, v, hero, bubble) {
  const now = v.t, k = shadowK(now, 1); // Shadowspine always looms over the crash pad
  nebula.draw(ctx, v, { theme: "hub", shadow: k > .01 ? { x: .66 - v.camX * .006, k, lantern: S.done.includes("whirl"), ...shadowAnim(now) } : null, whisper: true });
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
  drawWreck(ctx, v, now);
  for (const id of [...PORTAL_ORDER, "gate"]) drawPortal(ctx, v, PORTALS[id], id, now);
  // T-Rexy
  const pose = hero.walking ? (Math.floor(now / 140) % 2 ? "run1" : "run2") : "stand";
  const hx = (hero.x - v.camX) * v.T;
  drawTrexy(ctx, { pose, face: heroFace(now, "smile"), flip: hero.facing < 0 }, hx, v.ground + hopY(now, v.h), v.T * 1.35);
  if (bubble) drawBubble(ctx, hx, v.ground - v.T * 1.5, bubble.text);
  drawShadowSay(ctx, v.w, v.h, now);
}
// The ship on the crash pad. At first it's a real wreck: nose dug into the ground, smoking, sparking, cracked, with scrap
// all around. Every part T-Rexy brings back fixes it a little more (less tilt, less smoke, fewer cracks and scraps).
// With all four parts and a paint job it floats up off the ground, good as new and glowing.
const WRECK_SCRAP = [[-2.3, .1, .3], [-1.75, .26, .2], [-2.75, .3, .16], [1.55, .2, .18], [-1.3, .32, .14], [1.9, .34, .12]];
function drawWreck(ctx, v, now) {
  const T = v.T, parts = SHIP.PART_ORDER.filter(p => S.parts[p]).length, fixed = parts === SHIP.PART_ORDER.length && !!S.paint;
  const broken = fixed ? 0 : 1 - parts / SHIP.PART_ORDER.length * .8; // 1 = just crashed, .2 = every part on but no paint yet
  const wx = (WRECK_X - v.camX) * T, cy = v.ground - T * .55, tilt = .4 * broken, sink = T * .32 * broken;
  const lift = fixed ? T * .28 + (reduced ? 0 : Math.sin(now / 650) * T * .06) : 0;
  if (fixed) { // a soft glow on the pad under the floating ship
    const g = ctx.createRadialGradient(wx, v.ground, 0, wx, v.ground, T * 1.6);
    g.addColorStop(0, "rgba(92,255,176,.45)"); g.addColorStop(1, "rgba(92,255,176,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(wx, v.ground, T * 1.6, T * .3, 0, 0, Math.PI * 2); ctx.fill();
  }
  // scrap metal on the ground, one less for every part fixed: cartoon metal bits with an ink outline, a shine, and a rivet, like the ship
  const scraps = Math.round(WRECK_SCRAP.length * Math.max(0, broken - .2) / .8);
  WRECK_SCRAP.slice(0, scraps).forEach(([dx, dy, r], i) => {
    const x = wx + dx * T, y = v.ground + dy * T * .4, k = r * T;
    ctx.save(); ctx.translate(x, y); ctx.rotate(i * 1.3);
    ctx.beginPath(); ctx.moveTo(-k, k * .3); ctx.lineTo(-k * .3, -k * .6); ctx.lineTo(k * .8, -k * .2); ctx.lineTo(k * .5, k * .5); ctx.closePath();
    ctx.fillStyle = i % 2 ? "#8a83b8" : "#cfc8ff"; ctx.fill();
    ctx.strokeStyle = Kit.art.ink.INK; ctx.lineWidth = Math.max(1.5, T * .03); ctx.lineJoin = "round"; ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = Math.max(1, T * .018); ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-k * .62, k * .02); ctx.lineTo(-k * .26, -k * .38); ctx.stroke();
    ctx.fillStyle = Kit.art.ink.INK; ctx.beginPath(); ctx.arc(k * .22, k * .08, Math.max(1, k * .09), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  ctx.save(); ctx.translate(wx, cy + sink - lift); ctx.rotate(tilt);
  const sh = T * 1.7, im = shipImg(false, "");
  drawImg(ctx, im, 0, 0, sh, "center");
  // cracks across the hull
  const cracks = Math.ceil(3 * Math.max(0, broken - .2) / .8);
  ctx.strokeStyle = "rgba(10,6,32,.85)"; ctx.lineWidth = Math.max(1.5, T * .035); ctx.lineJoin = "round";
  [[-.55, -.12, 1], [.1, .05, -1], [-.15, -.2, 1]].slice(0, cracks).forEach(([cx, cy2, d]) => {
    ctx.beginPath(); ctx.moveTo(cx * sh, cy2 * sh);
    for (let j = 1; j <= 4; j++) ctx.lineTo((cx + j * .07) * sh, (cy2 + (j % 2 ? .05 : -.02) * d) * sh);
    ctx.stroke();
  });
  ctx.restore();
  // smoke puffs drifting up from the back, and now and then a little spark
  const puffs = Math.ceil(3 * Math.max(0, broken - .15));
  for (let i = 0; i < puffs; i++) {
    const ph = reduced ? i / 3 + .15 : ((now / 1700 + i / 3) % 1);
    const px = wx - T * .55 - ph * T * .5, py = cy + sink - T * .25 - ph * T * 1.7, r = T * (.16 + .3 * ph);
    ctx.globalAlpha = (1 - ph) * .42 * broken; ctx.fillStyle = "#cfc6ee";
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (broken > .5 && !reduced && now % 1100 < 110) {
    ctx.strokeStyle = "#ffe94a"; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + (i - 1.5) * .5; ctx.beginPath(); ctx.moveTo(wx + T * .35, cy + sink - T * .1); ctx.lineTo(wx + T * .35 + Math.cos(a) * T * .3, cy + sink - T * .1 + Math.sin(a) * T * .3); ctx.stroke(); }
  }
  if (fixed && !reduced) for (let i = 0; i < 3; i++) { // a few sparkles around the fixed ship, the same sparkle as everywhere else
    const a = now / 900 + i * 2.1, sx2 = wx + Math.cos(a) * T * 1.4, sy2 = cy - lift + Math.sin(a * 1.3) * T * .5, z = T * .08 * (1 + Math.sin(now / 200 + i));
    if (z > 1) Kit.art.ink.canvasSparkle(ctx, sx2, sy2, z * 1.6);
  }
  const label = fixed ? "Your ship: ready to fly!" : parts ? `Your ship: ${parts} of ${SHIP.PART_ORDER.length} parts fixed` : "Your ship (CRASHED!)";
  ctx.font = `700 ${Math.max(12, T * .2)}px "Baloo 2", system-ui, sans-serif`; ctx.textAlign = "center"; ctx.fillStyle = fixed ? "#5cffb0" : "#b7a9ea"; edgeText(ctx, label, wx, v.ground + T * .42, v.w);
}
// A centered name tag that slides in from the edge instead of being cut off when its thing is half off a narrow screen.
function edgeText(ctx, text, x, y, w) {
  const half = ctx.measureText(text).width / 2 + 6, fit = clamp(x, half, Math.max(half, w - half));
  ctx.fillText(text, Math.abs(fit - x) < half ? fit : x, y);
}
function startHub(onEnter, onFirstMove) {
  stopMode(); mode = "hub";
  ST.theme = "hub"; playSong("glitchHub");
  const stops = [...PORTAL_ORDER, "gate"].map(id => ({ id, x: PORTALS[id].x, open: portalOpen(id) }));
  hubCtl = Kit.sidehub.create(cv, {
    width: HUB_W, start: S.hubX || HERO_START, speed: 4.4, stops,
    draw: drawHub,
    onEnter: s => { S.hubX = hubCtl.hero.x; save(); sfx.liftoff(); onEnter(s); },
    onNear: s => { if (s) sfx.arrive(); },
    onFirstMove: () => { if (!S.moved) { S.moved = true; save(); if (onFirstMove) onFirstMove(); } },
    onTap: (wx, wy) => {
      if (wy < 3.2) return false;
      S.pokes = (S.pokes || 0) + 1; save(); flinch();
      sayShadow(POKES[(S.pokes - 1) % POKES.length]);
      return true;
    },
    onType: typed => {
      if (!typed.endsWith("roar")) return;
      hubCtl.say("Rawr!", 1600); hop(); flinch(); roar(); express("excited", 1600);
      setTimeout(() => sayShadow("EEP! ...I mean, ha ha. Not scared. At ALL."), 500);
      if (!S.roared) { S.roared = true; save(); }
    }
  });
  return hubCtl;
}
const roar = () => { Kit.audio.tone(210, .35, "sawtooth", .05, 0, 120); Kit.audio.tone(300, .25, "square", .02, .05, 160); };

/* Obstacle runs */
// In a run, T-Rexy looks determined in the air, beams when he catches a piece (express), and squashes and stretches:
// a little taller while he rises, a little squished for a moment when he lands.
let runLanded = 0, runWasUp = false;
function heroDraw(ctx, x, y, T, hero) {
  const now = hero.t;
  if (hero.grounded && runWasUp) runLanded = now;
  runWasUp = !hero.grounded;
  if (hero.mode === "ship") {
    ctx.save(); ctx.translate(x, y - T * .3); ctx.rotate(Math.max(-.5, Math.min(.5, -hero.vy * .05)));
    drawImg(ctx, shipImg(true, "determined"), 0, 0, T * 1.15, "center"); ctx.restore();
    return;
  }
  const pose = !hero.grounded ? "hop" : (Math.floor(hero.t / 110) % 2 ? "run1" : "run2");
  ctx.save(); ctx.translate(x, y);
  if (!reduced) {
    const land = now - runLanded < 120 ? 1 - (now - runLanded) / 120 : 0, rise = !hero.grounded && hero.vy > 3 ? Math.min(1, hero.vy / 14) : 0;
    ctx.scale(1 + .12 * land - .06 * rise, 1 - .12 * land + .08 * rise);
  }
  if (hero.spin >= 0 && !reduced) { const c = T * .55; ctx.translate(0, -c); ctx.rotate(hero.spin * Math.PI * 2); ctx.translate(0, c); } // double hop: a flip
  else if (!hero.grounded) ctx.rotate(Math.max(-.3, Math.min(.3, -hero.vy * .018)));
  drawTrexy(ctx, { pose, face: heroFace(now, hero.grounded ? "smile" : "determined") }, 0, 0, T * 1.2);
  ctx.restore();
}
// The Wave Rider bonus level: T-Rexy rides a little neon board over the hills, tipped with the slope (or his flight). On the
// ground he stands on it, leaning forward and looking determined while he dives; in the air he tucks up and grins.
function waveHeroDraw(ctx, x, y, T, hero) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-hero.angle + (hero.grounded && hero.diving ? .16 : 0));
  const bw = T * 1.3, bh = T * .17, bx = -bw * .42, lw = Math.max(1.5, T * .05);
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx, -bh, bw, bh, bh / 2); else ctx.rect(bx, -bh, bw, bh);
  ctx.fillStyle = "#ffe94a"; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = Kit.art.ink.INK; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + bh, -bh / 2); ctx.lineTo(bx + bw - bh, -bh / 2); ctx.strokeStyle = "#ff3ec8"; ctx.lineWidth = Math.max(1.2, bh * .3); ctx.stroke();
  const pose = hero.grounded ? "stand" : "hop";
  const face = hero.grounded ? (hero.diving ? "determined" : "smile") : (hero.air > .5 ? "excited" : "happy");
  drawTrexy(ctx, { pose, face: heroFace(hero.t, face) }, T * .08, -bh * .7, T * 1.2);
  ctx.restore();
}
function startWave(opts) {
  stopMode(); mode = "wave";
  stageEl.classList.add("wide");
  const th = THEMES.surf;
  waveCtl = Kit.waveRider.play(cv, {
    plan: opts.plan, secs: opts.secs, theme: th, tip: opts.tip, label: "Wave Rider", pauseTip: opts.pauseTip,
    drawBackground: (ctx, v) => nebula.draw(ctx, { ...v, dpr: Math.min(2, window.devicePixelRatio || 1) }, { theme: "surf", sky: (c, vv) => sky.draw(c, vv, th.blobs) }),
    drawHero: waveHeroDraw,
    autopilot: () => window.__mgsAutopilot || false,
    speedup: () => window.__mgsSpeedup || 1,
    // the music plays while he rides, stops on a pause, and picks up where the ride picks up
    onClock: (sec, running) => { if (!opts.song) return; if (running) music.restart(opts.song, { at: sec }); else music.hush(); },
    onEvent: opts.onEvent, onFinish: opts.onFinish
  });
  return waveCtl;
}
function startRun(opts) {
  stopMode(); mode = "run";
  stageEl.classList.add("wide");
  const th = THEMES[opts.theme] || THEMES.hub;
  const ctl = Kit.runner.play(cv, {
    gen: opts.gen, theme: th, tip: opts.tip, label: opts.label, have: opts.have, beat: opts.beat,
    drawBackground: (ctx, v) => nebula.draw(ctx, { ...v, dpr: Math.min(2, window.devicePixelRatio || 1) }, { theme: opts.theme, shadow: opts.shadow ? { x: .78, k: .9, lantern: false, ...shadowAnim(v.t) } : null }),
    drawHero: heroDraw,
    autopilot: () => window.__mgsAutopilot || false,
    speedup: () => window.__mgsSpeedup || 1,
    drop: () => window.__mgsDrop || 0, // play-test hook: miss this many pieces on purpose
    // The music keeps time with the run: it starts on GO, stops on a crash or pause, and picks up where the run picks up.
    onClock: (sec, running) => { if (!opts.song) return; if (running) music.restart(opts.song, { at: sec }); else music.hush(); },
    onCrash: opts.onCrash, onCollect: opts.onCollect, onMode: opts.onMode, onDouble: opts.onDouble, onPerfect: opts.onPerfect, onFinish: opts.onFinish
  });
  runCtl = ctl;
  return ctl;
}
