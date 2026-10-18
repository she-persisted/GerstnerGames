# Game Library

Read this before changing, fixing, or reusing any game in this project.

## Where things live

- **Source:** GitHub repo `she-persisted/GerstnerGames` (private), folder `library/`, branch `main`. It is the only place code changes. Project docs live in the same repo under `project/`.
- **Deployed copies on claude.ai:** each game version's page (table below) and the Library page, https://claude.ai/artifact/7YRqBV3W2SAGT9kyHybngx, a showcase of every game, how the pieces fit, the characters, the songs, and a file browser. Never edit these directly. A change made only on claude.ai is lost at the next deploy.
- **Project only, never in the repo:** claude/child-i-notes.md, what we learn about Child I (what he knows, how he plays, play-test feedback, session notes).
- **Not ours to touch:** `child-l/` in the same repo is Child L's project with its own rules.

What's in `library/`:

- `kit/`: engines any game can use (story flow, puzzle screen, typing flights, digging, walkable map, music, sound effects, adaptive difficulty, high scores, jukebox, shared styles, obstacle runs with a level solver and double hop, picture jigsaw, letter-guessing with a fuel tank, walkable side-view hub, dance-style music player, cartoon voices, sky surprises like shooting stars and comets)
- `assets/`: the shared cartoon drawing style (`style/ink.js`: outlines, shading, eyes, glass, sparkles), characters (the Keeper, Sunny, Rigel, Professor Kepler, T-Rexy and his family, Nova), rocket, glitch ship, side-view worlds, Lumina map art, neon nebula backgrounds, memory pictures, icons, 15 songs, recorded villain laughs and cute dino noises (CC0), T-Rexy's unlockable looks (hats, back items, colors)
- `content/`: question banks tagged easy, medium, or hard, question generators, typing word lists, science clue words, obstacle-run chunks
- `games/<id>/`: each game's own parts and its `game.json` (build list plus every release link); single-file legacy versions in `legacy/`
- `build/build.py`: joins a game's files into one page, checks load order, writes `catalog.json`
- `build/playtest.py`: the automated play-test (headers, build, every page loading, Mini Game Survival's art fit and sky surprises, a check that every memory piece in Mini Game Survival's runs can be caught, and full Starward and Mini Game Survival playthroughs)
- `dist/`: built games, committed so they can be downloaded and played
- `README.md`: full architecture, file header rules, and conventions
- `catalog.json`: one entry per file with what it does, what it provides and needs, and which games use it

## Games and versions

| Game | Version | Page | Source in the repo |
|---|---|---|---|
| Mini Game Survival | **Home page, always the newest version** (now v8, 2026-10-18: a new look for every mini game finished, a closet that only shows slots reachable this game) | https://claude.ai/artifact/EgGFe2mgXPPY7S47QGoWNJ | `library/games/mini-game-survival/`, built to `library/dist/mini-game-survival-v8.html` |
| Mini Game Survival | v7 (2026-10-18), hints off the play area, a helmet that fits, T-Rexy in the cockpit, one drawing style, shooting stars on the story screens | V7ARCHIVE (archive) | `library/dist/mini-game-survival-v7.html` |
| Mini Game Survival | v6 (2026-10-17), cute dino noises, phone play, a crashed ship fixed part by part, new questions every game | https://claude.ai/artifact/9hyKGAdHeH6CQKJo1t5Tay (archive) | `library/dist/mini-game-survival-v6.html` |
| Mini Game Survival | v5 (2026-10-17), a cuter, more expressive T-Rexy | https://claude.ai/artifact/SMosBkiXuSCP4u4ynQ9NGn (archive) | `library/dist/mini-game-survival-v5.html` |
| Mini Game Survival | v4 (2026-10-17), checkpoints always on, Hard needs every memory piece, obstacles on the beat, PERFECT hops, unlockable looks for T-Rexy | https://claude.ai/artifact/CqvjvxnbGtkFK8WTWmjDGj (archive) | `library/dist/mini-game-survival-v4.html` |
| Mini Game Survival | v3 (2026-10-17), every memory piece catchable, holes for missing pieces with keep going or run it again, L and R through the story, hints only when stuck, a recorded villain laugh | https://claude.ai/artifact/3YVkf9GKU7fJYfuCKcc3QD (archive) | `library/dist/mini-game-survival-v3.html` |
| Mini Game Survival | v2 (2026-10-17), easier ramping runs, double hop, Easy and Hard, upbeat music, NASA-style backgrounds, question library, end clip | https://claude.ai/artifact/Q71rK4DCGwZmRv5DLi8KRr (archive) | `library/dist/mini-game-survival-v2.html` |
| Mini Game Survival | v1 (2026-10-17), first version | https://claude.ai/artifact/PJ8MRLvskRBh1zZxwKidph (archive) | `library/dist/mini-game-survival-v1.html` |
| Starward | **Home page, always the newest version** (now v6, 2026-10-17: dig tips, auto-advance after right answers, tap friends for hints) | https://claude.ai/artifact/Jq8tRWGkoLgdJZAMwcMYtw | `library/games/starward/`, built to `library/dist/starward-v6.html` |
| Starward | v5 (2026-10-11), v4 without personal names | https://claude.ai/artifact/X1f6WeveqRtYrnDTKFzuWY (archive) | `library/dist/starward-v5.html` |
| Starward | v4 (2026-10-11), adaptive difficulty | https://claude.ai/artifact/U9Z4PvGaEpPGf7jinpaJhV | `library/dist/starward-v4.html` (the live page still shows a name) |
| Starward | v3 (2026-10-11), walkable map | https://claude.ai/artifact/Ny2qfyuP9oAo7Vr9VgYEcg (current version of that page) | `library/games/starward/legacy/v3.html` |
| Starward | v2 (2026-10-10), first Starward | same page, in its version history | not kept as a file |
| The Inner Flame | v1 (2026-10-10) | https://claude.ai/artifact/FAgoyVHV7dqGaY856XeSk6 | `library/games/inner-flame/legacy/v1.html` |

