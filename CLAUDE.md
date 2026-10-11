# Working in this repo

The repo holds two separate projects. Keep them apart.

Privacy: never write a child's real name, birth date, school or other personal details into this repo, including commit messages. Use Child I, Child L and Mom. Real names and details live only in the claude.ai projects.

- `child-l/`: Child L's speech and phonics games (Toybox). Follow `child-l/README.md` and `child-l/docs/toybox-library.md` only. Nothing below applies there.
- `library/` and `project/`: Child I's games. Everything below applies.

## Child I's games

Before any change, read:

1. `project/instructions.md`: who the games are for and the standing rules.
2. `project/claude/game-design-guide.md`: what Mom and Child I have asked for. Add any new preference they state.
3. `project/claude/game-library.md`: the full workflow (change, build, push, publish, sync docs). Then `library/README.md` for the architecture.

Key rules:

- This repo is the source. Pages on claude.ai are deployed copies; never edit them.
- Edit source in `library/`, never a built page. Run `python3 build/build.py --all` from `library/` after every change.
- Never overwrite a published game: bump `version` and `output` in `games/<id>/game.json` and publish a new page.
- Every new version ships with two things, no exceptions: its high scores carried over from the previous version's page, and a QR card made with `build/qr.py` that passes its scan check, sent to Mom with the link. Steps are in `project/claude/game-library.md`, "Publish a new game version".
- Run `python3 library/build/playtest.py` until it ends with `PASS`, then commit and push to `main` without asking. Never force-push.
- Notes about Child I himself (what he knows, play-test feedback, session notes) stay in the claude.ai project doc `claude/child-i-notes.md`, never in this repo.
- Keep each file's `@file`, `@about`, `@provides`, and `@requires` header accurate.
- Update the game's doc in `project/claude/` with every new version, and copy changed `project/claude/` docs to the claude.ai project.
