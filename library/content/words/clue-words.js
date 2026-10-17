/**
 * @file content/words/clue-words.js
 * @about Science words with kid-friendly hints for word-guessing games, in four topics: sound and music, food and dinosaurs, light and shadows, and space. Each word is tagged easy (1), medium (2), or hard (3).
 * @provides Kit.words.clues { sound, food, light, space } each a list of [WORD, difficulty, hint]
 * @requires nothing
 *
 * Easy words are 4 or 5 letters, medium 5 to 7, hard 6 to 11. Hints never use the word itself. No word appears in two topics,
 * so one game never asks the same word twice.
 */
(function (Kit) {
  "use strict";
  (Kit.words = Kit.words || {}).clues = {
    sound: [
      ["ECHO", 1, "A sound that bounces back to you."],
      ["BEAT", 1, "The steady boom, boom, boom in a song."],
      ["DRUM", 1, "You hit it with sticks to keep the beat."],
      ["BELL", 1, "It rings: ding, dong!"],
      ["LOUD", 1, "The opposite of quiet."],
      ["SONG", 1, "Music with words you can sing."],
      ["PITCH", 2, "How high or how low a sound is."],
      ["MUSIC", 2, "Songs and tunes are all this."],
      ["SQUEAK", 2, "A tiny, high sound, like a mouse makes."],
      ["VOLUME", 2, "How loud or quiet a sound is."],
      ["WHISTLE", 2, "Blow through your lips to make this high sound."],
      ["SPEAKER", 2, "It makes music come out of a radio."],
      ["VIBRATE", 3, "To shake back and forth super fast. Every sound is made this way!"],
      ["MELODY", 3, "The part of a song you can hum."],
      ["RHYTHM", 3, "The pattern of beats in music."],
      ["HEARING", 3, "One of your five senses. You do it with your ears!"],
      ["INSTRUMENT", 3, "Anything you play to make music, like a piano or a flute."],
      ["ORCHESTRA", 3, "A big group of musicians playing together."]
    ],
    food: [
      ["FERN", 1, "A leafy plant that grew in dinosaur times."],
      ["FISH", 1, "It swims, and it has fins and gills."],
      ["EGGS", 1, "Baby dinosaurs hatched out of these."],
      ["BONE", 1, "Dinosaur skeletons are made of these."],
      ["TAIL", 1, "Dinosaurs had a long one behind them."],
      ["MEAT", 1, "Food that comes from animals."],
      ["SALAD", 2, "A bowl of leafy greens and veggies."],
      ["PLANTS", 2, "Ferns, trees, and flowers are all these."],
      ["FOSSIL", 2, "A dinosaur bone or footprint that turned to stone."],
      ["CLAWS", 2, "Sharp, pointy nails on a dinosaur's feet."],
      ["TEETH", 2, "You brush these twice a day."],
      ["BERRIES", 2, "Small, juicy fruits that grow on bushes."],
      ["OMNIVORE", 3, "An animal that eats plants AND meat."],
      ["HERBIVORE", 3, "An animal that eats only plants."],
      ["CARNIVORE", 3, "An animal that eats only meat."],
      ["DINOSAUR", 3, "A reptile that lived millions of years ago."],
      ["EXTINCT", 3, "When a kind of animal is gone forever."],
      ["PREDATOR", 3, "An animal that hunts other animals for food."]
    ],
    light: [
      ["LAMP", 1, "It lights up your room at night."],
      ["GLOW", 1, "To shine with a soft light."],
      ["BEAM", 1, "A long line of light, like from a flashlight."],
      ["DARK", 1, "What it is when there's no light at all."],
      ["FIRE", 1, "It's hot and bright, and you can roast marshmallows over it."],
      ["SHINE", 1, "What the sun does all day."],
      ["SHADOW", 2, "A dark shape made when something blocks light."],
      ["LIGHT", 2, "It travels super fast. Nothing in the universe is faster!"],
      ["BRIGHT", 2, "Full of light. The opposite of dim."],
      ["MIRROR", 2, "It bounces light back so you can see yourself."],
      ["PRISM", 2, "A clear shape that splits light into a rainbow."],
      ["CANDLE", 2, "A stick of wax with a little flame on top."],
      ["LANTERN", 3, "A light you carry by its handle."],
      ["REFLECT", 3, "What light does when it bounces off something shiny."],
      ["SUNLIGHT", 3, "Light that comes from our closest star."],
      ["RAINBOW", 3, "Seven colors of light in the sky after the rain."],
      ["FLASHLIGHT", 3, "A light you hold in your hand, with batteries inside."],
      ["TRANSPARENT", 3, "You can see right through it, like a window."]
    ],
    space: [
      ["STAR", 1, "Our sun is one of these."],
      ["MOON", 1, "It goes all the way around Earth about once a month."],
      ["MARS", 1, "The red planet."],
      ["COMET", 1, "An icy space rock with a glowing tail."],
      ["GALAXY", 2, "A gigantic group of billions of stars, like the Milky Way."],
      ["ORBIT", 2, "The path a planet takes around the sun."],
      ["PLANET", 2, "Earth is one of these."],
      ["NEBULA", 2, "A giant cloud of gas and dust where stars are born."],
      ["SPIRAL", 2, "A swirly shape, like a snail shell."],
      ["ROCKET", 2, "It blasts off into space."],
      ["GRAVITY", 3, "The pull that keeps your feet on the ground."],
      ["ASTRONAUT", 3, "A person trained to travel into space."],
      ["TELESCOPE", 3, "A tool that makes faraway stars look closer."],
      ["ASTEROID", 3, "A rocky chunk that goes around the sun."],
      ["UNIVERSE", 3, "Everything there is: all the galaxies, stars, and planets."],
      ["SATELLITE", 3, "Something that orbits a planet, like the moon or a space station."]
    ]
  };
})(window.Kit = window.Kit || {});
