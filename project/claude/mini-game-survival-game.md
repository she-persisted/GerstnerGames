# Mini Game Survival (Child I's game)

**Spoiler warning:** this doc explains the mystery's twist. The kids asked to be surprised, so don't read the "Mystery" section out loud or reveal it in voice mode unless they ask for spoilers.

Home page (always the newest version): https://claude.ai/artifact/EgGFe2mgXPPY7S47QGoWNJ
QR card: `library/dist/mini-game-survival-qr.png` (T-Rexy mid-hop saying "Scan to play!"; no version number, so it stays good for every version)
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

## v4 changes Mom asked for (October 17, 2026)
- "Always run with checkpoints. It's not an option." Checkpoints are on in every mode, and the Checkpoints button is gone.
- "In hard mode they have to collect all puzzle pieces to progress."
- More feel in the runs: sparkle bursts, a small shake on crashes, and a "Perfect!" pop for well-timed hops.
- Unlockable looks for T-Rexy: catching every piece in a run earns hats and colors.
- Obstacles on the beat: jumps line up with the music, like Geometry Dash.

## v5 changes Mom asked for (October 17, 2026)
- Make T-Rexy cuter and a little more expressive: bigger shiny eyes and a moving brow, rosier blush, a head shine, new faces (blink, excited, determined, a sweat drop when worried), blinking, faces that react during runs, and a little squash and stretch when he hops and lands.

## v6 changes Mom asked for (October 17, 2026)
- "Find cute happy noises for the dinosaurs." (Mom downloaded the CC0 "80 CC0 creature SFX" pack by rubberduck from OpenGameArt and attached it.)
- "Add enough flexibility to play on a phone too."
- "At the crash pad, put the dino next to the spaceship, not in front of it. Show it looking crashed, then fix it as he finds bits."
- "Mix up the questions and facts so that it's new every time they play."

## v7 changes Mom asked for (October 18, 2026)
- "The space helmet doesn't fit the dinosaur's head."
- "The dino isn't in the cockpit."
- "Look across the graphics assets for fit."
- "Improve the cohesiveness of the drawing style for the game."
- "For visual interest add occasional shooting stars or something similar to the story screens. Kids need things to keep their attention."
- "The hints are blocking gameplay. Fix that immediately."

## v8 changes Mom asked for (October 18, 2026)
- "Let them get access to those [looks] faster."
- "Make sure that you don't show extra slots in the closet beyond what they're realistically going to be able to access in one game."
- Picked from three choices: every mini game finished unlocks a look, so all 12 can be found in one game.

## v9 changes Mom asked for (October 18, 2026)
- "Add a few more looks to the library. Specifically a scientist look, or a surfer look. A punk rock biker look."
- Built all three as whole outfits, so the closet has 15 looks.

## v10 changes Mom asked for (October 18, 2026)
- "Add a bonus level with a wavy floor that they can play that sits on the home screen."
- Design read back and picked from two choices: **Wave Rider** (hold to dive down the hills, let go to fly off the tops), a button on the title screen, open from the start, separate from the story, with its own neon sky with shooting stars, upbeat music, stars to catch, a best score saved on that computer, and no attempt counting.

## How it plays
- Title screen: pick Easy or Hard (click, or press E or H), then Play or Keep going, plus the high score board and a jukebox of the songs found so far. The crash pad's notebook can switch modes mid-game.
  - Easy: slower runs and smaller puzzles to begin with.
  - Hard: faster runs, bigger puzzles, runs score double, and every memory piece has to be caught to move on.
  - Both: checkpoints are always on.
