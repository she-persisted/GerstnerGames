# Mini Game Survival (Child I's game)

**Spoiler warning:** this doc explains the mystery's twist. The kids asked to be surprised, so don't read the "Mystery" section out loud or reveal it in voice mode unless they ask for spoilers.

Home page (always the newest version): https://claude.ai/artifact/EgGFe2mgXPPY7S47QGoWNJ
QR card: `library/dist/mini-game-survival-v3-qr.png`
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

## v2 changes Mom asked for (October 17, 2026, after play-testing v1)
- The Geometry Dash runs were far too hard: add a double jump in the air, make the first level easier, and make levels get harder as the game goes on.
- Pick Easy or Hard mode.
- A friendlier, more amusing opening, with dinosaur and space puns all through the story.
- More fun, upbeat music.
- Don't keep track of failed attempts in any mini game.
- More detailed memory pictures.
- Shadowspine drawn as one cohesive dinosaur shadow, not separate shapes, with an evil laugh and a small animation.
- Backgrounds inspired by NASA pictures, styled in the game's neon theme, a mix for the different places; prettier galaxies.
- A library of extra questions so replays vary.
- A fun end clip: the ship comes alive, becomes friends with the family, and they ride him whenever they want.

## v3 changes Mom asked for (October 17, 2026)
- Some memory pieces in the runs couldn't be collected. Make every piece catchable, and check that in every future play-test.
- Connect the pieces to the memory jigsaws: "if we only got 9 pieces of 12 needed, we shouldn't have all of that memory." Offer a choice to go forward without them, or go back and try to get all of them for a bonus.
- L and R should always go forward or back in the story.
- Replace the "awful robot" laugh with a real recording of a silly villain laugh from the internet. (Mom downloaded the CC0 "Evil Laughs" pack from OpenGameArt and attached it.)
- Hints that show the buttons to press ("Hint: ..."), only when a player has been stuck a while.

## How it plays
- Title screen: pick Easy or Hard (click, or press E or H), then Play or Keep going, plus the high score board and a jukebox of the songs found so far. The crash pad's notebook can switch modes mid-game.
  - Easy: slower runs, checkpoints on from the start, smaller puzzles to begin with.
  - Hard: faster runs, a crash sends T-Rexy back to the portal entrance, and runs score double.
- The Crash Pad: T-Rexy walks left and right (arrow keys or A and D, or click), and jumps into the next glowing portal with Enter. The side panel is his Clue Notebook. Shadowspine looms over the pad.
- Each of the four portals has the same four mini games, then a spaceship part and a song:
  1. **Portal run** (side-scroller): T-Rexy runs by himself. Space, Up, or click to hop (tiny!), and press again in the air for a double hop (he does a flip). Yellow bounce pads launch him high, pink portals turn him into a little ship (hold to fly up, let go to sink), green portals turn him back. Touch a spike or a wall and he goes back to the start (Hard) or the last checkpoint (Easy). Nothing counts attempts. In Hard, a Checkpoints button appears after three crashes. Glowing memory pieces sit along the way, every one on the path that beats the run. Esc pauses.
     - Caught every piece: a +200 bonus, and on to the jigsaw.
     - Some got away: pick **Keep going** (Enter) or **Run it again** (A). Running it again is the same run, with the pieces already caught shown faint and still counted, so only the missing ones are left to grab.
  2. **Memory jigsaw**: the memory pieces make a picture. Swap tiles (click two, or arrow keys and Enter). Helpers: Peek, and Fix one (also by tapping T-Rexy). Pieces that got away in the run leave glitchy "?" holes, the same share of the tiles as the pieces missed (9 of 12 caught means 3 holes in a 12-tile picture). Tiles that show a clue never become holes.
  3. **Glitch-locked clue word**: a hangman-style letter game made friendly. A hint, a fuel tank, and letter keys. Wrong letters burn fuel; Scan reveals a letter (also by tapping T-Rexy). Out of fuel, the word is shown and he types it to refuel. About 35 words per topic, so replays bring new ones.
  4. **Clue notebook**: a clue card (what he remembers, a science fact, and a fun bonus fact), and he types the clue line into his notebook. Each clue has three versions per typing level, and each fact has several versions (`games/mini-game-survival/questions.js`).
