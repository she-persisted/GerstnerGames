/**
 * @file games/mini-game-survival/screens.js
 * @about Mini Game Survival's screens: title (Easy or Hard, high scores, jukebox), story lines, the crash pad with the clue notebook, obstacle runs (with a keep-going or run-it-again choice when memory pieces got away, and a bonus for catching them all), memory jigsaws (with glitchy holes for missing pieces), glitch-locked clue words, typing clues into the notebook, picking ship parts and paint, new songs, the mystery questions, the big shrink, and the ending with the score and name entry. Results feed the adaptive levels here, but no screen shows or saves how many tries anything took, and mistakes never cost points. Right answers cheer and move on by themselves. Each screen also says what the R key (forward) does there and which keys L and R leave alone, and shows a hint with the keys to press only when the player seems stuck.
 * @requires games/mini-game-survival/questions.js, kit/typing-challenges.js, kit/jigsaw.js, kit/fuel-word.js, kit/jukebox.js, kit/scoreboard.js, assets/memories/memories.js, games/mini-game-survival/scene.js
 */
const board = Kit.scoreboard.create({ storeKey: KEYS.scores });
const CHEERS = ["Roar-some!", "Dino-mite!", "T-Rexcellent!", "Glitch-tastic!", "Jurassic genius!", "Tiny arms, HUGE brain!",
  "Big head energy!", "Stomp, stomp, CORRECT!", "Totally Rex-tacular!", "Your brain just did a backflip!", "Out of this world!",
  "Star-tastic!", "Galaxy brain!", "Dino-sore? Dino-SCORE!", "Comet-ly correct!"];
let heroTap = null;

// L and R (or the left and right arrow keys) move back and forward through the story (boot.js listens for them).
// Each screen says which of those keys it leaves free (a typing screen needs its letters, a jigsaw its arrows),
// and what going forward means there (skip the run, finish the jigsaw, show the answer). No forward action = the next step.
const NAV = { keys: "both", forward: null };
const navKeys = k => { NAV.keys = k; };      // "both", "letters" (L and R only), or "arrows" (the arrow keys only)
const onForward = fn => { NAV.forward = fn; };

const PORTRAIT = {
  trexy: () => `<svg class="portrait" viewBox="-12 -96 68 56" aria-hidden="true">${Kit.art.trexy.g({ face: "smile" })}</svg>`,
  nova: () => `<svg class="portrait" viewBox="12 -53 42 37" aria-hidden="true">${Kit.art.nova.g({ lantern: false })}</svg>`,
  shadow: () => `<svg class="portrait" viewBox="-62 -64 116 68" aria-hidden="true">${Kit.art.nova.shadow("#000", 14)}</svg>`,
  family: () => `<svg class="portrait" viewBox="-12 -100 68 58" aria-hidden="true">${Kit.art.trexy.g({ who: "mom", acc: "flower", face: "happy" })}</svg>`,
  ship: () => `<svg class="portrait" viewBox="-6 -40 48 40" aria-hidden="true">${SHIP.svg(shipCfg(), { face: "happy" })}</svg>`
};
const headIcon = `<svg viewBox="-10 -92 66 50" aria-hidden="true">${Kit.art.trexy.g({ face: "think" })}</svg>`;

function renderJukebox() {
  Kit.jukebox.render($("#jukeList"), {
    order: JUKEBOX, songs: Kit.songs, owned: songsOwned, where: id => SONG_WHERE[id] || "", music, fallback: "glitchHub",
    icons: { note: ICON.note, play: ICON.play, stop: ICON.stop },
    onTurnOn: () => { musicOn = true; store.set(KEYS.music, "on"); paintToggles(); }
  });
}

