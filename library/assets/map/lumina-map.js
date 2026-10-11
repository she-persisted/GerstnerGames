/**
 * @file assets/map/lumina-map.js
 * @about Art for the top-down map of Lumina: dusty ground with craters, rocks, and glowing mushrooms, dotted paths, Comet Crater, the Old Observatory, Glowworm Grove, the Sleepy Village, the launch pad, gold star beacons with progress dots, and the glowing launch ring.
 * @provides Kit.art.luminaMap { makeDecor, drawGround, drawPaths, drawCrater, drawObservatory, drawGrove, drawVillage, drawPad, drawBeacon, drawPadRing }
 * @requires kit/canvas.js
 *
 * Every draw function takes the canvas context first and a tokens object T (colors read from CSS) last.
 * T needs: void, gold, good, cPeng, stoneSh, metalShade, wall, roof, win, leaf, trunk, dome, scope
 */
(function (Kit) {
  "use strict";
  const art = Kit.art = Kit.art || {};
  const D = Kit.draw;

  // Same seed gives the same scattered rocks every time, so the map feels like a real place.
  function makeDecor({ seed, sites, width, height }) {
    let s = seed | 0;
    const rnd = () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const clear = (x, y, d) => sites.every(p => Math.hypot(p.x - x, p.y - y) > d);
    const dots = Array.from({ length: 260 }, () => ({ x: rnd() * width, y: rnd() * height, r: .6 + rnd() * 1.8, a: .04 + rnd() * .1 }));
    const craters = [], rocks = [], shrooms = [];
    while (craters.length < 9) { const x = 40 + rnd() * (width - 80), y = 40 + rnd() * (height - 80); if (clear(x, y, 110)) craters.push({ x, y, r: 14 + rnd() * 22 }); }
    while (rocks.length < 22) { const x = 20 + rnd() * (width - 40), y = 30 + rnd() * (height - 50); if (clear(x, y, 80)) rocks.push({ x, y, r: 3 + rnd() * 6 }); }
    while (shrooms.length < 16) { const x = 20 + rnd() * (width - 40), y = 30 + rnd() * (height - 50); if (clear(x, y, 80)) shrooms.push({ x, y, s: .7 + rnd() * .6, p: rnd() * 6 }); }
    return { dots, craters, rocks, shrooms, width, height };
  }

  function drawGround(c, t, decor, T) {
    const w = decor.width, h = decor.height;
    const g = c.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * .7);
    g.addColorStop(0, "#4b4c6c"); g.addColorStop(1, "#1f1f36");
    c.fillStyle = g; c.fillRect(-w * .75, -h, w * 2.5, h * 3.2);
    decor.dots.forEach(d => { c.fillStyle = `rgba(241,239,255,${d.a})`; D.circle(c, d.x, d.y, d.r); });
    decor.craters.forEach(k => {
      c.fillStyle = "rgba(0,0,0,.18)"; D.ellipse(c, k.x, k.y, k.r, k.r * .62);
      c.strokeStyle = "rgba(241,239,255,.07)"; c.lineWidth = 2; c.beginPath(); c.ellipse(k.x, k.y, k.r, k.r * .62, 0, Math.PI, 2 * Math.PI); c.stroke();
    });
    decor.rocks.forEach(k => { c.fillStyle = T.stoneSh; D.ellipse(c, k.x, k.y, k.r, k.r * .7); });
    decor.shrooms.forEach(k => {
      const a = .25 + .2 * Math.sin(t / 700 + k.p);
      c.fillStyle = `rgba(143,230,255,${a})`; D.ellipse(c, k.x, k.y - 4 * k.s, 5 * k.s, 3 * k.s);
      c.fillStyle = "rgba(200,200,230,.25)"; c.fillRect(k.x - .8, k.y - 4 * k.s, 1.6, 4 * k.s);
    });
  }

  function drawPaths(c, pad, sites) {
    c.strokeStyle = "rgba(241,239,255,.2)"; c.lineWidth = 6; c.lineCap = "round"; c.setLineDash([1, 14]);
    sites.forEach(s => {
      c.beginPath(); c.moveTo(pad.x, pad.y + 10);
      c.quadraticCurveTo((pad.x + s.x) / 2 + (s.y - pad.y) * .25, (pad.y + s.y) / 2 - (s.x - pad.x) * .15, s.x, s.y + 6);
      c.stroke();
    });
    c.setLineDash([]);
  }

  function drawCrater(c, s, t, T) {
    c.fillStyle = "rgba(0,0,0,.3)"; D.ellipse(c, s.x, s.y, 66, 40);
    c.fillStyle = "#1d1c30"; D.ellipse(c, s.x, s.y + 3, 54, 31);
    c.strokeStyle = "rgba(241,239,255,.16)"; c.lineWidth = 4; c.beginPath(); c.ellipse(s.x, s.y, 62, 37, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
    const p = .6 + .4 * Math.sin(t / 400);
    D.glow(c, s.x, s.y - 2, 26, `rgba(143,230,255,${.4 * p})`); c.fillStyle = T.cPeng; D.circle(c, s.x, s.y - 2, 8);
    c.fillStyle = T.stoneSh; D.circle(c, s.x - 30, s.y + 14, 4); D.circle(c, s.x + 34, s.y + 10, 3);
  }

  function drawObservatory(c, s, T) {
    const x = s.x, y = s.y;
    c.fillStyle = T.wall; D.rr(c, x - 38, y - 44, 76, 46, 4); c.fill();
    c.fillStyle = T.dome; c.beginPath(); c.arc(x, y - 44, 36, Math.PI, 0); c.fill();
    c.strokeStyle = T.void; c.lineWidth = 4; c.beginPath(); c.moveTo(x, y - 79); c.lineTo(x, y - 46); c.stroke();
    c.save(); c.translate(x + 6, y - 62); c.rotate(-.7); c.fillStyle = T.scope; D.rr(c, 0, -5, 42, 10, 3); c.fill(); c.restore();
    c.fillStyle = T.roof; D.rr(c, x - 8, y - 22, 16, 24, 3); c.fill();
  }

  function drawGrove(c, s, t, T) {
    [[-40, 8, 26], [0, -8, 34], [42, 10, 24]].forEach(([dx, dy, r]) => {
      c.fillStyle = T.trunk; c.fillRect(s.x + dx - 4, s.y + dy - r * .4, 8, r * .9);
      c.fillStyle = T.leaf; D.circle(c, s.x + dx, s.y + dy - r, r);
    });
    [[-52, -40], [-30, -26], [-8, -58], [10, -40], [20, -66], [36, -24], [52, -18], [-44, -18]].forEach(([dx, dy], i) => {
      const a = .35 + .35 * Math.sin(t / 500 + i);
      c.fillStyle = `rgba(255,229,138,${a})`; D.circle(c, s.x + dx, s.y + dy, 2.2);
    });
  }

  function drawVillage(c, s, t, T, font) {
    [[-50, 6, 32, 26], [0, -4, 40, 34], [50, 8, 30, 24]].forEach(([dx, dy, w, h]) => {
      const x = s.x + dx - w / 2, y = s.y + dy - h;
      c.fillStyle = T.wall; c.fillRect(x, y, w, h);
      c.fillStyle = T.roof; c.beginPath(); c.moveTo(x - 5, y + 1); c.lineTo(x + w / 2, y - h * .6); c.lineTo(x + w + 5, y + 1); c.closePath(); c.fill();
      c.fillStyle = T.win; c.fillRect(x + w / 2 - 4, y + h * .3, 8, 8);
    });
    c.fillStyle = "rgba(170,165,216,.7)"; c.font = `700 16px ${font || "sans-serif"}`;
    const z = (t / 1200) % 1;
    c.globalAlpha = 1 - z; c.fillText("z", s.x + 14 + z * 10, s.y - 50 - z * 20); c.globalAlpha = 1;
  }

  // img: an Image of the rocket (see assets/rocket/rocket.js with plainFlame), or null while it loads.
  function drawPad(c, s, T, img) {
    c.fillStyle = "#3a3d5c"; D.ellipse(c, s.x, s.y + 4, 54, 20);
    c.strokeStyle = T.gold; c.globalAlpha = .55; c.lineWidth = 3; c.setLineDash([8, 7]);
    c.beginPath(); c.ellipse(s.x, s.y + 4, 44, 15, 0, 0, 6.283); c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
    c.strokeStyle = T.metalShade; c.lineWidth = 3; c.beginPath();
    c.moveTo(s.x + 40, s.y + 2); c.lineTo(s.x + 40, s.y - 92); c.moveTo(s.x + 48, s.y + 2); c.lineTo(s.x + 48, s.y - 92); c.stroke();
    if (img) c.drawImage(img, s.x - 26, s.y + 4 - 76.6, 52, 98.5);
  }

  // A gold star with progress dots above a place, or a green check once its part is found. s.beacon = height above the place.
  function drawBeacon(c, s, t, { found, progress = 0, total = 3, reduced = false }, T) {
    const bx = s.x, by = s.y - s.beacon;
    if (found) {
      c.fillStyle = T.good; D.circle(c, bx, by + 12, 11);
      c.strokeStyle = T.void; c.lineWidth = 3; c.lineCap = "round";
      c.beginPath(); c.moveTo(bx - 5, by + 12); c.lineTo(bx - 1, by + 16); c.lineTo(bx + 6, by + 7); c.stroke();
      return;
    }
    const bob = reduced ? 0 : Math.sin(t / 380 + (s.angle || 0)) * 4;
    D.glow(c, bx, by + bob, 24, "rgba(255,203,94,.45)");
    c.fillStyle = T.gold; D.star4(c, bx, by + bob, 12);
    for (let i = 0; i < total; i++) {
      const px = bx - 13 * (total - 1) / 2 + i * 13, py = by + 22;
      c.fillStyle = i < progress ? T.gold : "rgba(13,10,36,.85)"; D.circle(c, px, py, 4.6);
      c.strokeStyle = T.gold; c.lineWidth = 1.6; c.beginPath(); c.arc(px, py, 4.6, 0, 6.283); c.stroke();
    }
  }

  function drawPadRing(c, pad, t, T) {
    const r = 64 + Math.sin(t / 300) * 6;
    c.strokeStyle = T.gold; c.lineWidth = 4; c.globalAlpha = .8;
    c.beginPath(); c.ellipse(pad.x, pad.y + 4, r, r * .38, 0, 0, 6.283); c.stroke();
    c.globalAlpha = 1;
  }

  art.luminaMap = { makeDecor, drawGround, drawPaths, drawCrater, drawObservatory, drawGrove, drawVillage, drawPad, drawBeacon, drawPadRing };
})(window.Kit = window.Kit || {});
