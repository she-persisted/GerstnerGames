/**
 * @file games/mini-game-survival/boot.js
 * @about Starts Mini Game Survival: connects each story step type to its screen, resumes saved games (rebuilding the scene from the story so far), turns on Enter-to-continue, and keeps the game going through live page updates.
 * @requires kit/flow.js, games/mini-game-survival/story.js, games/mini-game-survival/screens.js
 */
const flow = Kit.flow.create({
  steps: STEPS,
  beforeStep(i) {
    $("#countdown").innerHTML = ""; heroTap = null;
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
const go = flow.go, next = flow.next;

// Rebuilds the scene for a saved game from every stage change so far.
function restore() {
  resetStage();
  flow.replay(S.step, {
    stage: st => applyStage(st),
    shrink: () => applyStage({ shadow: 0, nova: true, novaFace: "surprised", lantern: false })
  });
  paintHud();
}

Kit.ui.enterAdvances(panel);
// Read-only peek for the automated play-test: where the crash pad camera is, and which step is showing.
window.__mgs = { get step() { return S.step; }, get mode() { return mode; }, run: () => runCtl ? runCtl.state : null, hub: () => hubCtl ? { ...hubCtl.view(), heroX: hubCtl.hero.x, portals: Object.fromEntries(Object.entries(PORTALS).map(([k, p]) => [k, p.x])) } : null };
warmImages();

try { window.claude?.hot?.snapshot?.(() => ({ S: JSON.parse(JSON.stringify(S)), active })); } catch (e) { /* not in a viewer */ }
function boot(data) {
  paintHud(); board.init();
  if (data && data.S && data.active && data.S.v === 1) { S = Object.assign(fresh(), data.S); active = true; scene.classList.remove("attract"); restore(); go(S.step); }
  else renderTitle();
}
try {
  if (window.claude?.hot?.ready) window.claude.hot.ready(boot);
  else boot(window.claude?.hot?.data ?? {});
} catch (e) { boot({}); }
