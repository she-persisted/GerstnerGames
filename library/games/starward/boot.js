/**
 * @file games/starward/boot.js
 * @about Starts Starward: connects each story step type to its screen, resumes saved games, turns on Enter-to-continue, and keeps the game going through live page updates.
 * @requires kit/flow.js, games/starward/story.js, games/starward/screens.js
 */
const flow = Kit.flow.create({
  steps: STEPS,
  beforeStep(i) { $("#countdown").innerHTML = ""; map.busy = true; S.step = i; save(); },
  handlers: {
    world: st => { setWorld(st.w); return true; },
    appear: st => { appear(st.who); return true; },
    join: st => { join(st.who); return true; },
    flame: () => { lightFlame(false); return true; },
    say: renderSay,
    explore: renderExplore,
    build: renderBuild,
    song: renderSong,
    fly: renderFly,
    puzzle: st => runPuzzle(ask(`${st.set}-${st.n}`, S.plan[st.set][st.n], st.n), { head: planetHead(st), set: st.set, n: st.n }, next),
    end: renderEnd
  }
});
const go = flow.go, next = flow.next;

// Rebuilds the scene for a saved game: worlds visited, friends met, the Everlight if it was taken.
function restore() {
  resetScene();
  flow.replay(S.step, {
    world: st => setWorld(st.w, true),
    appear: st => appear(st.who),
    join: st => join(st.who, true),
    flame: () => lightFlame(true)
  });
  scene.dataset.floors = String(S.floors || 0);
  paintCourage(); paintCrew(); paintRockets();
}

Kit.ui.enterAdvances(panel);

try { window.claude?.hot?.snapshot?.(() => ({ S: JSON.parse(JSON.stringify(S)), active })); } catch (e) { /* not in a viewer */ }
function boot(data) {
  paintCourage(); paintCrew(); resetScene(); board.init();
  if (data && data.S && data.active && data.S.v === 4) { S = Object.assign(fresh(), data.S); newPicker(); active = true; scene.classList.remove("attract"); restore(); go(S.step); }
  else renderTitle();
}
try {
  if (window.claude?.hot?.ready) window.claude.hot.ready(boot);
  else boot(window.claude?.hot?.data ?? {});
} catch (e) { boot({}); }
