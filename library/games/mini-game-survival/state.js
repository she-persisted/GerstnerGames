/**
 * @file games/mini-game-survival/state.js
 * @about Mini Game Survival's settings and save data: storage keys, the portals and what each one gives, the clue cards, the mystery questions, the secret diary pages, the cast, the adaptive skill levels (runs, jigsaws, words, typing), run speeds, and the clue-word chooser.
 * @requires kit/util.js, kit/ui.js, kit/audio.js, kit/adaptive.js, assets/ship/glitch-ship.js, assets/icons/icons.js, content/words/clue-words.js
 */
const { $, shuffle, pick, esc, clamp, store } = Kit.util;
const { reduced, focusSoon, blurActive } = Kit.ui;
const ICON = Kit.art.icons;
const SHIP = Kit.art.ship;
const sfx = Kit.audio.sfx;

const KEYS = { save: "mgs.save.v1", sound: "mgs.sound", music: "mgs.music", songs: "mgs.songs", scores: "mgs.scores", seen: "mgs.seen", skill: "mgs.skill" };
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

// What T-Rexy writes in his notebook after each portal. type = the line he types, short to long by typing level.
const CLUES = {
  echo: { n: 1, title: "Clue 1: The weird music", saw: "In my memory, the weird music was high and squeaky, like a teeny music box glowing on the hill.",
    fact: "Science fact: small things make high sounds. Big things make low, booming sounds.",
    type: ["high and squeaky", "The music was high and squeaky.", "The weird music was high and squeaky, like a tiny music box."], short: "The weird music was high and squeaky." },
  fern: { n: 2, title: "Clue 2: The missing fish", saw: "The morning after that dinner, our whole basket of fish was gone. Somebody sneaked in and ate them!",
    fact: "Science fact: real T-Rexes ate meat. My family eats plants AND meat, so we're omnivores. And Spinosaurus? It mostly ate fish!",
    type: ["the fish were gone", "Somebody ate all of our fish.", "Somebody sneaked into our house and ate all of our fish."], short: "Somebody sneaked in and ate all our fish." },
  lantern: { n: 3, title: "Clue 3: Tiny footprints", saw: "Teeny-tiny footprints on my windowsill. And a teeny moth by my lamp made a HUGE shadow on the wall.",
    fact: "Science fact: the closer something is to a light, the bigger its shadow gets.",
    type: ["tiny footprints", "Tiny footprints were on my window.", "Tiny footprints were on my windowsill, right by the lamp."], short: "Tiny footprints, and a tiny moth with a huge shadow." },
  whirl: { n: 4, title: "Clue 4: The star lantern", saw: "In the swirl, someone small was standing on a floating rock, holding a glowing star lantern.",
    fact: "Science fact: a spiral galaxy is a giant pinwheel of billions of stars. Our home galaxy, the Milky Way, is one!",
    type: ["a star lantern", "Someone small had a star lantern.", "Someone very small was holding a glowing star lantern."], short: "Someone small was holding a star lantern." }
};

// The four mystery questions, asked in order before the big reveal. a = the right option.
const DEDUCE = [
  { q: "Why is Shadowspine completely black, with no eyeballs at all?", opts: ["He's wearing black pajamas.", "He's a shadow!", "He rolled in a tar pit."], a: 1, clue: "lantern", nope: "Hmm. What is always a dark shape with no eyes? Check clue 3." },
  { q: "How can a shadow look GIGANTIC?", opts: ["Something stands really close to a bright light.", "It eats a LOT of snacks.", "It stands really far away from the light."], a: 0, clue: "lantern", nope: "Remember the teeny moth by the lamp? Check clue 3." },
  { q: "The weird music was high and squeaky. So who played it?", opts: ["Someone gigantic.", "Someone small.", "A whale."], a: 1, clue: "echo", nope: "Do small things make high sounds or low sounds? Check clue 1." },
  { q: "Fish thief. Sail-shaped shadow. Tiny footprints. A star lantern. Who is behind all of this?", opts: ["A giant Spinosaurus.", "A tiny Spinosaurus with a star lantern.", "Grandma T-Rex."], a: 1, clue: "whirl", nope: "Which dinosaur loved fish, and how big was the one with the lantern? Check clues 2 and 4." }
];

