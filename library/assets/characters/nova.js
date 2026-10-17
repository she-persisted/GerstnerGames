/**
 * @file assets/characters/nova.js
 * @about Nova, a teeny baby Spinosaurus with a coral sail, a long snout, and a glowing star lantern. Her outline is one solid dinosaur shape (tail, spiny sail, snout, legs, and claws), plus a jaw that can open. Filled solid black and made huge, that same outline is the giant shadow everyone calls Shadowspine, toothy grin and all.
 * @provides Kit.art.nova { SHAPES, HINGE, COLORS, g(options), shadow(fill, jawDegrees), svg(options, size), url(options, size), path2d() }
 * @requires nothing
 *
 * options = { face: smile | happy | worried | surprised, lantern: true (default) | false, flip: true to face left }
 * Drawing space: facing right, feet at y = 0, about 62 units tall (x from -60 to 52, y from -62 to 1).
 * SHAPES: body (one outline: tail, body, sail, neck, head and upper teeth, both legs), jaw (lower jaw with teeth), arm.
 * HINGE is where the jaw turns. shadow() draws the three shapes in one color (the jaw a little open for a grin), and path2d()
 * gives the same shapes for canvas drawing, so a game can make the shadow laugh by turning the jaw around HINGE.
 */
(function (Kit) {
  "use strict";
  const art = Kit.art = Kit.art || {};
  const f = n => +n.toFixed(2);

  // The sail: an arch of spines along the back, from the hips (x0) to the shoulders (x1).
  const SAIL = { x0: -15, y0: -30, x1: 21, y1: -37, H: 26, n: 9 };
  const sailTop = (() => {
    const { x0, y0, x1, y1, H, n } = SAIL;
    const env = x => { const t = (x - x0) / (x1 - x0); return y0 + (y1 - y0) * t - H * Math.sin(Math.PI * Math.min(1, Math.max(0, t))); };
    let d = "";
    const tips = [];
    for (let i = 0; i < n; i++) {
      const xa = x0 + (x1 - x0) * i / n, xb = x0 + (x1 - x0) * (i + 1) / n, xt = xa + (xb - xa) * .55;
      tips.push([f(xt), f(env(xt) - 1.5)]);
      d += `Q${f(xa + (xt - xa) * .4)} ${f(env(xa + (xt - xa) * .4))} ${f(xt)} ${f(env(xt) - 1.5)} `;
      d += i === n - 1 ? `Q${f(xb - .4)} ${f(env(xb) - .6)} ${f(xb + .6)} ${f(y1)} ` : `Q${f(xt + (xb - xt) * .55)} ${f(env(xt + (xb - xt) * .55))} ${f(xb)} ${f(env(xb) + 1.2)} `;
    }
    return { d, tips };
  })();

  const SHAPES = {
    body: `M-60 -17 Q-52 -13 -44 -15.5 C-34 -18.5 -24 -26 -15 -30 ${sailTop.d}` +
      "Q22.6 -42 25.5 -44 Q29.5 -48 34.5 -44.5 L46 -38.4 Q51.5 -37 51.5 -34 Q51.2 -31.8 48.5 -31.6 " +
      "L46.5 -31.6 l-1 1.8 l-1 -1.8 l-1.4 0 l-1 1.8 l-1 -1.8 l-1.4 0 l-1 1.8 l-1 -1.8 l-1.4 0 l-1 1.6 l-1 -1.6 L29 -30.6 " +
      "Q25 -26 22.5 -21 Q21.5 -15 15.5 -10.6 L13.6 -9 Q13.4 -4.5 14 -2.2 L19.4 -1.3 Q21 0 19.4 1 L7.2 1 Q5.4 -3 4.6 -8.4 Q1.8 -10.4 -1.2 -10 " +
      "Q-1.6 -5 -1.1 -2.2 L4.6 -1.3 Q6.2 0 4.6 1 L-7.6 1 Q-10 -4.5 -10.8 -10.6 Q-18 -11.5 -26 -11.8 Q-38 -12 -46 -12.6 Q-54 -13.4 -60 -17 Z",
    jaw: "M27.5 -31.2 L33 -31.6 l.9 -1.5 l.9 1.5 l1.4 0 l.9 -1.5 l.9 1.5 l1.4 0 l.9 -1.5 l.9 1.5 l1.4 0 l.9 -1.5 l.9 1.5 L48.8 -31.8 " +
      "Q50.8 -30.6 49.4 -29 Q44 -27.6 36 -27.4 Q30.5 -26.5 26.5 -26.6 Z",
    arm: "M15.5 -21 Q21 -20 23.6 -16.4 L26.4 -13.6 l.8 2.2 l-2 -1.2 l-.2 2 l-1.8 -1.6 l-.8 1.6 L21.4 -13.6 Q18.6 -16 14.6 -17.4 Z"
  };
  const HINGE = [28, -30.6];
  // Just the coral part of the sail (inside the outline), for the colored drawing.
  const SAIL_FILL = `M${SAIL.x0} ${SAIL.y0} ${sailTop.d}Q4 -33.5 ${SAIL.x0} ${SAIL.y0} Z`;
  const C = { body: "#36c9d8", bodyDark: "#23a5b8", belly: "#fff3d6", sail: "#ff8a5c", stripe: "#ffd27a", line: "#0e3b52", cheek: "#ff8fb1", mouth: "#7a1f3d" };

  function face(f) {
    const L = C.line;
    const eye = (pr = 2.6, py = -38.4, px = 32.4) => `<ellipse cx="31.6" cy="-38.6" rx="4.4" ry="5" fill="#fff" stroke="${L}" stroke-width="1.5"/><circle cx="${px}" cy="${py}" r="${pr}" fill="#1b1030"/><circle cx="${px + 1}" cy="${py - 1.4}" r="1" fill="#fff"/>`;
    const smile = `<path d="M28.6 -31 Q30.6 -29.4 32.4 -30.6" fill="none" stroke="${L}" stroke-width="1.4" stroke-linecap="round"/>`;
    switch (f) {
      case "happy": return `<path d="M27.6 -38.4 Q31.6 -43.4 35.6 -38.4" fill="none" stroke="${L}" stroke-width="2.2" stroke-linecap="round"/>${smile}`;
      case "worried": return `${eye(2.4, -37.8)}<path d="M27.4 -45 Q31.4 -46.6 35.4 -44.2" fill="none" stroke="${L}" stroke-width="1.5" stroke-linecap="round"/>`;
      case "surprised": return eye(1.9, -38.6, 31.8);
      default: return `${eye()}${smile}`;
    }
  }

  const lanternMarkup = () => `<g transform="translate(27,-5)">
      <circle r="15" fill="url(#novaGlow)"/>
      <path d="M0 -10 V-6" stroke="${C.line}" stroke-width="1.4"/>
      <rect x="-5" y="-6" width="10" height="11" rx="3" fill="#fff8d6" stroke="${C.line}" stroke-width="1.5"/>
      <path d="M0 -4 L1.2 -1.2 L4 0 L1.2 1.2 L0 4 L-1.2 1.2 L-4 0 L-1.2 -1.2 Z" fill="#ffd43b" transform="translate(0,-.5)"/>
    </g>`;

  function g(o = {}) {
    const L = C.line, sw = `stroke="${L}" stroke-width="1.8" stroke-linejoin="round"`;
    const open = o.face === "surprised" ? 14 : 0;
    const stripes = sailTop.tips.map(([x, y], i) => {
      const bx = SAIL.x0 + (x - SAIL.x0) * .98 + 1, by = SAIL.y0 + (SAIL.y1 - SAIL.y0) * ((x - SAIL.x0) / (SAIL.x1 - SAIL.x0)) - 1.5;
      return i % 2 ? "" : `M${f(bx)} ${f(by)} L${f(x)} ${f(y + 3.2)}`;
    }).join(" ");
    const body = `
      <path d="${SHAPES.body}" fill="${C.body}"/>
      <g clip-path="url(#novaClip)">
        <path d="${SAIL_FILL}" fill="${C.sail}"/>
        <path d="${stripes}" stroke="${C.stripe}" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M-58 -16.5 Q-40 -10.5 -12 -11.5 Q2 -10 16 -12 Q22 -18 22 -24 Q12 -12 -6 -16 Q-30 -17 -58 -16.5 Z" fill="${C.bodyDark}" opacity=".55"/>
        <ellipse cx="11" cy="-17" rx="8" ry="7" fill="${C.belly}"/>
        <path d="M-9 -9 Q-5 -15 1 -13 M5 -9 Q9 -15 14 -12" fill="none" stroke="${L}" stroke-width="1.1" stroke-linecap="round" opacity=".6"/>
        ${[-20, -32, -44].map((x, i) => `<circle cx="${x}" cy="${-17.5 + i * 1.6}" r="${1.4 - i * .25}" fill="${C.bodyDark}"/>`).join("")}
      </g>
      <path d="${SHAPES.body}" fill="none" ${sw}/>
      ${open ? `<path d="M28.4 -31 L49 -31.8 L46 -27 Q36 -24 29 -27 Z" fill="${C.mouth}"/>` : ""}
      <g transform="rotate(${open} ${HINGE[0]} ${HINGE[1]})"><path d="${SHAPES.jaw}" fill="${C.body}" ${sw}/></g>
      <circle cx="48.4" cy="-36" r=".9" fill="${L}"/>
      <ellipse cx="37" cy="-33.4" rx="2.6" ry="1.7" fill="${C.cheek}" opacity=".85"/>
      <path d="M26 -45.6 Q30 -48.4 34 -45.6" fill="none" stroke="${C.bodyDark}" stroke-width="1.2" stroke-linecap="round"/>
      ${face(o.face)}
      ${o.lantern === false ? "" : lanternMarkup()}
      <path d="${SHAPES.arm}" fill="${C.body}" ${sw}/>`;
    const defs = `<defs><clipPath id="novaClip"><path d="${SHAPES.body}"/></clipPath><radialGradient id="novaGlow"><stop offset="0" stop-color="#fff3a8" stop-opacity=".95"/><stop offset=".45" stop-color="#ffd43b" stop-opacity=".45"/><stop offset="1" stop-color="#ffd43b" stop-opacity="0"/></radialGradient></defs>`;
    return defs + (o.flip ? `<g transform="scale(-1,1)">${body}</g>` : body);
  }

  // Shadowspine: Nova's outline, all one color, jaw open a crack so the teeth show. Same shapes, so the giant shadow really is her.
  const shadow = (fill = "#000", jaw = 6) => `<path d="${SHAPES.body}" fill="${fill}"/><path d="${SHAPES.jaw}" fill="${fill}" transform="rotate(${jaw} ${HINGE[0]} ${HINGE[1]})"/><path d="${SHAPES.arm}" fill="${fill}"/>`;
  let p2d = null;
  const path2d = () => p2d || (p2d = { body: new Path2D(SHAPES.body), jaw: new Path2D(SHAPES.jaw), arm: new Path2D(SHAPES.arm) });

  const svg = (o = {}, size = 80) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size * 70 / 116)}" viewBox="${o.flip ? "-54" : "-62"} -64 116 70">${g(o)}</svg>`;
  const url = (o, size) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg(o, size));

  art.nova = { SHAPES, HINGE, COLORS: C, g, shadow, svg, url, path2d };
})(window.Kit = window.Kit || {});