/* Title */
function renderTitle() {
  active = false; flow.bump();
  startStage(); hideMemory();
  applyStage({ theme: "hub", face: "smile", acc: "none", shadow: 1, nova: false, ship: false, family: false, lantern: false, shipFace: "", ride: false });
  scene.classList.add("attract"); $("#place").textContent = "";
  const saved = loadSave();
  let pickMode = savedMode();
  panel.innerHTML = `<div class="card title">
    <div><h2 class="big glitchy-big"><span class="glitchy" data-text="MINI GAME">MINI GAME</span><br><span class="hot">SURVIVAL</span></h2><p class="byline">A T-Rexy mystery</p></div>
    <div class="modepick" role="radiogroup" aria-label="Pick a mode">
      ${Object.entries(MODES).map(([id, m]) => `<button type="button" role="radio" class="modebtn" id="mode-${id}" data-mode="${id}" aria-checked="false">${esc(m.label)} <span class="kbd">${m.label[0]}</span></button>`).join("")}
    </div>
    <p class="modeabout" id="modeAbout" aria-live="polite"></p>
    <div class="actions start">
      <button class="btn big" type="button" data-primary id="playBtn">Play ${ICON.go}</button>
      ${saved ? `<button type="button" class="btn ghost" id="resumeBtn">${ICON.retry} Keep going <small>(${esc((MODES[saved.mode] || MODES.easy).label)})</small></button>` : ""}
    </div>
    <div class="board panel-board" data-scoreboard></div>
    <section class="jukebox" aria-label="Jukebox"><p class="eyebrow">${ICON.note.replace('class="note-ic" ', "")} Jukebox</p><div class="jlist" id="jukeList"></div></section>
  </div>`;
  board.render(); renderJukebox();
  const showMode = (m, say) => {
    pickMode = m;
    panel.querySelectorAll(".modebtn").forEach(b => { const on = b.dataset.mode === m; b.setAttribute("aria-checked", on); b.classList.toggle("on", on); b.tabIndex = on ? 0 : -1; });
    $("#modeAbout").textContent = MODES[m].about;
    if (say) { sfx.key(); if (m === "hard") shadowLaugh(); }
  };
  showMode(pickMode);
  panel.querySelectorAll(".modebtn").forEach(b => b.addEventListener("click", () => showMode(b.dataset.mode, true)));
  const modeKey = e => {
    if (e.target && e.target.matches && e.target.matches("input, textarea")) return;
    const k = e.key.toLowerCase();
    if (k === "e" || k === "h") { e.preventDefault(); showMode(k === "e" ? "easy" : "hard", true); }
    else if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && document.activeElement && document.activeElement.classList.contains("modebtn")) {
      e.preventDefault(); showMode(pickMode === "easy" ? "hard" : "easy", true); focusSoon($("#mode-" + pickMode));
    }
  };
  document.addEventListener("keydown", modeKey);
  flow.setCleanup(() => document.removeEventListener("keydown", modeKey));
  bindPrimary(() => {
    document.removeEventListener("keydown", modeKey);
    Kit.audio.ctx(); music.unlock();
    S = fresh(); setMode(pickMode); active = true; store.del(KEYS.save); scene.classList.remove("attract");
    resetStage(); paintHud(); go(0);
  });
  const rb = $("#resumeBtn");
  if (rb) rb.addEventListener("click", () => { document.removeEventListener("keydown", modeKey); Kit.audio.ctx(); music.unlock(); S = Object.assign(fresh(), saved); setMode(S.mode); active = true; scene.classList.remove("attract"); restore(); go(S.step); });
}
function resetStage() { applyStage({ theme: "night", face: "smile", acc: "none", nova: false, novaFace: "surprised", shadow: 0, lantern: false, ship: false, family: false, shipFace: "", ride: false }); }

/* Story */
function renderSay(st) {
  const c = CAST[st.who];
  startStage(); $("#place").textContent = "";
  panel.innerHTML = `<div class="card say" data-who="${st.who}" style="--who:${c.color}">
    <div class="whorow">${PORTRAIT[st.who] ? PORTRAIT[st.who]() : ""}<p class="who">${esc(c.label)}</p></div>
    <p class="line">${esc(st.x)}</p>
    <div class="actions">${nextBtn("Next", '<span class="kbd">Enter</span>')}</div>
    <p class="navhint"><span class="kbd">L</span> back &nbsp; <span class="kbd">R</span> forward</p>
  </div>`;
  hintIfIdle("Press [Enter] for the next line. [L] goes back a line.", 15000);
  if (st.face) express(st.face, 3000);
  if (st.hop === 2) doubleHop(); else if (st.hop) { hop(); setTimeout(hop, 600); }
  if (st.who === "shadow") { if (/MWA|HA!/.test(st.x)) shadowLaugh(); else shadowTalk(Math.min(2400, 500 + st.x.length * 22)); }
  if (st.who === "nova") Kit.audio.tone(1400, .08, "sine", .04);
  if (st.who === "ship") shipTalk();
  bindPrimary(next);
}

/* The crash pad and the clue notebook */
function notebookHTML() {
  const nxt = nextPortal();
  const nextLine = nxt === "gate" ? (allParts() && S.paint ? "Next: the Shadow Gate" : "") : `Next: ${PORTALS[nxt].name}`;
  return `<div class="card notebook">
    <p class="nb-head">${headIcon.replace("<svg", '<svg style="width:46px;height:36px"')} Clue Notebook</p>
    ${nextLine ? `<p class="nb-next">${esc(nextLine)}</p>` : ""}
    ${S.moved ? "" : `<p class="walkhint"><span class="kbd">&larr;</span> <span class="kbd">&rarr;</span> to walk. <span class="kbd">Enter</span> to jump in.</p>`}
    <p class="nb-mode">${esc(modeOf().label)} mode <button type="button" class="btn ghost small" id="modeSwitch">Switch to ${S.mode === "hard" ? "Easy" : "Hard"}</button></p>
    ${PORTAL_ORDER.map(id => S.clues.includes(id) ? `<p class="clue-note"><b>Clue ${CLUES[id].n}:</b> ${esc(CLUES[id].short)}</p>` : `<p class="clue-note empty">Clue ${CLUES[id].n}: ???</p>`).join("")}
    ${S.pages.length ? `<p class="eyebrow">Mysterious notes (${S.pages.length} of 4)</p>${[...S.pages].sort().map(i => `<p class="diary">${esc(PAGES[i])}<span class="paw" aria-label="signed with a tiny footprint">&#x2234;</span></p>`).join("")}` : ""}
  </div>`;
}
function renderHub() {
  $("#place").textContent = "The Crash Pad";
  const paint = () => {
    panel.innerHTML = notebookHTML();
    $("#modeSwitch").addEventListener("click", () => {
      setMode(S.mode === "hard" ? "easy" : "hard"); save(); paint(); blurActive();
      toast(S.mode === "hard" ? "Hard mode! Runs score double." : "Easy mode! Checkpoints on, slower runs.");
    });
  };
  paint();
  const leave = () => { markPassed(); next(); };
  startHub(leave, () => paint());
  navKeys("letters"); // the arrow keys walk here
  onForward(() => { sfx.liftoff(); leave(); });
  hintIfIdle("Walk with [\u2190] [\u2192]. At the glowing portal, press [Enter] to jump in.", 9000);
  blurActive();
}

