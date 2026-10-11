/**
 * @file content/questions/odd-one-out.js
 * @about Generator for "which one does not belong?" puzzles: three things from one group and one sneaky outsider. Level 1 mixes very different groups (tools and planets); level 3 is trickier (the Moon among planets).
 * @provides Kit.questions.gens.odd
 * @requires kit/util.js, kit/questions.js
 */
(function (Kit) {
  "use strict";
  const { sample, pick, shuffle, clamp } = Kit.util;
  const GROUPS = {
    planets: { label: "planets", items: ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"] },
    space: { label: "things in space", items: ["Moon", "Sun", "comet", "asteroid", "meteor"] },
    shapes: { label: "shapes", items: ["circle", "square", "triangle", "rectangle", "hexagon", "oval"] },
    tools: { label: "tools", items: ["hammer", "wrench", "screwdriver", "saw", "drill", "pliers"] },
    continents: { label: "continents", items: ["Asia", "Africa", "Europe", "Australia", "Antarctica"] },
    oceans: { label: "oceans", items: ["Pacific", "Atlantic", "Indian", "Arctic"] },
    weather: { label: "kinds of weather", items: ["rain", "snow", "hail", "fog", "sleet", "wind"] },
    colors: { label: "colors", items: ["red", "blue", "yellow", "green", "purple", "orange"] }
  };
  // [main group, outsider group, difficulty]
  const PAIRS = [
    ["colors", "tools", 1], ["shapes", "colors", 1], ["tools", "weather", 1], ["weather", "shapes", 1], ["planets", "shapes", 1], ["tools", "planets", 1],
    ["continents", "oceans", 2], ["oceans", "planets", 2], ["continents", "planets", 2],
    ["planets", "space", 3]
  ];
  Kit.questions.gens.odd = level => {
    const L = clamp(Math.round(level) || 1, 1, 3);
    const pool = PAIRS.filter(p => p[2] === L);
    const [m, o] = pick(pool.length ? pool : PAIRS);
    const three = sample(GROUPS[m].items, 3);
    const odd = pick(GROUPS[o].items.filter(x => !GROUPS[m].items.includes(x)));
    return { id: "g-odd-" + odd, kind: "odd", q: "", tiles: shuffle([...three, odd]), a: [odd], clue: `Three of them are ${GROUPS[m].label}.`, d: L };
  };
})(window.Kit = window.Kit || {});
