#!/usr/bin/env python3
"""
@file build/build.py
@about Assembles a game (or the library page) from its separate files into one self-contained web page, checks that every file's @requires are loaded first, and writes catalog.json, the list of every file and what it does.

Usage, from the library folder:
  python3 build/build.py games/starward/game.json   build one game into dist/
  python3 build/build.py site/site.json            build the library page (index.html)
  python3 build/build.py --catalog                 rewrite catalog.json from the file headers
  python3 build/build.py --all                     catalog, every buildable game, then the library page

A game.json lists: title, output, fonts, styles (CSS in order), body (HTML with <!-- @include path --> lines),
scripts (shared Kit modules, assets, and content, in load order), and parts (the game's own files, which share one scope).
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
INCLUDE = re.compile(r"<!--\s*@include\s+(\S+)\s*-->")
TAGS = ("file", "about", "provides", "requires")
SKIP_DIRS = {"dist", "__pycache__"}
SKIP_FILES = {"catalog.json", "index.html"}
LAYERS = {"kit": "Kit", "assets": "Assets", "content": "Content", "games": "Games", "build": "Build", "site": "Library page"}


def read(rel):
    p = ROOT / rel
    if not p.exists():
        raise SystemExit(f"Missing file: {rel}")
    return p.read_text(encoding="utf-8")


def include(text, depth=0):
    """Replace <!-- @include path --> with that file's contents (nested up to 5 deep). JSON is made safe for <script> tags."""
    if depth > 5:
        raise SystemExit("Includes nested too deeply")

    def sub(m):
        rel = m.group(1)
        body = read(rel)
        if rel.endswith(".json"):
            return body.replace("</", "<\\/")
        return include(body, depth + 1)
    return INCLUDE.sub(sub, text)


def header(rel, text):
    """Read @file, @about, @provides, @requires, plus any notes, from the comment at the top of a file."""
    ext = pathlib.Path(rel).suffix
    block = ""
    if ext in (".js", ".css"):
        m = re.match(r"\s*/\*\*?(.*?)\*/", text, re.S)
        block = re.sub(r"^[ \t]*\*[ \t]?", "", m.group(1), flags=re.M) if m else ""
    elif ext in (".svg", ".html"):
        m = re.match(r"\s*<!--(.*?)-->", text, re.S)
        block = m.group(1) if m else ""
    elif ext == ".py":
        m = re.search(r'"""(.*?)"""', text, re.S)
        block = m.group(1) if m else ""
    elif ext == ".json":
        try:
            data = json.loads(text)
            return {"about": data.get("about", ""), "provides": "", "requires": "", "notes": ""}
        except json.JSONDecodeError:
            return {"about": "", "provides": "", "requires": "", "notes": ""}
    elif ext == ".md":
        lines = [l.strip() for l in text.splitlines()]
        para = next((l for l in lines if l and not l.startswith("#")), "")
        return {"about": para, "provides": "", "requires": "", "notes": ""}
    block = block.strip("\n")
    parts = re.split(r"\n[ \t]*\n", block, maxsplit=1)
    tags_text, notes = parts[0], (parts[1].strip() if len(parts) > 1 else "")
    out = {t: "" for t in TAGS}
    for m in re.finditer(r"@(file|about|provides|requires)\s+(.*?)(?=\s@(?:file|about|provides|requires)\b|\Z)", tags_text, re.S):
        out[m.group(1)] = re.sub(r"\s+", " ", m.group(2)).strip()
    if not out["about"] and not out["file"]:
        notes = block.strip()
    out["notes"] = notes
    out.pop("file", None)
    return out


def required_js(req):
    return [r.strip().split(" ")[0] for r in req.split(",") if r.strip().split(" ")[0].endswith(".js")]


def check_order(js_files):
    """Every .js file a module @requires must come earlier in the load order."""
    problems = []
    seen = set()
    for rel in js_files:
        h = header(rel, read(rel))
        for dep in required_js(h.get("requires", "")):
            if dep not in seen:
                problems.append(f"{rel} needs {dep} loaded before it")
        seen.add(rel)
    return problems


