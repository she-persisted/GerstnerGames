/**
 * @file games/starward/lumina.js
 * @about Exploring Lumina: the walkable map, the three challenges at each place (a word puzzle, a math puzzle, then digging), choosing each rocket part's style, and building and painting the ship at the launch pad.
 * @requires kit/topdown-map.js, kit/typing-challenges.js, assets/map/lumina-map.js, assets/characters/robot-topdown.js, games/starward/scene.js
 */
const LM = Kit.art.luminaMap;
const MAP_W = 800, MAP_H = 560;
const DECOR = LM.makeDecor({ seed: 20261010, sites: SITES, width: MAP_W, height: MAP_H });
let padImg = null;
// The map draws the rocket as an image, so redraw it whenever a part is added or painted.
function updatePadImg() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-38 -112 76 144">${R.svg(shipCfg(), { plainFlame: true })}</svg>`;
  const img = new Image(); img.onload = () => { padImg = img; };
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

const map = Kit.topdownMap.create({
  canvas: $("#mapCanvas"), width: MAP_W, height: MAP_H, speed: 230, enterRadius: 52,
  bounds: { minX: 24, maxX: MAP_W - 24, minY: 96, maxY: MAP_H - 10 },
  sites: SITES, font: MAPFONT, colors: { light: TOK.snow, dark: TOK.void },
  fog: {
    rgb: "7,6,22",
    alpha: () => .8 - PART_ORDER.filter(p => S.found[p]).length * .07,
    holes: pos => {
      const pad = SITES[0], all = allFound();
      return [
        { x: pos.x, y: pos.y - 40, r: 118 + S.courage * 1.1 },
        { x: pad.x, y: pad.y - 30, r: all ? 110 : 70, a: all ? 1 : .5 },
        ...PART_SITES.map(s => S.found[s.part] ? { x: s.x, y: s.y - 30, r: 95, a: .85 } : { x: s.x, y: s.y - s.beacon, r: 34, a: .9 })
      ];
    }
  },
  drawWorld(c, t) {
    LM.drawGround(c, t, DECOR, TOK);
    LM.drawPaths(c, SITES[0], PART_SITES);
    LM.drawCrater(c, SITES[1], t, TOK);
    LM.drawObservatory(c, SITES[2], TOK);
    LM.drawGrove(c, SITES[3], t, TOK);
    LM.drawVillage(c, SITES[4], t, TOK, MAPFONT);
    LM.drawPad(c, SITES[0], TOK, padImg);
  },
  drawPlayer: (c, x, y, t, m) => Kit.art.drawRobotTop(c, x, y, t, m, { tokens: TOK, glow: .35 + S.courage / 100 * .6 }),
  drawAbove(c, t) {
    PART_SITES.forEach(s => LM.drawBeacon(c, s, t, { found: !!S.found[s.part], progress: S.siteProg[s.id] || 0, reduced }, TOK));
    if (allFound()) LM.drawPadRing(c, SITES[0], t, TOK);
  },
  showHint: () => !S.mapMoved,
  onMove: () => { S.mapMoved = true; },
  onArrive: arriveAt
});

function mapStart() {
  if (map.on) return;
  scene.classList.add("mapmode"); stars.pause(true); placeLabel();
  map.start(S.mapPos || { x: 400, y: 352 });
  describeScene();
}
function mapStop() {
  if (!map.on) return;
  map.stop(); scene.classList.remove("mapmode"); stars.pause(false); describeScene();
}

function renderExplore() {
  S.world = "lumina"; scene.dataset.world = "lumina";
  setShip(false); setFlying(false);
  mapStart(); map.busy = false;
  if (!S.mapMoved && PART_ORDER.every(p => !S.found[p])) map.say("Where are my ship parts?", 3800);
  renderRoam();
}
// Side panel while walking: the half-built rocket and four part slots.
function renderRoam() {
  panel.innerHTML = `<div class="card roam">
    <p class="eyebrow">Lumina</p>
    <div class="roam-ship">${R.box(R.svg(shipCfg(), { ghost: true }))}</div>
    <ul class="partslots" aria-label="Ship parts">${PART_ORDER.map(p => `<li class="${S.found[p] ? "got" : ""}" title="${PARTS[p].name}" aria-label="${PARTS[p].name}${S.found[p] ? ", found" : ""}">${R.partIcons[p]}</li>`).join("")}</ul>
  </div>`;
  panel.querySelectorAll(".partslots li").forEach(li => {
    const got = li.classList.contains("got");
    li.querySelectorAll(".pi").forEach(p => { p.setAttribute("fill", got ? TOK.gold : "none"); p.setAttribute("stroke", got ? "none" : "#8d88c8"); p.setAttribute("stroke-width", "1.6"); p.setAttribute("stroke-dasharray", got ? "" : "3 3"); });
    li.querySelectorAll(".pi2").forEach(p => { p.setAttribute("fill", got ? TOK.ember : "none"); });
  });
  if (allFound()) map.say("Back to the launch pad!", 5000);
  blurActive();
}

