# GitHub repo

Repo (private): https://github.com/she-persisted/GerstnerGames, branch `main`. It is the source for all game code and game docs. The pages on claude.ai are deployed copies. The full workflow is in claude/game-library.md.

## Layout

| Path | Whose | What |
|---|---|---|
| `library/` | Child I | The Game Library: every game's source, the build script, and built games in `dist/` |
| `project/instructions.md` | Child I | Copy of this project's instructions |
| `project/claude/*.md` | Child I | This project's docs. The repo copy wins if it differs from the claude.ai copy. claude/child-i-notes.md is the exception: it stays in the project only. |
| `child-l/` | Child L | Child L's games, with their own rules. Leave alone. |
| `README.md`, `CLAUDE.md` | Both | Repo overview, and the rules Claude Code loads, split by project |

## Getting access

Claude reaches the repo through `add_repo` with push access. If that fails, or the repo doesn't show up, Claude's GitHub access is missing. Mom fixes it on claude.ai under Settings, Connectors, GitHub, by giving the Claude app access to GerstnerGames. A chat started before the fix may need restarting.

## Don't upload through the GitHub website

A browser upload of a zip puts every file in the repo root and renames files that share a name. That happened on 2026-10-11 (`README (3).md`, `game (2).json`, `lumina (1).js`, and `.gitignore` saved as `download`). The next commit restored the folders. Always push with git.

## History

- 2026-10-11: first push of the Game Library and project docs; folder structure restored after the browser upload.
- 2026-10-11: Child L's games added under `child-l/`.
- 2026-10-11: the repo became the source for Child I's games; the Library page became a deployed copy.
- 2026-10-11: added `library/build/playtest.py`; moved notes about Child I himself to the project-only doc claude/child-i-notes.md.
- 2026-10-11: privacy cleanup. Names replaced with Child I, Child L and Mom; Child L's folder renamed `child-l/`; birth date and other personal details moved to the claude.ai projects (claude/child-i-profile.md, child-l-profile.md). History was squashed into one commit so no earlier commit holds them. Keep names out of the repo, including commit messages.
