/**
 * @file assets/ship/glitch-ship.js
 * @about A side-view spaceship built from four parts, each with its own style choices: cockpit (bubble, dino head, crystal), wings (fern leaf, bat, lightning), thrusters (one, two, three), and a glitch core in a neon color. Five neon paint jobs. Missing parts can show as dashed outlines. The cockpit is a real little cabin (a seat, a glowing dashboard, see-through glass), and a pilot sits inside it, sized to fit the canopy and never poking out. The ship can wake up with a face on its nose. Drawn in the shared Glitch Nebula style (assets/style/ink.js).
 * @provides Kit.art.ship { PARTS, PART_ORDER, PAINTS, PAINT_ORDER, CORES, CANOPY, svg(config, options), box(inner, cls), url(config, options, size), partIcons }
 * @requires assets/style/ink.js
 *
 * config  = { cockpit, wings, thrusters, core, paint } (any can be missing)
 * options = { ghost: draw missing parts dashed, hl: part key to highlight, flame: engine flames,
 *             pilot: { g, box } (a character's markup and the box around its head, like Kit.art.trexy.pilot(): the ship scales the
 *                    head to fill its canopy, sits it on the seat, and clips it to the glass), or plain markup drawn as is,
 *             pilotScale: the largest the pilot may be drawn (in ship units per pilot unit), so a pilot can match riders drawn beside the ship,
 *             face: awake | blink | happy (eyes and a smile on the nose, for a ship that has come alive) }
 * Drawing space: facing right, centered on 0,0, viewBox -64 -42 128 84. CANOPY gives each cockpit's glass outline and the
 * room inside it ({ d, x0, x1, floor, top }).
 */