/* Obstacle runs */
async function countdown(alive) {
  const el = $("#countdown");
  for (const n of ["3", "2", "1"]) { if (!alive()) return false; el.innerHTML = `<span>${n}</span>`; sfx.beep(); await Kit.util.wait(600); }
  if (!alive()) return false;
  el.innerHTML = `<span class="go">GO!</span>`; sfx.liftoff();
  setTimeout(() => { if (el.querySelector(".go")) el.innerHTML = ""; }, 600);
  return true;
}
// n = which run this is (0 to 3 the portals, 4 the Shadow Gate): later runs use higher levels, set by the mode's ramp.
// key = where the result is kept (S.stats.runs[key]). Running it again builds the very same run (same level and layout,
// made from the game's seed), and pieces caught before stay caught, so a second try only needs the missing ones.
// Points: base + per piece (double in Hard mode), plus FULL_BONUS for catching every one. A second try never lowers them.
function runPortal({ key, theme, name, n, pieces, secret, shadow, base, per, onPiecePage, done }) {
  const M = modeOf(), prev = S.stats.runs[key] || null;
  const level = prev ? prev.level : runLevel(n), RL = RUN_LEVELS[level];
  const ships = prev ? prev.ships : (n === 4 ? RL.ships + 1 : RL.ships);
  const secs = prev ? prev.secs : M.secs[n], total = prev ? prev.total : pieces, have = prev ? prev.have || [] : [];
  const gen = Kit.runner.generate({ chunks: Kit.levels.runner, level, speed: RL.speed, space: RL.space, ships, length: RL.speed * secs, pieces: total, secret, rng: seededRng(`run.${key}`) });
  $("#place").textContent = name;
  const tok = flow.token(), firstRun = !S.tipped;
  startStage(); applyStage({ theme, face: "smile" }); stageEl.classList.add("wide"); blurActive();
  panel.innerHTML = ""; // nothing left over from the last screen (like its buttons) during the run
  const ui = $("#runUi"), autoCp = M.checkpoints;
  navKeys("letters"); // the arrow keys are too close to the hop key here, so only L and R skip around
  let cpOn = false, started = false, over = false, spot = "", spotCrashes = 0;
  function turnOnCp() {
    if (cpOn || !runCtl) return; cpOn = true; runCtl.checkpoints(true);
    const b = $("#cpBtn"); if (b) { b.classList.remove("nudge"); b.classList.add("on"); b.setAttribute("aria-pressed", "true"); b.blur(); }
    toast("Checkpoints on! Crash, and you start from the last one.");
  }
  function showCp() {
    if (ui.querySelector("#cpBtn")) return;
    ui.innerHTML = `<button type="button" class="btn small nudge" id="cpBtn" aria-pressed="false">${ICON.check} Checkpoints <span class="kbd">C</span></button>`;
    $("#cpBtn").addEventListener("click", turnOnCp);
  }
  const cKey = e => { if ((e.key === "c" || e.key === "C") && ui.querySelector("#cpBtn")) turnOnCp(); };
  document.addEventListener("keydown", cKey);
  flow.setCleanup(() => document.removeEventListener("keydown", cKey));
  function finishRun(res) {
    if (over) return; over = true;
    document.removeEventListener("keydown", cKey); hideHint();
    const all = res.piecesTotal > 0 && res.pieces >= res.piecesTotal;
    const pts = res.skipped ? 0 : Math.round((base + per * res.pieces) * M.runMult) + (all ? FULL_BONUS : 0);
    S.stats.runs[key] = { level, secs, ships, total: res.piecesTotal, have: res.gotIdx, pieces: res.pieces, secret: !!(res.secret || (prev && prev.secret)), pts: Math.max(pts, prev ? prev.pts || 0 : 0), full: all || !!(prev && prev.full) };
    if (!res.skipped) skills.record("run", runOutcome(res));
    markPassed(); save();
    done(res, level, all);
  }
  // R (forward) skips the run. Pieces already caught still count; skipping earns no run points.
  onForward(() => {
    if (started && runCtl) { runCtl.skip(); return; }
    const count = gen.L.objs.filter(o => o.k === "m").length;
    finishRun({ crashes: 0, pieces: have.length, piecesTotal: count, gotIdx: have.slice(), secret: false, usedCheckpoints: false, skipped: true, ms: 0 });
  });
  if (shadow) setTimeout(() => { if (flow.alive(tok)) shadowLaugh(); }, 300);
  if (have.length && have.length < total) toast(`Same run! Your ${have.length} pieces are still yours. Grab the other ${total - have.length}!`);
  countdown(() => flow.alive(tok) && !over).then(ok => {
    if (!ok) return;
    startRun({
      gen, theme, shadow, label: name, have, tip: firstRun ? "Space, Up, or click to hop. Press again in the air to DOUBLE hop!" : "",
      onCrash: (c, info = {}) => {
        if (c === 1 && firstRun) toast(autoCp ? "Oops! Back to the last checkpoint." : "Oops! Back to the start.");
        if (c >= 3 && !autoCp) showCp();
        // Hints only when needed: right away if no key has been pressed yet, or after two crashes at the same spot.
        if (!info.pressed) { showHint("Press [Space], [\u2191], or click to hop!"); return; }
        const here = info.chunk ? info.chunk.id : "start";
        spotCrashes = here === spot ? spotCrashes + 1 : 1; spot = here;
        if (spotCrashes >= 2) showHint(runHint(info));
      },
      onCollect: o => { if (o.k === "x" && onPiecePage) onPiecePage(); },
      onMode: m => { if (m === "ship" && !S.shipTip) { S.shipTip = true; save(); toast("Ship mode! Hold to fly up."); } },
      onDouble: () => { if (!S.dblTip) { S.dblTip = true; save(); toast("Double hop! Dino-MITE!"); } },
      onFinish: finishRun
    });
    started = true;
    if (autoCp) { runCtl.checkpoints(true); ui.innerHTML = `<span class="cpchip">${ICON.check} Checkpoints on</span>`; }
    if (firstRun) { S.tipped = true; save(); }
    blurActive();
  });
}
// What to try at a spot where the player keeps crashing, by obstacle (the chunk ids in content/levels/runner-chunks.js). First match wins.
const RUN_HINTS = [
  [/^secret$/, "Stay on the low path to get through. The high path hides a secret!"],
  [/low-ceiling/, "Low ceiling! Hop only when you need to, and skip the double hop."],
  [/spike-3|spike-run/, "Lots of spikes! Hop, then press again in the air to DOUBLE hop over them all."],
  [/spike-pit/, "Hop over the spiky pit. Double hop if you need more air!"],
  [/spike-2|spike-spike/, "Two spikes! Hop a little early so you clear them both."],
  [/tower|stairs|step/, "Hop up onto each block, one at a time."],
  [/ledge/, "Hop up onto the ledge, then hop again to get to the next one."],
  [/pad/, "Bounce pads launch you! Run right onto them. Double hop if you need more."],
  [/gap/, "Hop right at the edge of the gap. Double hop over the big ones!"],
  [/^spike$/, "Hop just before the spike. Not too early!"]
];
function runHint(info) {
  if (info.mode === "ship" || (info.chunk && info.chunk.tag === "ship")) return "Ship mode! Hold [Space] to fly up. Let go to drift down.";
  const id = info.chunk ? info.chunk.id : "", h = RUN_HINTS.find(([re]) => re.test(id));
  return h ? h[1] : "Hop just before the danger. Press again in the air to DOUBLE hop!";
}
// Feeds the run level. The crash count is only looked at here and is never shown or saved.
function runOutcome(res) {
  if (res.usedCheckpoints && !modeOf().checkpoints) return "struggle";
  return res.crashes <= 1 ? "clean" : res.crashes <= 4 ? "ok" : "struggle";
}
function renderRun(st) {
  const P = PORTALS[st.p], [rows, cols] = JIG_GRID[skills.level("jigsaw")];
  const i = PORTAL_ORDER.indexOf(st.p);
  runPortal({
    key: st.p, theme: P.theme, name: P.name, n: i, pieces: rows * cols, secret: true, base: 300, per: 20,
    onPiecePage: () => {
      if (!S.pages.includes(i)) { S.pages.push(i); save(); }
      toast("A secret page! Someone's diary...");
    },
    done: (res, level, all) => afterRun(P, res, level, { all, what: "memory pieces", memory: true })
  });
}
const RUN_CHEERS = ["Tiny arms, mighty legs!", "Boing, boing, BOOM!", "Spikes? What spikes?", "That run was dino-MITE!", "Out of this world!", "Jurassic-ly awesome!", "You're a shooting STAR!", "The glitch never saw you coming!"];
// After a run. Every piece caught: a bonus, then on to the next step. Some missing: keep going without them
// (the memory jigsaw will have holes), or run it again to catch the rest for the bonus.
function afterRun(P, res, level, { all, what, memory }) {
  clearHints();
  const missing = res.piecesTotal - res.pieces;
  startStage(); applyStage({ theme: P.theme, face: all ? "happy" : "smile" }); express(all || !missing ? "happy" : "think", 2400); hop();
  const head = res.skipped ? `Run <span class="hot">skipped</span>` : `Portal <span class="hot">cleared!</span>`;
  const stats = `<div class="statrow"><span class="stat"><b>${res.pieces} of ${res.piecesTotal}</b> ${what}</span><span class="stat">Level <b>${level}</b> run</span>${res.secret ? `<span class="stat"><b>Secret page!</b></span>` : ""}</div>`;
  const t = flow.token();
  if (all || missing <= 0) {
    panel.innerHTML = `<div class="card">
      <p class="eyebrow">${esc(P.name)}</p>
      <h2 class="big">${head}</h2>
      <p class="line" style="font-size:1.05rem">${esc(pick(RUN_CHEERS))}</p>
      ${stats}
      ${all ? `<p class="bonusline">You caught every single one! <b>+${FULL_BONUS}</b> bonus points</p>` : ""}
    </div>`;
    if (all) sfx.levelup();
    setTimeout(() => { if (flow.alive(t)) next(); }, all ? 2800 : 2400);
    return;
  }
  panel.innerHTML = `<div class="card">
    <p class="eyebrow">${esc(P.name)}</p>
    <h2 class="big">${head}</h2>
    ${stats}
    <p class="gapnote">${missing} ${missing === 1 ? what.replace(/s$/, "") : what} got away${memory ? ", so the memory will have holes in it" : ""}. Catch every one for <b>+${FULL_BONUS}</b> bonus points!</p>
    <div class="actions choicebtns">
      <button type="button" class="btn" data-primary id="keepGoing" disabled>Keep going <span class="kbd">Enter</span></button>
      <button type="button" class="btn ghost" id="runAgain" disabled>${ICON.retry} Run it again <span class="kbd">A</span></button>
    </div>
  </div>`;
  const again = () => go(S.step);
  bindPrimary(next);
  $("#runAgain").addEventListener("click", again);
  // A short pause first, so a hop pressed as the run ends doesn't pick for you.
  let ready = false;
  setTimeout(() => { if (!flow.alive(t)) return; ready = true; panel.querySelectorAll(".choicebtns .btn").forEach(b => { b.disabled = false; }); focusSoon($("#keepGoing")); }, 600);
  const aKey = e => { if (ready && (e.key === "a" || e.key === "A") && !e.repeat) { e.preventDefault(); again(); } };
  document.addEventListener("keydown", aKey);
  flow.setCleanup(() => document.removeEventListener("keydown", aKey));
  onForward(() => next());
  hintIfIdle("Press [Enter] to keep going, or [A] to run it again and catch the rest.", 12000);
}

