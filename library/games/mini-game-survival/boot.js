/**
 * @file games/mini-game-survival/boot.js
 * @about Starts Mini Game Survival: connects each story step type to its screen, resumes saved games (rebuilding the scene from the story so far), turns on Enter-to-continue, lets L and R (or the arrow keys) step back and forward through the story, skipping mini games already finished, and keeps the game going through live page updates.
 * @requires kit/flow.js, games/mini-game-survival/story.js, games/mini-game-survival/screens.js
 */
const flow = Kit.flow.create({
  steps: STEPS,
  beforeStep(i) {
    $("#countdown").innerHTML = ""; heroTap = null;
    clearHints(); NAV.keys = "both"; NAV.forward = null; clearTimeout(hubR);
    S.step = i; save();
    const t = STEPS[i] && STEPS[i].t;
    if (t !== "say" && t !== "jigsaw") hideMemory();  // a solved memory stays up while T-Rexy talks about it
  },
  handlers: {
    stage: st => { applyStage(st); return true; },
    say: renderSay,
    hub: renderHub,
    run: renderRun,
    jigsaw: renderJigsaw,
    word: renderWord,
    clue: renderClue,
    part: renderPart,
    song: renderSong,
    paint: renderPaint,
    final: renderFinal,
    deduce: renderDeduce,
    shrink: renderShrink,
    end: renderEnd
  }
});
const go = flow.go;
// Steps that change the scene, and how to apply them without showing them (for resuming, and for skipping ahead).
const REPLAY = {
  stage: st => applyStage(st),
  shrink: () => applyStage({ shadow: 0, nova: true, novaFace: "surprised", lantern: false })
};
// Moving on skips mini games already finished (after going back with L), still applying any scene changes on the way.
function goForwardFrom(i) {
  let j = i + 1;
  while (j < STEPS.length - 1 && (STEPS[j].t === "stage" || S.passed.includes(j))) { const r = REPLAY[STEPS[j].t]; if (r) r(STEPS[j]); j++; }
  go(j);
}
function next() { goForwardFrom(flow.step); }

// Rebuilds the scene for a saved game from every stage change so far.
function restore() {
  resetStage();
  flow.replay(S.step, REPLAY);
  paintHud();
}

// L and R (or the left and right arrow keys) move through the story. Back goes to the story line (or new-song card) before
// this one. Forward does what the screen says forward means (see onForward in screens.js), or moves on to the next step.
// Screens that need some of those keys turn them off (see navKeys). On the crash pad, R waits a moment first, because
// R is also the first letter of the secret word ROAR.
const BACK_TO = new Set(["say", "song"]);
let hubR = 0, hubTyped = "", lastNav = 0;
function navBack() {
  let j = flow.step - 1;
  while (j > 0 && !BACK_TO.has(STEPS[j].t)) j--;
  if (j < 1 || !BACK_TO.has(STEPS[j].t)) return;
  hideMemory(); S.step = j; restore(); go(j);
}
function navForward() {
  const f = NAV.forward; NAV.forward = null;
  if (f) f(); else next();
}
window.addEventListener("keydown", e => {
  if (!active || e.ctrlKey || e.metaKey || e.altKey) return;
  const tg = e.target;
  if (tg && tg.matches && tg.matches("input, textarea, select")) return;
  const st = STEPS[flow.step];
  if (!st || st.t === "end") return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key, onHub = st.t === "hub";
  if (onHub && k.length === 1) { clearTimeout(hubR); hubTyped = (hubTyped + k).slice(-4); }
  const letter = k === "l" ? -1 : k === "r" ? 1 : 0, arrow = k === "ArrowLeft" ? -1 : k === "ArrowRight" ? 1 : 0;
  const dir = letter && NAV.keys !== "arrows" ? letter : arrow && NAV.keys !== "letters" ? arrow : 0;
  if (!dir || e.repeat) return;
  if (onHub && dir > 0) { // let the R through to the crash pad's secret-word listener
    if (hubTyped !== "roar") { const at = flow.step; hubR = setTimeout(() => { if (active && flow.step === at) navForward(); }, 900); }
    return;
  }
  e.preventDefault(); e.stopPropagation();
  const now = performance.now(); if (now - lastNav < 200) return; lastNav = now;
  if (dir < 0) navBack(); else navForward();
}, true);

Kit.ui.enterAdvances(panel);
// Read-only peek for the automated play-test: where the crash pad camera is, which step is showing, the right mystery answer,
// which steps are finished, the run results, the run settings, where the music is, T-Rexy's looks, the typing totals, and the
// question dealer.
window.__mgs = { get step() { return S.step; }, get mode() { return mode; }, get answer() { return mysteryAnswer; }, get passed() { return S.passed.slice(); }, get runs() { return JSON.parse(JSON.stringify(S.stats.runs)); }, steps: STEPS.map(s => s.t), qbank: QBANK, deal: (id, n) => deal(id, n), typing: () => ({ ...S.stats.typing }), levels: RUN_LEVELS, modes: MODES, music: () => music.position(), looks: () => JSON.parse(JSON.stringify(LOOK)), run: () => runCtl ? runCtl.state : null, hub: () => hubCtl ? { ...hubCtl.view(), heroX: hubCtl.hero.x, portals: Object.fromEntries(Object.entries(PORTALS).map(([k, p]) => [k, p.x])) } : null };
warmImages();

try { window.claude?.hot?.snapshot?.(() => ({ S: JSON.parse(JSON.stringify(S)), active })); } catch (e) { /* not in a viewer */ }
function boot(data) {
  paintHud(); board.init();
  if (data && data.S && data.active && data.S.v === 3) { S = Object.assign(fresh(), data.S); active = true; scene.classList.remove("attract"); restore(); go(S.step); }
  else renderTitle();
}
try {
  if (window.claude?.hot?.ready) window.claude.hot.ready(boot);
  else boot(window.claude?.hot?.data ?? {});
} catch (e) { boot({}); }
