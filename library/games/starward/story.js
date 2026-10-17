/**
 * @file games/starward/story.js
 * @about Starward's story, in order: every line, every world change, every friend, puzzle, flight, and song. To change the story, edit this list. Step types: world, say, appear, join, explore, build, puzzle, song, fly, flame, end.
 * @requires games/starward/state.js
 *
 * say:    { who: narrator | robot | dog | peng | rock | flame, x: text or (names) => text, face?: happy | surprised | think }
 * puzzle: { set: nimbus | glacia | meridian | corona, n: 0 to 2 }   question kinds come from makePlan() in state.js
 * fly:    { to: place name, leg: f1 to f5 (see LEGS in state.js) } or { vow: true } for the brave words
 */
const STEPS = [
  { t: "world", w: "lumina" },
  { t: "say", who: "narrator", x: "Far out in space is a little world called Lumina. The Everlight at its center kept it warm and glowing." },
  { t: "say", who: "narrator", x: "Then a starstorm blew the Everlight out. Lumina went dark, and everyone fell fast asleep." },
  { t: "say", who: "narrator", x: s => `Everyone except ${s.robot}, the Keeper. One tiny spark of the Everlight still glows in his chest.` },
  { t: "say", who: "robot", x: "It's so dark. I used to love it here, but now everything feels a little scary." },
  { t: "say", who: "robot", face: "surprised", x: "Wait! A piece of the Everlight still burns far away, in the Corona Nebula!" },
  { t: "say", who: "robot", x: "But the starstorm scattered my ship's parts all over Lumina." },
  { t: "explore" },
  { t: "say", who: "robot", face: "happy", x: "All four parts! Let's build my ship." },
  { t: "build" },
  { t: "fly", to: "Planet Nimbus", leg: "f1" },

  { t: "world", w: "nimbus" },
  { t: "say", who: "narrator", x: "Planet Nimbus! The ground is squishy like cotton candy." },
  { t: "say", who: "robot", x: "A big stone blocks the path. It says SOLVE MY PUZZLES. Gulp." },
  { t: "puzzle", set: "nimbus", n: 0 },
  { t: "appear", who: "dog" },
  { t: "say", who: "narrator", x: "Something fluffy tumbles out of a cloud and lands with a bounce." },
  { t: "say", who: "robot", face: "surprised", x: "Oh! We found a puppy!" },
  { t: "say", who: "dog", x: "Woof! Woof woof! (I'm Sunny! My magic nose can sniff out clues. Tap me when you're stuck!)" },
  { t: "join", who: "dog" },
  { t: "puzzle", set: "nimbus", n: 1 },
  { t: "puzzle", set: "nimbus", n: 2 },
  { t: "say", who: "robot", face: "happy", x: "Sunny, will you come with me to find the Everlight?" },
  { t: "say", who: "dog", x: "Woof! (Yes! Let's go!)" },
  { t: "song", id: "nimbus" },
  { t: "fly", to: "Planet Glacia", leg: "f2" },

  { t: "world", w: "glacia" },
  { t: "say", who: "narrator", x: "Planet Glacia is made of ice. VERY slippery ice." },
  { t: "say", who: "robot", face: "surprised", x: "Whoa! WHOAAA! Being this tall on ice is a terrible idea!" },
  { t: "appear", who: "peng" },
  { t: "say", who: "peng", x: "Hi! I'm Rigel! The ice cave's magic words froze all jumbled up. Can you fix them?" },
  { t: "puzzle", set: "glacia", n: 0 },
  { t: "puzzle", set: "glacia", n: 1 },
  { t: "puzzle", set: "glacia", n: 2 },
  { t: "say", who: "peng", x: "The cave is open! Can I come too? Please, please, please?" },
  { t: "join", who: "peng" },
  { t: "say", who: "robot", face: "happy", x: "Of course! The more friends I have, the braver I feel." },
  { t: "song", id: "glacia" },
  { t: "fly", to: "Planet Meridian", leg: "f3" },

  { t: "world", w: "meridian" },
  { t: "say", who: "narrator", x: "Planet Meridian is covered in carved stones. A mossy rock with tiny glasses opens his sleepy eyes." },
  { t: "appear", who: "rock" },
  { t: "say", who: "rock", x: "Hmmmm. Visitors! I am Professor Kepler. I have watched a little blue planet called Earth for a thousand years." },
  { t: "say", who: "rock", x: "Answer my questions, and I will show you the way to the Corona Nebula." },
  { t: "puzzle", set: "meridian", n: 0 },
  { t: "puzzle", set: "meridian", n: 1 },
  { t: "puzzle", set: "meridian", n: 2 },
  { t: "say", who: "rock", x: "Splendid! May I roll along with you?" },
  { t: "join", who: "rock" },
  { t: "song", id: "meridian" },
  { t: "fly", to: "the Corona Nebula", leg: "f4" },

  { t: "world", w: "corona" },
  { t: "say", who: "narrator", x: "The Corona Nebula blazes gold and orange. At the top of the tower glows a piece of the Everlight." },
  { t: "say", who: "robot", x: "That tower is so high. What if I can't do it?" },
  { t: "say", who: "dog", x: "Woof! (You can!)" },
  { t: "say", who: "peng", x: "We're right here!" },
  { t: "say", who: "rock", x: "One step at a time, my tall friend." },
  { t: "puzzle", set: "corona", n: 0 },
  { t: "puzzle", set: "corona", n: 1 },
  { t: "puzzle", set: "corona", n: 2 },
  { t: "song", id: "corona" },
  { t: "say", who: "flame", x: "Keeper, you came all this way, even though you were scared. That is the bravest thing there is." },
  { t: "fly", vow: true },
  { t: "flame" },
  { t: "say", who: "narrator", x: s => `The Everlight floats into ${s.robot}'s chest. The tiny spark bursts into a warm, bright glow.` },
  { t: "say", who: "robot", face: "happy", x: "I feel like myself again! Let's go home!" },
  { t: "fly", to: "home to Lumina", leg: "f5" },

  { t: "world", w: "luminaLit" },
  { t: "say", who: "narrator", x: "Golden light pours across Lumina. Trees glow, windows light up, and everyone wakes up." },
  { t: "song", id: "reborn" },
  { t: "say", who: "narrator", face: "happy", x: s => `${s.robot} is home, the Everlight is shining, and his friends are right beside him.` },
  { t: "end" }
];
