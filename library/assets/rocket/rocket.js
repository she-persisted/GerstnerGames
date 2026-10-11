/**
 * @file assets/rocket/rocket.js
 * @about The buildable rocket. Data for every part choice and paint color, plus a drawing function that renders any combination (missing parts can show as dashed outlines, and one part can be highlighted).
 * @provides Kit.art.rocket { PARTS, PART_ORDER, PAINTS, PAINT_ORDER, ENGINE_COLORS, svg(config, options), box(innerSvg, cls), partIcons }
 * @requires assets/fx/defs.svg (unless options.plainFlame)
 *
 * config  = { nose, fins, boost, engine, paint } (any can be missing)
 * options = { ghost: draw missing parts dashed, hl: part key to highlight, flame: show engine flames, face: robot peeking out, plainFlame: no <use> refs (for images) }
 * Drawing space: viewBox -38 -112 76 144, base of the rocket at y = 0.
 */
(function (Kit) {
  "use strict";
  const art = Kit.art = Kit.art || {};
  const FLAME_D = "M0 0 C-11 0 -15 -10 -10 -19 C-6 -26 -1 -29 0 -40 C5 -31 15 -24 13 -12 C12 -4 7 0 0 0 Z";
  const SPARK_D = "M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4 Z";

  const PARTS = {
    nose: { name: "Nose Cone", options: [["point", "Pointy"], ["dome", "Round dome"], ["star", "Star tip"]] },
    fins: { name: "Fins", options: [["classic", "Classic"], ["swept", "Swept wings"], ["bolt", "Lightning"]] },
    boost: { name: "Boosters", options: [["one", "One big booster"], ["two", "Twin boosters"], ["three", "Triple boosters"]] },
    engine: { name: "Star Engine", options: [["gold", "Sun gold"], ["blue", "Comet blue"], ["pink", "Nova pink"], ["green", "Aurora green"]] }
  };
  const PART_ORDER = ["nose", "fins", "boost", "engine"];
  const PAINTS = {
    silver: { label: "Silver Streak", hull: "#c9d3ee", trim: "#ff8740" },
    red: { label: "Rocket Red", hull: "#ff6b6b", trim: "#fff3e6" },
    blue: { label: "Sky Blue", hull: "#5aa9ff", trim: "#ffcb5e" },
    purple: { label: "Galaxy Purple", hull: "#9b7bff", trim: "#8fe6ff" },
    green: { label: "Comet Green", hull: "#4fd18b", trim: "#203457" }
  };
  const PAINT_ORDER = ["silver", "red", "blue", "purple", "green"];
  const ENGINE_COLORS = { gold: ["#fff1b8", "#ffa53d"], blue: ["#d9f7ff", "#4b8bff"], pink: ["#ffd3ec", "#ff4f9a"], green: ["#d8ffe8", "#2fbf71"] };

  function svg(c, o = {}) {
    const P = PAINTS[c.paint] || PAINTS.silver, hull = P.hull, trim = P.trim;
    const G = `fill="none" stroke="#8d88c8" stroke-width="1.4" stroke-dasharray="3 3"`;
    const HL = `fill="rgba(255,203,94,.22)" stroke="#ffcb5e" stroke-width="1.8" stroke-dasharray="3 3"`;
    const part = (key, has, full, ghost) => has ? full : (o.hl === key ? ghost.replaceAll(G, HL) : (o.ghost ? ghost : ""));
    const finPath = {
      classic: ["M-14 -38 L-27 -10 L-27 -5 L-14 -14 Z", "M14 -38 L27 -10 L27 -5 L14 -14 Z"],
      swept: ["M-14 -44 Q-34 -30 -30 -3 L-14 -16 Z", "M14 -44 Q34 -30 30 -3 L14 -16 Z"],
      bolt: ["M-14 -42 L-24 -30 L-19 -28 L-30 -5 L-14 -18 Z", "M14 -42 L24 -30 L19 -28 L30 -5 L14 -18 Z"]
    };
    const noseP = { point: "M-14 -72 Q-12 -90 0 -102 Q12 -90 14 -72 Z", dome: "M-14 -72 C-14 -85 -8 -92 0 -92 C8 -92 14 -85 14 -72 Z", star: "M-14 -72 Q-12 -90 0 -102 Q12 -90 14 -72 Z" };
    const nozX = { one: [0], two: [-7, 7], three: [-10, 0, 10] };
    const nozW = { one: 9, two: 5, three: 3.6 };
    const noz = (b, x) => { const w = nozW[b]; return `M${x - w} -12 L${x + w} -12 L${x + w + (b === "one" ? 3 : 1.6)} 0 L${x - w - (b === "one" ? 3 : 1.6)} 0 Z`; };
    const flameMarkup = (fillOuter, fillInner) => o.plainFlame
      ? `<path d="${FLAME_D}" fill="${fillOuter}"/><g transform="scale(.55)"><path d="${FLAME_D}" fill="${fillInner}"/></g>`
      : `<use href="#flamePath" fill="${fillOuter}"/><use href="#flamePath" fill="${fillInner}" transform="scale(.55)"/>`;
    let s = "";
    if (o.flame) {
      const b = c.boost || "one", e = ENGINE_COLORS[c.engine] || ENGINE_COLORS.gold, w = b === "one" ? .55 : b === "two" ? .36 : .26;
      s += `<g class="rflame">` + nozX[b].map(x => `<g transform="translate(${x},-1) scale(${w},-.6)"><g class="flicker">${flameMarkup(e[1], e[0])}</g></g>`).join("") + `</g>`;
    }
    const fp = finPath[c.fins] || finPath.classic;
    s += part("fins", c.fins, fp.map(d => `<path d="${d}" fill="${trim}" stroke="rgba(0,0,0,.28)" stroke-width="1"/>`).join(""), finPath.classic.map(d => `<path d="${d}" ${G}/>`).join(""));
    const b = c.boost;
    s += part("boost", b, (nozX[b] || []).map(x => `<path d="${noz(b, x)}" fill="#5b6390" stroke="rgba(0,0,0,.3)" stroke-width="1"/><rect x="${x - nozW[b]}" y="-12" width="${nozW[b] * 2}" height="3" fill="${trim}"/>`).join(""), `<path d="${noz("one", 0)}" ${G}/>`);
    s += `<path d="M-14 -72 H14 V-18 Q14 -11 7 -11 H-7 Q-14 -11 -14 -18 Z" fill="${hull}" stroke="rgba(0,0,0,.28)" stroke-width="1.2"/>`;
    s += `<rect x="-14" y="-31" width="28" height="5" fill="${trim}"/>`;
    s += `<path d="M-8 -66 V-37" stroke="#ffffff" stroke-opacity=".35" stroke-width="2.5" stroke-linecap="round"/>`;
    s += `<circle cx="0" cy="-52" r="8.2" fill="${trim}"/><circle cx="0" cy="-52" r="6.2" fill="#151036"/>`;
    if (o.face) s += `<circle cx="-2.4" cy="-52.6" r="1.6" fill="#fbf7f2"/><circle cx="2.4" cy="-52.6" r="1.6" fill="#fbf7f2"/><path d="M-1.8 -49.4 Q0 -48.2 1.8 -49.4" stroke="#9fd2ff" stroke-width="1" fill="none" stroke-linecap="round"/>`;
    s += part("engine", c.engine, `<circle cx="0" cy="-19" r="3.6" fill="${(ENGINE_COLORS[c.engine] || ENGINE_COLORS.gold)[1]}"/>`, `<circle cx="0" cy="-19" r="3.6" ${G}/>`);
    const starTip = o.plainFlame ? `<g transform="translate(0,-106) scale(1.25)"><path d="${SPARK_D}" fill="#ffcb5e"/></g>` : `<g transform="translate(0,-106) scale(1.25)"><use href="#spark4" fill="#ffcb5e"/></g>`;
    s += part("nose", c.nose, `<path d="${noseP[c.nose] || noseP.point}" fill="${trim}" stroke="rgba(0,0,0,.28)" stroke-width="1"/>` + (c.nose === "star" ? starTip : ""), `<path d="${noseP.point}" ${G}/>`);
    return s;
  }
  const box = (inner, cls = "") => `<svg class="${cls}" viewBox="-38 -112 76 144" aria-hidden="true">${inner}</svg>`;

  // Small part silhouettes for the "parts found" slots. Fill and stroke are set by the game.
  const partIcons = {
    nose: `<svg viewBox="-16 -16 32 32"><path d="M-9 12 Q-8 -2 0 -14 Q8 -2 9 12 Z" class="pi"/></svg>`,
    fins: `<svg viewBox="-16 -16 32 32"><path d="M-4 -12 L-14 10 L-4 4 Z M4 -12 L14 10 L4 4 Z" class="pi"/></svg>`,
    boost: `<svg viewBox="-16 -16 32 32"><path d="M-8 -8 L8 -8 L12 10 L-12 10 Z" class="pi"/></svg>`,
    engine: `<svg viewBox="-16 -16 32 32"><circle r="9" class="pi"/><circle r="4" class="pi2"/></svg>`
  };

  art.rocket = { PARTS, PART_ORDER, PAINTS, PAINT_ORDER, ENGINE_COLORS, svg, box, partIcons };
})(window.Kit = window.Kit || {});