- The Crash Pad: T-Rexy walks left and right (arrow keys or A and D, or click or tap), and jumps into the next glowing portal with Enter (or a tap on it). He stands beside his crashed ship. At first it's tilted, cracked, and smoking, with scrap around it; each part he finds fixes it a little more (less tilt, less smoke, fewer cracks, and its label counts the parts), and once all four parts and the paint are on, it floats and glows: "Your ship: ready to fly!". The side panel is his Clue Notebook, with **T-Rexy's closet**: every look he has unlocked (click one to put it on or take it off), then a "?" only for each look this game can still unlock (one per mini game not finished or skipped yet), with a count like "6 of 10". Shadowspine looms over the pad.
- Each of the four portals has the same four mini games, then a spaceship part and a song:
  1. **Portal run** (side-scroller): T-Rexy runs by himself. Space, Up, or click to hop (tiny!), and press again in the air for a double hop (he does a flip). Yellow bounce pads launch him high, pink portals turn him into a little ship (hold to fly up, let go to sink), green portals turn him back. Touch a spike or a wall and he goes back to the last checkpoint. Nothing counts attempts. Glowing memory pieces sit along the way, every one on the path that beats the run. Esc pauses.
     - **On the beat**: the countdown ticks in time with the portal's song, and the song starts on GO. Each obstacle's first hop lands on a beat, and the ground, pads, and pieces pulse with it. A hop pressed right on the beat over a spike, gap, or step pops "PERFECT!" (10 points, and a streak counter for perfect hops in a row). The music stops on a crash and picks up in time at the checkpoint.
     - **Feel**: catching a piece bursts into sparkles with a ring and bumps the counter, landings puff a little dust, and a crash shakes the screen a little (no shake or pulses with reduced motion).
     - Finishing the run (not skipping it) unlocks the next of T-Rexy's looks, with a New look card. In Hard, a portal run is finished once every piece is caught.
     - Caught every piece: a +200 bonus, and on to the jigsaw.
     - Some got away, in Easy: pick **Keep going** (Enter) or **Run it again** (A). Running it again is the same run, with the pieces already caught shown faint and still counted, so only the missing ones are left to grab.
     - Some got away, in Hard: only **Run it again** (Enter or A). The story can't move on, and R can't skip the run, until every piece is caught.
  2. **Memory jigsaw**: the memory pieces make a picture. Swap tiles (click two, or arrow keys and Enter). Helpers: Peek, and Fix one (also by tapping T-Rexy). Pieces that got away in the run leave glitchy "?" holes, the same share of the tiles as the pieces missed (9 of 12 caught means 3 holes in a 12-tile picture). Tiles that show a clue never become holes.
  3. **Glitch-locked clue word**: a hangman-style letter game made friendly. A hint, a fuel tank, and letter keys. Wrong letters burn fuel; Scan reveals a letter (also by tapping T-Rexy). Out of fuel, the word is shown and he types it to refuel. About 35 words per topic, so replays bring new ones.
  4. **Clue notebook**: a clue card (what he remembers, a science fact, and a fun bonus fact), and he types the clue line into his notebook. Each portal has 4 ways to tell the memory, 6 clue lines per typing level, 8 versions of the science fact, and 14 bonus facts (`games/mini-game-survival/questions.js`).
