/**
 * @file assets/characters/nova.js
 * @about Nova, a teeny baby Spinosaurus with a coral sail, a long snout, and a glowing star lantern. Her outline, filled solid black and made huge, is also the giant shadow everyone calls Shadowspine.
 * @provides Kit.art.nova { SHAPES, g(options), shadow(fill), svg(options, size), url(options, size), path2d() }
 * @requires nothing
 *
 * options = { face: smile | happy | worried | surprised, lantern: true (default) | false, flip: true to face left }
 * Drawing space: facing right, feet at y = 0, about 62 units tall (x from -54 to 50, y from -62 to 2).
 * SHAPES are the outline pieces (tail, sail, body, legs, head, arm) as SVG path strings. shadow() fills them all one color,
 * which is how Shadowspine is drawn, and path2d() gives the same pieces for canvas drawing.
 */
(function (Kit) {
  "use strict";
  const art = Kit.art = Kit.art || {};
  const ell = (cx, cy, rx, ry) => `M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
  const SHAPES = {
    tail: "M-12 -24 C-28 -24 -42 -16 -54 -4 C-42 -5 -28 -9 -10 -12 Z",
    sail: "M-14 -30 C-16 -50 -4 -62 8 -60 C18 -58 22 -46 18 -30 Z",
    body: ell(2, -20, 17, 14),
    legBack: "M-9 -12 h8 v10 q0 2 3 2 h2 v2 h-13 z",
    legFront: "M5 -12 h8 v10 q0 2 3 2 h2 v2 h-13 z",
    head: "M10 -28 C13 -40 24 -43 31 -39 L46 -35 C51 -34 51 -27 46 -26 L28 -23 C19 -21 12 -23 10 -28 Z",
    arm: "M14 -18 Q22 -16 26 -11 L23 -9 Q19 -13 13 -14 Z"
  };
  const C = { body: "#36c9d8", belly: "#fff3d6", sail: "#ff8a5c", stripe: "#ffd27a", line: "#0e3b52", cheek: "#ff8fb1" };

  function face(f) {
    const L = C.line;
    const eye = (pr = 3, py = -34) => `<ellipse cx="24" cy="-34" rx="5.4" ry="6" fill="#fff" stroke="${L}" stroke-width="1.8"/><circle cx="25.5" cy="${py}" r="${pr}" fill="#1b1030"/><circle cx="26.6" cy="${py - 1.6}" r="1.1" fill="#fff"/>`;
    switch (f) {
      case "happy": return `<path d="M19 -34 Q24 -40 29 -34" fill="none" stroke="${L}" stroke-width="2.4" stroke-linecap="round"/><path d="M31 -27 Q38 -23 45 -28" fill="none" stroke="${L}" stroke-width="2" stroke-linecap="round"/>`;
      case "worried": return `${eye(2.8, -33)}<path d="M18 -42 Q24 -44 29 -41" fill="none" stroke="${L}" stroke-width="1.8" stroke-linecap="round"/><path d="M32 -27 q3 -2 6 0 t6 0" fill="none" stroke="${L}" stroke-width="1.8" stroke-linecap="round"/>`;
      case "surprised": return `${eye(2.2, -34)}<ellipse cx="40" cy="-27" rx="2.4" ry="2.8" fill="#7a1f3d"/>`;
      default: return `${eye()}<path d="M31 -27 Q38 -25 45 -28" fill="none" stroke="${L}" stroke-width="1.8" stroke-linecap="round"/>`;
    }
  }

  const lanternMarkup = () => `<g transform="translate(27,-6)">
      <circle r="15" fill="url(#novaGlow)"/>
      <path d="M0 -12 V-7" stroke="${C.line}" stroke-width="1.6"/>
      <rect x="-5.5" y="-7" width="11" height="12" rx="3" fill="#fff8d6" stroke="${C.line}" stroke-width="1.6"/>
      <path d="M0 -4.5 L1.3 -1.3 L4.5 0 L1.3 1.3 L0 4.5 L-1.3 1.3 L-4.5 0 L-1.3 -1.3 Z" fill="#ffd43b" transform="translate(0,-1)"/>
    </g>`;

  function g(o = {}) {
    const L = C.line, sw = `stroke="${L}" stroke-width="2" stroke-linejoin="round"`;
    const body = `
      <path d="${SHAPES.tail}" fill="${C.body}" ${sw}/>
      <path d="${SHAPES.sail}" fill="${C.sail}" ${sw}/>
      <path d="M-8 -32 L-8 -54 M0 -32 L1 -59 M8 -32 L10 -58 M14 -32 L16 -50" stroke="${C.stripe}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="${SHAPES.legBack}" fill="${C.body}" ${sw} opacity=".92"/>
      <path d="${SHAPES.body}" fill="${C.body}" ${sw}/>
      <ellipse cx="6" cy="-17" rx="9" ry="8" fill="${C.belly}"/>
      <path d="${SHAPES.legFront}" fill="${C.body}" ${sw}/>
      <path d="${SHAPES.head}" fill="${C.body}" ${sw}/>
      <circle cx="44" cy="-33" r="1" fill="${L}"/>
      <ellipse cx="31" cy="-29" rx="3" ry="2" fill="${C.cheek}" opacity=".8"/>
      ${face(o.face)}
      ${o.lantern === false ? "" : lanternMarkup()}
      <path d="${SHAPES.arm}" fill="${C.body}" ${sw}/>`;
    const defs = `<defs><radialGradient id="novaGlow"><stop offset="0" stop-color="#fff3a8" stop-opacity=".95"/><stop offset=".45" stop-color="#ffd43b" stop-opacity=".45"/><stop offset="1" stop-color="#ffd43b" stop-opacity="0"/></radialGradient></defs>`;
    return defs + (o.flip ? `<g transform="scale(-1,1)">${body}</g>` : body);
  }

  // Shadowspine: Nova's outline, all one color. Same shapes, so the giant shadow really is her.
  const shadow = (fill = "#000") => Object.values(SHAPES).map(d => `<path d="${d}" fill="${fill}"/>`).join("");
  let p2d = null;
  const path2d = () => p2d || (p2d = Object.values(SHAPES).map(d => new Path2D(d)));

  const svg = (o = {}, size = 80) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size * 70 / 110)}" viewBox="${o.flip ? "-52" : "-58"} -64 110 70">${g(o)}</svg>`;
  const url = (o, size) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg(o, size));

  art.nova = { SHAPES, COLORS: C, g, shadow, svg, url, path2d };
})(window.Kit = window.Kit || {});
