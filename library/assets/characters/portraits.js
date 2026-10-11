/**
 * @file assets/characters/portraits.js
 * @about Small round head portraits of the robot, Sunny, Rigel, and Professor Kepler, used in the friends bar and on helper buttons.
 * @provides Kit.art.portraits { robot, dog, peng, rock } (SVG markup strings, viewBox -16 -16 32 32)
 * @requires assets/characters/characters.css
 */
(function (Kit) {
  "use strict";
  const art = Kit.art = Kit.art || {};
  art.portraits = {
    robot: `<svg viewBox="-16 -16 32 32" aria-hidden="true"><path d="M0 -10 V-13" class="antenna"/><circle cx="0" cy="-14" r="2.2" class="bulb"/><rect x="-11" y="-10" width="22" height="19" rx="6" class="m"/><rect x="-8" y="-7" width="16" height="13" rx="4" class="face"/><circle cx="-3.6" cy="-.5" r="2.8" class="eye"/><circle cx="3.6" cy="-.5" r="2.8" class="eye"/><circle cx="-3.2" cy="-1" r="1.3" class="pupil"/><circle cx="4" cy="-1" r="1.3" class="pupil"/></svg>`,
    dog: `<svg viewBox="-16 -16 32 32" aria-hidden="true"><circle cx="-10" cy="-8" r="4.5" class="fur-c"/><circle cx="0" cy="-12" r="4.8" class="fur-c"/><circle cx="10" cy="-8" r="4.5" class="fur-c"/><ellipse cx="-11" cy="3" rx="5" ry="9" class="fur"/><ellipse cx="11" cy="3" rx="5" ry="9" class="fur"/><circle r="10.5" class="fur"/><path d="M0 -10 C2 -6 2 -2 1.6 0 L-1.6 0 C-2 -2 -2 -6 0 -10Z" class="white"/><ellipse cx="0" cy="5" rx="6.4" ry="4.8" class="white"/><circle cx="-4.4" cy="-1.6" r="2.3" class="iris"/><circle cx="4.4" cy="-1.6" r="2.3" class="iris"/><circle cx="-3.8" cy="-2.3" r=".8" class="white"/><circle cx="5" cy="-2.3" r=".8" class="white"/><ellipse cx="0" cy="2.8" rx="2.5" ry="1.8" class="nose"/></svg>`,
    peng: `<svg viewBox="-16 -16 32 32" aria-hidden="true"><circle r="11" class="peng-dark"/><ellipse cx="0" cy="2" rx="7.6" ry="6.4" class="white"/><circle cx="-3.4" cy="0" r="1.7" class="nose"/><circle cx="3.4" cy="0" r="1.7" class="nose"/><path d="M-2.6 3 L2.6 3 L0 6.6Z" class="beak"/><circle r="14.5" class="bubble"/></svg>`,
    rock: `<svg viewBox="-16 -16 32 32" aria-hidden="true"><path d="M-12 12 C-14 4 -12 -6 -6 -10 C0 -14 8 -12 11 -6 C14 0 14 7 12 12Z" class="stone"/><path d="M-8 -9 C-4 -14 4 -15 10 -10 C6 -8 3 -9 1 -7 C-2 -9 -5 -7 -8 -9Z" class="moss"/><ellipse cx="-4" cy="0" rx="2.2" ry="1.4" class="rock-eye"/><ellipse cx="4" cy="0" rx="2.2" ry="1.4" class="rock-eye"/><g class="specs"><circle cx="-4" cy="0" r="3"/><circle cx="4" cy="0" r="3"/></g><path d="M-3 5 Q0 7 3 5" class="crack"/></svg>`
  };
})(window.Kit = window.Kit || {});
