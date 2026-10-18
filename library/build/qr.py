#!/usr/bin/env python3
"""
@file build/qr.py
@about Makes a game's shareable QR card in that game's own colors and icons: the title, a two-sentence teaser to get kids curious, the game's hero drawn from the game's own art, and a QR code that opens the game's permanent home page ("home" in game.json, or the newest release's link for a game without one). No version number, so one card stays good for every version. Checks that the finished card scans back to the right link.
@requires kit/base.css, assets/fx/defs.svg, assets/icons/icons.js, assets/style/ink.js, assets/characters/trexy.js, assets/characters/robot-side.svg, assets/characters/characters.css (colors, icon shapes, and heroes come from these)

Usage, from the library folder:
  python3 build/qr.py games/starward/game.json     card for that game
  python3 build/qr.py --all                        a card for every game with a "qr" block
Writes dist/<id>-qr.png. Needs Pillow, opencv-python-headless, and Playwright with Chromium (it draws the hero
in headless Chromium from the library's own art files). Uses the qrcode package when installed (pip install "qrcode[pil]");
otherwise OpenCV's own QR encoder makes the code. Exits 1 if a card does not scan back to its link.

"qr" block in game.json (every game needs one; the card stops with a message if the hero or either teaser sentence is missing):
  { "colors": { void, nebula, nebulaHi, starlight, dust, glow, accent, gold, onGold },   (Starward's night sky by default)
    "badge": "star" | "trexy" | "flame",            the icon in the middle of the code, and the card's corner decorations
    "hero": { "who": "robot", "face": "worried" | "brave" | "happy" | "surprised" | "think", "lit": true, "thrusters": true }
          | { "who": "trexy", "pose": "hop", "face": "excited" },
    "tagline": ["A short hook.", "One sentence about what you get to do."],
    "cta": "Scan to play!" }
A tall hero stands beside the code; a wide one stands under it and says the call to action in a speech bubble.
The teaser is a short hook, then one sentence on what you get to do, with a joke where it fits and no spoilers.
A new game's hero goes in HEROES and hero_markup below, drawn from that game's own art file, so the card always matches the game.
Older cards with a version number on them are kept in dist/ as <id>-v<N>-qr.png.
"""
import functools
import io
import json
import math
import pathlib
import random
import re
import sys

try:
    import qrcode
except ImportError:  # fall back to OpenCV's encoder (see qr_matrix)
    qrcode = None
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Color tokens from kit/base.css.
VOID = "#0d0a24"
NEBULA = "#191443"
NEBULA_HI = "#271f5e"
STARLIGHT = "#f1efff"
DUST = "#aaa5d8"
EMBER = "#ff8740"
EMBER_GOLD = "#ffcb5e"
ON_EMBER = "#2a1100"

W, H = 1080, 1500
SCALE = 2  # draw at 2x, then shrink, for smooth edges


def rgb(hex_color):
    h = hex_color.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


# Windows fonts first (the look of the first cards), then common Linux fonts, so the card looks right on any machine.
LINUX_FONTS = "/usr/share/fonts/truetype/"
FONTS = {
    True: ("seguibl.ttf", "segoeuib.ttf", "arialbd.ttf", LINUX_FONTS + "google-fonts/Poppins-Bold.ttf",
           LINUX_FONTS + "liberation/LiberationSans-Bold.ttf", LINUX_FONTS + "dejavu/DejaVuSans-Bold.ttf"),
    False: ("segoeuisb.ttf", "segoeui.ttf", "arial.ttf", LINUX_FONTS + "google-fonts/Poppins-Medium.ttf",
            LINUX_FONTS + "liberation/LiberationSans-Regular.ttf", LINUX_FONTS + "dejavu/DejaVuSans.ttf"),
}


@functools.lru_cache(maxsize=None)
def font_file(heavy=True):
    """The first font that loads, found once (titles try many sizes)."""
    for name in FONTS[heavy]:
        try:
            ImageFont.truetype(name, 12)
            return name
        except OSError:
            pass
    return None


