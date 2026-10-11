/**
 * @file kit/audio.js
 * @about Sound effects made in code (no audio files): beeps, chimes, whooshes, a woof. Also unlocks sound on the first click or key press, which browsers require.
 * @provides Kit.audio { ctx, noiseBuffer, tone, noise, sfx, enabled, setEnabled, onFirstGesture }
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  let ac = null, noiseBuf = null, enabled = true, gestured = false;
  const waiting = [];

  function ctx() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ac.state === "suspended") ac.resume().catch(() => {});
    return ac;
  }

  // Half a second of white noise, reused for whooshes, digging, and hi-hats.
  function noiseBuffer(a) {
    if (!noiseBuf) {
      noiseBuf = a.createBuffer(1, Math.floor(a.sampleRate * .5), a.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return noiseBuf;
  }

  // One note. f = pitch in Hz, d = length in seconds, v = volume, at = delay, f2 = slide to this pitch.
  function tone(f, d = .12, type = "sine", v = .06, at = 0, f2) {
    if (!enabled) return; const a = ctx(); if (!a) return;
    const t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + .03);
  }

  // A filtered noise sweep from f0 to f1 Hz.
  function noise(f0, f1, dur, vol) {
    if (!enabled) return; const a = ctx(); if (!a) return;
    const t = a.currentTime, src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    src.buffer = noiseBuffer(a); f.type = "bandpass"; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .03); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    src.connect(f).connect(g).connect(a.destination); src.start(t); src.stop(t + dur + .05);
  }

  const sfx = {
    key: () => tone(1200, .035, "triangle", .018),
    miss: () => tone(180, .09, "sine", .045),
    word: () => { tone(660, .09, "triangle", .055); tone(990, .12, "triangle", .055, .07); },
    lost: () => tone(420, .3, "sine", .04, 0, 160),
    right: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .2, "triangle", .065, i * .08)),
    wrong: () => { tone(262, .14, "sine", .06); tone(196, .22, "sine", .06, .12); },
    join: () => [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, .22, "square", .03, i * .09)),
    found: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, .25, "triangle", .06, i * .07)),
    woof: () => { tone(430, .11, "sawtooth", .04, 0, 190); tone(410, .13, "sawtooth", .04, .17, 170); },
    hint: () => [880, 1175, 1568].forEach((f, i) => tone(f, .12, "sine", .04, i * .05)),
    beep: () => tone(660, .14, "square", .04),
    liftoff: () => { tone(990, .4, "square", .04); noise(300, 2400, .8, .14); },
    dig: () => noise(900, 220, .25, .12),
    arrive: () => tone(740, .12, "triangle", .05),
    levelup: () => [659, 880, 1319].forEach((f, i) => tone(f, .18, "square", .03, i * .07)),
    song: () => [523, 784, 659, 1047].forEach((f, i) => tone(f, .3, "sine", .05, i * .1)),
    flame: () => [262, 330, 392, 523, 659, 784].forEach((f, i) => tone(f, .55, "sine", .05, i * .12))
  };

  function gesture() {
    if (gestured) return;
    gestured = true; ctx();
    document.removeEventListener("pointerdown", gesture, true);
    document.removeEventListener("keydown", gesture, true);
    waiting.splice(0).forEach(fn => { try { fn(); } catch (e) { /* keep going */ } });
  }
  document.addEventListener("pointerdown", gesture, true);
  document.addEventListener("keydown", gesture, true);

  Kit.audio = {
    ctx, noiseBuffer, tone, noise, sfx,
    get enabled() { return enabled; },
    setEnabled(v) { enabled = !!v; },
    onFirstGesture(fn) { if (gestured) fn(); else waiting.push(fn); }
  };
})(window.Kit = window.Kit || {});
