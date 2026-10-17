/**
 * @file assets/memories/memories.js
 * @about Four detailed memory pictures for jigsaw puzzles, drawn in SVG: home in Fern Valley at night, the family dinner, the bedroom at 11:11, and the swirly galaxy swoop. Each one hides a clue for the mystery if you look closely. Also draws the spiral galaxies used everywhere in the game.
 * @provides Kit.art.memories { home, dinner, window, swoop } (each a function returning a standalone 400 x 300 <svg>), galaxy(cx, cy, r, turn, colors, arms), note(x, y, scale, color)
 * @requires assets/characters/trexy.js, assets/characters/nova.js
 *
 * Clues hidden in the pictures: a tiny glowing music box on the hill (home), salad AND meat on the table plus a little teal tail sneaking
 * out the door past the basket of fish (dinner), tiny three-toed footprints on the windowsill and a huge moth-shaped shadow made by a teeny
 * moth near the lamp (window), and someone small on a floating rock holding a star lantern (swoop).
 * Lots of little extras to spot, too: a rocket weathervane, a T-REXY mailbox, a volcano, The Big Book of Volcanoes, a BLAST OFF poster,
 * fireflies, and T-Rexy's cap flying off in the swoop.
 */
(function (Kit) {
  "use strict";
  const art = Kit.art = Kit.art || {};
  const T = () => art.trexy, N = () => art.nova;
  const wrap = inner => `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">${inner}</svg>`;
  const rnd = seed => () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const stars = (n, seed, h = 300, col = "#fff") => { const r = rnd(seed); let s = ""; for (let i = 0; i < n; i++) s += `<circle cx="${(r() * 400).toFixed(1)}" cy="${(r() * h).toFixed(1)}" r="${(.6 + r() * 1.4).toFixed(1)}" fill="${col}" opacity="${(.45 + r() * .55).toFixed(2)}"/>`; return s; };

  // A spiral galaxy: a soft halo, a glowing core, and tapered, glowing arms dotted with stars and pink star-forming knots.
  // colors = [inner arm color, outer arm color, outer glow color]. arms = how many spiral arms (default 2).
  const f1 = n => n.toFixed(1);
  function galaxy(cx, cy, r, turn = 0, colors = ["#ff6be0", "#9b6bff", "#5ff2ff"], arms = 2) {
    const id = `gx${Math.round(cx)}_${Math.round(cy)}_${Math.round(r)}_${Math.round(turn)}_${colors.join("").replace(/[^0-9a-f]/gi, "").slice(0, 12)}`;
    const R = rnd(Math.round(cx * 7 + cy * 13 + r * 3 + turn) + 11), twist = 4.6;
    const at = (a0, t, off = 0) => { const th = a0 + t * twist, rr = r * (.05 + .95 * t); return [Math.cos(th) * rr - Math.sin(th) * off, Math.sin(th) * rr + Math.cos(th) * off]; };
    const width = t => r * (.025 + .22 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.08)), .8) * (1 - .45 * t));
    const band = (a0, k, t0 = 0, t1 = 1, shift = 0) => {
      const L = [], Rt = [];
      for (let i = 0; i <= 48; i++) { const t = t0 + (t1 - t0) * i / 48, w = width(t) * k; L.push(at(a0, t, shift * width(t) + w)); Rt.push(at(a0, t, shift * width(t) - w)); }
      return "M" + [...L, ...Rt.reverse()].map(([x, y]) => `${f1(x)} ${f1(y)}`).join(" L") + " Z";
    };
    let s = `<defs>
      <radialGradient id="${id}h"><stop offset="0" stop-color="${colors[1]}" stop-opacity=".4"/><stop offset=".6" stop-color="${colors[2]}" stop-opacity=".12"/><stop offset="1" stop-color="${colors[2]}" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}a" cx="0" cy="0" r="${r}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fffbe8"/><stop offset=".25" stop-color="${colors[0]}"/><stop offset=".7" stop-color="${colors[1]}" stop-opacity=".85"/><stop offset="1" stop-color="${colors[2]}" stop-opacity=".1"/></radialGradient>
      <radialGradient id="${id}c"><stop offset="0" stop-color="#ffffff"/><stop offset=".3" stop-color="#fff3c4" stop-opacity=".95"/><stop offset=".65" stop-color="${colors[0]}" stop-opacity=".45"/><stop offset="1" stop-color="${colors[0]}" stop-opacity="0"/></radialGradient>
    </defs><g transform="translate(${cx},${cy}) rotate(${turn}) scale(1,.72)">
      <circle r="${f1(r * 1.15)}" fill="url(#${id}h)"/>`;
    for (let a = 0; a < arms; a++) {
      const a0 = a * Math.PI * 2 / arms;
      s += `<path d="${band(a0, 2.5)}" fill="url(#${id}a)" opacity=".12"/>`;         // soft glow around the arm
      s += `<path d="${band(a0, 1.6)}" fill="url(#${id}a)" opacity=".22"/>`;
      s += `<path d="${band(a0, 1)}" fill="url(#${id}a)" opacity=".75"/>`;             // the arm
      s += `<path d="${band(a0, .28, .04, .9, -.25)}" fill="#ffffff" opacity=".25"/>`; // bright ridge
      s += `<path d="${band(a0, .16, .12, .85, .55)}" fill="#1a0630" opacity=".28"/>`; // dark dust lane
      for (let i = 0; i < 28; i++) {                                                      // stars along the arm
        const t = .08 + R() * .9, [x, y] = at(a0, t, (R() * 2 - 1) * width(t) * 1.3), big = R() < .12;
        s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * (big ? .028 : .008 + R() * .012))}" fill="${big ? "#ffffff" : R() < .3 ? colors[2] : "#fff6e0"}" opacity="${(.55 + R() * .45).toFixed(2)}"/>`;
      }
      for (let i = 0; i < 3; i++) {                                                       // pink star-forming knots
        const t = .3 + R() * .55, [x, y] = at(a0, t, (R() - .5) * width(t));
        s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * .05)}" fill="#ff8fd8" opacity=".25"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * .018)}" fill="#ffd1f0" opacity=".9"/>`;
      }
    }
    for (let i = 0; i < 26; i++) { const a = R() * Math.PI * 2, d = r * (.15 + R() * .95); s += `<circle cx="${f1(Math.cos(a) * d)}" cy="${f1(Math.sin(a) * d)}" r="${f1(r * (.005 + R() * .008))}" fill="#ffffff" opacity="${(.3 + R() * .5).toFixed(2)}"/>`; }
    s += `<ellipse rx="${f1(r * .4)}" ry="${f1(r * .34)}" fill="url(#${id}c)"/><circle r="${f1(r * .07)}" fill="#ffffff"/>`;
    return s + "</g>";
  }
  const note = (x, y, k = 1, c = "#5ff2ff") => `<g transform="translate(${x},${y}) scale(${k})"><ellipse cx="0" cy="0" rx="5" ry="3.6" transform="rotate(-20)" fill="${c}"/><path d="M4 -1 V-18 Q10 -16 12 -10" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/></g>`;
  const fern = (x, y, k = 1, flip = false, c = "#3cbf48") => {
    let s = `<g transform="translate(${x},${y}) scale(${flip ? -k : k},${k})"><path d="M0 0 Q4 -40 26 -70" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
    for (let i = 1; i < 9; i++) { const t = i / 9, px = 26 * t * t, py = -70 * t, l = 18 * (1 - t * .7); s += `<path d="M${px} ${py} q${-l * .6} ${-l * .2} ${-l} ${l * .5} M${px} ${py} q${l * .6} ${-l * .5} ${l} ${-l * .1}" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>`; }
    return s + "</g>";
  };
  const dino = (x, y, k, o) => `<g transform="translate(${x},${y}) scale(${k})">${T().g(o)}</g>`;

  // Little helpers for the pictures.
  const twinkle = (x, y, k = 1, c = "#ffffff") => `<path d="M${x} ${y - 6 * k} Q${x + .8 * k} ${y - .8 * k} ${x + 6 * k} ${y} Q${x + .8 * k} ${y + .8 * k} ${x} ${y + 6 * k} Q${x - .8 * k} ${y + .8 * k} ${x - 6 * k} ${y} Q${x - .8 * k} ${y - .8 * k} ${x} ${y - 6 * k} Z" fill="${c}" opacity=".9"/>`;
  const flower = (x, y, c = "#ff8fd8", k = 1) => `<g transform="translate(${x},${y}) scale(${k})">${[0, 72, 144, 216, 288].map(a => `<circle cx="${(Math.cos(a * Math.PI / 180) * 2.6).toFixed(1)}" cy="${(Math.sin(a * Math.PI / 180) * 2.6).toFixed(1)}" r="2" fill="${c}"/>`).join("")}<circle r="1.5" fill="#ffe94a"/></g>`;
  const firefly = (x, y) => `<circle cx="${x}" cy="${y}" r="5" fill="#ffe94a" opacity=".22"/><circle cx="${x}" cy="${y}" r="1.4" fill="#fff6c2"/>`;
  const mushroom = (x, y, k = 1, c = "#5ff2ff") => `<g transform="translate(${x},${y}) scale(${k})"><circle cy="-7" r="9" fill="${c}" opacity=".18"/><rect x="-1.6" y="-6" width="3.2" height="6" rx="1.2" fill="#e8f6ff"/><path d="M-6 -6 Q0 -14 6 -6 Z" fill="${c}"/><circle cx="-2" cy="-8.4" r=".9" fill="#ffffff"/><circle cx="2.2" cy="-7.4" r=".7" fill="#ffffff"/></g>`;
  const rocket = (x, y, k = 1, rot = 0, flame = true) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${k})">
      ${flame ? `<path d="M-3 9 Q0 19 3 9 Z" fill="#ffb347"/><path d="M-1.6 9 Q0 15 1.6 9 Z" fill="#fff6c2"/>` : ""}
      <path d="M-5 6 L-9 11 L-4 9 Z M5 6 L9 11 L4 9 Z" fill="#ff5a7a"/>
      <path d="M0 -12 Q6 -5 5 9 L-5 9 Q-6 -5 0 -12 Z" fill="#f2f2ff" stroke="#3a3a6a" stroke-width="1.2"/>
      <circle cy="-2" r="2.4" fill="#5ff2ff" stroke="#3a3a6a" stroke-width="1"/><path d="M-4.4 -7.6 Q0 -11 4.4 -7.6 Z" fill="#ff5a7a"/></g>`;
  const cap = (x, y, k = 1, rot = 0) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${k})"><path d="M-12 4 Q0 -14 24 -2 Q8 0 -8 10 Z" fill="#4f6bff" stroke="#1b1030" stroke-width="2" stroke-linejoin="round"/><path d="M-12 4 Q-20 8 -22 16" fill="none" stroke="#4f6bff" stroke-width="4" stroke-linecap="round"/><circle cx="-22" cy="18" r="4" fill="#fff" stroke="#1b1030" stroke-width="1.6"/></g>`;
  const steps3 = (x, y, k = 1, c = "#1f8a96") => `<g transform="translate(${x},${y}) scale(${k})" fill="${c}"><ellipse cx="0" cy="0" rx="2.6" ry="1.8"/><circle cx="-3" cy="-3" r="1.2"/><circle cx="0" cy="-4" r="1.2"/><circle cx="3" cy="-3" r="1.2"/></g>`;

  // Home in Fern Valley at night. Clue: a tiny glowing music box on the hill, with notes floating toward the house.
  const home = () => wrap(`
    <defs><linearGradient id="mh-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d0636"/><stop offset=".7" stop-color="#3b1d86"/><stop offset="1" stop-color="#6a3aa8"/></linearGradient>
      <radialGradient id="mh-win"><stop offset="0" stop-color="#fff6c2"/><stop offset="1" stop-color="#ffc94a"/></radialGradient>
      <radialGradient id="mh-box"><stop offset="0" stop-color="#5ff2ff" stop-opacity=".95"/><stop offset="1" stop-color="#5ff2ff" stop-opacity="0"/></radialGradient>
      <radialGradient id="mh-moon"><stop offset="0" stop-color="#fff3b0" stop-opacity=".5"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></radialGradient>
      <linearGradient id="mh-house" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a596d6"/><stop offset="1" stop-color="#6e5f9e"/></linearGradient>
      <linearGradient id="mh-shoot" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient></defs>
    <rect width="400" height="300" fill="url(#mh-sky)"/>${stars(90, 3, 200)}
    ${twinkle(40, 30)}${twinkle(152, 22, .7)}${twinkle(372, 118, .8, "#ffd1f3")}${twinkle(250, 130, .6, "#9bf6ff")}
    ${galaxy(305, 70, 58, -15)}
    <circle cx="66" cy="58" r="46" fill="url(#mh-moon)"/>
    <path d="M58 40 a24 24 0 1 0 22 34 a19 19 0 1 1 -22 -34 Z" fill="#fff3b0"/><circle cx="52" cy="62" r="3" fill="#ead98c"/><circle cx="60" cy="74" r="2" fill="#ead98c"/><circle cx="48" cy="50" r="1.6" fill="#ead98c"/>
    <path d="M168 46 L226 22" stroke="url(#mh-shoot)" stroke-width="2.4" stroke-linecap="round"/><circle cx="226" cy="22" r="2.4" fill="#fff"/>
    <path d="M120 186 L162 128 Q170 120 178 128 L224 186 Z" fill="#2a1660"/><path d="M162 128 Q170 122 178 128 L172 136 L168 131 L164 137 Z" fill="#ff7a45"/>
    <ellipse cx="170" cy="122" rx="9" ry="4" fill="#ff9b45" opacity=".55"/>${[[168, 110, 6], [176, 98, 8], [168, 84, 10]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#5a3a9a" opacity=".45"/>`).join("")}
    <path d="M0 196 Q60 166 120 182 T240 176 T400 170 V240 H0 Z" fill="#1d4f46"/>
    ${[[96, 180], [352, 172]].map(([x, y]) => `<path d="M${x - 8} ${y} Q${x} ${y - 12} ${x + 8} ${y} Z" fill="#5a4a8a"/><circle cx="${x}" cy="${y - 3}" r="1.6" fill="#ffd166"/>`).join("")}
    <path d="M0 210 Q70 150 140 190 T300 170 T400 180 V300 H0 Z" fill="#1f6b4a"/>
    <circle cx="56" cy="174" r="24" fill="url(#mh-box)"/>
    <rect x="49" y="170" width="14" height="9" rx="2" fill="#9be8ff" stroke="#0e3b52" stroke-width="1.4"/><path d="M49 170 L52 162 L66 165 L63 170 Z" fill="#c8f6ff" stroke="#0e3b52" stroke-width="1.2"/>
    <circle cx="56" cy="174.5" r="1.6" fill="#ff6be0"/><path d="M63 174 h4 v-3" fill="none" stroke="#0e3b52" stroke-width="1.2"/>
    ${note(80, 160, .9)}${note(112, 140, 1)}${note(150, 132, 1.1, "#ff9ef0")}${note(186, 142, 1)}${note(214, 158, .8, "#ff9ef0")}
    <path d="M0 250 Q100 205 200 232 T400 225 V300 H0 Z" fill="#2e8f4e"/>
    ${[[20, 246, "#ff8fd8"], [44, 240, "#ffe94a"], [70, 236, "#ffffff"], [112, 232, "#ff8fd8"], [292, 240, "#ffe94a"], [318, 236, "#ff8fd8"], [384, 232, "#ffffff"]].map(([x, y, c]) => flower(x, y, c, .9)).join("")}
    ${mushroom(30, 258, 1.1)}${mushroom(42, 262, .8, "#ff6be0")}${mushroom(372, 252, 1, "#ff6be0")}
    ${[[200, 264], [190, 276], [176, 288], [160, 298]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="${10 - i}" ry="3.6" fill="#9a8ab8" stroke="#5a4a7a" stroke-width="1"/>`).join("")}
    <rect x="262" y="160" width="12" height="30" fill="#7a6aa8" stroke="#2a1b52" stroke-width="2.4"/><path d="M268 156 q-6 -8 0 -14 q6 -6 0 -14" fill="none" stroke="#c8b8ff" stroke-width="3" stroke-linecap="round" opacity=".55"/>
    <path d="M140 262 Q140 168 220 168 Q300 168 300 262 Z" fill="url(#mh-house)" stroke="#2a1b52" stroke-width="3"/>
    ${[[162, 236, 9], [176, 210, 8], [200, 190, 9], [236, 186, 8], [262, 204, 9], [282, 236, 8], [160, 254, 6], [272, 252, 7], [226, 214, 6]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .62}" fill="none" stroke="#7d6db0" stroke-width="1.6"/>`).join("")}
    <path d="M220 168 V152" stroke="#2a1b52" stroke-width="2"/>${rocket(220, 142, .8, 0, false)}
    <circle cx="248" cy="212" r="20" fill="url(#mh-win)" stroke="#2a1b52" stroke-width="3"/>
    <path d="M230 204 Q238 212 232 222 M266 204 Q258 212 264 222" fill="none" stroke="#ff8fb1" stroke-width="4" stroke-linecap="round" opacity=".85"/>
    <path d="M248 192 V232 M228 212 H268" stroke="#2a1b52" stroke-width="2.4"/><rect x="238" y="230" width="20" height="5" rx="2" fill="#3cbf48"/><circle cx="243" cy="228" r="3" fill="#ff6be0"/><circle cx="252" cy="228" r="3" fill="#ffe94a"/>
    <path d="M185 262 V230 Q185 214 200 214 Q215 214 215 230 V262 Z" fill="#4a2a70" stroke="#2a1b52" stroke-width="3"/><circle cx="210" cy="242" r="2" fill="#ffd166"/>
    <rect x="180" y="260" width="40" height="5" rx="2" fill="#8a7ab8"/><circle cx="176" cy="226" r="6" fill="#ffd166" opacity=".35"/><rect x="173" y="222" width="6" height="8" rx="1.5" fill="#ffd166" stroke="#5a3a0a" stroke-width="1"/>
    <rect x="127" y="234" width="4" height="28" fill="#5a3a20"/><rect x="117" y="222" width="24" height="13" rx="6" fill="#ff5a7a" stroke="#6a1a2a" stroke-width="1.6"/><rect x="139" y="216" width="2" height="9" fill="#ffe94a"/><rect x="139" y="216" width="6" height="4" fill="#ffe94a"/>
    <text x="129" y="230.5" font-family="Arial, sans-serif" font-size="5.4" font-weight="700" fill="#fff" text-anchor="middle">T-REXY</text>
    ${[312, 330, 348, 366, 384].map(x => `<rect x="${x}" y="240" width="4" height="22" rx="1.5" fill="#c98a4a" stroke="#4a2a12" stroke-width="1"/>`).join("")}<path d="M312 246 H392 M312 255 H392" stroke="#c98a4a" stroke-width="3"/>
    <rect x="330" y="214" width="6" height="40" fill="#7a4a2a"/><rect x="304" y="204" width="60" height="22" rx="4" fill="#c98a4a" stroke="#4a2a12" stroke-width="2"/>
    <text x="334" y="216" font-family="Arial, sans-serif" font-size="8" font-weight="700" fill="#3a1f0a" text-anchor="middle" dominant-baseline="middle">FERN VALLEY</text>
    ${[[96, 214], [130, 196], [168, 202], [292, 196], [318, 222], [360, 206], [24, 222], [70, 204]].map(([x, y]) => firefly(x, y)).join("")}
    ${fern(30, 300, 1.2)}${fern(78, 300, .9, true, "#58d15a")}${fern(396, 300, 1.05, true)}${fern(120, 300, .7, false, "#2fa840")}${fern(352, 300, .7, false, "#2fa840")}
    <rect y="288" width="400" height="12" fill="#1d5a36"/>`);

  // The family dinner. Clues: they eat salad AND meat (omnivores), and a little teal tail is sneaking out the door past the basket of fish.
  const dinner = () => wrap(`
    <defs><radialGradient id="md-lamp" cx=".5" cy=".2"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".85"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient>
      <linearGradient id="md-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d0636"/><stop offset="1" stop-color="#3b1d86"/></linearGradient>
      <pattern id="md-check" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#fff6f0"/><rect width="6" height="6" fill="#ff8fa8"/><rect x="6" y="6" width="6" height="6" fill="#ff8fa8"/></pattern></defs>
    <rect width="400" height="300" fill="#6a2f78"/>
    ${Array.from({ length: 36 }, (x, i) => { const cx = (i % 9) * 44 + 22 + (Math.floor(i / 9) % 2) * 22, cy = Math.floor(i / 9) * 44 + 24; return `<path d="M${cx} ${cy + 8} Q${cx} ${cy} ${cx + 5} ${cy - 7} M${cx + 1} ${cy + 2} l-4 -2 M${cx + 2} ${cy - 2} l4 -2 M${cx + 3} ${cy - 5} l-3 -2" fill="none" stroke="#7d3b8c" stroke-width="1.6" stroke-linecap="round"/>`; }).join("")}
    <rect y="186" width="400" height="6" fill="#8a4a90"/><rect y="192" width="400" height="88" fill="#4e2058"/>${Array.from({ length: 20 }, (x, i) => `<path d="M${i * 20 + 10} 192 V280" stroke="#3e1848" stroke-width="2"/>`).join("")}
    <rect x="18" y="26" width="80" height="64" rx="6" fill="#1b1050" stroke="#3a1f12" stroke-width="5"/>${stars(14, 5, 60).replace(/cx="(\d+(?:\.\d+)?)"/g, (m, x) => `cx="${(20 + Number(x) * .19).toFixed(1)}"`).replace(/cy="(\d+(?:\.\d+)?)"/g, (m, y) => `cy="${(28 + Number(y)).toFixed(1)}"`)}${galaxy(70, 52, 20, 10)}<path d="M58 26 V90 M18 58 H98" stroke="#3a1f12" stroke-width="3"/>
    <path d="M10 20 Q22 56 16 96 L6 96 Z M106 20 Q94 56 100 96 L110 96 Z" fill="#ff8fb1" stroke="#a03a6a" stroke-width="1.6"/><rect x="12" y="90" width="92" height="6" rx="2" fill="#a8743a"/>
    <rect x="44" y="80" width="12" height="10" rx="2" fill="#c98a4a"/><path d="M50 80 Q46 70 40 68 M50 80 Q52 70 58 66 M50 80 Q50 72 50 64" fill="none" stroke="#3cbf48" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="128" y="32" width="48" height="38" rx="3" fill="#ffd166" stroke="#7a4a1a" stroke-width="3"/><rect x="132" y="36" width="40" height="30" fill="#2a1660"/>
    <path d="M136 66 L150 44 Q152 41 154 44 L168 66 Z" fill="#5a3a9a"/><path d="M150 44 Q152 41 154 44 L152 50 Z" fill="#ff7a45"/><circle cx="160" cy="42" r="3" fill="#fff3b0"/>
    <rect x="232" y="38" width="44" height="34" rx="3" fill="#ffd166" stroke="#7a4a1a" stroke-width="3"/><rect x="236" y="42" width="36" height="26" fill="#ffe9f2"/>
    ${[[243, 58, "#46a84c"], [252, 56, "#3fd6b0"], [260, 60, "#a6ec5a"], [267, 59, "#5ee35b"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${c}" stroke="#12452c" stroke-width="1"/><circle cx="${x + 1.5}" cy="${y - 1}" r="1" fill="#1b1030"/>`).join("")}
    <circle cx="318" cy="54" r="15" fill="#fff6f0" stroke="#7a4a1a" stroke-width="3"/><path d="M318 54 V43 M318 54 V63" stroke="#2a1b2e" stroke-width="2" stroke-linecap="round"/><circle cx="318" cy="54" r="1.6" fill="#2a1b2e"/>
    <path d="M200 0 V40" stroke="#2a1b2e" stroke-width="2"/><ellipse cx="200" cy="150" rx="190" ry="140" fill="url(#md-lamp)"/>
    <path d="M176 60 Q200 34 224 60 Z" fill="#ffd166" stroke="#5a3a0a" stroke-width="2"/><circle cx="200" cy="62" r="5" fill="#fff6c2"/>
    <rect x="336" y="112" width="60" height="170" fill="url(#md-night)" stroke="#3a1f12" stroke-width="5"/>${stars(12, 8, 120).replace(/cx="(\d+(?:\.\d+)?)"/g, (m, x) => `cx="${(340 + Number(x) * .13).toFixed(1)}"`).replace(/cy="(\d+(?:\.\d+)?)"/g, (m, y) => `cy="${(116 + Number(y)).toFixed(1)}"`)}
    <path d="M336 112 L312 124 L312 280 L336 282 Z" fill="#a0612f" stroke="#4a2a12" stroke-width="2"/><circle cx="318" cy="200" r="2.4" fill="#ffd166"/>
    <path d="M396 270 C384 270 374 262 366 252 C378 256 388 260 396 258 Z" fill="#36c9d8" stroke="#0e3b52" stroke-width="2"/><path d="M380 258 l3 -6 l3 6 Z" fill="#ff8a5c" stroke="#0e3b52" stroke-width="1"/>
    <rect y="280" width="400" height="20" fill="#4a2350"/><ellipse cx="170" cy="292" rx="150" ry="9" fill="#8a3a5a"/><ellipse cx="170" cy="292" rx="120" ry="6" fill="none" stroke="#ffd166" stroke-width="2" opacity=".6"/>
    ${dino(44, 268, 1.18, { who: "dad", acc: "glasses", face: "happy" })}
    ${dino(116, 266, 1.14, { who: "mom", acc: "flower", face: "smile" })}
    ${dino(208, 262, .9, { who: "sis", acc: "bow", face: "happy", flip: true })}
    ${dino(280, 268, 1.1, { face: "surprised", flip: true })}
    <rect x="22" y="236" width="282" height="16" rx="4" fill="url(#md-check)" stroke="#a03a6a" stroke-width="2"/>
    <path d="${Array.from({ length: 28 }, (x, i) => `M${26 + i * 10} 252 l5 6 l5 -6`).join(" ")}" fill="#ff8fa8"/>
    <rect x="44" y="256" width="12" height="32" fill="#7a4520"/><rect x="272" y="256" width="12" height="32" fill="#7a4520"/>
    <path d="M150 238 Q150 220 176 218 Q202 220 202 238 Z" fill="#f2f2ff" stroke="#3a3a6a" stroke-width="2"/>
    ${[[156, 220], [166, 212], [176, 209], [186, 212], [196, 220], [170, 217], [182, 217]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="6" fill="${["#4fd16b", "#2fa840", "#8be36b", "#4fd16b"][i % 4]}" transform="rotate(${i * 25 - 60} ${x} ${y})"/>`).join("")}
    <circle cx="170" cy="213" r="3.6" fill="#ff5a5a"/><circle cx="184" cy="210" r="3.2" fill="#ff5a5a"/>
    <ellipse cx="236" cy="236" rx="24" ry="5" fill="#fff" stroke="#3a3a6a" stroke-width="2"/>
    <path d="M218 230 Q232 218 248 228 L256 222 L256 238 L248 232 Q232 242 218 230 Z" fill="#ff9b45" stroke="#7a3a0a" stroke-width="2"/><circle cx="225" cy="228" r="1.8" fill="#2a1b2e"/>
    <ellipse cx="96" cy="236" rx="22" ry="5" fill="#fff" stroke="#3a3a6a" stroke-width="2"/>
    <path d="M82 230 Q84 218 96 220 Q106 222 104 230 Z" fill="#c8662a" stroke="#6a2a0a" stroke-width="1.6"/><path d="M104 228 l8 -2 a2.4 2.4 0 1 1 2 3 Z" fill="#fff6f0" stroke="#6a2a0a" stroke-width="1.2"/>
    <ellipse cx="128" cy="236" rx="14" ry="4" fill="#fff" stroke="#3a3a6a" stroke-width="1.6"/>${[0, 1, 2, 3, 4].map(i => `<circle cx="${121 + (i % 3) * 7}" cy="${231 - Math.floor(i / 3) * 5}" r="4" fill="#8f5bff" stroke="#3a1f6a" stroke-width="1"/>`).join("")}
    ${[[62, 226], [140, 228], [266, 226]].map(([x, y]) => `<rect x="${x}" y="${y}" width="8" height="10" rx="2" fill="#9be8ff" stroke="#3a3a6a" stroke-width="1.4"/>`).join("")}
    ${[[112, 214], [210, 214]].map(([x, y]) => `<rect x="${x}" y="${y}" width="4" height="22" fill="#fff6f0"/><path d="M${x + 2} ${y - 1} q-3 -5 0 -9 q3 4 0 9 Z" fill="#ffb347"/><circle cx="${x + 2}" cy="${y - 4}" r="6" fill="#ffd166" opacity=".25"/>`).join("")}
    <path d="M340 280 h40 l-5 -20 h-30 Z" fill="#c98a4a" stroke="#4a2a12" stroke-width="2"/>${[0, 1, 2].map(i => `<path d="M344 ${266 + i * 5} h32" stroke="#8a5a2a" stroke-width="1.2"/>`).join("")}
    <path d="M352 262 l-4 -10 l9 4 Z M366 262 l2 -11 l6 7 Z" fill="#ff9b45" stroke="#7a3a0a" stroke-width="1.4"/>`);

  // The bedroom at 11:11. Clues: teeny three-toed footprints on the windowsill, and a teeny moth by the lamp making a HUGE shadow on the wall.
  const window_ = () => wrap(`
    <defs><radialGradient id="mw-lamp"><stop offset="0" stop-color="#fff2b0" stop-opacity=".9"/><stop offset="1" stop-color="#fff2b0" stop-opacity="0"/></radialGradient>
      <linearGradient id="mw-beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff6c2" stop-opacity=".55"/><stop offset="1" stop-color="#fff6c2" stop-opacity="0"/></linearGradient></defs>
    <rect width="400" height="300" fill="#231a5e"/>
    ${Array.from({ length: 30 }, (x, i) => { const cx = (i % 10) * 40 + 20 + (Math.floor(i / 10) % 2) * 20, cy = Math.floor(i / 10) * 60 + 30; return i % 3 ? `<path d="M${cx} ${cy - 4} l1.2 2.8 l3 .3 l-2.3 2 l.7 3 l-2.6 -1.6 l-2.6 1.6 l.7 -3 l-2.3 -2 l3 -.3 Z" fill="#2e2474"/>` : `<g opacity=".45">${rocket(cx, cy, .5, 30, false).replace(/#f2f2ff|#ff5a7a|#5ff2ff/g, "#3a2e88")}</g>`; }).join("")}
    <rect y="248" width="400" height="52" fill="#3c2c74"/>${Array.from({ length: 8 }, (x, i) => `<path d="M${i * 54} 248 L${i * 54 - 30} 300" stroke="#33245f" stroke-width="2"/>`).join("")}
    <ellipse cx="210" cy="282" rx="120" ry="14" fill="#5a3a9a"/><ellipse cx="210" cy="282" rx="96" ry="9" fill="none" stroke="#ff8fd8" stroke-width="2" opacity=".6"/>
    <rect x="232" y="38" width="140" height="124" rx="6" fill="#120a36"/>
    <g>${stars(26, 9, 120).replace(/cx="(\d+(?:\.\d+)?)"/g, (m, x) => `cx="${(232 + Number(x) * .35).toFixed(1)}"`).replace(/cy="(\d+(?:\.\d+)?)"/g, (m, y) => `cy="${(40 + Number(y)).toFixed(1)}"`)}</g>
    ${galaxy(312, 96, 38, 30)}<path d="M350 52 a8 8 0 1 0 7 11 a6 6 0 1 1 -7 -11 Z" fill="#fff3b0"/>
    <rect x="232" y="38" width="140" height="124" rx="6" fill="none" stroke="#8a5a2a" stroke-width="8"/><path d="M302 38 V162 M232 100 H372" stroke="#8a5a2a" stroke-width="5"/>
    <path d="M222 30 Q240 90 228 168 L216 168 Z M382 30 Q364 90 376 168 L388 168 Z" fill="#4f6bff" stroke="#24308a" stroke-width="1.6"/><rect x="216" y="26" width="172" height="6" rx="3" fill="#a8743a"/>
    <rect x="224" y="160" width="156" height="12" rx="3" fill="#a8743a" stroke="#4a2a12" stroke-width="2"/>
    ${[[250, 165], [268, 166], [286, 165], [304, 166]].map(([x, y]) => steps3(x, y, .9)).join("")}
    ${note(230, 130, .8)}${note(206, 116, .9, "#ff9ef0")}${note(178, 128, .8)}
    <rect x="14" y="58" width="96" height="6" rx="2" fill="#a8743a" stroke="#4a2a12" stroke-width="1.4"/>
    ${[[16, 14, "#ff5a7a"], [24, 18, "#ffd166"], [32, 12, "#5ff2ff"], [38, 16, "#8be36b"], [46, 20, "#ff8fd8"]].map(([x, hh, c]) => `<rect x="${x}" y="${58 - hh}" width="${x === 46 ? 10 : 7}" height="${hh}" rx="1" fill="${c}" stroke="#2a1b52" stroke-width="1"/>`).join("")}
    <path d="M47 42 L51 46 L55 42" fill="none" stroke="#ff5a1a" stroke-width="1.6"/>${rocket(76, 46, .7, 0, false)}
    <path d="M92 58 q0 -10 6 -12 q6 2 6 12 Z" fill="#5ee35b" stroke="#12452c" stroke-width="1.2"/><circle cx="100" cy="50" r="1" fill="#1b1030"/>
    <rect x="160" y="40" width="50" height="66" rx="3" fill="#120a36" stroke="#ffd166" stroke-width="2.4"/>${stars(12, 4, 60).replace(/cx="(\d+(?:\.\d+)?)"/g, (m, x) => `cx="${(162 + Number(x) * .11).toFixed(1)}"`).replace(/cy="(\d+(?:\.\d+)?)"/g, (m, y) => `cy="${(44 + Number(y) * .8).toFixed(1)}"`)}
    ${rocket(185, 72, 1.3, 20)}<text x="185" y="100" font-family="Arial, sans-serif" font-size="7" font-weight="800" fill="#ffd166" text-anchor="middle">BLAST OFF!</text>
    <path d="M100 118 Q70 84 30 96 Q26 118 52 128 Q30 136 40 154 Q74 154 98 132 L104 134 Q128 154 162 154 Q172 136 150 128 Q176 118 172 96 Q132 84 104 118 Z" fill="#120c34" opacity=".72"/>
    <path d="M100 116 Q92 98 82 94 M104 116 Q112 98 122 94" fill="none" stroke="#120c34" stroke-width="3" opacity=".72" stroke-linecap="round"/>
    <rect x="10" y="190" width="160" height="70" rx="10" fill="#6b4a2a" stroke="#3a2210" stroke-width="3"/><rect x="8" y="164" width="14" height="96" rx="4" fill="#8a5a2a" stroke="#3a2210" stroke-width="2"/>
    <rect x="18" y="170" width="44" height="30" rx="10" fill="#f2f0ff" stroke="#6a6a9a" stroke-width="2"/>
    ${dino(96, 220, .8, { pose: "sit", face: "surprised", acc: "cap" })}
    <path d="M30 206 Q100 188 170 206 V246 H30 Z" fill="#4f6bff" stroke="#24308a" stroke-width="3"/>
    ${[[60, 220], [96, 230], [132, 218], [150, 236], [44, 236], [116, 240]].map(([x, y]) => `<path d="M${x} ${y - 5} l1.6 3.4 l3.6 .4 l-2.7 2.4 l.8 3.6 l-3.3 -1.9 l-3.3 1.9 l.8 -3.6 l-2.7 -2.4 l3.6 -.4 Z" fill="#ffe94a"/>`).join("")}
    <path d="M118 208 L136 204 L154 208 L154 222 L136 218 L118 222 Z" fill="#fff6f0" stroke="#6a3a1a" stroke-width="1.6"/><path d="M136 204 V218" stroke="#6a3a1a" stroke-width="1.2"/>
    <path d="M122 218 L128 210 L134 218 Z" fill="#ff7a45"/><path d="M140 212 h10 M140 215 h8" stroke="#8a6a5a" stroke-width="1"/>
    <rect x="70" y="210" width="12" height="6" rx="2" fill="#ffd166" stroke="#5a3a0a" stroke-width="1"/><path d="M82 211 L116 202 L116 222 L82 215 Z" fill="url(#mw-beam)"/>
    <ellipse cx="190" cy="262" rx="9" ry="4" fill="#ff8fd8"/><ellipse cx="206" cy="264" rx="9" ry="4" fill="#ff8fd8"/>
    <rect x="182" y="210" width="44" height="50" rx="4" fill="#8a5a2a" stroke="#3a2210" stroke-width="3"/><path d="M186 234 h36" stroke="#3a2210" stroke-width="2"/><circle cx="204" cy="244" r="2" fill="#ffd166"/>
    <circle cx="220" cy="190" r="36" fill="url(#mw-lamp)"/>
    <path d="M214 210 V196 M208 196 h16 l-4 -14 h-8 Z" fill="#ffd166" stroke="#5a3a0a" stroke-width="2"/>
    <g transform="translate(229,181)"><ellipse cx="0" cy="0" rx="2.2" ry="1.4" fill="#d9c9ff"/><path d="M0 0 l-3 -3 M0 0 l3 -3" stroke="#d9c9ff" stroke-width="1.4"/></g>
    <rect x="184" y="196" width="20" height="12" rx="3" fill="#2a1b2e" stroke="#ff5a7a" stroke-width="1.4"/>
    <text x="194" y="202.6" font-family="Courier New, monospace" font-size="7" font-weight="700" fill="#ff5a7a" text-anchor="middle" dominant-baseline="middle">11:11</text>
    ${[[244, 236, "#ff5a7a", "A"], [262, 238, "#5ff2ff", "B"], [252, 222, "#ffd166", "C"]].map(([x, y, c, t]) => `<rect x="${x}" y="${y}" width="14" height="14" rx="2" fill="${c}" stroke="#2a1b52" stroke-width="1.4"/><text x="${x + 7}" y="${y + 10.5}" font-family="Arial, sans-serif" font-size="9" font-weight="800" fill="#2a1b52" text-anchor="middle">${t}</text>`).join("")}`);

  // The swoop: T-Rexy spinning away from home into the galaxy, his cap flying off. Clue: someone small on a floating rock, holding a glowing star lantern.
  const swoop = () => wrap(`
    <defs><radialGradient id="ms-bg" cx=".5" cy=".45"><stop offset="0" stop-color="#5a1f9a"/><stop offset="1" stop-color="#0d0628"/></radialGradient>
      <radialGradient id="ms-glow"><stop offset="0" stop-color="#fff3a8" stop-opacity=".95"/><stop offset=".5" stop-color="#ffd43b" stop-opacity=".4"/><stop offset="1" stop-color="#ffd43b" stop-opacity="0"/></radialGradient>
      <radialGradient id="ms-neb1"><stop offset="0" stop-color="#ff6be0" stop-opacity=".35"/><stop offset="1" stop-color="#ff6be0" stop-opacity="0"/></radialGradient>
      <radialGradient id="ms-neb2"><stop offset="0" stop-color="#21d9ff" stop-opacity=".3"/><stop offset="1" stop-color="#21d9ff" stop-opacity="0"/></radialGradient>
      <linearGradient id="ms-comet" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9bf6ff" stop-opacity="0"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
    <rect width="400" height="300" fill="url(#ms-bg)"/>
    <ellipse cx="70" cy="80" rx="110" ry="70" fill="url(#ms-neb1)"/><ellipse cx="340" cy="210" rx="120" ry="80" fill="url(#ms-neb2)"/><ellipse cx="330" cy="40" rx="90" ry="50" fill="url(#ms-neb1)"/>
    ${stars(110, 21)}${twinkle(30, 140, .8)}${twinkle(372, 92, 1, "#ffd1f3")}${twinkle(150, 20, .7, "#9bf6ff")}
    <g transform="translate(46,50) rotate(-18)"><circle r="14" fill="#ff9b45"/><path d="M-14 -2 Q0 4 14 -2" fill="none" stroke="#ffd166" stroke-width="3" opacity=".7"/><ellipse rx="26" ry="6" fill="none" stroke="#ffe9a8" stroke-width="2.4"/><path d="M-14 0 A14 14 0 0 1 14 0" fill="#ff9b45"/></g>
    <path d="M286 28 L344 50" stroke="url(#ms-comet)" stroke-width="4" stroke-linecap="round"/><circle cx="344" cy="50" r="3.4" fill="#fff"/>
    ${galaxy(206, 128, 150, 20, ["#ff6be0", "#5ff2ff", "#ffe94a"])}
    ${galaxy(206, 128, 80, 80, ["#9b6bff", "#ff6be0", "#5ff2ff"], 3)}
    ${note(120, 70, 1.1)}${note(300, 60, 1, "#ffe94a")}${note(320, 200, 1.1, "#ff9ef0")}${note(100, 190, .9)}${note(250, 236, 1, "#5ff2ff")}${note(166, 230, .8, "#ffe94a")}
    ${[0, 1, 2].map(i => `<path d="M${180 + i * 6} ${110 - i * 10} A${46 + i * 12} ${40 + i * 10} 0 0 1 ${272 - i * 4} ${118 + i * 6}" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="10 8" opacity="${.5 - i * .12}"/>`).join("")}
    <g transform="translate(226,150) rotate(-28)">${dino(0, 0, .82, { pose: "hop", face: "dizzy" })}</g>
    ${cap(300, 104, .7, 40)}
    <path d="M0 300 Q90 262 160 288 Q240 270 400 286 V300 Z" fill="#1f6b4a"/>
    <path d="M296 286 Q306 272 316 286 Z" fill="#8a7ab8"/><circle cx="306" cy="282" r="1.8" fill="#ffd166"/>
    ${fern(330, 300, .6, true)}${fern(370, 300, .5)}${fern(270, 300, .4)}
    <path d="M18 262 Q62 250 108 262 L94 276 L80 272 L70 290 L58 276 L44 282 L36 270 Z" fill="#3a2a6a" stroke="#5a3a9a" stroke-width="2"/>
    <path d="M44 280 l-2 10 M80 276 l2 12" stroke="#5a8a4a" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M86 262 l4 -12 l4 12 Z M28 262 l3 -8 l3 8 Z" fill="#5ff2ff" opacity=".85"/>
    <ellipse cx="62" cy="262" rx="46" ry="6" fill="#2fa840"/>${fern(26, 262, .22)}${fern(98, 262, .2, true)}
    <circle cx="66" cy="252" r="26" fill="url(#ms-glow)"/>
    <g transform="translate(52,262) scale(.36)">${N().shadow("#140a30", 2)}</g>
    <g transform="translate(62.6,256.4)"><path d="M0 -3.4 L1 -1 L3.4 0 L1 1 L0 3.4 L-1 1 L-3.4 0 L-1 -1 Z" fill="#fff8d6"/></g>`);

  art.memories = { home, dinner, window: window_, swoop, galaxy, note };
})(window.Kit = window.Kit || {});
