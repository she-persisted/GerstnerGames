/**
 * @file games/starward/scene.js
 * @about Starward's stage controls: switching worlds, turning side-view Lumina, the robot's faces and hops, friends joining, the courage bar, the friends bar, the rocket pictures, the starfield, toasts, and the music and sound buttons.
 * @requires kit/starfield.js, kit/music.js, kit/audio.js, assets/characters/puppy.js, assets/characters/portraits.js, assets/rocket/rocket.js, games/starward/state.js
 */
const stars = Kit.starfield.create($("#stars"), { color: TOK.starlight });
const toast = Kit.ui.toaster($("#toast"));
$("#dogArt").innerHTML = Kit.art.puppy();

/* Sound and music */
let soundOn = store.get(KEYS.sound, "on") !== "off";
let musicOn = store.get(KEYS.music, "on") !== "off";
Kit.audio.setEnabled(soundOn);
const music = Kit.music.create(Kit.songs);
music.setEnabled(musicOn);
Kit.audio.onFirstGesture(() => music.unlock());
const musicBtn = $("#musicBtn"), soundBtn = $("#soundBtn");
function paintToggles() {
  musicBtn.textContent = musicOn ? "Music on" : "Music off"; musicBtn.setAttribute("aria-pressed", String(musicOn));
  soundBtn.textContent = soundOn ? "Sound on" : "Sound off"; soundBtn.setAttribute("aria-pressed", String(soundOn));
}
musicBtn.addEventListener("click", () => { musicOn = !musicOn; store.set(KEYS.music, musicOn ? "on" : "off"); music.setEnabled(musicOn); paintToggles(); renderJukebox(); });
soundBtn.addEventListener("click", () => { soundOn = !soundOn; store.set(KEYS.sound, soundOn ? "on" : "off"); Kit.audio.setEnabled(soundOn); paintToggles(); if (soundOn) sfx.hint(); });
paintToggles();
const songsOwned = () => { const s = store.get(KEYS.songs, []); return Array.isArray(s) ? s : []; };
function collectSong(id) { const s = songsOwned(); if (!s.includes(id)) { s.push(id); store.set(KEYS.songs, s); } }

/* Characters */
const charEl = who => scene.querySelector(`.char[data-who="${who}"]`);
function hop(who, kind = "go") {
  const c = charEl(who); if (!c) return;
  const h = c.querySelector(".hop"); h.classList.remove("go", "jolt"); void h.getBoundingClientRect(); h.classList.add(kind);
  setTimeout(() => h.classList.remove(kind), 600);
}
let faceTimer = 0;
// Shows a face for a moment: "happy", "surprised", or "think". ms = 0 keeps it.
function express(face, ms = 1700) {
  clearTimeout(faceTimer); robotEl.dataset.face = face;
  if (ms) faceTimer = setTimeout(() => { delete robotEl.dataset.face; }, ms);
}
function appear(who) { if (!S.seen.includes(who)) S.seen.push(who); const c = charEl(who); if (c) c.classList.add("in"); describeScene(); }
function join(who, silent) {
  appear(who);
  if (!S.crew.includes(who)) {
    S.crew.push(who);
    if (!silent) { addCourage(7); sfx.join(); if (who === "dog") setTimeout(sfx.woof, 500); toast(`${CAST[who].label()} joined the crew!`); express("happy"); }
  }
  paintCrew(silent ? null : who);
}
function lightFlame(instant) {
  const f = $("#bigFlame");
  const finish = () => { f.classList.add("gone"); robotEl.classList.add("lit"); S.courage = 100; paintCourage(); };
  f.classList.add("taken");
  if (instant || reduced) { finish(); return; }
  sfx.flame(); express("surprised", 2200); setTimeout(finish, 1800);
}