@functools.lru_cache(maxsize=None)
def font(size, heavy=True):
    name = font_file(heavy)
    return ImageFont.truetype(name, size) if name else ImageFont.load_default(size)  # scalable default (Pillow 10.1+)


def spark4(cx, cy, r):
    """The game's four-point star (spark4 in assets/fx/defs.svg), radius r."""
    k = r * 1.4 / 5
    return [(cx, cy - r), (cx + k, cy - k), (cx + r, cy), (cx + k, cy + k),
            (cx, cy + r), (cx - k, cy + k), (cx - r, cy), (cx - k, cy - k)]


def cubic(p0, p1, p2, p3, n=12):
    return [tuple((1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * c + t ** 3 * d
                  for a, b, c, d in zip(p0, p1, p2, p3)) for t in (i / n for i in range(1, n + 1))]


def rocket(draw, x, y, s, body, window, flame):
    """The rocket icon from assets/icons/icons.js (24 x 24 grid), top-left at x, y, s pixels per unit."""
    P = lambda pts: [(x + px * s, y + py * s) for px, py in pts]
    hull = [(12, 2)] + cubic((12, 2), (15, 4), (17, 8), (17, 12)) + [(19, 15), (19, 19), (16, 17), (8, 17), (5, 19), (5, 15), (7, 12)] \
        + cubic((7, 12), (7, 8), (9, 4), (12, 2))
    draw.polygon(P(hull), fill=body)
    draw.ellipse([x + 10 * s, y + 9 * s, x + 14 * s, y + 13 * s], fill=window)
    draw.polygon(P([(10, 19), (14, 19), (12, 22)]), fill=flame)


# A game's look: Starward's night sky by default, or the "qr" block in its game.json.
STARWARD = {"void": VOID, "nebula": NEBULA, "nebulaHi": NEBULA_HI, "starlight": STARLIGHT, "dust": DUST,
            "glow": EMBER, "accent": EMBER, "gold": EMBER_GOLD, "onGold": ON_EMBER}
HEROES = ("robot", "trexy")  # heroes hero_markup can draw


def theme_for(spec):
    """The card's look from the game's "qr" block. Every card shows the game's hero and a two-sentence teaser, so both are required."""
    q = spec.get("qr")
    where = f"games/{spec['id']}/game.json"
    if not q:
        sys.exit(f"{where} has no \"qr\" block. Add one with its hero and a two-sentence tagline (see the notes at the top of build/qr.py).")
    tagline, hero = q.get("tagline") or [], q.get("hero") or {}
    if len(tagline) != 2 or not all(s.strip() for s in tagline):
        sys.exit(f"{where}: \"tagline\" needs exactly two sentences: a short hook, then what you get to do.")
    if hero.get("who") not in HEROES:
        sys.exit(f"{where}: \"hero\" needs \"who\" set to one of {', '.join(HEROES)}. A new hero goes in HEROES and hero_markup in build/qr.py.")
    return ({**STARWARD, **(q.get("colors") or {})}, q.get("badge", "star"), q.get("cta", "Scan to play!"), tagline, hero)


def spike(cx, by, s):
    """A neon spike from the obstacle runs, base centered at cx, by."""
    return [(cx - s * .5, by), (cx, by - s), (cx + s * .5, by)]


def piece(draw, cx, cy, r, fill):
    """A jigsaw piece like the memory pieces in the runs."""
    k = r * .38
    draw.rectangle([cx - r, cy - r, cx + r, cy + r], fill=fill)
    draw.ellipse([cx - k, cy - r - k, cx + k, cy - r + k], fill=fill)
    draw.ellipse([cx + r - k, cy - k, cx + r + k, cy + k], fill=fill)


def path_points(d, ox, oy, s, n=10):
    """Points along an SVG path made of M, C, L and Z commands (enough for T-Rexy's head and the flame)."""
    toks = re.findall(r"[MCLZ]|-?\d*\.?\d+", d)
    pts, cur, i = [], (0.0, 0.0), 0
    def num():
        nonlocal i
        v = float(toks[i]); i += 1
        return v
    cmd = None
    while i < len(toks):
        if toks[i] in ("M", "C", "L", "Z"):
            cmd = toks[i]; i += 1
            if cmd == "Z":
                continue
        if cmd == "M" or cmd == "L":
            cur = (num(), num()); pts.append(cur)
        elif cmd == "C":
            c1, c2, end = (num(), num()), (num(), num()), (num(), num())
            pts += cubic(cur, c1, c2, end, n); cur = end
        else:
            i += 1  # skip anything else rather than loop forever
    return [(ox + x * s, oy + y * s) for x, y in pts]


TREXY_HEAD = "M-6 -58 C-8 -80 12 -91 30 -85 C46 -80 53 -71 51 -60 C50 -50 41 -46 25 -46 C9 -46 -4 -46 -6 -58 Z"
FLAME = "M0 0 C-11 0 -15 -10 -10 -19 C-6 -26 -1 -29 0 -40 C5 -31 15 -24 13 -12 C12 -4 7 0 0 0 Z"  # flamePath in assets/fx/defs.svg


def flame(draw, cx, cy, height, outer=EMBER, mid=EMBER_GOLD):
    """The game's flame (flamePath, as in The Inner Flame's logo), centered at cx, cy."""
    s = height / 40
    draw.polygon(path_points(FLAME, cx, cy + height / 2, s), fill=outer)
    draw.polygon(path_points(FLAME, cx, cy + height / 2, s * .6), fill=mid)


def trexy_head(draw, cx, cy, size):
    """T-Rexy's head from assets/characters/trexy.js: green, big eye, two tiny teeth. size = head width in pixels."""
    s = size / 58
    ox, oy = cx - 22.5 * s, cy + 68 * s
    line, body = "#12452c", "#5ee35b"
    pts = path_points(TREXY_HEAD, ox, oy, s)
    draw.polygon(pts, fill=body, outline=line, width=max(2, int(2.8 * s)))
    P = lambda x, y: (ox + x * s, oy + y * s)
    ex, ey = P(20, -70)
    draw.ellipse([ex - 8.5 * s, ey - 9.5 * s, ex + 8.5 * s, ey + 9.5 * s], fill=line)
    draw.ellipse([ex - 7 * s, ey - 8 * s, ex + 7 * s, ey + 8 * s], fill="#ffffff")
    px, py = P(22, -69)
    draw.ellipse([px - 5 * s, py - 5 * s, px + 5 * s, py + 5 * s], fill="#1b1030")
    draw.ellipse([px + .5 * s, py - 4.5 * s, px + 3.6 * s, py - 1.4 * s], fill="#ffffff")
    cx2, cy2 = P(33, -61)
    draw.ellipse([cx2 - 4.6 * s, cy2 - 3 * s, cx2 + 4.6 * s, cy2 + 3 * s], fill="#ff8fb1")
    draw.line([P(27, -55), P(38, -51.5), P(49, -57)], fill=line, width=max(2, int(2.6 * s)), joint="curve")
    for tx in (33, 40):
        draw.polygon([P(tx, -53.5), P(tx + 2.2, -49.9), P(tx + 4.4, -53.8)], fill="#ffffff")


# ---------- The hero, drawn by headless Chromium from the game's own art files ----------

def hero_markup(hero):
    """A page that draws the hero, and the CSS selector of the element to capture."""
    read = lambda p: (ROOT / p).read_text(encoding="utf-8")
    still = "*{animation:none!important;transition:none!important}html,body{margin:0;background:transparent!important}"
    if hero.get("who") == "trexy":
        opts = {k: v for k, v in hero.items() if k != "who"}
        return (f"<style>{still}</style><script>{read('assets/style/ink.js')}</script><script>{read('assets/characters/trexy.js')}</script><div id=hero></div>"
                f"<script>document.getElementById('hero').innerHTML = Kit.art.trexy.svg({json.dumps(opts)}, 1600)</script>",
                "#hero svg")
    # The tall robot: Starward's Keeper, and the hero of The Inner Flame (same art, kept in the library).
    face = hero.get("face", "brave")
    cls = "robot" + ("" if face == "worried" else " brave") + (" lit" if hero.get("lit") else "")
    data_face = f' data-face="{face}"' if face in ("happy", "surprised", "think") else ""
    thrust = "".join(f'<g transform="translate({x},3) scale(.42,-.6)"><use href="#flamePath" class="f-outer"/>'
                     f'<use href="#flamePath" class="f-mid" transform="scale(.55)"/></g>' for x in (-17, 17)) if hero.get("thrusters") else ""
    bottom = 33 if thrust else 12
    return (f"<style>{read('kit/base.css')}{read('assets/characters/characters.css')}{still}</style>"
            f'<svg id="hero" width="{96 * 9}" height="{(212 + bottom) * 9}" viewBox="-48 -212 96 {212 + bottom}">'
            f"<defs>{read('assets/fx/defs.svg')}</defs>{thrust}"
            f'<g class="{cls}"{data_face} style="--warm:1">{read("assets/characters/robot-side.svg")}</g></svg>',
            "#hero")


def render_hero(hero):
    """The hero as a transparent picture, trimmed to its edges."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit("qr.py draws the hero with Playwright: pip install --break-system-packages playwright, "
                 "then python3 -m playwright install chromium")
    html, sel = hero_markup(hero)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1700, "height": 2300})
        page.set_content(html)
        png = page.locator(sel).screenshot(omit_background=True)
        browser.close()
    img = Image.open(io.BytesIO(png)).convert("RGBA")
    return img.crop(img.getchannel("A").getbbox())


# ---------- The card ----------

def background(w, h, C, badge):
    img = Image.new("RGB", (w, h), C["void"])
    glow = Image.new("RGB", (w, h), C["void"])
    gd = ImageDraw.Draw(glow)
    for i in range(40, 0, -1):  # soft nebula glow near the top, like the game's sky
        t = i / 40
        c = tuple(int(a + (b - a) * (1 - t)) for a, b in zip(rgb(C["void"]), rgb(C["nebulaHi"])))
        r = int(w * 0.95 * t)
        gd.ellipse([w * 0.62 - r, -r * 0.55, w * 0.62 + r, r * 0.95], fill=c)
    img = Image.blend(img, glow.filter(ImageFilter.GaussianBlur(w // 30)), 0.9)
    d = ImageDraw.Draw(img)
    rnd = random.Random(7)  # same stars every time
    for _ in range(170):
        sx, sy, sr = rnd.random() * w, rnd.random() * h, rnd.choice((1, 1, 1.5, 2, 2.5)) * SCALE
        d.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=rnd.choice((C["starlight"], C["dust"], C["dust"])))
    # Corner decorations, kept clear of the title, the code, and the hero.
    corners = ((0.05, 0.035, 12), (0.95, 0.03, 9), (0.04, 0.33, 8), (0.96, 0.36, 11), (0.6, 0.975, 8), (0.965, 0.975, 10))
    for i, (sx, sy, sr) in enumerate(corners):
        x, y, r = sx * w, sy * h, sr * SCALE
        if badge == "trexy":  # spikes and memory pieces from the obstacle runs
            if i % 2:
                piece(d, x, y, r * 1.3, C["accent"])
            else:
                d.polygon(spike(x, y + r * 1.4, r * 3), fill=C["glow"])
        elif badge == "flame" and i % 2 == 0:
            flame(d, x, y, r * 3.4, C["glow"], C["gold"])
        else:
            d.polygon(spark4(x, y, r), fill=C["gold"])
    return img


def qr_matrix(url):
    """The QR code's dark and light modules (error correction H). Uses the qrcode package, or OpenCV's encoder if it is missing."""
    if qrcode:
        qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, border=0)
        qr.add_data(url)
        qr.make(fit=True)
        return qr.get_matrix()
    import cv2
    p = cv2.QRCodeEncoder_Params()
    p.correction_level = cv2.QRCodeEncoder_CORRECT_LEVEL_H
    m = cv2.QRCodeEncoder.create(p).encode(url)
    dark = [[px < 128 for px in row] for row in m]
    rows = [r for r, row in enumerate(dark) if any(row)]
    cols = [c for c in range(len(dark[0])) if any(row[c] for row in dark)]
    return [row[cols[0]:cols[-1] + 1] for row in dark[rows[0]:rows[-1] + 1]]


def qr_tile(url, size, C, badge):
    """QR code: dark modules on a light tile, square finder eyes, and the game's badge in the middle.
    Tested on 2026-10-18 across tile sizes 360 to 640 and three zooms: rounded finder eyes, or dots with gaps
    between them, fail one reader or the other about one time in ten. Square eyes and barely rounded,
    touching modules read every time, so keep them that way."""
    m = qr_matrix(url)
    n = len(m)
    quiet = 4
    cell = size / (n + 2 * quiet)
    tile = Image.new("RGB", (size, size), C["starlight"])
    d = ImageDraw.Draw(tile)
    finders = [(0, 0), (0, n - 7), (n - 7, 0)]
    in_finder = lambda r, c: any(fr <= r < fr + 7 and fc <= c < fc + 7 for fr, fc in finders)
    logo = n * 0.22  # cleared square in the middle for the badge
    lo, hi = (n - logo) / 2, (n + logo) / 2
    for r in range(n):
        for c in range(n):
            if not m[r][c] or in_finder(r, c) or (lo <= r < hi and lo <= c < hi):
                continue
            x0, y0 = (c + quiet) * cell, (r + quiet) * cell
            d.rounded_rectangle([x0, y0, x0 + cell, y0 + cell], radius=cell * 0.08, fill=C["void"])
    for fr, fc in finders:  # plain, square, dark finder eyes (see above)
        x0, y0 = (fc + quiet) * cell, (fr + quiet) * cell
        d.rectangle([x0, y0, x0 + 7 * cell, y0 + 7 * cell], fill=C["void"])
        d.rectangle([x0 + cell, y0 + cell, x0 + 6 * cell, y0 + 6 * cell], fill=C["starlight"])
        d.rectangle([x0 + 2 * cell, y0 + 2 * cell, x0 + 5 * cell, y0 + 5 * cell], fill=C["void"])
    cx = cy = size / 2
    br = (logo / 2) * cell * 0.92
    d.ellipse([cx - br, cy - br, cx + br, cy + br], fill=C["void"], outline=C["gold"] if badge == "star" else C["glow"], width=max(2, int(cell * 0.35)))
    if badge == "trexy":
        trexy_head(d, cx, cy, br * 1.25)
    elif badge == "flame":
        flame(d, cx, cy - br * .05, br * 1.3, C["glow"], C["gold"])
    else:
        d.polygon(spark4(cx, cy, br * 0.72), fill=C["gold"])
    return tile


def fit_font(d, text, max_w, start, floor=40):
    size = int(start)
    while size > floor * SCALE and d.textlength(text, font=font(size)) > max_w:
        size -= 6 * SCALE
    return font(size)


def wrap(d, text, f, max_w):
    """Split text into the fewest lines that fit, with the lines as even as possible (no lonely last word)."""
    words = text.split()
    for count in range(1, len(words) + 1):
        best = None
        def split(ws, k):  # every way to cut ws into k lines
            if k == 1:
                yield [" ".join(ws)]
                return
            for i in range(1, len(ws) - k + 2):
                for rest in split(ws[i:], k - 1):
                    yield [" ".join(ws[:i])] + rest
        for lines in split(words, count):
            widest = max(d.textlength(l, font=f) for l in lines)
            if widest <= max_w and (best is None or widest < best[0]):
                best = (widest, lines)
        if best:
            return best[1]
    return [text]


def glow_behind(img, box, color, alpha, blur, ellipse=True):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    (ld.ellipse if ellipse else ld.rectangle)(box, fill=rgb(color) + (alpha,))
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    img.paste(layer, (0, 0), layer)


def card(title, url, C, badge, cta, tagline, hero_img):
    S = SCALE
    w, h = W * S, H * S
    margin = 48 * S
    img = background(w, h, C, badge)
    d = ImageDraw.Draw(img)
    hw, hh = hero_img.size
    tall = hw / hh < 0.8  # a tall hero stands beside the code; a wide one under it, which needs more room, so its title stays on one line

    # Title, with the game's icon in front of it when it has one (Starward's star, The Inner Flame's flame).
    icon = 54 * S if badge in ("star", "flame") else 0
    gap = 26 * S if icon else 0
    room = w - 2 * margin - 2 * icon - gap - 60 * S
    words = title.split()
    lines = [title]
    tf = fit_font(d, title, room, 150 * S)
    if tall and tf.size < 104 * S and len(words) > 1:  # too small on one line: split it in two
        half = (len(words) + 1) // 2
        lines = [" ".join(words[:half]), " ".join(words[half:])]
        tf = fit_font(d, max(lines, key=len), room, 132 * S)
    ty = 56 * S
    asc = tf.getbbox("Hg")
    line_h = (asc[3] - asc[1]) * 1.1
    tw = max(d.textlength(l, font=tf) for l in lines)
    x = (w - (icon * 2 + gap + tw)) / 2
    mid = ty + asc[1] + line_h * len(lines) / 2
    if icon:
        glow_behind(img, [x - icon * .2, mid - icon * 1.2, x + icon * 2.2, mid + icon * 1.2], C["glow"], 150, 18 * S)
        d = ImageDraw.Draw(img)
        if badge == "flame":
            flame(d, x + icon, mid - icon * .05, icon * 2.2, C["glow"], C["gold"])
        else:
            d.polygon(spark4(x + icon, mid, icon), fill=C["gold"])
    for i, l in enumerate(lines):
        d.text((x + icon * 2 + gap, ty + i * line_h), l, font=tf, fill=C["starlight"])
    y = ty + asc[1] + line_h * len(lines) + 22 * S

    # The teaser: a hook in the accent color, then what you get to do.
    for k, sentence in enumerate(tagline[:2]):
        f = font((46 if k == 0 else 42) * S, heavy=(k == 0))
        color = C["accent"] if k == 0 else C["starlight"]
        lh = f.getbbox("Hg")
        for l in wrap(d, sentence, f, w - 2 * margin - 20 * S):
            d.text(((w - d.textlength(l, font=f)) / 2, y - lh[1]), l, font=f, fill=color)
            y += (lh[3] - lh[1]) * 1.32
        y += 8 * S
    band = y + 34 * S  # top of the code and the hero

    frame = 22 * S
    bottom = h - 46 * S
    cf = font(58 * S)
    cta_w, cta_h = d.textlength(cta, font=cf) + 76 * S, 108 * S
    modules = len(qr_matrix(url)) + 8  # with the quiet zone
    snap = lambda size: int(size // (modules * S)) * modules * S  # whole pixels per module on the final card, so every reader sees crisp dots
    even = lambda v: int(v // S) * S

    if tall:
        # Tall hero beside the code; the call to action under the code.
        qs = snap(min(550 * S, bottom - band - 2 * frame - cta_h - 56 * S))
        qx, qy = even(w - margin - frame - qs), even(band + frame)
        col = qx - frame - margin - 30 * S
        k = min(col / hw, (bottom - 26 * S - band) / hh)
        hero = hero_img.resize((int(hw * k), int(hh * k)), Image.LANCZOS)
        hx, hy = int(margin + (col - hero.width) / 2), int(bottom - 26 * S - hero.height)
        bx, by = qx + qs / 2 - cta_w / 2, qy + qs + frame + 34 * S
        tail = None
    else:
        # Wide hero under the code, saying the call to action in a speech bubble.
        room = bottom - band - 2 * frame - 40 * S  # shared by the code and the hero row
        qs = snap(min(600 * S, room - min(520 * S, max(340 * S, room * .46))))
        qx, qy = even((w - qs) / 2), even(band + frame)
        top = qy + qs + frame + 40 * S
        k = min((bottom - top) / hh, (w * .5) / hw)
        hero = hero_img.resize((int(hw * k), int(hh * k)), Image.LANCZOS)
        hx, hy = int(margin), int(bottom - hero.height)
        left = hx + hero.width + 56 * S  # room for the bubble's tail
        room = w - margin - left
        cf = fit_font(d, cta, room - 64 * S, 58 * S)
        cta_w = d.textlength(cta, font=cf) + 64 * S
        bx = left + (room - cta_w) / 2
        by = hy + hero.height * .18
        tail = [(bx + 4 * S, by + cta_h * .38), (bx + 4 * S, by + cta_h * .78), (bx - 46 * S, by + cta_h * .76)]

    # The code, in a glowing frame.
    glow_behind(img, [qx - frame * 2, qy - frame * 2, qx + qs + frame * 2, qy + qs + frame * 2], C["glow"], 150, 30 * S, ellipse=False)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([qx - frame, qy - frame, qx + qs + frame, qy + qs + frame], radius=56 * S,
                        fill=C["starlight"], outline=C["gold"], width=8 * S)
    img.paste(qr_tile(url, qs, C, badge), (qx, qy))

    # The hero: a soft glow behind, a shadow underneath, then the hero.
    glow_behind(img, [hx - 30 * S, hy + hero.height * .1, hx + hero.width + 30 * S, hy + hero.height * .95], C["glow"], 95, 40 * S)
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sw = hero.width * .7
    ImageDraw.Draw(shadow).ellipse([hx + hero.width / 2 - sw / 2, bottom - 14 * S, hx + hero.width / 2 + sw / 2, bottom + 12 * S],
                                   fill=rgb(C["void"]) + (200,))
    shadow = shadow.filter(ImageFilter.GaussianBlur(6 * S))
    img.paste(shadow, (0, 0), shadow)
    img.paste(hero, (hx, hy), hero)

    # Call to action: a gold bubble (with a tail pointing at the hero when he says it).
    d = ImageDraw.Draw(img)
    glow_behind(img, [bx - 10 * S, by, bx + cta_w + 10 * S, by + cta_h], C["gold"], 70, 22 * S)
    d = ImageDraw.Draw(img)
    if tail:
        d.polygon(tail, fill=C["gold"])
    d.rounded_rectangle([bx, by, bx + cta_w, by + cta_h], radius=cta_h / 2, fill=C["gold"])
    cb = cf.getbbox(cta)
    d.text((bx + (cta_w - d.textlength(cta, font=cf)) / 2, by + (cta_h - (cb[1] + cb[3])) / 2), cta, font=cf, fill=C["onGold"])

    return img.resize((W, H), Image.LANCZOS)


def scans_to(path, url):
    try:
        import cv2
    except ImportError:
        print("  (opencv not installed: scan check skipped)")
        return True
    img = cv2.imread(str(path))
    reads = {}
    for zoom in (1, .75, .5):  # full size, and smaller, like a phone held farther away
        im = img if zoom == 1 else cv2.resize(img, None, fx=zoom, fy=zoom, interpolation=cv2.INTER_AREA)
        for name, det in (("classic", cv2.QRCodeDetector), ("aruco", cv2.QRCodeDetectorAruco)):
            reads[f"{name}@{zoom:g}"] = det().detectAndDecode(im)[0]
    good = all(v == url for v in reads.values())  # two different readers must agree at every zoom
    print(f"  scan check: {'ok' if good else 'FAILED'} " + ", ".join(f"{k}={'ok' if v == url else repr(v)}" for k, v in reads.items()))
    return good


def make(game_json):
    spec = json.loads(game_json.read_text(encoding="utf-8"))
    rel = max(spec["releases"], key=lambda r: r["version"])
    name = re.sub(r"\s+v\d+$", "", spec["title"])
    out = ROOT / "dist" / f"{spec['id']}-qr.png"
    url = spec.get("home") or rel["url"]
    colors, badge, cta, tagline, hero = theme_for(spec)
    card(name, url, colors, badge, cta, tagline, render_hero(hero)).save(out, optimize=True)
    print(f"Wrote {out.relative_to(ROOT).as_posix()} for {url}")
    return scans_to(out, url)


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    if sys.argv[1] == "--all":
        games = [g for g in sorted((ROOT / "games").glob("*/game.json")) if "qr" in json.loads(g.read_text(encoding="utf-8"))]
    else:
        games = [ROOT / sys.argv[1]]
    ok = [make(g) for g in games]
    sys.exit(0 if all(ok) else 1)


if __name__ == "__main__":
    main()
