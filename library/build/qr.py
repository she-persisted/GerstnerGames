#!/usr/bin/env python3
"""
@file build/qr.py
@about Makes the shareable QR card for a game's newest release in that game's own colors and icons, with the title and version and a QR code that opens the game's permanent home page ("home" in game.json). Starward gets its night sky, gold four-point stars, and rocket; a game can set its own look with a "qr" block in game.json (Mini Game Survival: neon colors, spikes, jigsaw pieces, and T-Rexy's head). Checks that the finished card scans back to the right link.
@requires kit/base.css, assets/fx/defs.svg, assets/icons/icons.js, assets/characters/trexy.js (colors and icon shapes are copied from these)

Usage, from the library folder:
  python3 build/qr.py games/starward/game.json     card for the newest release in game.json
Writes dist/<id>-v<N>-qr.png. Needs Pillow and opencv-python-headless (pip install opencv-python-headless).
Uses the qrcode package when installed (pip install "qrcode[pil]"); otherwise OpenCV's own QR encoder makes the code.
Exits 1 if the card does not scan back to the release link.

Optional "qr" block in game.json:
  { "colors": { void, nebula, nebulaHi, starlight, dust, glow, accent, gold, onGold }, "badge": "star" | "trexy", "cta": "Scan to play!" }
"""
import functools
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


# Windows fonts first (the look of the v5 card), then common Linux fonts, so the card looks right on any machine.
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


def theme_for(spec):
    q = spec.get("qr") or {}
    return {**STARWARD, **(q.get("colors") or {})}, q.get("badge", "star"), q.get("cta", "Scan to play!")


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
    """Points along an SVG path made of M, C, L and Z commands (enough for T-Rexy's head)."""
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
    corners = ((0.1, 0.07, 14), (0.9, 0.12, 10), (0.07, 0.62, 9), (0.93, 0.7, 13), (0.15, 0.93, 8), (0.86, 0.94, 11))
    if badge == "trexy":  # a long title fills the top, so keep the corners clear of it
        corners = ((0.05, 0.035, 12), (0.95, 0.03, 9), (0.05, 0.6, 9), (0.95, 0.66, 12), (0.07, 0.95, 8), (0.93, 0.95, 10))
    for i, (sx, sy, sr) in enumerate(corners):
        if badge == "trexy":  # spikes and memory pieces from the obstacle runs
            if i % 2:
                piece(d, sx * w, sy * h, sr * SCALE * 1.3, C["accent"])
            else:
                d.polygon(spike(sx * w, sy * h + sr * SCALE * 1.4, sr * SCALE * 3), fill=C["glow"])
        else:
            d.polygon(spark4(sx * w, sy * h, sr * SCALE), fill=C["gold"])
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
    """Rounded QR code: dark dots on a light tile, plain finder eyes, and the game's badge in the middle."""
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
            pad = cell * 0.03
            d.rounded_rectangle([x0 + pad, y0 + pad, x0 + cell - pad, y0 + cell - pad], radius=cell * 0.28, fill=C["void"])
    # Finder eyes stay plain, dark and nearly square so scanners find them: heavily rounded eyes,
    # or a colored star inside them, fail the scan check.
    for fr, fc in finders:
        x0, y0 = (fc + quiet) * cell, (fr + quiet) * cell
        d.rounded_rectangle([x0, y0, x0 + 7 * cell, y0 + 7 * cell], radius=cell * 0.45, fill=C["void"])
        d.rounded_rectangle([x0 + cell, y0 + cell, x0 + 6 * cell, y0 + 6 * cell], radius=cell * 0.25, fill=C["starlight"])
        d.rounded_rectangle([x0 + 2 * cell, y0 + 2 * cell, x0 + 5 * cell, y0 + 5 * cell], radius=cell * 0.25, fill=C["void"])
    cx = cy = size / 2
    br = (logo / 2) * cell * 0.92
    d.ellipse([cx - br, cy - br, cx + br, cy + br], fill=C["void"], outline=C["gold"] if badge == "star" else C["glow"], width=max(2, int(cell * 0.35)))
    if badge == "trexy":
        trexy_head(d, cx, cy, br * 1.25)
    else:
        d.polygon(spark4(cx, cy, br * 0.72), fill=C["gold"])
    return tile


def fit_font(d, text, max_w, start):
    size = int(start)
    while size > 40 * SCALE and d.textlength(text, font=font(size)) > max_w:
        size -= 6 * SCALE
    return font(size)


