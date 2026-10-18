/**
 * @file assets/style/ink.js
 * @about The Glitch Nebula cartoon style in one place, so every character and prop is drawn the same way: dark ink outlines, flat colors with one shadow tone and one shine, big shiny eyes with two highlights, rosy blush, see-through glass with a rim and a shine, and yellow sparkles and stars with ink edges. T-Rexy and his family, Nova, the ship, and T-Rexy's looks all draw with these, and scene code can draw the same sparkle on a canvas.
 * @provides Kit.art.ink { INK, LINE, FINE, GLASS, mix(a, b, t), shadeOf(color, t), eye(o), blush(o), sparkle(x, y, r), star(x, y, r, fill, line, w), glass(d, o), shine(d, w, opacity), glint(x, y, r), gloss(cx, cy, rx, ry, rotate), crescent(o), canvasSparkle(ctx, x, y, r) }
 * @requires nothing
 *
 * The style rules (the game design guide has the same list):
 * 1. Living things are outlined in their own darkest color (T-Rexy dark green, Nova dark teal). Gear and machines (hats, the ship,
 *    the scrap on the crash pad) are outlined in the shared INK. Glow things (portals, pieces, pads, galaxies) have no outline: they're light.
 * 2. Line weights are for a character about 100 units tall: LINE (2.4) around shapes, FINE (1.4) for details inside them.
 *    A small character drawn next to a big one gets thicker lines in its own units, so the two match on screen.
 * 3. Flat colors with exactly one shadow tone (on the bottom and the back, away from the light) and one shine (white, on the top front).
 * 4. Open eyes are big and white with a dark pupil, a soft purple iris, and two white highlights (a big one up and forward, a small one low and back).
 * 5. Blush is a soft pink oval under the eye. Sparkles are four-point, yellow, with a thin ink edge. Stars are five-point.
 * 6. Glass is a pale cyan wash you can see through, an ink outline, and a white shine arc with a little glint.
 */