/* Memory jigsaws */
function hideMemory() { scene.classList.remove("jigmode"); $("#boardHost").innerHTML = ""; }
// Memory pieces missed in the portal's run leave glitchy holes in the jigsaw: the same share of tiles as pieces missed,
// never on a tile that shows a clue (the mystery needs those). Which tiles is picked from the game's seed, so it stays put.
function memoryGaps(st, rows, cols) {
  const run = S.stats.runs[st.p], tiles = rows * cols;
  if (!run || !run.total) return [];
  const want = Math.round((run.total - run.pieces) / run.total * tiles);
  if (want <= 0) return [];
  const keep = Kit.art.memories.clueTiles(PORTALS[st.p].memory, rows, cols), rng = seededRng(`gaps.${st.p}.${rows}x${cols}`);
  const pool = [...Array(tiles).keys()].filter(i => !keep.has(i));
  for (let k = pool.length - 1; k > 0; k--) { const j = Math.floor(rng() * (k + 1)); [pool[k], pool[j]] = [pool[j], pool[k]]; }
  return pool.slice(0, want).sort((a, b) => a - b);
}
function renderJigsaw(st) {
  const P = PORTALS[st.p], [rows, cols] = JIG_GRID[skills.level("jigsaw")], tiles = rows * cols;
  startStage(); applyStage({ theme: P.theme, face: "think" }); $("#place").textContent = P.name;
  scene.classList.add("jigmode");
  const run = S.stats.runs[st.p] || null, gaps = memoryGaps(st, rows, cols);
  const gapLine = gaps.length
    ? `You caught ${run.pieces} of ${run.total} pieces, so ${gaps.length === 1 ? "one piece is" : `${gaps.length} pieces are`} still lost in the glitch. Fix the rest!`
    : run && run.pieces < run.total ? `You caught ${run.pieces} of ${run.total} pieces. T-Rexy's big brain remembered the rest!` : "";
  panel.innerHTML = `<div class="card">
    <p class="eyebrow">${esc(P.name)}: a lost memory</p>
    <p class="digtip">Swap two pieces to fix the picture. Click two, or use the arrow keys and Enter.</p>
    ${gapLine ? `<p class="line gapnote" style="font-size:1rem">${esc(gapLine)}</p>` : ""}
    <div class="statrow"><span class="stat" id="jigProg"><b>0</b> of ${tiles} home</span></div>
    <div class="helpers">
      <button type="button" class="help" data-help="peek" style="--who:var(--cyan)">${ICON.eye}<span>Peek</span></button>
      <button type="button" class="help" data-help="fix" style="--who:var(--c-hero)">${headIcon}<span>Fix one</span></button>
    </div>
    <p class="feedback" id="fb" aria-live="assertive"></p>
  </div>`;
  if (gaps.length) toast(gaps.length === 1 ? "One piece is missing from this memory." : `${gaps.length} pieces are missing from this memory.`);
  const prog = $("#jigProg"), fixBtn = panel.querySelector('[data-help="fix"]');
  let nudged = false, moves = 0, skipping = false;
  const jig = Kit.jigsaw.render($("#boardHost"), {
    svg: Kit.art.memories[P.memory](), rows, cols, label: "Memory puzzle", missing: gaps,
    onMove: (placed, total) => {
      prog.innerHTML = `<b>${placed}</b> of ${total} home`;
      if (!nudged && ++moves > tiles + 4) { nudged = true; fixBtn.classList.add("nudge"); express("think", 1500); }
    },
    onDone: r => {
      clearHints(); markPassed();
      const nothingToDo = r.moves <= 0 && r.fixes === 0; // every piece left was already home
      if (!skipping && !nothingToDo) {
        S.stats.pts += 300;
        const outcome = r.fixes >= 3 ? "gaveup" : (r.fixes === 0 && r.peeks === 0 && r.moves <= r.best + 2) ? "clean" : (r.fixes === 0 && r.moves <= r.best + 8) ? "ok" : "struggle";
        skills.record("jigsaw", outcome);
      }
      save();
      panel.querySelectorAll(".help").forEach(b => { b.disabled = true; });
      const fb = $("#fb"); fb.className = "feedback good cheer";
      fb.textContent = r.gaps ? `${pick(CHEERS)} Most of the memory is back!` : pick(CHEERS);
      express("happy", 2400); hop();
      onForward(null);
      const t = flow.token();
      setTimeout(() => { if (flow.alive(t)) next(); }, 2200);
    }
  });
  panel.querySelector('[data-help="peek"]').addEventListener("click", () => { jig.peek(); express("think", 1200); });
  fixBtn.addEventListener("click", () => { fixBtn.classList.remove("nudge"); jig.fix(); hop(); });
  heroTap = () => { jig.fix(); hop(); };
  navKeys("letters"); // the arrow keys move around the puzzle
  onForward(() => { skipping = true; while (jig.fix()) { /* put every piece home */ } });
  hintIfIdle("Click a piece, then click the spot where it goes. Stuck? Click Fix one, or Peek at the picture.", 15000);
  flow.setCleanup(() => jig.stop());
}