- Portals: Echo Rings (sound and music), Fern Moon (food and dinosaurs), Lantern Lab (light and shadows), Whirlpool Galaxy (space). Parts in that order: Thrusters, Wings, Glitch Core, Cockpit. Then he picks a paint job.
- The Shadow Gate: the final, longer run, with Shadowspine in the background.
- Solve the mystery: four multiple-choice questions (keys 1 to 3), each with four versions that test the same idea. A wrong answer points to the clue that helps.
- **L and R** move back and forward through the story on every screen (the left and right arrow keys work too, except where those keys are already taken). L goes back to the story line before. R goes forward: it skips a run, finishes a jigsaw or a typed clue, picks the first choice, shows a mystery answer, or jumps into the next portal from the crash pad. Skipped parts earn no points, and going forward again skips mini games already finished. Typing screens use the arrow keys instead, because their letters are for typing; runs and jigsaws use only L and R. On the crash pad, R waits a moment, so typing ROAR still works.
- **Hints**: a "Hint:" bubble with the keys to press appears only when someone seems stuck: after doing nothing on a screen for a while (9 seconds on the crash pad, 10 to 20 seconds elsewhere), after 3 wrong letters in a clue word (try the vowels), right away in a run after a crash with no key pressed yet, and after 2 crashes at the same obstacle (a tip for that obstacle: spikes, gaps, ledges, steps, bounce pads, the low ceiling, the ship, the secret path). Pressing anything hides it.
- Ending, then the end clip: the ship blinks awake, T-Rexy names him Zoomasaurus, the family welcomes him, and everybody rides him in loop-de-loops across the sky (that ride keeps playing behind the score card). Then the score card, a name for the high score board, the mode, and levels reached.

## Mystery (spoilers)
- Shadowspine isn't a giant. He's a **shadow**: Nova, a teeny baby Spinosaurus, stands super close to her star lantern so her shadow on the nebula clouds looks gigantic. That's why he is completely black with no eyeballs.
- Nova played the weird music (a squeaky music-box lullaby) and swooped T-Rexy up. She was lonely too, and scared because "everybody says T-Rexes eat everything," so she planned to look huge, wear him out with mini games, and become boss of all the T-Rexes so nobody could eat her. She also ate the family's fish.
- The clues: (1) the music was high and squeaky, and small things make high sounds; (2) the fish basket was emptied, and Spinosaurus mostly ate fish; (3) teeny three-toed footprints on the windowsill, and a teeny moth near a lamp makes a huge shadow; (4) someone small holding a star lantern in the swirl.
- Ending: the shadow shrinks away, Nova is revealed, T-Rexy says his omnivore family eats plants and meat but never eats friends, and invites her home. Her lullaby opens a galaxy swirl home. Shadowspine "takes over the T-Rex population" as the official Boss of Dessert.
- The two lonely characters becoming friends gives the "very lonely, no friends" hero a reason to feel better at the end.
- Shadowspine is drawn from Nova's own outline (one solid Spinosaurus shape with a toothy grin), so the giant shadow really is her. Hints: since v3 his evil laugh is a real recording of a high, cackly laugh (small things make high sounds), and one poke line slips: "Poke me again and I'll go super-NOVA!".

## Easter eggs
- **Secret diary pages**: each portal run hides a glitchy "?" box high up. Hop onto the thin ledge with a bounce pad on it to reach it (running underneath is the normal way). Each page is a step of Nova's plan, "Operation MINI GAME SURVIVAL," signed with a tiny footprint. All four unlock a secret ending line, and each page is worth 250 points.
- **ROAR**: type R-O-A-R on the Crash Pad. T-Rexy goes "Rawr!" and Shadowspine flinches smaller ("EEP! ...I mean, ha ha. Not scared."). Page 3 hints at it.
- **Poke Shadowspine**: click the sky on the Crash Pad ("That TICKLES! I mean... TREMBLE BEFORE ME!"). He mutters and his jaw moves while he talks.
- **Picking Hard** on the title screen makes Shadowspine laugh.
- **Tiny footprints** appear on the Crash Pad after Fern Moon, and a tiny lantern glow at Shadowspine's feet after the Whirlpool Galaxy.
- **Glitch whisper**: once in a while a glitch on the Crash Pad shows "i'm only small."
- **Pictures**: a glowing music box on the hill, a teal tail sneaking out the door with the fish, the 11:11 clock, footprints on the windowsill, and a small silhouette holding a lantern.
- **Music**: each portal's song hides a piece of the weird tune; the Whirlpool song plays all of it. The full tune unlocks as "Nova's Lullaby," and the ending plays it as "Home Stomp."

## Adaptive difficulty
Levels are saved on that computer, separately for each mode (keys `mgs.skill.easy` and `mgs.skill.hard`).
- Runs ramp up through the game. Run levels for the four portals and the Shadow Gate: Easy 1, 2, 2, 3, 3; Hard 2, 3, 4, 5, 6. The adaptive run skill moves all of them one level easier or harder.
- Run levels 1 to 6: speed 5.0, 5.6, 6.2, 6.9, 7.6, 8.3 tiles a second; flat ground before each obstacle 4, 3, 2, 1, 1, 0 tiles. Level 1 has no ship tunnel and nothing a single hop or a bounce pad can't clear. The double hop is needed from level 2 (a two-high ledge) and for three spikes in a row (level 4).
- Jigsaw, 1 to 3 (Easy starts 1, Hard 2): 3 x 3, 3 x 4, or 4 x 4 pieces.
- Word, 1 to 3 (Easy starts 1, Hard 2): 4 to 5 letter words with 7 fuel cells, 5 to 7 letters with 6, or 6 to 11 letters with 6.
- Typing, 1 to 3 (Easy starts 1, Hard 2): the clue line is a short phrase, a sentence, or a longer sentence.
- Same rules as Starward: two clean results in a row raise a level, two struggles lower it. Crashes and mistakes are looked at only for that one result; they're never shown or saved.

