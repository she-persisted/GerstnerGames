# Toybox: the game library for Child L

Version 1.2.0. Built October 11, 2026; Biscuit redrawn as a golden retriever in 1.1.0; Biscuit speaks with recorded voice clips in 1.2.0.

Toybox is the shared set of characters, pictures, sounds, game types and word packs that every game for Child L is built from. The point is familiarity: the same host, the same pictures for the same words, the same sounds for the same meanings, in every game.

## Where it lives

| What | Where |
|---|---|
| Source code (the one place code is changed) | `child-l/toybox/` in https://github.com/she-persisted/GerstnerGames (private, branch `main`) |
| Biscuit's Toybox, the catalog page (deployed) | https://claude.ai/artifact/H2XE3HncmDzqdj11winw4k |
| Biscuit's Magic Words, the game Child L plays (deployed) | https://claude.ai/artifact/G7s82Cdobz9eV6ir5oSNc1 |

**Source of truth:** this repo. The artifacts are deployments made from it (`child-l/deploy.json`); never edit them directly. Work steps (clone, test, commit, deploy) are in `child-l/README.md`. The catalog page reads the live registries, so it always shows exactly what the library contains.

**Why each artifact holds its own copy of `lib/`:** an artifact can only load scripts from its own files or a short list of public code hosts, so a game cannot link to Toybox at runtime. Each deploy publishes the repo's `lib/` files into that artifact. A deployed game keeps running the library it was deployed with, so when `lib/` changes, deploy every artifact.

## Layers

| # | Layer | File(s) | Holds |
|---|---|---|---|
| 6 | Games | one HTML page per game | Config only: host, game types, packs, goal |
| 5 | Shell | `lib/shell.js` | `Toybox.launch(config)` builds the whole game: sky, top bar, jar, home menu, grown-up corner, joke party |
| 4 | Word packs | `lib/packs/*.js` | Words and jokes. Data only |
| 3 | Game types | `lib/mechanics/*.js` | How a round plays. Never names specific words or characters |
| 2 | Engine | `lib/engine.js` | Registries, voice, sound player, effects, storage, progress tally, candy jar, party, UI builders |
| 1 | Assets | `lib/assets/characters.js`, `pictures.js`, `sounds.js`, `voice-clips.js`, `voice/` | Characters, pictures, sound recipes, each character's recorded lines. Data plus tiny render functions |
| 0 | Theme | `lib/theme.css` | Color and font tokens, every component style |

**Load order on a page:** `theme.css`, `engine.js`, `assets/*`, `packs/*`, `mechanics/*`, `shell.js`, then the config script. The engine loads before the assets because it creates the registries the data registers into.

**Rules that keep the layers clean**
1. Assets and packs are data. They only call `Toybox.<registry>.add(...)`.
2. Game types get everything through `ctx` (host, next item, reward, progress). They never reference a specific word, pack or character.
3. The shell holds no round logic. Games hold nothing but config.
4. Every color and font comes from a `--tb-*` token in `theme.css`. All classes are prefixed `tb-`.
5. Text a character speaks lives in that character's `lines`, not in game types.

## Contracts

**Character** (`assets/characters.js`)
`{ id, name, role, look, personality, voice: {pitch, rate, clips}, render(), lines: { kind: ['text with {vars}'] } }`
`voice.clips` names the character's clip set in `assets/voice-clips.js`; `pitch` and `rate` only shape the browser voice used when a clip is missing.
Line kinds used today: `hello`, `intro:<game type id>`, `whichOne`, `find`, `praise`, `oops`, `sayPrompt`, `abracadabra`, `mixup`, `close`, `tryAgain`, `newOne`, `jarFull`. Vars: `{word}`, `{Word}`, `{other}`, `{child}`.

**Picture** (`assets/pictures.js`), keyed by the word
`{ id: 'fox', emoji: '...' }` or `{ id, svg: '<svg viewBox="0 0 100 100">...' }`, plus optional `cls`, `extra` (corner emoji), `note` (why this picture means this word). A word with no picture shows a letter tile, so a new word never breaks a game.

**Sound** (`assets/sounds.js`)
`{ id, label, notes: [{ f, at, dur, wave, vol, to }] }`. Ids in use: `chime` (right), `boing` (mix-up), `plink` (candy lands), `fanfare` (jar full), `giggle`.

**Voice clips** (`assets/voice-clips.js`, generated; mp3s in `assets/voice/<character>/`)
`Toybox.voice.addClips({ id, voice, base, clips: { key: 'file.mp3' } })`, where key = `Toybox.voice.key(text, rate)`: the words of the text, lowercase, plus ` |slow` for a part spoken below rate 0.85 (a word said slowly for listening). `say()` plays clips when every part of the sentence has one, and otherwise uses the browser voice for the whole sentence, so one sentence never mixes two voices and a missing clip never breaks a game. Never edit by hand: run `child-l/tools/voice_clips.py` (see its header).

**Pack: minimal pairs** (`packs/*.js`)
`{ id, type: 'minimal-pairs', title, source, sounds: [{label, cue}, {label, cue}], items: [['fox','box'], ...] }`. `sounds[0]` describes the first word of each pair, `sounds[1]` the second.

