#!/usr/bin/env python3
"""
@file build/playtest.py
@about Automated play-test for the library: checks file headers, checks the built pages match the source, loads every page in headless Chromium at Chromebook size, and plays Starward and Mini Game Survival start to finish (every run, puzzle, flight, and secret, the ending, and the high score). Must pass before every commit that changes library/.
@requires build/build.py

Usage, from anywhere:
  python3 library/build/playtest.py            everything (about 4 minutes)
  python3 library/build/playtest.py --quick    skip the full playthroughs
  add -v to print every screen, or --shots=DIR to save a screenshot of each Mini Game Survival screen

Needs Python 3 and Playwright. If missing:
  pip install playwright            (add --break-system-packages on Claude's workspace)
  python3 -m playwright install chromium

Checks:
  1. Headers: every source file starts with @file (its own path) and @about.
  2. Build: build.py --all, run on a copy, reproduces dist/, catalog.json, and index.html byte for byte.
  3. Pages: every built game, legacy game, and the library page load at 1366x768 with no page
     errors and no sideways scroll. Built games and the library page also allow no console errors.
     Pages are served inside the same wrapper claude.ai adds when it publishes (its base styles
     hide [hidden] elements, for example), so the test sees what Child I sees. Google Fonts is
     blocked so the run doesn't depend on outside network.
  4. Starward playthrough, with a fresh browser (so adaptive levels start at their defaults):
     - Title: name the robot and start.
     - Lumina map: walk to each place by clicking the map. The first puzzle takes three wrong
       answers; "Show me" must stay hidden until the third, then appear and reveal the answer. The second uses the Scan helper.
       Every dig must show its one-line tip, every dig is typed, every part style picked, then back to the launch pad to paint the ship.
     - Right answers: every puzzle must cheer, show no Next button, and move on by itself within 5 seconds.
     - Tapping friends: the first puzzle with Sunny on the crew is solved after tapping Sunny on the stage (her clue must
       appear), and the first with Rigel after tapping Rigel in the friends bar (a letter must appear).
     - Flights: the first try of the first flight is typed badly on purpose and must offer
       "Fly again"; every other flight is typed cleanly and must land, and the landing screen must move on by itself.
     - All planet puzzles answered, the brave words typed, and the ending reached.
     - High score: a name saves, gets a rank, and shows on the board as a score on this computer.
  5. Mini Game Survival, with fresh browsers:
     - The question library is checked (every mystery version's answer is one of its options, every clue has lines for all
       three typing levels, every word topic has plenty of words at each level).
     - Easy mode: the first run must be level 1 (the slowest) with checkpoints already on, and pressing again in the air must double hop.
     - The full playthrough is in Hard mode. No screen may show a count of attempts.
     - Title, then the story lines (Enter), then the crash pad: switch modes there and back, type ROAR and poke Shadowspine
       (Easter eggs), click each portal.
     - Runs: the first run is left alone until T-Rexy crashes three times, which must restart him and show the
       Checkpoints button; then the built-in autopilot (the level's own solution, sped up) finishes every run and
       takes the secret route, so all four hidden diary pages must be found.
     - Jigsaws: Peek and Fix one are used on the first; every jigsaw is solved by clicking tiles.
     - Clue words: the first uses Scan after wrong letters, the second runs out of fuel and is typed to refuel.
     - Clue typing, part styles, paint, songs, the four mystery questions (one wrong answer must show a clue), the shrink, the ending.
     - After the first portal the page is reloaded, and "Keep going" must resume on the crash pad with the clue saved.
     - Right answers move on by themselves; the ship comes alive in the end clip; the high score saves and the secret
       ending shows (all four pages).
Prints PASS or FAIL with the reasons, and exits 1 on FAIL.
"""
import filecmp
import http.server
import json
import pathlib
import re
import shutil
import socketserver
import subprocess
import sys
import tempfile
import threading
import time

LIB = pathlib.Path(__file__).resolve().parent.parent
SIZE = (1366, 768)
FONT_HOSTS = ("fonts.googleapis.com", "fonts.gstatic.com")
# The wrapper claude.ai puts around a published page, captured from a published page on 2026-10-11.
WRAP_HEAD = ('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover">'
             '<style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
             'html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}'
             'img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n')
WRAP_TAIL = "\n</body></html>"
failures = []
DEBUG = "-v" in sys.argv[1:]                     # print every screen the playthroughs see
SHOTS = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--shots=")), "")  # save a screenshot of each screen here


def fail(msg):
    failures.append(msg)
    print("  FAIL", msg)


# 1. Headers -----------------------------------------------------------------

def header_check():
    print("Headers")
    for p in sorted(LIB.rglob("*")):
        rel = p.relative_to(LIB).as_posix()
        if (not p.is_file() or rel.startswith("dist/") or "/legacy/" in rel or "__pycache__" in rel
                or rel in ("index.html", "catalog.json") or p.suffix in (".json", ".md")):
            continue
        top = p.read_text(encoding="utf-8")[:800]
        m = re.search(r"@file\s+(\S+)", top)
        if not m:
            fail(f"{rel}: no @file header")
        elif m.group(1) != rel:
            fail(f"{rel}: @file says {m.group(1)}")
        if not re.search(r"@about\s+\S", top):
            fail(f"{rel}: no @about")


