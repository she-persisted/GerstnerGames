/**
 * @file games/mini-game-survival/state.js
 * @about Mini Game Survival's settings and save data: storage keys, Easy and Hard mode, the portals and what each one gives, the clue cards, the mystery questions (from the question library), the secret diary pages, the cast, the adaptive skill levels (runs, jigsaws, words, typing), the run levels and how they ramp up portal by portal, the clue-word chooser, the Wave Rider bonus level's length, hill level, and best score, T-Rexy's unlockable looks (hats, back items, colors, and whole outfits; one for each mini game finished, kept on this computer across games, with a count of how many this game can still unlock), the deck dealer that picks versions from the question library (kept on this computer, so no version repeats until every one has come up), a seeded random maker (so a second try at a run is the same run), and which mini games are finished (so moving forward skips them). Saves keep progress only, never how many tries anything took.
 * @requires kit/util.js, kit/ui.js, kit/audio.js, kit/adaptive.js, assets/ship/glitch-ship.js, assets/icons/icons.js, content/words/clue-words.js, games/mini-game-survival/questions.js
 */
const { $, shuffle, pick, esc, clamp, store } = Kit.util;
const { reduced, focusSoon, blurActive } = Kit.ui;
const ICON = Kit.art.icons;
const SHIP = Kit.art.ship;
const sfx = Kit.audio.sfx;

const KEYS = { save: "mgs.save.v3", sound: "mgs.sound", music: "mgs.music", songs: "mgs.songs", scores: "mgs.scores", seen: "mgs.seen", mode: "mgs.mode", skill: "mgs.skill.", decks: "mgs.decks", looks: "mgs.looks", bonus: "mgs.bonus" };
const panel = $("#panel"), scene = $("#scene"), stageEl = $("#stage"), cv = $("#cv");

// The crash pad: portals in the order T-Rexy visits them. x = where it stands on the pad (in tiles).
// The ship wreck sits at WRECK_X; T-Rexy starts beside it (HERO_START), not in front of it.
const HUB_W = 36, WRECK_X = 17.5, HERO_START = WRECK_X + 2.6;
const PORTALS = {
  echo:    { name: "Echo Rings", theme: "echo", song: "echo", part: "thrusters", memory: "home", words: "sound", x: 5, color: "#21d9ff", icon: "note" },
  fern:    { name: "Fern Moon", theme: "fern", song: "fern", part: "wings", memory: "dinner", words: "food", x: 11, color: "#8cff3b", icon: "fern" },
  lantern: { name: "Lantern Lab", theme: "lantern", song: "lantern", part: "core", memory: "window", words: "light", x: 24, color: "#ffd43b", icon: "lamp" },
  whirl:   { name: "Whirlpool Galaxy", theme: "whirl", song: "whirl", part: "cockpit", memory: "swoop", words: "space", x: 30, color: "#ff6be0", icon: "spiral" },
  gate:    { name: "The Shadow Gate", theme: "shadow", song: "shadowRun", x: 34, color: "#ff2e7a", icon: "gate" }
};
const PORTAL_ORDER = ["echo", "fern", "lantern", "whirl"];

