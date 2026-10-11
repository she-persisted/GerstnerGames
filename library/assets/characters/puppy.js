/**
 * @file assets/characters/puppy.js
 * @about Sunny, the fluffy magic puppy (black, white, and tan curls, floppy ears, star collar, sparkles, wagging tail). Built in code so the curls stay even. Sits at (0, 0), about 66 units tall.
 * @provides Kit.art.puppy() -> SVG markup string
 * @requires assets/characters/characters.css, assets/fx/defs.svg
 */
(function (Kit) {
  "use strict";
  const art = Kit.art = Kit.art || {};
  art.puppy = function () {
    const C = (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" class="${c}"/>`;
    // A ring of small circles makes the curly fur edge.
    const ring = (cx, cy, rx, ry, a0, a1, n, r, c) => { let s = ""; for (let i = 0; i < n; i++) { const a = (a0 + (a1 - a0) * i / (n - 1)) * Math.PI / 180; s += C((cx + rx * Math.cos(a)).toFixed(1), (cy + ry * Math.sin(a)).toFixed(1), r, c); } return s; };
    const curl = (x, y) => `<path d="M${x} ${y} q1.8 -2.2 3.6 0" class="curl"/>`;
    let s = "";
    s += `<g class="tail">${C(17, -12, 6.4, "fur-c")}${C(23, -20, 6.2, "fur-c")}${C(26.5, -28.5, 5.6, "fur-c")}${C(25, -37, 5, "fur-c")}${curl(20, -21)}${curl(23, -30)}</g>`;
    s += `<ellipse cx="0" cy="-21" rx="17" ry="18" class="fur"/>` + ring(0, -21, 17, 18, -60, 240, 15, 5.6, "fur-c") + `<ellipse cx="0" cy="-21" rx="15" ry="16" class="fur"/>`;
    s += curl(-14, -26) + curl(-15, -12) + curl(10, -28) + curl(11, -12);
    s += `<ellipse cx="0" cy="-19" rx="9.5" ry="12" class="white"/>` + ring(0, -19, 9.5, 12, 25, 155, 6, 3, "white");
    s += `<rect x="-11.5" y="-14" width="7.5" height="11" rx="3.2" class="tan"/><rect x="4" y="-14" width="7.5" height="11" rx="3.2" class="tan"/>`;
    s += `<ellipse cx="-7.7" cy="-2.8" rx="5.9" ry="3.5" class="white"/><ellipse cx="7.7" cy="-2.8" rx="5.9" ry="3.5" class="white"/>`;
    s += `<path d="M-9.6 -1.2 v-1.8 M-5.8 -1.2 v-1.8 M5.8 -1.2 v-1.8 M9.6 -1.2 v-1.8" class="toe"/>`;
    s += `<path d="M-11.5 -34 Q0 -29 11.5 -34" class="collar"/><g transform="translate(0,-29.5) scale(.95)"><use href="#spark4" class="star"/></g>`;
    s += `<circle cx="0" cy="-49" r="16" class="fur"/>` + ring(0, -49, 16, 16, 195, 345, 8, 5.6, "fur-c") + `<circle cx="0" cy="-49" r="14.5" class="fur"/>`;
    const ear = sx => C(15 * sx, -54, 6.4, "fur-c") + C(18.5 * sx, -46.5, 6.4, "fur-c") + C(19.5 * sx, -38.5, 6, "fur-c") + C(18.5 * sx, -31, 5.2, "fur-c") + C(16 * sx, -25.5, 4.2, "fur-c") + curl(17.5 * sx - 1.8, -45) + curl(18 * sx - 1.8, -35);
    s += ear(-1) + ear(1);
    s += C(-10.5, -42.5, 3.6, "tan") + C(10.5, -42.5, 3.6, "tan");
    s += `<path d="M0 -64 C3.2 -59 3.6 -52 3.2 -46 L-3.2 -46 C-3.6 -52 -3.2 -59 0 -64Z" class="white"/>`;
    s += `<ellipse cx="0" cy="-40.5" rx="10" ry="7.2" class="white"/>` + ring(0, -40.5, 10, 7.2, 25, 155, 6, 2.6, "white");
    s += `<ellipse cx="-6.6" cy="-57" rx="2.7" ry="1.9" class="tan"/><ellipse cx="6.6" cy="-57" rx="2.7" ry="1.9" class="tan"/>`;
    const eye = x => C(x, -50.5, 3.8, "iris") + C(x, -50.3, 2.4, "nose") + C(x + 1.2, -51.9, 1.25, "white") + C(x - 1.1, -49.3, .55, "white");
    s += eye(-6.6) + eye(6.6);
    s += `<ellipse cx="0" cy="-44.8" rx="4" ry="2.9" class="nose"/><ellipse cx="-1.1" cy="-45.7" rx="1.3" ry=".65" class="white" opacity=".6"/>`;
    s += `<path d="M0 -41.9 V-39.6 M-3.8 -39.8 Q0 -37.4 3.8 -39.8" class="dog-line"/><path d="M-2 -39 Q0 -34.4 2 -39 Z" class="tongue"/>`;
    s += curl(-11, -60) + curl(7, -61) + curl(-2.2, -65.5);
    s += `<g class="sparkles"><g transform="translate(-26,-62) scale(.8)"><use href="#spark4"/></g><g transform="translate(25,-66) scale(.65)"><use href="#spark4"/></g><g transform="translate(-28,-24) scale(.55)"><use href="#spark4"/></g></g>`;
    return s;
  };
})(window.Kit = window.Kit || {});