/* Glitch-locked clue words */
function renderWord(st) {
  const P = PORTALS[st.p], w = wordFor(st.p), L = skills.level("words");
  startStage(); applyStage({ theme: P.theme, face: "think" }); $("#place").textContent = P.name;
  let misses = 0;
  const ctl = Kit.fuelWord.render(panel, {
    head: `<p class="eyebrow">${esc(P.name)}: glitch-locked clue word</p>`,
    tip: "Type letters to guess the word. Wrong letters burn fuel!",
    word: w.word, hint: w.hint, fuel: FUEL[L], cheers: CHEERS, helperHtml: headIcon, checkHtml: ICON.check,
    onGuess: (c, ok) => {
      express(ok ? "happy" : "worried", 900);
      if (!ok && ++misses === 3) showHint("Try the vowels: [A] [E] [I] [O] [U]. Or click Scan to light up a letter.");
    },
    onScan: () => hop(),
    onOut: () => express("worried", 3000),
    onWin: r => {
      S.stats.pts += 300;
      const outcome = r.out ? "gaveup" : (r.misses <= 1 && !r.scans) ? "clean" : r.misses >= 4 ? "struggle" : "ok";
      skills.record("words", outcome); markPassed(); save();
      clearHints(); onForward(null);
      express("happy", 2000); hop();
    },
    onDone: () => next()
  });
  heroTap = () => ctl.use("scan");
  navKeys("arrows"); // letters are guesses here
  onForward(() => { markPassed(); next(); }); // skipping the word earns no points
  hintIfIdle("Type a letter you think is in the word. The hint above helps!", 14000);
  flow.setCleanup(() => ctl.stop());
}