# 2. Build reproduces the committed pages ------------------------------------

def build_check():
    print("Build")
    with tempfile.TemporaryDirectory() as tmp:
        copy = pathlib.Path(tmp) / "library"
        shutil.copytree(LIB, copy, ignore=shutil.ignore_patterns("__pycache__"))
        r = subprocess.run([sys.executable, "build/build.py", "--all"], cwd=copy, capture_output=True, text=True)
        if r.returncode:
            fail(f"build.py --all failed: {(r.stderr or r.stdout).strip()[-400:]}")
            return
        built = ["catalog.json", "index.html"] + [f"dist/{p.name}" for p in sorted((copy / "dist").glob("*.html"))]
        for rel in built:
            mine = LIB / rel
            if not mine.exists():
                fail(f"{rel} is missing; run build.py --all and commit it")
            elif not filecmp.cmp(mine, copy / rel, shallow=False):
                fail(f"{rel} is out of date; run build.py --all and commit it")


# 3. Pages load ---------------------------------------------------------------

def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **k):
            super().__init__(*a, directory=str(LIB), **k)

        def do_GET(self):
            path = LIB / self.path.split("?")[0].lstrip("/")
            if path.suffix != ".html" or not path.is_file():
                return super().do_GET()
            text = path.read_text(encoding="utf-8")
            if not text.lstrip().lower().startswith("<!doctype"):
                text = WRAP_HEAD + text + WRAP_TAIL
            body = text.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, *a):
            pass

    srv = socketserver.ThreadingTCPServer(("127.0.0.1", 0), Quiet)
    srv.daemon_threads = True
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f"http://127.0.0.1:{srv.server_address[1]}/"


def new_page(browser, tag, console_ok=False):
    ctx = browser.new_context(viewport={"width": SIZE[0], "height": SIZE[1]})
    ctx.route(re.compile(r"https://fonts\.(googleapis|gstatic)\.com/.*"), lambda r: r.abort())
    pg = ctx.new_page()

    def on_console(m):
        url = (m.location or {}).get("url", "")
        if console_ok or m.type != "error" or any(h in url or h in m.text for h in FONT_HOSTS):
            return
        if "Failed to load resource" in m.text and "net::ERR_FAILED" in m.text:
            return  # the blocked font request, reported without its URL
        fail(f"{tag} console error: {m.text}")

    pg.on("console", on_console)
    pg.on("pageerror", lambda e: fail(f"{tag} page error: {e}"))
    pg.on("response", lambda r: r.status >= 400 and fail(f"{tag} HTTP {r.status} {r.url}"))
    return ctx, pg


def pages():
    """Every page to load: built games, legacy games, and the library page."""
    out = []
    for gj in sorted((LIB / "games").glob("*/game.json")):
        g = json.loads(gj.read_text(encoding="utf-8"))
        if g.get("output"):
            out.append((g["output"], False))
        out += [(p.relative_to(LIB).as_posix(), True) for p in sorted(gj.parent.glob("legacy/*.html"))]
    out.append(("index.html", False))
    return out


def load_check(browser, base):
    print("Pages")
    for rel, legacy in pages():
        n = len(failures)
        ctx, pg = new_page(browser, rel, console_ok=legacy)
        pg.goto(base + rel)
        pg.wait_for_timeout(1500)
        if pg.evaluate("document.body.innerText.trim().length") < 20:
            fail(f"{rel}: page looks empty")
        if pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth + 1"):
            fail(f"{rel}: scrolls sideways at {SIZE[0]}x{SIZE[1]}")
        ctx.close()
        print(f"  {'ok  ' if len(failures) == n else 'FAIL'} {rel}{' (legacy: page errors only)' if legacy else ''}")


# 4. Starward playthrough ------------------------------------------------------

STATE_JS = r"""() => {
  const panel = document.querySelector('#panel'), vis = el => el && !el.hidden && el.offsetParent !== null;
  const sig = (panel.innerText || '').slice(0, 160);
  if (document.querySelector('#hsForm')) return { kind: 'end', sig };
  if (document.querySelector('#startForm')) return { kind: 'title', sig };
  const ans = document.querySelector('#ans');
  if (ans && !ans.disabled) {
    const show = panel.querySelector('[data-help="show"]');
    return { kind: 'puzzle', sig, showVisible: !!show && !show.hidden,
             helpers: [...panel.querySelectorAll('[data-help]')].filter(b => !b.hidden && !b.disabled).map(b => b.dataset.help) };
  }
  const cur = [...panel.querySelectorAll('span.cur')].find(s => !s.closest('.gone'));  // dug clods keep their old letters
  if (cur) {
    const spans = [...cur.parentElement.children];
    const i = spans.indexOf(cur);
    const tip = panel.querySelector('.digtip');
    return { kind: 'typing', sig, flight: !!panel.querySelector('#bigword'), dig: !!panel.querySelector('.clod'),
             tip: tip ? tip.innerText.trim() : '', rest: spans.slice(i).map(s => s.textContent).join('') };
  }
  if (/safe landing/i.test(panel.innerText)) return { kind: 'landed', sig };
  const prim = panel.querySelector('[data-primary]');
  if (vis(prim) && !prim.disabled) return { kind: 'primary', sig, label: prim.innerText.trim(), low: !!panel.querySelector('.bigpct.low') };
  if (panel.querySelector('.opt[data-opt]')) return { kind: 'part', sig };
  if (panel.querySelector('.opt[data-paint]')) return { kind: 'paint', sig };
  if (panel.querySelector('.card.roam')) return { kind: 'roam', sig };
  return { kind: 'busy', sig };
}"""