(function (Kit) {
  "use strict";
  const art = Kit.art = Kit.art || {};
  const ink = art.ink, LINE = ink.INK;
  const PARTS = {
    cockpit: { name: "Cockpit", options: [["bubble", "Bubble dome"], ["dino", "Dino head"], ["crystal", "Crystal"]] },
    wings: { name: "Wings", options: [["fern", "Fern leaf"], ["bat", "Bat wings"], ["bolt", "Lightning"]] },
    thrusters: { name: "Thrusters", options: [["one", "One big blaster"], ["two", "Twin jets"], ["three", "Triple jets"]] },
    core: { name: "Glitch Core", options: [["pink", "Hot pink"], ["cyan", "Laser cyan"], ["lime", "Glitch lime"], ["gold", "Star gold"]] }
  };
  const PART_ORDER = ["thrusters", "wings", "core", "cockpit"];
  const PAINTS = {
    lime: { label: "Glitch Lime", hull: "#8dff5a", trim: "#2a0f5c", wing: "#ffe94a" },
    magenta: { label: "Hot Magenta", hull: "#ff5ad9", trim: "#fff36b", wing: "#9b6bff" },
    cyan: { label: "Laser Cyan", hull: "#55f2ff", trim: "#ff3ec8", wing: "#ff3ec8" },
    orange: { label: "Lava Orange", hull: "#ff9b45", trim: "#3a1bff", wing: "#ffe94a" },
    purple: { label: "Midnight Purple", hull: "#9468ff", trim: "#5cffb0", wing: "#5cffb0" }
  };
  const PAINT_ORDER = ["lime", "magenta", "cyan", "orange", "purple"];
  const CORES = { pink: ["#ffd1f3", "#ff3ec8"], cyan: ["#d6fcff", "#21d9ff"], lime: ["#efffd0", "#8cf21f"], gold: ["#fff6c2", "#ffc21a"] };
  // Each cockpit's glass, and the room inside it: x0 to x1 across, from the floor (the top of the hull) up to the top.
  const CANOPY = {
    bubble: { d: "M-6 -19.6 C-6 -48 33.5 -48 33.5 -17.5 Z", x0: -3, x1: 31, floor: -19.5, top: -38.6, shine: "M-.6 -27 Q1.4 -37.4 10.6 -39.6", glint: [18.4, -40.2] },
    dino: { d: "M-4 -19.6 C-4 -46.4 29 -46.4 29 -19 Z", x0: -1, x1: 27, floor: -19.5, top: -37.6, shine: "M1.4 -27 Q3.4 -36.2 11.6 -38.4", glint: [17.6, -38.8] },
    crystal: { d: "M-5 -19.6 L5 -41 L24 -41 L33 -19.6 Z", x0: -2, x1: 31, floor: -19.5, top: -39, shine: "M.6 -25 L7 -38.6", glint: [11.6, -38.8] }
  };

  function svg(c, o = {}) {
    const P = PAINTS[c.paint] || { hull: "#cfc8ff", trim: "#5b4bb0", wing: "#a99be0" }, hull = P.hull, trim = P.trim, wf = P.wing;
    const core = CORES[c.core] || CORES.pink;
    const G = `fill="none" stroke="#a99be0" stroke-width="1.6" stroke-dasharray="3 3"`;
    const HL = `fill="rgba(255,233,74,.2)" stroke="#ffe94a" stroke-width="2" stroke-dasharray="3 3"`;
    const S = `stroke="${LINE}" stroke-width="2" stroke-linejoin="round"`;
    const part = (key, has, full, ghost) => has ? full : (o.hl === key ? ghost.replaceAll(G, HL) : (o.ghost ? ghost : ""));
    let s = "";

    // Thrusters and flames (behind the hull)
    const nz = { one: [0], two: [-8, 8], three: [-11, 0, 11] }[c.thrusters] || [];
    const nh = { one: 9, two: 5.5, three: 4.2 }[c.thrusters] || 6;
    if (o.flame && c.thrusters) s += `<g class="sflame">` + nz.map(y => `<path d="M-44 ${y - nh * .8} C-58 ${y - nh * .6} -66 ${y} -74 ${y} C-66 ${y} -58 ${y + nh * .6} -44 ${y + nh * .8} Z" fill="${core[1]}"/><path d="M-44 ${y - nh * .45} C-52 ${y - nh * .3} -57 ${y} -62 ${y} C-57 ${y} -52 ${y + nh * .3} -44 ${y + nh * .45} Z" fill="${core[0]}"/>`).join("") + `</g>`;
    s += part("thrusters", c.thrusters, nz.map(y => `<path d="M-32 ${y - nh} L-45 ${y - nh - 2} L-45 ${y + nh + 2} L-32 ${y + nh} Z" fill="#4a4470" ${S}/><path d="M-33.5 ${y - nh + 1.4} L-43 ${y - nh - .2}" stroke="#8f88c4" stroke-width="1.4" stroke-linecap="round"/><rect x="-47" y="${y - nh - 3}" width="4" height="${nh * 2 + 6}" rx="1.5" fill="${trim}" ${S}/>`).join(""),
      `<path d="M-32 -9 L-45 -11 L-45 11 L-32 9 Z" ${G}/>`);

    // Wings (under and behind the hull), each with its shadow tone along the back edge
    const ws = ink.shadeOf(wf, .2);
    const wing = {
      fern: `<path d="M-2 10 C-6 30 -26 42 -52 40 C-44 28 -30 14 -14 7 Z" fill="${wf}" ${S}/><path d="M-50.6 39.4 C-42 28 -30 15.6 -14.6 9.2 C-24 16 -34 26 -43 38.6 Z" fill="${ws}" opacity=".7"/>
             <path d="M-6 14 L-46 38 M-14 19 L-18 30 M-22 25 L-26 35 M-18 16 L-28 19 M-28 24 L-38 26" stroke="${LINE}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>
             <path d="M-2 -18 C-8 -32 -22 -38 -36 -36 C-28 -28 -20 -22 -12 -17 Z" fill="${wf}" ${S}/>`,
      bat: `<path d="M0 8 L-48 38 Q-40 28 -33 35 Q-28 25 -20 30 Q-17 20 -8 21 Z" fill="${wf}" ${S}/><path d="M-44 36.6 Q-38 29.6 -33 33.6 Q-29 26.4 -21.6 29.4 Q-19 23 -10 22 L-5 13 Z" fill="${ws}" opacity=".6"/><path d="M-2 -19 C-10 -30 -26 -40 -38 -39 Q-31 -33 -32 -27 Q-25 -30 -22 -24 Q-15 -27 -12 -21 Z" fill="${wf}" ${S}/>`,
      bolt: `<path d="M4 9 L-16 17 L-8 19.5 L-40 40 L-2 24.5 L-11 22 L9 14 Z" fill="${wf}" ${S}/><path d="M-1 -19 L-16 -28 L-9 -29.5 L-34 -41 L-3 -31 L-10 -29 L5 -21 Z" fill="${wf}" ${S}/>`
    };
    s += part("wings", c.wings, wing[c.wings] || "", `<path d="M-2 10 C-6 30 -26 42 -52 40 C-44 28 -30 14 -14 7 Z" ${G}/>`);

    // Hull: one shadow tone along the bottom, a trim stripe, and a shine along the top
    s += `<path d="M-34 -10 C-34 -18 -26 -20 -16 -20 L20 -20 C30 -20 37 -11 39 0 C37 11 30 18 20 18 L-16 18 C-26 18 -34 16 -34 8 Z" fill="${hull}" ${S}/>`;
    s += `<path d="M38.4 4 C36 12.4 30 17 20 17 L-16 17 C-25 17 -32.6 15 -33 8 L-33 5 C-31 10.6 -25 12.4 -16 12.4 L20 12.4 C28 12.4 34 10 38.4 4 Z" fill="${ink.shadeOf(hull, .2)}" opacity=".75"/>`;
    s += `<path d="M-30 6 H34" stroke="${trim}" stroke-width="4" stroke-linecap="round"/>${ink.shine("M-24 -14.6 H10", 3, .5)}${ink.glint(14.4, -14.6, 1.5)}`;

    // Glitch core: a glowing porthole
    s += part("core", c.core, `<circle cx="-10" cy="-3" r="8.5" fill="${core[1]}" opacity=".35"/><circle cx="-10" cy="-3" r="6" fill="${core[1]}" ${S}/><circle cx="-10" cy="-3" r="2.6" fill="${core[0]}"/>${ink.glint(-12.2, -5.4, 1.2)}`,
      `<circle cx="-10" cy="-3" r="6" ${G}/>`);

    // Cockpit: a little cabin under the glass, with a seat, a glowing dashboard, and the pilot (if any) clipped inside
    const C = CANOPY[c.cockpit] || CANOPY.bubble;
    const cockpit = id => {
      const K = CANOPY[id], clip = `shipCab-${id}`;
      let pil = "";
      if (o.pilot && typeof o.pilot === "object") {
        const b = o.pilot.box, sink = b.h * .12, k = Math.min((K.x1 - K.x0) / b.w, (K.floor - K.top) / (b.h - sink), o.pilotScale || Infinity);
        const tx = (K.x0 + K.x1) / 2 - .5 - (b.x + b.w / 2) * k, ty = K.floor + sink * k - (b.y + b.h) * k;
        pil = `<g data-part="pilot" transform="translate(${tx.toFixed(2)},${ty.toFixed(2)}) scale(${k.toFixed(4)})">${o.pilot.g}</g>`;
      } else if (o.pilot) pil = o.pilot;
      const midX = (K.x0 + K.x1) / 2;
      return `<defs><clipPath id="${clip}"><path d="${K.d}"/></clipPath></defs>
        <g clip-path="url(#${clip})"><path d="${K.d}" fill="#2a185c"/><rect x="-4" y="${K.floor - 5}" width="40" height="6" fill="#1d1048"/>
          <path d="M${K.x0 - 1} ${K.floor} V${K.top + 6} Q${K.x0 - 1} ${K.top + 2} ${K.x0 + 3} ${K.top + 3} Q${K.x0 + 6.4} ${K.top + 4} ${K.x0 + 6.4} ${K.top + 8} V${K.floor} Z" fill="#3a2478" stroke="${LINE}" stroke-width="1.2"/>
          ${pil}
          <path d="M${midX + 4} ${K.floor + 1} L${midX + 6} ${K.floor - 3.6} Q${midX + 10} ${K.floor - 5.2} ${K.x1 + 1.4} ${K.floor - 3} L${K.x1 + 3} ${K.floor + 1} Z" fill="#3a2478" stroke="${LINE}" stroke-width="1.2"/>
          <circle cx="${midX + 8.4}" cy="${K.floor - 2.2}" r=".9" fill="#3ef2ff"/><circle cx="${midX + 11}" cy="${K.floor - 2.4}" r=".9" fill="#ff3ec8"/><circle cx="${midX + 13.4}" cy="${K.floor - 2.2}" r=".9" fill="#5cffb0"/></g>
        ${ink.glass(K.d, { opacity: .2, w: 2 }).replace("<path", '<path data-part="canopy"')}${id === "crystal" ? `<path d="M5 -41 L10 -19.6 M24 -41 L19 -19.6" stroke="#fff" stroke-width="1.2" opacity=".35"/>` : ""}
        ${ink.shine(K.shine, 2.4, .85)}${ink.glint(K.glint[0], K.glint[1], 1.3)}`;
    };
    const nose = `<path d="M30 -16 C42 -22 56 -18 59 -7 C60 2 54 7 46 7 L38 6 C38 0 36 -10 30 -16 Z" fill="${hull}" ${S}/><path d="M37 -15 Q48 -18 54 -12" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".5"/>
             ${ink.eye({ cx: 46, cy: -11, rx: 3.6, ry: 3.8, px: 47, py: -10.8, pr: 2, lw: 1.6 })}
             <path d="M40 6 l2.6 4.4 l2.6 -4.4 l2.6 4.4 l2.6 -4.4" fill="#fff" stroke="${LINE}" stroke-width="1.4" stroke-linejoin="round"/><circle cx="56" cy="-9" r="1" fill="${LINE}"/>`;
    s += part("cockpit", c.cockpit, cockpit(c.cockpit in CANOPY ? c.cockpit : "bubble") + (c.cockpit === "dino" ? nose : ""), `<path d="${C.d}" ${G}/>`);

    // A face on the nose, for a ship that has come alive
    if (o.face) {
      const eye = (cx, rx) => o.face === "awake"
        ? ink.eye({ cx, cy: -7, rx, ry: rx * 1.2, px: cx + rx * .35, py: -6.4, pr: rx * .6, lw: 1.6 })
        : o.face === "blink" ? `<path d="M${cx - rx} -6 Q${cx} -3.6 ${cx + rx} -6" fill="none" stroke="${LINE}" stroke-width="2" stroke-linecap="round"/>`
        : `<path d="M${cx - rx} -5 Q${cx} -11 ${cx + rx} -5" fill="none" stroke="${LINE}" stroke-width="2.2" stroke-linecap="round"/>`;
      s += eye(21, 4.2) + eye(31, 3.4);
      s += ink.blush({ cx: 17, cy: 1, rx: 3, ry: 1.8, k: .8 });
      s += o.face === "happy" ? `<path d="M21 9 Q28 18 35 8 Z" fill="#7a1f3d" ${S}/>` : `<path d="M21 10 Q28 15 34 9" fill="none" stroke="${LINE}" stroke-width="2" stroke-linecap="round"/>`;
    }
    return s;
  }
  const box = (inner, cls = "") => `<svg class="${cls}" viewBox="-64 -42 128 84" aria-hidden="true">${inner}</svg>`;
  const url = (c, o, size = 160) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size * 84 / 160)}" viewBox="-80 -42 160 84">${svg(c, o)}</svg>`);

  // Small silhouettes for the "parts found" slots. The game sets fill and stroke.
  const partIcons = {
    thrusters: `<svg viewBox="-16 -16 32 32"><path d="M-4 -9 L10 -12 L10 12 L-4 9 Z M-12 -4 L-4 -6 L-4 6 L-12 4 Z" class="pi"/></svg>`,
    wings: `<svg viewBox="-16 -16 32 32"><path d="M8 -4 C2 6 -6 12 -14 13 C-9 6 -2 -2 4 -8 Z" class="pi"/></svg>`,
    core: `<svg viewBox="-16 -16 32 32"><circle r="10" class="pi"/><circle r="4" class="pi2"/></svg>`,
    cockpit: `<svg viewBox="-16 -16 32 32"><path d="M-12 8 C-10 -12 10 -12 12 8 Z" class="pi"/></svg>`
  };

  art.ship = { PARTS, PART_ORDER, PAINTS, PAINT_ORDER, CORES, CANOPY, svg, box, url, partIcons };
})(window.Kit = window.Kit || {});
