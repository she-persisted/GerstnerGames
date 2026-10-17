/**
 * @file assets/characters/trexy.js
 * @about T-Rexy, a cute cartoony green T-Rex with a big head, a big eye, two tiny teeth, and famously tiny arms. Also draws his family (same shape, different colors and accessories). Poses for standing, running, hopping, and sitting, and faces for happy, worried, surprised, thinking, dizzy, and sleepy.
 * @provides Kit.art.trexy { COLORS, g(options), svg(options, size), url(options, size) }
 * @requires nothing
 *
 * options = { pose: stand | run1 | run2 | hop | sit, face: smile | happy | worried | surprised | think | dizzy | sleepy,
 *             who: trexy | mom | dad | sis (colors), acc: none | flower | glasses | bow | cap, flip: true to face left }
 * Drawing space: facing right, feet at y = 0, about 100 units tall (x from -58 to 54, y from -94 to 2).
 * svg() returns a standalone <svg> (for images and canvas drawing); url() returns it as a data URL.
 */
(function (Kit) {
  "use strict";
  const art = Kit.art = Kit.art || {};
  const COLORS = {
    trexy: { body: "#5ee35b", belly: "#dcfca0", bump: "#3cbf48", line: "#12452c", cheek: "#ff8fb1" },
    mom: { body: "#3fd6b0", belly: "#cffff1", bump: "#26ad8d", line: "#0f4038", cheek: "#ff8fb1" },
    dad: { body: "#46a84c", belly: "#d3eca6", bump: "#2f8237", line: "#123a19", cheek: "#ff9d8f" },
    sis: { body: "#a6ec5a", belly: "#f4ffd2", bump: "#83cc3a", line: "#2c4a12", cheek: "#ff8fb1" }
  };

  function leg(x, angle, c, far) {
    const fill = far ? c.bump : c.body;
    return `<g transform="translate(${x},-15) rotate(${angle})"><path d="M-5 0 h10 v11 q0 2 3 2 h4 q3 0 3 3 v1 h-20 z" fill="${fill}" stroke="${c.line}" stroke-width="2.4" stroke-linejoin="round"/></g>`;
  }

  function face(f, c) {
    const L = c.line;
    const eyeOpen = (rx = 8, ry = 9, px = 22, py = -69, pr = 5) =>
      `<ellipse cx="20" cy="-70" rx="${rx}" ry="${ry}" fill="#fff" stroke="${L}" stroke-width="2.2"/><circle cx="${px}" cy="${py}" r="${pr}" fill="#1b1030"/><circle cx="${px + 2}" cy="${py - 2.5}" r="1.9" fill="#fff"/>`;
    const teeth = `<path d="M33 -53.5 l2.2 3.6 l2.2 -3.9 Z M40 -54.6 l2 3.4 l2 -3.7 Z" fill="#fff" stroke="${L}" stroke-width=".8"/>`;
    const smile = `<path d="M27 -55 Q38 -50 49 -57" fill="none" stroke="${L}" stroke-width="2.4" stroke-linecap="round"/>`;
    switch (f) {
      case "happy": return `<path d="M13 -69 Q20 -78 27 -69" fill="none" stroke="${L}" stroke-width="3" stroke-linecap="round"/>
        <path d="M27 -56 Q38 -45 50 -58 Q38 -51 27 -56 Z" fill="#7a1f3d" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>${teeth}`;
      case "worried": return `${eyeOpen(8, 9, 19, -67, 4.6)}<path d="M11 -82 Q19 -84 27 -79" fill="none" stroke="${L}" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M29 -54 q3.5 -3 7 0 t7 0 t6 -1" fill="none" stroke="${L}" stroke-width="2.2" stroke-linecap="round"/>`;
      case "surprised": return `${eyeOpen(9.5, 10.5, 21, -70, 3.6)}<path d="M12 -84 Q20 -88 28 -84" fill="none" stroke="${L}" stroke-width="2.2" stroke-linecap="round"/>
        <ellipse cx="40" cy="-53" rx="3.6" ry="4.6" fill="#7a1f3d" stroke="${L}" stroke-width="1.8"/>`;
      case "think": return `${eyeOpen(8, 9, 24, -74, 4.4)}<path d="M33 -55.5 L45 -56.5" stroke="${L}" stroke-width="2.4" stroke-linecap="round"/>`;
      case "dizzy": return `<path d="M20 -70 m-6 0 a6 6 0 1 1 6 6 a4 4 0 1 1 -4 -4 a2 2 0 1 1 2 2" fill="none" stroke="${L}" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M28 -54 q3 -3 6 0 t6 0 t6 0" fill="none" stroke="${L}" stroke-width="2.2" stroke-linecap="round"/>`;
      case "sleepy": return `<path d="M13 -68 Q20 -64 27 -68" fill="none" stroke="${L}" stroke-width="3" stroke-linecap="round"/>${smile}`;
      default: return `${eyeOpen()}${smile}${teeth}`;
    }
  }

  function acc(a) {
    switch (a) {
      case "flower": return `<g transform="translate(6,-88)">${[0, 72, 144, 216, 288].map(r => `<ellipse cx="0" cy="-5" rx="3.6" ry="5.4" fill="#ff7ac8" transform="rotate(${r})" stroke="#7a1f5a" stroke-width="1"/>`).join("")}<circle r="3" fill="#ffe94a" stroke="#7a5a00" stroke-width="1"/></g>`;
      case "glasses": return `<g fill="none" stroke="#1b1030" stroke-width="2.4"><circle cx="20" cy="-70" r="11"/><path d="M31 -71 Q36 -74 41 -71"/><path d="M9 -71 L0 -74"/></g>`;
      case "bow": return `<g transform="translate(4,-86) rotate(-12)"><path d="M0 0 L-10 -6 L-10 6 Z M0 0 L10 -6 L10 6 Z" fill="#ff5fa2" stroke="#7a1f3d" stroke-width="1.4" stroke-linejoin="round"/><circle r="2.6" fill="#ffd1e6" stroke="#7a1f3d" stroke-width="1.2"/></g>`;
      case "cap": return `<g><path d="M-6 -80 Q6 -98 30 -86 Q14 -84 -2 -74 Z" fill="#4f6bff" stroke="#1b1030" stroke-width="2" stroke-linejoin="round"/><path d="M-6 -80 Q-14 -76 -16 -68" fill="none" stroke="#4f6bff" stroke-width="4" stroke-linecap="round"/><circle cx="-16" cy="-66" r="4" fill="#fff" stroke="#1b1030" stroke-width="1.6"/></g>`;
      default: return "";
    }
  }

  // The whole dinosaur, as SVG markup with no <svg> wrapper.
  function g(o = {}) {
    const c = COLORS[o.who] || COLORS.trexy, L = c.line, pose = o.pose || "stand";
    const legs = {
      stand: [leg(-7, 0, c, true), leg(6, 0, c)],
      run1: [leg(-6, 24, c, true), leg(5, -26, c)],
      run2: [leg(-6, -22, c, true), leg(5, 20, c)],
      hop: [leg(-6, -38, c, true), leg(5, -48, c)],
      sit: [`<ellipse cx="-2" cy="-6" rx="16" ry="7" fill="${c.bump}" stroke="${L}" stroke-width="2.4"/>`, `<ellipse cx="14" cy="-4" rx="9" ry="4.5" fill="${c.body}" stroke="${L}" stroke-width="2.4"/>`]
    }[pose] || [];
    const lift = pose === "sit" ? 8 : pose === "hop" ? -3 : 0;
    const tail = pose === "hop" ? "M-12 -36 C-30 -42 -46 -44 -58 -38 C-48 -32 -34 -26 -12 -22 Z" : "M-12 -36 C-30 -36 -46 -30 -58 -16 C-50 -14 -34 -18 -12 -21 Z";
    const arm = pose === "hop"
      ? `<path d="M14 -40 q6 -6 11 -9" fill="none" stroke="${L}" stroke-width="6.4" stroke-linecap="round"/><path d="M14 -40 q6 -6 11 -9" fill="none" stroke="${c.body}" stroke-width="3.6" stroke-linecap="round"/>`
      : `<path d="M15 -37 q7 0 9 5" fill="none" stroke="${L}" stroke-width="6.4" stroke-linecap="round"/><path d="M15 -37 q7 0 9 5" fill="none" stroke="${c.body}" stroke-width="3.6" stroke-linecap="round"/>
         <path d="M24 -32 l1.6 2.6 M22.4 -31 l.4 3" stroke="${L}" stroke-width="1.4" stroke-linecap="round"/>`;
    const body = `<g transform="translate(0,${lift})">
      ${legs[0]}
      <path d="${tail}" fill="${c.body}" stroke="${L}" stroke-width="2.4" stroke-linejoin="round"/>
      <ellipse cx="0" cy="-31" rx="21" ry="22" fill="${c.body}" stroke="${L}" stroke-width="2.4"/>
      <ellipse cx="7" cy="-28" rx="12" ry="15" fill="${c.belly}"/>
      <path d="M2 -36 q5 2 10 0 M1 -29 q6 2 12 0 M2 -22 q5 2 10 0" fill="none" stroke="${c.bump}" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>
      ${legs[1]}
      <circle cx="-8" cy="-60" r="3.6" fill="${c.bump}" stroke="${L}" stroke-width="1.8"/>
      <circle cx="-12" cy="-51" r="3.4" fill="${c.bump}" stroke="${L}" stroke-width="1.8"/>
      <circle cx="-15" cy="-42" r="3.2" fill="${c.bump}" stroke="${L}" stroke-width="1.8"/>
      <path d="M-6 -58 C-8 -80 12 -91 30 -85 C46 -80 53 -71 51 -60 C50 -50 41 -46 25 -46 C9 -46 -4 -46 -6 -58 Z" fill="${c.body}" stroke="${L}" stroke-width="2.4" stroke-linejoin="round"/>
      <ellipse cx="44" cy="-71" rx="1.8" ry="1.3" fill="${L}"/>
      <ellipse cx="33" cy="-61" rx="4.6" ry="3" fill="${c.cheek}" opacity=".75"/>
      ${face(o.face, c)}
      ${acc(o.acc)}
      ${arm}
    </g>`;
    return o.flip ? `<g transform="scale(-1,1)">${body}</g>` : body;
  }

  const svg = (o = {}, size = 120) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size * 100 / 116)}" viewBox="${o.flip ? "-58" : "-62"} -96 116 100">${g(o)}</svg>`;
  const url = (o, size) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg(o, size));

  art.trexy = { COLORS, g, svg, url };
})(window.Kit = window.Kit || {});
