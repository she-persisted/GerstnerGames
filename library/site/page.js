/**
 * @file site/page.js
 * @about Fills in the Game Library page from catalog.json: games and their versions, the flow map, the live robot, T-Rexy (with every face and look, outfits included), Nova, rocket, and ship previews, the song player, and the file browser that can show any file's source.
 * @requires kit/util.js, kit/audio.js, kit/music.js, kit/groove.js, assets/icons/icons.js, assets/characters/puppy.js, assets/rocket/rocket.js, assets/characters/trexy.js, assets/characters/nova.js, assets/ship/glitch-ship.js
 */
const { $, esc } = Kit.util;
const CAT = JSON.parse($("#catalog").textContent);
const FILES = CAT.files, GAMES = CAT.games;
const R = Kit.art.rocket, ICON = Kit.art.icons;
const kb = n => (n < 1024 ? `${n} B` : `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`);
const base = p => p.split("/").pop().replace(/\.[a-z]+$/, "");
const ARROW = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.3 5.3a1 1 0 0 1 1.4 0l6 6a1 1 0 0 1 0 1.4l-6 6a1 1 0 1 1-1.4-1.4l4.3-4.3H4a1 1 0 1 1 0-2h13.6l-4.3-4.3a1 1 0 0 1 0-1.4z"/></svg>`;

/* Header numbers */
$("#stats").textContent = `${FILES.length} files · ${GAMES.length} games · ${Object.keys(Kit.songs).length} songs · ${document.querySelectorAll("#cast figure:not(.rocket-tile)").length} characters`;

/* Games and versions */
$("#gameList").innerHTML = GAMES.map(g => {
  const rel = [...(g.releases || [])].reverse();
  return `<article class="game">
    <h3>${esc(g.title.replace(/ v\d+$/, ""))}</h3>
    <span class="src">${g.legacy ? "One legacy file" : `${g.fileCount} source files`} in <code>${esc(g.source)}</code></span>
    <p>${esc(g.about)}</p>
    <ol class="versions">${rel.map((r, i) => {
      const sameAsNewer = i > 0 && r.url && rel.slice(0, i).some(x => x.url === r.url);
      const link = !r.url ? "" : sameAsNewer ? `<span class="same">page history</span>` : `<a href="${esc(r.url)}" target="_blank" rel="noopener">Open</a>`;
      return `<li><span class="v">v${r.version}</span><span class="d">${esc(r.date)}</span><span class="n">${esc(r.notes)}</span>${link}</li>`;
    }).join("")}</ol>
  </article>`;
}).join("");

