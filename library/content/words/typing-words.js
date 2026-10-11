/**
 * @file content/words/typing-words.js
 * @about Word lists for typing practice, sorted by length: short words, five-letter words, longer words, short phrases, cozy "home" words, and digging words.
 * @provides Kit.words { short, five, long, phrases, home, dig }
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  Kit.words = Object.assign(Kit.words || {}, {
    short: ["go", "up", "sky", "sun", "fly", "star", "moon", "zoom", "glow", "beep", "map", "jet", "fin", "bolt", "dust", "rock", "fuel", "gear", "orb", "ray", "warp", "hop", "nova", "spin", "wave"],
    five: ["orbit", "comet", "brave", "light", "robot", "power", "shine", "dream", "cloud", "quick", "laser", "solar", "space", "rover", "spark", "flash", "earth", "metal", "steer", "cargo", "radar", "glide", "blast", "alien"],
    long: ["planet", "rocket", "friend", "galaxy", "engine", "bright", "gravity", "journey", "explore", "wonder", "meteor", "launch", "saturn", "cosmic", "helmet", "sensor", "signal", "glider", "crystal", "captain", "mission", "shuttle"],
    phrases: ["full speed", "hold on", "we can do it", "to the stars", "lights on", "almost there", "zoom zoom", "blast off", "steady now", "fire boosters", "star power", "go team", "eyes on the stars"],
    home: ["home", "warm", "glow", "light", "hug", "friends", "sunrise", "together", "lumina", "shine", "family", "bright", "cozy", "wake up", "hello"],
    dig: ["dig", "rock", "dust", "bolt", "gear", "wire", "fuel", "beam", "jet", "core", "spark", "metal", "laser", "orbit", "comet", "shovel", "rover", "crater", "pebble", "scoop", "sand", "glow", "boost", "zap"]
  });
})(window.Kit = window.Kit || {});
