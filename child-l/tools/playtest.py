#!/usr/bin/env python3
"""
Play-test every page in child-l/toybox/ in headless Chromium. Run before every
commit that changes child-l/toybox/ and before every deploy.

    python3 child-l/tools/playtest.py          (from the repo root, or anywhere)

Needs Python 3 and Playwright. If missing:
    pip install playwright            (add --break-system-packages on Claude's workspace)
    python3 -m playwright install chromium

Checks:
  1. Every file under toybox/ is plain ASCII (emoji and curly quotes as \\u escapes).
  2. Every page loads at 1366x768 (Chromebook) and 400x800 with no page errors,
     no console errors or warnings, no missing files, and no sideways scroll.
     Google Fonts is blocked so the run doesn't depend on outside network.
  3. Every game page (one that shows game modes):
     - Listen Game: one round, tapping until the right picture, earns a candy,
       and Biscuit speaks with recorded voice clips.
     - Magic Word Game: tapping the other word causes the mix-up and shows the
       sound cue; then correct rounds fill the jar and open the joke party;
       "Tell me!" shows the punchline; Home empties the jar.
Prints PASS or FAIL with the reasons, and exits 1 on FAIL.
"""
import http.server
import pathlib
import re
import socketserver
import sys
import threading

from playwright.sync_api import sync_playwright

TOYBOX = pathlib.Path(__file__).resolve().parent.parent / "toybox"
SIZES = [(1366, 768), (400, 800)]
FONT_HOST = "fonts.googleapis.com"
failures = []


def fail(msg):
    failures.append(msg)
    print("  FAIL", msg)


def ascii_check():
    print("ASCII check")
    for p in sorted(TOYBOX.rglob("*")):
        if p.is_file() and p.suffix != ".mp3":
            for n, line in enumerate(p.read_bytes().split(b"\n"), 1):
                if re.search(rb"[^\x00-\x7f]", line):
                    fail(f"non-ASCII in {p.relative_to(TOYBOX)} line {n}")


def serve():
    handler = lambda *a: http.server.SimpleHTTPRequestHandler(*a, directory=str(TOYBOX))
    http.server.SimpleHTTPRequestHandler.log_message = lambda *a: None
    # threaded, with a deep queue: a page requests a dozen files at once
    socketserver.ThreadingTCPServer.request_queue_size = 64
    srv = socketserver.ThreadingTCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f"http://127.0.0.1:{srv.server_address[1]}/"


def new_page(browser, size, tag):
    ctx = browser.new_context(viewport={"width": size[0], "height": size[1]})
    ctx.route(f"**/{FONT_HOST}/**", lambda r: r.abort())
    pg = ctx.new_page()

    def on_console(m):
        if m.type in ("error", "warning") and FONT_HOST not in (m.location or {}).get("url", ""):
            fail(f"{tag} console.{m.type}: {m.text}")

    pg.on("console", on_console)
    pg.on("pageerror", lambda e: fail(f"{tag} page error: {e}"))
    pg.on("response", lambda r: r.status >= 400 and fail(f"{tag} HTTP {r.status} {r.url}"))
    return ctx, pg


def wait_next_round(pg, S, prev):
    pg.wait_for_function(
        """([S, prev]) => {
            const party = document.querySelector('.tb-party');
            if (party && !party.hidden) return true;
            const t = document.querySelector(S + ' .tb-target');
            return t && !t.classList.contains('tb-right') && t.querySelector('.tb-word').textContent !== prev;
        }""", arg=[S, prev], timeout=8000)


def judge_index(pg, S, word):
    """Index of the grown-up button for a word (buttons hold a picture span, then the word span)."""
    return pg.evaluate(
        """([S, w]) => Array.from(document.querySelectorAll(S + ' .tb-jbtn[data-i]'))
             .find(b => b.lastElementChild.textContent === w).getAttribute('data-i')""", [S, word])