function arriveAt(site) {
  if (site.id === "pad") {
    if (!allFound()) return;
    map.busy = true; S.site = "pad"; S.mapPos = map.pos; sfx.arrive(); save(); next(); return;
  }
  if (S.found[site.part]) return;
  map.busy = true; S.site = site.id; S.mapPos = map.pos; sfx.arrive(); save();
  renderSiteTask(site);
}
function leaveSite(site) {
  flow.cleanupNow();
  map.stepOutOf(site); S.mapPos = map.pos; save(); map.busy = false; renderRoam();
}
function siteHead(site, done) {
  return `<div class="headrow"><p class="eyebrow">${esc(site.name)}</p><div style="display:flex;align-items:center;gap:12px">${pips(done)}<span class="target-ship">${R.box(R.svg(shipCfg(), { ghost: true, hl: site.part }))}</span></div></div>`;
}
// Three challenges per place: word puzzle, math puzzle, then dig.
function renderSiteTask(site) {
  const prog = S.siteProg[site.id] || 0;
  if (prog >= 3) return revealPart(site);
  if (prog === 2) return renderDig(site);
  const p = ask(`${site.id}-${prog}`, S.plan.sites[site.id][prog]);
  runPuzzle(p, { head: siteHead(site, prog), leave: () => leaveSite(site), site }, () => {
    S.siteProg[site.id] = prog + 1; save(); renderSiteTask(site);
  });
}
function renderDig(site) {
  const words = (S.plan.digs && S.plan.digs[site.id]) || sample(Kit.words.dig, 3);
  const stop = Kit.typing.dig(panel, {
    head: siteHead(site, 2), words, shovelHtml: ICON.shovel, backHtml: ICON.back,
    onBack: () => leaveSite(site),
    onWord: () => map.burst(site.x, site.y - 20, TOK.dirt, 16),
    onDone: st => {
      flow.setCleanup(null);
      const L = S.stats.legs.dig || { hits: 0, misses: 0, typeMs: 0, typeChars: 0, caught: 0, n: 0 };
      L.hits += st.hits; L.misses += st.misses; L.typeMs += st.ms; L.typeChars += st.chars;
      S.stats.legs.dig = L; S.siteProg[site.id] = 3; save();
      map.burst(site.x, site.y - 30, TOK.gold, 24);
      setTimeout(() => { if (map.busy && S.site === site.id) revealPart(site); }, 450);
    }
  });
  flow.setCleanup(stop);
}
function revealPart(site) {
  const key = site.part, part = PARTS[key];
  express("surprised", 1500); sfx.found(); toast(`You found the ${part.name}!`);
  panel.innerHTML = `<div class="card">
    <p class="eyebrow">${esc(part.name)}</p>
    <div class="options">${part.options.map(([id, label]) => {
      const cfg = { ...shipCfg(), [key]: id };
      if (key === "engine" && !cfg.boost) cfg.boost = "one";
      return `<button type="button" class="opt" data-opt="${id}">${R.box(R.svg(cfg, { ghost: true, flame: key === "engine" || key === "boost" }))}<span>${esc(label)}</span></button>`;
    }).join("")}</div>
  </div>`;
  panel.querySelectorAll(".opt").forEach(b => b.addEventListener("click", () => {
    S.found[key] = b.dataset.opt; addCourage(3); express("happy"); sfx.right(); paintRockets();
    map.burst(site.x, site.y - 30, TOK.gold, 20);
    map.stepOutOf(site); S.mapPos = map.pos; map.busy = false; save(); renderRoam();
  }));
  focusSoon(panel.querySelector(".opt"));
}
function renderBuild() {
  S.site = "pad";
  panel.innerHTML = `<div class="card">
    <p class="eyebrow">Launch Pad</p>
    <div class="options">${PAINT_ORDER.map(id => `<button type="button" class="opt" data-paint="${id}">${R.box(R.svg({ ...shipCfg(), paint: id }, { flame: true }))}<span>${esc(PAINTS[id].label)}</span></button>`).join("")}</div>
  </div>`;
  panel.querySelectorAll(".opt").forEach(b => b.addEventListener("click", () => {
    S.paint = b.dataset.paint; paintRockets(); express("happy"); sfx.found(); save();
    panel.innerHTML = `<div class="card">
      <p class="eyebrow">${esc(PAINTS[S.paint].label)}</p>
      <div class="shipshow">${R.box(R.svg(shipCfg(), { flame: true, face: true }))}</div>
      <div class="actions">${nextBtn("Climb aboard", ICON.rocket, "big")}</div>
    </div>`;
    bindPrimary(next);
  }));
  focusSoon(panel.querySelector(".opt"));
}
