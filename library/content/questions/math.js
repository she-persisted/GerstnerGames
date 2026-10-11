/**
 * @file content/questions/math.js
 * @about Math question generators that make new problems every time: space word problems, missing numbers, place value, rounding, and number patterns. Each takes a level from 1 to 5. Level 1 is early second grade, 3 is third grade, 5 is fourth grade.
 * @provides Kit.questions.gens { word, missing, place, round, pattern }
 * @requires kit/util.js, kit/questions.js
 *
 * Number ranges by level:
 *   add       1: 1-10        2: 10-60      3: 100-450     4: 150-900     5: 1,000-5,000
 *   subtract  1: within 20   2: within 100 3: within 1,000 (bigger gaps at 4) 5: within 10,000
 *   multiply  1: x2, x5, x10 2: up to 5x5  3: up to 9x9   4: 1 digit x 2 digits   5: 2 digits x 2 digits
 *   divide    matches multiply (always comes out even)
 */
(function (Kit) {
  "use strict";
  const { rint, pick, clamp } = Kit.util;
  const G = Kit.questions.gens;
  const lv = L => clamp(Math.round(L) || 1, 1, 5);
  const dOf = L => (L <= 2 ? 1 : L === 3 ? 2 : 3);

  function addPair(L) { const r = [[1, 10], [10, 60], [100, 450], [150, 900], [1000, 5000]][L - 1]; return [rint(r[0], r[1]), rint(r[0], r[1])]; }
  function subPair(L) {
    const [lo, hi, bLo, gap] = [[8, 20, 1, 2], [30, 99, 10, 5], [100, 999, 20, 20], [300, 999, 100, 50], [2000, 9999, 500, 200]][L - 1];
    const a = rint(lo, hi); return [a, rint(bLo, a - gap)];
  }
  function mulPair(L) {
    if (L === 1) return [rint(2, 5), pick([2, 5, 10])];
    if (L === 2) return [rint(2, 5), rint(2, 5)];
    if (L === 3) return [rint(2, 9), rint(2, 9)];
    if (L === 4) return [rint(2, 9), rint(11, 30)];
    return [rint(11, 25), rint(11, 19)];
  }
  function divTriple(L) { // [dividend, divisor, answer]
    const [ds, q] = L === 1 ? [[2, 5, 10], [1, 5]] : L === 2 ? [[2, 3, 4, 5], [2, 5]] : L === 3 ? [[2, 3, 4, 5, 6, 7, 8, 9], [2, 9]] : L === 4 ? [[2, 3, 4, 5, 6, 7, 8, 9], [10, 25]] : [[3, 4, 5, 6, 7, 8, 9], [20, 99]];
    const d = pick(ds), a = rint(q[0], q[1]); return [d * a, d, a];
  }
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

  // Each template returns [question, answer, clue].
  const WORD = [
    L => { const [a, b] = mulPair(L); return [`A rocket has ${plural(a, "booster")}. Each booster needs ${plural(b, "bolt")}. How many bolts is that in all?`, a * b, `Multiply ${a} × ${b}.`]; },
    L => { const [a, b] = addPair(L); return [`The robot has ${plural(a, "gear")}. He finds ${b} more. How many gears does he have now?`, a + b, `Add ${a} + ${b}.`]; },
    L => { const [a, b] = subPair(L); return [`The ship has ${a} gallons of fuel. The trip uses ${b} gallons. How many gallons are left?`, a - b, `Start at ${a} and take away ${b}.`]; },
    L => { const [n, d, q] = divTriple(L); return [`${n} stars are split into ${d} equal rows. How many stars are in each row?`, q, `What number times ${d} makes ${n}?`]; },
    L => { const [a, b] = mulPair(L); return [`Each spacesuit has ${plural(a, "button")}. How many buttons are on ${b} spacesuits?`, a * b, `Multiply ${b} × ${a}.`]; },
    L => { const [a, b] = addPair(L); return [`A rover drives ${a} miles on Monday and ${b} miles on Tuesday. How many miles is that in all?`, a + b, `Add ${a} + ${b}.`]; },
    L => { const [a, b] = subPair(L); return [`The space station has ${a} windows. ${b} of them are glowing. How many are dark?`, a - b, `Take ${b} away from ${a}.`]; },
    L => { const [n, d, q] = divTriple(L); return [`A comet zooms past every ${d} years. How many times will it zoom past in ${n} years?`, q, `How many ${d}s fit into ${n}?`]; },
    L => { const [a, b] = addPair(L); return [`A moon rock weighs ${a} pounds. Another one weighs ${b} pounds. How many pounds do they weigh together?`, a + b, `Add ${a} + ${b}.`]; },
    L => { const [a, b] = mulPair(L); return [`An astronaut packs ${plural(a, "snack")} for each day. How many snacks does she need for ${b} days?`, a * b, `Multiply ${a} × ${b}.`]; },
    L => { const h = L <= 2 ? rint(1, 2) : L === 3 ? rint(2, 4) : rint(3, 9); return [`There are 60 minutes in an hour. How many minutes are in ${plural(h, "hour")}?`, 60 * h, "Count by 60s: 60, 120, 180..."]; },
    L => { const a = [rint(5, 20), rint(15, 50), rint(30, 99), rint(120, 450), rint(500, 2500)][L - 1]; return [`The robot walks ${a} steps to the crater and ${a} steps back. How many steps is that in all?`, a * 2, `Double ${a}.`]; },
    L => { const a = [rint(2, 3), rint(2, 5), rint(3, 8), rint(9, 15), rint(16, 40)][L - 1]; return [`A spider robot has 8 legs. How many legs do ${plural(a, "spider robot")} have?`, a * 8, `Count by 8s, ${a} times.`]; },
    L => { const [a, b] = subPair(L); return [`The rocket is ${a} feet tall. The launch tower is ${b} feet shorter. How tall is the tower?`, a - b, `Take ${b} away from ${a}.`]; }
  ];

  G.word = level => {
    const L = lv(level), [q, n, clue] = pick(WORD)(L);
    return { id: "g-w-" + q.length + "-" + n, kind: "math", q, a: [String(n)], clue, d: dOf(L) };
  };

  G.missing = level => {
    const L = lv(level);
    if (L === 1 || Math.random() < .5) { const [a, b] = addPair(L); return { id: `g-m-${a}+${b}`, kind: "math", eq: true, q: `${a} + ? = ${a + b}`, a: [String(b)], clue: `Count up from ${a} to ${a + b}.`, d: dOf(L) }; }
    const [a, b] = mulPair(L);
    return { id: `g-m-${a}x${b}`, kind: "math", eq: true, q: `${a} × ? = ${a * b}`, a: [String(b)], clue: `Count by ${a}s until you reach ${a * b}.`, d: dOf(L) };
  };

  G.place = level => {
    const L = lv(level);
    if (L === 1) { const t = rint(1, 9), o = rint(0, 9); return { id: `g-p-${t}${o}`, kind: "math", q: `What number has ${t} tens and ${o} ones?`, a: [String(t * 10 + o)], clue: "Tens go first, then ones.", d: 1 }; }
    if (L <= 3) { const h = rint(1, 9), t = rint(0, 9), o = rint(0, 9); return { id: `g-p-${h}${t}${o}`, kind: "math", q: `What number has ${h} hundreds, ${t} tens, and ${o} ones?`, a: [String(h * 100 + t * 10 + o)], clue: "Hundreds go first, then tens, then ones.", d: dOf(L) }; }
    const th = rint(1, 9), h = rint(0, 9), t = rint(0, 9), o = rint(0, 9);
    return { id: `g-p-${th}${h}${t}${o}`, kind: "math", q: `What number has ${th} thousands, ${h} hundreds, ${t} tens, and ${o} ones?`, a: [String(th * 1000 + h * 100 + t * 10 + o)], clue: "Thousands first, then hundreds, tens, and ones.", d: dOf(L) };
  };

  G.round = level => {
    const L = lv(level);
    let n, to;
    if (L <= 2) { do { n = rint(11, 98); } while (n % 10 === 0); to = 10; }
    else if (L === 3) { do { n = rint(101, 989); } while (n % 10 === 0); to = 10; }
    else if (L === 4) { do { n = rint(110, 990); } while (n % 100 === 0); to = 100; }
    else { do { n = rint(1010, 9899); } while (n % 100 === 0); to = 100; }
    return { id: `g-r-${n}-${to}`, kind: "math", q: `Round ${n} to the nearest ${to === 10 ? "ten" : "hundred"}.`, a: [String(Math.round(n / to) * to)], clue: to === 10 ? "Look at the ones digit. 5 or more rounds up." : "Look at the tens digit. 5 or more rounds up.", d: dOf(L) };
  };

  G.pattern = level => {
    const L = lv(level);
    const type = pick([["count"], ["count", "add"], ["add", "sub", "skip"], ["sub", "skip", "double"], ["double", "triple", "growing", "fib"]][L - 1]);
    let seq, next, clue;
    if (type === "count") { const st = pick([2, 5, 10]), s = st * rint(0, 4); seq = [0, 1, 2, 3].map(i => s + st * i); next = s + st * 4; clue = `Count by ${st}s.`; }
    else if (type === "add") { const st = rint(3, 9), s = rint(0, 30); seq = [0, 1, 2, 3].map(i => s + st * i); next = s + st * 4; clue = `Add ${st} each time.`; }
    else if (type === "sub") { const st = rint(2, 9), s = st * 4 + rint(5, 40); seq = [0, 1, 2, 3].map(i => s - st * i); next = s - st * 4; clue = `Take away ${st} each time.`; }
    else if (type === "skip") { const k = rint(3, 12), m = rint(1, 4); seq = [0, 1, 2, 3].map(i => k * (m + i)); next = k * (m + 4); clue = `Count by ${k}s.`; }
    else if (type === "double") { const s = pick([1, 2, 3, 5]); seq = [s, s * 2, s * 4, s * 8]; next = s * 16; clue = "Each number doubles."; }
    else if (type === "triple") { const s = pick([1, 2]); seq = [s, s * 3, s * 9, s * 27]; next = s * 81; clue = "Each number is 3 times the one before it."; }
    else if (type === "growing") { const s = rint(1, 10); seq = [s, s + 1, s + 3, s + 6, s + 10]; next = s + 15; clue = "Add 1, then 2, then 3, then 4..."; }
    else { seq = [1, 1, 2, 3, 5, 8]; next = 13; clue = "Add the two numbers right before it together."; }
    return { id: "g-pat-" + seq.join("-"), kind: "pattern", q: "", seq, a: [String(next)], clue, d: dOf(L) };
  };
})(window.Kit = window.Kit || {});
