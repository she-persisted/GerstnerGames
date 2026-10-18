# Game Design Guide for Child I

Read this before designing or building any new game in this project. It records what Mom and Child I asked for while making The Inner Flame and Starward (October 10 to 11, 2026) and Mini Game Survival (October 17, 2026), so new games start from here instead of relearning it. All game source lives in the Game Library, in the GitHub repo she-persisted/GerstnerGames; see claude/game-library.md.

Tags after each item:
- [asked] Mom or Child I requested or approved it directly.
- [built] Claude's choice. They accepted it but never commented on it specifically.
- [observed] Something Claude noticed during the sessions.
- [limit] A platform constraint, not a preference.

## Who the games are for
What Claude has learned about Child I himself (what he knows, how he plays, play-test feedback, session notes) lives in the project doc claude/child-i-notes.md, never in this repo. [asked]
- Child I's birth month and school grade are in the claude.ai project doc claude/child-i-profile.md, never in this repo. Work out his current age and grade from that instead of assuming. [asked]
- Aim every game at Child I's age group and his friends': right now that means third and fourth graders, about 8 to 10 years old. Reading level, vocabulary, math, and difficulty should all fit that age. [asked]
- He likes building rockets and he likes music. [asked]
- He plays on his Chromebook. Every game should build typing skills. [asked]
- Friends play too, and the games should let them compete. [asked]
- Friends help design, too. Mini Game Survival was designed with Child I and two friends for grades 2 through 6, so its adaptive levels reach lower and higher than Starward's. [asked]

