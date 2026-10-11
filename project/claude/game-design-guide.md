# Game Design Guide for Child I

Read this before designing or building any new game in this project. It records what Mom and Child I asked for while making The Inner Flame and Starward (October 10 to 11, 2026), so new games start from here instead of relearning it. All game source lives in the Game Library, in the GitHub repo she-persisted/GerstnerGames; see claude/game-library.md.

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

## How Mom likes to work
- Designing happens out loud in voice mode, with Claude asking Child I one question at a time. Building happens in text mode. [asked]
- For learning content, quiz interactively and make it fun instead of lecturing. [asked]
- Before building, read the full design list back and get a yes. [asked]
- Changes arrive in batches. Restate each batch as a numbered list, test each item, and report back against the list. [observed]
- Never overwrite a published game. Publish each round of changes as a separate new page and leave earlier versions untouched. This is the default for every change, not only when she says "new version." [asked] Starward v2 and v3 share one page, with v2 in its version history, because that happened before this rule.
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

## Gameplay
- Difficulty adapts to how he plays: harder when he's doing well, easier when he struggles. [asked] In Starward v4, typing speed, math, and word puzzles each have their own level. Two clean answers in a row raise a level, two hard-won answers or one "Show me" lower it, and questions are picked when they appear so they match the current level. [built]
- Every playthrough must be different. [asked] Starward does this with large question banks, freshly generated math problems, and a list of questions already seen on that computer so they don't repeat. [built]
- Mix puzzle types. She asked for riddles plus fill-in-the-blank sentences. [asked] Claude added word scrambles, math word problems, missing numbers, place value, rounding, number patterns, planet order, and odd one out. [built]
- Puzzles should match the game's world. For a space game that means space, robotics, and science. [asked]
- Rewards take effort. He has to explore and solve puzzles to earn each item, and each rocket part takes three challenges, not one. [asked]
- Upgrades come only from the home area. Out in the wider world he collects something else instead (songs, in Starward). [asked]
- Exploring should be visual: he walks his character around a map instead of clicking a list of places. [asked]
- Keep instructions to a minimum and make the game intuitive. Story text is fine, but explanations of what to do next are not. [asked] Starward replaces instructions with visual cues: glowing markers, progress dots, a highlight on the next thing to type, and hint buttons that pulse after two misses. [built]
- Typing rounds are timed and animated. Words fall or appear, and he types them before they're gone. Missed words don't have to be retyped. He passes at 85% accuracy and redoes the round if he falls short. [asked]
- Helpers make sure he never stays stuck. [asked] After three wrong answers, a "Show me" button appears, and he types the answer to move on. [built]
- Give positive reinforcement through the hero's face: happy and surprised reactions to what he does. [asked]
- Building and customizing: he picks the style of each rocket part and the paint color. [built]

## Music and sound
- Each place has its own background music. [asked]
- Songs are collectibles, kept in a jukebox on the home screen. [asked]
- She rejected the idea of correct answers adding notes to a melody. [asked]
- All music and sound effects are generated in code, so nothing is copyrighted. [built]
- Music starts after the first click or key press, because browsers block sound until then. [limit]

## Scoring
- An arcade-style high score board sits on the home screen: one list for everyone, no logins, and players type a name at the end. [asked]
- The board ranks one combined score. [asked] Starward v4's formula: puzzle points by difficulty (100 easy, 140 medium, 180 hard; 25 if the answer was shown), plus 20 × words per minute, plus 5 × accuracy percent. [built]
- The shared board only takes scores from people who can edit the page. With a public link, that means only Mom's account, so everyone else's scores save on their own computer. Each version's page has its own board. [limit]

## Technical defaults that worked
- Source lives in the Game Library as separate files: shared engines in kit/, art and music in assets/, questions and words in content/, game-only parts in games/<id>/. Every file starts with a header saying what it does, what it provides, and what it needs. [asked]
- Each game is built into one self-contained web page, published as an artifact, that runs in Chrome on the Chromebook with no install.
- Keyboard first: arrow keys or WASD to move, Enter to continue, and typing for answers. The mouse also works.
- Progress and skill levels save in the browser, so he can stop and pick up later.
- Every change passes `library/build/playtest.py`, which plays Starward start to finish in a headless browser. Visual changes also get a screenshot check. [asked]

## Starting a new game: questions for Child I, one at a time
1. What is the game about, and where does it happen?
2. Who is the hero? What do they want, and why?
3. Who do they meet along the way, and how do those friends help?
4. What do they collect or build?
5. What kinds of puzzles should there be? Then work in typing practice and the theme's STEM topics.
6. What should each place sound like?
7. Read the whole design back, confirm every name in text, then build from the Game Library, reusing its pieces where they fit.