/* Typing a clue into the notebook */
function renderClue(st) {
  const C = CLUES[st.p], L = skills.level("typing"), text = pickVersion(`line.${st.p}.${L}`, QBANK.lines[st.p][L - 1]);
  const fact = pickVersion(`fact.${st.p}`, QBANK.facts[st.p]), bonus = pickVersion(`bonus.${st.p}`, QBANK.bonus[st.p]);
  startStage(); applyStage({ face: "think" }); hideMemory();
  panel.innerHTML = `<div class="card">
    <div class="cluecard"><h3>${esc(C.title)}</h3><p>${esc(C.saw)}</p><p class="fact">${esc(fact)}</p><p class="bonus">${esc(bonus)}</p></div>
    <p class="digtip">Type the clue into your notebook.</p>
    <div class="typehost" id="typeHost"></div>
  </div>`;
  const saveClue = () => { if (!S.clues.includes(st.p)) S.clues.push(st.p); markPassed(); save(); paintHud(); };
  navKeys("arrows"); // letters are for typing here
  onForward(() => { saveClue(); next(); });
  hintIfIdle("Type the glowing letter, then the next one. Spaces count too!", 10000);
  flow.setCleanup(Kit.typing.line($("#typeHost"), {
    text,
    onDone: (r, doneEl) => {
      flow.setCleanup(null); clearHints(); onForward(null);
      const t = S.stats.typing; t.hits += r.hits; t.misses += r.misses; t.ms += r.ms; t.chars += r.chars;
      const acc = r.hits / Math.max(1, r.hits + r.misses);
      skills.record("typing", acc >= .96 ? "clean" : acc >= .88 ? "ok" : "struggle");
      saveClue(); express("happy", 2000); hop();
      doneEl.innerHTML = `<p class="feedback good cheer">Clue saved!</p>`;
      const tk = flow.token();
      setTimeout(() => { if (flow.alive(tk)) next(); }, 1600);
    }
  }));
}

/* Ship parts and paint */
function optionKeys(sel, pickFn) {
  const opts = [...panel.querySelectorAll(sel)];
  opts.forEach(b => b.addEventListener("click", () => pickFn(b)));
  const onKey = e => { const n = Number(e.key); if (n >= 1 && n <= opts.length) { e.preventDefault(); pickFn(opts[n - 1]); } };
  document.addEventListener("keydown", onKey);
  flow.setCleanup(() => document.removeEventListener("keydown", onKey));
  focusSoon(opts[0]);
  return opts;
}
// Forward on a pick-one screen picks the first choice; a hint shows the number keys if nobody picks for a while.
function pickHints(opts) {
  onForward(() => { if (opts[0]) opts[0].click(); });
  hintIfIdle(`Press [1]${opts.length > 2 ? ", [2]," : ""} or [${opts.length}] to pick one, or click it.`, 12000);
}
function renderPart(st) {
  const P = PORTALS[st.p], key = P.part, def = SHIP.PARTS[key];
  startStage(); applyStage({ face: "happy" }); hideMemory();
  panel.innerHTML = `<div class="card">
    <p class="eyebrow">New ship part!</p>
    <h2 class="big">${esc(def.name)}</h2>
    <div class="options">${def.options.map(([id, label], i) => `<button type="button" class="opt" data-opt="${id}">${SHIP.box(SHIP.svg({ ...S.parts, [key]: id, paint: S.paint || "lime" }, { ghost: true, flame: key === "thrusters" || key === "core" }))}<span>${esc(label)}</span><span class="k">${i + 1}</span></button>`).join("")}</div>
  </div>`;
  pickHints(optionKeys(".opt[data-opt]", b => {
    S.parts[key] = b.dataset.opt;
    if (!S.done.includes(st.p)) S.done.push(st.p);
    markPassed(); save(); paintHud(); sfx.found(); toast(`${def.name} added to your ship!`);
    next();
  }));
}
function renderPaint() {
  startStage(); applyStage({ ship: true, face: "happy" }); $("#place").textContent = "The Crash Pad";
  panel.innerHTML = `<div class="card">
    <p class="eyebrow">Your ship is fixed!</p>
    <h2 class="big">Pick a <span class="hot">paint job</span></h2>
    <div class="options">${SHIP.PAINT_ORDER.map((id, i) => `<button type="button" class="opt" data-paint="${id}">${SHIP.box(SHIP.svg({ ...S.parts, paint: id }, {}))}<span>${esc(SHIP.PAINTS[id].label)}</span><span class="k">${i + 1}</span></button>`).join("")}</div>
  </div>`;
  pickHints(optionKeys(".opt[data-paint]", b => { S.paint = b.dataset.paint; markPassed(); save(); sfx.join(); toast(`${SHIP.PAINTS[S.paint].label}! Looking sharp.`); next(); }));
}