/* World and camera */
function setShip(on) { scene.classList.toggle("ship", on); describeScene(); }
function setFlying(on) { scene.classList.toggle("flying", on); stars.warp(on); placeLabel(); describeScene(); }
function placeLabel() {
  $("#place").textContent = scene.classList.contains("flying") ? "Deep space" : (WORLDS[S.world] || "Lumina");
}
let spinAngle = 0;
// Turns side-view Lumina so a place sits under the robot. Resolves when the walk finishes.
function walkTo(id, instant) {
  const site = SITES.find(s => s.id === id) || SITES[0];
  S.site = site.id;
  const spin = $("#spin");
  const d = ((-site.angle - spinAngle) % 360 + 540) % 360 - 180;
  spinAngle += d;
  if (instant || reduced || Math.abs(d) < 1) {
    spin.style.transition = "none"; spin.style.transform = `rotate(${spinAngle}deg)`; void spin.getBoundingClientRect(); spin.style.transition = "";
    return Promise.resolve();
  }
  spin.style.transform = `rotate(${spinAngle}deg)`;
  const rc = charEl("robot"); rc.classList.add("walking");
  return new Promise(r => setTimeout(() => { rc.classList.remove("walking"); r(); }, 1500));
}
function setWorld(w, instant) {
  mapStop();
  S.world = w; scene.dataset.world = w;
  setShip(false); setFlying(false);
  music.set(WORLD_SONG[w] || "theme");
  if (w === "lumina") walkTo("pad", true);
  if (w === "luminaLit") walkTo("village", instant);
  placeLabel(); describeScene();
}
function resetScene() {
  mapStop();
  scene.dataset.world = "lumina"; scene.dataset.floors = "0";
  scene.querySelectorAll(".char").forEach(c => { if (c.dataset.who !== "robot") c.classList.remove("in"); });
  robotEl.classList.remove("lit"); delete robotEl.dataset.face;
  $("#bigFlame").classList.remove("taken", "gone");
  arena.innerHTML = ""; $("#countdown").innerHTML = "";
  S.world = "lumina"; setShip(false); setFlying(false); walkTo("pad", true); paintRockets(); placeLabel();
}
function describeScene() {
  const names = S.crew.map(w => CAST[w].label());
  let where;
  if (scene.classList.contains("mapmode")) where = "exploring a map of Lumina";
  else if (scene.classList.contains("flying")) where = "flying through deep space in his rocket";
  else if (scene.classList.contains("ship")) where = "ready to blast off in his rocket";
  else where = "on " + ($("#place").textContent || "Lumina");
  scene.setAttribute("aria-label", `${S.robot || "The robot"} is ${where}${names.length ? " with " + names.join(", ") : ""}.`);
}

/* Top bar */
function addCourage(n) { S.courage = Math.min(100, Math.max(0, S.courage + n)); paintCourage(); }
function paintCourage() {
  const c = Math.round(S.courage);
  $("#courageFill").style.width = c + "%";
  $("#couragePct").textContent = c + "%";
  $("#courage").setAttribute("aria-valuenow", String(c));
  robotEl.style.setProperty("--fear", (1 - c / 100).toFixed(2));
  robotEl.style.setProperty("--warm", (c / 100).toFixed(2));
  robotEl.classList.toggle("brave", c >= 55);
}
function paintCrew(popWho) {
  const P = Kit.art.portraits;
  document.querySelectorAll(".slot").forEach(slot => {
    const w = slot.dataset.slot, on = S.crew.includes(w);
    slot.classList.toggle("on", on);
    slot.innerHTML = on ? P[w] : "?";
    slot.title = on ? CAST[w].label() : "A friend you haven't met yet";
    slot.setAttribute("aria-label", on ? CAST[w].label() : "Friend not met yet");
    slot.classList.remove("pop");
    if (on && w === popWho) { void slot.offsetWidth; slot.classList.add("pop"); }
  });
  describeScene();
}
function paintRockets() {
  const c = shipCfg();
  $("#padRocket").innerHTML = R.svg(c, {});
  $("#flyRocket").innerHTML = R.svg({ ...c, boost: c.boost || "one" }, { flame: true, face: true });
  updatePadImg();
}
