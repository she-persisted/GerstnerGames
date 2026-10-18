/**
 * @file assets/characters/trexy.js
 * @about T-Rexy, a cute cartoony green T-Rex with a big head, a big eye, two tiny teeth, and famously tiny arms. Also draws his family (same shape, different colors and accessories). Poses for standing, running, hopping, and sitting. Big shiny eyes and a little brow that shows his mood, with faces for happy, excited (star-sparkle eyes), determined, blinking, worried (with a sweat drop), surprised, thinking, dizzy, and sleepy. Plus unlockable looks, each fitted to his head and body: hats (a space helmet that holds his whole head, wizard hat, DJ headphones, glitch crown, party hat, star shades), things on his back (rocket backpack with a strap, super cape), colors (galaxy purple, golden, ocean blue, bubblegum pink), and whole outfits (a mad scientist in a lab coat with goggles and a bubbling potion, a surfer with board shorts, a flower lei, sunscreen on his snout, and a surfboard, and a punk rock biker in a studded leather jacket with a chain and a pink mohawk). Drawn in the shared Glitch Nebula style (assets/style/ink.js), and he can sit in a cockpit as a pilot.
 * @provides Kit.art.trexy { COLORS, LOOKS, OUTFITS, g(options), svg(options, size), url(options, size), isTall(options), hatOf(options), view(options), headBox(options), headView(options, aspect), pilot(options) }
 * @requires assets/style/ink.js
 *
 * options = { pose: stand | run1 | run2 | hop | sit,
 *             face: smile | happy | excited | determined | blink | worried | surprised | think | dizzy | sleepy,
 *             who: trexy | mom | dad | sis (colors), acc: none | flower | glasses | bow | cap | a hat from LOOKS.head,
 *             back: none | a back item from LOOKS.back, skin: a color from LOOKS.skin (overrides who), flip: true to face left,
 *             outfit: an outfit from LOOKS.outfit, outfitHat: false to leave off the outfit's head piece, props: false to leave off
 *             what the outfit carries (the surfboard, the potion) }
 * An outfit's head piece (OUTFITS[id].hat: the goggles or the mohawk) shows only when he wears no hat, and its surfboard only when
 * he wears nothing on his back, so outfits mix with every other look. hatOf(options) says what ends up on his head.
 * Drawing space: facing right, feet at y = 0, about 100 units tall (x from -58 to 60, y from -94 to 4). The sit pose reaches y = 9, so it's
 * for scenes drawn with g() (the memory pictures), not for svg() pictures.
 * Tall hats reach up to y = -124: for those, isTall(options) is true and svg() makes the picture 130 units tall instead of 100
 * (same width, extra room on top), so draw it 1.3 times taller to keep T-Rexy the same size.
 * svg() returns a standalone <svg> (for images and canvas drawing); url() returns it as a data URL; view() is its viewBox.
 * The picture is 122 units wide and centered on his body, so he doesn't jump sideways when he turns around (flip).
 * headBox() is the box around his head and whatever he wears on it ({ x, y, w, h }, in drawing units); headView() turns it into a
 * viewBox for a head portrait (aspect = width / height, 1.2 by default). pilot() gives { g, box } for a ship's cockpit:
 * his markup and the head box the ship fits into its canopy (assets/ship/glitch-ship.js).
 * LOOKS = { head: { id: name }, back: { id: name }, skin: { id: name }, outfit: { id: name } }, the names shown to players.
 */