def game_settings():
    """Map size and place coordinates, read from Starward's source so the test follows any changes."""
    state = (LIB / "games/starward/state.js").read_text(encoding="utf-8")
    lum = (LIB / "games/starward/lumina.js").read_text(encoding="utf-8")
    sites = {m.group(1): (float(m.group(2)), float(m.group(3))) for m in re.finditer(r'\{ id: "(\w+)",[^}]*?x: (\d+), y: (\d+)', state)}
    parts = dict(re.findall(r'\{ id: "(\w+)",[^}]*?part: "(\w+)"', state))
    w, h = re.search(r"MAP_W = (\d+), MAP_H = (\d+)", lum).groups()
    return sites, parts, (int(w), int(h))


def click_map(pg, x, y, size):
    box = pg.locator("#mapCanvas").bounding_box()
    sc = min(box["width"] / size[0], box["height"] / size[1])
    ox, oy = (box["width"] - size[0] * sc) / 2, (box["height"] - size[1] * sc) / 2
    pg.mouse.click(box["x"] + ox + x * sc, box["y"] + oy + y * sc)


def save_data(pg):
    return pg.evaluate("() => { try { return JSON.parse(localStorage.getItem('starward.save.v4')); } catch (e) { return null; } }")


def current_answer(pg):
    s = save_data(pg) or {}
    asked = s.get("asked") or {}
    if not asked:
        return None
    return asked[list(asked)[-1]]["a"][0]  # ask() saves each question just before it's shown


