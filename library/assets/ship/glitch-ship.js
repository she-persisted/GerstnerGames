/**
 * @file assets/ship/glitch-ship.js
 * @about A side-view spaceship built from four parts, each with its own style choices: cockpit (bubble, dino head, crystal), wings (fern leaf, bat, lightning), thrusters (one, two, three), and a glitch core in a neon color. Five neon paint jobs. Missing parts can show as dashed outlines, and a pilot can peek out of the cockpit.
 * @provides Kit.art.ship { PARTS, PART_ORDER, PAINTS, PAINT_ORDER, CORES, svg(config, options), box(inner, cls), url(config, options, size), partIcons }
 * @requires nothing
 *
 * config  = { cockpit, wings, thrusters, core, paint } (any can be missing)
 * options = { ghost: draw missing parts dashed, hl: part key to highlight, flame: engine flames, pilot: markup for a head in the cockpit }
 * Drawing space: facing right, centered on 0,0, viewBox -64 -42 128 84.
 */
(function (Kit) {
  "use strict";
  const art = Kit.art = Kit.art || {};
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
  const LINE = "#140a2e";

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
    s += part("thrusters", c.thrusters, nz.map(y => `<path d="M-32 ${y - nh} L-45 ${y - nh - 2} L-45 ${y + nh + 2} L-32 ${y + nh} Z" fill="#4a4470" ${S}/><rect x="-47" y="${y - nh - 3}" width="4" height="${nh * 2 + 6}" rx="1.5" fill="${trim}" ${S}/>`).join(""),
      `<path d="M-32 -9 L-45 -11 L-45 11 L-32 9 Z" ${G}/>`);

    // Wings (under and behind the hull)
    const wing = {
      fern: `<path d="M-2 10 C-6 30 -26 42 -52 40 C-44 28 -30 14 -14 7 Z" fill="${wf}" ${S}/><path d="M-6 14 L-46 38 M-14 19 L-18 30 M-22 25 L-26 35 M-18 16 L-28 19 M-28 24 L-38 26" stroke="${LINE}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>
             <path d="M-2 -18 C-8 -32 -22 -38 -36 -36 C-28 -28 -20 -22 -12 -17 Z" fill="${wf}" ${S}/>`,
      bat: `<path d="M0 8 L-48 38 Q-40 28 -33 35 Q-28 25 -20 30 Q-17 20 -8 21 Z" fill="${wf}" ${S}/><path d="M-4 -18 L-36 -38 Q-29 -30 -24 -33 Q-20 -25 -13 -25 Z" fill="${wf}" ${S}/>`,
      bolt: `<path d="M2 8 L-18 19 L-9 21 L-42 40 L-7 24 L-16 21 L6 12 Z" fill="${wf}" ${S}/><path d="M-2 -18 L-18 -27 L-11 -28 L-34 -40 L-6 -29 L-13 -27 L2 -20 Z" fill="${wf}" ${S}/>`
    };
    s += part("wings", c.wings, wing[c.wings] || "", `<path d="M-2 10 C-6 30 -26 42 -52 40 C-44 28 -30 14 -14 7 Z" ${G}/>`);

    // Hull, with a trim stripe
    s += `<path d="M-34 -10 C-34 -18 -26 -20 -16 -20 L20 -20 C30 -20 37 -11 39 0 C37 11 30 18 20 18 L-16 18 C-26 18 -34 16 -34 8 Z" fill="${hull}" ${S}/>`;
    s += `<path d="M-30 6 H34" stroke="${trim}" stroke-width="4" stroke-linecap="round"/><path d="M-24 -14 H12" stroke="#fff" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>`;

    // Glitch core: a glowing porthole
    s += part("core", c.core, `<circle cx="-10" cy="-3" r="8.5" fill="${core[1]}" opacity=".35"/><circle cx="-10" cy="-3" r="6" fill="${core[1]}" ${S}/><circle cx="-10" cy="-3" r="2.6" fill="${core[0]}"/>`,
      `<circle cx="-10" cy="-3" r="6" ${G}/>`);

    // Cockpit, with an optional pilot
    const pilot = o.pilot || "";
    const cockpit = {
      bubble: `${pilot}<path d="M2 -19 C4 -38 28 -38 32 -17 Z" fill="#bff6ff" fill-opacity=".55" ${S}/><path d="M9 -27 Q14 -33 21 -33" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`,
      dino: `${pilot}<path d="M4 -19 C6 -34 24 -34 28 -19 Z" fill="#bff6ff" fill-opacity=".55" ${S}/>
             <path d="M30 -16 C42 -22 56 -18 59 -7 C60 2 54 7 46 7 L38 6 C38 0 36 -10 30 -16 Z" fill="${hull}" ${S}/>
             <circle cx="46" cy="-11" r="3.4" fill="#fff" ${S}/><circle cx="47" cy="-11" r="1.7" fill="${LINE}"/>
             <path d="M40 6 l2.6 4.4 l2.6 -4.4 l2.6 4.4 l2.6 -4.4" fill="#fff" stroke="${LINE}" stroke-width="1.4" stroke-linejoin="round"/><circle cx="56" cy="-9" r="1" fill="${LINE}"/>`,
      crystal: `${pilot}<path d="M3 -19 L11 -36 L25 -36 L33 -19 Z" fill="#e7c9ff" fill-opacity=".6" ${S}/><path d="M11 -36 L15 -19 M25 -36 L21 -19 M7 -27 H29" stroke="#fff" stroke-width="1.4" opacity=".75"/>`
    };
    s += part("cockpit", c.cockpit, cockpit[c.cockpit] || "", `<path d="M2 -19 C4 -38 28 -38 32 -17 Z" ${G}/>`);
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

  art.ship = { PARTS, PART_ORDER, PAINTS, PAINT_ORDER, CORES, svg, box, url, partIcons };
})(window.Kit = window.Kit || {});