## Scoring
Mistakes never cost points. Runs 300 + 20 per memory piece (the Shadow Gate 500 + 25 per star shard), doubled in Hard mode, plus 200 for catching every piece in a run; running a portal again never lowers its points. 300 per jigsaw (none if every piece left was already home); 300 per clue word; 150 per mystery answer; plus 20 x typing words per minute (capped at 150 wpm), 5 x typing accuracy, and 250 per secret page. Anything skipped with R earns nothing. Shared board for people who can edit the page; everyone else's scores save on their own computer.

## Under the hood
- Every run is built from chunks (`content/levels/runner-chunks.js`), and a solver plays each chunk before it's used, so every level is beatable at every speed. The hidden box route is proven reachable too.
- Memory pieces are placed on the solved route: only where T-Rexy is on the ground (or a block top) in cube mode, never inside a ship tunnel or the secret section, and never touching a block, spike, pad, or portal. `Kit.runner.sim.checkPieces` replays the winning route and the secret route and reports any piece either misses. The play-test builds 90 runs across levels 1 to 6 and checks every piece, and its full playthrough checks every run caught every piece (with test runs that miss pieces on purpose to check the holes and the run-again choice).
- Each game has a random seed, so a run's layout is the same on a second try, and the jigsaw holes stay on the same tiles after a reload.
- Flashing is gentle: a thin stripe glitches at most about once a second for a tenth of a second; with "reduce motion" on there are no glitches.
- Backgrounds (`assets/worlds/glitch-nebula.js`) are neon takes on NASA Hubble and Webb pictures, drawn by code: the Cosmic Cliffs (crash pad), the Southern Ring Nebula (Echo Rings), the Pillars of Creation and the fern moon (Fern Moon), a Wolf-Rayet star in its clumpy shell (Lantern Lab), the Whirlpool Galaxy and its companion (Whirlpool Galaxy), the Horsehead Nebula (Shadow Gate), and the Milky Way with Andromeda and a crescent moon (Fern Valley at night). Every sky also has noise-made gas and dust, deep-field galaxies, stars with Webb's eight-point spikes, and drifting face-on, tilted, and edge-on galaxies.
- Music (`kit/groove.js`): upbeat sixteenth-note chiptune with verses and choruses, claps, open hats, arpeggios, and an echo on the lead. Shadowspine's mutter is made in code in `kit/voices.js`, which plays his laugh from two recordings in `assets/sounds/villain-laughs.js`: "Laugh 4" and "Laugh 7" from the "Evil Laughs" pack by Eldritch Grim on OpenGameArt (CC0, public domain), trimmed, evened out, and stored as small MP3s. If a browser can't play them, the old made-in-code laugh takes over.
- Shared pieces: `kit/runner.js`, `kit/jigsaw.js`, `kit/fuel-word.js`, `kit/side-hub.js`, `kit/groove.js`, `kit/voices.js`; T-Rexy, Nova, the glitch ship (now with a face), the memory pictures, the neon backgrounds, eight songs, the science word bank.

## Versions
| Version | Date | Page | What changed |
|---|---|---|---|
| v1 | 2026-10-17 | https://claude.ai/artifact/PJ8MRLvskRBh1zZxwKidph (archive) | First version. |
| v3 | 2026-10-17 | https://claude.ai/artifact/EgGFe2mgXPPY7S47QGoWNJ (home page) | Every memory piece catchable (checked in every play-test), missing pieces leave holes in the memory with a keep-going or run-again choice and a full-catch bonus, L and R through the story, hints only when stuck, and a real recorded villain laugh. |
| v2 | 2026-10-17 | https://claude.ai/artifact/Q71rK4DCGwZmRv5DLi8KRr (archive) | Easier runs that ramp up, double hop, Easy and Hard modes, no attempt counting, funnier opening with puns, upbeat music, NASA-inspired neon backgrounds, detailed memory pictures, a one-piece Shadowspine with an evil laugh, a question library, and the Zoomasaurus end clip. |

## Ideas for later
- Waiting on play-testing v3: whether Easy's first run feels right, whether the double hop is easy to find, whether ship mode feels controllable, whether kids find the secret pages, whether they choose to run portals again for the bonus, and whether hints come at the right time.
- The laugh pack has seven more laughs; any of them can replace or join the two in use.
- Per-player skill levels if friends share one Chromebook (today levels are per computer).
- More portals, a practice mode for each run, or a level editor so the kids can build their own runs.
