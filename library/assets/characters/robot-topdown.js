/**
 * @file assets/characters/robot-topdown.js
 * @about The robot drawn small on a canvas for walkable maps: legs swing and arms pump while walking, eyes look the way he's heading, and his chest glows brighter with courage.
 * @provides Kit.art.drawRobotTop(ctx, x, y, t, motion, { tokens, glow })
 * @requires kit/canvas.js
 *
 * motion = { moving, phase, fx, fy } from kit/topdown-map.js; glow = 0 to 1 chest brightness.
 * tokens needs: metal, metalShade, copper, glass, snow, void, cRobot
 */
(function (Kit) {
  "use strict";
  const art = Kit.art = Kit.art || {};
  art.drawRobotTop = function (c, x, y, t, m, o) {
    const D = Kit.draw, T = o.tokens;
    const mv = m.moving, ph = m.phase;
    const bob = mv ? Math.abs(Math.sin(ph)) * 3 : Math.sin(t / 500) * .8;
    const lift = mv ? Math.sin(ph) * 4 : 0;
    c.save(); c.translate(x, y);
    c.fillStyle = "rgba(0,0,0,.35)"; D.ellipse(c, 0, 1, 18, 6);
    c.translate(0, -bob);
    c.fillStyle = T.metalShade;
    D.rr(c, -9, -25 - Math.max(0, lift), 5, 23, 2.5); c.fill();
    D.rr(c, 4, -25 - Math.max(0, -lift), 5, 23, 2.5); c.fill();
    c.fillStyle = T.metal;
    D.rr(c, -12.5, -4 - Math.max(0, lift), 9, 4, 2); c.fill();
    D.rr(c, 3.5, -4 - Math.max(0, -lift), 9, 4, 2); c.fill();
    c.strokeStyle = T.metalShade; c.lineWidth = 3.4; c.lineCap = "round";
    c.beginPath(); c.moveTo(-12, -48); c.quadraticCurveTo(-20, -40, -17, -30 + lift); c.stroke();
    c.beginPath(); c.moveTo(12, -48); c.quadraticCurveTo(20, -40, 17, -30 - lift); c.stroke();
    c.fillStyle = T.copper; D.circle(c, -17, -29 + lift, 2.8); D.circle(c, 17, -29 - lift, 2.8);
    c.fillStyle = T.metal; D.rr(c, -13, -54, 26, 31, 7); c.fill(); c.strokeStyle = T.metalShade; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = T.copper; D.circle(c, 0, -41, 6.2); c.fillStyle = T.glass; D.circle(c, 0, -41, 4.6);
    D.glow(c, 0, -41, 7, `rgba(255,203,94,${o.glow == null ? .5 : o.glow})`);
    c.fillStyle = T.metalShade; c.fillRect(-2, -61, 4, 8);
    c.fillStyle = T.metal; D.rr(c, -12.5, -80, 25, 20, 7); c.fill(); c.strokeStyle = T.metalShade; c.stroke();
    c.fillStyle = T.glass; D.rr(c, -9.5, -77, 19, 14, 5); c.fill();
    const fx = m.fx * 1.2, fy = m.fy * 1;
    c.fillStyle = T.snow; D.circle(c, -4.2, -70, 3.3); D.circle(c, 4.2, -70, 3.3);
    c.fillStyle = T.void; D.circle(c, -4.2 + fx, -70 + fy, 1.7); D.circle(c, 4.2 + fx, -70 + fy, 1.7);
    c.strokeStyle = T.metalShade; c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, -80); c.lineTo(0, -89); c.stroke();
    c.fillStyle = T.cRobot; D.circle(c, 0, -91, 2.6);
    c.restore();
  };
})(window.Kit = window.Kit || {});