(function (Kit) {
  "use strict";
  const art = Kit.art = Kit.art || {};
  const ink = art.ink, INK = ink.INK;
  const COLORS = {
    trexy: { body: "#5ee35b", belly: "#dcfca0", bump: "#3cbf48", line: "#12452c", cheek: "#ff8fb1" },
    mom: { body: "#3fd6b0", belly: "#cffff1", bump: "#26ad8d", line: "#0f4038", cheek: "#ff8fb1" },
    dad: { body: "#46a84c", belly: "#d3eca6", bump: "#2f8237", line: "#123a19", cheek: "#ff9d8f" },
    sis: { body: "#a6ec5a", belly: "#f4ffd2", bump: "#83cc3a", line: "#2c4a12", cheek: "#ff8fb1" },
    galaxy: { body: "#9b6bff", belly: "#e6dcff", bump: "#7a4ae0", line: "#2a1460", cheek: "#ff8fd1" },
    gold: { body: "#ffcf3b", belly: "#fff3c4", bump: "#e0a91f", line: "#5a3d00", cheek: "#ff9d6e" },
    ocean: { body: "#3fb4ff", belly: "#d4f0ff", bump: "#2390e0", line: "#0b2f52", cheek: "#ff8fb1" },
    bubblegum: { body: "#ff7ac8", belly: "#ffe0f2", bump: "#e055a8", line: "#5a1040", cheek: "#ff4f8b" }
  };
  // Outfit colors. Clothes are gear, so they're outlined in the shared ink, each with one shadow tone.
  const LAB = { coat: "#f7f8ff", shade: "#c6cbe8", glass: "#aef6ff", potion: "#5cffb0" };
  const SURF = { shorts: "#1fc7cf", shortsShade: ink.shadeOf("#1fc7cf", .28), flower: "#ffe94a", board: "#fff3d6", boardShade: "#efd59c", stripe: "#ff6b3d" };
  const PUNK = { jacket: "#30264a", shade: ink.shadeOf("#30264a", .45), metal: "#dfe3f2", patch: "#ff3ec8", hair: "#ff3ec8", hairShade: "#c21f93" };
  const LOOKS = {
    head: { helmet: "Space Helmet", wizard: "Wizard Hat", headphones: "DJ Headphones", crown: "Glitch Crown", party: "Party Hat", shades: "Star Shades" },
    back: { rocket: "Rocket Backpack", cape: "Super Cape" },
    skin: { galaxy: "Galaxy Purple", gold: "Golden Scales", ocean: "Ocean Blue", bubblegum: "Bubblegum Pink" },
    outfit: { scientist: "Mad Scientist", surfer: "Surfer Dino", punk: "Punk Rock Biker" }
  };
  // Outfits are whole costumes: clothes on his body, plus a head piece (shown when he isn't wearing a hat), a thing on his back
  // (shown when he isn't wearing a back item), and a thing in his hand. hat = the head piece, drawn by acc() like a hat.
  const OUTFITS = { scientist: { hat: "goggles" }, surfer: { hat: "" }, punk: { hat: "mohawk" } };
  // What's on his head: a hat or story accessory if he has one, or else his outfit's head piece (unless outfitHat is false).
  const hatOf = (o = {}) => o.acc && o.acc !== "none" ? o.acc : (OUTFITS[o.outfit] && o.outfitHat !== false && OUTFITS[o.outfit].hat) || "none";
  const TALL = new Set(["helmet", "wizard", "headphones", "crown", "party", "mohawk", "goggles"]);
  const isTall = (o = {}) => TALL.has(hatOf(o));
  const { star, sparkle } = ink;

  // The space helmet: a fishbowl sized to his whole head, snout and all, closed by a collar ring at his neck.
  const HELMET = { cx: 23, cy: -69, rx: 36, ry: 30, collar: -45 };
  const helmetArc = (() => {
    const { cx, cy, rx, ry, collar } = HELMET, dx = rx * Math.sqrt(1 - ((collar - cy) / ry) ** 2);
    return { x0: +(cx - dx).toFixed(2), x1: +(cx + dx).toFixed(2) };
  })();

  function leg(x, angle, c, far, outfit) {
    const fill = far ? c.bump : c.body;
    const cuff = outfit === "surfer" ? `<path d="M-6.4 -2 H6.4 V6.6 Q0 8 -6.4 6.6 Z" fill="${far ? SURF.shortsShade : SURF.shorts}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>` : "";
    return `<g transform="translate(${x},-15) rotate(${angle})"><path d="M-5 0 h10 v11 q0 2 3 2 h4 q3 0 3 3 v1 h-20 z" fill="${fill}" stroke="${c.line}" stroke-width="2.4" stroke-linejoin="round"/>${cuff}</g>`;
  }

  // Faces. Every open eye is big and shiny (two highlights), a little brow shows the mood, and the blush gets rosier when he's happy.
  function face(f, c) {
    const L = c.line;
    const low = m => `<g transform="translate(0 1.8)">${m}</g>`; // the eye and brow sit a little low, leaving room for the brow to rise
    const brow = d => low(`<path d="${d}" fill="none" stroke="${L}" stroke-width="2.6" stroke-linecap="round"/>`);
    const cheek = (k = .88, marks = false) => ink.blush({ cx: 33.5, cy: -60, color: c.cheek, k, marks });
    const eye = ({ rx = 9.4, ry = 10.2, px = 22.4, py = -69.6, pr = 6.4, star = false } = {}) => low(ink.eye({ cx: 20, cy: -70, rx, ry, px, py, pr, line: L, star }));
    const closed = (d = "M12 -70 Q20 -63.8 28 -70") => low(`<path d="${d}" fill="none" stroke="${L}" stroke-width="3" stroke-linecap="round"/>`);
    const teeth = `<path d="M33 -53.5 l2.2 3.6 l2.2 -3.9 Z M40 -54.6 l2 3.4 l2 -3.7 Z" fill="#fff" stroke="${L}" stroke-width=".8"/>`;
    const smile = `<path d="M27 -55 Q38 -49.5 49 -57" fill="none" stroke="${L}" stroke-width="2.4" stroke-linecap="round"/>`;
    const open = `<path d="M27 -56 Q38 -45 50 -58 Q38 -51 27 -56 Z" fill="#7a1f3d" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>`;
    switch (f) {
      case "happy": return `${closed("M12.5 -69 Q20 -78 27.5 -69")}${brow("M13.5 -83.4 Q19.5 -86.8 25.5 -84.8")}${cheek(.95, true)}${open}${teeth}`;
      case "excited": return `${eye({ rx: 9.8, ry: 10.6, pr: 6.6, star: true })}${brow("M14 -84 Q20 -87.6 26 -85.4")}${cheek(.95, true)}
        <path d="M26.5 -57 Q38 -41 51.5 -59 Q38 -52.5 26.5 -57 Z" fill="#7a1f3d" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M34 -50.5 Q39.5 -46.2 45 -51 Q39.5 -52.8 34 -50.5 Z" fill="#ff7aa0"/>${teeth}${sparkle(2.5, -87)}${sparkle(-4.4, -75.6, 2.2)}`;
      case "determined": return `${eye({ px: 24.4, py: -69, pr: 6 })}${low(`
        <path d="M11.2 -73.6 Q20 -78 28.8 -73.6 A9.4 10.2 0 0 0 11.2 -73.6 Z" fill="${c.body}"/>
        <path d="M28.8 -73.6 A9.4 10.2 0 0 0 11.2 -73.6" fill="none" stroke="${L}" stroke-width="2.2"/>
        <path d="M11.2 -73.6 Q20 -78 28.8 -73.6" fill="none" stroke="${L}" stroke-width="2.4" stroke-linecap="round"/>`)}${brow("M11.5 -85.4 Q19 -84.8 27.5 -80.2")}${cheek(.6)}
        <path d="M29 -55.5 Q38 -51 48 -57.5" fill="none" stroke="${L}" stroke-width="2.4" stroke-linecap="round"/>${teeth}`;
      case "blink": return `${closed()}${brow("M13 -82.6 Q19.5 -85.6 26 -83.2")}${cheek()}${smile}${teeth}`;
      case "worried": return `${eye({ px: 19.4, py: -67.4, pr: 5.6 })}${brow("M12 -81.6 Q19 -83 27 -86.2")}${cheek(.6)}
        <path d="M29 -54 q3.5 -3 7 0 t7 0 t6 -1" fill="none" stroke="${L}" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M2.5 -88 Q-1.2 -81.6 2.5 -79.6 Q6.2 -81.6 2.5 -88 Z" fill="#8fe6ff" stroke="#1b4a6a" stroke-width="1"/><circle cx="1.6" cy="-82.4" r=".8" fill="#fff"/>`;
      case "surprised": return `${eye({ rx: 10.2, ry: 10.9, px: 21, py: -70, pr: 4.4 })}${brow("M14 -84.2 Q20 -87.8 26.5 -85.6")}${cheek(.7)}
        <ellipse cx="40" cy="-53" rx="3.8" ry="4.8" fill="#7a1f3d" stroke="${L}" stroke-width="1.8"/>`;
      case "think": return `${eye({ px: 24.2, py: -74, pr: 5.4 })}${brow("M14 -82.8 Q20.5 -86.8 26.5 -85.6")}${cheek(.6)}<path d="M33 -55.5 L45 -56.5" stroke="${L}" stroke-width="2.4" stroke-linecap="round"/>`;
      case "dizzy": return `<path d="M20 -70 m-6 0 a6 6 0 1 1 6 6 a4 4 0 1 1 -4 -4 a2 2 0 1 1 2 2" fill="none" stroke="${L}" stroke-width="2.2" stroke-linecap="round"/>${cheek(.5)}
        <path d="M28 -54 q3 -3 6 0 t6 0 t6 0" fill="none" stroke="${L}" stroke-width="2.2" stroke-linecap="round"/>${sparkle(4, -90, 2.6)}${sparkle(-6, -80, 2)}`;
      case "sleepy": return `${closed("M12.5 -68 Q20 -64 27.5 -68")}${brow("M13 -81.8 Q19 -83.2 26 -82.4")}${cheek(.7)}${smile}`;
      default: return `${eye()}${brow("M13 -82.6 Q19.5 -85.6 26 -83.2")}${cheek()}${smile}${teeth}`;
    }
  }

  // Hats and other things worn on the head, all outlined in the shared ink, each with one shadow tone and one shine.
  function acc(a) {
    switch (a) {
      case "flower": return `<g transform="translate(6,-84.8)">${[0, 72, 144, 216, 288].map(r => `<ellipse cx="0" cy="-5" rx="3.6" ry="5.4" fill="#ff7ac8" transform="rotate(${r})" stroke="#7a1f5a" stroke-width="1"/>`).join("")}<circle r="3" fill="#ffe94a" stroke="#7a5a00" stroke-width="1"/><circle cx="-.8" cy="-.9" r=".9" fill="#fff" opacity=".8"/></g>`;
      case "glasses": return `<g fill="none" stroke="${INK}" stroke-width="2.4"><circle cx="20" cy="-70" r="11"/><path d="M31 -71 Q36 -74 41 -71"/><path d="M9 -71 L0 -74"/></g>${ink.shine("M13 -75 Q15 -78 18 -79", 1.4, .7)}`;
      case "bow": return `<g transform="translate(4,-86) rotate(-12)"><path d="M0 0 L-10 -6 L-10 6 Z M0 0 L10 -6 L10 6 Z" fill="#ff5fa2" stroke="#7a1f3d" stroke-width="1.4" stroke-linejoin="round"/><path d="M-8.4 -3.4 L-8.4 1" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".6"/><circle r="2.6" fill="#ffd1e6" stroke="#7a1f3d" stroke-width="1.2"/></g>`;
      case "helmet": {
        const { cx, cy, rx, ry, collar } = HELMET, { x0, x1 } = helmetArc;
        const bubble = `M${x0} ${collar} A${rx} ${ry} 0 1 1 ${x1} ${collar} Q${cx} ${collar + 4} ${x0} ${collar} Z`;
        const arc = (a0, a1, k) => { const p = a => [cx + Math.cos(a * Math.PI / 180) * (rx - k), cy + Math.sin(a * Math.PI / 180) * (ry - k)].map(n => n.toFixed(1)).join(" ");
          return `M${p(a0)} A${rx - k} ${ry - k} 0 0 1 ${p(a1)}`; };
        return `<g>${ink.glass(bubble, { w: 2.4 }).replace("<path", '<path data-part="helmet"')}
          ${ink.shine(arc(196, 246, 4.5), 3.4, .85)}${ink.glint(cx - 3, cy - ry + 6.4, 1.8)}${ink.shine(arc(18, 44, 4), 1.8, .4)}
          <path d="M${x0 - 1} ${collar} Q${cx} ${collar + 5} ${x1 + 1} ${collar}" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
          <path d="M${x0 - 1} ${collar} Q${cx} ${collar + 5} ${x1 + 1} ${collar}" fill="none" stroke="#dfe3f2" stroke-width="4.4" stroke-linecap="round"/>
          <path d="M${x0 + 3} ${collar - .6} Q${cx} ${collar + 3.6} ${x1 - 3} ${collar - .6}" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>
          <path d="M${cx} ${cy - ry - .5} V${cy - ry - 10}" stroke="${INK}" stroke-width="4.2" stroke-linecap="round"/><path d="M${cx} ${cy - ry - 1} V${cy - ry - 10}" stroke="#dfe3f2" stroke-width="1.8" stroke-linecap="round"/>
          <circle cx="${cx}" cy="${cy - ry - 13}" r="3.6" fill="#ff3ec8" stroke="${INK}" stroke-width="1.6"/>${ink.glint(cx - 1.1, cy - ry - 14.2, 1)}</g>`;
      }
      case "wizard": return `<g><path d="M1 -86 Q9 -102 4 -118 Q20 -110 31 -89 Z" fill="#7b4ff0" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M24 -92 Q15 -106 6.4 -115 Q18 -109 27.5 -91 Z" fill="${ink.shadeOf("#7b4ff0", .25)}" opacity=".7"/>${ink.shine("M6 -92 Q9 -101 7 -109", 1.8, .5)}
        ${star(4, -118, 4.2, "#ffe94a")}${star(13, -101, 3.2, "#ffe94a")}${star(21, -93, 2.4, "#3ef2ff")}
        <ellipse cx="16" cy="-86" rx="22" ry="5.5" transform="rotate(-8 16 -86)" fill="#6b3fd6" stroke="${INK}" stroke-width="2.2"/>
        <path d="M-2 -85.6 Q15 -91.6 34 -91" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".45"/></g>`;
      case "headphones": return `<g><path d="M1.5 -73 C-1 -92 12 -103 27 -88.6" fill="none" stroke="${INK}" stroke-width="7.4" stroke-linecap="round"/>
        <path d="M1.5 -73 C-1 -92 12 -103 27 -88.6" fill="none" stroke="#ff3ec8" stroke-width="3.8" stroke-linecap="round"/>
        <path d="M2.4 -84 C4 -93 10 -97.6 17 -97.6" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".6"/>
        <rect x="-4.5" y="-78" width="13" height="18" rx="5.5" fill="#ff3ec8" stroke="${INK}" stroke-width="2.2"/><rect x="-1.5" y="-74" width="7" height="10" rx="3" fill="#3ef2ff" stroke="${INK}" stroke-width="1"/>
        <path d="M-2.4 -75.6 v6" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>
        <g transform="translate(-15,-97) rotate(-10)"><path d="M3 0 V-11 L11 -13 V-2" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 0 V-11 L11 -13 V-2" fill="none" stroke="#3ef2ff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="0.6" cy="0" r="3" fill="#3ef2ff" stroke="${INK}" stroke-width="1.4"/><circle cx="8.6" cy="-2" r="3" fill="#3ef2ff" stroke="${INK}" stroke-width="1.4"/></g></g>`;
      case "crown": return `<g transform="rotate(-7 17 -86)"><path d="M3 -84 L3 -99 L10 -91 L17 -104 L24 -91 L31 -99 L31 -84 Z" fill="#ffd43b" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M24 -91 L31 -99 L31 -84 L24 -84 Z" fill="#e0a91f" opacity=".75"/>${ink.shine("M6 -88 V-95", 1.4, .7)}
        <rect x="3" y="-87" width="28" height="4" fill="#ffb800" stroke="${INK}" stroke-width="1.4"/>
        <circle cx="10" cy="-85" r="1.8" fill="#ff3ec8"/><circle cx="17" cy="-85" r="1.8" fill="#3ef2ff"/><circle cx="24" cy="-85" r="1.8" fill="#5cffb0"/>${sparkle(17, -108, 2.4)}</g>`;
      case "party": return `<g transform="rotate(10 18 -87)"><path d="M8 -86 L18 -113 L28 -86 Z" fill="#ffe94a" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M18 -113 L28 -86 L22 -86 Z" fill="#e0b81f" opacity=".7"/>
        <path d="M11 -94 L25 -94 M14 -102 L22 -102" stroke="#ff3ec8" stroke-width="3" stroke-linecap="round"/><circle cx="18" cy="-114" r="4.2" fill="#3ef2ff" stroke="${INK}" stroke-width="1.6"/>${ink.glint(16.8, -115.4, 1.1)}</g>`;
      case "shades": return `<g><path d="M8 -73 L-1 -76" stroke="${INK}" stroke-width="4.6" stroke-linecap="round"/><path d="M8 -73 L-1 -76" stroke="#ff3ec8" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M32 -71 Q37 -74 42 -71" fill="none" stroke="${INK}" stroke-width="4.4" stroke-linecap="round"/><path d="M32 -71 Q37 -74 42 -71" fill="none" stroke="#ff3ec8" stroke-width="2.2" stroke-linecap="round"/>
        ${star(20, -70, 12.5, INK, INK, 5.2)}${star(20, -70, 12.5, "#1b1030", "#ff3ec8", 2.4)}<path d="M15 -75 l4 -3" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/></g>`;
      case "goggles": return `<g><path d="M9 -86.6 Q0 -85.4 -6.4 -73" fill="none" stroke="${INK}" stroke-width="4.4" stroke-linecap="round"/><path d="M9 -86.6 Q0 -85.4 -6.4 -73" fill="none" stroke="#7c8099" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M19.2 -89 L21 -89.2" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
        ${[[14.2, -88.6], [25.8, -89.4]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.2" fill="${LAB.glass}" fill-opacity=".85" stroke="${INK}" stroke-width="4.4"/><circle cx="${x}" cy="${y}" r="5.2" fill="none" stroke="#ffb13b" stroke-width="2.2"/>
          ${ink.shine(`M${x - 2.8} ${y - .6} Q${x - 2.2} ${y - 2.8} ${x} ${y - 3.2}`, 1.3, .9)}${ink.glint(x + 2, y + 1.6, .8)}`).join("")}</g>`;
      case "mohawk": {
        const spikes = [[[-3, -74.5], [-10.5, -85], [4.5, -82.6]], [[4.5, -82.6], [0.5, -97], [11, -85.6]], [[11, -85.6], [9.5, -103.5], [17, -86.9]],
          [[17, -86.9], [20.5, -104.5], [24, -86.6]], [[24, -86.6], [31, -98.5], [30, -85.4]]];
        const outline = "M-3 -74.5 " + spikes.map(([, t, b]) => `L${t[0]} ${t[1]} L${b[0]} ${b[1]}`).join(" ") + " Q17 -88.6 4.5 -82.4 Q-.5 -79 -3 -74.5 Z";
        const shade = spikes.map(([a, t, b]) => `M${a[0]} ${a[1]} L${t[0]} ${t[1]} L${((a[0] + b[0]) / 2).toFixed(2)} ${((a[1] + b[1]) / 2).toFixed(2)} Z`).join(" ");
        return `<g><path d="${outline}" fill="${PUNK.hair}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="${shade}" fill="${PUNK.hairShade}" opacity=".75"/>
          ${ink.shine("M19.4 -91 L20.4 -99", 1.3, .65)}${ink.shine("M9.6 -90 L9.4 -97", 1.1, .5)}</g>`;
      }
      case "cap": return `<g><path d="M-6 -80 Q6 -98 30 -86 Q14 -84 -2 -74 Z" fill="#4f6bff" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M2 -88 Q10 -93 20 -91" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".5"/>
        <path d="M-6 -80 Q-14 -76 -16 -68" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M-6 -80 Q-14 -76 -16 -68" fill="none" stroke="#4f6bff" stroke-width="3.2" stroke-linecap="round"/><circle cx="-16" cy="-66" r="4" fill="#fff" stroke="${INK}" stroke-width="1.6"/></g>`;
      default: return "";
    }
  }

  // Things worn on his back. The pack and cape are drawn behind him; a strap crosses his chest in front.
  function back(b, pose) {
    switch (b) {
      case "rocket": {
        const flame = `<path d="M-4.5 15 Q0 ${pose === "hop" ? 33 : 27} 4.5 15 Z" fill="#ff9a3c"/><path d="M-2.2 15 Q0 ${pose === "hop" ? 26 : 22} 2.2 15 Z" fill="#ffe94a"/>`;
        return `<g transform="translate(-24,-43) rotate(-14) scale(1.35)">${flame}<path d="M-6 12 L-11 18 L-6 8 Z M6 12 L11 18 L6 8 Z" fill="#ff3ec8" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>
          <rect x="-6" y="-10" width="12" height="25" rx="5" fill="#e8ecff" stroke="${INK}" stroke-width="1.8"/><path d="M2 -8 Q5 -2 5 8 Q5 12 3 13.6 L3 -8 Z" fill="#c4c9ea" opacity=".8"/>
          <path d="M-6 -6 Q0 -21 6 -6 Z" fill="#ff3ec8" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
          <circle cx="0" cy="2" r="3.2" fill="#3ef2ff" stroke="${INK}" stroke-width="1.3"/>${ink.glint(-1, 1, .9)}<path d="M-6 9 H6" stroke="${INK}" stroke-width="1.1"/>${ink.shine("M-3.6 -3 V6", 1.2, .7)}</g>`;
      }
      case "cape": {
        const d = pose === "hop" ? "M0 -55 Q-22 -66 -50 -58 Q-44 -48 -54 -38 Q-34 -36 -18 -26 Q-6 -40 0 -55 Z"
          : pose === "run1" || pose === "run2" ? "M0 -55 Q-24 -60 -48 -50 Q-41 -42 -50 -31 Q-32 -31 -16 -23 Q-6 -38 0 -55 Z"
          : "M0 -55 Q-24 -54 -38 -34 Q-33 -24 -42 -10 Q-27 -15 -15 -18 Q-6 -38 0 -55 Z";
        return `<path d="${d}" fill="#e8364f" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M-6 -50 Q-20 -48 -30 -40" fill="none" stroke="#ff8a9c" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>
          ${star(pose === "stand" || pose === "sit" ? -26 : -24, pose === "stand" || pose === "sit" ? -34 : -42, 4.5, "#ffe94a", "#7a1020", 1)}`;
      }
      case "surfboard": return `<g transform="translate(-22,-40) rotate(-30)"><path d="M0 -32 C7.5 -24 8.5 10 4.5 28 Q0 31.5 -4.5 28 C-8.5 10 -7.5 -24 0 -32 Z" fill="${SURF.board}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M0 -32 C7.5 -24 8.5 10 4.5 28 Q2.4 30 0 30.2 Z" fill="${SURF.boardShade}" opacity=".7"/>
        <path d="M0 -28 V27" stroke="${SURF.stripe}" stroke-width="2.6"/><path d="M-1.6 21 L0 31 L1.6 21 Z" fill="${SURF.stripe}" stroke="${INK}" stroke-width="1"/>${ink.shine("M-3.6 -16 Q-4.6 -6 -4.4 4", 1.4, .7)}</g>`;
      default: return "";
    }
  }
  // Clothes for an outfit, drawn over his body (and over the top of his near leg, so a lab coat's hem hangs down over it).
  // pt(a) is the point on his body's outline at angle a (degrees, 0 = front, 90 = down), so clothes follow his shape.
  const pt = (a, k = 0) => [(21 - k) * Math.cos(a * Math.PI / 180), -31 + (22 - k) * Math.sin(a * Math.PI / 180)].map(n => +n.toFixed(2));
  const P = ([x, y]) => `${x} ${y}`;
  const bodyShade = ink.crescent({ cx: 0, cy: -31, rx: 21, ry: 22, a0: 95, a1: 215, dx: 4, dy: -3.4 });
  function clothes(outfit) {
    switch (outfit) {
      case "scientist": { // a white lab coat, open at the front, with a long hem, lapels, and pens in the pocket
        const top = pt(-70), side = pt(145);
        const coat = `M${P(top)} A21 22 0 0 0 ${P(side)} L-19 -5 Q0 -1.5 13 -5 C16 -20 13 -40 ${P(top)} Z`;
        return `<path d="${coat}" fill="${LAB.coat}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
          <path d="${bodyShade}" fill="${LAB.shade}" opacity=".85"/><path d="M-19 -5 Q0 -1.5 13 -5 L12.6 -8.4 Q0 -5 -18.6 -8.6 Z" fill="${LAB.shade}" opacity=".85"/>
          <path d="M7.6 -47.5 L2.6 -39 L10.4 -34.6 Z" fill="${LAB.coat}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
          <rect x="-7.4" y="-36" width="2.2" height="6" rx="1" fill="#ff3ec8" stroke="${INK}" stroke-width="1"/><rect x="-4.4" y="-35" width="2.2" height="5" rx="1" fill="#3ef2ff" stroke="${INK}" stroke-width="1"/>
          <rect x="-10" y="-31" width="10" height="8" rx="1.6" fill="${LAB.coat}" stroke="${INK}" stroke-width="1.6"/>
          <path d="M8.8 -14 h-1.4 M10.6 -24 h-1.4" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>${ink.shine("M-12 -43 Q-15.5 -38 -16.4 -31", 1.6, .9)}`;
      }
      case "punk": { // a studded leather biker jacket, open over his belly, with a zipper, a lightning patch, and a chain
        const top = pt(-62), bottom = pt(68);
        const jacket = `M${P(top)} A21 22 0 1 0 ${P(bottom)} C15 -20 15 -38 ${P(top)} Z`;
        const stud = ([x, y]) => `<circle cx="${x}" cy="${y}" r="1.9" fill="${PUNK.metal}" stroke="${INK}" stroke-width=".9"/>${ink.glint(x - .6, y - .6, .6)}`;
        return `<path d="${jacket}" fill="${PUNK.jacket}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
          <path d="${bodyShade}" fill="${PUNK.shade}" opacity=".8"/>
          <path d="M7.4 -12.4 C12.6 -21 12.8 -37 9 -47.4" fill="none" stroke="${PUNK.metal}" stroke-width="1.3"/><rect x="11" y="-31.4" width="2.8" height="4.4" rx=".8" fill="${PUNK.metal}" stroke="${INK}" stroke-width=".8"/>
          <path d="M9.6 -48.6 L2.6 -41.6 L7 -39.6 L4.4 -35 L12.8 -35.6 Z" fill="${PUNK.jacket}" stroke="${PUNK.metal}" stroke-width="1.3" stroke-linejoin="round"/>${stud([8.6, -38.2])}
          <path d="M-5 -39 L-10.4 -28.6 L-6.4 -28.6 L-9.4 -20 L-.8 -31.6 L-4.8 -31.6 L-1.8 -39 Z" fill="${PUNK.patch}" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>
          ${[pt(136, 3.8), pt(156, 3.8), pt(176, 3.8)].map(stud).join("")}
          ${[.12, .3, .5, .7, .88].map(t => { const x = (1 - t) ** 2 * 8.4 + 2 * (1 - t) * t * -1 + t * t * -11, y = (1 - t) ** 2 * -12.6 + 2 * (1 - t) * t * -4.4 + t * t * -13.4;
            const ang = Math.atan2(2 * (1 - t) * (-4.4 + 12.6) + 2 * t * (-13.4 + 4.4), 2 * (1 - t) * (-1 - 8.4) + 2 * t * (-11 + 1)) * 180 / Math.PI;
            return `<ellipse cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" rx="1.9" ry="1.2" transform="rotate(${ang.toFixed(1)} ${x.toFixed(2)} ${y.toFixed(2)})" fill="none" stroke="${INK}" stroke-width="2"/><ellipse cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" rx="1.9" ry="1.2" transform="rotate(${ang.toFixed(1)} ${x.toFixed(2)} ${y.toFixed(2)})" fill="none" stroke="${PUNK.metal}" stroke-width=".9"/>`; }).join("")}
          ${ink.shine("M-12 -43 Q-15.5 -38 -16.4 -31", 1.4, .45)}`;
      }
      case "surfer": { // board shorts with yellow flowers, and a flower lei
        const flower = (x, y, k = 1) => `<g transform="translate(${x},${y}) scale(${k})">${[0, 72, 144, 216, 288].map(r => `<circle cx="0" cy="-1.5" r="1.2" fill="${SURF.flower}" transform="rotate(${r})"/>`).join("")}<circle r=".9" fill="${SURF.stripe}"/></g>`;
        const lei = [[-4, -47.2, "#ff7ac8"], [1, -44.6, "#ffe94a"], [6.4, -43.2, "#ff7ac8"], [12, -42.6, "#ffe94a"], [17.4, -43.2, "#ff7ac8"], [22.4, -44.8, "#ffe94a"]]
          .map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="2.7" fill="${c}" stroke="${INK}" stroke-width="1"/><circle cx="${x}" cy="${y}" r=".8" fill="#fff" opacity=".8"/>`).join("");
        return `<path d="M${P(pt(30))} A21 22 0 0 1 ${P(pt(150))} Q0 -16.6 ${P(pt(30))} Z" fill="${SURF.shorts}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="${ink.crescent({ cx: 0, cy: -31, rx: 21, ry: 22, a0: 95, a1: 150, dx: 4, dy: -3.4 })}" fill="${SURF.shortsShade}" opacity=".8"/>
          ${flower(-9, -13.4)}${flower(4, -11.6, .9)}${flower(-15.4, -18, .8)}
          <path d="M12.8 -18.8 l-1 4 M14.8 -19 l1 4" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>${lei}`;
      }
      default: return "";
    }
  }
  // What an outfit adds to his hand: the mad scientist holds a bubbling potion.
  function handProp(outfit, pose) {
    if (outfit !== "scientist") return "";
    const [dx, dy] = pose === "hop" ? [1, -17] : [0, 0], bubbles = pose === "hop" ? "" :
      [[24.4, -35, 1.2], [27.4, -38.6, .9], [25, -42, .7]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${LAB.potion}" stroke="${INK}" stroke-width=".7"/>`).join("");
    const bulb = "M20.4 -21.8 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0";
    return `<g transform="translate(${dx},${dy})"><rect x="23.8" y="-31.6" width="3.2" height="5.6" rx=".8" fill="${LAB.glass}" fill-opacity=".6" stroke="${INK}" stroke-width="1.4"/>
      <path d="M20.5 -22.4 A5 5 0 0 0 30.3 -22.4 Z" fill="${LAB.potion}"/>${ink.glass(bulb, { w: 1.6 })}${ink.shine("M22.6 -23.6 Q23 -25.6 24.6 -26.2", 1.1, .9)}${bubbles}</g>`;
  }
  // Sleeves for a lab coat or a jacket, over the top of his tiny arm.
  function sleeve(outfit, pose) {
    const color = outfit === "scientist" ? LAB.coat : outfit === "punk" ? PUNK.jacket : "";
    if (!color) return "";
    const d = pose === "hop" ? "M14 -40 q3.6 -3.6 6.8 -5.6" : "M15 -37 q4.2 0 6.4 2.6";
    return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="7.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="4.6" stroke-linecap="round"/>`;
  }
  // The rocket backpack's strap, over his shoulder and across his chest (drawn in front of his body, under his arm).
  const strap = b => b === "rocket" ? `<path d="M-17 -41 Q-2 -38 14 -30" fill="none" stroke="${INK}" stroke-width="5.4" stroke-linecap="round"/><path d="M-17 -41 Q-2 -38 14 -30" fill="none" stroke="#ff3ec8" stroke-width="2.8" stroke-linecap="round"/>` : "";

  // The whole dinosaur, as SVG markup with no <svg> wrapper.
  function g(o = {}) {
    const c = COLORS[o.skin] || COLORS[o.who] || COLORS.trexy, L = c.line, pose = o.pose || "stand";
    const fit = OUTFITS[o.outfit] ? o.outfit : "", props = o.props !== false; // props: false leaves out the surfboard and the potion
    const legs = {
      stand: [leg(-7, 0, c, true, fit), leg(6, 0, c, false, fit)],
      run1: [leg(-6, 24, c, true, fit), leg(5, -26, c, false, fit)],
      run2: [leg(-6, -22, c, true, fit), leg(5, 20, c, false, fit)],
      hop: [leg(-6, -38, c, true, fit), leg(5, -48, c, false, fit)],
      sit: [`<ellipse cx="-2" cy="-6" rx="16" ry="7" fill="${c.bump}" stroke="${L}" stroke-width="2.4"/>`, `<ellipse cx="14" cy="-4" rx="9" ry="4.5" fill="${c.body}" stroke="${L}" stroke-width="2.4"/>`]
    }[pose] || [];
    const lift = { sit: 8, hop: -3, run1: -2.2, run2: -1.8 }[pose] || 0; // a little bob up mid-stride keeps his toes in the picture
    const tail = pose === "hop" ? "M-12 -36 C-30 -42 -46 -44 -58 -38 C-48 -32 -34 -26 -12 -22 Z" : "M-12 -36 C-30 -36 -46 -30 -58 -16 C-50 -14 -34 -18 -12 -21 Z";
    const tailShade = pose === "hop" ? "M-14 -24.4 C-30 -27 -44 -31 -54 -36.4 C-46 -30.6 -32 -25.6 -14 -22.6 Z" : "M-14 -23 C-30 -20 -44 -17 -54.6 -16.6 C-48 -14.8 -34 -18 -14 -21.2 Z";
    const arm = pose === "hop"
      ? `<path d="M14 -40 q6 -6 11 -9" fill="none" stroke="${L}" stroke-width="6.4" stroke-linecap="round"/><path d="M14 -40 q6 -6 11 -9" fill="none" stroke="${c.body}" stroke-width="3.6" stroke-linecap="round"/>`
      : `<path d="M15 -37 q7 0 9 5" fill="none" stroke="${L}" stroke-width="6.4" stroke-linecap="round"/><path d="M15 -37 q7 0 9 5" fill="none" stroke="${c.body}" stroke-width="3.6" stroke-linecap="round"/>
         <path d="M24 -32 l1.6 2.6 M22.4 -31 l.4 3" stroke="${L}" stroke-width="1.4" stroke-linecap="round"/>`;
    // One shadow tone (on his back and under his tail) and one shine (on top of his head), like everything else in the game.
    const shade = ink.crescent({ cx: 0, cy: -31, rx: 21, ry: 22, a0: 95, a1: 215, dx: 4, dy: -3.4 });
    const body = `<g transform="translate(0,${lift})">
      ${back(o.back || (fit === "surfer" && props ? "surfboard" : ""), pose)}
      ${legs[0]}
      <path d="${tail}" fill="${c.body}" stroke="${L}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="${tailShade}" fill="${c.bump}" opacity=".55"/>
      <ellipse cx="0" cy="-31" rx="21" ry="22" fill="${c.body}" stroke="${L}" stroke-width="2.4"/>
      <path d="${shade}" fill="${c.bump}" opacity=".5"/>
      <ellipse cx="7" cy="-28" rx="12" ry="15" fill="${c.belly}"/>
      <path d="M2 -36 q5 2 10 0 M1 -29 q6 2 12 0 M2 -22 q5 2 10 0" fill="none" stroke="${c.bump}" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>
      ${legs[1]}
      ${clothes(fit)}
      ${strap(o.back)}
      <circle cx="-8" cy="-60" r="3.6" fill="${c.bump}" stroke="${L}" stroke-width="1.8"/>
      <circle cx="-12" cy="-51" r="3.4" fill="${c.bump}" stroke="${L}" stroke-width="1.8"/>
      <circle cx="-15" cy="-42" r="3.2" fill="${c.bump}" stroke="${L}" stroke-width="1.8"/>
      <g data-part="head"><path d="M-6 -58 C-8 -80 12 -91 30 -85 C46 -80 53 -71 51 -60 C50 -50 41 -46 25 -46 C9 -46 -4 -46 -6 -58 Z" fill="${c.body}" stroke="${L}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M-3.4 -55 C-1 -49.6 8 -48.6 24 -48.6 C36 -48.6 44 -50 47.6 -54.6 C45 -48.6 38 -47.2 25 -47.2 C9 -47.2 -1.6 -47.6 -3.4 -55 Z" fill="${c.bump}" opacity=".45"/>
      <ellipse cx="44" cy="-71" rx="1.8" ry="1.3" fill="${L}"/>
      ${ink.gloss(7, -81.5, 6.4, 2.6, -26)}
      ${face(o.face, c)}${fit === "surfer" ? `<path d="M33.6 -82.4 Q35.6 -78.8 35.4 -75" fill="none" stroke="${INK}" stroke-width="4.4" stroke-linecap="round"/><path d="M33.6 -82.4 Q35.6 -78.8 35.4 -75" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>` : ""}</g>
      <g data-part="hat">${acc(hatOf(o))}</g>
      ${arm}${sleeve(fit, pose)}${props ? handProp(fit, pose) : ""}
    </g>`;
    return o.flip ? `<g transform="scale(-1,1)">${body}</g>` : body;
  }

  // The head and whatever is on it, as a box in drawing units (not flipped).
  const HEAD_BOX = {
    none: [-9, -94, 64, 50], cap: [-21, -99, 76, 55], flower: [-9, -97, 64, 53], bow: [-9, -98, 64, 54], glasses: [-9, -94, 64, 50],
    helmet: [-14.5, -117, 76, 77], wizard: [-9, -124, 64, 80], headphones: [-17, -113, 72, 69], crown: [-9, -112, 64, 68], party: [-9, -120, 64, 76], shades: [-9, -94, 64, 50],
    goggles: [-9, -98, 64, 54], mohawk: [-12, -107, 67, 63]
  };
  function headBox(o = {}) { const [x, y, w, h] = HEAD_BOX[hatOf(o)] || HEAD_BOX.none; return { x, y, w, h }; }
  // A viewBox around the head (for portraits and closet buttons), padded to the given width-to-height shape.
  function headView(o = {}, aspect = 1.2) {
    const b = headBox(o); let { x, y, w, h } = b;
    if (w / h < aspect) { const nw = h * aspect; x -= (nw - w) / 2; w = nw; } else { const nh = w / aspect; y -= (nh - h) / 2; h = nh; }
    if (o.flip) x = -x - w;
    return [x, y, w, h].map(n => +n.toFixed(1)).join(" ");
  }
  // In a cockpit: T-Rexy standing tall in his seat, and the box the ship fits into its canopy.
  const pilot = (o = {}) => ({ g: g({ ...o, pose: "stand", back: "", flip: false, props: false }), box: headBox(o) });

  const view = (o = {}) => `${o.flip ? -60 : -62} ${4 - (isTall(o) ? 130 : 100)} 122 ${isTall(o) ? 130 : 100}`;
  const svg = (o = {}, size = 120) => { const hh = isTall(o) ? 130 : 100; return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size * hh / 122)}" viewBox="${view(o)}">${g(o)}</svg>`; };
  const url = (o, size) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg(o, size));

  art.trexy = { COLORS, LOOKS, OUTFITS, g, svg, url, isTall, hatOf, view, headBox, headView, pilot, HELMET };
})(window.Kit = window.Kit || {});
