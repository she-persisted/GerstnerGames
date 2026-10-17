/**
 * @file games/mini-game-survival/state.js
 * @about Mini Game Survival's settings and save data: storage keys, Easy and Hard mode, the portals and what each one gives, the clue cards, the mystery questions (from the question library), the secret diary pages, the cast, the adaptive skill levels (runs, jigsaws, words, typing), the run levels and how they ramp up portal by portal, the clue-word chooser, the version picker for the question library, a seeded random maker (so a second try at a run is the same run), and which mini games are finished (so moving forward skips them). Saves keep progress only, never how many tries anything took.
 * @requires kit/util.js, kit/ui.js, kit/audio.js, kit/adaptive.js, assets/ship/glitch-ship.js, assets/icons/icons.js, content/words/clue-words.js, games/mini-game-survival/questions.js
 */
const { $, shuffle, pick, esc, clamp, store } = Kit.util;
const { reduced, focusSoon, blurActive } = Kit.ui;
const ICON = Kit.art.icons;
const SHIP = Kit.art.ship;
const sfx = Kit.audio.sfx;

const KEYS = { save: "mgs.save.v3", sound: "mgs.sound", music: "mgs.music", songs: "mgs.songs", scores: "mgs.scores", seen: "mgs.seen", mode: "mgs.mode", skill: "mgs.skill.", seenq: "mgs.seenq" };
const panel = $("#panel"), scene = $("#scene"), stageEl = $("#stage"), cv = $("#cv");

// The crash pad: portals in the order T-Rexy visits them. x = where it stands on the pad (in tiles).
const HUB_W = 36, WRECK_X = 17.5;
const PORTALS = {
  echo:    { name: "Echo Rings", theme: "echo", song: "echo", part: "thrusters", memory: "home", words: "sound", x: 5, color: "#21d9ff", icon: "note" },
  fern:    { name: "Fern Moon", theme: "fern", song: "fern", part: "wings", memory: "dinner", words: "food", x: 11, color: "#8cff3b", icon: "fern" },
  lantern: { name: "Lantern Lab", theme: "lantern", song: "lantern", part: "core", memory: "window", words: "light", x: 24, color: "#ffd43b", icon: "lamp" },
  whirl:   { name: "Whirlpool Galaxy", theme: "whirl", song: "whirl", part: "cockpit", memory: "swoop", words: "space", x: 30, color: "#ff6be0", icon: "spiral" },
  gate:    { name: "The Shadow Gate", theme: "shadow", song: "shadowRun", x: 34, color: "#ff2e7a", icon: "gate" }
};
const PORTAL_ORDER = ["echo", "fern", "lantern", "whirl"];

// What T-Rexy writes in his notebook after each portal. The line he types, the clue card's science fact, and a bonus fact
// come from the question library (questions.js), so they change from game to game. short = what the notebook shows.
const CLUES = {
  echo: { n: 1, title: "Clue 1: The weird music", saw: "In my memory, the weird music was high and squeaky, like a teeny music box glowing on the hill.", short: "The weird music was high and squeaky." },
  fern: { n: 2, title: "Clue 2: The missing fish", saw: "The morning after that dinner, our whole basket of fish was gone. Somebody sneaked in and ate them!", short: "Somebody sneaked in and ate all our fish." },
  lantern: { n: 3, title: "Clue 3: Tiny footprints", saw: "Teeny-tiny footprints on my windowsill. And a teeny moth by my lamp made a HUGE shadow on the wall.", short: "Tiny footprints, and a tiny moth with a huge shadow." },
  whirl: { n: 4, title: "Clue 4: The star lantern", saw: "In the swirl, someone small was standing on a floating rock, holding a glowing star lantern.", short: "Someone small was holding a star lantern." }
};

// The four mystery questions, asked in order before the big reveal. Each has several versions in the question library.
const DEDUCE = QBANK.mystery;

