/**
 * @file assets/memories/memories.js
 * @about Four memory pictures for jigsaw puzzles, drawn in SVG: home in Fern Valley at night, the family dinner, the bedroom window at 11:11, and the swirly galaxy swoop. Each one hides a clue for the mystery if you look closely.
 * @provides Kit.art.memories { home, dinner, window, swoop } (each a function returning a standalone 400 x 300 <svg>), galaxy(cx, cy, r, turn, colors), note(x, y, scale, color)
 * @requires assets/characters/trexy.js, assets/characters/nova.js
 *
 * Clues hidden in the pictures: a tiny glowing music box on the hill (home), a little teal tail sneaking out the door with the fish (dinner),
 * tiny three-toed footprints on the windowsill and a huge shadow made by a teeny moth near the lamp (window), and someone small holding
 * a star lantern (swoop).
 */
(function (Kit) {
  "use strict";
  const art = Kit.art = Kit.art || {};
  const T = () => art.trexy, N = () => art.nova;
  const wrap = inner => `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">${inner}</svg>`;
  const rnd = seed => () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const stars = (n, seed, h = 300, col = "#fff") => { const r = rnd(seed); let s = ""; for (let i = 0; i < n; i++) s += `<circle cx="${(r() * 400).toFixed(1)}" cy="${(r() * h).toFixed(1)}" r="${(.6 + r() * 1.4).toFixed(1)}" fill="${col}" opacity="${(.45 + r() * .55).toFixed(2)}"/>`; return s; };

  // A spiral galaxy: glowing core plus curling arms.
  function galaxy(cx, cy, r, turn = 0, colors = ["#ff6be0", "#9b6bff", "#5ff2ff"]) {
    let s = `<g transform="translate(${cx},${cy}) rotate(${turn})"><ellipse rx="${r * 1.1}" ry="${r * .8}" fill="${colors[1]}" opacity=".18"/>`;
    for (let arm = 0; arm < 3; arm++) {
      let d = "";
      for (let i = 0; i <= 40; i++) {
        const t = i / 40, a = arm * 2.094 + t * 4.2, rr = r * (.08 + t * .95);
        d += `${i ? "L" : "M"}${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr * .72).toFixed(1)} `;
      }
      s += `<path d="${d}" fill="none" stroke="${colors[arm % colors.length]}" stroke-width="${(r * .09).toFixed(1)}" stroke-linecap="round" opacity=".85"/>`;
    }
    return s + `<circle r="${r * .2}" fill="#fff6d6"/><circle r="${r * .34}" fill="${colors[0]}" opacity=".35"/></g>`;
  }
  const note = (x, y, k = 1, c = "#5ff2ff") => `<g transform="translate(${x},${y}) scale(${k})"><ellipse cx="0" cy="0" rx="5" ry="3.6" transform="rotate(-20)" fill="${c}"/><path d="M4 -1 V-18 Q10 -16 12 -10" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/></g>`;
  const fern = (x, y, k = 1, flip = false, c = "#3cbf48") => {
    let s = `<g transform="translate(${x},${y}) scale(${flip ? -k : k},${k})"><path d="M0 0 Q4 -40 26 -70" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
    for (let i = 1; i < 9; i++) { const t = i / 9, px = 26 * t * t, py = -70 * t, l = 18 * (1 - t * .7); s += `<path d="M${px} ${py} q${-l * .6} ${-l * .2} ${-l} ${l * .5} M${px} ${py} q${l * .6} ${-l * .5} ${l} ${-l * .1}" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>`; }
    return s + "</g>";
  };
  const dino = (x, y, k, o) => `<g transform="translate(${x},${y}) scale(${k})">${T().g(o)}</g>`;

  const home = () => wrap(`
    <defs><linearGradient id="mh-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140a40"/><stop offset="1" stop-color="#4a2490"/></linearGradient>
      <radialGradient id="mh-win"><stop offset="0" stop-color="#fff6c2"/><stop offset="1" stop-color="#ffc94a"/></radialGradient>
      <radialGradient id="mh-box"><stop offset="0" stop-color="#5ff2ff" stop-opacity=".9"/><stop offset="1" stop-color="#5ff2ff" stop-opacity="0"/></radialGradient></defs>
    <rect width="400" height="300" fill="url(#mh-sky)"/>${stars(70, 3, 190)}
    ${galaxy(305, 70, 62, -15)}
    <path d="M58 40 a24 24 0 1 0 22 34 a19 19 0 1 1 -22 -34 Z" fill="#fff3b0"/>
    <path d="M0 210 Q70 150 140 190 T300 170 T400 180 V300 H0 Z" fill="#1f6b4a"/>
    <circle cx="56" cy="176" r="18" fill="url(#mh-box)"/><rect x="50" y="170" width="12" height="9" rx="2" fill="#9be8ff" stroke="#0e3b52" stroke-width="1.4"/>
    ${note(80, 160, .9)}${note(112, 140, 1)}${note(150, 132, 1.1, "#ff9ef0")}${note(186, 142, 1)}
    <path d="M0 250 Q100 205 200 232 T400 225 V300 H0 Z" fill="#2e8f4e"/>
    <path d="M140 262 Q140 168 220 168 Q300 168 300 262 Z" fill="#8a7ab8" stroke="#2a1b52" stroke-width="3"/>
    <path d="M160 250 q10 -30 30 -40 M260 190 q14 10 22 40" fill="none" stroke="#6e5f9e" stroke-width="3" stroke-linecap="round"/>
    <circle cx="248" cy="212" r="20" fill="url(#mh-win)" stroke="#2a1b52" stroke-width="3"/><path d="M248 192 V232 M228 212 H268" stroke="#2a1b52" stroke-width="2.4"/>
    <path d="M185 262 V230 Q185 214 200 214 Q215 214 215 230 V262 Z" fill="#4a2a70" stroke="#2a1b52" stroke-width="3"/>
    <rect x="330" y="214" width="6" height="40" fill="#7a4a2a"/><rect x="304" y="210" width="60" height="22" rx="4" fill="#c98a4a" stroke="#4a2a12" stroke-width="2"/>
    <text x="334" y="225" font-family="Arial, sans-serif" font-size="8" font-weight="700" fill="#3a1f0a" text-anchor="middle" dominant-baseline="middle">FERN VALLEY</text>
    ${fern(30, 300, 1.2)}${fern(78, 300, .9, true, "#58d15a")}${fern(396, 300, 1.05, true)}${fern(120, 300, .7, false, "#2fa840")}
    <rect y="286" width="400" height="14" fill="#1d5a36"/>`);

  const dinner = () => wrap(`
    <defs><radialGradient id="md-lamp" cx=".5" cy=".2"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".85"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient></defs>
    <rect width="400" height="300" fill="#6a2f78"/>
    ${Array.from({ length: 40 }, (x, i) => `<circle cx="${(i % 10) * 42 + 14}" cy="${Math.floor(i / 10) * 40 + 20}" r="3" fill="#7d3b8c"/>`).join("")}
    <rect x="18" y="26" width="80" height="64" rx="6" fill="#1b1050" stroke="#3a1f12" stroke-width="5"/>${galaxy(70, 52, 20, 10)}<path d="M58 26 V90 M18 58 H98" stroke="#3a1f12" stroke-width="3"/>
    <path d="M200 0 V40" stroke="#2a1b2e" stroke-width="2"/><ellipse cx="200" cy="150" rx="190" ry="140" fill="url(#md-lamp)"/>
    <path d="M176 60 Q200 34 224 60 Z" fill="#ffd166" stroke="#5a3a0a" stroke-width="2"/>
    <rect y="280" width="400" height="20" fill="#4a2350"/>
    ${dino(44, 268, 1.18, { who: "dad", acc: "glasses", face: "happy" })}
    ${dino(120, 266, 1.14, { who: "mom", acc: "flower", face: "smile" })}
    ${dino(268, 262, .9, { who: "sis", acc: "bow", face: "happy", flip: true })}
    ${dino(338, 268, 1.1, { face: "surprised", flip: true })}
    <rect x="30" y="238" width="320" height="14" rx="5" fill="#a0612f" stroke="#4a2a12" stroke-width="3"/>
    <rect x="48" y="252" width="12" height="36" fill="#7a4520"/><rect x="320" y="252" width="12" height="36" fill="#7a4520"/>
    <path d="M174 238 Q174 220 200 218 Q226 220 226 238 Z" fill="#f2f2ff" stroke="#3a3a6a" stroke-width="2"/>
    ${[[180, 220], [190, 212], [200, 209], [210, 212], [220, 220], [194, 217], [206, 217]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="6" fill="${["#4fd16b", "#2fa840", "#8be36b", "#4fd16b"][i % 4]}" transform="rotate(${i * 25 - 60} ${x} ${y})"/>`).join("")}
    <circle cx="194" cy="213" r="3.6" fill="#ff5a5a"/><circle cx="208" cy="210" r="3.2" fill="#ff5a5a"/>
    <ellipse cx="282" cy="236" rx="30" ry="6" fill="#fff" stroke="#3a3a6a" stroke-width="2"/>
    <path d="M260 230 Q276 216 296 228 L306 220 L306 238 L296 232 Q276 242 260 230 Z" fill="#ff9b45" stroke="#7a3a0a" stroke-width="2"/><circle cx="268" cy="228" r="2" fill="#2a1b2e"/>
    <ellipse cx="96" cy="236" rx="22" ry="5" fill="#fff" stroke="#3a3a6a" stroke-width="2"/>${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${84 + (i % 3) * 10}" cy="${228 - Math.floor(i / 3) * 6}" r="5" fill="#8f5bff" stroke="#3a1f6a" stroke-width="1.2"/>`).join("")}
    <rect x="360" y="130" width="40" height="150" fill="#2a1240"/><path d="M360 130 h40" stroke="#3a1f12" stroke-width="5"/>
    <path d="M400 280 C388 280 378 274 370 266 C380 268 390 271 400 270 Z" fill="#36c9d8" stroke="#0e3b52" stroke-width="2"/>
    <path d="M352 286 h40 l-6 14 h-28 Z" fill="#c98a4a" stroke="#4a2a12" stroke-width="2"/>
    <path d="M362 286 l-6 -12 l12 5 Z" fill="#ff9b45" stroke="#7a3a0a" stroke-width="1.6"/>`);

  const window_ = () => wrap(`
    <defs><radialGradient id="mw-lamp"><stop offset="0" stop-color="#fff2b0" stop-opacity=".9"/><stop offset="1" stop-color="#fff2b0" stop-opacity="0"/></radialGradient></defs>
    <rect width="400" height="300" fill="#231a5e"/>
    <rect y="248" width="400" height="52" fill="#3c2c74"/>
    <rect x="232" y="38" width="140" height="124" rx="6" fill="#120a36"/>
    <g>${stars(26, 9, 120).replace(/cx="(\d+(?:\.\d+)?)"/g, (m, x) => `cx="${(232 + Number(x) * .35).toFixed(1)}"`).replace(/cy="(\d+(?:\.\d+)?)"/g, (m, y) => `cy="${(40 + Number(y)).toFixed(1)}"`)}</g>
    ${galaxy(312, 96, 38, 30)}
    <rect x="232" y="38" width="140" height="124" rx="6" fill="none" stroke="#8a5a2a" stroke-width="8"/><path d="M302 38 V162 M232 100 H372" stroke="#8a5a2a" stroke-width="5"/>
    <rect x="224" y="160" width="156" height="12" rx="3" fill="#a8743a" stroke="#4a2a12" stroke-width="2"/>
    ${[[250, 165], [268, 166], [286, 165], [304, 166]].map(([x, y]) => `<g transform="translate(${x},${y}) scale(.9)" fill="#1f8a96"><ellipse cx="0" cy="0" rx="2.6" ry="1.8"/><circle cx="-3" cy="-3" r="1.2"/><circle cx="0" cy="-4" r="1.2"/><circle cx="3" cy="-3" r="1.2"/></g>`).join("")}
    ${note(230, 130, .8)}${note(206, 116, .9, "#ff9ef0")}${note(178, 128, .8)}
    <path d="M24 140 Q60 96 104 120 Q130 92 160 126 Q140 132 120 128 Q96 150 70 136 Q44 152 24 140 Z" fill="#120c34" opacity=".75"/>
    <rect x="10" y="190" width="160" height="70" rx="10" fill="#6b4a2a" stroke="#3a2210" stroke-width="3"/>
    <rect x="14" y="170" width="44" height="30" rx="10" fill="#f2f0ff" stroke="#6a6a9a" stroke-width="2"/>
    ${dino(96, 220, .8, { pose: "sit", face: "surprised", acc: "cap" })}
    <path d="M30 206 Q100 188 170 206 V246 H30 Z" fill="#4f6bff" stroke="#24308a" stroke-width="3"/>
    ${[[60, 220], [96, 230], [132, 218], [150, 236]].map(([x, y]) => `<path d="M${x} ${y - 5} l1.6 3.4 l3.6 .4 l-2.7 2.4 l.8 3.6 l-3.3 -1.9 l-3.3 1.9 l.8 -3.6 l-2.7 -2.4 l3.6 -.4 Z" fill="#ffe94a"/>`).join("")}
    <rect x="182" y="210" width="44" height="50" rx="4" fill="#8a5a2a" stroke="#3a2210" stroke-width="3"/>
    <circle cx="214" cy="190" r="34" fill="url(#mw-lamp)"/>
    <path d="M206 210 V196 M200 196 h16 l-4 -14 h-8 Z" fill="#ffd166" stroke="#5a3a0a" stroke-width="2"/>
    <g transform="translate(222,182)"><ellipse cx="0" cy="0" rx="2.2" ry="1.4" fill="#d9c9ff"/><path d="M0 0 l-3 -3 M0 0 l3 -3" stroke="#d9c9ff" stroke-width="1.4"/></g>
    <rect x="186" y="196" width="18" height="12" rx="3" fill="#2a1b2e" stroke="#ff5a7a" stroke-width="1.4"/>
    <text x="195" y="202.6" font-family="Courier New, monospace" font-size="7" font-weight="700" fill="#ff5a7a" text-anchor="middle" dominant-baseline="middle">11:11</text>`);

  const swoop = () => wrap(`
    <defs><radialGradient id="ms-bg" cx=".5" cy=".45"><stop offset="0" stop-color="#5a1f9a"/><stop offset="1" stop-color="#0d0628"/></radialGradient>
      <radialGradient id="ms-glow"><stop offset="0" stop-color="#fff3a8" stop-opacity=".95"/><stop offset=".5" stop-color="#ffd43b" stop-opacity=".4"/><stop offset="1" stop-color="#ffd43b" stop-opacity="0"/></radialGradient></defs>
    <rect width="400" height="300" fill="url(#ms-bg)"/>${stars(80, 21)}
    ${galaxy(206, 128, 150, 20, ["#ff6be0", "#5ff2ff", "#ffe94a"])}
    ${galaxy(206, 128, 80, 80, ["#9b6bff", "#ff6be0", "#5ff2ff"])}
    ${note(120, 70, 1.1)}${note(300, 60, 1, "#ffe94a")}${note(320, 200, 1.1, "#ff9ef0")}${note(100, 190, .9)}${note(250, 236, 1, "#5ff2ff")}
    <g transform="translate(226,150) rotate(-28)">${dino(0, 0, .82, { pose: "hop", face: "dizzy" })}</g>
    <path d="M0 300 Q90 262 160 288 Q240 270 400 286 V300 Z" fill="#1f6b4a"/>
    ${fern(330, 300, .6, true)}${fern(370, 300, .5)}
    <ellipse cx="62" cy="262" rx="46" ry="12" fill="#2a1b52" stroke="#5a3a9a" stroke-width="2"/>
    <circle cx="66" cy="252" r="24" fill="url(#ms-glow)"/>
    <g transform="translate(54,256) scale(.42)">${N().shadow("#140a30")}</g>
    <g transform="translate(66.5,253.5)"><rect x="-2.6" y="-3" width="5.2" height="6" rx="1.4" fill="#fff8d6"/><path d="M0 -6 V-3" stroke="#fff8d6" stroke-width="1"/></g>`);

  art.memories = { home, dinner, window: window_, swoop, galaxy, note };
})(window.Kit = window.Kit || {});