def play_game(browser, base, name):
    tag = f"{name} play"
    # Listen Game
    ctx, pg = new_page(browser, SIZES[0], tag)
    pg.goto(base + name)
    if pg.locator('[data-go="listen-tap"]').count():
        L = '[data-screen="listen-tap"]'
        pg.click('[data-go="listen-tap"]')
        for i in range(2):
            if pg.locator(f"{L} .tb-right").count():
                break
            pg.click(f"{L} .tb-card >> nth={i}")
            pg.wait_for_timeout(150)
        pg.wait_for_function("() => document.querySelector('.tb-jar-text').textContent.startsWith('1 ')", timeout=5000)
        print(f"  Listen Game: right picture earned a candy ({pg.text_content('.tb-jar-text')})")
        clips = pg.evaluate("performance.getEntriesByType('resource').filter(e => e.name.includes('/assets/voice/')).length")
        if not clips:
            fail(f"{tag}: Biscuit spoke without any recorded voice clip")
        else:
            print(f"  Voice: {clips} recorded clip(s) played")
    ctx.close()

    # Magic Word Game
    ctx, pg = new_page(browser, SIZES[0], tag)
    pg.goto(base + name)
    if pg.locator('[data-go="say-it"]').count():
        S = '[data-screen="say-it"]'
        pg.click('[data-go="say-it"]')
        goal = int(pg.text_content(".tb-jar-text").split()[-1])

        target = pg.text_content(f"{S} .tb-target .tb-word")
        words = pg.eval_on_selector_all(f"{S} .tb-jbtn[data-i]", "bs => bs.map(b => b.lastElementChild.textContent)")
        other = [w for w in words if w != target][0]
        pg.click(f'{S} .tb-jbtn[data-i="{judge_index(pg, S, other)}"]')
        pg.wait_for_timeout(250)
        shown = pg.text_content(f"{S} .tb-target .tb-word")
        if shown != other or not pg.is_visible(f"{S} .tb-cue"):
            fail(f"{tag} mix-up: tapped {other!r}, card shows {shown!r}, cue visible {pg.is_visible(f'{S} .tb-cue')}")
        else:
            print(f"  Magic Word mix-up: {target!r} became {other!r}, sound cue shown")
        pg.wait_for_function(
            "([S, w]) => document.querySelector(S + ' .tb-target .tb-word').textContent === w", arg=[S, target], timeout=5000)

        rounds = 0
        while not pg.is_visible(".tb-party") and rounds < goal + 2:
            target = pg.text_content(f"{S} .tb-target .tb-word")
            pg.click(f'{S} .tb-jbtn[data-i="{judge_index(pg, S, target)}"]')
            rounds += 1
            wait_next_round(pg, S, target)
        if not pg.is_visible(".tb-party"):
            fail(f"{tag}: joke party did not open after {rounds} correct rounds (goal {goal})")
        else:
            print(f"  Magic Word Game: {rounds} correct rounds filled the jar ({goal}) and opened the joke party")
            pg.click('[data-act="tell"]')
            if not pg.is_visible(".tb-joke-a"):
                fail(f"{tag}: punchline not shown after Tell me")
            pg.click('[data-act="home"]')
            pg.wait_for_timeout(200)
            if not pg.text_content(".tb-jar-text").startswith("0 "):
                fail(f"{tag}: jar not emptied after Home")
    ctx.close()


def main():
    ascii_check()
    srv, base = serve()
    pages = sorted(p.name for p in TOYBOX.glob("*.html"))
    with sync_playwright() as p:
        browser = p.chromium.launch()
        games = []
        for name in pages:
            print(name)
            for size in SIZES:
                ctx, pg = new_page(browser, size, f"{name}@{size[0]}")
                pg.goto(base + name)
                pg.wait_for_timeout(500)
                sw, cw = pg.evaluate("[document.documentElement.scrollWidth, document.documentElement.clientWidth]")
                if sw > cw:
                    fail(f"{name}@{size[0]}: sideways scroll ({sw}px content in {cw}px)")
                else:
                    print(f"  {size[0]}px: loads, no sideways scroll")
                if size == SIZES[0] and pg.locator(".tb-mode").count():
                    games.append(name)
                ctx.close()
        for name in games:
            print(f"{name} (game)")
            play_game(browser, base, name)
        browser.close()
    srv.shutdown()
    print("\nPASS" if not failures else f"\nFAIL ({len(failures)})")
    for f in failures:
        print("  -", f)
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