// Secret diary pages, one hidden high up in each portal run (a glitchy ? box above a thin ledge with a bounce pad).
const PAGES = [
  "Operation MINI GAME SURVIVAL. Step 1: play my squeaky music box really loud. T-Rexes love music. (Do they? I hope so.)",
  "Step 2: swoop up ONE T-Rex. A small one. Well, smaller than a big one. Also: borrow a few fish. For energy.",
  "Step 3: stand REALLY close to my star lantern so my shadow looks gigantic. If he ROARS, do not flinch. (I will probably flinch.)",
  "Step 4: make him play mini games until he's too tired to eat me. Then be the boss of ALL the T-Rexes, so nobody can ever eat me. Step 5: maybe make a friend???"
];

// Things Shadowspine says when you poke him on the crash pad.
const POKES = ["Hey! Stop poking!", "That TICKLES! I mean... TREMBLE BEFORE ME!", "Quit it! I'm VERY scary!", "Poke me again and I'll go super-NOVA! I mean... super SCARY!",
  "Poke me again and I'll... um... be really big at you!", "You've got some nerve, Tiny Arms. Jurassic nerve!", "Okay, that one was kind of nice."];

const CAST = {
  narrator: { label: "Story", color: "var(--dust)" },
  trexy: { label: "T-Rexy", color: "var(--c-hero)" },
  shadow: { label: "Shadowspine", color: "var(--c-shadow)" },
  nova: { label: "Nova", color: "var(--c-nova)" },
  family: { label: "T-Rexy's family", color: "var(--c-family)" },
  ship: { label: "Zoomasaurus", color: "var(--c-ship)" }
};

// Easy or Hard, picked on the title screen (and switchable on the crash pad). ramp = the run level for each portal in order,
// ending with the Shadow Gate, so runs get harder as the game goes on. secs = about how long each run lasts.
// Easy turns checkpoints on from the start. Hard sends T-Rexy back to the portal entrance, and its runs score double.
const MODES = {
  easy: { label: "Easy", ramp: [1, 2, 2, 3, 3], secs: [14, 16, 18, 20, 24], checkpoints: true, runMult: 1, starts: { jigsaw: 1, words: 1, typing: 1 },
    about: "Slower runs, checkpoints on, smaller puzzles." },
  hard: { label: "Hard", ramp: [2, 3, 4, 5, 6], secs: [18, 20, 22, 24, 30], checkpoints: false, runMult: 2, starts: { jigsaw: 2, words: 2, typing: 2 },
    about: "Faster runs, back to the start when you crash. Runs score double." }
};
// Run levels 1 to 6: speed (tiles a second), space (extra flat tiles before each obstacle), ships (ship tunnels per run).
const RUN_LEVELS = [null,
  { speed: 5.0, space: 4, ships: 0 }, { speed: 5.6, space: 3, ships: 1 }, { speed: 6.2, space: 2, ships: 1 },
  { speed: 6.9, space: 1, ships: 1 }, { speed: 7.6, space: 1, ships: 1 }, { speed: 8.3, space: 0, ships: 1 }];

// Adaptive skills, kept separately for each mode so friends sharing a computer don't change each other's levels.
// run: 1 = one level easier than the ramp, 2 = the ramp, 3 = one level harder. jigsaw: 3x3, 3x4, or 4x4 pieces.
// words: word length and fuel. typing: how long the clue line is.
const SKILLS = { run: { min: 1, max: 3 }, jigsaw: { min: 1, max: 3 }, words: { min: 1, max: 3 }, typing: { min: 1, max: 3 } };
const SKILL_NAME = { run: "Run", jigsaw: "Jigsaw", words: "Word", typing: "Typing" };
const SKILL_SETS = {};
function skillsFor(mode) {
  if (!SKILL_SETS[mode]) {
    const st = MODES[mode].starts, def = {};
    for (const [k, v] of Object.entries(SKILLS)) def[k] = { ...v, start: k === "run" ? 2 : st[k] };
    SKILL_SETS[mode] = Kit.adaptive.create({
      key: KEYS.skill + mode, skills: def,
      onChange: (name, level, delta) => { if (delta > 0) { sfx.levelup(); toast(name === "run" ? "Runs speed up a little!" : `${SKILL_NAME[name]} level up!`); } }
    });
  }
  return SKILL_SETS[mode];
}
const savedMode = () => (store.get(KEYS.mode, "easy") === "hard" ? "hard" : "easy");
let skills = skillsFor(savedMode());
function setMode(m) { m = m === "hard" ? "hard" : "easy"; S.mode = m; skills = skillsFor(m); store.set(KEYS.mode, m); }
const modeOf = () => MODES[S.mode] || MODES.easy;
// The run level for the nth run (0 to 3 = the portals, 4 = the Shadow Gate).
const runLevel = n => clamp(modeOf().ramp[n] + skills.level("run") - 2, 1, 6);
const JIG_GRID = { 1: [3, 3], 2: [3, 4], 3: [4, 4] };   // rows, columns
const FUEL = { 1: 7, 2: 6, 3: 6 };