(function (Kit) {
  "use strict";
  const art = Kit.art = Kit.art || {};
  const INK = "#1b1030", LINE = 2.4, FINE = 1.4;
  const GLASS = { tint: "#c8f4ff", opacity: .16 };
  const f = n => +(+n).toFixed(2);

  // Mixes two #rrggbb colors: t = 0 gives a, t = 1 gives b.
  function mix(a, b, t) {
    const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const A = p(a), B = p(b);
    return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
  }
  // The one shadow tone for a color: the color pushed a little toward the ink.
  const shadeOf = (color, t = .22) => mix(color, INK, t);

  // A big shiny eye. cx, cy, rx, ry = the white; px, py, pr = the pupil; line, lw = outline color and width;
  // star: a star-sparkle highlight instead of the two round ones (for excited faces).
  function eye({ cx = 0, cy = 0, rx = 9.4, ry = 10.2, px = cx + 2.4, py = cy + .4, pr = 6.4, line = INK, lw = 2.2, star = false } = {}) {
    let s = `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="#fff" stroke="${line}" stroke-width="${f(lw)}"/>
      <circle cx="${f(px)}" cy="${f(py)}" r="${f(pr)}" fill="${INK}"/>
      <circle cx="${f(px)}" cy="${f(py + pr * .38)}" r="${f(pr * .58)}" fill="#4b3a8a" opacity=".5"/>`;
    s += star
      ? `<path d="M${f(px + pr * .31)} ${f(py - pr * .84)} l${f(pr * .17)} ${f(pr * .4)} l${f(pr * .42)} ${f(pr * .14)} l${f(-pr * .42)} ${f(pr * .14)} l${f(-pr * .17)} ${f(pr * .42)} l${f(-pr * .17)} ${f(-pr * .42)} l${f(-pr * .42)} ${f(-pr * .14)} l${f(pr * .42)} ${f(-pr * .14)} Z" fill="#fff"/><circle cx="${f(px - pr * .41)}" cy="${f(py + pr * .44)}" r="${f(pr * .19)}" fill="#fff"/>`
      : `<circle cx="${f(px + pr * .38)}" cy="${f(py - pr * .42)}" r="${f(pr * .36)}" fill="#fff"/><circle cx="${f(px - pr * .42)}" cy="${f(py + pr * .42)}" r="${f(pr * .17)}" fill="#fff"/>`;
    return s;
  }
  // Rosy blush; marks = three little happy lines on top.
  function blush({ cx = 0, cy = 0, rx = 5.8, ry = 3.6, color = "#ff8fb1", k = .88, marks = false } = {}) {
    return `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${color}" opacity="${k}"/>` + (marks
      ? `<path d="M${f(cx - rx * .5)} ${f(cy - ry * .67)} l${f(-rx * .24)} ${f(ry * .72)} M${f(cx + rx * .05)} ${f(cy - ry * .78)} l${f(-rx * .24)} ${f(ry * .72)} M${f(cx + rx * .6)} ${f(cy - ry * .67)} l${f(-rx * .24)} ${f(ry * .72)}" stroke="#d94f78" stroke-width="${f(rx * .2)}" stroke-linecap="round" opacity=".7"/>` : "");
  }
  // A four-point sparkle.
  const sparkle = (x, y, r = 3.4) => `<path d="M${f(x)} ${f(y - r)} L${f(x + r * .28)} ${f(y - r * .28)} L${f(x + r)} ${f(y)} L${f(x + r * .28)} ${f(y + r * .28)} L${f(x)} ${f(y + r)} L${f(x - r * .28)} ${f(y + r * .28)} L${f(x - r)} ${f(y)} L${f(x - r * .28)} ${f(y - r * .28)} Z" fill="#ffe94a" stroke="#7a5a00" stroke-width="${f(Math.max(.6, r * .24))}" stroke-linejoin="round"/>`;
  // A five-point star centered at (x, y).
  const star = (x, y, r, fill = "#ffe94a", line = INK, w = 1.2) => {
    const pts = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, k = i % 2 ? r * .45 : r; pts.push(`${f(x + Math.cos(a) * k)},${f(y + Math.sin(a) * k)}`); }
    return `<polygon points="${pts.join(" ")}" fill="${fill}" stroke="${line}" stroke-width="${f(w)}" stroke-linejoin="round"/>`;
  };
  // Glass: a pale see-through wash with an ink outline. Add a shine() arc and a glint() on top.
  const glass = (d, { tint = GLASS.tint, opacity = GLASS.opacity, w = 2.2, line = INK } = {}) =>
    `<path d="${d}" fill="${tint}" fill-opacity="${opacity}" stroke="${line}" stroke-width="${f(w)}" stroke-linejoin="round"/>`;
  const shine = (d, w = 2.6, opacity = .8) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="${f(w)}" stroke-linecap="round" opacity="${opacity}"/>`;
  const glint = (x, y, r = 1.4) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#fff" opacity=".9"/>`;
  // The soft shine on a round shape (a head, a hull, a hat).
  const gloss = (cx, cy, rx, ry, rot = 0) => `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" transform="rotate(${f(rot)} ${f(cx)} ${f(cy)})" fill="#fff" opacity=".32"/>`;
  // A shadow crescent that stays inside an ellipse: the outer edge follows the ellipse from angle a0 to a1 (degrees, 0 = right,
  // 90 = down), the inner edge follows the same ellipse moved by (dx, dy). Returns path data.
  function crescent({ cx, cy, rx, ry, a0, a1, dx, dy, n = 18 }) {
    const pt = (a, ox = 0, oy = 0) => { const r = a * Math.PI / 180; return `${f(cx + ox + Math.cos(r) * rx)} ${f(cy + oy + Math.sin(r) * ry)}`; };
    const out = [], back = [];
    for (let i = 0; i <= n; i++) out.push(pt(a0 + (a1 - a0) * i / n));
    for (let i = n; i >= 0; i--) { // the inner edge, kept inside the outer ellipse
      const a = a0 + (a1 - a0) * i / n, r = a * Math.PI / 180;
      let x = cx + dx + Math.cos(r) * rx, y = cy + dy + Math.sin(r) * ry;
      const k = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
      if (k > 1) { const s = 1 / Math.sqrt(k); x = cx + (x - cx) * s; y = cy + (y - cy) * s; }
      back.push(`${f(x)} ${f(y)}`);
    }
    return `M${out.join(" L")} L${back.join(" L")} Z`;
  }
  // The same four-point sparkle, for canvas scenes. r = size in pixels.
  function canvasSparkle(ctx, x, y, r) {
    ctx.save(); ctx.beginPath();
    [[0, -r], [r * .28, -r * .28], [r, 0], [r * .28, r * .28], [0, r], [-r * .28, r * .28], [-r, 0], [-r * .28, -r * .28]].forEach(([a, b], i) => i ? ctx.lineTo(x + a, y + b) : ctx.moveTo(x + a, y + b));
    ctx.closePath(); ctx.fillStyle = "#ffe94a"; ctx.fill();
    ctx.lineWidth = Math.max(1, r * .2); ctx.lineJoin = "round"; ctx.strokeStyle = "#7a5a00"; ctx.stroke(); ctx.restore();
  }

  art.ink = { INK, LINE, FINE, GLASS, mix, shadeOf, eye, blush, sparkle, star, glass, shine, glint, gloss, crescent, canvasSparkle };
})(window.Kit = window.Kit || {});
