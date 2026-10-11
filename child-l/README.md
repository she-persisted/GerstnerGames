# Child L's games

Browser games for Child L's speech and phonics practice, built on the Toybox library. They run in Chrome on the Chromebook. There is no build step: each page loads the shared library files from `lib/` beside it.

This folder is separate from Child I's games (`../library/` and `../project/`). Their rules, design guide and build script don't apply here, and nothing here depends on them.

## This repo is the source

All code for Child L's games lives here and is changed here. The claude.ai artifacts are deployments: copies of these files that Child L opens and plays. Never edit an artifact directly. A change made only on claude.ai is lost at the next deploy.

## What's here

| Path | What it is |
|---|---|
| `toybox/toybox.html` | Biscuit's Toybox, the catalog page for the library |
| `toybox/magic-words.html` | Biscuit's Magic Words (Listen Game and Magic Word Game, F/B pairs) |
| `toybox/lib/` | The library: theme, engine, characters, pictures, sounds, word packs, game types, shell |
| `docs/toybox-library.md` | How the library works: layers, contracts, procedures, versioning, roadmap. Read before changing code. |
| `deploy.json` | Which claude.ai artifact each page deploys to |
| `tools/playtest.py` | Headless-Chromium play-test of every page. Must pass before a commit or deploy. |

## Play from a download

Open `toybox/magic-words.html` in Chrome. No server is needed. Fonts load from Google Fonts, so it needs internet for the intended look; the game still works without it. Biscuit speaks with recorded clips (`toybox/lib/assets/voice/`); any line without a clip uses Chrome's built-in text-to-speech.

A local copy keeps its own candy total and tricky-word list in that browser. It does not share them with the claude.ai page Child L normally plays.

## Steps for Claude

### Start a session

1. Call `add_repo` for `she-persisted/GerstnerGames` with push access, then clone it as the result says.
2. Read `child-l/docs/toybox-library.md`.
3. If Playwright is missing: `pip install --break-system-packages playwright` and `python3 -m playwright install chromium`.

### Change, test, commit

1. Edit files under `child-l/toybox/`, following the procedures in `docs/toybox-library.md`.
2. Run `python3 child-l/tools/playtest.py`. It must end with `PASS`.
3. Commit on `main` with a message saying what changed, then push. Fetch first; don't force-push. Don't touch `library/` or `project/`.

### Deploy

Deploy after the push, so what Child L plays always matches a commit on GitHub. When anything under `toybox/lib/` changed, deploy every artifact in `deploy.json` so they all run the same library. When only one page changed, deploy that page's artifact.

For each artifact:
1. `Artifact` read with its `url` (required before publishing to it), then `Artifact` list with scope `files` to see its published paths.
2. `Artifact` publish with `url`, `file_path` = the repo page, and `files` mapping `lib/<path>` to `child-l/toybox/lib/<path>` for every library file. Map to `null` any published `lib/` path the repo no longer has.
   The voice clips make this about 200 files. One publish takes at most 255 files, so when `lib/` grows past that, publish in batches to the same `url`; each later publish adds to the files already there.
3. Read back `index.html` and every `lib/` path. Each sha256 must match the repo file (`sha256sum`). If any differ, find out why before telling Mom the change is live.

The two pages in the repo include the document header claude.ai added when they were first published. The first deploy from the repo should confirm claude.ai serves them back unchanged. If it adds a second header, decide then whether to store pages without it, and update this section.

### New game

1. Add `toybox/<config id>.html` (copy `magic-words.html`, change the config).
2. Play-test, commit, push.
3. Publish it as a new artifact (no `url`) with the `lib/` files. Add its URL to `deploy.json`, to the `GAMES` list in `toybox.html`, and to `docs/toybox-library.md`.
4. Play-test, commit, push, deploy Toybox.

### After a homework change

Update the "Child L current focus" doc in the claude.ai project ("Child L Speech And Reading"). Session notes and progress live there, not in this repo.

## Privacy

The repo holds no names or personal details; those live in the claude.ai project. Keep it that way.
