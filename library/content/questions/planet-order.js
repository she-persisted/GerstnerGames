/**
 * @file content/questions/planet-order.js
 * @about Generator for planet-order questions. Level 1 asks about Earth's neighbors, level 2 about any planet, level 3 asks "which planet is fifth from the Sun?"
 * @provides Kit.questions.gens.order, Kit.questions.PLANETS
 * @requires kit/util.js, kit/questions.js
 */
(function (Kit) {
  "use strict";
  const { rint, clamp } = Kit.util;
  const P = Kit.questions.PLANETS = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];
  const LIST = "Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.";
  const ORD = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth"];

  Kit.questions.gens.order = level => {
    const L = clamp(Math.round(level) || 1, 1, 3);
    if (L === 3) {
      const i = rint(0, 7);
      return { id: `g-o-n${i}`, kind: "order", q: `Which planet is ${ORD[i]} from the Sun?`, a: [P[i]], clue: LIST, clue2: `It starts with ${P[i][0]}.`, d: 3 };
    }
    const i = L === 1 ? rint(1, 3) : rint(0, 7);
    const after = i < 7 && (i === 0 || Math.random() < .5);
    const ans = after ? P[i + 1] : P[i - 1];
    return { id: `g-o-${i}-${after}`, kind: "order", q: `Going out from the Sun, which planet comes right ${after ? "after" : "before"} ${P[i]}?`, a: [ans], clue: LIST, clue2: `It starts with ${ans[0]}.`, d: L };
  };
})(window.Kit = window.Kit || {});
