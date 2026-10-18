# Starward (Child I's game)

Source: GitHub `she-persisted/GerstnerGames`, `library/games/starward/` (see claude/game-library.md)
QR card: `library/dist/starward-qr.png` (the Keeper with his chest flame lit; no version number, so it stays good for every version)

## Versions
- **Home page, always the newest version:** https://claude.ai/artifact/Jq8tRWGkoLgdJZAMwcMYtw. Its link, QR card and high scores carry across updates; each version it replaces is saved as its own archive page first.
- v6 (2026-10-17): on the home page. Fewer clicks and clearer Lumina digs: a one-line tip on every dig; after a right answer a big space-themed cheer shows (the robot says it on the map) and the game moves on by itself with no Next button; safe landings and the brave words move on by themselves too; tapping Sunny (on the stage or in the friends bar) sniffs for a clue, and tapping Rigel or Professor Kepler uses their hints.
- v5 (2026-10-11): https://claude.ai/artifact/X1f6WeveqRtYrnDTKFzuWY (archive page, saved when v6 shipped). Same game as v4 with no personal names; the title screen says "An original space adventure".
- v4 (2026-10-11): https://claude.ai/artifact/U9Z4PvGaEpPGf7jinpaJhV. Rebuilt from the Game Library as separate, reusable files. Adds adaptive difficulty for typing, math, and word puzzles; questions are chosen when they appear so they match his current level.
- v3 (2026-10-11): https://claude.ai/artifact/Ny2qfyuP9oAo7Vr9VgYEcg (current version of that page). Walkable Lumina map, three challenges per rocket part, fresh questions every game, fewer instructions. Source kept as `games/starward/legacy/v3.html`.
- v2 (2026-10-10): same page as v3, in its version history. First Starward: new names and story, rocket parts, falling-word flights, fill-in-the-blank puzzles, songs, high scores.
- The Inner Flame (v1) is its own game: https://claude.ai/artifact/FAgoyVHV7dqGaY856XeSk6

## Story
- Home world: Lumina, lit by the Everlight. The robot is its Keeper (player names him; ideas Sol, Orion, Lumen, Sprocket).
- He was calm while the Everlight burned. A starstorm put it out, everyone fell asleep, and only a tiny spark in his chest kept him awake. He is nervous because it was lost, and his courage (and the spark) grows until he carries the Everlight home.
- Worlds: Nimbus (cloud world), Glacia (ice), Meridian (stony stargazer world), Corona Nebula (fiery tower where the Everlight waits).
- Friends: Sunny the puppy ("Oh! We found a puppy!", fluffy black, white and brown, no breed name used), Rigel the penguin, Professor Kepler the mossy rock with glasses and a telescope.

## Gameplay (v6)
- Lumina map: a dark, top-down map he walks around with the arrow keys, WASD, or by clicking. A circle of light from the robot's chest spark grows with courage. Gold star beacons with 3 progress dots mark the 4 part sites (Comet Crater, Old Observatory, Glowworm Grove, Sleepy Village); found sites get a green check and stay lit.
- Each rocket part takes 3 challenges: a word puzzle, a math puzzle, then a dig (type 3 words on dirt clumps; a one-line tip says what to do). Then he picks the part's style. Once all 4 are found, the launch pad glows and he walks back to build and paint. No part upgrades after leaving Lumina.
- Flights: 3, 2, 1, liftoff, then words fall like shooting stars. Type each before it falls away; missed words are not retyped. 85% letter accuracy to land, otherwise the leg is flown again (about 12% slower each retry, up to 3 times).
- Puzzles (20 per game): riddles (36), fill-in-the-blanks (46), Earth questions (21), space riddles (17), word scrambles (48), all tagged easy, medium, or hard, plus generated ones that are new every game: word problems, missing numbers, place value, rounding, number patterns, planet order, odd one out. Recent questions are remembered on that computer and avoided.
- Adaptive difficulty: typing speed level 1 to 10 (starts at 5), math level 1 to 5 (about 2nd to 4th grade, starts at 3), word puzzle level 1 to 3 (starts at 2). Two clean answers in a row (first try, no hints) raise a level; two answers in a row that took 2 or more tries lower it; "Show me" lowers it right away. A flight at 95% or better with nearly every word caught speeds the stars up; a failed flight slows them. Levels are remembered on that computer. A "level up!" toast appears when a level rises; drops are silent. The ending shows all three levels.
- Minimal on-screen instructions: beacons, progress dots, a gold outline on the next thing to type, an arrow-key hint until he first moves, helper buttons that pulse after 2 misses.
- Helpers: Scan (letter count), Sniff (Sunny's clue), Peek (Rigel reveals a letter), Ponder (Professor Kepler's second clue); Show me after 3 misses. Tapping a friend on the stage or in the friends bar uses that friend's helper.
- Right answers: a big cheer ("Stellar!", "Beep boop: CORRECT!", "Houston, we have a genius!" and more), then the game moves on by itself. Safe landings and the brave words also move on by themselves.
- Robot faces: worried at low courage, smiling once brave, plus happy, surprised, and thinking reactions.
- Music: each world has its own song; songs are collected into a jukebox on the home screen.
- Arcade high scores: puzzle points (100 easy, 140 medium, 180 hard; 25 if the answer was shown) + 20 × words per minute + 5 × accuracy percent. Each version's page has its own board. Shared board for people who can edit the page; everyone else's scores save on their own computer.

## Ideas for later
- Rhythm-typing bonus round (words drop on the beat) was discussed but not built.
- Per-player skill levels if friends share one Chromebook (today levels are per computer).