def playthrough(browser, base, rel):
    print("Starward playthrough")
    sites, parts, size = game_settings()
    ctx, pg = new_page(browser, "playthrough")
    pg.goto(base + rel)
    pg.wait_for_selector("#startForm")
    seen = {"puzzles": 0, "showme": False, "scan": False, "retry": False, "landings": 0, "parts": 0, "digtips": 0, "dogtap": False, "pengtap": False}
    dug = set()  # dig screens already checked for their tip
    last_sig, last_change, started = None, time.time(), time.time()
    counted = None  # the story step of the last landing counted, so one landing isn't counted twice

    while True:
        if time.time() - started > 420:
            fail(f"playthrough took over 7 minutes; stopped at: {last_sig!r}")
            break
        st = pg.evaluate(STATE_JS)
        key = (st["kind"], st["sig"], st.get("rest"))
        if key != last_sig:
            last_sig, last_change = key, time.time()
        elif time.time() - last_change > 25:
            fail(f"stuck for 25 seconds on a {st['kind']} screen: {st['sig']!r}")
            break
        k = st["kind"]

        if k == "title":
            pg.fill("#robotName", "Testbot")
            pg.press("#robotName", "Enter")
            pg.wait_for_timeout(300)

        elif k == "roam":
            s = save_data(pg) or {}
            found = s.get("found") or {}
            todo = [sid for sid, part in parts.items() if not found.get(part)]
            x, y = sites[todo[0] if todo else "pad"]
            click_map(pg, x, y, size)
            pg.wait_for_timeout(600)

        elif k == "puzzle":
            answer = current_answer(pg)
            if answer is None:
                fail("puzzle on screen but no question in the save data")
                break
            first = seen["puzzles"] == 0
            if first and not st["showVisible"]:
                for n in range(3):
                    if pg.locator('[data-help="show"]').is_visible():
                        fail(f'"Show me" was showing after only {n} wrong answers')
                    pg.fill("#ans", "zzqzz")
                    pg.press("#ans", "Enter")
                    pg.wait_for_timeout(150)
                if not pg.locator('[data-help="show"]').is_visible():
                    fail('"Show me" did not appear after three wrong answers')
                else:
                    pg.click('[data-help="show"]')
                    blanks = re.sub(r"[^a-z0-9]", "", (pg.inner_text("#blanks") or "").lower())
                    if blanks != re.sub(r"[^a-z0-9]", "", answer.lower()):
                        fail(f'"Show me" showed {blanks!r}, expected {answer!r}')
                    seen["showme"] = True
            if seen["puzzles"] == 1 and "scan" in st["helpers"]:
                pg.click('[data-help="scan"]')
                if not pg.locator("#blanks").is_visible():
                    fail("Scan helper did not show the letter blanks")
                seen["scan"] = True
            if not seen["dogtap"] and "sniff" in st["helpers"]:
                pg.locator('.cast .char[data-who="dog"]').click()  # tap Sunny on the stage
                pg.wait_for_timeout(150)
                if "Sunny" not in pg.inner_text("#clues"):
                    fail("tapping Sunny did not sniff out a clue")
                if pg.locator('[data-help="sniff"]').is_enabled():
                    fail("tapping Sunny did not use up the Sniff helper")
                seen["dogtap"] = True
            elif not seen["pengtap"] and "peek" in st["helpers"]:
                pg.locator('.slot[data-slot="peng"]').click()  # tap Rigel in the friends bar
                pg.wait_for_timeout(150)
                if not re.search(r"[a-z0-9]", (pg.inner_text("#blanks") or "").lower()):
                    fail("tapping Rigel did not peek a letter")
                seen["pengtap"] = True
            pg.fill("#ans", answer)
            pg.press("#ans", "Enter")
            try:
                pg.wait_for_selector("#fb.good.cheer", timeout=3000)
                seen["puzzles"] += 1
            except Exception:
                fail(f"correct answer {answer!r} was not accepted with a cheer ({st['sig']!r})")
                break
            if pg.locator("#panel [data-primary]").count():
                fail(f"a Next button appeared after a right answer ({st['sig']!r})")
            try:
                pg.wait_for_function("!document.querySelector('#fb.good.cheer')", timeout=5000)
            except Exception:
                fail(f"puzzle did not move on by itself within 5 seconds ({st['sig']!r})")
                break

        elif k == "typing":
            if st["dig"] and st["sig"] not in dug:
                dug.add(st["sig"])
                if not st["tip"]:
                    fail(f"dig screen has no tip ({st['sig']!r})")
                else:
                    seen["digtips"] += 1
            if st["flight"] and seen["landings"] == 0 and not seen["retry"]:
                for ch in st["rest"]:
                    pg.keyboard.type("##" + ch)  # two wrong keys per letter keeps accuracy under the goal
            else:
                pg.keyboard.type(st["rest"])
            pg.wait_for_timeout(60)

        elif k == "primary":
            if st["label"].startswith("Fly again"):
                if not st["low"]:
                    fail('"Fly again" shown without the low score')
                seen["retry"] = True
            pg.locator("#panel [data-primary]").click()
            pg.wait_for_timeout(120)

        elif k == "landed":
            step = (save_data(pg) or {}).get("step")  # landing screens look alike, so count each story step once
            if step != counted:
                seen["landings"] += 1
                counted = step
                try:
                    pg.wait_for_function("!/safe landing/i.test(document.querySelector('#panel').innerText)", timeout=5000)
                except Exception:
                    fail("landing screen did not move on by itself within 5 seconds")
                    break

        elif k == "part":
            pg.locator("#panel .opt[data-opt]").first.click()
            seen["parts"] += 1
            pg.wait_for_timeout(300)

        elif k == "paint":
            pg.locator("#panel .opt[data-paint]").first.click()
            pg.wait_for_timeout(300)

        elif k == "end":
            pg.fill("#hsName", "TESTER")
            pg.press("#hsName", "Enter")
            try:
                pg.wait_for_function("document.querySelector('#rankMsg').textContent.trim().length > 0", timeout=5000)
            except Exception:
                fail("high score did not save")
            board = pg.inner_text(".end-board")
            if "TESTER" not in board:
                fail("saved name is missing from the high score board")
            if "Scores on this computer" not in board:
                fail("high score board should say the scores are on this computer when there's no shared board")
            break

        else:
            pg.wait_for_timeout(150)

    secs = round(time.time() - started)
    print(f"  {seen['puzzles']} puzzles, {seen['parts']} parts, {seen['landings']} landings, Show me {'ok' if seen['showme'] else 'not seen'}, "
          f"Scan {'ok' if seen['scan'] else 'not seen'}, Fly again {'ok' if seen['retry'] else 'not seen'}, {secs}s")
    print(f"  {seen['digtips']} dig tips, tap Sunny {'ok' if seen['dogtap'] else 'not seen'}, tap Rigel {'ok' if seen['pengtap'] else 'not seen'}")
    expect = {"puzzles": 20, "parts": 4, "landings": 5, "digtips": 4}
    for name, n in expect.items():
        if seen[name] != n:
            fail(f"expected {n} {name}, got {seen[name]}")
    for name in ("showme", "scan", "retry", "dogtap", "pengtap"):
        if not seen[name]:
            fail(f"never exercised: {name}")
    ctx.close()


# 5. Mini Game Survival playthrough ------------------------------------------

MGS_STATE_JS = r"""() => {
  const panel = document.querySelector('#panel'), M = window.__mgs || {}, vis = el => el && !el.hidden && el.offsetParent !== null;
  const sig = (panel.innerText || '').slice(0, 140) + '|' + (M.step ?? '');
  if (document.querySelector('#hsForm')) return { kind: 'end', sig };
  if (document.querySelector('#playBtn')) return { kind: 'title', sig, resume: !!document.querySelector('#resumeBtn') };
  if (M.mode === 'hub') return { kind: 'hub', sig };
  if (M.mode === 'run') { const r = M.run(); return { kind: 'run', sig: sig + '|' + (r ? r.crashes + ':' + Math.floor(r.x) : ''), run: r }; }
  const jig = document.querySelector('.jig:not(.solved)');
  if (jig && document.querySelector('#scene.jigmode')) return { kind: 'jigsaw', sig: sig + '|' + [...jig.querySelectorAll('.jt')].map(t => t.dataset.home).join(',') };
  const fw = panel.querySelector('.fuelword');
  if (fw) {
    const out = panel.querySelector('#fwAns');
    if (out && !out.disabled) return { kind: 'refuel', sig };
    if (panel.querySelector('.fw-key:not(:disabled)')) return { kind: 'word', sig: sig + '|' + panel.querySelectorAll('.fw-key:disabled').length };
    return { kind: 'busy', sig };
  }
  const cur = panel.querySelector('#typeHost .target span.cur');
  if (cur) { const spans = [...cur.parentElement.children]; return { kind: 'typing', sig, rest: spans.slice(spans.indexOf(cur)).map(s => s.textContent).join('') }; }
  if (panel.querySelector('.opt[data-opt]')) return { kind: 'part', sig };
  if (panel.querySelector('.opt[data-paint]')) return { kind: 'paint', sig };
  if (panel.querySelector('.choice:not(:disabled)')) return { kind: 'deduce', sig };
  const prim = panel.querySelector('[data-primary]');
  if (vis(prim) && !prim.disabled) return { kind: 'primary', sig };
  return { kind: 'busy', sig };
}"""