def build(manifest_rel):
    m = json.loads(read(manifest_rel))
    if "parts" not in m and "scripts" not in m:
        raise SystemExit(f"{manifest_rel} has nothing to build (legacy games are kept as single files)")
    scripts, parts = m.get("scripts", []), m.get("parts", [])
    problems = check_order(scripts + parts)
    for css in m.get("styles", []):
        read(css)
    if problems:
        raise SystemExit("Load order problems:\n  " + "\n  ".join(problems))

    out = [f"<title>{m['title']}</title>"]
    if m.get("fonts"):
        out.append('<link rel="preconnect" href="https://fonts.googleapis.com">')
        out.append('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>')
        out += [f'<link rel="stylesheet" href="{f}">' for f in m["fonts"]]
    out.append("<style>")
    for css in m.get("styles", []):
        out.append(f"/* ==== {css} ==== */\n" + read(css).strip())
    out.append("</style>")
    out.append(include(read(m["body"])).strip())
    out.append("<script>")
    for js in scripts:
        out.append(f"/* ==== {js} ==== */\n" + read(js).strip())
    if parts:
        out.append(f"/* ==== {m.get('id', 'game')}: parts share one scope ==== */\n(() => {{\n\"use strict\";")
        for js in parts:
            out.append(f"/* ==== {js} ==== */\n" + read(js).strip())
        out.append("})();")
    out.append("</script>")
    html = "\n".join(out) + "\n"
    dest = ROOT / m["output"]
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(html, encoding="utf-8")
    print(f"Built {m['output']}: {len(html) // 1024} KB from {len(m.get('styles', [])) + len(scripts) + len(parts) + 1} files")
    return dest


def uses_of(manifest_rel):
    """Every file a build list pulls in, including art files @included by its layout."""
    m = json.loads(read(manifest_rel))
    out = set(m.get("styles", []) + m.get("scripts", []) + m.get("parts", []))
    if m.get("body"):
        out.add(m["body"])
        out.update(INCLUDE.findall(read(m["body"])))
    if m.get("legacy"):
        out.add(m["legacy"])
    out.add(manifest_rel)
    return m.get("title", manifest_rel).replace(" v" + str(m.get("version", "")), ""), out


def catalog():
    used_by = {}
    for mf in sorted((ROOT / "games").glob("*/game.json")) + [ROOT / "site/site.json"]:
        if not mf.exists():
            continue
        name, paths = uses_of(mf.relative_to(ROOT).as_posix())
        for p in paths:
            used_by.setdefault(p, []).append(name)
    files = []
    for p in sorted(ROOT.rglob("*")):
        rel = p.relative_to(ROOT).as_posix()
        if p.is_dir() or rel in SKIP_FILES or any(part in SKIP_DIRS for part in p.parts) or p.name.startswith("."):
            continue
        text = p.read_text(encoding="utf-8", errors="replace")
        if "/legacy/" in rel:
            h = {"about": "Original single-file source, kept unchanged so this version can always be rebuilt or edited.", "provides": "", "requires": "", "notes": ""}
        else:
            h = header(rel, text)
        layer = LAYERS.get(rel.split("/")[0], "Docs")
        files.append({"path": rel, "layer": layer, "bytes": len(text.encode("utf-8")), "usedBy": used_by.get(rel, []), **h})
    games = []
    for gj in sorted((ROOT / "games").glob("*/game.json")):
        g = json.loads(gj.read_text(encoding="utf-8"))
        g["source"] = gj.parent.relative_to(ROOT).as_posix()
        g["fileCount"] = len(g.get("styles", [])) + len(g.get("scripts", [])) + len(g.get("parts", [])) + (1 if g.get("body") else 0)
        for k in ("styles", "scripts", "parts", "fonts", "capabilities"):
            g.pop(k, None)
        games.append(g)
    data = {"files": files, "games": games}
    (ROOT / "catalog.json").write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote catalog.json: {len(files)} files, {len(games)} games")


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print(__doc__)
    elif args[0] == "--catalog":
        catalog()
    elif args[0] == "--all":
        catalog()
        for gj in sorted((ROOT / "games").glob("*/game.json")):
            g = json.loads(gj.read_text(encoding="utf-8"))
            if g.get("parts"):
                build(gj.relative_to(ROOT).as_posix())
        build("site/site.json")
    else:
        build(args[0])
