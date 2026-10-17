# Mini Game Survival (Child I's game)

**Spoiler warning:** this doc explains the mystery's twist. The kids asked to be surprised, so don't read the "Mystery" section out loud or reveal it in voice mode unless they ask for spoilers.

Home page (always the newest version): https://claude.ai/artifact/EgGFe2mgXPPY7S47QGoWNJ
QR card: `library/dist/mini-game-survival-v1-qr.png`
Source: GitHub `she-persisted/GerstnerGames`, `library/games/mini-game-survival/` (see claude/game-library.md)

## Design (October 17, 2026, by voice, with Child I and two friends)
- Asked for: a side-scroller like Geometry Dash, with a real story, for grades 2 through 6.
- World: a glitchy, neon space nebula with galaxies all around.
- Hero: T-Rexy, a cute, cartoony green T-Rex. He stayed up late, heard weird music, got swooped into a galaxy, passed out, and woke up alone in a new galaxy. He wants to get home. He's lonely: no friends along the way.
- What's tricky: his jump is tiny, so he needs bounce pads and spaceships to reach high places.
- Villain: a completely black Spinosaurus trying to take over the whole T-Rex population.
- Collecting: spaceship parts with styles to pick, like Starward, but new art.
- Mini games, one idea from each kid: grabbing puzzle pieces to remember his homeland and family (who turn out to be omnivores), a hangman-style game where you earn letters to spell clue words, and portal runs with bounce pads, spaceships, and spikes where touching anything sends you back to the portal entrance.
- Typing: type in the clues he finds. No typing races.
- Art: T-Rexy stands out, super cute and cartoony; the world is super glitchy, bright, flashing neon. The Spinosaurus is completely black.
- Music: hardcore.
- Mom asked for an intriguing mystery where everything blends together. The kids asked Claude to surprise them with who played the weird music, and to add Easter eggs that enliven and add depth to the plot.

## How it plays
- Title screen: Play or Keep going, the high score board, and a jukebox of the songs found so far.
- The Crash Pad: T-Rexy walks left and right (arrow keys or A and D, or click), and jumps into the next glowing portal with Enter. The side panel is his Clue Notebook. Shadowspine looms over the pad.
- Each of the four portals has the same four mini games, then a spaceship part and a song:
  1. **Portal run** (side-scroller): T-Rexy runs by himself. Space, Up, or click to hop (tiny!). Yellow bounce pads launch him high, pink portals turn him into a little ship (hold to fly up, let go to sink), green portals turn him back. Touch a spike or a wall and he goes back to the start ("Attempt 2, 3..."). After three crashes a Checkpoints button appears. Glowing memory pieces float along the way. Esc pauses.
  2. **Memory jigsaw**: the memory pieces make a picture. Swap tiles (click two, or arrow keys and Enter). Helpers: Peek, and Fix one (also by tapping T-Rexy).
  3. **Glitch-locked clue word**: a hangman-style letter game made friendly. A hint, a fuel tank, and letter keys. Wrong letters burn fuel; Scan reveals a letter (also by tapping T-Rexy). Out of fuel, the word is shown and he types it to refuel.
  4. **Clue notebook**: a clue card (what he remembers, plus a science fact), and he types the clue line into his notebook.
- Portals: Echo Rings (sound and music), Fern Moon (food and dinosaurs), Lantern Lab (light and shadows), Whirlpool Galaxy (space). Parts in that order: Thrusters, Wings, Glitch Core, Cockpit. Then he picks a paint job.
- The Shadow Gate: the final, longer run, with Shadowspine in the background.
- Solve the mystery: four multiple-choice questions (keys 1 to 3). A wrong answer points to the clue that helps.
- Ending: score card, name for the high score board, levels reached.

## Mystery (spoilers)
- Shadowspine isn't a giant. He's a **shadow**: Nova, a teeny baby Spinosaurus, stands super close to her star lantern so her shadow on the nebula clouds looks gigantic. That's why he is completely black with no eyeballs.
- Nova played the weird music (a squeaky music-box lullaby) and swooped T-Rexy up. She was lonely too, and scared because "everybody says T-Rexes eat everything," so she planned to look huge, wear him out with mini games, and become boss of all the T-Rexes so nobody could eat her. She also ate the family's fish.
- The clues: (1) the music was high and squeaky, and small things make high sounds; (2) the fish basket was emptied, and Spinosaurus mostly ate fish; (3) teeny three-toed footprints on the windowsill, and a teeny moth near a lamp makes a huge shadow; (4) someone small holding a star lantern in the swirl.
- Ending: the shadow shrinks away, Nova is revealed, T-Rexy says his omnivore family eats plants and meat but never eats friends, and invites her home. Her lullaby opens a galaxy swirl home. Shadowspine "takes over the T-Rex population" as the official Boss of Dessert.
- The two lonely characters becoming friends gives the "very lonely, no friends" hero a reason to feel better at the end.