## How Mom likes to work
- Designing happens out loud in voice mode, with Claude asking Child I one question at a time. Building happens in text mode. [asked]
- When friends design together, Mom points to a kid for each question. When a question invites it, every kid adds an idea (for Mini Game Survival, each of the three kids invented one mini game). [asked]
- When the kids say "surprise us" (for example, the mystery's twist), don't ask for the answer. Build it, keep it out of the conversation, and put a spoiler warning on the game doc. [asked]
- For learning content, quiz interactively and make it fun instead of lecturing. [asked]
- Before building, read the full design list back and get a yes. [asked]
- Changes arrive in batches. Restate each batch as a numbered list, test each item, and report back against the list. [observed]
- Each game has one permanent home page that always runs the newest version, so the link, the QR card and the high scores carry across updates. Before an update, the version it was running is saved as its own archive page and left untouched, so every earlier version stays playable. This replaced the earlier "every version is a new page" rule on 2026-10-11, starting with Starward v5. [asked] Starward v2 to v4 each have their own older pages.
- Keep every game's code, art, music, and other assets in the Game Library as separate, readable, reusable files, so any game can be changed later from a new chat. Build games from the library; never edit a built page directly. [asked]
- Keep one doc per game in claude/ that lists every version's link and what changed in it. [built]
- The private GitHub repo she-persisted/GerstnerGames is the source for code and game docs, and the only place they change. Pages on claude.ai are deployed copies. After every change, commit and push without asking. [asked]
- Publishing a new game version doesn't need her OK, since it never changes a page Child I already plays. [built]
- Voice transcription garbles names: "Starward" came through as "Star Wars" and "Starboard", and "Ashlund" as "Ashland". Confirm the spelling of every name in text before building. [observed]
- Voice mode in this project can't save files or build games. Design notes only persist when text mode writes them to a project doc. [observed]

## Story and names
- Every game needs a reason: a short backstory that explains the goal. [asked]
- Feelings have to make sense. The robot is nervous because his world's light went out, not because he's a nervous person, and getting the light back restores him. [asked]
- Names should be uplifting and lean on astronomy. She rejected gloomy names ("Emberfall sounds like a downer") and heavy mythology ("too heavy into the Norse thing"). [asked]
- Child I's own ideas come first. He came up with the tall, scared robot hero who starts alone and gains friends who help, plus a magic dog. [asked]
- The dog looks like a fluffy Bernedoodle. Call it a puppy and never name the breed. [asked]
- No copyrighted characters. When she asked for a robot that looks like it's from Star Wars, Claude made an original robot instead. [limit]
- Mysteries have to hang together: every clue points at one answer, and kids can solve it from what they collected. Mini Game Survival gives four clues (each with a real science fact), then asks four questions before the reveal. [asked]
- Easter eggs should add depth to the story, not only jokes: secret diary pages that explain the villain's plan, a hidden word to type, footprints and a whispered glitch message that hint at the twist. [asked]
- A villain can turn out to be a friend when the reason makes sense: Shadowspine was a tiny, lonely, scared baby Spinosaurus making a giant shadow. [built]
- Keep the opening friendly and funny, not lonely and grim. Mom asked for "a little bit more friendliness in the upfront story, more amusing" (Mini Game Survival v2). [asked]
- Fold dinosaur and space puns all through the story text. [asked] For example: dino-snore, dino-MITE, ROAR-some, STAR-ving, Milky WOOZY, "It's not rocket science... oh wait, it IS rocket science!" Keep every clue line plain, so puns never hide a clue. [built]
- End with a fun clip after the main ending. Mom asked for one where the ship comes alive, becomes friends with the family, and they ride him whenever they want. [asked] In Mini Game Survival, T-Rexy names the ship Zoomasaurus, and the ride keeps looping behind the score card. [built]

## Gameplay
- Difficulty adapts to how he plays: harder when he's doing well, easier when he struggles. [asked] In Starward v4, typing speed, math, and word puzzles each have their own level. Two clean answers in a row raise a level, two hard-won answers or one "Show me" lower it, and questions are picked when they appear so they match the current level. [built]
- Every playthrough must be different. [asked] Starward does this with large question banks, freshly generated math problems, and a list of questions already seen on that computer so they don't repeat. [built]
- Give every challenge a library of extra questions, so the game varies as the kids replay it. [asked] Mini Game Survival v2 keeps several versions of each mystery question, clue line, and science fact, plus bonus facts and about 35 clue words a topic, and picks ones that computer hasn't seen lately. [built]
- Questions and facts should be new every time they play. [asked] Mini Game Survival v6 has 8 versions of each mystery question, 6 clue lines per typing level, 8 science facts and 14 bonus facts per portal, and 4 ways to tell each memory, and deals every list like a shuffled deck saved on that computer: nothing comes back until every other version has had a turn, and never twice in a row. Every version of a mystery question tests the same idea, and every fact is checked for accuracy. [built]
- Mix puzzle types. She asked for riddles plus fill-in-the-blank sentences. [asked] Claude added word scrambles, math word problems, missing numbers, place value, rounding, number patterns, planet order, and odd one out. [built]
- A game can trade typing races for other mini games. For Mini Game Survival the kids asked for no typing games, and to type in the clues they find instead. Typing practice stays (each clue is typed into a notebook), next to obstacle runs, memory jigsaws, and a letter-guessing game. [asked]
- Obstacle runs like Geometry Dash: the hero runs by himself, hops, bounces on pads, flies a little ship, and touching a spike sends him back. [asked] Every level is checked by a solver before it's used, so it can always be beaten. [built]
- Checkpoints are always on, in every mode: "It's not an option." [asked] A crash sends T-Rexy back to the last checkpoint he passed, and there's no Checkpoints button. [built]
- Runs must start easy. Mom found v1's runs "far too hard": the first run should be easier, and runs should get harder as the game goes on. [asked] Give a double jump in the air. [asked] Mini Game Survival v2 starts at a slower level with lots of flat ground between obstacles and no ship tunnel, then ramps up portal by portal, with spikes that are kinder than they look and a quick tap that always counts. [built]
- Let players pick Easy or Hard mode. [asked] Easy: slower runs and smaller puzzles. Hard: faster runs and bigger puzzles, runs score double, and players have to collect every memory piece to move on. [asked] In Hard mode, a portal run with pieces missing only offers Run it again, and R can't skip it. The Shadow Gate's star shards stay a bonus in both modes. [built] Each mode keeps its own adaptive levels, so friends sharing a computer don't change each other's. [built]
- Every collectible in a run must be catchable: on the path that beats the run, not up where no hop reaches. Mom found memory pieces in v2 that couldn't be collected. [asked] Pieces sit on the ground or on a block top along the solved route (and the secret route too), and the play-test builds 90 runs at every level and checks every piece in every run, plus every piece in its full playthrough. [built]
- What you collect has to matter. "If we only got 9 pieces of 12 needed, we shouldn't have all of that memory." [asked] In Mini Game Survival v3, pieces that got away leave glitchy holes in the memory jigsaw (never on a clue tile). After a run with pieces missing, the player picks: keep going without them, or run it again to catch the rest for a bonus. [asked] The second try is the very same run, pieces already caught stay caught, a full catch adds 200 points, and a second try never lowers the score. [built]
- Runs should feel good: sparkle bursts and a ring when a piece is caught, a puff of dust on landing, a small screen shake on a crash, and a "PERFECT!" pop for a hop timed right. [asked] Mini Game Survival v4 does all of these; the shake and the pulses are off when the computer asks for reduced motion. [built]
- Obstacles on the beat, like Geometry Dash. [asked] In Mini Game Survival v4, each obstacle's first hop lands on a beat of that portal's song, and the play-test checks that a hop right on the beat clears it. The countdown ticks in time, the song starts on GO, stops on a crash, and picks up at the checkpoint in time with the run. The ground, pads, and pieces pulse gently on each beat (at most 2.6 a second, under the 3-flashes-a-second limit). A hop pressed within about 0.09 seconds of a beat over danger is a "PERFECT!" worth 10 points. [built]
- Unlockable looks for the hero, earned by catching every piece in a run. [asked] Mini Game Survival v4 has 12 for T-Rexy: hats (space helmet, wizard hat, DJ headphones, glitch crown, party hat, star shades), a rocket backpack and a super cape, and four colors. Each first full catch of a run unlocks the next one and puts it on; they stay unlocked on that computer for every game after, and T-Rexy's closet on the crash pad changes what he wears. A story accessory (his cap at the start) shows instead of a hat. [built]
- L and R always move back and forward through the story. [asked] In Mini Game Survival v3, L goes back a story line, and R goes forward on every screen: it skips a run, finishes a jigsaw or a clue, picks the first choice, or shows a mystery answer. Skipped parts earn no points. Going forward again skips mini games already finished. Typing screens use the arrow keys for this instead (their letters are for typing), and runs and jigsaws use only L and R (their arrow keys are taken). [built]
- Give hints only when they're needed, and show the buttons to press, like "Hint: Press Space, Up, or click to hop!" [asked] Mini Game Survival v3 shows a hint after a player does nothing on a screen for a while (9 to 20 seconds, depending on the screen), after 3 wrong letters in a word, right away in a run if they crash without pressing anything, and after 2 crashes at the same obstacle (a tip for that obstacle). Pressing anything hides it. [built]
- Don't keep track of failed attempts in the mini games. [asked] No attempt counters, and crashes, wrong letters, extra swaps, and wrong answers never cost points and are never saved. Adaptive difficulty still uses them privately for that one result. [built]
- Letter-guessing games are kind: wrong letters burn fuel cells instead of drawing a hangman, and running out shows the word to type. [built]
- Puzzles should match the game's world. For a space game that means space, robotics, and science. [asked]
- Rewards take effort. He has to explore and solve puzzles to earn each item, and each rocket part takes three challenges, not one. [asked]
- Upgrades come only from the home area. Out in the wider world he collects something else instead (songs, in Starward). [asked]
- Exploring should be visual: he walks his character around a map instead of clicking a list of places. [asked]
- Keep instructions to a minimum and make the game intuitive. Story text is fine, but explanations of what to do next are not. [asked] Starward replaces instructions with visual cues: glowing markers, progress dots, a highlight on the next thing to type, and hint buttons that pulse after two misses. [built]
- Exception: when kids can't tell what to do, give one short line of instructions on that screen. Kids playing Starward didn't know what to do at the Lumina dig (typing the words on the dirt), so it now says what to do. [asked] Keep it to one line, and a little funny: "Type the words to dig up the part. Your keyboard is the shovel!" [built]
- Reduce clicks. After a right answer, cheer, then move on by itself; never make him press Next. [asked] Starward v6 shows a big cheer for 1.7 seconds after a puzzle (longer if it shows a spelling), auto-advances after a safe landing (2.6 s) and the brave words, and the robot says the cheer on the Lumina map. Story lines and choices (part style, paint) still wait for him. [built]
- Typing rounds are timed and animated. Words fall or appear, and he types them before they're gone. Missed words don't have to be retyped. He passes at 85% accuracy and redoes the round if he falls short. [asked]
- Helpers make sure he never stays stuck. [asked] After three wrong answers, a "Show me" button appears, and he types the answer to move on. [built]
- Kids can tap the dog to sniff for a hint. [asked] In Starward v6, tapping any friend on the stage or in the friends bar during a puzzle uses that friend's helper (Sunny sniffs, Rigel peeks, Professor Kepler ponders); outside a puzzle the friend just hops and Sunny woofs. Sunny tells him "Tap me when you're stuck!" when she joins, and a friend hops when their hint button starts pulsing. [built]
- Give positive reinforcement through the hero's face: happy and surprised reactions to what he does. [asked]
- Tap the hero for help when there are no friends to tap: in Mini Game Survival, tapping T-Rexy uses Scan or Fix one. [built]
- Building and customizing: he picks the style of each rocket part and the paint color. [built]
- Show the thing being built getting fixed. [asked] Mini Game Survival v6's ship sits crashed on the crash pad (tilted, cracked, smoking, scrap all around) and looks a little less broken with each part he finds, until it floats and glows. [built]
- Put the hero next to an important object, not in front of it. [asked] On Mini Game Survival's crash pad, T-Rexy starts beside his ship. [built]
- Games should play on a phone too. [asked] Mini Game Survival v6 switches to touch mode on a touch screen: tap to hop, walk, and pick; hints say what to tap; back and forward buttons stand in for L and R; typing opens the phone's keyboard; and the layout fits upright and sideways phones with no sideways scrolling. Keyboard play is unchanged. [built]

## Music and sound
- Each place has its own background music. [asked]
- Songs are collectibles, kept in a jukebox on the home screen. [asked]
- She rejected the idea of correct answers adding notes to a melody. [asked]
- Music can match the game's energy: Mini Game Survival's songs started out hardcore (fast, a kick on every beat). [asked] Its mystery hides in the music: each portal's song carries a piece of the weird tune. [built]
- Make the music fun and upbeat. [asked] Mini Game Survival v2's songs are happy dance chiptune: major keys (the Shadow Gate is a bouncy minor), bouncing bass, claps, sparkly arpeggios, and a verse and chorus (`kit/groove.js`). [built]
- Villains get a voice. [asked] Shadowspine's evil laugh was made in code at first, and Mom called it "awful": use a real recording of a silly villain laugh instead. [asked] Mini Game Survival v3 takes turns between two high, cackly laughs from the CC0 "Evil Laughs" pack by Eldritch Grim (OpenGameArt), saved in `assets/sounds/villain-laughs.js`. A high laugh is also a quiet hint that the villain is small. [built]
- Cute characters get cute voices. [asked] "Find cute happy noises for the dinosaurs." Mini Game Survival v6 uses six "cute" sounds from the CC0 "80 CC0 creature SFX" pack by rubberduck (OpenGameArt), saved in `assets/sounds/dino-chirps.js`: chirps, coos, a hum, "ooh!", "wheee!", and "hm?". Each dinosaur gets its own pitch (smaller is higher), they play on happy story lines and wins, and never during runs, so the music stays clear. [built]
- Voices made in code sound robotic. For voices, use real recordings that are CC0 (public domain), credit the author anyway, and keep each clip short and small. [asked] Music and other sound effects are still generated in code, so nothing is copyrighted. [built]
- This workspace can't download from most websites (OpenGameArt included). Mom downloads the file and attaches it to the chat. [limit]
- Music starts after the first click or key press, because browsers block sound until then. [limit]

## Art
- The hero should stand out: cute and cartoony against the world. Mini Game Survival puts a cute green T-Rex in a glitchy, bright, flashing neon nebula, and the villain is a solid black silhouette. [asked]
- Make the hero cute and expressive. [asked] In Mini Game Survival v5, T-Rexy has big shiny eyes (two highlights), a little brow that shows his mood, rosier blush, and a soft shine on his head. He has ten faces (smile, blink, happy, excited with star-sparkle eyes, determined, worried with a sweat drop, surprised, thinking, dizzy, sleepy), blinks every few seconds, looks determined in the air during runs, beams when he catches a piece or hops on the beat, and squashes and stretches as he hops and lands (not with reduced motion). [built]
- Keep flashing gentle: no more than about one glitch a second, never more than three flashes a second, and none at all when the computer asks for reduced motion. [limit]
- Draw a silhouette villain as one solid, cohesive animal shape, not separate blobs, and give it a small animation (breathing, sway, a jaw that opens when it laughs or talks). [asked]
- Puzzle pictures should be detailed: lots of little things to spot, which also makes jigsaw pieces easier to tell apart. [asked]
- Space backgrounds: use real NASA pictures (Hubble and Webb) as inspiration, restyled in the game's neon colors, with a different one for each place. [asked] Mini Game Survival v2 draws neon versions of the Cosmic Cliffs, the Southern Ring Nebula, the Pillars of Creation, a Wolf-Rayet star, the Whirlpool Galaxy, the Horsehead Nebula, the Milky Way, and Andromeda, all drawn by code (no photos copied). [built]
- Galaxies should be pretty: glowing cores, soft tapered arms dotted with stars and pink star-forming knots, and a mix of kinds (face-on, tilted, edge-on). [asked]

## Scoring
- An arcade-style high score board sits on the home screen: one list for everyone, no logins, and players type a name at the end. [asked]
- The board ranks one combined score. [asked] Starward v4's formula: puzzle points by difficulty (100 easy, 140 medium, 180 hard; 25 if the answer was shown), plus 20 × words per minute, plus 5 × accuracy percent. [built]
- The shared board only takes scores from people who can edit the page. With a public link, that means only Mom's account, so everyone else's scores save on their own computer. [limit]
- High scores carry over to every new version, both the shared board and the scores saved on each computer, because new versions update the game's permanent home page instead of starting a new page. Archive pages of older versions start with an empty board. [asked]

## Sharing
- Every new version ships with a QR card that opens it, styled with the game's own colors and icons (`library/build/qr.py`; a game sets its look with a "qr" block in its game.json), checked to scan before it's sent to Mom. [asked]
- QR cards show the game's main character and a quick two-sentence teaser that gets kids curious, and no version number. [asked] The hero is drawn from the game's own art files (the Keeper, The Inner Flame's robot flying on his thrusters, T-Rexy mid-hop), so the card always matches the game. A tall hero stands beside the code; a wide one stands under it and says "Scan to play!" in a speech bubble. The teaser is a short hook line, then one line on what you get to do, with a joke where it fits ("Zero friends... so far!"). One card per game, `dist/<id>-qr.png`, since it points at the home page and stays good for every version. [built]
- Keep the QR code itself plain enough to scan: square finder eyes, touching modules with barely rounded corners. Rounded eyes and gapped dots failed one reader in about one try in ten. The scan check reads every card with two readers at full, three-quarter and half size. [limit]

## Technical defaults that worked
- Source lives in the Game Library as separate files: shared engines in kit/, art and music in assets/, questions and words in content/, game-only parts in games/<id>/. Every file starts with a header saying what it does, what it provides, and what it needs. [asked]
- Each game is built into one self-contained web page, published as an artifact, that runs in Chrome on the Chromebook with no install.
- Keyboard first: arrow keys or WASD to move, Enter to continue, and typing for answers. The mouse and touchscreen also work, including tapping friends for hints. Since Mini Game Survival v6, a game can also be played on a phone (see Gameplay). [asked]
- Progress and skill levels save in the browser, so he can stop and pick up later.
- Every change passes `library/build/playtest.py`, which plays Starward and Mini Game Survival start to finish in a headless browser (Mini Game Survival's runs are finished by the level's own solution). It also checks that every memory piece can be caught, that the recorded laughs and dino noises play, the question library and its dealer, phone play on a touch screen, L and R, hints, missing pieces, and running a portal again. Visual changes also get a screenshot check; `--shots=DIR` saves one of every Mini Game Survival screen. [asked]

## Starting a new game: questions for Child I, one at a time
1. What is the game about, and where does it happen?
2. Who is the hero? What do they want, and why?
3. Who do they meet along the way, and how do those friends help?
4. What do they collect or build?
5. What kinds of puzzles should there be? Then work in typing practice and the theme's STEM topics.
6. What should each place sound like?
7. Read the whole design back, confirm every name in text, then build from the Game Library, reusing its pieces where they fit.
8. Write the QR card's two-sentence teaser from the design (a hook, then what you get to do, with a joke where it fits and no spoilers) and pick the hero's pose for the card. See Sharing.
