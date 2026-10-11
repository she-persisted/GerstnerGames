/**
 * @file games/starward/state.js
 * @about Starward's settings and save data: storage keys, places on Lumina, worlds and their songs, the cast, flight tuning, the adaptive skill levels, the puzzle plan for each playthrough, and the question chooser that matches the player's level.
 * @requires kit/util.js, kit/ui.js, kit/audio.js, kit/questions.js, kit/adaptive.js, assets/rocket/rocket.js, assets/icons/icons.js, content/words/typing-words.js
 */
const { $, shuffle, sample, pick, esc, cleanName, store } = Kit.util;
const { reduced, focusSoon, pips, blurActive } = Kit.ui;
const ICON = Kit.art.icons;
const R = Kit.art.rocket;
const { PARTS, PART_ORDER, PAINTS, PAINT_ORDER } = R;
const sfx = Kit.audio.sfx;

const KEYS = { save: "starward.save.v4", sound: "starward.sound", music: "starward.music", songs: "starward.songs", scores: "starward.scores", seen: "starward.seen", skill: "starward.skill" };
const panel = $("#panel"), scene = $("#scene"), robotEl = $("#robot"), arena = $("#arena");
const TOK = Kit.ui.tokens({
  starlight: "--starlight", void: "--void", metal: "--metal", metalShade: "--metal-shade", copper: "--copper", glass: "--glass",
  snow: "--snow", cRobot: "--c-robot", cPeng: "--c-peng", ember: "--ember", gold: "--ember-gold", good: "--good",
  wall: "--wall", roof: "--roof", win: "--win", leaf: "--leaf", trunk: "--trunk", worm: "--worm", dome: "--dome",
  scope: "--scope", stoneSh: "--stone-sh", dirt: "--dirt", dust: "--dust"
});
const MAPFONT = '"Baloo 2", "Trebuchet MS", system-ui, sans-serif';

// Flights: word list, how many words, and fall time in seconds (base + per * letters), before the typing level adjusts it.
const LEGS = {
  f1: { n: 10, base: 3.8, per: 1.15, words: Kit.words.short },
  f2: { n: 10, base: 3.4, per: 1.05, words: Kit.words.five },
  f3: { n: 10, base: 3.2, per: .95, words: Kit.words.long },
  f4: { n: 7, base: 3.4, per: .82, words: Kit.words.phrases },
  f5: { n: 8, base: 3.6, per: 1, words: Kit.words.home }
};
const VOW = "I am brave and I am not alone";
const PASS = .85;          // letter accuracy needed to land
const TOTAL_PUZZLES = 20;  // 4 places x 2 puzzles + 4 planets x 3 puzzles

// Places on Lumina. angle = position on the side-view planet; x, y = position on the walkable map; beacon = star height.
const SITES = [
  { id: "pad", name: "Launch Pad", angle: 0, x: 400, y: 282 },
  { id: "crater", name: "Comet Crater", angle: 72, part: "nose", x: 150, y: 150, beacon: 58 },
  { id: "observatory", name: "Old Observatory", angle: 144, part: "boost", x: 655, y: 160, beacon: 112 },
  { id: "grove", name: "Glowworm Grove", angle: 216, part: "fins", x: 150, y: 448, beacon: 108 },
  { id: "village", name: "Sleepy Village", angle: 288, part: "engine", x: 650, y: 452, beacon: 92 }
];
const PART_SITES = SITES.filter(s => s.part);

const WORLDS = { lumina: "Lumina", nimbus: "Planet Nimbus", glacia: "Planet Glacia", meridian: "Planet Meridian", corona: "The Corona Nebula", luminaLit: "Lumina, glowing again" };
const WORLD_SONG = { lumina: "lumina", nimbus: "nimbus", glacia: "glacia", meridian: "meridian", corona: "corona", luminaLit: "reborn" };
const JUKEBOX = ["theme", "nimbus", "glacia", "meridian", "corona", "reborn"];
const SONG_WHERE = { theme: "Yours from the start", nimbus: "Planet Nimbus", glacia: "Planet Glacia", meridian: "Planet Meridian", corona: "The Corona Nebula", reborn: "Bring back the Everlight" };

const CAST = {
  narrator: { label: () => "Story", color: "var(--dust)" },
  robot: { label: () => S.robot, color: "var(--c-robot)" },
  dog: { label: () => "Sunny", color: "var(--c-dog)" },
  peng: { label: () => "Rigel", color: "var(--c-peng)" },
  rock: { label: () => "Professor Kepler", color: "var(--c-rock)" },
  flame: { label: () => "The Everlight", color: "var(--c-flame)" }
};