- Portals: Echo Rings (sound and music), Fern Moon (food and dinosaurs), Lantern Lab (light and shadows), Whirlpool Galaxy (space). Parts in that order: Thrusters, Wings, Glitch Core, Cockpit. Then he picks a paint job.
- The Shadow Gate: the final, longer run, with Shadowspine in the background. Its star shards are a bonus in both modes. Finishing it unlocks a look if any are left, which makes up for a skipped run.
- **T-Rexy's looks** (15, unlocked in this order): Space Helmet, Galaxy Purple, Rocket Backpack, Mad Scientist, Wizard Hat, Golden Scales, Surfer Dino, DJ Headphones, Super Cape, Ocean Blue, Punk Rock Biker, Glitch Crown, Party Hat, Bubblegum Pink, Star Shades. One hat, one back item, one color, and one outfit at a time. Since v8, every mini game finished (each portal's run, jigsaw, and clue word, the first time in a game) unlocks the next one and puts it on, with a New look card on its results; the Shadow Gate run unlocks one too. That's 13 a game, so since v9 a new player finds 13 looks in the first game and the last 2 in the next one (the closet starts at "0 of 13" with "More to find next game."). Skipping with R unlocks nothing.
- **Outfits** (since v9) are whole costumes: the **Mad Scientist** (a white lab coat with lapels and pens in the pocket, orange-rimmed safety goggles pushed up on his forehead, and a bubbling green potion in his tiny hand), the **Surfer Dino** (turquoise board shorts with yellow flowers, a pink and yellow flower lei, a white stripe of sunscreen on his snout, and a surfboard on his back), and the **Punk Rock Biker** (a studded black leather jacket with a zipper, a pink lightning patch, and a chain, plus a spiky pink mohawk). Tiny arms get tiny sleeves. A new outfit comes on whole (his hat and back item come off); after that they mix with everything: a hat shows instead of the goggles or mohawk, and a back item instead of the surfboard. They stay unlocked on that computer. They show everywhere he appears; his cap in the opening scene shows instead of a hat.
- Solve the mystery: four multiple-choice questions (keys 1 to 3), each with eight versions that test the same idea, with the answers in a new order every time. A wrong answer points to the clue that helps.
- **New every game**: every list in the question library is dealt like a shuffled deck kept on that computer, so a version only comes back after every other version in its list has had a turn, and never twice in a row. With 8 to 14 versions a list, kids get several games in a row with no repeats, on top of about 35 clue words a topic.
- **Dino noises**: T-Rexy chirps, coos, hums, and goes "ooh!", "wheee!", and "hm?" on happy, surprised, and thinking story lines and when he wins something (a right answer, a saved clue, a ship part, a new look, a full catch). Tapping him makes him chirp. Nova has a higher voice, and T-Rexy's family (Dad lowest, then Mom, then his little sister) cheers together when he gets home. No noises during runs, so the music stays clear.
- **Phones and tablets**: touch a screen and the game switches to touch mode. Tap to hop and to walk, tap a portal to jump in, tap letters and answers. Key badges hide, and hints say what to tap. Back and forward buttons in the scene's top corner do what L and R do (hidden during runs and jigsaws, so a stray tap can't skip). Typing a clue has an Open keyboard button that brings up the phone's keyboard. Upright phones get a run about as tall as it is wide with at least 15 tiles across; sideways phones put the scene and the side panel next to each other. A mouse click switches back to keyboard tips.
- **L and R** move back and forward through the story on every screen (the left and right arrow keys work too, except where those keys are already taken). L goes back to the story line before. R goes forward: it skips a run, finishes a jigsaw or a typed clue, picks the first choice, shows a mystery answer, or jumps into the next portal from the crash pad. Skipped parts earn no points, and going forward again skips mini games already finished. Typing screens use the arrow keys instead, because their letters are for typing; runs and jigsaws use only L and R. On the crash pad, R waits a moment, so typing ROAR still works.
- **Hints**: a "Hint:" bubble with the keys to press (or, on a touch screen, what to tap) appears only when someone seems stuck: after doing nothing on a screen for a while (9 seconds on the crash pad, 10 to 20 seconds elsewhere), after 3 wrong letters in a clue word (try the vowels), right away in a run after a crash with no key pressed yet, and after 2 crashes at the same obstacle (a tip for that obstacle: spikes, gaps, ledges, steps, bounce pads, the low ceiling, the ship, the secret path). Pressing anything hides it. Since v7 a hint never covers the play area: on story screens and the crash pad it's a slim banner across the top of the sky; in a run it sits in the floor under the track and clears after 4.5 seconds; in a jigsaw it sits in a strip under the board; on an upright phone, run hints sit under the counters at the top. The play-test measures this.
- **Sky surprises** on the story screens (and the title): every 3.5 to 7 seconds something crosses the sky behind the characters: a shooting star (most often), a short meteor shower, a slow comet with a two-color tail, a satellite with a softly pulsing light, a tiny rocket trailing puffs, or a star that swells into a sparkle. Each new place gets one within about a second. Nothing flashes, and with reduced motion on there are none.
- **T-Rexy in the cockpit**: when he flies (ship mode in runs, and the end ride), he sits in the cockpit: head and shoulders behind the glass, a seat behind him and a glowing dashboard in front, in his color, his outfit, and his hat if it fits under the glass (Space Helmet, Glitch Crown, DJ Headphones, Star Shades, and the scientist's goggles; the Wizard Hat, Party Hat, and mohawk wait in his closet, and so do the surfboard and the potion). On the crash pad the cockpit is empty, with the seat waiting for him.
- **Bonus level: Wave Rider** (since v10): a "Bonus level: Wave Rider" button on the title screen (or press B), open from the start and separate from the story. T-Rexy rides a little neon board over rolling hills under a neon sunset, with shooting stars and friends crossing the sky. Hold Space (or Down, or a finger on the screen) and he gets heavy: he sticks to the hills and dives down them to pick up speed. Let go and he gets light: a fast climb launches him off the top of a wave. Landing along a downhill slope is a smooth landing (smooth landings in a row make a combo); landing nose-first into an uphill is a "BONK!" that slows him down. Stars float along the best flying path and wait in some valleys. 60 seconds, nothing to crash into. Points: 10 a star, 25 times the combo for each smooth landing (up to 5 times), and 30 a second for big air (a flight of 0.8 seconds or more). The results card shows points, stars, the biggest air, smooth landings, the best combo, and the best score on that computer (with "New best!"), then Ride again (Enter) or Title (T). Esc pauses, and T on the pause screen goes back to the title. Its song, "Wave Rider", joins the jukebox the first time. Nothing it does touches the story's save or the high score board.
- Ending, then the end clip: the ship blinks awake, T-Rexy names him Zoomasaurus, the family welcomes him, and everybody rides him in loop-de-loops across the sky, T-Rexy flying from the cockpit and his family riding on the hull behind him, the same size as he is (that ride keeps playing behind the score card). Then the score card, a name for the high score board, the mode, and levels reached.

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
The Wave Rider bonus level keeps its own score and best score (see How it plays); it isn't part of the story's score or the high score board.

Mistakes never cost points. Runs 300 + 20 per memory piece (the Shadow Gate 500 + 25 per star shard) + 10 per perfect hop, doubled in Hard mode, plus 200 for catching every piece in a run; running a portal again never lowers its points. 300 per jigsaw (none if every piece left was already home); 300 per clue word; 150 per mystery answer; plus 20 x typing words per minute (capped at 150 wpm), 5 x typing accuracy, and 250 per secret page. Anything skipped with R earns nothing. Shared board for people who can edit the page; everyone else's scores save on their own computer.

## Under the hood
- Every run is built from chunks (`content/levels/runner-chunks.js`), and a solver plays each chunk before it's used, so every level is beatable at every speed. The hidden box route is proven reachable too.
- Memory pieces are placed on the solved route: only where T-Rexy is on the ground (or a block top) in cube mode, never inside a ship tunnel or the secret section, and never touching a block, spike, pad, or portal. `Kit.runner.sim.checkPieces` replays the winning route and the secret route and reports any piece either misses. The play-test builds 90 runs across levels 1 to 6 and checks every piece, and its full playthrough checks every run caught every piece (with test runs that miss pieces on purpose to check the holes and the run-again choice).
- Each game has a random seed, so a run's layout is the same on a second try, and the jigsaw holes stay on the same tiles after a reload.
- On the beat: the run generator gets the song's beat length and nudges each chunk forward so the spot where T-Rexy should hop for its first obstacle (worked out from the hop physics: peak over the middle of a spike or a row of spikes, peak at a step's edge, leave at a gap's edge, touch a pad) lands exactly on a beat. The play-test builds 90 runs and checks that a hop pressed exactly on the beat clears every chunk a single hop can clear. `kit/groove.js` can restart a song at any point and hush it, and the runner tells the game whenever its clock starts, stops, or jumps.
- Flashing is gentle: a thin stripe glitches at most about once a second for a tenth of a second; with "reduce motion" on there are no glitches.
- Backgrounds (`assets/worlds/glitch-nebula.js`) are neon takes on NASA Hubble and Webb pictures, drawn by code: the Cosmic Cliffs (crash pad), the Southern Ring Nebula (Echo Rings), the Pillars of Creation and the fern moon (Fern Moon), a Wolf-Rayet star in its clumpy shell (Lantern Lab), the Whirlpool Galaxy and its companion (Whirlpool Galaxy), the Horsehead Nebula (Shadow Gate), and the Milky Way with Andromeda and a crescent moon (Fern Valley at night). Every sky also has noise-made gas and dust, deep-field galaxies, stars with Webb's eight-point spikes, and drifting face-on, tilted, and edge-on galaxies.
- Music (`kit/groove.js`): upbeat sixteenth-note chiptune with verses and choruses, claps, open hats, arpeggios, and an echo on the lead. Shadowspine's mutter is made in code in `kit/voices.js`, which plays his laugh from two recordings in `assets/sounds/villain-laughs.js`: "Laugh 4" and "Laugh 7" from the "Evil Laughs" pack by Eldritch Grim on OpenGameArt (CC0, public domain), trimmed, evened out, and stored as small MP3s. If a browser can't play them, the old made-in-code laugh takes over.
- Dino noises (`assets/sounds/dino-chirps.js`): six "cute" sounds from the "80 CC0 creature SFX" pack by rubberduck on OpenGameArt (CC0), trimmed, evened out, and stored as small MP3s: chirp, ooh, hum, wee, huh, and coo, each tagged happy, excited, or curious. `Kit.voices.chirp` plays one (never the same twice in a row) and speeds it up or slows it down for each dinosaur's voice.
- Touch support lives in `games/mini-game-survival/touch.js`. The play-test plays on a phone-sized touch screen too: touch mode, no sideways scrolling, the back and forward buttons, tap to walk and hop, 15 tiles across a run, and typing a whole clue with the phone keyboard with every letter counted once.
- Drawing style (`assets/style/ink.js`, since v7): one set of rules and helpers that T-Rexy, his family, Nova, the ship, and the looks all draw with. Living things are outlined in their own darkest color, gear and machines in the shared dark ink, and glowing things (portals, pieces, galaxies) have no outline. Flat colors with one shadow tone (bottom and back) and one shine (top front). Every eye is big and white with a dark pupil, a soft purple iris, and two highlights. Glass is a pale see-through wash with an ink outline, a white shine arc, and a glint. Sparkles are four-point and yellow with an ink edge. Nova's lines are a little thicker for her size, so she matches T-Rexy on screen.
- Fit (since v7): the space helmet is a fishbowl sized to his whole head, closed by a collar at his neck. `Kit.art.trexy.headBox()` is the box around his head and hat, used for every portrait and closet button, and `pilot()` hands the ship his markup and that box. The ship scales his head to fill its canopy, sits it on the seat, and clips it to the glass, so nothing pokes out. The play-test measures all of it: the helmet holds his head in every face and pose, every picture of him holds all of him in every look, pose, and direction, and in every cockpit and pilot hat at least 92% of his head is inside the glass (it measures 99%).
- Sky surprises live in `kit/sky-events.js` (any game can use them). The nebula draws them in front of each world's landmark and behind Shadowspine. The play-test checks that every kind draws and none appears with reduced motion.
- The sky strip used to show a faint vertical seam where it repeated (easiest to see at sunrise in Fern Valley). Every noise layer now repeats a whole number of times across the strip, so its ends match.
- Wave Rider lives in `kit/wave-rider.js` (any game can use it). The floor is a row of hilltops and valleys joined by smooth cosine curves, wide enough that a flight off one hilltop can come down on its far side. On the floor the slope speeds him up or slows him down (holding pulls harder both ways); he leaves the floor where it curves away faster than he can be pulled along it, and never while it's still steep, so a flight tops out a few tiles up. A built-in rider (hold going down, let go going up, and in the air whichever lands closer to the slope's angle) plans each ride and puts the stars along its flights, so every star can be caught. Its hills get a little taller and a few get narrower as a player's landings get smoother (waves 1 to 3, kept on that computer). The play-test checks the physics for every level (every planned star catchable, never sinking into the floor, smooth landings beat bonks, flights stay on screen, diving speeds him up, the same seed gives the same ride), then rides it with a pause, a sped-up finish, the results, ride again, and back to the title.
- Shared pieces: `kit/runner.js`, `kit/wave-rider.js`, `kit/jigsaw.js`, `kit/fuel-word.js`, `kit/side-hub.js`, `kit/groove.js`, `kit/voices.js`, `kit/sky-events.js`; the drawing style; T-Rexy, Nova, the glitch ship (with a face and a cockpit cabin), the memory pictures, the neon backgrounds (with a neon sunset for Wave Rider), nine songs, the science word bank.

