/**
 * @file games/mini-game-survival/questions.js
 * @about Mini Game Survival's question library, so every game is different: eight versions of each mystery question, several ways to tell what T-Rexy saw in each memory, six ways to write each clue line T-Rexy types into his notebook (short, medium, and long), eight ways to say each clue card's key science fact, and fourteen fun bonus facts for each portal. The game deals versions like a shuffled deck kept on this computer, so nothing repeats until every version has come up (see deal and pickVersion in state.js). The clue words themselves live in content/words/clue-words.js.
 * @requires nothing
 *
 * QBANK.mystery: the four mystery steps, in order. Each has clue (which notebook clue helps), nope (the hint after a wrong answer),
 *   and v: versions { q, opts, a } where a is the index of the right option. Every version of a step must test the same idea,
 *   because the reveal depends on all four. Never name Nova here: the player doesn't meet her until after the mystery.
 * QBANK.saw[portal]: ways to tell what T-Rexy saw in that portal's memory (the top of the clue card). Every version keeps the clue.
 * QBANK.lines[portal]: three lists (typing level 1, 2, 3) of clue lines to type. Each says the same clue in different words.
 * QBANK.facts[portal]: ways to say the clue card's key science fact (this fact helps solve the mystery, so every version keeps it).
 * QBANK.bonus[portal]: fun extra facts, one shown on each clue card.
 * To add a version, add a row. Keep the reading level for grades 2 to 6, keep every clue true to the story, and keep every fact true.
 */