// Adaptive skills: typing speed (1 slow to 10 fast), math (1 to 5, about 2nd to 4th grade), word puzzles (1 easy to 3 hard).
const SKILLS = { typing: { min: 1, max: 10, start: 5 }, math: { min: 1, max: 5, start: 3 }, words: { min: 1, max: 3, start: 2 } };
const SKILL_NAME = { typing: "Typing", math: "Math", words: "Puzzle" };
const skills = Kit.adaptive.create({
  key: KEYS.skill, skills: SKILLS,
  onChange: (name, level, delta) => { if (delta > 0) { sfx.levelup(); toast(`${SKILL_NAME[name]} level up!`); } }
});
// Fall-time multiplier: typing level 1 = 1.4x slower, level 6 = normal, level 10 = 0.68x (faster).
const typingSlow = () => 1.4 - .08 * (skills.level("typing") - 1);

// Where each question kind comes from and which skill sets its level.
const SOURCES = {
  riddle: ["bank", "riddles", "words"], blank: ["bank", "blanks", "words"], earth: ["bank", "earth", "words"], space: ["bank", "space", "words"],
  scramble: ["scramble", "scramble", "words"], odd: ["gen", "odd", "words"], order: ["gen", "order", "words"],
  word: ["gen", "word", "math"], missing: ["gen", "missing", "math"], place: ["gen", "place", "math"], round: ["gen", "round", "math"], pattern: ["gen", "pattern", "math"]
};
const SCRAMBLE_LENGTHS = { 1: [4, 4, 5], 2: [4, 5, 6], 3: [5, 6, 7] };

// The plan picks question KINDS when a game starts, for variety. The question itself is chosen when it appears, so it fits the level at that moment.
function makePlan() {
  const textKinds = shuffle(["riddle", "blank", "odd", pick(["riddle", "blank"])]);
  const mathKinds = shuffle(["word", "word", "missing", "place", "round", "pattern"]).slice(0, 4);
  const sites = {};
  PART_SITES.forEach((s, i) => { sites[s.id] = [textKinds[i], mathKinds[i]]; });
  return {
    sites,
    nimbus: shuffle(["riddle", "blank", "odd", "word"]).slice(0, 3),
    glacia: ["scramble", "scramble", "scramble"],
    meridian: shuffle(["earth", "earth", pick(["pattern", "order"])]),
    corona: shuffle(["space", "space", Math.random() < .5 ? "blank" : "order"]),
    digs: Object.fromEntries(PART_SITES.map(s => [s.id, sample(Kit.words.dig, 3)]))
  };
}

const fresh = () => ({
  v: 4, robot: "", step: 0, world: "lumina", site: "pad", courage: 8, crew: [], seen: [], floors: 0,
  plan: null, asked: {}, found: {}, paint: "", siteProg: {}, mapPos: null, mapMoved: false,
  stats: { solved: 0, shown: 0, hints: 0, pts: 0, legs: {} }
});
let S = fresh();
let active = false;
let picker = null;

function newPicker() {
  picker = Kit.questions.createPicker({ seenKey: KEYS.seen });
  Object.values(S.asked || {}).forEach(p => picker.reserve(p));
}
// Returns the question for a slot, choosing it now (at the current level) if it hasn't been asked yet.
function ask(slot, kind, n = 0) {
  if (S.asked[slot]) return S.asked[slot];
  const [src, name, skill] = SOURCES[kind] || SOURCES.word;
  const L = skills.level(skill);
  let p = null;
  if (src === "bank") p = picker.bank(name, L);
  else if (src === "gen") p = picker.gen(name, L);
  else { const len = (SCRAMBLE_LENGTHS[L] || SCRAMBLE_LENGTHS[2])[n] || 5; p = picker.bank("scramble", L, x => x.len === len) || picker.bank("scramble", L); }
  if (!p) p = picker.gen("word", skills.level("math"));
  p = { ...p, skill };
  S.asked[slot] = p; save();
  return p;
}

function save() { if (active) store.set(KEYS.save, S); }
function loadSave() {
  const d = store.get(KEYS.save, null);
  if (d && d.v === 4 && d.robot && d.step > 0 && d.step < STEPS.length - 1 && d.plan && d.plan.sites) return d;
  return null;
}
const T = x => typeof x === "function" ? x({ robot: esc(S.robot) }) : x;
const shipCfg = () => ({ nose: S.found.nose, fins: S.found.fins, boost: S.found.boost, engine: S.found.engine, paint: S.paint });
const allFound = () => PART_ORDER.every(p => S.found[p]);
const nextBtn = (label = "Next", icon = ICON.go, cls = "") => Kit.ui.nextBtn(label, icon, cls);
const bindPrimary = fn => Kit.ui.bindPrimary(panel, fn);
