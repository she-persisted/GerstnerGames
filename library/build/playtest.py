#!/usr/bin/env python3
"""
@file build/playtest.py
@about Automated play-test for the library: checks file headers, checks the built pages match the source, loads every page in headless Chromium at Chromebook size, measures that Mini Game Survival's looks fit T-Rexy and T-Rexy fits his cockpit, and plays Starward and Mini Game Survival start to finish (every run, puzzle, flight, and secret, the ending, and the high score). Must pass before every commit that changes library/.
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
  5. Mini Game Survival art (runs in --quick too): the space helmet holds T-Rexy's whole head in every face and pose; every
     head portrait box holds his head and hat, and every picture of him holds all of him in every look, pose, and direction;
     in every cockpit and every hat a pilot can wear, at least 92% of his head is inside the glass and none of it is above it.
     Every kind of sky event (shooting star, meteor shower, comet, satellite, rocket, twinkle) draws, and none appears with
     reduce motion on.
  6. Mini Game Survival, with fresh browsers:
     - The question library is checked (8 versions of every mystery question, each answer one of its options, Nova never named
       before the reveal; 6 clue lines at each typing level; 8 science facts, 14 bonus facts, and 4 memory texts per portal; no
       repeats; plenty of clue words at each level), and so is the dealer: every version comes up once before any repeats, never
       twice in a row, and a half-used deck carries over to the next game.
     - Memory pieces and beats: 90 runs are built at levels 1 to 6. Every piece must be catchable on the winning and secret
       routes, every chunk must start on the music's beat, and a hop pressed right on the beat must clear the first obstacle
       of every chunk one hop can clear. The recorded villain laughs and dino noises must decode, and the dino noises must
       cover every mood and make sound at every voice pitch.
     - Easy mode: L and R move through story lines; the first run must be level 1 (the slowest) with checkpoints on,
       pressing again in the air must double hop, R must skip the run, and the memory must then have holes (clues kept).
     - The full playthrough is in Hard mode. No screen may show a count of attempts.
     - Title, then the story lines (Enter), then the crash pad: switch modes there and back, type ROAR and poke Shadowspine
       (Easter eggs), take a look off and on in T-Rexy's closet, click each portal.
     - Hints never cover the play area: on the crash pad they stay above T-Rexy and the portals, in a run they stay in the
       floor under the track, and in a jigsaw they stay off the board.
     - Runs: checkpoints are on from the start (no Checkpoints button). The first run is left alone until T-Rexy crashes
       twice: a crash with no key pressed must show a Hint with the keys, the first crash must send him back to the start,
       and the music must be in time with the run. Then the built-in autopilot (the level's own solution, sped up) finishes
       every run and takes the secret route, so all four hidden diary pages must be found. R must not skip a Hard run.
       Fern Moon misses 3 pieces on purpose and is run again with A; Lantern Lab misses 2 and must offer only Run it again.
       Every run must end with every piece caught, which unlocks 5 of T-Rexy's looks.
     - Jigsaws: Peek and Fix one are used on the first; every jigsaw is solved by clicking tiles; none may have holes.
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


def new_page(browser, tag, console_ok=False, **ctx_opts):
    ctx = browser.new_context(**({"viewport": {"width": SIZE[0], "height": SIZE[1]}} | ctx_opts))
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
  if (panel.querySelector('#runAgain')) return { kind: 'choice', sig, ready: !panel.querySelector('#runAgain').disabled };
  const prim = panel.querySelector('[data-primary]');
  if (vis(prim) && !prim.disabled) return { kind: 'primary', sig };
  return { kind: 'busy', sig, bonus: !!panel.querySelector('.bonusline') };
}"""


