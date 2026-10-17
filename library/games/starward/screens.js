/**
 * @file games/starward/screens.js
 * @about Starward's screens: title (high scores and jukebox), story lines, new songs, flights, the brave words, puzzles, and the ending with the score and name entry. Puzzle and flight results feed the adaptive levels here. A right answer, a safe landing, or the brave words get a cheer and move on by themselves.
 * @requires kit/puzzle-ui.js, kit/flight.js, kit/typing-challenges.js, kit/jukebox.js, kit/scoreboard.js, games/starward/lumina.js
 */
const board = Kit.scoreboard.create({ storeKey: KEYS.scores });

function renderJukebox() {
  Kit.jukebox.render($("#jukeList"), {
    order: JUKEBOX, songs: Kit.songs, owned: songsOwned, where: id => SONG_WHERE[id] || "", music,
    icons: { note: ICON.note, play: ICON.play, stop: ICON.stop },
    onTurnOn: () => { musicOn = true; store.set(KEYS.music, "on"); paintToggles(); }
  });
}

/* Title */
function renderTitle() {
  active = false; flow.bump();
  mapStop(); scene.classList.add("attract"); music.set("theme");
  const saved = loadSave();
  const ideas = ["Sol", "Orion", "Lumen", "Sprocket"];
  panel.innerHTML = `<div class="card title">
    <div class="titlehead"><svg class="starmark" viewBox="-12 -12 24 24" aria-hidden="true"><use href="#spark4" class="star" transform="scale(2.2)"/></svg><div><h2 class="big">Starward</h2><p class="byline">An original space adventure</p></div></div>
    <form class="answer" id="startForm" autocomplete="off">
      <label class="sr" for="robotName">Robot name</label>
      <input id="robotName" class="field" maxlength="14" placeholder="Robot name" value="${saved ? esc(saved.robot) : ""}">
      <button class="btn big" type="submit">Play ${ICON.go}</button>
    </form>
    <div class="chips">${ideas.map(n => `<button type="button" class="chip" data-name="${n}">${n}</button>`).join("")}</div>
    ${saved ? `<div class="actions start"><button type="button" class="btn ghost" id="resumeBtn">${ICON.go} ${esc(WORLDS[saved.world] || "Keep going")}</button></div>` : ""}
    <div class="board panel-board" data-scoreboard></div>
    <section class="jukebox" aria-label="Jukebox"><p class="eyebrow">${ICON.note.replace('class="note-ic" ', "")} Jukebox</p><div class="jlist" id="jukeList"></div></section>
  </div>`;
  board.render(); renderJukebox();
  const input = $("#robotName");
  panel.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => { input.value = c.dataset.name; input.focus(); }));
  $("#startForm").addEventListener("submit", e => {
    e.preventDefault(); Kit.audio.ctx(); music.unlock();
    S = fresh(); S.robot = cleanName(input.value) || "Sol"; S.plan = makePlan(); newPicker();
    active = true; store.del(KEYS.save); scene.classList.remove("attract");
    resetScene(); paintCourage(); paintCrew(); go(0);
  });
  const rb = $("#resumeBtn");
  if (rb) rb.addEventListener("click", () => { Kit.audio.ctx(); music.unlock(); S = Object.assign(fresh(), saved); newPicker(); active = true; scene.classList.remove("attract"); restore(); go(S.step); });
  focusSoon(input);
}

/* Story */
function renderSay(st) {
  const c = CAST[st.who];
  panel.innerHTML = `<div class="card say" data-who="${st.who}" style="--who:${c.color}">
    <p class="who">${esc(c.label())}</p>
    <p class="line">${T(st.x)}</p>
    <div class="actions">${nextBtn("Next", '<span class="kbd">Enter</span>')}</div>
  </div>`;
  if (st.face) express(st.face, 2200);
  if (st.who !== "narrator" && st.who !== "flame") hop(st.who);
  if (st.who === "dog") sfx.woof();
  bindPrimary(next);
}
function renderSong(st) {
  collectSong(st.id);
  const title = (Kit.songs[st.id] || {}).title || st.id;
  panel.innerHTML = `<div class="card say">
    <p class="eyebrow">New song!</p>
    <p class="songtitle">${ICON.note.replace('class="note-ic" ', "")}${esc(title)}</p>
    <div class="actions">${nextBtn("Next", '<span class="kbd">Enter</span>')}</div>
  </div>`;
  if (music.want !== WORLD_SONG[S.world]) music.set(st.id);
  sfx.song(); toast(`New song: ${title}`); express("happy");
  bindPrimary(next);
}

