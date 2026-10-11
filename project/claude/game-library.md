# Game Library

Read this before changing, fixing, or reusing any game in this project.

## Where things live

- **Source:** GitHub repo `she-persisted/GerstnerGames` (private), folder `library/`, branch `main`. It is the only place code changes. Project docs live in the same repo under `project/`.
- **Deployed copies on claude.ai:** each game version's page (table below) and the Library page, https://claude.ai/artifact/7YRqBV3W2SAGT9kyHybngx, a showcase of every game, how the pieces fit, the characters, the songs, and a file browser. Never edit these directly. A change made only on claude.ai is lost at the next deploy.
- **Project only, never in the repo:** claude/child-i-notes.md, what we learn about Child I (what he knows, how he plays, play-test feedback, session notes).
- **Not ours to touch:** `child-l/` in the same repo is Child L's project with its own rules.

What's in `library/`:

- `kit/`: engines any game can use (story flow, puzzle screen, typing flights, digging, walkable map, music, sound effects, adaptive difficulty, high scores, jukebox, shared styles)
- `assets/`: characters, rocket, side-view worlds, Lumina map art, icons, 7 songs
- `content/`: question banks tagged easy, medium, or hard, question generators, typing word lists
- `games/<id>/`: each game's own parts and its `game.json` (build list plus every release link); single-file legacy versions in `legacy/`
- `build/build.py`: joins a game's files into one page, checks load order, writes `catalog.json`
- `build/playtest.py`: the automated play-test (headers, build, every page loading, and a full Starward playthrough)
- `dist/`: built games, committed so they can be downloaded and played
- `README.md`: full architecture, file header rules, and conventions
- `catalog.json`: one entry per file with what it does, what it provides and needs, and which games use it

## Games and versions

| Game | Version | Page | Source in the repo |
|---|---|---|---|
| Starward | v4 (2026-10-11), adaptive difficulty | https://claude.ai/artifact/U9Z4PvGaEpPGf7jinpaJhV | `library/games/starward/`, built to `library/dist/starward-v4.html` |
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
4. Run `python3 library/build/playtest.py` until it ends with `PASS` (about 2 minutes; `--quick` skips the full playthrough while iterating). It plays Starward start to finish. For a change to how something looks, also screenshot the page and look at it. A new game needs its own playthrough added to `playtest.py`.
5. Fetch and rebase on `main`, commit with a message saying what changed, and push. Don't force-push, and don't touch `child-l/`. No need to ask first.

### Publish a new game version

1. With `playtest.py` passing, publish `library/dist/<id>-v<N>.html` as a new artifact (no `url`). Never publish over an earlier version. Starward needs capabilities `{"db": {}}` for its high score board.
2. Read the page back (`Artifact` read with `path` `index.html`). Remove the page wrapper claude.ai adds (the doctype, html, head, and body tags it puts around the page) and confirm the rest is identical to the dist file. If it differs, find out why before telling Mom it's live.
3. Add the release (version, date, link, notes) to `game.json`, run `build.py --all`, update the table above and the game's own doc, then commit and push.
4. Redeploy the Library page: `Artifact` read its link, list its published files, then publish `library/index.html` to it with `root` set to `library/` and `files` mapping every file under `library/` except `index.html` and `dist/`. Send `.html`, `.svg`, `.py`, and `.md` as `text/plain`. Map to `null` any published path the repo no longer has. Read every file back and check its sha256 against the repo.

The Library page is redeployed only when a game version ships, so between releases it can lag the repo. GitHub is always the source.

### Keep the project docs in sync

After pushing changes under `project/claude/`, write each changed doc to the claude.ai project at the same `claude/` path (`project_write` with `local_path`), so voice mode sees the current version. If the two copies differ, the repo wins. The one exception is claude/child-i-notes.md, which lives only in the project: never copy it into the repo. When Mom changes the project instructions, update `project/instructions.md` to match.

## Facts to keep in mind

- Git history holds every earlier version of the source. The Library page also keeps its own version history.
- Checked on 2026-10-11: `build.py --all` on a clean checkout reproduces `catalog.json`, the Library page, and Starward v4 exactly as published, so a rebuild leaves `git status` empty.