ART_CHECK_JS = r"""() => {
  const A = Kit.art, bad = [], ok = (name, svg) => {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    if (doc.querySelector("parsererror")) bad.push(name);
  };
  for (const pose of ["stand", "run1", "run2", "hop", "sit"])
    for (const face of ["smile", "blink", "happy", "excited", "determined", "worried", "surprised", "think", "dizzy", "sleepy"])
      for (const acc of ["none", "flower", "glasses", "bow", "cap"]) ok(`trexy ${pose} ${face} ${acc}`, A.trexy.svg({ pose, face, acc }));
  const LK = A.trexy.LOOKS;
  for (const acc of ["none", ...Object.keys(LK.head)]) for (const back of ["", ...Object.keys(LK.back)]) for (const skin of ["", ...Object.keys(LK.skin)])
    for (const pose of ["stand", "run1", "hop"]) ok(`trexy look ${acc} ${back} ${skin} ${pose}`, A.trexy.svg({ pose, acc, back, skin, flip: pose === "run1" }));
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


# Every look must fit T-Rexy, and T-Rexy must fit the ship. Draws each combination in a hidden SVG and measures it:
# - the space helmet holds his whole head, snout, face, and any sweat drop or sparkle, in every face and pose;
# - headBox() (portraits and closet buttons) holds his head and hat for every hat, and view() (every picture of him)
#   holds all of him, in every look, pose, and direction;
# - in every cockpit, in every hat a pilot can wear, his head sits on the seat inside the glass: at least 92% of his head and
#   hat above the cockpit floor is inside the canopy, and none of it is above the canopy's top.
FIT_CHECK_JS = r"""() => {
  const A = Kit.art, T = A.trexy, S = A.ship, bad = [], NS = "http://www.w3.org/2000/svg";
  const host = document.createElementNS(NS, "svg");
  host.setAttribute("width", "1000"); host.setAttribute("height", "1000"); host.setAttribute("viewBox", "-500 -500 1000 1000");
  host.style.cssText = "position:absolute;left:-2000px;top:0;visibility:hidden";
  document.body.appendChild(host);
  const put = m => { host.innerHTML = `<g id="fitref"></g>${m}`; return host; };
  const toRef = el => host.querySelector("#fitref").getCTM().inverse().multiply(el.getCTM());
  const pts = (el, n = 40) => {
    const M = toRef(el), len = el.getTotalLength ? el.getTotalLength() : 0, out = [];
    for (let i = 0; i <= n && len; i++) { const p = el.getPointAtLength(len * i / n); out.push(new DOMPoint(p.x, p.y).matrixTransform(M)); }
    return out;
  };
  const geo = sel => [...host.querySelectorAll(sel)].flatMap(g => [g, ...g.querySelectorAll("path,ellipse,circle,polygon,rect,line")]).filter(e => e.getTotalLength);
  const bbox = sel => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const el of geo(sel)) for (const p of pts(el, 24)) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
    return { x0, y0, x1, y1 };
  };
  const FACES = ["smile", "blink", "happy", "excited", "determined", "worried", "surprised", "think", "dizzy", "sleepy"];
  const H = T.HELMET;
  // 1. The helmet holds the whole head.
  for (const pose of ["stand", "hop", "sit"]) for (const face of FACES) {
    put(T.g({ pose, face, acc: "helmet" }));
    const glass = host.querySelector('[data-part="helmet"]'), M = toRef(glass).inverse();
    let worst = 0;
    for (const el of geo('[data-part="head"]')) for (const p of pts(el)) {
      const q = p.matrixTransform(M), k = ((q.x - H.cx) / (H.rx - 1.4)) ** 2 + ((q.y - H.cy) / (H.ry - 1.4)) ** 2;
      if (q.y > H.collar + 2.5) worst = Math.max(worst, 2); else worst = Math.max(worst, k);
    }
    if (worst > 1) bad.push(`space helmet doesn't hold his head (${pose}, ${face}): ${worst.toFixed(2)}`);
  }
  // 2. headBox() and view() hold what they should.
  const heads = ["none", "cap", "flower", "bow", "glasses", ...Object.keys(T.LOOKS.head)];
  for (const acc of heads) for (const face of ["smile", "excited", "worried", "dizzy"]) {
    put(T.g({ face, acc }));
    const b = bbox('[data-part="head"],[data-part="hat"]'), hb = T.headBox({ acc });
    if (b.x0 < hb.x - .6 || b.y0 < hb.y - .6 || b.x1 > hb.x + hb.w + .6 || b.y1 > hb.y + hb.h + .6)
      bad.push(`headBox for ${acc} (${face}) misses part of his head: ${[b.x0, b.y0, b.x1, b.y1].map(n => n.toFixed(1))}`);
  }
  for (const acc of heads) for (const back of ["", ...Object.keys(T.LOOKS.back)]) for (const pose of ["stand", "run1", "run2", "hop"]) for (const flip of [false, true]) {
    if (["flower", "bow", "glasses"].includes(acc) && (pose !== "stand" || back)) continue; // his family only stands, and wears no looks
    const o = { pose, acc, back, flip, face: "excited" }; put(T.g(o));
    const b = bbox("svg > g:not(#fitref)"), [vx, vy, vw, vh] = T.view(o).split(" ").map(Number);
    if (b.x0 < vx - .3 || b.y0 < vy - .3 || b.x1 > vx + vw + .3 || b.y1 > vy + vh + .3)
      bad.push(`picture of T-Rexy cuts off part of him (${acc}, ${back || "no back"}, ${pose}${flip ? ", flipped" : ""}): ${[b.x0, b.y0, b.x1, b.y1].map(n => n.toFixed(1))}`);
  }
  // 3. The pilot sits inside the cockpit.
  let fits = [];
  for (const [cockpit] of S.PARTS.cockpit.options) for (const acc of ["none", "helmet", "shades", "crown", "headphones"]) for (const scale of [0, .3]) {
    put(S.svg({ cockpit, wings: "fern", thrusters: "two", core: "pink", paint: "lime" }, { pilot: T.pilot({ acc, face: "excited" }), pilotScale: scale }));
    const K = S.CANOPY[cockpit], canopy = host.querySelector('[data-part="canopy"]'), M = toRef(canopy).inverse();
    let inside = 0, above = 0, over = 0;
    for (const el of geo('[data-part="pilot"] [data-part="head"],[data-part="pilot"] [data-part="hat"]')) for (const p of pts(el)) {
      const q = p.matrixTransform(M); if (q.y > K.floor) continue;
      above++; if (canopy.isPointInFill(new DOMPoint(q.x, q.y))) inside++; if (q.y < K.top - .5) over++;
    }
    const f = above ? inside / above : 0; fits.push(f);
    if (f < .92 || over) bad.push(`pilot in the ${cockpit} cockpit (${acc}${scale ? ", ride size" : ""}): only ${Math.round(f * 100)}% inside the glass${over ? `, ${over} points above the canopy` : ""}`);
  }
  host.remove();
  return { bad, minFit: Math.min(...fits) };
}"""


# Shooting stars and friends: every kind of sky event must draw something on a canvas, and nothing at all with reduce motion on.
SKY_CHECK_JS = r"""() => {
  const out = {};
  for (const kind of ["meteor", "shower", "comet", "satellite", "rocket", "twinkle"]) {
    const sky = Kit.skyEvents.create({ first: 9999, every: [9999, 9999] }), c = document.createElement("canvas"); c.width = 400; c.height = 240;
    const ctx = c.getContext("2d"); let most = 0;
    sky.next(kind);
    for (let t = 0; t <= 6000; t += 300) {
      ctx.clearRect(0, 0, 400, 240); sky.draw(ctx, { w: 400, h: 240, t: 1000 + t }, ["#21d9ff", "#ff6be0", "#ffe94a"]);
      const d = ctx.getImageData(0, 0, 400, 240).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 20) n++;
      most = Math.max(most, n);
    }
    out[kind] = most;
  }
  return out;
}"""


# A hint must never cover the play area: on the crash pad it stays above T-Rexy and the portals, in a run it stays in the
# floor under the track, and in a jigsaw it stays off the board. Returns null if that place isn't on screen right now.
HINT_CLEAR_JS = r"""(where) => {
  const h = document.querySelector("#hint.on"), cv = document.querySelector("#cv");
  if (!h) return { ok: false, why: "no hint showing" };
  const hr = h.getBoundingClientRect(), cr = cv.getBoundingClientRect();
  if (where === "hub") { const v = window.__mgs.hub(); if (!v) return null;
    const room = v.ground - 2.9 * v.T; return { ok: hr.bottom - cr.top <= room + .5, why: `hint bottom ${Math.round(hr.bottom - cr.top)}px, portals and T-Rexy start at ${Math.round(room)}px` }; }
  if (where === "run") { const r = window.__mgs.run(); if (!r) return null;
    const floor = cr.height - 1.7 * r.tile; return { ok: hr.top - cr.top >= floor - .5, why: `hint top ${Math.round(hr.top - cr.top)}px, the track is at ${Math.round(floor)}px` }; }
  if (where === "jig") { const b = document.querySelector("#boardHost .jig"); if (!b) return null; const br = b.getBoundingClientRect();
    const hit = !(hr.bottom <= br.top || hr.top >= br.bottom || hr.right <= br.left || hr.left >= br.right);
    return { ok: !hit, why: `hint ${Math.round(hr.top)} to ${Math.round(hr.bottom)}px, board ${Math.round(br.top)} to ${Math.round(br.bottom)}px` }; }
  return null;
}"""


def hint_clear(pg, where, seen):
    """Shows a test hint (unless one is already up) and checks it stays off the play area."""
    if seen.get("hintclear_" + where):
        return
    if not pg.evaluate("!!document.querySelector('#hint.on')"):
        pg.evaluate("window.__mgs.hint('Hint: just checking where hints go')")
        pg.wait_for_timeout(300)
    r = pg.evaluate(HINT_CLEAR_JS, where)
    if r is None:
        return
    seen["hintclear_" + where] = True
    if not r["ok"]:
        fail(f"a hint covers the play area ({where}): {r['why']}")


def mgs_save(pg):
    return pg.evaluate("() => { try { return JSON.parse(localStorage.getItem('mgs.save.v3')); } catch (e) { return null; } }") or {}


QBANK_CHECK_JS = r"""() => {
  const bad = [], QBANK = window.__mgs.qbank;
  QBANK.mystery.forEach((m, n) => { if (m.v.length < 8 || !m.nope || !m.clue) bad.push(`mystery ${n} needs 8 versions, a clue, and a hint`);
    m.v.forEach((v, i) => { if (!(v.a >= 0 && v.a < v.opts.length)) bad.push(`mystery ${n}.${i} answer is not an option`); if (new Set(v.opts).size !== v.opts.length) bad.push(`mystery ${n}.${i} repeats an option`);
      if (/nova/i.test(v.q + v.opts.join(" "))) bad.push(`mystery ${n}.${i} names Nova before the player meets her`); }); });
  for (const p of ["echo", "fern", "lantern", "whirl"]) {
    if (QBANK.lines[p].length !== 3 || QBANK.lines[p].some(l => l.length < 6)) bad.push(`clue lines for ${p} need six lines at each of three typing levels`);
    if (QBANK.facts[p].length < 8 || QBANK.bonus[p].length < 14 || QBANK.saw[p].length < 4) bad.push(`not enough facts or memory texts for ${p}`);
    for (const list of [QBANK.lines[p].flat(), QBANK.facts[p], QBANK.bonus[p], QBANK.saw[p]]) if (new Set(list).size !== list.length) bad.push(`a ${p} list repeats itself`);
  }
  for (const [t, list] of Object.entries(Kit.words.clues)) for (const d of [1, 2, 3]) if (list.filter(w => w[1] === d).length < 8) bad.push(`clue words: only a few level ${d} ${t} words`);
  // Dealing: every version comes up once before any repeats, a new deck never starts with the last one dealt, and decks last across games.
  const keep = localStorage.getItem("mgs.decks"), got = [];
  for (let i = 0; i < 40; i++) got.push(window.__mgs.deal("test.deck", 8));
  for (let b = 0; b < 40; b += 8) if (new Set(got.slice(b, b + 8)).size !== 8) bad.push(`deck ${b / 8} repeated a version before using them all: ${got.slice(b, b + 8)}`);
  for (let i = 1; i < 40; i++) if (got[i] === got[i - 1]) bad.push(`the same version came up twice in a row: ${got}`);
  const half = [0, 1, 2].map(() => window.__mgs.deal("test.deck", 8)), stored = JSON.parse(localStorage.getItem("mgs.decks"))["test.deck"];
  if (stored.left.length !== 5 || half.some(x => stored.left.includes(x))) bad.push("a half-used deck isn't kept for the next game");
  if (keep === null) localStorage.removeItem("mgs.decks"); else localStorage.setItem("mgs.decks", keep);
  return bad;
}"""


# Every memory piece in every run must be catchable: on the winning path AND on the secret route, not touching anything,
# and sitting on the ground (not floating up high). Builds many runs at every level, the way the game does, and checks each.
RUN_CHECK_JS = r"""() => {
  const R = Kit.runner, LV = window.__mgs.levels, bad = [], t0 = performance.now();
  let made = 0, short = 0;
  const rngOf = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const SECS = [14, 16, 18, 20, 22, 24, 30], BPM = [140, 144, 148, 152, 156];
  // A hop pressed right on the beat must clear each chunk's first obstacle (for chunks one hop can clear).
  const ONE_HOP = new Set(["spike", "spike-spike", "spike-2", "spike-run", "spike-pit", "step", "step-spike", "step-spike-step", "hop-gap", "gap-2", "gap-3", "low-ceiling"]);
  let beatHops = 0, offBeat = 0;
  for (let level = 1; level <= 6; level++) {
    const L = LV[level];
    const runs = [9, 12, 16].flatMap(pieces => [1, 2, 3, 4].map(seed => ({ pieces, seed, secret: true, ships: L.ships })))
      .concat([1, 2, 3].map(seed => ({ pieces: 8, seed: seed + 50, secret: false, ships: L.ships + 1 })));
    for (const r of runs) {
      const secs = SECS[(r.seed * 7 + level) % SECS.length], beat = 60 / BPM[(r.seed + level) % BPM.length];
      const G = R.generate({ chunks: Kit.levels.runner, level, speed: L.speed, space: L.space, ships: r.ships, length: L.speed * secs, pieces: r.pieces, secret: r.secret, beat, rng: rngOf(level * 1000 + r.seed * 31 + r.pieces) });
      for (const a of G.beat.actions) { const k = (a - .5) / G.beat.tiles; if (Math.abs(k - Math.round(k)) > 1e-6) offBeat++; }
      const DT = R.sim.DT, states = [], s0 = R.sim.start(.5);
      for (let i = 0; i < G.inputs.length; i++) { states.push(R.sim.clone(s0)); R.sim.step(s0, G.inputs[i], G.L); }
      for (const sp of G.spans) {
        if (!ONE_HOP.has(sp.id)) continue;
        const ax = G.beat.actions.find(a => a > sp.x0 - .01 && a < sp.x1), i0 = ax == null ? -1 : states.findIndex(q => q.x >= ax - G.beat.tiles * 1.2);
        if (i0 < 0 || !states[i0].grounded) continue;
        const q = R.sim.clone(states[i0]), fBeat = Math.round((ax - .5) / L.speed / DT);
        while (q.alive && q.t < fBeat + Math.round(.5 / DT)) R.sim.step(q, q.t === fBeat, G.L);
        beatHops++;
        if (!q.alive) bad.push(`level ${level}: a hop on the beat doesn't clear the first ${sp.id} (x ${sp.x0.toFixed(1)})`);
      }
      made++;
      const got = G.L.objs.filter(o => o.k === "m").length;
      if (got < r.pieces) { short++; bad.push(`level ${level}, ${secs}s run: only ${got} of ${r.pieces} pieces placed`); }
      for (const p of R.sim.checkPieces(G)) bad.push(`level ${level}, ${r.pieces} pieces, seed ${r.seed}: ${p}`);
    }
  }
  if (offBeat) bad.push(`${offBeat} chunks don't start on the beat`);
  return { made, short, beatHops, bad: bad.slice(0, 12), count: bad.length, ms: Math.round(performance.now() - t0) };
}"""


def mgs_art_check(browser, base, rel):
    ctx, pg = new_page(browser, "mgs art fit")
    pg.goto(base + rel)
    pg.wait_for_selector("#playBtn")
    r = pg.evaluate(FIT_CHECK_JS)
    for b in r["bad"][:8]:
        fail(f"art fit: {b}")
    if len(r["bad"]) > 8:
        fail(f"art fit: {len(r['bad']) - 8} more problems")
    sky = pg.evaluate(SKY_CHECK_JS)
    for kind, n in sky.items():
        if n < 20:
            fail(f"sky events: a {kind} drew nothing")
    ctx.close()
    ctx, pg = new_page(browser, "mgs sky reduced", reduced_motion="reduce")
    pg.goto(base + rel)
    pg.wait_for_selector("#playBtn")
    calm = pg.evaluate(SKY_CHECK_JS)
    for kind, n in calm.items():
        if n:
            fail(f"sky events: a {kind} appeared with reduce motion on")
    ctx.close()
    print(f"  art fit: helmet holds his head in every face and pose, every look fits its picture, the pilot sits inside every cockpit ({round(r['minFit'] * 100)}%+ inside the glass); "
          f"sky events: {', '.join(k for k, n in sky.items() if n >= 20)} all draw, none with reduce motion")


def mgs_pieces_check(browser, base, rel):
    ctx, pg = new_page(browser, "mgs memory pieces")
    pg.goto(base + rel)
    pg.wait_for_selector("#playBtn")
    r = pg.evaluate(RUN_CHECK_JS)
    for b in r["bad"]:
        fail(f"memory pieces: {b}")
    if r["count"] > len(r["bad"]):
        fail(f"memory pieces: {r['count'] - len(r['bad'])} more problems")
    print(f"  memory pieces and beats: {r['made']} runs built at levels 1 to 6, {'every piece catchable, ' + str(r['beatHops']) + ' hops on the beat all clear' if not r['count'] else str(r['count']) + ' problems'} ({r['ms'] // 1000}s)")
    # The recorded villain laughs must decode in Chrome, and last about as long as the game thinks (it animates Shadowspine's jaw to them).
    laughs = pg.evaluate("""async () => Promise.all((Kit.sounds && Kit.sounds.villainLaughs || []).map(async c => {
      const b = await Kit.voices.clipBuffer(new OfflineAudioContext(1, 24000, 24000), c);
      return { id: c.id, want: c.seconds, got: b ? b.duration : 0 };
    }))""")
    if not laughs:
        fail("no recorded villain laughs in the game")
    for l in laughs:
        if not l["got"] or abs(l["got"] - l["want"]) > .15:
            fail(f"villain laugh {l['id']} did not decode right ({l['got']:.2f}s, expected {l['want']}s)")
    print("  villain laughs: " + ", ".join(f"{l['id']} {l['got']:.1f}s" for l in laughs))
    # The cute dino noises must decode, cover every mood the game asks for, and actually make sound at the pitches the game uses.
    chirps = pg.evaluate("""async () => {
      const list = (Kit.sounds && Kit.sounds.dinoChirps) || [], out = { clips: [], moods: [...new Set(list.map(c => c.mood))], loud: [] };
      for (const c of list) { const b = await Kit.voices.clipBuffer(new OfflineAudioContext(1, 24000, 24000), c); out.clips.push({ id: c.id, want: c.seconds, got: b ? b.duration : 0 }); }
      for (const [mood, pitch] of [["happy", 1], ["excited", 1.4], ["curious", .74]]) {
        const oc = new OfflineAudioContext(1, 44100, 44100);
        for (const c of list) await Kit.voices.clipBuffer(oc, c);
        const secs = Kit.voices.chirp({ ctx: oc, mood, pitch });
        await new Promise(r => setTimeout(r, 30));
        const buf = await oc.startRendering(), d = buf.getChannelData(0);
        let peak = 0; for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]));
        out.loud.push({ mood, pitch, secs, peak });
      }
      return out;
    }""")
    if len(chirps["clips"]) < 4:
        fail("not enough recorded dino noises in the game")
    for c in chirps["clips"]:
        if not c["got"] or abs(c["got"] - c["want"]) > .1:
            fail(f"dino noise {c['id']} did not decode right ({c['got']:.2f}s, expected {c['want']}s)")
    for m in ["happy", "excited", "curious"]:
        if m not in chirps["moods"]:
            fail(f"no {m} dino noise")
    for l in chirps["loud"]:
        if l["secs"] <= 0 or l["peak"] < .1:
            fail(f"a {l['mood']} dino noise at pitch {l['pitch']} made no sound (peak {l['peak']:.3f})")
    print("  dino noises: " + ", ".join(f"{c['id']} {c['got']:.2f}s" for c in chirps["clips"]) + "; all moods play at every voice pitch")
    ctx.close()


def mgs_wait_kind(pg, kinds, tries=60, click_next=True):
    """Clicks visible Next buttons until the screen is one of kinds. Returns the state, or None."""
    for _ in range(tries):
        st = pg.evaluate(MGS_STATE_JS)
        if st["kind"] in kinds:
            return st
        if click_next and st["kind"] == "primary":
            nxt = pg.locator("#panel [data-primary]")
            if nxt.count() and nxt.first.is_visible():
                nxt.first.click()
        pg.wait_for_timeout(200)
    return None


def mgs_step_type(pg):
    return pg.evaluate("window.__mgs.steps[window.__mgs.step]")


def mgs_easy_check(browser, base, rel):
    """Easy mode: slower first run with checkpoints already on, and the double hop works."""
    ctx, pg = new_page(browser, "mgs easy mode")
    pg.goto(base + rel)
    pg.wait_for_selector("#playBtn")
    pg.keyboard.press("e")
    pg.click("#playBtn")
    pg.wait_for_selector("#panel .say [data-primary]")
    s0 = pg.evaluate("window.__mgs.step")
    pg.wait_for_timeout(250)
    pg.keyboard.press("r"); pg.wait_for_timeout(250)
    s1 = pg.evaluate("window.__mgs.step")
    pg.keyboard.press("l"); pg.wait_for_timeout(250)
    s2 = pg.evaluate("window.__mgs.step")
    pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(250)
    s3 = pg.evaluate("window.__mgs.step")
    if not (s1 > s0 and s2 == s0 and s3 == s1):
        fail(f"L and R did not move through the story lines (steps {s0}, then R {s1}, L {s2}, right arrow {s3})")
    if not pg.locator("#panel .say .navhint").count():
        fail("story lines don't show the L and R keys")
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
    # R skips the run. Nothing was caught, so it offers to run it again. L goes back a story line, and R from there
    # skips the finished run and lands on the jigsaw, with glitchy holes for every piece that got away.
    run_step = pg.evaluate("window.__mgs.step")
    pg.wait_for_timeout(250)
    pg.keyboard.press("r")
    st = mgs_wait_kind(pg, ["choice"], tries=20, click_next=False)
    if not st:
        fail("R did not skip the run")
        ctx.close()
        return
    if "skipped" not in pg.inner_text("#panel"):
        fail("the screen after a skipped run doesn't say it was skipped")
    pg.wait_for_timeout(250)
    pg.keyboard.press("l"); pg.wait_for_timeout(300)
    back = pg.evaluate("window.__mgs.step")
    if not (back < run_step and mgs_step_type(pg) == "say"):
        fail(f"L after a run did not go back to a story line (step {back})")
    pg.keyboard.press("r"); pg.wait_for_timeout(500)
    if mgs_step_type(pg) != "jigsaw":
        fail(f"R did not skip the finished run (landed on a {mgs_step_type(pg)} step)")
    else:
        gaps = pg.evaluate("""() => { const t = document.querySelectorAll('.jig .jt').length, g = document.querySelectorAll('.jig .jt.gone').length;
          const side = Math.round(Math.sqrt(t)), grid = t === 12 ? [3, 4] : [side, side];
          return { t, g, keep: Kit.art.memories.clueTiles('home', grid[0], grid[1]).size }; }""")
        if gaps["g"] != gaps["t"] - gaps["keep"]:
            fail(f"a run with no pieces caught should leave {gaps['t'] - gaps['keep']} holes in the memory (every tile but the clues), found {gaps['g']}")
        print(f"  L and R: story lines, skip a run, back, forward past the finished run; jigsaw has {gaps['g']} holes, clues kept")
    ctx.close()


MGS_RESUME_JS = r"""step => { localStorage.setItem('mgs.save.v3', JSON.stringify({ v: 3, mode: 'easy', step, seed: 12345, moved: true })); }"""


def mgs_resume_at(pg, base, rel, kind):
    """Saves a game that stopped at the first step of this kind, reloads, and taps Keep going. Returns the step number."""
    step = pg.evaluate(f"window.__mgs.steps.indexOf({json.dumps(kind)})")
    pg.evaluate(MGS_RESUME_JS, step)
    pg.goto(base + rel)
    pg.wait_for_selector("#resumeBtn")
    pg.tap("#resumeBtn")
    pg.wait_for_timeout(500)
    return step


def mgs_touch_check(browser, base, rel):
    """A phone: touch mode turns on, the page fits the screen, the back and forward buttons work, tapping walks and hops,
    runs are wide enough to see what's coming, and the phone's keyboard types a clue without any letter counted twice."""
    ctx, pg = new_page(browser, "mgs phone", viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg.goto(base + rel)
    pg.wait_for_selector("#playBtn")
    look = pg.evaluate("""() => ({ touchy: document.body.classList.contains('touchy'), wide: document.documentElement.scrollWidth - innerWidth,
      badges: [...document.querySelectorAll('#panel .kbd')].filter(k => k.offsetParent !== null).length })""")
    if not look["touchy"]:
        fail("phone: touch mode did not turn on")
    if look["wide"] > 1:
        fail(f"phone: the title screen is {look['wide']}px wider than the phone, so the page scrolls sideways")
    if look["badges"]:
        fail(f"phone: {look['badges']} key badges still show in touch mode")
    # Story: the back and forward buttons show (instead of the L and R tip) and step through the story.
    say = mgs_resume_at(pg, base, rel, "say")
    vis = pg.evaluate("""() => ({ pad: getComputedStyle(document.querySelector('#navPad')).display, tip: (document.querySelector('.navhint') || {}).offsetParent !== null })""")
    if vis["pad"] == "none" or vis["tip"]:
        fail(f"phone: story lines should show the back and forward buttons, not the L and R tip ({vis})")
    pg.tap("#navFwd"); pg.wait_for_timeout(400)
    fwd = pg.evaluate("window.__mgs.step")
    pg.tap("#navBack"); pg.wait_for_timeout(400)
    back = pg.evaluate("window.__mgs.step")
    if not (fwd > say and back == say):
        fail(f"phone: the forward and back buttons went from step {say} to {fwd} and back to {back}")
    # The crash pad: tapping a portal walks T-Rexy there.
    mgs_resume_at(pg, base, rel, "hub")
    h0 = pg.evaluate("window.__mgs.hub()")
    if not h0:
        fail("phone: the crash pad did not open")
    else:
        box = pg.locator("#cv").bounding_box()
        x = box["x"] + max(4, min(box["width"] - 4, (h0["portals"]["echo"] - h0["camX"]) * h0["T"]))
        pg.touchscreen.tap(x, box["y"] + h0["ground"] - h0["T"] * .6)
        pg.wait_for_timeout(900)
        h1 = pg.evaluate("window.__mgs.hub()")
        if h1 and abs(h1["heroX"] - h0["heroX"]) < .5:
            fail("phone: tapping a portal on the crash pad did not walk T-Rexy toward it")
    # A run: at least 15 tiles fit across, and a tap hops.
    mgs_resume_at(pg, base, rel, "run")
    st = None
    for _ in range(40):
        st = pg.evaluate("window.__mgs.run()")
        if st and st.get("t", 0) > .3:
            break
        pg.wait_for_timeout(150)
    if not st:
        fail("phone: the run did not start")
    else:
        box = pg.locator("#cv").bounding_box()
        pg.touchscreen.tap(box["x"] + box["width"] * .6, box["y"] + box["height"] * .5)
        up = False
        for _ in range(12):
            pg.wait_for_timeout(40)
            r = pg.evaluate("window.__mgs.run()") or {}
            if r.get("y", 0) > .05 or r.get("vy", 0) > 0 or r.get("grounded") is False:
                up = True
                break
        if not up:
            fail("phone: tapping the run did not hop")
        T = (pg.evaluate("window.__mgs.run()") or {}).get("tile", 0)
        if not T or box["width"] / T < 14.9:
            fail(f"phone: only {box['width'] / max(T, 1):.1f} tiles fit across the run (want at least 15)")
    pg.keyboard.press("r"); pg.wait_for_timeout(300)
    # Typing a clue with the phone's keyboard: half the letters as a phone keyboard sends them (text only, no key names),
    # half as key presses. Every letter must count once.
    mgs_resume_at(pg, base, rel, "clue")
    if not pg.locator(".phonekeys").is_visible():
        fail("phone: the Open keyboard button is missing on the clue typing screen")
    else:
        pg.tap(".phonebox")
        text = pg.evaluate("document.querySelector('#lineText').textContent")
        half = len(text) // 2
        for ch in text[:half]:
            pg.keyboard.insert_text(ch)
        pg.keyboard.type(text[half:], delay=15)
        pg.wait_for_timeout(500)
        typ = pg.evaluate("window.__mgs.typing()")
        done = pg.locator("#panel .feedback.good").count()
        if not done or typ["misses"] or typ["hits"] != len(text):
            fail(f"phone: typing \"{text}\" with the phone keyboard counted {typ['hits']} letters and {typ['misses']} misses (want {len(text)} and 0)")
    if SHOTS:
        pg.screenshot(path=str(pathlib.Path(SHOTS) / "mgs-phone-clue.png"))
    print("  phone: touch mode, fits the screen, back and forward buttons, tap to walk and hop, 15+ tiles across runs, phone keyboard types once per letter")
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
            "wrongclue": False, "roar": False, "poke": False, "resumed": False, "modeswitch": False, "ship": False,
            "hint": False, "rerun": False, "bonus": False, "noskip": False, "hardall": False, "closet": False, "musicsync": False}
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
        if st.get("bonus"):
            seen["bonus"] = True  # the screen after a run where every piece was caught
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
                pg.keyboard.press("h")  # the full playthrough is in Hard mode, which needs every memory piece
                pg.click("#playBtn")
                pg.wait_for_timeout(350)

        elif k == "primary":
            pg.locator("#panel [data-primary]").click()
            pg.wait_for_timeout(260)
            if "new song" in st["sig"].lower():
                song_steps.add(st["sig"])  # the step number is part of the signature, so each song counts once
                seen["songs"] = len(song_steps)

        elif k == "hub":
            hint_clear(pg, "hub", seen)
            s = mgs_save(pg)
            done = s.get("done") or []
            if len(done) == 1 and not reloaded:
                reloaded = True
                pg.reload()
                pg.wait_for_selector("#playBtn")
                continue
            if not seen["closet"] and pg.locator("#panel .lookbtn[data-look]").count():
                before = pg.evaluate("window.__mgs.looks()")
                pg.locator("#panel .lookbtn[data-look]").first.click(); pg.wait_for_timeout(120)
                after = pg.evaluate("window.__mgs.looks()")
                seen["closet"] = before.get("head") == "helmet" and after.get("head") == ""
                if not seen["closet"]:
                    fail(f"the closet didn't take the Space Helmet off ({before}, {after})")
                    seen["closet"] = True
                pg.locator("#panel .lookbtn[data-look]").first.click(); pg.wait_for_timeout(120)  # and back on
                pg.locator("#cv").focus()
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
                # Fern Moon: miss 3 pieces, then run it again to catch them. Lantern Lab: miss 2 and keep going.
                drop = {2: 3, 3: 2}.get(seen["runs"], 0)
                pg.evaluate(f"window.__mgsDrop = {drop}")
            if seen["runs"] == 1 and not seen["hint"] and r.get("crashes", 0) >= 1:
                seen["hint"] = pg.evaluate("(() => { const h = document.querySelector('#hint.on'); return !!h && /Hint:/.test(h.textContent) && /Space/.test(h.textContent); })()")
                if not seen["hint"]:
                    fail("crashing without pressing anything did not show a Hint with the keys to press")
                    seen["hint"] = True
                else:
                    hint_clear(pg, "run", seen)
            if seen["runs"] == 2 and not seen["noskip"]:  # Hard mode: R can't skip a portal run
                pg.keyboard.press("r"); pg.wait_for_timeout(350)
                seen["noskip"] = pg.evaluate("window.__mgs.mode") == "run" and "hard mode" in (pg.text_content("#hint") or "").lower()
                if not seen["noskip"]:
                    fail("in Hard mode, R skipped a portal run (or said nothing)")
                    seen["noskip"] = True
            if seen["runs"] == 1 and not seen["checkpoints"]:
                if r.get("crashes", 0) >= 1 and r.get("alive") and r.get("x", 99) < 6:
                    seen["crashrestart"] = True
                if not seen["musicsync"]:
                    m = pg.evaluate("(() => { const r = window.__mgs.run(); return r ? { t: r.t, alive: r.alive, pos: window.__mgs.music() } : null; })()")
                    if m and m["alive"] and m["t"] > 90:
                        if m["pos"] is None or abs(m["pos"] - m["t"] / 120) > .2:
                            fail(f"the music isn't in time with the run (run at {m['t'] / 120:.2f}s, music at {m['pos']})")
                        seen["musicsync"] = True
                if r.get("crashes", 0) >= 2:
                    seen["checkpoints"] = bool(r.get("checkpoints")) and not pg.locator("#cpBtn").count()
                    if not seen["checkpoints"]:
                        fail("Hard mode runs should have checkpoints on from the start, with no Checkpoints button")
                        seen["checkpoints"] = True
                    pg.evaluate("window.__mgsAutopilot = 'secret'; window.__mgsSpeedup = 4")
                pg.wait_for_timeout(200)
            else:
                pg.evaluate("window.__mgsAutopilot = 'secret'; window.__mgsSpeedup = 4")
                pg.wait_for_timeout(250)

        elif k == "choice":
            text = pg.inner_text("#panel").lower()  # the place name shows in capitals
            if not st["ready"]:
                pg.wait_for_timeout(150)
                continue
            if "fern moon" in text and not seen["rerun"]:
                if "3 memory pieces got away" not in text:
                    fail(f"missing 3 pieces in Fern Moon should say so: {text[:120]!r}")
                pg.evaluate("window.__mgsDrop = 0")
                pg.keyboard.press("a")
                seen["rerun"] = "pending"
                pg.wait_for_timeout(400)
            elif "lantern lab" in text and not seen["hardall"]:
                # Hard mode: no keeping going with pieces missing, only running it again
                if "2 memory pieces got away" not in text or "hard mode" not in text:
                    fail(f"missing 2 pieces in Lantern Lab (Hard mode) should say so: {text[:160]!r}")
                if pg.locator("#keepGoing").count():
                    fail("Hard mode offered Keep going with memory pieces missing")
                seen["hardall"] = True
                pg.evaluate("window.__mgsDrop = 0")
                pg.keyboard.press("Enter")
                pg.wait_for_timeout(400)
            else:
                fail(f"pieces got away in a run where every piece should be catchable: {text[:160]!r}")
                pg.evaluate("window.__mgsDrop = 0")
                pg.keyboard.press("Enter")
                pg.wait_for_timeout(400)

        elif k == "jigsaw":
            pg.evaluate("window.__mgsAutopilot = false; window.__mgsSpeedup = 1")
            hint_clear(pg, "jig", seen)
            if pg.locator(".jig .jt.gone").count():
                fail("a Hard mode memory has holes, but Hard mode needs every piece before the jigsaw")
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
            runs = pg.evaluate("window.__mgs.runs")
            for key, r in runs.items():
                if r.get("pieces") != r.get("total"):
                    fail(f"the {key} run caught {r.get('pieces')} of {r.get('total')} pieces (Hard mode needs all of them)")
            looks = pg.evaluate("window.__mgs.looks()")
            if len(looks.get("have", [])) != 5:
                fail(f"catching every piece in all 5 runs should unlock 5 looks, got {looks.get('have')}")
            seen["rerun"] = bool((runs.get("fern") or {}).get("full"))
            if not seen["rerun"]:
                fail("running Fern Moon again did not end with every piece caught")
            if "full-catch bonus" not in pg.inner_text("#panel"):
                fail("the score card doesn't show the full-catch bonuses")
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
                           ("crashrestart", "checkpoints", "peek", "fix", "scan", "refuel", "wrongclue", "roar", "poke", "resumed", "modeswitch", "ship",
                            "hint", "rerun", "bonus", "noskip", "hardall", "closet", "musicsync")))
    expect = {"runs": 5, "jigsaws": 4, "words": 4, "clues": 4, "parts": 4, "paints": 1, "deduce": 4, "songs": 7}
    for name, n in expect.items():
        if seen[name] != n:
            fail(f"Mini Game Survival: expected {n} {name}, got {seen[name]}")
    for name in ("crashrestart", "checkpoints", "peek", "fix", "scan", "refuel", "wrongclue", "roar", "poke", "resumed", "modeswitch", "ship",
                 "hint", "rerun", "bonus", "noskip", "hardall", "closet", "musicsync"):
        if not seen[name]:
            fail(f"Mini Game Survival never exercised: {name}")
    for where in ("hub", "run", "jig"):
        if not seen.get("hintclear_" + where):
            fail(f"Mini Game Survival never checked where a hint sits: {where}")
    print("  hints stay off the play area: above the crash pad, in the floor under a run, under the jigsaw board")
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
            mgs_out = json.loads((LIB / "games/mini-game-survival/game.json").read_text(encoding="utf-8"))["output"]
            print("Mini Game Survival art")
            mgs_art_check(browser, base, mgs_out)
            if not quick:
                out = json.loads((LIB / "games/starward/game.json").read_text(encoding="utf-8"))["output"]
                playthrough(browser, base, out)
                out = mgs_out
                mgs_pieces_check(browser, base, out)
                mgs_easy_check(browser, base, out)
                mgs_touch_check(browser, base, out)
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
