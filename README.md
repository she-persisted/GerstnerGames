# Family Games

Educational browser games a mom makes with Claude for her sons. Each son's games are a separate project with their own library, rules and docs.

| Folder | Whose | What |
|---|---|---|
| `library/`, `project/` | Child I | Space games with typing practice and adaptive difficulty. Everything below this table. |
| `child-l/` | Child L | Speech and phonics games built on the Toybox library. See `child-l/README.md`. |

# Child I's Games

Educational space games that Child I designs with his mom and Claude builds. Every game runs as one self-contained web page in Chrome on a Chromebook, builds typing skills, and adapts its difficulty to how the player is doing.

## What's here

| Folder | Contents |
|---|---|
| `library/` | The Game Library: every game's source as separate, reusable files. This is the source; the game pages and the Library page on claude.ai are deployed copies. See `library/README.md` for the architecture. |
| `library/dist/` | Built, playable games. Download one and open it in Chrome. |
| `library/games/*/legacy/` | Earlier games kept as their original single files (The Inner Flame v1, Starward v3). |
| `project/` | The claude.ai project's instructions and its `claude/` docs: the design guide, the library guide, and one doc per game. |

## Games

| Game | Version | Play on claude.ai | Source |
|---|---|---|---|
| Starward | v4 (2026-10-11), adaptive difficulty | https://claude.ai/artifact/U9Z4PvGaEpPGf7jinpaJhV | `library/games/starward/`, built to `library/dist/starward-v4.html` |
| Starward | v3 (2026-10-11), walkable map | https://claude.ai/artifact/Ny2qfyuP9oAo7Vr9VgYEcg | `library/games/starward/legacy/v3.html` |
| The Inner Flame | v1 (2026-10-10) | https://claude.ai/artifact/FAgoyVHV7dqGaY856XeSk6 | `library/games/inner-flame/legacy/v1.html` |

Library page: https://claude.ai/artifact/7YRqBV3W2SAGT9kyHybngx

## Build

Python 3, no dependencies. From `library/`:

```
python3 build/build.py games/starward/game.json   # one game into dist/
python3 build/build.py --all                      # catalog.json, every game, and the library page
python3 build/playtest.py                         # automated play-test; must end with PASS
```

A clean checkout rebuilds byte-for-byte: `build.py --all` should leave `git status` empty.

## Rules that carry over from the project

- Never overwrite a published game. Each round of changes gets a new version number, a new `dist/` file, and a new page.
- Change source files, never a built page.
- Original characters and music only. All music and sound effects are generated in code.
- Read `project/claude/game-design-guide.md` before designing anything new.

## Note on the high score board

Starward's shared high score board uses claude.ai's artifact storage, so it only works on the claude.ai page. A copy opened from `dist/` saves scores on that computer only.