/* Puzzles */
function planetHead(st) { return `<div class="headrow"><p class="eyebrow">${esc(st.set === "corona" ? "Tower" : WORLDS[S.world])}</p>${pips(st.n)}</div>`; }
function helpersFor() {
  const P = Kit.art.portraits, list = [{ key: "scan", type: "scan", label: "Scan", iconHtml: P.robot, color: "var(--c-robot)" }];
  if (S.crew.includes("dog")) list.push({ key: "sniff", type: "clue", label: "Sniff", iconHtml: P.dog, color: "var(--c-dog)", who: "Sunny", onUse: () => { hop("dog"); sfx.woof(); } });
  if (S.crew.includes("peng")) list.push({ key: "peek", type: "peek", label: "Peek", iconHtml: P.peng, color: "var(--c-peng)", onUse: () => hop("peng") });
  if (S.crew.includes("rock")) list.push({ key: "ponder", type: "clue2", label: "Ponder", iconHtml: P.rock, color: "var(--c-rock)", who: "Professor Kepler", onUse: () => hop("rock") });
  return list;
}
const CHEERS = ["Stellar!", "Out of this world!", "Supernova smart!", "Brain thrusters: full power!", "Even the stars are clapping!",
  "Beep boop: CORRECT!", "Houston, we have a genius!", "Rocket brain!", "Nailed it!", "Your brain just did a backflip!"];
const HELP_WHO = { sniff: "dog", peek: "peng", ponder: "rock" };
// After a right answer the cheer shows for a moment, then the game moves on by itself (no Next button).
function runPuzzle(p, opts, onDone) {
  puzzleCtl = Kit.puzzleUI.render(panel, p, {
    head: opts.head, leave: opts.leave, helpers: helpersFor(), cheers: CHEERS, autoNext: 1700,
    icons: { check: ICON.check, eye: ICON.eye, back: ICON.back },
    onHint() { S.stats.hints++; express("think", 1400); save(); },
    onWrong() { hop("robot", "jolt"); express("think", 1500); },
    onNudge(key) { if (HELP_WHO[key]) hop(HELP_WHO[key]); },
    onWin(r) {
      hop("robot"); express("happy", 2200);
      if (opts.site) map.say(r.cheer, 1800);
      ["dog", "peng", "rock"].forEach((w, i) => { if (S.crew.includes(w)) setTimeout(() => hop(w), 120 + i * 120); });
      if (r.shown) { S.stats.shown++; S.stats.pts += 25; addCourage(1); }
      else { S.stats.solved++; S.stats.pts += 60 + 40 * (p.d || 2); addCourage(3); }
      const outcome = r.shown ? "gaveup" : (r.tries === 0 && r.hints === 0) ? "clean" : r.tries >= 2 ? "struggle" : "ok";
      skills.record(p.skill || "words", outcome);
      if (opts.set === "corona") { S.floors = opts.n + 1; scene.dataset.floors = String(S.floors); }
      if (opts.site) map.burst(opts.site.x, opts.site.y - opts.site.beacon, TOK.gold, 12);
      save();
    },
    onDone
  });
}

