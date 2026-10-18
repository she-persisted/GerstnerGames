# Child I's Game Library

Every game in the Child I Fun project is built from the files in this library. Each file does one job, starts with a short header that says what it does, and can be reused in any new game.

## Folders

| Folder | What lives there | Reuse rule |
|---|---|---|
| `kit/` | Engines: story flow, puzzle screen, typing flights, digging, walkable map, music players (simple and dance-style), sound effects, cartoon voices, adaptive difficulty, high scores, jukebox, obstacle runs, jigsaw, letter-guessing, side-view hub, shared styles | Works in any game. Talks to games only through `window.Kit`. |
| `assets/` | Art, music, and sounds: characters, rocket, side-view worlds, map art, icons, songs, recorded sounds (CC0 only, with the author credited, stored as small data URLs so a game stays one page) | Any game can include them. |
| `content/` | Question banks (tagged easy, medium, hard), question generators, word lists | Any game can draw from them. |
| `games/<id>/` | One game's own parts: settings, story, screens, layout, `game.json`, and any legacy single-file versions | Only that game. |
| `build/` | `build.py`, which assembles a game and writes `catalog.json`; `playtest.py`, the automated play-test | |
| `site/` | Source for this library's own page | |
| `dist/` | Built games (not published with the library) | |

## How a game is put together

1. `games/<id>/game.json` lists the files a game uses, in order: fonts, styles, the page layout (`body`), shared scripts, and the game's own parts.
2. `python3 build/build.py games/<id>/game.json` joins them into one self-contained web page in `dist/`. Lines like `<!-- @include assets/characters/kepler.svg -->` in the layout pull in art files.
3. The build stops if any file's `@requires` isn't loaded before it.
4. The built page is published as its own artifact. It needs nothing else to run.

## File headers

Every code and art file starts with:

- `@file` its path
- `@about` what it does, in plain words
- `@provides` what it gives other files (for example `Kit.music.create(songs)`)
- `@requires` what must load before it

Notes after the header explain options and formats. `build.py --catalog` reads these headers to write `catalog.json`, which the library page uses for its file browser.

## Rules

1. Change the source files here, never a built page.
2. Code that more than one game could use goes in `kit/`; art and music in `assets/`; questions and words in `content/`. Code only one game needs goes in `games/<id>/`.
3. Kit modules never reach into a game. Games pass in what a module needs (callbacks, colors, elements).
4. A game's own parts share one scope and run in the order `game.json` lists them.
5. Every published change to a game gets a new version number and a new output file name. Each game has one permanent home page (`home` in `game.json`) that always runs the newest version; the version it replaces is first saved as its own archive page, which then stays untouched. Add each release (version, date, link, notes) to `game.json`, and make its QR card with `build/qr.py`.
6. After any change, run `python3 build/build.py --all` and `python3 build/playtest.py` (it must end with `PASS`), then commit and push.

## Where the source lives

The source is the `library/` folder of the GitHub repo `she-persisted/GerstnerGames`, branch `main`. That is the only place it changes. The game pages and this library's own page on claude.ai are deployed copies.

## Changing a game later (steps for Claude)

Follow `project/claude/game-library.md` in the repo. In short: clone the repo, edit source here, build, run `build/playtest.py`, commit and push, then archive the current version, publish the new one to the game's home page, make its QR card, and redeploy this library page.

## Starting a new game

Copy `games/starward/game.json` and keep only the kit modules, assets, and content the new game needs. Write the new game's parts in `games/<new-id>/`. Anything new that another game could use (a new engine, character, song, or question bank) goes into the shared folders with a full header.

## Adaptive difficulty

`kit/adaptive.js` keeps a level for each skill and saves it on that computer:

- Two clean answers in a row (first try, no hints): level up.
- Two answers in a row that took 2 or more tries: level down.
- Pressing "Show me": level down right away.
- Typing rounds: 95% accuracy with nearly every word caught moves the level up; missing the 85% goal or most words moves it down.

Starward's skills: typing speed 1 to 10, math 1 to 5 (about 2nd to 4th grade), word puzzles 1 to 3. Questions are picked when they appear, so they always match the current level.

Mini Game Survival's skills, kept separately for Easy and Hard mode: runs (one level easier or harder than the mode's ramp, which climbs from portal to portal; run levels go 1 to 6), jigsaw 1 to 3 (3x3, 3x4, 4x4), clue words 1 to 3 (word length and fuel), typing 1 to 3 (how long the clue line is). Its mistakes are used only for that result and never shown or saved.

## Obstacle runs

`kit/runner.js` builds each run from chunks in `content/levels/runner-chunks.js` and plays every chunk with its built-in solver before using it, so every level can be beaten. The physics runs in fixed 1/120 s steps, so a list of button presses always replays the same way; the play-test uses each level's own solution to finish runs. The hero can double hop (press again in the air), and the generator can put extra flat ground before each chunk (`space`) so low levels have room to breathe. Add a chunk by adding a row to the chunk list; if no speed can beat it, the generator simply skips it. Give the generator the music's beat (`beat`, seconds per beat) and each chunk's first hop lands on a beat; `play()` then pulses the ground on the beat, pops "PERFECT!" for hops right on it, and reports its clock (`onClock`) so a game can keep the music in time (`kit/groove.js` has `restart` and `hush` for that). On a narrow screen (like a phone), tiles shrink so at least 15 fit across a run; `kit/side-hub.js` does the same with 11 tiles across a hub.

## Music

Two players share one set of controls, so the jukebox works with both: `kit/music.js` plays simple 32-step songs (Starward), and `kit/groove.js` plays dance-style songs with sixteenth-note patterns, verses and choruses, claps, and arpeggios (Mini Game Survival). `kit/groove.js` can also play the simple songs.

Recorded voices live in `assets/sounds/` and play through `kit/voices.js`: `evilLaugh` takes turns between recorded villain laughs, and `chirp` plays a cute creature noise by mood (happy, excited, curious) at any pitch, so each character can have its own voice.

## Question format

`{ id, kind, q, a: [accepted answers, first one shown], clue, clue2, d: 1 | 2 | 3 }`. Banks add more fields when needed: `seq` for number patterns, `tiles` for odd one out, `len` for scrambles. Add a written question by adding a row to a bank in `content/questions/`. Add a new kind of generated question by adding a function to `Kit.questions.gens` that takes a level and returns a question.
