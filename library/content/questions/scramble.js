/**
 * @file content/questions/scramble.js
 * @about 48 science and space words to unscramble, from 4 to 7 letters. Longer words are harder, so games choose the length from the player's level.
 * @provides Kit.questions.banks.scramble (each item has len)
 * @requires kit/questions.js
 */
(function (Kit) {
  "use strict";
  // Grouped by length: [word, clue]
  const WORDS = {
    4: [["moon", "It glows at night and goes around the Earth."], ["gear", "A wheel with teeth inside a machine."], ["wire", "Electricity travels through this thin metal string."], ["beam", "A long ray of light."], ["glow", "What a night light does."], ["snow", "Cold and white, it falls in winter."], ["fuel", "Rockets burn this to fly."], ["cold", "The opposite of hot."], ["mars", "The Red Planet."], ["bolt", "It screws into a nut to hold metal together."], ["core", "The very center of a planet."], ["fins", "Rockets have these at the bottom to fly straight."]],
    5: [["comet", "A ball of ice with a long, shiny tail."], ["orbit", "The path a planet takes around the Sun."], ["robot", "That's what our tall hero is!"], ["laser", "A super straight beam of light."], ["power", "Energy that makes machines go."], ["solar", "It means 'from the Sun,' like solar panels."], ["frost", "Icy crystals on a window on a cold morning."], ["earth", "The planet we live on."], ["venus", "The hottest planet."], ["light", "The opposite of dark."], ["metal", "Hard, shiny stuff like iron and steel."], ["rover", "A robot car that explores other planets."], ["spark", "A tiny flash of fire or electricity."]],
    6: [["planet", "Earth is one. So are Mars and Saturn."], ["rocket", "It blasts off into space with fire underneath."], ["magnet", "It sticks to the fridge and pulls on metal."], ["galaxy", "A giant group of billions of stars."], ["launch", "What a rocket does at liftoff."], ["energy", "What you need to run, jump, and play!"], ["saturn", "The planet with beautiful rings."], ["meteor", "A space rock that makes a streak of light."], ["frozen", "What water is when it turns to ice."], ["winter", "The coldest season."], ["engine", "The part of a machine that makes it go."], ["helmet", "Astronauts wear this on their heads."], ["sensor", "A robot uses this to notice things."]],
    7: [["jupiter", "The biggest planet of all."], ["gravity", "It pulls things down to the ground."], ["crystal", "A sparkly rock with flat, shiny sides."], ["glacier", "A giant, slow river of ice."], ["battery", "It stores power for toys and robots."], ["rainbow", "Seven colors in the sky after rain."], ["mercury", "The planet closest to the Sun."], ["neptune", "The farthest planet from the Sun."], ["science", "The subject where you do experiments!"], ["machine", "Something with parts that work together to do a job."]]
  };
  Kit.questions.banks.scramble = Object.entries(WORDS).flatMap(([len, list]) => list.map(([w, clue]) => {
    const n = +len;
    return { id: "s-" + w, kind: "scramble", len: n, d: n <= 4 ? 1 : n <= 6 ? 2 : 3, q: "", a: [w], clue };
  }));
})(window.Kit = window.Kit || {});