## Steps for Claude

### Start a session

1. Call `add_repo` for `she-persisted/GerstnerGames` with push access, then clone it as the result says. If it fails, see claude/github.md.
2. Read `CLAUDE.md` and `library/README.md`. Read `library/catalog.json` to find which files a change touches.
3. For design or difficulty work, also read claude/child-i-notes.md in the project.
4. If Playwright is missing: `pip install --break-system-packages playwright`, then `python3 -m playwright install chromium`.

### Change, build, push

1. Edit source files under `library/` only, never a built page. Shared pieces go in `kit/`, `assets/`, or `content/`; game-only pieces in `games/<id>/`. Keep each file's `@file`, `@about`, `@provides`, and `@requires` header accurate.
2. If a game's behavior changes, bump `version` and `output` in `games/<id>/game.json`. A change that only touches docs or comments doesn't need a new version.
3. From `library/`, run `python3 build/build.py --all`. It must finish without load-order errors.
4. Run `python3 library/build/playtest.py` until it ends with `PASS` (about 5 minutes; `--quick` skips the full playthroughs while iterating). It plays Starward and Mini Game Survival start to finish. For a change to how something looks, also screenshot the page and look at it (`--shots=DIR` saves every Mini Game Survival screen). A new game needs its own playthrough added to `playtest.py`.
5. Fetch and rebase on `main`, commit with a message saying what changed, and push. Don't force-push, and don't touch `child-l/`. No need to ask first.

### Publish a new game version

Each game has one **permanent home page** (`home` in its `game.json`; Starward's is https://claude.ai/artifact/Jq8tRWGkoLgdJZAMwcMYtw). It always runs the newest version, so its link, its QR card, and its high scores (the shared board and the scores saved in each player's browser) all carry across updates. Before an update, the version it was running is saved as its own **archive page**, so every earlier version stays playable exactly as it was.

**A brand-new game** has nothing to archive: publish its dist file as a new artifact (with its capabilities, `{"db": {}}` for a high score board), confirm it matches the dist file as in step 3, and that page is its permanent home page. Put the link in `home` in its `game.json`, then carry on from step 4. Give it a `qr` block in `game.json` for its QR card: colors, badge, its hero, and a two-sentence `tagline` (a hook, then what you get to do; no spoilers). `qr.py` stops if the block, the hero, or either sentence is missing. If the hero is new, add it to `hero_markup` in `build/qr.py`, drawn from the game's own art file, so the card always matches the game.

1. With `playtest.py` passing, **archive the current version first.** Publish the current version's dist file (`library/dist/<id>-v<N-1>.html`, unchanged) as a new artifact (no `url`), with the same capabilities (Starward: `{"db": {}}`). Read it back and confirm it matches the dist file. In `game.json`, change release N-1's `url` to this archive page. Never skip this step: it is what keeps earlier versions playable.
2. **Update the home page.** Read the home page (`Artifact` read with its `url`), then publish `library/dist/<id>-v<N>.html` to it with `url` set to `home`. Leave out `capabilities` so the stored ones (and the high score board) carry over. Never publish a new version as a separate page.
3. Read the home page back (`Artifact` read with `path` `index.html`). Remove the page wrapper claude.ai adds (the doctype, html, head, and body tags it puts around the page) and confirm the rest is identical to the dist file. If it differs, find out why before telling Mom it's live. Then `ArtifactData` list its `scores` and confirm the board still has the scores it had before the update.
4. Add the release (version, date, `home` as its link, notes) to `game.json`, run `build.py --all`, update the table above and the game's own doc.
5. **Make the QR card (every release).** From `library/`, run `python3 build/qr.py games/<id>/game.json` (`--all` makes every game's card; needs Pillow, `opencv-python-headless`, and Playwright with Chromium; it uses the `qrcode` package when installed and OpenCV's own encoder when PyPI can't be reached). It draws the card from the `qr` block in `game.json`: the game's colors and icons, its hero rendered from the game's own art, the two-sentence teaser, and the call to action, with no version number, pointing at the home page. It must end with `scan check: ok` (two readers, three sizes). The card is `dist/<id>-qr.png`, the same file every release, so it only changes when the look, the teaser, or the hero changes; commit it if it did. Older cards with a version number are kept as `dist/<id>-v<N>-qr.png`.
6. Send Mom the QR card with the link, and the archive link for the version it replaced.
7. Redeploy the Library page: `Artifact` read its link, list its published files, then publish `library/index.html` to it with `root` set to `library/` and `files` mapping every file under `library/` except `index.html` and `dist/`. Send `.html`, `.svg`, `.py`, and `.md` as `text/plain`. Map to `null` any published path the repo no longer has. Read every file back and check its sha256 against the repo.

The Library page is redeployed only when a game version ships, so between releases it can lag the repo. GitHub is always the source.

### Keep the project docs in sync

After pushing changes under `project/claude/`, write each changed doc to the claude.ai project at the same `claude/` path (`project_write` with `local_path`), so voice mode sees the current version. If the two copies differ, the repo wins. The one exception is claude/child-i-notes.md, which lives only in the project: never copy it into the repo. When Mom changes the project instructions, update `project/instructions.md` to match.

## Facts to keep in mind

- Git history holds every earlier version of the source. The Library page also keeps its own version history.
- Checked on 2026-10-11: `build.py --all` on a clean checkout reproduces `catalog.json`, the Library page, and Starward v4 exactly as published, so a rebuild leaves `git status` empty.