**Pack: jokes**
`{ id, type: 'jokes', title, items: [{ q, a }] }`

**Game type** (`mechanics/*.js`)
`{ id, title, blurb, grownUpNote, icon, accent: 'sun'|'candy'|'mint', accepts: [pack types], needsGrownUp?, create(ctx) -> { start(introParts), stop() } }`
`ctx`: `root`, `host`, `nextItem() -> {words, sounds, pack}`, `reward(el, then)`, `progress.log(gameTypeId, word, ok)`, `isActive()`.

**Game config** (passed to `Toybox.launch`)
`{ id, title, child, host, welcome, mechanics: [...], packs: [...], jokes, goal (max 12), toybox: '1.2.0', legacy? }`

## Current inventory (v1.2.0)
- Characters: Biscuit the wizard pup (host), a golden retriever drawn in SVG with idle ear sway and blinking.
- Voices: Biscuit speaks with 190 recorded clips in the Kokoro voice `af_aoede` (Mom's pick). Any new character uses Kokoro `am_puck` (also Mom's pick).
- Pictures: 20 (the F/B homework words).
- Sounds: 5.
- Game types: Listen Game (`listen-tap`, plays alone), Magic Word Game (`say-it`, grown-up judges what they heard).
- Packs: `fb-initial` (10 F/B pairs), `kid-jokes` (9 jokes).
- Games: Biscuit's Magic Words.

## Procedures

All paths below are under `child-l/toybox/`. Every procedure ends the same way: run `python3 child-l/tools/playtest.py` until it passes, commit on `main`, push, then deploy (`child-l/README.md`).

**New homework sheet**
1. Mom sends a photo. Read the word pairs off it.
2. Copy `lib/packs/fb-initial.js` to `lib/packs/<new-id>.js`, change the id, title, words, cues and source.
3. Add any missing pictures to `lib/assets/pictures.js`.
4. Add the new pack's `<script>` tag to `toybox.html` and to each game that uses it, and add the pack id to that game's `packs` config.
4a. Make the voice clips for the new words: `python3 child-l/tools/voice_clips.py list`, then `make`. If it lists any clip as LISTEN, ask Mom to listen to it before deploying: these words are the speech practice.
5. Bump the minor version in `lib/engine.js` and set `toybox:` in every game's config to match (a mismatch fails the play-test).
6. Test, commit, push, deploy every artifact.
7. Update the "Child L current focus" doc in the claude.ai project.

**New game:** steps in `child-l/README.md` ("New game").

**New game type or character:** add one file or entry that follows the contract above, add its `<script>` tag to `toybox.html` and to the games that use it, and give the host any new line kinds the game type asks for. A new character gets `voice.clips: '<its id>'` and the Kokoro voice `am_puck` unless Mom picks another (`VOICES` in `tools/voice_clips.py`). Any new or changed line: run `voice_clips.py list` and `make`. Bump the minor version as above.

## Versioning
Semantic version in `lib/engine.js` (`T.version`), shown on the catalog page.
- Patch: fixes, no contract change.
- Minor: new pictures, packs, sounds, characters or game types.
- Major: any change to a contract above. Every game must then be checked before deploying.

Each game records the version it was built against in `config.toybox`. The shell warns in the console on a mismatch, which fails the play-test.

## Engineering notes
- **Keep library files plain ASCII.** Write emoji and curly quotes as `\u` escapes. A raw emoji in a script file showed up garbled in testing whenever the server didn't declare UTF-8. The play-test checks this.
- **Test before every commit and deploy:** `python3 child-l/tools/playtest.py` loads every page at 1366px and 400px wide, fails on console errors, missing files or sideways scrolling, and plays each game: a Listen round, a Magic Word mix-up, and correct rounds until the jar fills and the joke party opens.
- **Voice** comes from recorded clips made with Kokoro (open, free, runs offline; `tools/voice_clips.py`). Mom chose Kokoro's voices after the browser voice and a clone of her own voice both sounded poor. Kokoro swallows the first sound of a word said on its own ("fox" comes out near "vox"), so the tool says each practice word inside a short sentence, cuts it out, and checks every clip with Whisper speech recognition. The browser's built-in text-to-speech is the fallback for any text without a clip. Neither voice can reliably say single speech sounds like "fff" or "b".
- **Progress** (the tricky-words list in the grown-up corner) is saved per device, in the browser. Claude cannot see it yet.
- **Saved candies:** stored per game, in the browser, keyed by the artifact's address. They survive deploys to the same artifact. Biscuit's Magic Words imported Child L's totals from its pre-Toybox version through `config.legacy`.

## Roadmap
1. **Robot Talk game type** (blending sounds into words; also measures his reading baseline). Decision needed first: the built-in voice can't say single sounds cleanly. Options are recording Mom's voice for each sound, or using consonant-plus-vowel chunks ("buh", "aa"). Recording a sound as an mp3 in `assets/voice/` and listing it in the clip set works with today's engine.
2. **New packs** as homework changes, one pack per sheet.
3. **Shared progress:** store the tricky-word tally where Claude can read it, so the current-focus doc can update from real results.
4. **Letter-sound game type** for phonics: hear a sound, tap the letter.
5. **A sidekick character** (for example a robot for Robot Talk). Biscuit stays the host.