const QBANK = {
  mystery: [
    { clue: "lantern", nope: "Hmm. What is always a dark shape with no eyes? Check clue 3.", v: [
      { q: "Why is Shadowspine completely black, with no eyeballs at all?", opts: ["He's wearing black pajamas.", "He's a shadow!", "He rolled in a tar pit."], a: 1 },
      { q: "Shadowspine has no eyes and no colors at all. What could he really be?", opts: ["A shadow!", "A robot with the lights off.", "A dinosaur who forgot to wash."], a: 0 },
      { q: "What is totally dark, has no eyeballs, and gets BIGGER when it's close to a light?", opts: ["A black hole.", "A sleepy bat.", "A shadow!"], a: 2 },
      { q: "Which clue explains why Shadowspine is all black?", opts: ["The teeny moth's GIANT shadow.", "The empty basket of fish.", "The 11:11 clock."], a: 0 },
      { q: "What has NO eyes, NO colors, and copies the shape of whatever makes it?", opts: ["A shadow!", "A pirate with an eye patch.", "A very tired raccoon."], a: 0 },
      { q: "T-Rexy saw no eyes, no teeth, and no colors on Shadowspine. Just black. Why?", opts: ["Shadowspine is shy.", "The crash pad lights are broken.", "Shadowspine is really a shadow!"], a: 2 },
      { q: "Your shadow copies your shape, but it has no colors and no eyes. Who else looks like that?", opts: ["A rainbow.", "Shadowspine!", "T-Rexy's little sister."], a: 1 },
      { q: "Shadowspine is as big as a mountain, but totally black with no eyes. What's the sneakiest explanation?", opts: ["He's made of chocolate.", "He's wearing a giant sock.", "He's really just a shadow!"], a: 2 }
    ] },
    { clue: "lantern", nope: "Remember the teeny moth by the lamp? Check clue 3.", v: [
      { q: "How can a shadow look GIGANTIC?", opts: ["Something stands really close to a bright light.", "It eats a LOT of snacks.", "It stands really far away from the light."], a: 0 },
      { q: "Remember the teeny moth by the lamp? Why was its shadow so HUGE?", opts: ["It was a secret giant moth.", "It was super close to the light.", "It ate too many space snacks."], a: 1 },
      { q: "You want to make a GIANT shadow puppet on the wall. Where should you hold your hand?", opts: ["Far away from the flashlight.", "Behind your back.", "Right next to the flashlight."], a: 2 },
      { q: "A teeny dinosaur wants her shadow to look ENORMOUS. What should she do?", opts: ["Stand really close to a bright lantern.", "Stand in the dark.", "Wear a really tall hat."], a: 0 },
      { q: "A tiny mouse stands right in front of a bright flashlight. What happens to its shadow on the wall?", opts: ["It disappears.", "It gets HUGE!", "It turns purple."], a: 1 },
      { q: "Which way makes the BIGGEST shadow on the wall?", opts: ["Something tiny, far from the light.", "Something tiny, with the light turned off.", "Something tiny, right next to the light."], a: 2 },
      { q: "You stand between a lamp and a wall. You step closer to the lamp. What happens to your shadow on the wall?", opts: ["It gets bigger.", "It gets smaller.", "It stays exactly the same."], a: 0 },
      { q: "Shadowspine's shadow is gigantic. What's the trick for making a shadow that big?", opts: ["Stand far, far away from the light.", "Stand super close to a bright light.", "Stand on one foot."], a: 1 }
    ] },
    { clue: "echo", nope: "Do small things make high sounds or low sounds? Check clue 1.", v: [
      { q: "The weird music was high and squeaky. So who played it?", opts: ["Someone gigantic.", "Someone small.", "A whale."], a: 1 },
      { q: "The weird music was high and squeaky. What does that tell you about whoever played it?", opts: ["They were probably small.", "They were probably huge.", "They were a great dancer."], a: 0 },
      { q: "A giant drum goes BOOM. A tiny music box goes ting-ting. Who probably played the squeaky bedtime music?", opts: ["Nobody. Music plays itself.", "Someone enormous.", "Someone tiny."], a: 2 },
      { q: "High sounds usually come from small things. Who probably played the squeaky music?", opts: ["A huge giant.", "Someone small.", "A thundercloud."], a: 1 },
      { q: "A big tuba plays low notes. A little whistle plays high notes. The weird music was high and squeaky. Was the music maker big or small?", opts: ["Small!", "Big!", "Medium, wearing a big hat."], a: 0 },
      { q: "The weird music sounded like a mouse, not an elephant. So whoever played it was probably...", opts: ["Gigantic!", "Invisible!", "Tiny!"], a: 2 },
      { q: "Little bells ring high. Big bells ring low. The bedtime music was high and squeaky. Who played it?", opts: ["Someone the size of a mountain.", "Someone small.", "A big, booming drum band."], a: 1 },
      { q: "If a GIANT had played the bedtime music, how would it probably sound?", opts: ["Low and booming.", "High and squeaky.", "Like a kazoo."], a: 0 }
    ] },
    { clue: "whirl", nope: "Which dinosaur loved fish, and how big was the one with the lantern? Check clues 2 and 4.", v: [
      { q: "Fish thief. Sail-shaped shadow. Tiny footprints. A star lantern. Who is behind all of this?", opts: ["A giant Spinosaurus.", "A tiny Spinosaurus with a star lantern.", "Grandma T-Rex."], a: 1 },
      { q: "Spinosaurus loved fish. Someone small held a star lantern. Put it together! Who is Shadowspine really?", opts: ["A tiny Spinosaurus holding a lantern.", "A giant fish.", "T-Rexy's little sister."], a: 0 },
      { q: "Who ate the fish, left tiny footprints, AND made a giant shadow with a star lantern?", opts: ["A hungry moth.", "A space squirrel.", "A teeny Spinosaurus."], a: 2 },
      { q: "Which suspect matches EVERY clue?", opts: ["A giant Spinosaurus with no lantern.", "A tiny Spinosaurus with a star lantern.", "A T-Rex who loves salad."], a: 1 },
      { q: "Detective time! The shadow has a Spinosaurus sail, the fish are gone, and the footprints are tiny. Who did it?", opts: ["A tiny Spinosaurus with a star lantern.", "A giant T-Rex with a flashlight.", "A fish with very small feet."], a: 0 },
      { q: "Which suspect could make a GIANT sail-shaped shadow but leave TINY footprints?", opts: ["A giant Spinosaurus.", "A teeny moth.", "A tiny Spinosaurus standing close to a lantern."], a: 2 },
      { q: "Shadowspine is really someone small, holding a star lantern. What kind of dinosaur is that someone?", opts: ["A T-Rex, like T-Rexy.", "A Spinosaurus, the fish-lover!", "A Stegosaurus with a snack."], a: 1 },
      { q: "Suspects: a giant Spinosaurus, a tiny Spinosaurus with a star lantern, or a T-Rex who can't stand fish. Who matches EVERY clue?", opts: ["The giant Spinosaurus.", "The T-Rex who can't stand fish.", "The tiny Spinosaurus with a star lantern."], a: 2 }
    ] }
  ],

  saw: {
    echo: [
      "In my memory, the weird music was high and squeaky, like a teeny music box glowing on the hill.",
      "In my memory, a little glowing box sat on the hill, playing music so high and squeaky it made my teeth tingle.",
      "My memory showed the night of the music. It was super high and squeaky, and it came from a tiny glowing box on the hill.",
      "That night, a teeny glowing music box on the hill played the squeakiest, highest song I ever heard. Squeak-a-doodle-doo!"
    ],
    fern: [
      "The morning after that dinner, our whole basket of fish was gone. Somebody sneaked in and ate them!",
      "After dinner, a little tail sneaked out the door. By morning, our basket of fish was totally empty!",
      "Our family dinner looked yummy. But the next morning? Not one fish left in the basket. Somebody sneaky ate them all!",
      "I remember a little tail by our fish basket. The next morning, every single fish was gone. Fishy business!"
    ],
    lantern: [
      "Teeny-tiny footprints on my windowsill. And a teeny moth by my lamp made a HUGE shadow on the wall.",
      "My bedroom at 11:11: teeny footprints on the windowsill, and a teeny moth by the lamp making a GIGANTIC shadow.",
      "Someone with super tiny feet walked across my windowsill. And when a teeny moth flew close to my lamp, its shadow looked like a monster!",
      "On my windowsill: footprints smaller than a cookie. On my wall: a teeny moth's shadow, as big as a door, because it sat right by my lamp."
    ],
    whirl: [
      "In the swirl, someone small was standing on a floating rock, holding a glowing star lantern.",
      "As I spun away from home, I spotted someone small on a floating rock, holding a glowing star lantern.",
      "The swoop! Down on a floating rock, a little someone held up a bright star lantern and watched me whirl past.",
      "While I was spinning like a sock in the dryer, I saw someone small on a floating rock. They had a glowing star lantern."
    ]
  },

  lines: {
    echo: [
      ["high and squeaky", "a squeaky music box", "squeaky bedtime music", "a high little song", "music on the hill", "squeaky and high"],
      ["The music was high and squeaky.", "A tiny music box played squeaky music.", "The weird song was very high.",
        "The music box was tiny and glowing.", "High sounds come from small things.", "Somebody played music at bedtime."],
      ["The weird music was high and squeaky, like a tiny music box.", "Small things make high sounds, and the music was very squeaky.", "Someone played a high, squeaky song on a glowing music box.",
        "A glowing music box on the hill played a high, squeaky song.", "Big things make low sounds, so the music maker must be small.", "At bedtime, a squeaky little song floated over Fern Valley."]
    ],
    fern: [
      ["the fish were gone", "a fish thief", "no more fish", "an empty basket", "fish for dinner", "a sneaky tail"],
      ["Somebody ate all of our fish.", "Our basket of fish was empty.", "A little tail sneaked out with the fish.",
        "Spinosaurus loved to eat fish.", "The fish basket was totally empty.", "Someone sneaked away with our fish."],
      ["Somebody sneaked into our house and ate all of our fish.", "A sneaky someone with a teal tail ate our whole basket of fish.", "Spinosaurus mostly ate fish, and all of our fish were gone.",
        "A little tail sneaked out the door, right next to our basket of fish.", "We eat plants and meat, but somebody else really loves fish.", "The next morning, every single fish in our basket was gone."]
    ],
    lantern: [
      ["tiny footprints", "a teeny moth", "a giant shadow", "a bright lamp", "my windowsill", "three tiny toes"],
      ["Tiny footprints were on my window.", "A teeny moth made a huge shadow.", "Three-toed footprints were on the sill.",
        "My lamp made the moth look giant.", "Teeny footprints were by my lamp.", "Close to the light means a big shadow."],
      ["Tiny footprints were on my windowsill, right by the lamp.", "The closer something is to a light, the bigger its shadow gets.", "A teeny moth near my lamp made a giant shadow on the wall.",
        "The teeny moth was so close to my lamp that its shadow looked enormous.", "Someone with very tiny feet walked across my windowsill at 11:11.", "A small thing near a bright light can make a gigantic shadow."]
    ],
    whirl: [
      ["a star lantern", "someone small", "a glowing light", "a floating rock", "a little someone", "a bright star light"],
      ["Someone small had a star lantern.", "A tiny someone held a glowing light.", "Someone stood on a floating rock.",
        "A star lantern glowed on a rock.", "Someone small watched me spin away.", "The swirl took me far from home."],
      ["Someone very small was holding a glowing star lantern.", "On a floating rock, someone tiny held up a bright star lantern.", "A little someone with a star lantern watched me spin away.",
        "While I spun away from home, someone tiny held a glowing star lantern.", "A small someone stood on a floating rock in the swirly galaxy.", "The star lantern was bright, and the one holding it was very small."]
    ]
  },

  facts: {
    echo: [
      "Science fact: small things make high sounds. Big things make low, booming sounds.",
      "Science fact: a mouse squeaks and an elephant rumbles. Smaller bodies make higher sounds!",
      "Science fact: sound is shaking air. Tiny things shake super fast and sound high. Big things shake slowly and sound low.",
      "Science fact: a little guitar string sounds high, and a big fat one sounds low. Small means high!",
      "Science fact: a tiny hummingbird chirps high, and a giant elephant rumbles so low you can barely hear it. Small means high!",
      "Science fact: on a xylophone, the short bars ring high and the long bars ring low. Smaller makes higher!",
      "Science fact: a little bell goes ting, and a giant bell goes BONG. Small things make higher sounds.",
      "Science fact: a kitten's mew is high, and a lion's roar is low. Bigger animals usually make lower sounds."
    ],
    fern: [
      "Science fact: real T-Rexes ate meat. My family eats plants AND meat, so we're omnivores. And Spinosaurus? It mostly ate fish!",
      "Science fact: Spinosaurus had a long, skinny snout like a crocodile, perfect for snapping up fish!",
      "Science fact: omnivores eat plants and meat, like bears, raccoons, and people. Spinosaurus was a fish-lover!",
      "Science fact: Spinosaurus probably spent lots of time in rivers, hunting for fish. Fish were its favorite food!",
      "Science fact: Spinosaurus had cone-shaped teeth, great for gripping slippery fish.",
      "Science fact: scientists found fish scales in the tummy of a fossil Spinosaurus cousin. Spino's family loved fish!",
      "Science fact: Spinosaurus had its nostrils far back on its long snout, so it could dunk its face in the river to catch fish.",
      "Science fact: an animal that eats mostly fish is called a piscivore. Spinosaurus was a giant piscivore!"
    ],
    lantern: [
      "Science fact: the closer something is to a light, the bigger its shadow gets.",
      "Science fact: move your hand closer to a flashlight, and its shadow on the wall grows GIANT!",
      "Science fact: a shadow is where something blocks the light. Stand close to the light and you block a lot, so your shadow is huge.",
      "Science fact: a tiny bug right next to a lamp can make a shadow bigger than a person!",
      "Science fact: shadow puppets work because your hands block the light. Move them closer to the lamp, and the puppet grows!",
      "Science fact: light travels in straight lines. Something close to the light blocks a wider fan of it, so its shadow is bigger.",
      "Science fact: a teeny spider right by a flashlight can make a monster-sized shadow on the wall!",
      "Science fact: stand between a lamp and a wall. Step toward the lamp, and your shadow on the wall grows!"
    ],
    whirl: [
      "Science fact: a spiral galaxy is a giant pinwheel of billions of stars. Our home galaxy, the Milky Way, is one!",
      "Science fact: the Whirlpool Galaxy is a real spiral galaxy, and it has a little buddy galaxy tugging on one arm.",
      "Science fact: galaxies spin, but super slowly. Our Milky Way takes about 230 million years to turn around once!",
      "Science fact: spiral galaxies have arms full of new stars, and a bright, crowded middle.",
      "Science fact: right in the middle of the Milky Way is a giant black hole. Scientists call it Sagittarius A-star.",
      "Science fact: our sun lives out in one of the Milky Way's arms, far from the crowded middle.",
      "Science fact: the Whirlpool Galaxy is so far away that the light we see from it left millions of years before there were any people!",
      "Science fact: lots of spiral galaxies have a long bar of stars across the middle. The Milky Way has one too!"
    ]
  },

  bonus: {
    echo: [
      "Fun fact: sound travels about one mile in five seconds. Count after lightning to see how far away a storm is!",
      "Fun fact: space is totally silent, because there's no air for sound to travel through.",
      "Fun fact: bats find bugs in the dark by listening to their own echoes.",
      "Fun fact: some scientists think dinosaurs boomed and hooted with their mouths closed, like birds do.",
      "Fun fact: a blue whale's call is one of the loudest sounds any animal makes.",
      "Fun fact: an echo is just your sound bouncing back off a wall or a cliff.",
      "Fun fact: sound moves about four times faster through water than through air.",
      "Fun fact: crickets chirp faster when it's warm and slower when it's cold.",
      "Fun fact: dogs can hear high sounds that people can't hear at all.",
      "Fun fact: your voice sounds different in a recording, because you usually hear it through the bones of your head too.",
      "Fun fact: hold a seashell to your ear and you hear an \"ocean.\" It's really the sounds around you, bouncing inside the shell.",
      "Fun fact: a sonic boom happens when a jet flies faster than sound.",
      "Fun fact: elephants can talk to each other with rumbles so low that people can't hear them.",
      "Fun fact: the dinosaur Parasaurolophus may have honked through a long hollow crest on its head, like a trombone."
    ],
    fern: [
      "Fun fact: ferns were around even before the dinosaurs, and they're still growing today!",
      "Fun fact: Spinosaurus was even longer than T-Rex, about as long as a school bus.",
      "Fun fact: birds are living dinosaurs. A chicken is a T-Rex's distant cousin!",
      "Fun fact: some dinosaurs swallowed stones to help mash up the plants in their tummies.",
      "Fun fact: a T-Rex tooth could be as long as a banana.",
      "Fun fact: scientists learn what dinosaurs ate by studying fossil teeth and fossil poop!",
      "Fun fact: some plant-eating dinosaurs had hundreds of teeth, and grew new ones when old ones wore out.",
      "Fun fact: the word dinosaur means \"terrible lizard,\" but dinosaurs weren't really lizards at all.",
      "Fun fact: Spinosaurus had a sail on its back made of super-long spines, some almost as tall as a grown-up.",
      "Fun fact: Spinosaurus fossils were found in the Sahara Desert, which was full of rivers back then.",
      "Fun fact: crocodiles lived alongside the dinosaurs, and they're still around today!",
      "Fun fact: pandas are omnivores, but they eat almost nothing except bamboo.",
      "Fun fact: T-Rex had one of the strongest bites of any land animal ever.",
      "Fun fact: the biggest dinosaurs of all, like Argentinosaurus, ate only plants."
    ],
    lantern: [
      "Fun fact: light from the sun takes about eight minutes to reach Earth.",
      "Fun fact: fireflies make their own light, and they don't even get hot.",
      "Fun fact: your shadow is shortest around noon, when the sun is high in the sky.",
      "Fun fact: some stars are so big and bright, they shine a million times brighter than our sun.",
      "Fun fact: moths fly toward lamps, but scientists still aren't totally sure why!",
      "Fun fact: white light is really every color of the rainbow mixed together.",
      "Fun fact: light is the fastest thing there is. It could zip around Earth about seven times in one second!",
      "Fun fact: a rainbow happens when sunlight bends through raindrops and splits into colors.",
      "Fun fact: some deep-sea fish make their own light, like a built-in flashlight.",
      "Fun fact: the moon doesn't make its own light. It shines by bouncing back sunlight.",
      "Fun fact: your shadow is longest early in the morning and late in the afternoon, when the sun is low.",
      "Fun fact: cats' eyes glow in the dark because a shiny layer at the back of each eye bounces light back out.",
      "Fun fact: a lightning bolt is hotter than the surface of the sun.",
      "Fun fact: plants use sunlight to make their own food."
    ],
    whirl: [
      "Fun fact: the Andromeda Galaxy is so big and bright, you can see it without a telescope on a dark night.",
      "Fun fact: there may be more stars in the universe than grains of sand on every beach on Earth.",
      "Fun fact: the Webb Space Telescope sees heat, so it can peek through dust clouds where baby stars are born.",
      "Fun fact: the Pillars of Creation are giant towers of gas and dust where new stars are forming.",
      "Fun fact: a day on Venus is longer than a year on Venus!",
      "Fun fact: astronauts grow a little taller in space, because gravity isn't squishing their backs.",
      "Fun fact: Jupiter is so big that more than 1,000 Earths could fit inside it.",
      "Fun fact: Saturn is so light for its size that it would float, if you could find a bathtub big enough!",
      "Fun fact: footprints on the moon can last for millions of years, because there's no wind to blow them away.",
      "Fun fact: the Milky Way and the Andromeda Galaxy are slowly moving toward each other.",
      "Fun fact: a year on Mercury is only 88 Earth days long.",
      "Fun fact: Olympus Mons on Mars is the tallest volcano in the solar system, more than twice as tall as Mount Everest.",
      "Fun fact: the sun is so big that about a million Earths could fit inside it.",
      "Fun fact: the International Space Station zooms all the way around Earth about 16 times every day."
    ]
  }
};