/* New songs */
function renderSong(st) {
  collectSong(st.id); startStage();
  const title = (Kit.songs[st.id] || {}).title || st.id;
  panel.innerHTML = `<div class="card say">
    <p class="eyebrow">New song!</p>
    <p class="songtitle">${ICON.note.replace('class="note-ic" ', "")}${esc(title)}</p>
    ${st.id === "lullaby" ? `<p class="line">The weird music! It was a lullaby all along.</p>` : ""}
    <div class="actions">${nextBtn("Next", '<span class="kbd">Enter</span>')}</div>
  </div>`;
  playSong(st.id); sfx.song(); toast(`New song: ${title}`); express("happy", 2000);
  hintIfIdle("Press [Enter] to keep going. [L] goes back a line.", 15000);
  bindPrimary(next);
}

/* The Shadow Gate */
function renderFinal() {
  runPortal({
    key: "gate", theme: "shadow", name: "The Shadow Gate", n: 4, pieces: 8, secret: false, shadow: true, base: 500, per: 25,
    done: (res, level, all) => afterRun(PORTALS.gate, res, level, { all, what: "star shards", memory: false })
  });
}

/* The mystery */
let mysteryAnswer = -1; // the play-test reads this to pick the right answer
function renderDeduce(st) {
  const step = DEDUCE[st.n], D = { ...step, ...pickVersion(`mystery.${st.n}`, step.v) };
  mysteryAnswer = D.a;
  startStage(); applyStage({ face: "think" });
  const order = shuffle(D.opts.map((t, i) => i));
  let done = false;
  panel.innerHTML = `<div class="card">
    <div class="headrow"><p class="eyebrow">Solve the mystery</p>${Kit.ui.pips(st.n, 4)}</div>
    <p class="q">${esc(D.q)}</p>
    <div class="choices">${order.map((i, k) => `<button type="button" class="choice" data-i="${i}"><span class="n">${k + 1}</span>${esc(D.opts[i])}</button>`).join("")}</div>
    <div id="nope"></div>
    <p class="feedback" id="fb" aria-live="assertive"></p>
  </div>`;
  const choose = b => {
    if (done || b.disabled) return;
    const fb = $("#fb");
    if (Number(b.dataset.i) === D.a) {
      done = true; b.classList.add("yes"); panel.querySelectorAll(".choice").forEach(x => { x.disabled = true; });
      S.stats.pts += 150; markPassed(); save(); clearHints(); onForward(null);
      sfx.right(); express("happy", 2000); hop();
      fb.className = "feedback good cheer"; fb.textContent = pick(CHEERS);
      const t = flow.token(); setTimeout(() => { if (flow.alive(t)) next(); }, 1700);
    } else {
      b.classList.add("no"); b.disabled = true; sfx.wrong(); express("think", 1800);
      fb.className = "feedback oops"; fb.textContent = D.nope;
      const C = CLUES[D.clue];
      $("#nope").innerHTML = `<p class="clue-note"><b>Clue ${C.n}:</b> ${esc(C.short)}</p>`;
    }
  };
  optionKeys(".choice", choose);
  // Forward shows the answer (no points for that one), then moves on.
  onForward(() => {
    if (done) return;
    done = true; markPassed(); clearHints();
    panel.querySelectorAll(".choice").forEach(x => { x.disabled = true; if (Number(x.dataset.i) === D.a) x.classList.add("yes"); });
    const fb = $("#fb"); fb.className = "feedback"; fb.textContent = "Here's the answer. Think about why it fits the clues!";
    const t = flow.token(); setTimeout(() => { if (flow.alive(t)) next(); }, 2600);
  });
  hintIfIdle("Think about your clues! Press [1], [2], or [3] to answer. Wrong answers are okay.", 20000);
}
function renderShrink() {
  startStage();
  panel.innerHTML = `<div class="card say"><p class="line" style="font:800 clamp(1.5rem,1.2rem + 1.4vw,2.2rem)/1.25 var(--font-display);color:var(--ember-gold)">Shadowspine is... SHRINKING?!</p></div>`;
  startShrink(); sfx.lost(); express("surprised", 3200);
  onForward(() => { applyStage({ nova: true, novaFace: "surprised", shadow: 0, lantern: false }); next(); });
  const t = flow.token();
  setTimeout(() => {
    if (!flow.alive(t)) return;
    applyStage({ nova: true, novaFace: "surprised", shadow: 0, lantern: false }); sfx.found();
    setTimeout(() => { if (flow.alive(t)) next(); }, 900);
  }, 2800);
}