ART_CHECK_JS = r"""() => {
  const A = Kit.art, bad = [], ok = (name, svg) => {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    if (doc.querySelector("parsererror")) bad.push(name);
  };
  for (const pose of ["stand", "run1", "run2", "hop", "sit"])
    for (const face of ["smile", "happy", "worried", "surprised", "think", "dizzy", "sleepy"])
      for (const acc of ["none", "flower", "glasses", "bow", "cap"]) ok(`trexy ${pose} ${face} ${acc}`, A.trexy.svg({ pose, face, acc }));
  for (const face of ["smile", "happy", "worried", "surprised"]) ok(`nova ${face}`, A.nova.svg({ face }));
  ok("shadowspine", `<svg xmlns="http://www.w3.org/2000/svg">${A.nova.shadow("#000", 12)}</svg>`);
  for (const face of ["awake", "blink", "happy"]) ok(`ship face ${face}`, decodeURIComponent(A.ship.url({ cockpit: "dino", wings: "bat", thrusters: "two", core: "pink", paint: "lime" }, { flame: true, face, pilot: "<g/>" }).split(",").slice(1).join(",")));
  const S = A.ship, opts = k => [undefined, ...S.PARTS[k].options.map(o => o[0])];
  for (const cockpit of opts("cockpit")) for (const wings of opts("wings")) for (const thrusters of opts("thrusters")) for (const core of opts("core"))
    for (const paint of [undefined, ...S.PAINT_ORDER]) {
      const cfg = { cockpit, wings, thrusters, core, paint };
      const svg = decodeURIComponent(S.url(cfg, { flame: true, ghost: true, pilot: "<g/>" }).split(",").slice(1).join(","));
      ok("ship " + JSON.stringify(cfg), svg);
    }
  for (const m of ["home", "dinner", "window", "swoop"]) ok(`memory ${m}`, A.memories[m]());
  return bad.slice(0, 5);
}"""


def mgs_save(pg):
    return pg.evaluate("() => { try { return JSON.parse(localStorage.getItem('mgs.save.v2')); } catch (e) { return null; } }") or {}


QBANK_CHECK_JS = r"""() => {
  const bad = [], QBANK = window.__mgs.qbank;
  QBANK.mystery.forEach((m, n) => { if (!m.v.length || !m.nope || !m.clue) bad.push(`mystery ${n} is empty`);
    m.v.forEach((v, i) => { if (!(v.a >= 0 && v.a < v.opts.length)) bad.push(`mystery ${n}.${i} answer is not an option`); if (new Set(v.opts).size !== v.opts.length) bad.push(`mystery ${n}.${i} repeats an option`); }); });
  for (const p of ["echo", "fern", "lantern", "whirl"]) {
    if (QBANK.lines[p].length !== 3 || QBANK.lines[p].some(l => !l.length)) bad.push(`clue lines for ${p} need three typing levels`);
    if (!QBANK.facts[p].length || !QBANK.bonus[p].length) bad.push(`facts missing for ${p}`);
  }
  for (const [t, list] of Object.entries(Kit.words.clues)) for (const d of [1, 2, 3]) if (list.filter(w => w[1] === d).length < 8) bad.push(`clue words: only a few level ${d} ${t} words`);
  return bad;
}"""


def mgs_easy_check(browser, base, rel):
    """Easy mode: slower first run with checkpoints already on, and the double hop works."""
    ctx, pg = new_page(browser, "mgs easy mode")
    pg.goto(base + rel)
    pg.wait_for_selector("#playBtn")
    pg.keyboard.press("e")
    pg.click("#playBtn")
    for _ in range(80):
        if pg.evaluate("window.__mgs.mode") == "hub":
            break
        nxt = pg.locator("#panel [data-primary]")
        if nxt.count() and nxt.first.is_visible():
            nxt.first.click()
        pg.wait_for_timeout(120)
    if pg.evaluate("window.__mgs.mode") != "hub":
        fail("Easy mode: the story never reached the crash pad")
        ctx.close()
        return
    if (mgs_save(pg).get("mode")) != "easy":
        fail("Easy mode was not saved with the game")
    for _ in range(30):  # walk to the first portal (clicking it again until T-Rexy jumps in)
        if pg.evaluate("window.__mgs.mode") != "hub":
            break
        hub = pg.evaluate("window.__mgs.hub()")
        if hub:
            mgs_hub_click(pg, hub["portals"]["echo"])
        pg.wait_for_timeout(700)
    for _ in range(40):  # the portal's story lines come before the run
        if pg.evaluate("window.__mgs.mode") == "run":
            break
        nxt = pg.locator("#panel [data-primary]")
        if nxt.count() and nxt.first.is_visible():
            nxt.first.click()
        pg.wait_for_timeout(200)
    try:
        pg.wait_for_function("window.__mgs.mode === 'run' && window.__mgs.run() && window.__mgs.run().checkpoints", timeout=15000)
    except Exception:
        fail("Easy mode: the first run did not start with checkpoints on")
        ctx.close()
        return
    r = pg.evaluate("window.__mgs.run()")
    if abs(r["speed"] - 5.0) > .01:
        fail(f"Easy mode: the first run should be the slowest (level 1), but runs at {r['speed']} tiles a second")
    if not pg.locator("#runUi .cpchip").count():
        fail("Easy mode: no 'Checkpoints on' sign during the run")
    # double hop: press, let go, press again in the air
    pg.keyboard.down("Space"); pg.wait_for_function("!window.__mgs.run().grounded", timeout=2000); pg.keyboard.up("Space")
    pg.wait_for_timeout(60); pg.keyboard.down("Space"); pg.wait_for_timeout(40); pg.keyboard.up("Space")
    if pg.evaluate("window.__mgs.run().air") != 0:
        fail("pressing again in the air did not double hop")
    print("  easy mode: first run at level 1 with checkpoints on, double hop ok")
    ctx.close()


