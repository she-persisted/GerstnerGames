/**
 * @file content/questions/blanks.js
 * @about 46 fill-in-the-blank sentences about space, robots, and science for ages 8 to 10, each tagged easy (1), medium (2), or hard (3). ___ marks the blank.
 * @provides Kit.questions.banks.blanks
 * @requires kit/questions.js
 */
(function (Kit) {
  "use strict";
  // [id, difficulty, sentence with ___, accepted answers, clue]
  Kit.questions.addBank("blanks", "blank", "b-", [
    ["sun", 1, "The Earth takes one whole year to travel around the ___.", ["sun"], "It's the giant star at the center of our solar system."],
    ["battery", 1, "A robot can get its power from a ___, just like a flashlight does.", ["battery", "batteries"], "It has a plus end and a minus end."],
    ["ice", 1, "When water gets very cold, it freezes into ___.", ["ice"], "You put it in a drink to make it cold."],
    ["sunlight", 1, "Plants need water, air, and ___ to grow.", ["sunlight", "sun", "light"], "It shines down from the sky during the day."],
    ["magnet", 1, "A ___ can pick up paper clips because it pulls on some metals.", ["magnet"], "It might hold a drawing on your fridge."],
    ["planet", 1, "Mars is called the Red ___.", ["planet"], "Earth is one too."],
    ["astronauts", 1, "People who travel into space are called ___.", ["astronauts", "astronaut", "cosmonauts"], "They wear space suits and helmets."],
    ["water", 1, "Ice, rain, and steam are all made of ___.", ["water"], "You drink it every day."],
    ["star", 1, "Our Sun is a ___, just like the twinkly lights in the night sky.", ["star"], "Twinkle, twinkle, little..."],
    ["earth", 1, "The Moon travels around the ___.", ["earth"], "It's the planet we live on."],
    ["hot", 1, "Water boils when it gets very ___.", ["hot"], "The opposite of cold."],
    ["moon", 1, "Earth has one ___ that we can see shining at night.", ["moon"], "It changes shape during the month."],
    ["butterfly", 1, "A caterpillar grows up to become a ___.", ["butterfly", "butterflies", "moth"], "It has big, colorful wings."],
    ["triangle", 1, "A triangle has ___ sides.", ["3", "three"], "Tri means three!"],
    ["spider", 1, "A spider has ___ legs.", ["8", "eight"], "One more than seven."],
    ["week", 1, "There are ___ days in one week.", ["7", "seven"], "Monday, Tuesday, Wednesday, and so on."],
    ["sinks", 1, "Wood floats on water, but a heavy rock ___.", ["sinks", "sink"], "The opposite of floats."],
    ["clouds", 1, "Rain, snow, and hail all fall from ___.", ["clouds", "cloud", "sky"], "They float high in the sky."],
    ["helmet", 1, "Astronauts wear a ___ on their heads to stay safe in space.", ["helmet", "space helmet"], "Bike riders wear one too."],
    ["gravity", 2, "On Earth, ___ pulls everything down, so things fall when you drop them.", ["gravity"], "It's why apples fall from trees."],
    ["telescope", 2, "Astronomers use a ___ to look at faraway stars and planets.", ["telescope"], "It's a long tube with special lenses inside."],
    ["planets", 2, "There are eight ___ in our solar system.", ["planets"], "Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune."],
    ["gears", 2, "In a machine, wheels with teeth that turn each other are called ___.", ["gears", "gear", "cogs", "cog"], "Bikes and clocks have them inside."],
    ["galaxy", 2, "A huge group of billions of stars, like the Milky Way, is called a ___.", ["galaxy"], "It starts with G."],
    ["rings", 2, "Saturn is famous for its beautiful ___.", ["rings", "ring"], "They're made of ice and rock circling the planet."],
    ["oxygen", 2, "Astronauts carry tanks of ___ so they can breathe in space.", ["oxygen", "air"], "It starts with O, and plants make it for us."],
    ["pollen", 2, "Bees help flowers by carrying ___ from one flower to another.", ["pollen"], "It's a yellow powder."],
    ["tadpole", 2, "A frog starts its life as a little ___ swimming in a pond.", ["tadpole", "egg", "polliwog"], "It has a tail and no legs at first."],
    ["east", 2, "Every morning, the Sun rises in the ___.", ["east"], "It's the opposite of west."],
    ["corners", 2, "A circle has ___ corners.", ["0", "zero", "no", "none"], "Run your finger around a circle. Do you ever hit a point?"],
    ["insect", 2, "An insect, like an ant or a bee, has ___ legs.", ["6", "six"], "Two less than a spider."],
    ["hours", 2, "Earth spins around once every ___ hours. That's one whole day and night.", ["24", "twenty four"], "Two times twelve."],
    ["rover", 2, "A ___ is a robot car that drives around on other planets.", ["rover"], "Mars has a few of them!"],
    ["electricity", 2, "Wind, sunlight, and moving water can all make ___ for our homes.", ["electricity", "energy", "power"], "It makes lights turn on."],
    ["wires", 2, "Electricity flows through thin metal ___.", ["wires", "wire", "cables"], "They hide inside walls and cords."],
    ["jupiter", 2, "The biggest planet in our solar system is ___.", ["jupiter"], "It has a giant red spot."],
    ["compass", 2, "A ___ helps sailors and explorers know which way is north.", ["compass"], "Its needle is a little magnet."],
    ["arms", 2, "Factory robots use their long metal ___ to grab and move parts.", ["arms", "arm", "grippers", "claws", "hands"], "People have two of them, with hands at the end."],
    ["sensors", 3, "A robot uses ___ to notice the world around it, kind of like eyes and ears.", ["sensors", "sensor", "cameras", "camera"], "They sense things like light, sound, or touch."],
    ["program", 3, "A robot follows a list of step-by-step instructions called a ___.", ["program", "code", "algorithm"], "Coders write these on computers."],
    ["down", 3, "A rocket goes up because its engines push hot gas ___.", ["down", "downward", "downwards", "out"], "It's the opposite direction from where the rocket goes!"],
    ["waves", 3, "Sound travels through the air in invisible ___, like ripples in a pond.", ["waves", "wave", "sound waves"], "Surfers ride the ocean kind."],
    ["venus", 3, "The hottest planet in our solar system is ___, even though Mercury is closer to the Sun.", ["venus"], "It's the second planet from the Sun."],
    ["constellation", 3, "A group of stars that makes a picture in the sky, like the Big Dipper, is called a ___.", ["constellation"], "Orion is a famous one."],
    ["force", 3, "A push or a pull is called a ___.", ["force"], "Gravity and magnets are examples."],
    ["mercury", 3, "The closest planet to the Sun is ___.", ["mercury"], "It's also the smallest planet."]
  ]);
})(window.Kit = window.Kit || {});