// What T-Rexy writes in his notebook after each portal. What the clue card says he saw, the line he types, the science
// fact, and a bonus fact come from the question library (questions.js), so they change from game to game.
// short = what the notebook shows.
const CLUES = {
  echo: { n: 1, title: "Clue 1: The weird music", short: "The weird music was high and squeaky." },
  fern: { n: 2, title: "Clue 2: The missing fish", short: "Somebody sneaked in and ate all our fish." },
  lantern: { n: 3, title: "Clue 3: Tiny footprints", short: "Tiny footprints, and a tiny moth with a huge shadow." },
  whirl: { n: 4, title: "Clue 4: The star lantern", short: "Someone small was holding a star lantern." }
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
// Checkpoints are always on in both modes. allPieces: in Hard, a portal run must catch every memory piece before the story
// moves on (the Shadow Gate's star shards are a bonus in both modes). Hard runs score double.
const MODES = {
  easy: { label: "Easy", ramp: [1, 2, 2, 3, 3], secs: [14, 16, 18, 20, 24], allPieces: false, runMult: 1, starts: { jigsaw: 1, words: 1, typing: 1 },
    about: "Slower runs and smaller puzzles." },
  hard: { label: "Hard", ramp: [2, 3, 4, 5, 6], secs: [18, 20, 22, 24, 30], allPieces: true, runMult: 2, starts: { jigsaw: 2, words: 2, typing: 2 },
    about: "Faster runs, and you need every memory piece to move on. Runs score double." }
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
// The Wave Rider bonus level (from the title screen, outside the story): a 60-second ride. Its hills get taller as a player's
// landings get smoother (waves 1 to 3, kept on this computer), and the best score is kept on this computer too.
const BONUS_SECS = 60;
const bonusSkill = Kit.adaptive.create({ key: KEYS.skill + "bonus", skills: { waves: { min: 1, max: 3, start: 1 } } });
const bonusBest = () => { const b = store.get(KEYS.bonus, null); return b && Number.isFinite(b.best) ? b : { best: 0, stars: 0 }; };
const FUEL = { 1: 7, 2: 6, 3: 6 };

const JUKEBOX = ["glitchHub", "echo", "fern", "lantern", "whirl", "shadowRun", "lullaby", "homeStomp", "waveRider"];
const SONG_WHERE = { glitchHub: "Yours from the start", echo: "Echo Rings", fern: "Fern Moon", lantern: "Lantern Lab", whirl: "Whirlpool Galaxy", shadowRun: "The Shadow Gate", lullaby: "Solve the mystery", homeStomp: "Get home", waveRider: "The bonus level" };

const fresh = () => ({
  v: 3, mode: savedMode(), step: 0, picks: {}, seed: Math.floor(Math.random() * 1e9), passed: [], parts: {}, paint: "", done: [], clues: [], pages: [], words: {}, looks: [], hubX: HERO_START, moved: false, pokes: 0, roared: false,
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
// Deals version numbers for one list in the question library like a shuffled deck of cards: every version comes up once
// before any of them repeats, and a new deck never starts with the one just dealt. Decks are kept on this computer, so
// each new game keeps dealing where the last one stopped. (If a list gets more versions, its deck is reshuffled.)
function deal(id, n) {
  let decks = store.get(KEYS.decks, {}); if (!decks || typeof decks !== "object" || Array.isArray(decks)) decks = {};
  const old = decks[id], last = old && Number.isInteger(old.last) ? old.last : -1;
  const d = old && old.n === n && Array.isArray(old.left) ? old : { n, left: [], last };
  d.left = d.left.filter(i => Number.isInteger(i) && i >= 0 && i < n);
  if (!d.left.length) {
    d.left = shuffle([...Array(n).keys()]);
    if (n > 1 && d.left[0] === last) d.left.push(d.left.shift());
  }
  const i = d.left.shift(); d.last = i; decks[id] = d; store.set(KEYS.decks, decks);
  return i;
}
// Picks one version from a list in the question library (dealt from its deck), and keeps that pick for the rest of
// this game, so a reload shows the same one.
function pickVersion(id, list) {
  S.picks = S.picks || {};
  if (S.picks[id] != null && list[S.picks[id]] !== undefined) return list[S.picks[id]];
  const i = deal(id, list.length);
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
const PERFECT_PTS = 10; // for each hop right on the beat over something dangerous (doubled in Hard mode, like all run points)

// T-Rexy's looks: every mini game finished (each portal's run, jigsaw, and clue word, the first time in a game) unlocks the next
// one in this order and puts it on. That's 13 a game (the Shadow Gate run unlocks one too), so a new player finds 13 of the 15
// looks in the first game and the last 2 in the next one. Skipping a mini game with R unlocks nothing. Looks stay unlocked on
// this computer for every game after. The closet on the crash pad changes what he wears, and only shows the empty slots that
// can still be filled this game. slot = head (hats), back (rocket backpack, cape), skin (his color), or outfit (a whole
// costume: the Mad Scientist, the Surfer Dino, the Punk Rock Biker). Drawings and names are in assets/characters/trexy.js.
const LOOK_SLOTS = ["head", "back", "skin", "outfit"];
const LOOK_ORDER = [["head", "helmet"], ["skin", "galaxy"], ["back", "rocket"], ["outfit", "scientist"], ["head", "wizard"], ["skin", "gold"],
  ["outfit", "surfer"], ["head", "headphones"], ["back", "cape"], ["skin", "ocean"], ["outfit", "punk"], ["head", "crown"], ["head", "party"],
  ["skin", "bubblegum"], ["head", "shades"]];
const lookName = (slot, id) => Kit.art.trexy.LOOKS[slot][id] || id;
function loadLooks() {
  const d = store.get(KEYS.looks, null), ok = id => LOOK_ORDER.some(([, x]) => x === id);
  const L = { have: [], head: "", back: "", skin: "", outfit: "" };
  if (d && Array.isArray(d.have)) L.have = d.have.filter(ok);
  for (const slot of LOOK_SLOTS) if (d && L.have.includes(d[slot])) L[slot] = d[slot];
  return L;
}
let LOOK = loadLooks();
const saveLooks = () => store.set(KEYS.looks, LOOK);
// Unlocks and puts on the next look. Returns { slot, id, name }, or null once every look is unlocked. A new outfit comes off
// the hanger whole: his hat and back item come off, so its own head piece and surfboard show (he can put them back on).
function unlockLook() {
  const next = LOOK_ORDER.find(([, id]) => !LOOK.have.includes(id));
  if (!next) return null;
  const [slot, id] = next;
  LOOK.have.push(id); LOOK[slot] = id;
  if (slot === "outfit") { LOOK.head = ""; LOOK.back = ""; }
  saveLooks();
  return { slot, id, name: lookName(slot, id) };
}
// The mini games that unlock a look, as [story step, name] pairs: "run.echo", "jigsaw.echo", "word.echo", ..., "run.gate".
const lookSteps = () => STEPS.map((st, i) => [i, st.t === "final" ? "run.gate" : ["run", "jigsaw", "word"].includes(st.t) ? `${st.t}.${st.p}` : ""]).filter(([, ev]) => ev);
// A finished mini game unlocks the next look, once per game. Returns { slot, id, name }, or null.
function earnLook(ev) {
  S.looks = S.looks || [];
  if (S.looks.includes(ev)) return null;
  S.looks.push(ev); save();
  return unlockLook();
}
// How many more looks this game can still unlock: one for each mini game not finished or skipped yet, up to the looks still locked.
function looksReachable() {
  const got = S.looks || [], left = lookSteps().filter(([i, ev]) => !got.includes(ev) && !S.passed.includes(i)).length;
  return Math.min(LOOK_ORDER.length - LOOK.have.length, left);
}
// Puts a look on, or takes it off if he's already wearing it.
function toggleLook(slot, id) { LOOK[slot] = LOOK[slot] === id ? "" : id; saveLooks(); }
// What T-Rexy is wearing, as drawing options. A story accessory (like his cap at the start) wins over a hat.
const lookOpts = (acc = "none") => ({ acc: acc && acc !== "none" ? acc : (LOOK.head || "none"), back: LOOK.back || "", skin: LOOK.skin || "", outfit: LOOK.outfit || "" });
const shipCfg = () => ({ ...S.parts, paint: S.paint });
const allParts = () => SHIP.PART_ORDER.every(p => S.parts[p]);
const nextPortal = () => PORTAL_ORDER.find(id => !S.done.includes(id)) || "gate";
const nextBtn = (label = "Next", icon = ICON.go, cls = "") => Kit.ui.nextBtn(label, icon, cls);
const bindPrimary = fn => Kit.ui.bindPrimary(panel, fn);