def mgs_hub_click(pg, x_tiles, y_tiles=.6):
    v = pg.evaluate("window.__mgs.hub()")
    if not v:
        return False  # already left the crash pad (a walk just arrived at a portal)
    box = pg.locator("#cv").bounding_box()
    x = box["x"] + (x_tiles - v["camX"]) * v["T"]
    x = max(box["x"] + 4, min(box["x"] + box["width"] - 4, x))
    pg.mouse.click(x, box["y"] + v["ground"] - v["T"] * y_tiles)
    return True


def mgs_playthrough(browser, base, rel):
    print("Mini Game Survival playthrough")
    ctx, pg = new_page(browser, "mgs playthrough")
    pg.goto(base + rel)
    pg.wait_for_selector("#playBtn")
    for b in pg.evaluate(QBANK_CHECK_JS):
        fail(f"question library: {b}")
    # Every picture the canvas draws is SVG turned into an image, which fails silently if the SVG isn't valid XML
    # (a repeated attribute is enough), so check every pose, face, ship combination, and memory picture first.
    bad = pg.evaluate(ART_CHECK_JS)
    for b in bad:
        fail(f"art is not valid SVG: {b}")
    seen = {"runs": 0, "jigsaws": 0, "words": 0, "clues": 0, "parts": 0, "paints": 0, "deduce": 0, "songs": 0,
            "crashrestart": False, "checkpoints": False, "peek": False, "fix": False, "scan": False, "refuel": False,
            "wrongclue": False, "roar": False, "poke": False, "resumed": False, "modeswitch": False, "ship": False}
    reloaded = False
    last_sig, last_change, started = None, time.time(), time.time()
    run_seen, song_steps = None, set()
    shot_names, shot_kinds = set(), set()

    while True:
        if time.time() - started > 420:
            fail(f"Mini Game Survival took over 7 minutes; stopped at: {last_sig!r}")
            break
        st = pg.evaluate(MGS_STATE_JS)
        if st["sig"] != last_sig:
            last_sig, last_change = st["sig"], time.time()
        elif time.time() - last_change > 25:
            fail(f"stuck for 25 seconds on a {st['kind']} screen: {st['sig']!r}")
            break
        k = st["kind"]
        if DEBUG:
            print("   ", k, st["sig"][:70].replace("\n", " "))
        if "Attempt" in st["sig"]:
            fail(f"a screen shows a count of attempts: {st['sig'][:80]!r}")
        if "Zoomasaurus" in st["sig"]:
            seen["ship"] = True
        if SHOTS and k != "busy":
            name = f"{k}-{pg.evaluate('window.__mgs.step')}"
            if name not in shot_names and (k not in shot_kinds or k in ("primary", "hub")):
                shot_names.add(name); shot_kinds.add(k)
                pg.wait_for_timeout(350)
                pg.screenshot(path=str(pathlib.Path(SHOTS) / f"mgs-{len(shot_names):03d}-{name}.png"))

        if k == "title":
            if reloaded and not seen["resumed"]:
                if not st["resume"]:
                    fail('"Keep going" was missing after reloading a saved game')
                    break
                pg.click("#resumeBtn")
                seen["resumed"] = True
                pg.wait_for_timeout(400)
                if pg.evaluate("window.__mgs.mode") != "hub":
                    fail("Keep going did not return to the crash pad")
                if "Clue 1:" not in pg.inner_text("#panel") or "???" in pg.inner_text("#panel").split("Clue 2")[0]:
                    fail("the first clue was not kept in the notebook after reloading")
            else:
                pg.keyboard.press("h")  # the full playthrough is in Hard mode, which starts from the portal entrance
                pg.click("#playBtn")
                pg.wait_for_timeout(350)

        elif k == "primary":
            pg.locator("#panel [data-primary]").click()
            pg.wait_for_timeout(260)
            if "new song" in st["sig"].lower():
                song_steps.add(st["sig"])  # the step number is part of the signature, so each song counts once
                seen["songs"] = len(song_steps)

        elif k == "hub":
            s = mgs_save(pg)
            done = s.get("done") or []
            if len(done) == 1 and not reloaded:
                reloaded = True
                pg.reload()
                pg.wait_for_selector("#playBtn")
                continue
            if not seen["roar"]:
                pg.keyboard.type("roar")
                pg.wait_for_timeout(200)
                seen["roar"] = bool(mgs_save(pg).get("roared"))
                if not seen["roar"]:
                    fail("typing ROAR on the crash pad did nothing")
            if not seen["modeswitch"]:
                pg.click("#modeSwitch"); pg.wait_for_timeout(120)
                m1 = mgs_save(pg).get("mode")
                pg.click("#modeSwitch"); pg.wait_for_timeout(120)
                m2 = mgs_save(pg).get("mode")
                seen["modeswitch"] = m1 == "easy" and m2 == "hard"
                if not seen["modeswitch"]:
                    fail(f"switching modes on the crash pad did not work ({m1}, {m2})")
                pg.locator("#cv").focus()
            if not seen["poke"]:
                before = mgs_save(pg).get("pokes", 0)
                mgs_hub_click(pg, (pg.evaluate("window.__mgs.hub()") or {}).get("heroX", 17), 4.6)
                pg.wait_for_timeout(200)
                seen["poke"] = mgs_save(pg).get("pokes", 0) == before + 1
                if not seen["poke"]:
                    fail("poking Shadowspine on the crash pad did nothing")
            order = ["echo", "fern", "lantern", "whirl"]
            target = next((p for p in order if p not in done), "gate")
            hub = pg.evaluate("window.__mgs.hub()")
            if hub:
                mgs_hub_click(pg, hub["portals"][target])
            pg.wait_for_timeout(900)

        elif k == "run":
            r = st["run"] or {}
            key = pg.evaluate("window.__mgs.step")
            if key != run_seen:
                run_seen = key
                seen["runs"] += 1
            if seen["runs"] == 1 and not seen["checkpoints"]:
                if r.get("crashes", 0) >= 1 and r.get("alive") and r.get("x", 99) < 6:
                    seen["crashrestart"] = True
                if r.get("crashes", 0) >= 3:
                    try:
                        pg.wait_for_selector("#cpBtn", timeout=3000)
                        pg.click("#cpBtn")
                        seen["checkpoints"] = bool(pg.evaluate("window.__mgs.run().checkpoints"))
                    except Exception:
                        fail("the Checkpoints button did not appear after three crashes")
                        seen["checkpoints"] = True
                    pg.evaluate("window.__mgsAutopilot = 'secret'; window.__mgsSpeedup = 4")
                pg.wait_for_timeout(200)
            else:
                pg.evaluate("window.__mgsAutopilot = 'secret'; window.__mgsSpeedup = 4")
                pg.wait_for_timeout(250)

        elif k == "jigsaw":
            pg.evaluate("window.__mgsAutopilot = false; window.__mgsSpeedup = 1")
            first = seen["jigsaws"] == 0
            if first and not seen["peek"]:
                pg.click('[data-help="peek"]')
                seen["peek"] = True
                before = pg.locator(".jt.home").count()
                pg.click('[data-help="fix"]')
                pg.wait_for_timeout(150)
                seen["fix"] = pg.locator(".jt.home").count() > before
                if not seen["fix"]:
                    fail('"Fix one" did not put a piece home')
            tiles = pg.evaluate("[...document.querySelectorAll('.jig .jt')].map(t => +t.dataset.home)")
            i = next((i for i, h in enumerate(tiles) if h != i), None)
            if i is not None:
                j = tiles.index(i)
                pg.locator(f'.jig .jt[data-pos="{i}"]').click()
                pg.locator(f'.jig .jt[data-pos="{j}"]').click()
                pg.wait_for_timeout(60)
            else:
                pg.wait_for_timeout(100)
            if pg.locator(".jig.solved").count():
                seen["jigsaws"] += 1
                try:
                    pg.wait_for_function("!document.querySelector('#jigProg')", timeout=6000)
                except Exception:
                    fail("a solved jigsaw did not move on by itself")
                    break

        elif k == "word":
            s = mgs_save(pg)
            portal = ["echo", "fern", "lantern", "whirl"][seen["words"]]
            word = ((s.get("words") or {}).get(portal) or {}).get("word", "")
            if not word:
                fail("clue word missing from the save data")
                break
            wrong = [c for c in "ZQXJVKWYBFGHPMUC" if c not in word]
            if seen["words"] == 0 and not seen["scan"]:
                full = pg.locator(".fw-tank .cell.on").count()
                pg.keyboard.type((wrong[0] + wrong[1]).lower())
                pg.wait_for_timeout(120)
                if pg.locator(".fw-tank .cell.on").count() != full - 2:
                    fail("two wrong letters did not burn two fuel cells")
                pg.click('[data-help="scan"]')
                seen["scan"] = pg.locator('[data-help="scan"]').is_disabled()
            if seen["words"] == 1 and not seen["refuel"]:
                cells = pg.locator(".fw-tank .cell").count()
                pg.keyboard.type("".join(wrong[:cells]).lower())
                pg.wait_for_timeout(200)
                if not pg.locator("#fwAns").count():
                    fail("running out of fuel did not ask to type the word")
                    break
                continue
            left = [c for c in dict.fromkeys(word) if c != " " and not pg.locator(f'.fw-key[data-k="{c}"]:disabled').count()]
            pg.keyboard.type("".join(left).lower())
            try:
                pg.wait_for_selector("#fb.good.cheer", timeout=3000)
            except Exception:
                fail(f"guessing every letter of {word!r} did not win")
                break
            seen["words"] += 1
            if pg.locator("#panel [data-primary]").count():
                fail("a Next button appeared after a clue word")
            pg.wait_for_function("!document.querySelector('.fuelword')", timeout=5000)

        elif k == "refuel":
            s = mgs_save(pg)
            portal = ["echo", "fern", "lantern", "whirl"][seen["words"]]
            word = ((s.get("words") or {}).get(portal) or {}).get("word", "")
            pg.fill("#fwAns", word.lower())
            pg.press("#fwAns", "Enter")
            try:
                pg.wait_for_selector("#fb.good.cheer", timeout=3000)
                seen["refuel"] = True
                seen["words"] += 1
                pg.wait_for_function("!document.querySelector('.fuelword')", timeout=5000)
            except Exception:
                fail("typing the word after running out of fuel did not refuel")
                break

        elif k == "typing":
            pg.keyboard.type(st["rest"])
            try:
                pg.wait_for_selector("#typeHost .cheer", timeout=3000)
                seen["clues"] += 1
                pg.wait_for_function("!document.querySelector('#typeHost')", timeout=5000)
            except Exception:
                fail("typing the clue did not save it")
                break

        elif k == "part":
            pg.locator("#panel .opt[data-opt]").first.click()
            seen["parts"] += 1
            pg.wait_for_timeout(300)

        elif k == "paint":
            pg.locator("#panel .opt[data-paint]").nth(2).click()
            seen["paints"] += 1
            pg.wait_for_timeout(300)

        elif k == "deduce":
            n = seen["deduce"]
            right = pg.evaluate("window.__mgs.answer")
            if n == 0:
                pages = len(mgs_save(pg).get("pages") or [])
                if pages != 4:
                    fail(f"the autopilot took every secret route but found {pages} of 4 diary pages")
                wrong_btn = pg.locator(f'#panel .choice:not([data-i="{right}"])').first
                wrong_btn.click()
                pg.wait_for_timeout(150)
                seen["wrongclue"] = "Clue" in pg.inner_text("#nope")
                if not seen["wrongclue"]:
                    fail("a wrong mystery answer did not point to a clue")
            step = pg.evaluate("window.__mgs.step")
            pg.locator(f'#panel .choice[data-i="{right}"]').click()
            try:
                pg.wait_for_selector("#fb.good.cheer", timeout=3000)
                seen["deduce"] += 1
                pg.wait_for_function(f"window.__mgs.step !== {step}", timeout=5000)
            except Exception:
                fail(f"the right mystery answer was not accepted (question {n + 1})")
                break

        elif k == "end":
            if "Secret ending" not in pg.inner_text("#panel"):
                fail("all four diary pages were found but the secret ending did not show")
            pg.fill("#hsName", "TESTER")
            pg.press("#hsName", "Enter")
            try:
                pg.wait_for_function("document.querySelector('#rankMsg').textContent.trim().length > 0", timeout=5000)
            except Exception:
                fail("high score did not save")
            if "TESTER" not in pg.inner_text(".end-board"):
                fail("saved name is missing from the high score board")
            break

        else:
            pg.wait_for_timeout(150)

    secs = round(time.time() - started)
    print(f"  {seen['runs']} runs, {seen['jigsaws']} jigsaws, {seen['words']} words, {seen['clues']} clues, {seen['parts']} parts, "
          f"{seen['deduce']} mystery answers, {seen['songs']} songs, {secs}s")
    print("  " + ", ".join(f"{n} {'ok' if seen[n] else 'not seen'}" for n in
                           ("crashrestart", "checkpoints", "peek", "fix", "scan", "refuel", "wrongclue", "roar", "poke", "resumed", "modeswitch", "ship")))
    expect = {"runs": 5, "jigsaws": 4, "words": 4, "clues": 4, "parts": 4, "paints": 1, "deduce": 4, "songs": 7}
    for name, n in expect.items():
        if seen[name] != n:
            fail(f"Mini Game Survival: expected {n} {name}, got {seen[name]}")
    for name in ("crashrestart", "checkpoints", "peek", "fix", "scan", "refuel", "wrongclue", "roar", "poke", "resumed", "modeswitch", "ship"):
        if not seen[name]:
            fail(f"Mini Game Survival never exercised: {name}")
    ctx.close()


def main():
    quick = "--quick" in sys.argv[1:]
    header_check()
    build_check()
    from playwright.sync_api import sync_playwright
    srv, base = serve()
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            load_check(browser, base)
            if not quick:
                out = json.loads((LIB / "games/starward/game.json").read_text(encoding="utf-8"))["output"]
                playthrough(browser, base, out)
                out = json.loads((LIB / "games/mini-game-survival/game.json").read_text(encoding="utf-8"))["output"]
                mgs_easy_check(browser, base, out)
                mgs_playthrough(browser, base, out)
            browser.close()
    finally:
        srv.shutdown()
    if failures:
        print(f"FAIL ({len(failures)})")
        for f in failures:
            print("  -", f)
        sys.exit(1)
    print("PASS")


if __name__ == "__main__":
    main()
