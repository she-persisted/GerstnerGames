/**
 * @file content/questions/space.js
 * @about 17 space riddles (planets, stars, comets, rovers), each tagged easy (1), medium (2), or hard (3). Each has two clues: one for a sniff hint and one for a ponder hint.
 * @provides Kit.questions.banks.space
 * @requires kit/questions.js
 */
(function (Kit) {
  "use strict";
  // [id, difficulty, riddle, accepted answers, clue, second clue]
  Kit.questions.addBank("space", "space", "x-", [
    ["star", 1, "I twinkle in the night sky. I'm a giant ball of hot, glowing gas, and the Sun is one of me. What am I?", ["star"], "It rhymes with car.", "Twinkle, twinkle, little ____."],
    ["moon", 1, "I go around the Earth and change my shape, from a skinny smile to a big round circle. What am I?", ["moon"], "Astronauts walked on me in 1969.", "The cow jumped over the ____."],
    ["saturn", 1, "I'm a planet famous for my beautiful rings. What's my name?", ["saturn"], "I'm the sixth planet from the Sun.", "My name starts with SAT, just like Saturday!"],
    ["mars", 1, "People call me the Red Planet, and real robots drive around on me exploring. What's my name?", ["mars"], "I'm the fourth planet from the Sun.", "Four letters. It starts with M and ends with S."],
    ["sun", 1, "I'm the star in the middle of our solar system, and every planet goes around me. What am I?", ["sun"], "I come up every morning.", "It rhymes with fun!"],
    ["spacesuit", 1, "I'm what astronauts wear to stay safe and breathe outside their ship. What am I?", ["spacesuit", "space suit", "suit"], "I'm puffy and usually white.", "Two words: space and ____."],
    ["earth", 1, "I'm the blue planet, home to people, puppies, and penguins! What's my name?", ["earth"], "You live on me!", "I'm the third planet from the Sun."],
    ["comet", 2, "I'm a ball of ice and dust with a long, glowing tail, and I zoom around the Sun. What am I?", ["comet"], "It starts with C and has 5 letters.", "The famous one called Halley's comes back about every 76 years."],
    ["gravity", 2, "You can't see me, but I pull everything down so you don't float away. What am I?", ["gravity"], "I'm the reason apples fall from trees.", "It starts with GRAV."],
    ["jupiter", 2, "I'm the biggest planet, and I have a giant storm called the Great Red Spot. What's my name?", ["jupiter"], "I'm the fifth planet from the Sun.", "My name starts with J."],
    ["meteor", 2, "I'm a space rock that burns up in the sky and makes a streak of light. People call me a shooting star. What am I?", ["meteor", "shooting star", "meteorite"], "Make a wish when you see me!", "It starts with MET."],
    ["rover", 2, "I'm a robot car that drives around on Mars, taking pictures and studying rocks. What am I?", ["rover", "mars rover"], "I have six wheels.", "It rhymes with clover."],
    ["milkyway", 2, "I'm the galaxy we live in. I look like a long stripe of spilled milk across the night sky. What's my name?", ["milky way"], "Two words. The first one rhymes with silky.", "The ____ Way."],
    ["mercury", 3, "I'm the closest planet to the Sun, and I'm also the smallest. What's my name?", ["mercury"], "I'm the first planet.", "My name starts with M and has 7 letters."],
    ["orbit", 3, "I'm the path a planet takes as it goes around and around the Sun. What am I?", ["orbit"], "The Moon has one around Earth too.", "It starts with OR."],
    ["constellation", 3, "I'm a group of stars that makes a picture in the sky, like the Big Dipper. What am I?", ["constellation"], "Orion is a famous one.", "It starts with CON."],
    ["neptune", 3, "I'm the farthest planet from the Sun, and I'm a deep blue color. What's my name?", ["neptune"], "I'm the eighth planet.", "My name starts with NEP."]
  ]);
})(window.Kit = window.Kit || {});