/* Flights */
function renderFly(st) {
  if (st.vow) return renderVow();
  mapStop();
  if (S.world === "lumina") walkTo("pad", true);
  const leg = LEGS[st.leg], dest = st.to.replace(/^home to /, ""), head = `<p class="eyebrow">${ICON.go} ${esc(dest)}</p>`;
  let attempt = 0, lastPct = 0;
  setShip(true); music.set("theme");
  ready();
  function ready() {
    panel.innerHTML = `<div class="card">
      ${head}
      ${attempt ? `<p class="bigpct low">${lastPct}%</p>` : ""}
      ${Kit.flight.goalBar(attempt ? lastPct : 0, "", PASS * 100)}
      <div class="actions start">${attempt ? nextBtn("Fly again", ICON.retry, "big") : nextBtn("Liftoff!", ICON.rocket, "big")}</div>
    </div>`;
    bindPrimary(async () => {
      panel.innerHTML = `<div class="card">${head}${Kit.flight.goalBar(0, "", PASS * 100)}</div>`;
      const tok = flow.token(), rk = $("#flyRocket");
      const ok = await Kit.flight.countdown({
        el: $("#countdown"), alive: () => flow.alive(tok),
        onStart: () => rk.classList.add("rumble"), onStop: () => rk.classList.remove("rumble"),
        onGo: () => { setFlying(true); stars.boost(); }
      });
      if (!ok) return;
      blurActive();
      flow.setCleanup(Kit.flight.run({
        arena, panel, head,
        words: sample(leg.words, leg.n),
        timing: { base: leg.base, per: leg.per, slow: typingSlow() * (1 + .12 * Math.min(attempt, 3)) },
        maxFalling: skills.level("typing") >= 8 ? 3 : 2,
        alive: () => flow.alive(tok), onCatch: () => stars.boost(), onEnd: result
      }));
    });
  }
  function result(r) {
    const pct = Math.round(r.acc * 100), caught = r.n ? r.caught / r.n : 1;
    if (r.acc >= .95 && caught >= .9) skills.adjust("typing", 1);
    else if (r.acc < PASS || caught < .6) skills.adjust("typing", -1);
    if (r.acc >= PASS) {
      S.stats.legs[st.leg] = { hits: r.hits, misses: r.misses, typeMs: r.typeMs, typeChars: r.typeChars, caught: r.caught, n: r.n, tries: attempt + 1 };
      addCourage(1); save(); sfx.found(); express("happy");
      panel.innerHTML = `<div class="card">
        <h2 class="big">Safe <span class="hot">landing!</span></h2>
        ${Kit.flight.starRow(r.n, r.res)}
        <p class="bigpct">${pct}%</p>
      </div>`;
      const t = flow.token();
      setTimeout(() => { if (flow.alive(t)) next(); }, 2600);
    } else { attempt++; lastPct = pct; ready(); }
  }
}
function renderVow() {
  mapStop(); setShip(false);
  flow.setCleanup(Kit.typing.line(panel, {
    text: VOW,
    onDone: (st, doneEl) => {
      flow.setCleanup(null);
      S.stats.legs.vow = { hits: st.hits, misses: st.misses, typeMs: st.ms, typeChars: st.chars, caught: 0, n: 0 };
      addCourage(2); express("happy"); save();
      doneEl.innerHTML = `<p class="feedback good cheer">So brave!</p>`;
      const t = flow.token();
      setTimeout(() => { if (flow.alive(t)) next(); }, 1600);
    }
  }));
}

/* Ending */
// Score = puzzle points (100 easy, 140 medium, 180 hard; 25 if the answer was shown) + 20 x words per minute + 5 x accuracy percent.
function computeScore() {
  const L = Object.values(S.stats.legs || {});
  const sum = k => L.reduce((t, l) => t + (Number(l[k]) || 0), 0);
  const hits = sum("hits"), misses = sum("misses"), ms = sum("typeMs"), chars = sum("typeChars");
  const acc = hits + misses ? Math.round(hits / (hits + misses) * 100) : 0;
  const wpm = ms > 0 ? Math.round((chars / 5) / (ms / 60000)) : 0;
  const puzzlePts = S.stats.pts || 0, speedPts = wpm * 20, accPts = acc * 5;
  return { acc, wpm, puzzlePts, speedPts, accPts, total: puzzlePts + speedPts + accPts };
}
function renderEnd() {
  store.del(KEYS.save); active = false;
  music.set("reborn"); express("happy", 3000);
  const sc = computeScore();
  panel.innerHTML = `<div class="card end">
    <h2 class="big">You brought back the <span class="hot">Everlight!</span></h2>
    <div class="scorecard" aria-label="Your score">
      <p class="sc-row"><span>Puzzles: ${S.stats.solved} of ${TOTAL_PUZZLES}</span><span>${sc.puzzlePts}</span></p>
      <p class="sc-row"><span>Speed: ${sc.wpm} words per minute</span><span>${sc.speedPts}</span></p>
      <p class="sc-row"><span>Accuracy: ${sc.acc}%</span><span>${sc.accPts}</span></p>
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
  $("#againBtn").addEventListener("click", () => { const name = S.robot; S = fresh(); resetScene(); paintCourage(); paintCrew(); renderTitle(); const i = $("#robotName"); if (i) i.value = name; });
  $("#hsForm").addEventListener("submit", async e => {
    e.preventDefault();
    const nm = $("#hsName").value.replace(/[^A-Za-z0-9 ]/g, "").trim().slice(0, 10);
    if (!nm) { $("#hsName").focus(); return; }
    $("#hsForm").querySelectorAll("input,button").forEach(x => { x.disabled = true; });
    const rank = await board.save({ name: nm, score: sc.total, puzzles: S.stats.solved, wpm: sc.wpm, acc: sc.acc, levels: skills.snapshot(), robot: S.robot.slice(0, 14), at: new Date().toISOString() });
    $("#rankMsg").textContent = rank && rank <= 10 ? `#${rank}!` : "Saved!";
    sfx.join(); express("happy", 2500);
    const ab = $("#againBtn"); ab.className = "btn"; focusSoon(ab);
  });
  focusSoon($("#hsName"));
}