// Secret diary pages, one hidden high up in each portal run (a glitchy ? box above a thin ledge with a bounce pad).
const PAGES = [
  "Operation MINI GAME SURVIVAL. Step 1: play my squeaky music box really loud. T-Rexes love music. (Do they? I hope so.)",
  "Step 2: swoop up ONE T-Rex. A small one. Well, smaller than a big one. Also: borrow a few fish. For energy.",
  "Step 3: stand REALLY close to my star lantern so my shadow looks gigantic. If he ROARS, do not flinch. (I will probably flinch.)",
  "Step 4: make him play mini games until he's too tired to eat me. Then be the boss of ALL the T-Rexes, so nobody can ever eat me. Step 5: maybe make a friend???"
];

// Things Shadowspine says when you poke him on the crash pad.
const POKES = ["Hey! Stop poking!", "That TICKLES! I mean... TREMBLE BEFORE ME!", "Quit it! I'm VERY scary!", "Poke me again and I'll... um... be really big at you!", "Okay, that one was kind of nice."];

const CAST = {
  narrator: { label: "Story", color: "var(--dust)" },
  trexy: { label: "T-Rexy", color: "var(--c-hero)" },
  shadow: { label: "Shadowspine", color: "var(--c-shadow)" },
  nova: { label: "Nova", color: "var(--c-nova)" },
  family: { label: "T-Rexy's family", color: "var(--c-family)" }
};

// Adaptive skills. run: obstacle runs (1 to 5). jigsaw: 3x3, 3x4, or 4x4 pieces. words: word length and fuel. typing: how long the clue line is.
const SKILLS = { run: { min: 1, max: 5, start: 2 }, jigsaw: { min: 1, max: 3, start: 2 }, words: { min: 1, max: 3, start: 2 }, typing: { min: 1, max: 3, start: 2 } };
const SKILL_NAME = { run: "Run", jigsaw: "Jigsaw", words: "Word", typing: "Typing" };
const skills = Kit.adaptive.create({
  key: KEYS.skill, skills: SKILLS,
  onChange: (name, level, delta) => { if (delta > 0) { sfx.levelup(); toast(`${SKILL_NAME[name]} level up!`); } }
});
const RUN_SPEED = [5.6, 6.4, 7.2, 8.0, 8.8];            // tiles per second at run levels 1 to 5
const JIG_GRID = { 1: [3, 3], 2: [3, 4], 3: [4, 4] };   // rows, columns
const FUEL = { 1: 7, 2: 6, 3: 6 };

const JUKEBOX = ["glitchHub", "echo", "fern", "lantern", "whirl", "shadowRun", "lullaby", "homeStomp"];
const SONG_WHERE = { glitchHub: "Yours from the start", echo: "Echo Rings", fern: "Fern Moon", lantern: "Lantern Lab", whirl: "Whirlpool Galaxy", shadowRun: "The Shadow Gate", lullaby: "Solve the mystery", homeStomp: "Get home" };

const fresh = () => ({
  v: 1, step: 0, parts: {}, paint: "", done: [], clues: [], pages: [], words: {}, hubX: WRECK_X, moved: false, pokes: 0, roared: false,
  stats: { pts: 0, runs: {}, jigs: {}, words: {}, typing: { hits: 0, misses: 0, ms: 0, chars: 0 }, mystery: { right: 0, wrong: 0 } }
});
let S = fresh();
let active = false;

function save() { if (active) store.set(KEYS.save, S); }
function loadSave() {
  const d = store.get(KEYS.save, null);
  if (d && d.v === 1 && d.step > 0 && d.step < STEPS.length - 1) return d;
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
const shipCfg = () => ({ ...S.parts, paint: S.paint });
const allParts = () => SHIP.PART_ORDER.every(p => S.parts[p]);
const nextPortal = () => PORTAL_ORDER.find(id => !S.done.includes(id)) || "gate";
const nextBtn = (label = "Next", icon = ICON.go, cls = "") => Kit.ui.nextBtn(label, icon, cls);
const bindPrimary = fn => Kit.ui.bindPrimary(panel, fn);