def card(title, version, url, C, badge, cta):
    w, h = W * SCALE, H * SCALE
    img = background(w, h, C, badge)
    d = ImageDraw.Draw(img)

    # Title row, like the game's top bar: the badge icon, then the name (two lines if it's long).
    star = 64 * SCALE
    gap = 28 * SCALE
    words = title.split()
    lines = [title]
    room = w * 0.76 - star * 2 - gap  # keep the title row clear of the corner icons, whatever font this machine has
    tf = fit_font(d, title, room, 150 * SCALE)
    if tf.size < 104 * SCALE and len(words) > 1:  # too small on one line: split it in two
        half = (len(words) + 1) // 2
        lines = [" ".join(words[:half]), " ".join(words[half:])]
        tf = fit_font(d, max(lines, key=len), room, 132 * SCALE)
    ty = 80 * SCALE
    asc = tf.getbbox("Hg")
    line_h = (asc[3] - asc[1]) * 1.12
    tw = max(d.textlength(l, font=tf) for l in lines)
    x = (w - (star * 2 + gap + tw)) / 2
    mid = ty + asc[1] + line_h * len(lines) / 2
    halo = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    hd = ImageDraw.Draw(halo)
    if badge == "trexy":
        hd.ellipse([x, mid - star * 1.2, x + star * 2.4, mid + star * 1.2], fill=rgb(C["glow"]) + (170,))
    else:
        hd.polygon(spark4(x + star, mid, star * 1.25), fill=rgb(C["glow"]) + (170,))
    blurred = halo.filter(ImageFilter.GaussianBlur(18 * SCALE))
    img.paste(blurred, (0, 0), blurred)
    d = ImageDraw.Draw(img)
    if badge == "trexy":
        trexy_head(d, x + star, mid, star * 2.3)
    else:
        d.polygon(spark4(x + star, mid, star), fill=C["gold"])
    for i, l in enumerate(lines):
        d.text((x + star * 2 + gap, ty + i * line_h), l, font=tf, fill=C["starlight"])
    title_bottom = ty + asc[1] + line_h * len(lines)

    # Version chip.
    vf = font(44 * SCALE)
    label = f"VERSION {version}"
    lw = d.textlength(label, font=vf)
    cy0 = title_bottom + 30 * SCALE
    padx, chip_h = 34 * SCALE, 78 * SCALE
    d.rounded_rectangle([(w - lw) / 2 - padx, cy0, (w + lw) / 2 + padx, cy0 + chip_h], radius=chip_h / 2, fill=C["gold"])
    vb = vf.getbbox(label)
    d.text(((w - lw) / 2, cy0 + (chip_h - (vb[1] + vb[3])) / 2), label, font=vf, fill=C["onGold"])

    # QR tile with a glowing frame, sized to fit what's left of the card.
    room = h - (cy0 + chip_h + 70 * SCALE) - 210 * SCALE
    qs = int(min(760 * SCALE, room))
    qx, qy = (w - qs) // 2, int(cy0 + chip_h + 60 * SCALE)
    frame = 22 * SCALE
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(glow).rounded_rectangle([qx - frame * 2, qy - frame * 2, qx + qs + frame * 2, qy + qs + frame * 2],
                                           radius=70 * SCALE, fill=rgb(C["glow"]) + (150,))
    glow = glow.filter(ImageFilter.GaussianBlur(30 * SCALE))
    img.paste(glow, (0, 0), glow)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([qx - frame, qy - frame, qx + qs + frame, qy + qs + frame], radius=56 * SCALE,
                        fill=C["starlight"], outline=C["gold"], width=8 * SCALE)
    img.paste(qr_tile(url, qs, C, badge), (qx, qy))

    # Call to action with the game's icon.
    cf = font(66 * SCALE)
    cw = d.textlength(cta, font=cf)
    rs = 4.2 * SCALE
    rw = 24 * rs
    by = qy + qs + frame + 60 * SCALE
    bx = (w - (rw + 20 * SCALE + cw)) / 2
    if badge == "trexy":
        d.polygon(spike(bx + rw * .3, by + 22 * rs, 18 * rs), fill=C["glow"])
        piece(d, bx + rw * .8, by + 14 * rs, 4.5 * rs, C["accent"])
    else:
        rocket(d, bx, by - 2 * rs, rs, C["starlight"], C["void"], C["glow"])
    cb = cf.getbbox(cta)
    d.text((bx + rw + 20 * SCALE, by + (24 * rs - (cb[1] + cb[3])) / 2 - 2 * rs), cta, font=cf, fill=C["gold"])

    return img.resize((W, H), Image.LANCZOS)


def scans_to(path, url):
    try:
        import cv2
    except ImportError:
        print("  (opencv not installed: scan check skipped)")
        return True
    img = cv2.imread(str(path))
    reads = {name: det().detectAndDecode(img)[0] for name, det in
             (("classic", cv2.QRCodeDetector), ("aruco", cv2.QRCodeDetectorAruco))}
    good = all(v == url for v in reads.values())  # two different readers must both agree
    print(f"  scan check: {'ok' if good else 'FAILED'} " + ", ".join(f"{k}={'ok' if v == url else repr(v)}" for k, v in reads.items()))
    return good


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    spec = json.loads((ROOT / sys.argv[1]).read_text(encoding="utf-8"))
    rel = max(spec["releases"], key=lambda r: r["version"])
    name = spec["title"].rsplit(" v", 1)[0]
    out = ROOT / "dist" / f"{spec['id']}-v{rel['version']}-qr.png"
    url = spec.get("home") or rel["url"]
    colors, badge, cta = theme_for(spec)
    card(name, rel["version"], url, colors, badge, cta).save(out, optimize=True)
    print(f"Wrote {out.relative_to(ROOT).as_posix()} for {url}")
    sys.exit(0 if scans_to(out, url) else 1)


if __name__ == "__main__":
    main()