/* Ending */
// Score = run points (300 + 20 per memory piece; the Shadow Gate 500 + 25 per star shard; double in Hard mode; +200 for catching
// every piece in a run) + 300 per jigsaw + 300 per clue word + 150 per mystery answer + 20 x typing words per minute
// + 5 x typing accuracy percent + 250 per secret page. Mistakes, crashes, and helpers never cost points. Skipping ahead with R
// earns nothing for the part skipped.
function computeScore() {
  const t = S.stats.typing;
  const acc = t.hits + t.misses ? Math.round(t.hits / (t.hits + t.misses) * 100) : 0;
  const wpm = t.ms > 0 ? Math.min(150, Math.round((t.chars / 5) / (t.ms / 60000))) : 0;
  const runPts = Object.values(S.stats.runs).reduce((a, r) => a + (r.pts || 0), 0);
  const pagePts = 250 * S.pages.length, gamePts = (S.stats.pts || 0) + runPts;
  return { acc, wpm, gamePts, speedPts: wpm * 20, accPts: acc * 5, pagePts, total: gamePts + wpm * 20 + acc * 5 + pagePts };
}
const fullRuns = () => Object.values(S.stats.runs).filter(r => r.full).length;
function renderEnd() {
  store.del(KEYS.save); active = false;
  startStage(); playSong("homeStomp"); express("happy", 4000); hop();
  const sc = computeScore();
  panel.innerHTML = `<div class="card end">
    <h2 class="big">T-Rexy is <span class="hot">home!</span></h2>
    ${S.pages.length === 4 ? `<p class="secret-end">Secret ending! Nova's diary had one more page: a crayon drawing of her and T-Rexy, labeled BEST FRIENDS (probably).</p>` : ""}
    <div class="scorecard" aria-label="Your score">
      <p class="sc-row"><span>Runs, puzzles, and clues${S.mode === "hard" ? " (Hard mode: runs count double)" : ""}${fullRuns() ? `, with ${fullRuns()} full-catch bonus${fullRuns() > 1 ? "es" : ""}` : ""}</span><span>${sc.gamePts}</span></p>
      <p class="sc-row"><span>Typing speed: ${sc.wpm} words per minute</span><span>${sc.speedPts}</span></p>
      <p class="sc-row"><span>Typing accuracy: ${sc.acc}%</span><span>${sc.accPts}</span></p>
      <p class="sc-row"><span>Secret pages: ${S.pages.length} of 4</span><span>${sc.pagePts}</span></p>
      <p class="sc-row sc-total"><span>Score</span><span>${sc.total}</span></p>
    </div>
    <div class="levels"><span class="lvl"><b>${esc(modeOf().label)}</b> mode</span><span class="lvl"><b>Fastest run</b> level ${Math.max(1, ...Object.values(S.stats.runs).map(r => r.level || 1))} of 6</span>${["jigsaw", "words", "typing"].map(k => `<span class="lvl"><b>${SKILL_NAME[k]}</b> level ${skills.level(k)} of ${SKILLS[k].max}</span>`).join("")}</div>
    <form class="answer" id="hsForm" autocomplete="off">
      <label class="sr" for="hsName">Your name for the high score board</label>
      <input id="hsName" class="field arcade-field" maxlength="10" placeholder="YOUR NAME">
      <button class="btn check" type="submit">${ICON.check}<span class="sr">Save score</span></button>
    </form>
    <p class="rankmsg" id="rankMsg"></p>
    <div class="board end-board" data-scoreboard></div>
    <div class="actions start"><button class="btn ghost" type="button" id="againBtn">${ICON.retry} Play again</button></div>
  </div>`;
  board.render();
  $("#againBtn").addEventListener("click", () => { S = fresh(); paintHud(); renderTitle(); });
  $("#hsForm").addEventListener("submit", async e => {
    e.preventDefault();
    const nm = $("#hsName").value.replace(/[^A-Za-z0-9 ]/g, "").trim().slice(0, 10);
    if (!nm) { $("#hsName").focus(); return; }
    $("#hsForm").querySelectorAll("input,button").forEach(x => { x.disabled = true; });
    const rank = await board.save({ name: nm, score: sc.total, mode: S.mode, pages: S.pages.length, wpm: sc.wpm, acc: sc.acc, levels: skills.snapshot(), at: new Date().toISOString() });
    $("#rankMsg").textContent = rank && rank <= 10 ? `#${rank}!` : "Saved!";
    sfx.join(); express("happy", 2500); hop();
    const ab = $("#againBtn"); ab.className = "btn"; focusSoon(ab);
  });
  focusSoon($("#hsName"));
}

// Tapping T-Rexy in a story scene: during a puzzle he helps (Scan or Fix one); otherwise he just hops.
cv.addEventListener("click", e => {
  if (mode !== "stage") return;
  const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  const hx = ST.ship ? .22 : .26;
  if (Math.abs(x - hx) < .12 && y > .4 && y < .9) { if (heroTap) heroTap(); else { hop(); express("happy", 1200); sfx.key(); } }
});
