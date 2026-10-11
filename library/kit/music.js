/**
 * @file kit/music.js
 * @about Plays looping background songs that are written as data and synthesized in code (no audio files, nothing copyrighted).
 * @provides Kit.music.create(songs) -> { set(id), unlock(), setEnabled(on), enabled, want }
 * @requires kit/audio.js
 *
 * Song format (see assets/music/*.js):
 *   title     name shown in jukeboxes
 *   bpm       tempo; each step is an eighth note
 *   root      MIDI note number of the key (60 = middle C)
 *   lead      32 steps: semitones above root, or null for a rest
 *   chords    4 chords (one per 8 steps), each a list of semitone offsets
 *   bass      8 steps: 1 = chord root, 2 = root an octave up, 0 = rest
 *   kick, hat 8 steps of 1 or 0 (optional drums)
 *   optional: wave, oct, pluck, leadVol, leadLen, pad, padWave, bassWave, bassVol, bassLen, hatVol
 */
(function (Kit) {
  "use strict";
  function create(songs) {
    let bus = null, cur = null, want = "theme", step = 0, nextT = 0, timer = 0, unlocked = false, on = true;
    const m2f = m => 440 * Math.pow(2, (m - 69) / 12);
    const out = a => { if (!bus) { bus = a.createGain(); bus.gain.value = .5; bus.connect(a.destination); } return bus; };

    function note(a, freq, t, dur, wave, vol, atk, rel, pluck) {
      const o = a.createOscillator(), g = a.createGain();
      o.type = wave; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(.0001, t);
      if (pluck) { g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur); }
      else { const s = Math.max(t + atk, t + dur - rel); g.gain.linearRampToValueAtTime(vol, t + atk); g.gain.setValueAtTime(vol, s); g.gain.linearRampToValueAtTime(.0001, t + dur); }
      o.connect(g).connect(out(a)); o.start(t); o.stop(t + dur + .05);
    }
    function kick(a, t) {
      const o = a.createOscillator(), g = a.createGain();
      o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(48, t + .14);
      g.gain.setValueAtTime(.3, t); g.gain.exponentialRampToValueAtTime(.0001, t + .2);
      o.connect(g).connect(out(a)); o.start(t); o.stop(t + .22);
    }
    function hat(a, t, v) {
      const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
      s.buffer = Kit.audio.noiseBuffer(a); f.type = "highpass"; f.frequency.value = 7000;
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .05);
      s.connect(f).connect(g).connect(out(a)); s.start(t); s.stop(t + .06);
    }
    function playStep(a, s, i, t, sd) {
      const ch = s.chords[Math.floor(i / 8) % s.chords.length], k = i % 8;
      if (k === 0 && s.pad) ch.forEach(n => note(a, m2f(s.root - 12 + n), t, sd * 8, s.padWave || "sine", s.pad, .3, .6));
      const b = s.bass && s.bass[k];
      if (b) note(a, m2f(s.root - 24 + ch[0] + (b === 2 ? 12 : 0)), t, sd * (s.bassLen || 1.6), s.bassWave || "triangle", s.bassVol || .09, .01, .08);
      const l = s.lead[i];
      if (l != null) note(a, m2f(s.root + (s.oct || 0) + l), t, sd * (s.leadLen || 1.5), s.wave || "triangle", s.leadVol || .05, .01, .1, s.pluck);
      if (s.kick && s.kick[k]) kick(a, t);
      if (s.hat && s.hat[k]) hat(a, t, s.hatVol || .02);
    }
    // Schedules notes a little ahead of time so playback stays smooth.
    function tick() {
      const a = Kit.audio.ctx(); if (!cur || !a) return;
      const sd = 60 / cur.bpm / 2;
      if (nextT < a.currentTime - .05) nextT = a.currentTime + .05;
      while (nextT < a.currentTime + .15) { playStep(a, cur, step, nextT, sd); nextT += sd; step = (step + 1) % 32; }
    }
    function start(id) {
      const a = Kit.audio.ctx(), s = songs[id]; if (!a || !s) return;
      if (cur === s && timer) return;
      cur = s; step = 0; nextT = a.currentTime + .1;
      if (!timer) timer = setInterval(tick, 25);
    }
    function stop() { cur = null; if (timer) clearInterval(timer); timer = 0; }

    return {
      set(id) { want = id; if (on && unlocked) start(id); },
      unlock() { if (unlocked) return; unlocked = true; if (on) start(want); },
      setEnabled(v) { on = !!v; if (on) { if (unlocked) start(want); } else stop(); },
      get enabled() { return on; },
      get want() { return want; }
    };
  }
  Kit.music = { create };
})(window.Kit = window.Kit || {});