/* Flow map, built from the catalog so it always matches the files */
(function flowMap() {
  const names = (layer, re) => [...new Set(FILES.filter(f => f.layer === layer && re.test(f.path) && !f.path.includes("/legacy/")).map(f => base(f.path)))];
  const count = layer => FILES.filter(f => f.layer === layer).length;
  const chip = list => `<div class="names">${list.map(n => `<span>${esc(n)}</span>`).join("")}</div>`;
  const sw = GAMES.find(g => g.id === "starward") || GAMES[0];
  const latest = GAMES.map(g => { const r = [...(g.releases || [])].sort((a, b) => b.version - a.version)[0]; return r && r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(g.title.replace(/ v\d+$/, ""))} v${r.version}</a>` : ""; }).join("");
  $("#flowmap").innerHTML = `
    <div class="stack">
      <div class="node"><h3>Content <span>${count("Content")} files</span></h3><p>Questions tagged easy to hard, question generators, word lists</p>${chip(names("Content", /\.js$/))}</div>
      <div class="node"><h3>Assets <span>${count("Assets")} files</span></h3><p>Characters, rocket, worlds, map art, songs, icons</p>${chip(FILES.filter(f => f.layer === "Assets" && /\.(js|svg)$/.test(f.path) && !f.path.startsWith("assets/music/") && !/\/(gradients|defs|plain-ground)\.svg$/.test(f.path)).map(f => base(f.path)).concat([`${FILES.filter(f => f.path.startsWith("assets/music/")).length} songs`]))}</div>
      <div class="node"><h3>Kit <span>${count("Kit")} files</span></h3><p>Engines any game can use</p>${chip(names("Kit", /\.js$/))}</div>
    </div>
    <div class="arrow">${ARROW}</div>
    <div class="node game-node"><h3>${esc(sw.title.replace(/ v\d+$/, ""))}'s own parts</h3><p>Story, settings, screens, and layout. Only this game uses them.</p>${chip(FILES.filter(f => f.path.startsWith(sw.source + "/") && !f.path.includes("/legacy/") && !f.path.endsWith(".json")).map(f => base(f.path)))}</div>
    <div class="arrow">${ARROW}</div>
    <div class="node"><h3>Build</h3><p>Joins every piece into one page and checks that nothing loads out of order.</p>${chip(["build.py"])}</div>
    <div class="arrow">${ARROW}</div>
    <div class="node out"><h3>Published pages</h3><p>One home page per game always runs the newest version; older versions are kept as archive pages.</p>${latest}</div>`;
})();

/* Characters */
$("#galleryPuppy").innerHTML = Kit.art.puppy();
const robot = $("#galleryRobot");
function setCourage(v) {
  robot.style.setProperty("--warm", (v / 100).toFixed(2));
  robot.style.setProperty("--fear", (1 - v / 100).toFixed(2));
  robot.classList.toggle("brave", v >= 55);
  $("#courageVal").textContent = v + "%";
}
$("#courage").addEventListener("input", e => setCourage(+e.target.value));
setCourage(30);
document.querySelectorAll(".faces button").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".faces button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
  if (b.dataset.face) robot.dataset.face = b.dataset.face; else delete robot.dataset.face;
}));
$("#litBox").addEventListener("change", e => robot.classList.toggle("lit", e.target.checked));

/* Rocket builder */
const rocketCfg = { nose: "star", fins: "swept", boost: "two", engine: "gold", paint: "purple" };
const rocketField = (key, label, opts) => `<label>${esc(label)}<select data-k="${key}">${opts.map(([v, t]) => `<option value="${v}"${rocketCfg[key] === v ? " selected" : ""}>${esc(t)}</option>`).join("")}</select></label>`;
$("#rocketControls").innerHTML = R.PART_ORDER.map(k => rocketField(k, R.PARTS[k].name, [["", "Not found yet"], ...R.PARTS[k].options])).join("")
  + rocketField("paint", "Paint", R.PAINT_ORDER.map(p => [p, R.PAINTS[p].label]));
function drawRocket() { $("#rocketArt").innerHTML = R.svg(rocketCfg, { flame: true, face: true, ghost: true }); }
$("#rocketControls").addEventListener("change", e => { const s = e.target.closest("select"); if (!s) return; rocketCfg[s.dataset.k] = s.value || undefined; drawRocket(); });
drawRocket();

/* T-Rexy, Nova, and the glitch ship */
const TX = Kit.art.trexy, NV = Kit.art.nova, SH = Kit.art.ship;
const trexyFaces = [["smile", "Smile"], ["happy", "Happy"], ["worried", "Worried"], ["surprised", "Surprised"], ["think", "Thinking"], ["dizzy", "Dizzy"]];
$("#trexyFaces").innerHTML = trexyFaces.map(([f, l], i) => `<button type="button" data-tface="${f}" aria-pressed="${i === 0}">${l}</button>`).join("");
// His looks: a hat, a back item, a color, and an outfit (a whole costume), the same ones he unlocks in Mini Game Survival.
const trexyLook = { face: "smile", acc: "", back: "", skin: "", outfit: "" };
const lookField = (key, label, names) => `<label>${esc(label)}<select data-look="${key}"><option value="">None</option>${Object.entries(names).map(([v, t]) => `<option value="${v}">${esc(t)}</option>`).join("")}</select></label>`;
$("#trexyLooks").innerHTML = lookField("acc", "Hat", TX.LOOKS.head) + lookField("back", "Back", TX.LOOKS.back) + lookField("skin", "Color", TX.LOOKS.skin) + lookField("outfit", "Outfit", TX.LOOKS.outfit);
const drawTrexy = () => { const el = $("#galleryTrexy"); el.setAttribute("viewBox", TX.view(trexyLook)); el.innerHTML = TX.g(trexyLook); };
$("#trexyFaces").addEventListener("click", e => { const b = e.target.closest("[data-tface]"); if (!b) return; $("#trexyFaces").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); trexyLook.face = b.dataset.tface; drawTrexy(); });
$("#trexyLooks").addEventListener("change", e => { const s = e.target.closest("select"); if (!s) return; trexyLook[s.dataset.look] = s.value; drawTrexy(); });
drawTrexy();
const drawNova = () => { $("#galleryNova").innerHTML = $("#shadowBox").checked ? NV.shadow("#000") : NV.g({ face: "happy" }); };
$("#shadowBox").addEventListener("change", drawNova);
drawNova();
const shipCfg = { cockpit: "dino", wings: "fern", thrusters: "two", core: "pink", paint: "cyan" };
const shipField = (key, label, opts) => `<label>${esc(label)}<select data-k="${key}">${opts.map(([v, t]) => `<option value="${v}"${shipCfg[key] === v ? " selected" : ""}>${esc(t)}</option>`).join("")}</select></label>`;
$("#shipControls").innerHTML = SH.PART_ORDER.map(k => shipField(k, SH.PARTS[k].name, [["", "Not found yet"], ...SH.PARTS[k].options])).join("")
  + shipField("paint", "Paint", SH.PAINT_ORDER.map(p => [p, SH.PAINTS[p].label]));
const pilot = TX.pilot({ face: "smile" });
function drawShip() { $("#shipArt").innerHTML = SH.svg(shipCfg, { flame: true, ghost: true, pilot }); }
$("#shipControls").addEventListener("change", e => { const s = e.target.closest("select"); if (!s) return; shipCfg[s.dataset.k] = s.value || undefined; drawShip(); });
drawShip();

/* Songs */
const player = Kit.groove.create(Kit.songs); // plays both the simple songs and the dance-style ones
player.setEnabled(false);
let playing = null;
const songFile = id => FILES.find(f => f.path.startsWith("assets/music/") && f.provides === `Kit.songs.${id}`) || {};
function renderSongs() {
  $("#songList").innerHTML = Object.keys(Kit.songs).map(id => {
    const s = Kit.songs[id], on = playing === id, about = (songFile(id).about || "").replace(/^"[^"]*":\s*/, "").replace(/ Song format is described in kit\/music\.js\.$/, "");
    return `<div class="song"><button type="button" class="play" data-song="${id}" aria-pressed="${on}" aria-label="${on ? "Stop" : "Play"} ${esc(s.title)}">${on ? ICON.stop : ICON.play}</button>
      <div><b>${esc(s.title)}</b><p>${esc(about)}</p><p><code>assets/music/${id}.js</code></p></div></div>`;
  }).join("");
}
$("#songList").addEventListener("click", e => {
  const b = e.target.closest("[data-song]"); if (!b) return;
  const id = b.dataset.song;
  if (playing === id) { player.setEnabled(false); playing = null; }
  else { Kit.audio.ctx(); player.set(id); player.setEnabled(true); player.unlock(); playing = id; }
  renderSongs();
  const again = $(`[data-song="${id}"]`); if (again) again.focus();
});
renderSongs();

/* File browser */
const LAYERS = ["All", "Kit", "Assets", "Content", "Games", "Build", "Library page", "Docs"];
let layer = "All";
function renderFilters() {
  $("#layerFilters").innerHTML = LAYERS.map(l => {
    const n = l === "All" ? FILES.length : FILES.filter(f => f.layer === l).length;
    return n ? `<button type="button" data-layer="${l}" aria-pressed="${l === layer}">${esc(l)}<span>${n}</span></button>` : "";
  }).join("");
}
function renderFiles() {
  const list = FILES.filter(f => layer === "All" || f.layer === layer);
  const groups = {};
  list.forEach(f => { const d = f.path.includes("/") ? f.path.slice(0, f.path.lastIndexOf("/") + 1) : "(top)"; (groups[d] = groups[d] || []).push(f); });
  $("#fileList").innerHTML = Object.entries(groups).map(([dir, fs]) => `<div class="folder"><h3>${esc(dir)}</h3>${fs.map(f => `
    <button type="button" class="frow" aria-expanded="false" data-path="${esc(f.path)}"><span class="path">${esc(f.path.slice(f.path.lastIndexOf("/") + 1))}</span><span class="about">${esc(f.about || "")}</span><span class="size">${kb(f.bytes)}</span></button>
    <div class="fdetail" hidden>
      <dl>
        ${f.provides ? `<dt>Provides</dt><dd><code>${esc(f.provides)}</code></dd>` : ""}
        ${f.requires ? `<dt>Needs</dt><dd>${esc(f.requires)}</dd>` : ""}
        ${(f.usedBy || []).length ? `<dt>Used by</dt><dd class="used">${f.usedBy.map(u => `<span>${esc(u)}</span>`).join("")}</dd>` : ""}
      </dl>
      ${f.notes ? `<pre class="notes">${esc(f.notes)}</pre>` : ""}
      <button type="button" class="showcode">Show code</button>
      <pre class="code" hidden></pre>
    </div>`).join("")}</div>`).join("");
}
$("#layerFilters").addEventListener("click", e => { const b = e.target.closest("[data-layer]"); if (!b) return; layer = b.dataset.layer; renderFilters(); renderFiles(); });
$("#fileList").addEventListener("click", async e => {
  const row = e.target.closest(".frow");
  if (row) { const d = row.nextElementSibling, open = row.getAttribute("aria-expanded") === "true"; row.setAttribute("aria-expanded", String(!open)); d.hidden = open; return; }
  const btn = e.target.closest(".showcode"); if (!btn) return;
  const pre = btn.nextElementSibling, path = btn.closest(".fdetail").previousElementSibling.dataset.path;
  if (!pre.hidden) { pre.hidden = true; btn.textContent = "Show code"; return; }
  pre.hidden = false; btn.textContent = "Hide code"; pre.textContent = "Loading...";
  try { const r = await fetch(path); if (!r.ok) throw new Error(r.status); pre.textContent = await r.text(); }
  catch (err) { pre.textContent = "This file can't be shown here. It is still saved with the library's published files."; }
});
renderFilters(); renderFiles();
