/**
 * @file games/mini-game-survival/screens.js
 * @about Mini Game Survival's screens: title (high scores and jukebox), story lines, the crash pad with the clue notebook, obstacle runs, memory jigsaws, glitch-locked clue words, typing clues into the notebook, picking ship parts and paint, new songs, the mystery questions, the big shrink, and the ending with the score and name entry. Results feed the adaptive levels here. Right answers cheer and move on by themselves.
 * @requires kit/typing-challenges.js, kit/jigsaw.js, kit/fuel-word.js, kit/jukebox.js, kit/scoreboard.js, assets/memories/memories.js, games/mini-game-survival/scene.js
 */
const board = Kit.scoreboard.create({ storeKey: KEYS.scores });
const CHEERS = ["Roar-some!", "Dino-mite!", "T-Rexcellent!", "Glitch-tastic!", "Jurassic genius!", "Tiny arms, HUGE brain!",
  "Big head energy!", "Stomp, stomp, CORRECT!", "Totally Rex-tacular!", "Your brain just did a backflip!"];
let heroTap = null;

const PORTRAIT = {
  trexy: () => `<svg class="portrait" viewBox="-12 -96 68 56" aria-hidden="true">${Kit.art.trexy.g({ face: "smile" })}</svg>`,
  nova: () => `<svg class="portrait" viewBox="2 -50 56 46" aria-hidden="true">${Kit.art.nova.g({ lantern: false })}</svg>`,
  shadow: () => `<svg class="portrait" viewBox="-56 -64 110 70" aria-hidden="true">${Kit.art.nova.shadow("#000")}</svg>`,
  family: () => `<svg class="portrait" viewBox="-12 -100 68 58" aria-hidden="true">${Kit.art.trexy.g({ who: "mom", acc: "flower", face: "happy" })}</svg>`
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
  applyStage({ theme: "hub", face: "smile", acc: "none", shadow: 1, nova: false, ship: false, family: false, lantern: false });
  scene.classList.add("attract"); $("#place").textContent = "";
  const saved = loadSave();
  panel.innerHTML = `<div class="card title">
    <div><h2 class="big glitchy-big"><span class="glitchy" data-text="MINI GAME">MINI GAME</span><br><span class="hot">SURVIVAL</span></h2><p class="byline">A T-Rexy mystery</p></div>
    <div class="actions start">
      <button class="btn big" type="button" data-primary id="playBtn">Play ${ICON.go}</button>
      ${saved ? `<button type="button" class="btn ghost" id="resumeBtn">${ICON.retry} Keep going</button>` : ""}
    </div>
    <div class="board panel-board" data-scoreboard></div>
    <section class="jukebox" aria-label="Jukebox"><p class="eyebrow">${ICON.note.replace('class="note-ic" ', "")} Jukebox</p><div class="jlist" id="jukeList"></div></section>
  </div>`;
  board.render(); renderJukebox();
  bindPrimary(() => {
    Kit.audio.ctx(); music.unlock();
    S = fresh(); active = true; store.del(KEYS.save); scene.classList.remove("attract");
    resetStage(); paintHud(); go(0);
  });
  const rb = $("#resumeBtn");
  if (rb) rb.addEventListener("click", () => { Kit.audio.ctx(); music.unlock(); S = Object.assign(fresh(), saved); active = true; scene.classList.remove("attract"); restore(); go(S.step); });
}
function resetStage() { applyStage({ theme: "night", face: "smile", acc: "none", nova: false, novaFace: "surprised", shadow: 0, lantern: false, ship: false, family: false }); }

