/**
 * @file content/questions/earth.js
 * @about 21 Earth and geography questions (continents, oceans, mountains, deserts, famous places), each tagged easy (1), medium (2), or hard (3).
 * @provides Kit.questions.banks.earth
 * @requires kit/questions.js
 */
(function (Kit) {
  "use strict";
  // [id, difficulty, question, accepted answers, clue]
  Kit.questions.addBank("earth", "earth", "e-", [
    ["australia", 1, "I'm a continent AND a country, and kangaroos hop all over me. What am I?", ["australia"], "My name starts with AUS."],
    ["africa", 1, "The giant Sahara Desert is on me, and so are lions and elephants. What continent am I?", ["africa"], "It starts with AF."],
    ["seven", 1, "How many continents does Earth have? Type the number.", ["7", "seven"], "North America, South America, Europe, Asia, Africa, Australia, Antarctica."],
    ["everest", 1, "I'm the tallest mountain in the whole world. Climbers need oxygen tanks near my top! What's my name?", ["everest", "mount everest"], "Mount Ever... something!"],
    ["desert", 1, "I'm a huge, dry place with very little rain, like the Sahara. What am I called?", ["desert"], "Cactuses and camels live in places like me."],
    ["island", 1, "I'm a piece of land with water all the way around me. What am I?", ["island"], "Hawaii is made of these."],
    ["northamerica", 1, "I'm the continent where the United States, Canada, and Mexico are. What am I?", ["north america"], "Two words. The first one is a direction."],
    ["water", 1, "Is most of Earth covered by land or by water?", ["water"], "Look at a globe. Lots of blue!"],
    ["volcano", 1, "I'm a mountain that can erupt with hot, melted rock called lava. What am I?", ["volcano"], "Hawaii has some of me."],
    ["antarctica", 2, "I'm the icy continent at the very bottom of the world. Penguins live here, but no people live here all year long. What am I?", ["antarctica"], "Rigel would feel right at home here! It starts with ANT."],
    ["asia", 2, "I'm the biggest continent on Earth, and the world's tallest mountain stands on me. What am I?", ["asia"], "Mount Everest and China are both here."],
    ["europe", 2, "I'm a small continent with more than forty countries packed close together, like France, Italy, and Spain. What am I?", ["europe"], "I'm joined to Asia on one giant piece of land."],
    ["pacific", 2, "I'm the biggest ocean on Earth. All the land on the whole planet could fit inside me! What's my name?", ["pacific", "pacific ocean"], "My name starts with P."],
    ["southamerica", 2, "I'm the continent with the Amazon rainforest and the Andes Mountains. What am I?", ["south america"], "Two words. The first one is a direction."],
    ["oceans", 2, "How many oceans does Earth have? Type the number.", ["5", "five"], "Pacific, Atlantic, Indian, Southern, and Arctic."],
    ["rainforest", 2, "I'm a big, wet forest full of tall trees, rain, and animals like monkeys and parrots. What am I?", ["rainforest", "rain forest", "jungle"], "It rains here almost every day."],
    ["china", 2, "The Great Wall is in this big country in Asia. What's its name?", ["china"], "It has more people than almost any other country."],
    ["equator", 3, "I'm an imaginary line around the middle of the Earth, where it's warm all year. What am I?", ["equator"], "It starts with E-Q."],
    ["atlantic", 3, "I'm the ocean between North America and Europe. What's my name?", ["atlantic", "atlantic ocean"], "My name starts with AT."],
    ["arctic", 3, "I'm the icy ocean at the very top of the world, around the North Pole. What's my name?", ["arctic", "arctic ocean"], "Polar bears live near me."],
    ["egypt", 3, "The giant pyramids of Giza are in this country in Africa. What's its name?", ["egypt"], "It starts with E."]
  ]);
})(window.Kit = window.Kit || {});
