/**
 * @file kit/canvas.js
 * @about Tiny canvas drawing shortcuts used by map art and top-down characters: circles, ovals, rounded boxes, glows, stars, and fog holes.
 * @provides Kit.draw { circle, ellipse, rr, glow, star4, hole }
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  const circle = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); };
  const ellipse = (c, x, y, rx, ry) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 6.283); c.fill(); };
  const rr = (c, x, y, w, h, r) => { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); };
  function glow(c, x, y, r, color) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color); g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g; circle(c, x, y, r);
  }
  // Four-point twinkle star.
  function star4(c, x, y, r) {
    c.beginPath();
    c.moveTo(x, y - r); c.lineTo(x + r * .28, y - r * .28); c.lineTo(x + r, y); c.lineTo(x + r * .28, y + r * .28);
    c.lineTo(x, y + r); c.lineTo(x - r * .28, y + r * .28); c.lineTo(x - r, y); c.lineTo(x - r * .28, y - r * .28);
    c.closePath(); c.fill();
  }
  // Soft-edged hole for punching light through fog. Use with globalCompositeOperation = "destination-out".
  function hole(c, x, y, r, a = 1) {
    const g = c.createRadialGradient(x, y, r * .3, x, y, r);
    g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g; circle(c, x, y, r);
  }
  Kit.draw = { circle, ellipse, rr, glow, star4, hole };
})(window.Kit = window.Kit || {});
