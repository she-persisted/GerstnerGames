/**
 * @file games/mini-game-survival/questions.js
 * @about Mini Game Survival's question library, so every replay is a little different: several versions of each mystery question, several ways to write each clue line T-Rexy types into his notebook (short, medium, and long), several ways to say each clue card's key science fact, and a pile of fun bonus facts for each portal. The game picks versions this computer hasn't seen lately (see pickVersion in state.js). The clue words themselves live in content/words/clue-words.js.
 * @requires nothing
 *
 * QBANK.mystery: the four mystery steps, in order. Each has clue (which notebook clue helps), nope (the hint after a wrong answer),
 *   and v: versions { q, opts, a } where a is the index of the right option. Every version of a step must test the same idea,
 *   because the reveal depends on all four.
 * QBANK.lines[portal]: three lists (typing level 1, 2, 3) of clue lines to type. Each says the same clue in different words.
 * QBANK.facts[portal]: ways to say the clue card's key science fact (this fact helps solve the mystery, so every version keeps it).
 * QBANK.bonus[portal]: fun extra facts, one shown on each clue card.
 * To add a version, add a row. Keep the reading level for grades 2 to 6 and keep every clue true to the story.
 */
const QBANK = {
  mystery: [
    { clue: "lantern", nope: "Hmm. What is always a dark shape with no eyes? Check clue 3.", v: [
      { q: "Why is Shadowspine completely black, with no eyeballs at all?", opts: ["He's wearing black pajamas.", "He's a shadow!", "He rolled in a tar pit."], a: 1 },
      { q: "Shadowspine has no eyes and no colors at all. What could he really be?", opts: ["A shadow!", "A robot with the lights off.", "A dinosaur who forgot to wash."], a: 0 },
      { q: "What is totally dark, has no eyeballs, and gets BIGGER when it's close to a light?", opts: ["A black hole.", "A sleepy bat.", "A shadow!"], a: 2 },
      { q: "Which clue explains why Shadowspine is all black?", opts: ["The teeny moth's GIANT shadow.", "The empty basket of fish.", "The 11:11 clock."], a: 0 }
    ] },
    { clue: "lantern", nope: "Remember the teeny moth by the lamp? Check clue 3.", v: [
      { q: "How can a shadow look GIGANTIC?", opts: ["Something stands really close to a bright light.", "It eats a LOT of snacks.", "It stands really far away from the light."], a: 0 },
      { q: "Remember the teeny moth by the lamp? Why was its shadow so HUGE?", opts: ["It was a secret giant moth.", "It was super close to the light.", "It ate too many space snacks."], a: 1 },
      { q: "You want to make a GIANT shadow puppet on the wall. Where should you hold your hand?", opts: ["Far away from the flashlight.", "Behind your back.", "Right next to the flashlight."], a: 2 },
      { q: "A teeny dinosaur wants her shadow to look ENORMOUS. What should she do?", opts: ["Stand really close to a bright lantern.", "Stand in the dark.", "Wear a really tall hat."], a: 0 }
    ] },
    { clue: "echo", nope: "Do small things make high sounds or low sounds? Check clue 1.", v: [
      { q: "The weird music was high and squeaky. So who played it?", opts: ["Someone gigantic.", "Someone small.", "A whale."], a: 1 },
      { q: "The weird music was high and squeaky. What does that tell you about whoever played it?", opts: ["They were probably small.", "They were probably huge.", "They were a great dancer."], a: 0 },
      { q: "A giant drum goes BOOM. A tiny music box goes ting-ting. Who probably played the squeaky bedtime music?", opts: ["Nobody. Music plays itself.", "Someone enormous.", "Someone tiny."], a: 2 },
      { q: "High sounds usually come from small things. Who probably played the squeaky music?", opts: ["A huge giant.", "Someone small.", "A thundercloud."], a: 1 }
    ] },
    { clue: "whirl", nope: "Which dinosaur loved fish, and how big was the one with the lantern? Check clues 2 and 4.", v: [
      { q: "Fish thief. Sail-shaped shadow. Tiny footprints. A star lantern. Who is behind all of this?", opts: ["A giant Spinosaurus.", "A tiny Spinosaurus with a star lantern.", "Grandma T-Rex."], a: 1 },
      { q: "Spinosaurus loved fish. Someone small held a star lantern. Put it together! Who is Shadowspine really?", opts: ["A tiny Spinosaurus holding a lantern.", "A giant fish.", "T-Rexy's little sister."], a: 0 },
      { q: "Who ate the fish, left tiny footprints, AND made a giant shadow with a star lantern?", opts: ["A hungry moth.", "A space squirrel.", "A teeny Spinosaurus."], a: 2 },
      { q: "Which suspect matches EVERY clue?", opts: ["A giant Spinosaurus with no lantern.", "A tiny Spinosaurus with a star lantern.", "A T-Rex who loves salad."], a: 1 }
    ] }
  ],

  lines: {
    echo: [
      ["high and squeaky", "a squeaky music box", "squeaky bedtime music"],
      ["The music was high and squeaky.", "A tiny music box played squeaky music.", "The weird song was very high."],
      ["The weird music was high and squeaky, like a tiny music box.", "Small things make high sounds, and the music was very squeaky.", "Someone played a high, squeaky song on a glowing music box."]
    ],
    fern: [
      ["the fish were gone", "a fish thief", "no more fish"],
      ["Somebody ate all of our fish.", "Our basket of fish was empty.", "A little tail sneaked out with the fish."],
      ["Somebody sneaked into our house and ate all of our fish.", "A sneaky someone with a teal tail ate our whole basket of fish.", "Spinosaurus mostly ate fish, and all of our fish were gone."]
    ],
    lantern: [
      ["tiny footprints", "a teeny moth", "a giant shadow"],
      ["Tiny footprints were on my window.", "A teeny moth made a huge shadow.", "Three-toed footprints were on the sill."],
      ["Tiny footprints were on my windowsill, right by the lamp.", "The closer something is to a light, the bigger its shadow gets.", "A teeny moth near my lamp made a giant shadow on the wall."]
    ],
    whirl: [
      ["a star lantern", "someone small", "a glowing light"],
      ["Someone small had a star lantern.", "A tiny someone held a glowing light.", "Someone stood on a floating rock."],
      ["Someone very small was holding a glowing star lantern.", "On a floating rock, someone tiny held up a bright star lantern.", "A little someone with a star lantern watched me spin away."]
    ]
  },

  facts: {
    echo: [
      "Science fact: small things make high sounds. Big things make low, booming sounds.",
      "Science fact: a mouse squeaks and an elephant rumbles. Smaller bodies make higher sounds!",
      "Science fact: sound is shaking air. Tiny things shake super fast and sound high. Big things shake slowly and sound low.",
      "Science fact: a little guitar string sounds high, and a big fat one sounds low. Small means high!"
    ],
    fern: [
      "Science fact: real T-Rexes ate meat. My family eats plants AND meat, so we're omnivores. And Spinosaurus? It mostly ate fish!",
      "Science fact: Spinosaurus had a long, skinny snout like a crocodile, perfect for snapping up fish!",
      "Science fact: omnivores eat plants and meat, like bears, raccoons, and people. Spinosaurus was a fish-lover!",
      "Science fact: Spinosaurus probably spent lots of time in rivers, hunting for fish. Fish were its favorite food!"
    ],
    lantern: [
      "Science fact: the closer something is to a light, the bigger its shadow gets.",
      "Science fact: move your hand closer to a flashlight, and its shadow on the wall grows GIANT!",
      "Science fact: a shadow is where something blocks the light. Stand close to the light and you block a lot, so your shadow is huge.",
      "Science fact: a tiny bug right next to a lamp can make a shadow bigger than a person!"
    ],
    whirl: [
      "Science fact: a spiral galaxy is a giant pinwheel of billions of stars. Our home galaxy, the Milky Way, is one!",
      "Science fact: the Whirlpool Galaxy is a real spiral galaxy, and it has a little buddy galaxy tugging on one arm.",
      "Science fact: galaxies spin, but super slowly. Our Milky Way takes about 230 million years to turn around once!",
      "Science fact: spiral galaxies have arms full of new stars, and a bright, crowded middle."
    ]
  },

  bonus: {
    echo: [
      "Fun fact: sound travels about one mile in five seconds. Count after lightning to see how far away a storm is!",
      "Fun fact: space is totally silent, because there's no air for sound to travel through.",
      "Fun fact: bats find bugs in the dark by listening to their own echoes.",
      "Fun fact: some scientists think dinosaurs boomed and hooted with their mouths closed, like birds do.",
      "Fun fact: a blue whale's call is one of the loudest sounds any animal makes.",
      "Fun fact: an echo is just your sound bouncing back off a wall or a cliff."
    ],
    fern: [
      "Fun fact: ferns were around even before the dinosaurs, and they're still growing today!",
      "Fun fact: Spinosaurus was even longer than T-Rex, about as long as a school bus.",
      "Fun fact: birds are living dinosaurs. A chicken is a T-Rex's distant cousin!",
      "Fun fact: some dinosaurs swallowed stones to help mash up the plants in their tummies.",
      "Fun fact: a T-Rex tooth could be as long as a banana.",
      "Fun fact: scientists learn what dinosaurs ate by studying fossil teeth and fossil poop!"
    ],
    lantern: [
      "Fun fact: light from the sun takes about eight minutes to reach Earth.",
      "Fun fact: fireflies make their own light, and they don't even get hot.",
      "Fun fact: your shadow is shortest at noon, when the sun is high in the sky.",
      "Fun fact: some stars are so big and bright, they shine a million times brighter than our sun.",
      "Fun fact: moths fly toward lamps, but scientists still aren't totally sure why!",
      "Fun fact: white light is really every color of the rainbow mixed together."
    ],
    whirl: [
      "Fun fact: the Andromeda Galaxy is so big and bright, you can see it without a telescope on a dark night.",
      "Fun fact: there may be more stars in the universe than grains of sand on every beach on Earth.",
      "Fun fact: the Webb Space Telescope sees heat, so it can peek through dust clouds where baby stars are born.",
      "Fun fact: the Pillars of Creation are giant towers of gas and dust where new stars are forming.",
      "Fun fact: a day on Venus is longer than a year on Venus!",
      "Fun fact: astronauts grow a little taller in space, because gravity isn't squishing their backs."
    ]
  }
};
