#!/usr/bin/env python3
"""
@file build/qr.py
@about Makes the shareable QR card for a game's newest release: the game's night-sky colors, its gold four-point star and rocket icons, the title and version, and a QR code that opens the release page. Checks that the finished card scans back to the right link.
@requires kit/base.css, assets/fx/defs.svg, assets/icons/icons.js (colors and icon shapes are copied from these)

Usage, from the library folder:
  python3 build/qr.py games/starward/game.json     card for the newest release in game.json
Writes dist/<id>-v<N>-qr.png. Needs: pip install "qrcode[pil]" opencv-python-headless
Exits 1 if the card does not scan back to the release link.
"""
import json
import math
import pathlib
import random
import sys

import qrcode
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


def font(size, heavy=True):
    names = ("seguibl.ttf", "segoeuib.ttf", "arialbd.ttf") if heavy else ("segoeuisb.ttf", "segoeui.ttf", "arial.ttf")
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    return ImageFont.load_default()


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


def background(w, h):
    img = Image.new("RGB", (w, h), VOID)
    glow = Image.new("RGB", (w, h), VOID)
    gd = ImageDraw.Draw(glow)
    for i in range(40, 0, -1):  # soft nebula glow near the top, like the game's sky
        t = i / 40
        c = tuple(int(a + (b - a) * (1 - t)) for a, b in zip(rgb(VOID), rgb(NEBULA_HI)))
        r = int(w * 0.95 * t)
        gd.ellipse([w * 0.62 - r, -r * 0.55, w * 0.62 + r, r * 0.95], fill=c)
    img = Image.blend(img, glow.filter(ImageFilter.GaussianBlur(w // 30)), 0.9)
    d = ImageDraw.Draw(img)
    rnd = random.Random(7)  # same stars every time
    for _ in range(170):
        sx, sy, sr = rnd.random() * w, rnd.random() * h, rnd.choice((1, 1, 1.5, 2, 2.5)) * SCALE
        d.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=rnd.choice((STARLIGHT, DUST, DUST)))
    for sx, sy, sr in ((0.1, 0.07, 14), (0.9, 0.12, 10), (0.07, 0.62, 9), (0.93, 0.7, 13), (0.15, 0.93, 8), (0.86, 0.94, 11)):
        d.polygon(spark4(sx * w, sy * h, sr * SCALE), fill=EMBER_GOLD)
    return img


def qr_tile(url, size):
    """Rounded QR code: void dots on a starlight tile, ember finder centers, a gold star in the middle."""
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, border=0)
    qr.add_data(url)
    qr.make(fit=True)
    m = qr.get_matrix()
    n = len(m)
    quiet = 4
    cell = size / (n + 2 * quiet)
    tile = Image.new("RGB", (size, size), STARLIGHT)
    d = ImageDraw.Draw(tile)
    finders = [(0, 0), (0, n - 7), (n - 7, 0)]
    in_finder = lambda r, c: any(fr <= r < fr + 7 and fc <= c < fc + 7 for fr, fc in finders)
    logo = n * 0.22  # cleared square in the middle for the star badge
    lo, hi = (n - logo) / 2, (n + logo) / 2
    for r in range(n):
        for c in range(n):
            if not m[r][c] or in_finder(r, c) or (lo <= r < hi and lo <= c < hi):
                continue
            x0, y0 = (c + quiet) * cell, (r + quiet) * cell
            pad = cell * 0.03
            d.rounded_rectangle([x0 + pad, y0 + pad, x0 + cell - pad, y0 + cell - pad], radius=cell * 0.28, fill=VOID)
    # Finder eyes stay plain, dark and nearly square so scanners find them: heavily rounded eyes,
    # or a colored star inside them, fail the scan check.
    for fr, fc in finders:
        x0, y0 = (fc + quiet) * cell, (fr + quiet) * cell
        d.rounded_rectangle([x0, y0, x0 + 7 * cell, y0 + 7 * cell], radius=cell * 0.45, fill=VOID)
        d.rounded_rectangle([x0 + cell, y0 + cell, x0 + 6 * cell, y0 + 6 * cell], radius=cell * 0.25, fill=STARLIGHT)
        d.rounded_rectangle([x0 + 2 * cell, y0 + 2 * cell, x0 + 5 * cell, y0 + 5 * cell], radius=cell * 0.25, fill=VOID)
    cx = cy = size / 2
    br = (logo / 2) * cell * 0.92
    d.ellipse([cx - br, cy - br, cx + br, cy + br], fill=VOID, outline=EMBER_GOLD, width=max(2, int(cell * 0.35)))
    d.polygon(spark4(cx, cy, br * 0.72), fill=EMBER_GOLD)
    return tile


def card(title, version, url):
    w, h = W * SCALE, H * SCALE
    img = background(w, h)
    d = ImageDraw.Draw(img)

    # Title row, like the game's top bar: gold star, then the name.
    tf = font(150 * SCALE)
    tw = d.textlength(title, font=tf)
    star = 64 * SCALE
    gap = 28 * SCALE
    x = (w - (star * 2 + gap + tw)) / 2
    ty = 90 * SCALE
    asc = tf.getbbox(title)
    mid = ty + (asc[1] + asc[3]) / 2
    halo = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(halo).polygon(spark4(x + star, mid, star * 1.25), fill=rgb(EMBER) + (170,))
    img.paste(halo.filter(ImageFilter.GaussianBlur(18 * SCALE)), (0, 0), halo.filter(ImageFilter.GaussianBlur(18 * SCALE)))
    d = ImageDraw.Draw(img)
    d.polygon(spark4(x + star, mid, star), fill=EMBER_GOLD)
    d.text((x + star * 2 + gap, ty), title, font=tf, fill=STARLIGHT)

    # Version chip in ember gold.
    vf = font(44 * SCALE)
    label = f"VERSION {version}"
    lw = d.textlength(label, font=vf)
    cy0 = ty + asc[3] + 34 * SCALE
    padx, chip_h = 34 * SCALE, 78 * SCALE
    d.rounded_rectangle([(w - lw) / 2 - padx, cy0, (w + lw) / 2 + padx, cy0 + chip_h], radius=chip_h / 2, fill=EMBER_GOLD)
    vb = vf.getbbox(label)
    d.text(((w - lw) / 2, cy0 + (chip_h - (vb[1] + vb[3])) / 2), label, font=vf, fill=ON_EMBER)

    # QR tile with a glowing ember-gold frame.
    qs = 760 * SCALE
    qx, qy = (w - qs) // 2, int(cy0 + chip_h + 70 * SCALE)
    frame = 22 * SCALE
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(glow).rounded_rectangle([qx - frame * 2, qy - frame * 2, qx + qs + frame * 2, qy + qs + frame * 2],
                                           radius=70 * SCALE, fill=rgb(EMBER) + (150,))
    glow = glow.filter(ImageFilter.GaussianBlur(30 * SCALE))
    img.paste(glow, (0, 0), glow)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([qx - frame, qy - frame, qx + qs + frame, qy + qs + frame], radius=56 * SCALE,
                        fill=STARLIGHT, outline=EMBER_GOLD, width=8 * SCALE)
    img.paste(qr_tile(url, qs), (qx, qy))

    # Call to action with the rocket icon.
    cf = font(66 * SCALE)
    cta = "Scan to play!"
    cw = d.textlength(cta, font=cf)
    rs = 4.2 * SCALE
    rw = 24 * rs
    by = qy + qs + frame + 70 * SCALE
    bx = (w - (rw + 20 * SCALE + cw)) / 2
    rocket(d, bx, by - 2 * rs, rs, STARLIGHT, VOID, EMBER)
    cb = cf.getbbox(cta)
    d.text((bx + rw + 20 * SCALE, by + (24 * rs - (cb[1] + cb[3])) / 2 - 2 * rs), cta, font=cf, fill=EMBER_GOLD)

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
    card(name, rel["version"], rel["url"]).save(out, optimize=True)
    print(f"Wrote {out.relative_to(ROOT).as_posix()} for {rel['url']}")
    sys.exit(0 if scans_to(out, rel["url"]) else 1)


if __name__ == "__main__":
    main()