const JUKEBOX = ["glitchHub", "echo", "fern", "lantern", "whirl", "shadowRun", "lullaby", "homeStomp"];
const SONG_WHERE = { glitchHub: "Yours from the start", echo: "Echo Rings", fern: "Fern Moon", lantern: "Lantern Lab", whirl: "Whirlpool Galaxy", shadowRun: "The Shadow Gate", lullaby: "Solve the mystery", homeStomp: "Get home" };

const fresh = () => ({
  v: 3, mode: savedMode(), step: 0, picks: {}, seed: Math.floor(Math.random() * 1e9), passed: [], parts: {}, paint: "", done: [], clues: [], pages: [], words: {}, hubX: WRECK_X, moved: false, pokes: 0, roared: false,
  stats: { pts: 0, runs: {}, typing: { hits: 0, misses: 0, ms: 0, chars: 0 } }
});
let S = fresh();
let active = false;

function save() { if (active) store.set(KEYS.save, S); }
function loadSave() {
  const d = store.get(KEYS.save, null);
  if (d && d.v === 3 && d.step > 0 && d.step < STEPS.length - 1) return d;
  return null;
}

// Picks the clue word for a portal at the current word level, preferring words this computer hasn't seen lately.
function wordFor(portal) {
  if (S.words[portal]) return S.words[portal];
  const bank = Kit.words.clues[PORTALS[portal].words], L = skills.level("words");
  let seen = store.get(KEYS.seen, []); if (!Array.isArray(seen)) seen = [];
  const pool = bank.filter(w => w[1] === L);
  const unseen = pool.filter(w => !seen.includes(w[0]));
  const w = pick(unseen.length ? unseen : pool.length ? pool : bank);
  seen = [...seen.filter(x => x !== w[0]), w[0]].slice(-40); store.set(KEYS.seen, seen);
  S.words[portal] = { word: w[0], d: w[1], hint: w[2] };
  save();
  return S.words[portal];
}
// Picks one version from a list in the question library, preferring versions this computer hasn't seen lately,
// and keeps that pick for the rest of this game (so a reload shows the same one).
function pickVersion(id, list) {
  S.picks = S.picks || {};
  if (S.picks[id] != null && list[S.picks[id]] !== undefined) return list[S.picks[id]];
  let seen = store.get(KEYS.seenq, []); if (!Array.isArray(seen)) seen = [];
  const all = list.map((x, i) => i), fresh = all.filter(i => !seen.includes(`${id}:${i}`));
  const i = pick(fresh.length ? fresh : all);
  seen = [...seen.filter(x => x !== `${id}:${i}`), `${id}:${i}`].slice(-160); store.set(KEYS.seenq, seen);
  S.picks[id] = i; save();
  return list[i];
}
// A repeatable random number maker: the same game and run always build the same level, so a second try is the same run.
function seededRng(text) {
  let h = 2166136261;
  for (const ch of `${S.seed}|${text}`) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// Story steps already finished (mini games), so moving forward through the story skips them instead of replaying them.
function markPassed(i = S.step) { if (!S.passed.includes(i)) { S.passed.push(i); save(); } }
const FULL_BONUS = 200; // for catching every memory piece (or star shard) in a run
const shipCfg = () => ({ ...S.parts, paint: S.paint });
const allParts = () => SHIP.PART_ORDER.every(p => S.parts[p]);
const nextPortal = () => PORTAL_ORDER.find(id => !S.done.includes(id)) || "gate";
const nextBtn = (label = "Next", icon = ICON.go, cls = "") => Kit.ui.nextBtn(label, icon, cls);
const bindPrimary = fn => Kit.ui.bindPrimary(panel, fn);