/* Story */
function renderSay(st) {
  const c = CAST[st.who];
  startStage(); $("#place").textContent = "";
  panel.innerHTML = `<div class="card say" data-who="${st.who}" style="--who:${c.color}">
    <div class="whorow">${PORTRAIT[st.who] ? PORTRAIT[st.who]() : ""}<p class="who">${esc(c.label)}</p></div>
    <p class="line">${esc(st.x)}</p>
    <div class="actions">${nextBtn("Next", '<span class="kbd">Enter</span>')}</div>
  </div>`;
  if (st.face) express(st.face, 3000);
  if (st.hop) { hop(); setTimeout(hop, 600); }
  if (st.who === "shadow") { flinch(); Kit.audio.tone(110, .4, "sawtooth", .04, 0, 70); }
  if (st.who === "nova") Kit.audio.tone(1400, .08, "sine", .04);
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
    ${PORTAL_ORDER.map(id => S.clues.includes(id) ? `<p class="clue-note"><b>Clue ${CLUES[id].n}:</b> ${esc(CLUES[id].short)}</p>` : `<p class="clue-note empty">Clue ${CLUES[id].n}: ???</p>`).join("")}
    ${S.pages.length ? `<p class="eyebrow">Mysterious notes (${S.pages.length} of 4)</p>${[...S.pages].sort().map(i => `<p class="diary">${esc(PAGES[i])}<span class="paw" aria-label="signed with a tiny footprint">&#x2234;</span></p>`).join("")}` : ""}
  </div>`;
}
function renderHub() {
  $("#place").textContent = "The Crash Pad";
  panel.innerHTML = notebookHTML();
  startHub(() => next(), () => { panel.innerHTML = notebookHTML(); });
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
function runPortal({ theme, name, level, length, pieces, secret, extraShip, shadow, onPiecePage, done }) {
  const speed = RUN_SPEED[level - 1];
  const gen = Kit.runner.generate({ chunks: Kit.levels.runner, level, speed, length: speed * length, pieces, secret, extraShip });
  $("#place").textContent = name;
  const tok = flow.token(), firstRun = !S.tipped;
  startStage(); applyStage({ theme, face: "smile" }); stageEl.classList.add("wide"); blurActive();
  const ui = $("#runUi");
  let cpOn = false;
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
  countdown(() => flow.alive(tok)).then(ok => {
    if (!ok) return;
    startRun({
      gen, theme, shadow, tip: firstRun ? "Space, Up, or click to hop. His hop is tiny!" : "",
      onCrash: n => { if (n === 1 && firstRun) toast("Ouch! Back to the start."); if (n >= 3) showCp(); },
      onCollect: o => { if (o.k === "x" && onPiecePage) onPiecePage(); },
      onMode: m => { if (m === "ship" && !S.shipTip) { S.shipTip = true; save(); toast("Ship mode! Hold to fly up."); } },
      onFinish: res => { document.removeEventListener("keydown", cKey); done(res); }
    });
    if (firstRun) { S.tipped = true; save(); }
    blurActive();
  });
}
function runOutcome(res) { return res.usedCheckpoints ? "gaveup" : res.crashes <= 1 ? "clean" : res.crashes <= 4 ? "ok" : "struggle"; }
function renderRun(st) {
  const P = PORTALS[st.p], [rows, cols] = JIG_GRID[skills.level("jigsaw")];
  runPortal({
    theme: P.theme, name: P.name, level: skills.level("run"), length: 22, pieces: rows * cols, secret: true,
    onPiecePage: () => {
      const i = PORTAL_ORDER.indexOf(st.p);
      if (!S.pages.includes(i)) { S.pages.push(i); save(); }
      toast("A secret page! Someone's diary...");
    },
    done: res => {
      const pts = res.usedCheckpoints ? 100 + 5 * res.pieces : Math.max(100, 400 + 15 * res.pieces - 20 * res.crashes);
      S.stats.pts += pts; S.stats.runs[st.p] = { crashes: res.crashes, pieces: res.pieces, total: res.piecesTotal, checkpoints: res.usedCheckpoints, secret: res.secret };
      skills.record("run", runOutcome(res)); save();
      afterRun(P, res, `${res.pieces} of ${res.piecesTotal} memory pieces`);
    }
  });
}
function afterRun(P, res, piecesText) {
  startStage(); applyStage({ theme: P.theme, face: "happy" }); express("happy", 2400); hop();
  panel.innerHTML = `<div class="card">
    <p class="eyebrow">${esc(P.name)}</p>
    <h2 class="big">Portal <span class="hot">cleared!</span></h2>
    <div class="statrow"><span class="stat"><b>${esc(piecesText)}</b></span><span class="stat">Attempts: <b>${res.attempts}</b></span>${res.secret ? `<span class="stat"><b>Secret page!</b></span>` : ""}</div>
  </div>`;
  const t = flow.token();
  setTimeout(() => { if (flow.alive(t)) next(); }, 2400);
}

/* Memory jigsaws */
function hideMemory() { scene.classList.remove("jigmode"); $("#boardHost").innerHTML = ""; }
function renderJigsaw(st) {
  const P = PORTALS[st.p], [rows, cols] = JIG_GRID[skills.level("jigsaw")];
  startStage(); applyStage({ theme: P.theme, face: "think" }); $("#place").textContent = P.name;
  scene.classList.add("jigmode");
  const got = (S.stats.runs[st.p] || {}).pieces;
  panel.innerHTML = `<div class="card">
    <p class="eyebrow">${esc(P.name)}: a lost memory</p>
    <p class="digtip">Swap two pieces to fix the picture. Click two, or use the arrow keys and Enter.</p>
    ${got != null && got < rows * cols ? `<p class="line" style="font-size:1rem">You caught ${got} of ${rows * cols} pieces. T-Rexy's big brain remembered the rest!</p>` : ""}
    <div class="statrow"><span class="stat" id="jigProg"><b>0</b> of ${rows * cols} home</span></div>
    <div class="helpers">
      <button type="button" class="help" data-help="peek" style="--who:var(--cyan)">${ICON.eye}<span>Peek</span></button>
      <button type="button" class="help" data-help="fix" style="--who:var(--c-hero)">${headIcon}<span>Fix one</span></button>
    </div>
    <p class="feedback" id="fb" aria-live="assertive"></p>
  </div>`;
  const prog = $("#jigProg"), fixBtn = panel.querySelector('[data-help="fix"]');
  let nudged = false, moves = 0;
  const jig = Kit.jigsaw.render($("#boardHost"), {
    svg: Kit.art.memories[P.memory](), rows, cols, label: "Memory puzzle",
    onMove: (placed, total) => {
      prog.innerHTML = `<b>${placed}</b> of ${total} home`;
      if (!nudged && ++moves > rows * cols + 4) { nudged = true; fixBtn.classList.add("nudge"); express("think", 1500); }
    },
    onDone: r => {
      const pts = Math.max(80, 300 - 8 * Math.max(0, r.moves - r.best) - 40 * r.peeks - 60 * r.fixes);
      S.stats.pts += pts; S.stats.jigs[st.p] = r;
      const outcome = r.fixes >= 3 ? "gaveup" : (r.fixes === 0 && r.peeks === 0 && r.moves <= r.best + 2) ? "clean" : (r.fixes === 0 && r.moves <= r.best + 8) ? "ok" : "struggle";
      skills.record("jigsaw", outcome); save();
      panel.querySelectorAll(".help").forEach(b => { b.disabled = true; });
      const fb = $("#fb"); fb.className = "feedback good cheer"; fb.textContent = pick(CHEERS);
      express("happy", 2400); hop();
      const t = flow.token();
      setTimeout(() => { if (flow.alive(t)) next(); }, 2200);
    }
  });
  panel.querySelector('[data-help="peek"]').addEventListener("click", () => { jig.peek(); express("think", 1200); });
  fixBtn.addEventListener("click", () => { fixBtn.classList.remove("nudge"); jig.fix(); hop(); });
  heroTap = () => { jig.fix(); hop(); };
  flow.setCleanup(() => jig.stop());
}

/* Glitch-locked clue words */
function renderWord(st) {
  const P = PORTALS[st.p], w = wordFor(st.p), L = skills.level("words");
  startStage(); applyStage({ theme: P.theme, face: "think" }); $("#place").textContent = P.name;
  const ctl = Kit.fuelWord.render(panel, {
    head: `<p class="eyebrow">${esc(P.name)}: glitch-locked clue word</p>`,
    tip: "Type letters to guess the word. Wrong letters burn fuel!",
    word: w.word, hint: w.hint, fuel: FUEL[L], cheers: CHEERS, helperHtml: headIcon, checkHtml: ICON.check,
    onGuess: (c, ok) => express(ok ? "happy" : "worried", 900),
    onScan: () => hop(),
    onOut: () => express("worried", 3000),
    onWin: r => {
      S.stats.pts += r.out ? 40 : 150 + 40 * r.fuelLeft;
      S.stats.words[st.p] = { word: w.word, misses: r.misses, scans: r.scans, out: r.out };
      const outcome = r.out ? "gaveup" : (r.misses <= 1 && !r.scans) ? "clean" : r.misses >= 4 ? "struggle" : "ok";
      skills.record("words", outcome); save();
      express("happy", 2000); hop();
    },
    onDone: () => next()
  });
  heroTap = () => ctl.use("scan");
  flow.setCleanup(() => ctl.stop());
}

/* Typing a clue into the notebook */
function renderClue(st) {
  const C = CLUES[st.p], L = skills.level("typing"), text = C.type[L - 1];
  startStage(); applyStage({ face: "think" }); hideMemory();
  panel.innerHTML = `<div class="card">
    <div class="cluecard"><h3>${esc(C.title)}</h3><p>${esc(C.saw)}</p><p class="fact">${esc(C.fact)}</p></div>
    <p class="digtip">Type the clue into your notebook.</p>
    <div class="typehost" id="typeHost"></div>
  </div>`;
  flow.setCleanup(Kit.typing.line($("#typeHost"), {
    text,
    onDone: (r, doneEl) => {
      flow.setCleanup(null);
      const t = S.stats.typing; t.hits += r.hits; t.misses += r.misses; t.ms += r.ms; t.chars += r.chars;
      const acc = r.hits / Math.max(1, r.hits + r.misses);
      skills.record("typing", acc >= .96 ? "clean" : acc >= .88 ? "ok" : "struggle");
      if (!S.clues.includes(st.p)) S.clues.push(st.p);
      save(); paintHud(); express("happy", 2000); hop();
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
}
function renderPart(st) {
  const P = PORTALS[st.p], key = P.part, def = SHIP.PARTS[key];
  startStage(); applyStage({ face: "happy" }); hideMemory();
  panel.innerHTML = `<div class="card">
    <p class="eyebrow">New ship part!</p>
    <h2 class="big">${esc(def.name)}</h2>
    <div class="options">${def.options.map(([id, label], i) => `<button type="button" class="opt" data-opt="${id}">${SHIP.box(SHIP.svg({ ...S.parts, [key]: id, paint: S.paint || "lime" }, { ghost: true, flame: key === "thrusters" || key === "core" }))}<span>${esc(label)}</span><span class="k">${i + 1}</span></button>`).join("")}</div>
  </div>`;
  optionKeys(".opt[data-opt]", b => {
    S.parts[key] = b.dataset.opt;
    if (!S.done.includes(st.p)) S.done.push(st.p);
    save(); paintHud(); sfx.found(); toast(`${def.name} added to your ship!`);
    next();
  });
}
function renderPaint() {
  startStage(); applyStage({ ship: true, face: "happy" }); $("#place").textContent = "The Crash Pad";
  panel.innerHTML = `<div class="card">
    <p class="eyebrow">Your ship is fixed!</p>
    <h2 class="big">Pick a <span class="hot">paint job</span></h2>
    <div class="options">${SHIP.PAINT_ORDER.map((id, i) => `<button type="button" class="opt" data-paint="${id}">${SHIP.box(SHIP.svg({ ...S.parts, paint: id }, {}))}<span>${esc(SHIP.PAINTS[id].label)}</span><span class="k">${i + 1}</span></button>`).join("")}</div>
  </div>`;
  optionKeys(".opt[data-paint]", b => { S.paint = b.dataset.paint; save(); sfx.join(); toast(`${SHIP.PAINTS[S.paint].label}! Looking sharp.`); next(); });
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
  bindPrimary(next);
}

/* The Shadow Gate */
function renderFinal() {
  runPortal({
    theme: "shadow", name: "The Shadow Gate", level: skills.level("run"), length: 30, pieces: 8, secret: false, extraShip: true, shadow: true,
    done: res => {
      const pts = res.usedCheckpoints ? 200 + 5 * res.pieces : Math.max(200, 600 + 20 * res.pieces - 20 * res.crashes);
      S.stats.pts += pts; S.stats.runs.gate = { crashes: res.crashes, pieces: res.pieces, total: res.piecesTotal, checkpoints: res.usedCheckpoints };
      skills.record("run", runOutcome(res)); save();
      afterRun(PORTALS.gate, res, `${res.pieces} of ${res.piecesTotal} star shards`);
    }
  });
}

/* The mystery */
function renderDeduce(st) {
  const D = DEDUCE[st.n];
  startStage(); applyStage({ face: "think" });
  const order = shuffle(D.opts.map((t, i) => i));
  let wrong = 0, done = false;
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
      S.stats.mystery.right++; S.stats.pts += wrong ? 50 : 150; save();
      sfx.right(); express("happy", 2000); hop();
      fb.className = "feedback good cheer"; fb.textContent = pick(CHEERS);
      const t = flow.token(); setTimeout(() => { if (flow.alive(t)) next(); }, 1700);
    } else {
      wrong++; S.stats.mystery.wrong++; save();
      b.classList.add("no"); b.disabled = true; sfx.wrong(); express("think", 1800);
      fb.className = "feedback oops"; fb.textContent = D.nope;
      const C = CLUES[D.clue];
      $("#nope").innerHTML = `<p class="clue-note"><b>Clue ${C.n}:</b> ${esc(C.short)}</p>`;
    }
  };
  optionKeys(".choice", choose);
}
function renderShrink() {
  startStage();
  panel.innerHTML = `<div class="card say"><p class="line" style="font:800 clamp(1.5rem,1.2rem + 1.4vw,2.2rem)/1.25 var(--font-display);color:var(--ember-gold)">Shadowspine is... SHRINKING?!</p></div>`;
  startShrink(); sfx.lost(); express("surprised", 3200);
  const t = flow.token();
  setTimeout(() => {
    if (!flow.alive(t)) return;
    applyStage({ nova: true, novaFace: "surprised", shadow: 0, lantern: false }); sfx.found();
    setTimeout(() => { if (flow.alive(t)) next(); }, 900);
  }, 2800);
}

/* Ending */
// Score = run, jigsaw, clue word, and mystery points + 20 x typing words per minute + 5 x typing accuracy percent + 250 per secret page.
function computeScore() {
  const t = S.stats.typing;
  const acc = t.hits + t.misses ? Math.round(t.hits / (t.hits + t.misses) * 100) : 0;
  const wpm = t.ms > 0 ? Math.min(150, Math.round((t.chars / 5) / (t.ms / 60000))) : 0;
  const pagePts = 250 * S.pages.length, gamePts = S.stats.pts || 0;
  return { acc, wpm, gamePts, speedPts: wpm * 20, accPts: acc * 5, pagePts, total: gamePts + wpm * 20 + acc * 5 + pagePts };
}
function renderEnd() {
  store.del(KEYS.save); active = false;
  startStage(); playSong("homeStomp"); express("happy", 4000); hop();
  const sc = computeScore();
  panel.innerHTML = `<div class="card end">
    <h2 class="big">T-Rexy is <span class="hot">home!</span></h2>
    ${S.pages.length === 4 ? `<p class="secret-end">Secret ending! Nova's diary had one more page: a crayon drawing of her and T-Rexy, labeled BEST FRIENDS (probably).</p>` : ""}
    <div class="scorecard" aria-label="Your score">
      <p class="sc-row"><span>Runs, puzzles, and clues</span><span>${sc.gamePts}</span></p>
      <p class="sc-row"><span>Typing speed: ${sc.wpm} words per minute</span><span>${sc.speedPts}</span></p>
      <p class="sc-row"><span>Typing accuracy: ${sc.acc}%</span><span>${sc.accPts}</span></p>
      <p class="sc-row"><span>Secret pages: ${S.pages.length} of 4</span><span>${sc.pagePts}</span></p>
      <p class="sc-row sc-total"><span>Score</span><span>${sc.total}</span></p>
    </div>
    <div class="levels">${Object.keys(SKILLS).map(k => `<span class="lvl"><b>${SKILL_NAME[k]}</b> level ${skills.level(k)} of ${SKILLS[k].max}</span>`).join("")}</div>
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
    const rank = await board.save({ name: nm, score: sc.total, pages: S.pages.length, wpm: sc.wpm, acc: sc.acc, levels: skills.snapshot(), at: new Date().toISOString() });
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