## Versions
| Version | Date | Page | What changed |
|---|---|---|---|
| v1 | 2026-10-17 | https://claude.ai/artifact/PJ8MRLvskRBh1zZxwKidph (archive) | First version. |
| v10 | 2026-10-18 | https://claude.ai/artifact/EgGFe2mgXPPY7S47QGoWNJ (home page) | The Wave Rider bonus level on the title screen: ride a board over rolling neon hills, hold to dive and let go to fly, catch stars, land smooth for combos, 60 seconds, best score kept; its own song and a neon sunset sky. |
| v9 | 2026-10-18 | https://claude.ai/artifact/UPRR4Dui3fzWotug83T6qQ (archive) | Three new outfits, 15 looks in all: the Mad Scientist, the Surfer Dino, and the Punk Rock Biker; outfits mix with every hat, color, and back item and ride in the cockpit; a new player finds 13 in the first game and 2 in the next. |
| v8 | 2026-10-18 | https://claude.ai/artifact/NXZgUCv8hqzvAenwzgbH2k (archive) | Looks come much faster: every finished run, jigsaw, and clue word unlocks the next one, so all 12 fit in one game (the Shadow Gate makes up for a skipped run); the closet only shows the empty slots that can still be filled this game. |
| v7 | 2026-10-18 | https://claude.ai/artifact/SXRFA56G3LR1pbmY3usGYs (archive) | Hints moved off the play area (top of the sky, the floor under a run, a strip under the jigsaw); a space helmet that fits T-Rexy's whole head; T-Rexy sitting inside the cockpit in his color and hat; every look checked for fit; one drawing style across the game (eyes, ink lines, shading, glass, sparkles); shooting stars, comets, satellites, and tiny rockets crossing the story sky; the sky seam fixed. |
| v6 | 2026-10-17 | https://claude.ai/artifact/9hyKGAdHeH6CQKJo1t5Tay (archive) | Cute recorded dino noises (each dinosaur in its own voice), phone and tablet play, a crashed ship beside T-Rexy that gets fixed part by part, and a much bigger question library dealt so every game is new. |
| v5 | 2026-10-17 | https://claude.ai/artifact/SMosBkiXuSCP4u4ynQ9NGn (archive) | A cuter, more expressive T-Rexy: big shiny eyes, a mood brow, new faces, blinking, reactions in runs, squash and stretch. |
| v4 | 2026-10-17 | https://claude.ai/artifact/CqvjvxnbGtkFK8WTWmjDGj (archive) | Checkpoints always on; Hard mode needs every memory piece; obstacles on the beat with music in time; PERFECT hops; sparkles, dust, and crash shake; 12 unlockable looks and T-Rexy's closet. |
| v3 | 2026-10-17 | https://claude.ai/artifact/3YVkf9GKU7fJYfuCKcc3QD (archive) | Every memory piece catchable (checked in every play-test), missing pieces leave holes in the memory with a keep-going or run-again choice and a full-catch bonus, L and R through the story, hints only when stuck, and a real recorded villain laugh. |
| v2 | 2026-10-17 | https://claude.ai/artifact/Q71rK4DCGwZmRv5DLi8KRr (archive) | Easier runs that ramp up, double hop, Easy and Hard modes, no attempt counting, funnier opening with puns, upbeat music, NASA-inspired neon backgrounds, detailed memory pictures, a one-piece Shadowspine with an evil laugh, a question library, and the Zoomasaurus end clip. |