## Easter eggs
- **Secret diary pages**: each portal run hides a glitchy "?" box high up. Hop onto the thin ledge with a bounce pad on it to reach it (running underneath is the normal way). Each page is a step of Nova's plan, "Operation MINI GAME SURVIVAL," signed with a tiny footprint. All four unlock a secret ending line, and each page is worth 250 points.
- **ROAR**: type R-O-A-R on the Crash Pad. T-Rexy goes "Rawr!" and Shadowspine flinches smaller ("EEP! ...I mean, ha ha. Not scared."). Page 3 hints at it.
- **Poke Shadowspine**: click the sky on the Crash Pad ("That TICKLES! I mean... TREMBLE BEFORE ME!").
- **Tiny footprints** appear on the Crash Pad after Fern Moon, and a tiny lantern glow at Shadowspine's feet after the Whirlpool Galaxy.
- **Glitch whisper**: once in a while a glitch on the Crash Pad shows "i'm only small."
- **Pictures**: a glowing music box on the hill, a teal tail sneaking out the door with the fish, the 11:11 clock, footprints on the windowsill, and a small silhouette holding a lantern.
- **Music**: each portal's song hides a piece of the weird tune; the Whirlpool song plays all of it. The full tune unlocks as "Nova's Lullaby," and the ending plays it as "Home Stomp."

## Adaptive difficulty
Levels are saved on that computer (key `mgs.skill`).
- Run, 1 to 5 (starts 2): speed from 5.6 to 8.8 tiles a second, and harder chunks (two spikes in a row, gaps, ship zigzags) at higher levels. 0 or 1 crash counts as clean, 2 to 4 okay, 5 or more a struggle, Checkpoints as needing help.
- Jigsaw, 1 to 3 (starts 2): 3 x 3, 3 x 4, or 4 x 4 pieces.
- Word, 1 to 3 (starts 2): 4 to 5 letter words with 7 fuel cells, 5 to 7 letters with 6, or 6 to 11 letters with 6.
- Typing, 1 to 3 (starts 2): the clue line is a short phrase, a sentence, or a longer sentence.
- Same rules as Starward: two clean results in a row raise a level, two struggles lower it, needing the answer lowers it right away.

## Scoring
Runs (400 + 15 per memory piece - 20 per crash, at least 100; the Shadow Gate 600 + 20 per star shard), jigsaws (300 minus extra swaps and helpers, at least 80), clue words (150 + 40 per fuel cell left), mystery answers (150 first try, 50 after), plus 20 x typing words per minute (capped at 150 wpm), 5 x typing accuracy, and 250 per secret page. Shared board for people who can edit the page; everyone else's scores save on their own computer.

## Under the hood
- Every run is built from chunks (`content/levels/runner-chunks.js`), and a solver plays each chunk before it's used, so every level is beatable at every speed. The hidden box route is proven reachable too.
- Flashing is gentle: a thin stripe glitches at most about once a second for a tenth of a second; with "reduce motion" on there are no glitches.
- New shared pieces: `kit/runner.js`, `kit/jigsaw.js`, `kit/fuel-word.js`, `kit/side-hub.js`; T-Rexy, Nova, the glitch ship, the memory pictures, the neon backgrounds, eight songs, the science word bank.

## Versions
| Version | Date | Page | What changed |
|---|---|---|---|
| v1 | 2026-10-17 | https://claude.ai/artifact/EgGFe2mgXPPY7S47QGoWNJ (home page) | First version. |

## Ideas for later
- Waiting on play-testing: whether the runs are too hard at the start, whether ship mode feels controllable, whether kids find the secret pages.
- Per-player skill levels if friends share one Chromebook (today levels are per computer).
- More portals, a practice mode for each run, or a level editor so the kids can build their own runs.
