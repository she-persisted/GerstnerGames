#!/usr/bin/env python3
"""
@file build/playtest.py
@about Automated play-test for the library: checks file headers, checks the built pages match the source, loads every page in headless Chromium at Chromebook size, and plays Starward start to finish (map, puzzles, digging, flights, the brave words, the ending and high score). Must pass before every commit that changes library/.
@requires build/build.py

Usage, from anywhere:
  python3 library/build/playtest.py            everything (about 2 minutes)
  python3 library/build/playtest.py --quick    skip the full Starward playthrough

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
       Every dig is typed, every part style picked, then back to the launch pad to paint the ship.
     - Flights: the first try of the first flight is typed badly on purpose and must offer
       "Fly again"; every other flight is typed cleanly and must land.
     - All planet puzzles answered, the brave words typed, and the ending reached.
     - High score: a name saves, gets a rank, and shows on the board as a score on this computer.
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
    return { kind: 'typing', sig, flight: !!panel.querySelector('#bigword'), rest: spans.slice(i).map(s => s.textContent).join('') };
  }
  const prim = panel.querySelector('[data-primary]');
  if (vis(prim) && !prim.disabled) return { kind: 'primary', sig, label: prim.innerText.trim(), low: !!panel.querySelector('.bigpct.low'), landed: /landing/i.test(panel.innerText) };
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
    seen = {"puzzles": 0, "showme": False, "scan": False, "retry": False, "landings": 0, "parts": 0}
    last_sig, last_change, started = None, time.time(), time.time()
    counted = None  # the last landing screen counted, so a slow click isn't counted twice

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
            pg.fill("#ans", answer)
            pg.press("#ans", "Enter")
            try:
                pg.wait_for_selector("#fb.good", timeout=3000)
                seen["puzzles"] += 1
            except Exception:
                fail(f"correct answer {answer!r} was not accepted ({st['sig']!r})")
                break

        elif k == "typing":
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
            if st["landed"] and st["sig"] != counted:
                seen["landings"] += 1
                counted = st["sig"]
            pg.locator("#panel [data-primary]").click()
            pg.wait_for_timeout(120)

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
    expect = {"puzzles": 20, "parts": 4, "landings": 5}
    for name, n in expect.items():
        if seen[name] != n:
            fail(f"expected {n} {name}, got {seen[name]}")
    for name in ("showme", "scan", "retry"):
        if not seen[name]:
            fail(f"never exercised: {name}")
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