## Ideas for later
- Waiting on play-testing v10: whether kids find the bonus button and get the hold-to-dive, let-go-to-fly idea from the tip, whether 60 seconds feels right, and whether they chase their best score. Ideas if they love it: more bonus levels on the title screen, a ghost of the best ride to race, or unlocking a look for a new best.
- Waiting on play-testing v9: which outfit the kids pick, whether outfits get mixed with hats, and whether a look after every mini game still feels special. More looks are easy to add: draw it in `assets/characters/trexy.js` (an outfit is its clothes, plus an optional head piece, back item, and hand prop), then add it to `LOOK_ORDER` in `games/mini-game-survival/state.js`.
- Waiting on play-testing v7: whether the sky surprises hold attention without pulling eyes off the story text (they're easy to make rarer), and whether kids spot T-Rexy in the cockpit during ship runs.
- Waiting on play-testing v6: whether the dino noises are cute or too much (they're easy to tone down), whether phone play feels good upright or sideways, and whether kids notice the ship getting fixed.
- Waiting on play-testing v4: whether Easy's first run feels right, whether the double hop is easy to find, whether ship mode feels controllable, whether kids find the secret pages, whether Hard's every-piece rule feels fair or frustrating, whether they notice the beat and chase PERFECT hops, which looks they pick, and whether hints come at the right time.
- Not chosen yet from the fun ideas: pieces that play the lullaby's notes, racing a friend's ghost, a Murdle-style logic grid for the mystery, and a build-your-own run editor.
- The laugh pack has seven more laughs; any of them can replace or join the two in use. The creature pack has four more "cute" sounds (cute_03, 06, 07, 10) that sounded flatter or sadder in a pitch check, plus burbles and eating sounds that could fit a snack moment.
- Per-player skill levels if friends share one Chromebook (today levels are per computer).
- More portals, a practice mode for each run, or a level editor so the kids can build their own runs.
