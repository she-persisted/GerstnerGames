/**
 * @file content/questions/riddles.js
 * @about 36 STEM-leaning riddles for ages 8 to 10, each tagged easy (1), medium (2), or hard (3). The clue is what a helper friend says when asked.
 * @provides Kit.questions.banks.riddles
 * @requires kit/questions.js
 */
(function (Kit) {
  "use strict";
  // [id, difficulty, riddle, accepted answers, clue]
  Kit.questions.addBank("riddles", "riddle", "r-", [
    ["magnet", 1, "I can pick up paper clips without using any hands. What am I?", ["magnet"], "I might be holding a drawing on your fridge."],
    ["robot", 1, "I'm made of metal and wires. I follow instructions, and some of me even explore Mars! What am I?", ["robot", "rover"], "You're playing as one!"],
    ["computer", 1, "I have a screen and a keyboard, and my mouse never eats cheese. What am I?", ["computer", "laptop", "chromebook"], "You're using one right now!"],
    ["clock", 1, "What has hands but can't clap?", ["clock", "watch"], "It ticks and tells you when it's bedtime."],
    ["ice", 1, "I'm made of water, but if you leave me in a warm room I disappear. What am I?", ["ice", "ice cube", "snow", "snowman"], "You put me in a drink to make it cold."],
    ["bulb", 1, "I have no mouth, but when you flip a switch I light up the whole room. What am I?", ["light bulb", "lightbulb", "bulb", "lamp", "light"], "I screw into a lamp."],
    ["wind", 1, "You can't see me, but you can watch me blow leaves around and spin windmills. What am I?", ["wind", "air", "breeze"], "Kites need me to fly."],
    ["keyboard", 1, "I have lots of keys, but I can't open a single door. What am I?", ["keyboard", "piano"], "You type on one, or play music on one."],
    ["rainbow", 1, "I show up when the sun comes out after rain. I'm a curvy stripe of seven colors. What am I?", ["rainbow"], "Red, orange, yellow, green, blue, indigo, violet."],
    ["cloud", 1, "I float in the sky, made of tiny drops of water. Sometimes I'm fluffy and white, sometimes gray and full of rain. What am I?", ["cloud", "clouds"], "Rain falls from me."],
    ["volcano", 1, "I'm a mountain with a hot secret. Sometimes I erupt and lava flows out! What am I?", ["volcano"], "Lava is melted rock."],
    ["seed", 1, "I start out very small, but plant me with water and sunshine and I can grow into a giant tree. What am I?", ["seed", "acorn"], "Apples have them in the middle."],
    ["mirror", 1, "If you smile at me, I smile back. If you wave, I wave back. What am I?", ["mirror", "reflection"], "You look into me when you brush your hair."],
    ["heart", 1, "I'm about the size of your fist, and I beat all day and all night to pump your blood. What am I?", ["heart"], "Put your hand on your chest and you can feel me."],
    ["wheel", 1, "I'm round and I roll. Cars, bikes, and rovers all need me. What am I?", ["wheel", "wheels", "tire"], "There are four of me on a car."],
    ["book", 1, "I have a spine and lots of pages, but no bones at all. What am I?", ["book"], "You can read me at bedtime."],
    ["rocket", 1, "I stand tall on a launch pad, then fire blasts out of my bottom and I zoom into space! What am I?", ["rocket", "spaceship", "space shuttle", "ship"], "You're building one!"],
    ["battery", 2, "I'm full of energy, but I never run around. Put me in a toy and it comes alive! What am I?", ["battery"], "I have a plus end and a minus end."],
    ["telescope", 2, "I have one big eye, and I help you see stars that are far, far away. What am I?", ["telescope"], "Astronomers point me at the night sky."],
    ["echo", 2, "I can talk back, but only with your own words. Shout in a cave and you'll hear me. What am I?", ["echo"], "I'm sound bouncing off the walls."],
    ["candle", 2, "I'm tall when I'm young and short when I'm old. What am I?", ["candle"], "I have a little flame on top, and I melt as I burn."],
    ["compass", 2, "My needle always points north, so explorers never get lost. What am I?", ["compass"], "Sailors and hikers carry me."],
    ["map", 2, "I have cities but no houses, mountains but no rocks, and water but no fish. What am I?", ["map", "globe"], "Explorers use me to find their way."],
    ["towel", 2, "What gets wetter and wetter the more it dries?", ["towel"], "You grab it after a bath."],
    ["egg", 2, "What has to be broken before you can use it?", ["egg"], "You might crack one into a pan for breakfast."],
    ["sponge", 2, "What is full of holes but still holds water?", ["sponge"], "It sits by the sink and helps wash the dishes."],
    ["lightning", 2, "I flash across the sky in a storm, and my loud friend thunder always follows me. What am I?", ["lightning", "lightning bolt"], "I'm a giant spark of electricity."],
    ["skeleton", 2, "I'm inside you, holding you up. I'm made of 206 bones. What am I?", ["skeleton", "bones"], "Halloween decorations sometimes look like me."],
    ["astronaut", 2, "I wear a big white suit and a helmet, and I float around inside a space station. Who am I?", ["astronaut"], "I'm a person who travels to space."],
    ["name", 2, "What belongs to you, but other people use it more than you do?", ["name"], "It's what people call you."],
    ["shadow", 2, "I follow you around all day, but when the lights go out, I disappear. What am I?", ["shadow"], "You can make me into animal shapes with your hands."],
    ["thermometer", 3, "I can tell you if it's hot or cold, but I never feel a thing. What am I?", ["thermometer"], "Doctors and weather reporters use me."],
    ["steps", 3, "The more of these you take, the more you leave behind. What are they?", ["footsteps", "steps", "footprints"], "You make them when you walk across sand or snow."],
    ["microscope", 3, "I help you see things that are too tiny for your eyes, like germs and cells. What am I?", ["microscope", "magnifying glass"], "Scientists look into me in a lab."],
    ["river", 3, "I run but never walk. I have a mouth but never talk. What am I?", ["river", "stream", "creek"], "Fish swim in me, and I flow to the sea."],
    ["stamp", 3, "What can travel all around the world while staying in one corner?", ["stamp", "postage stamp"], "It goes in the corner of an envelope."]
  ]);
})(window.Kit = window.Kit || {});
