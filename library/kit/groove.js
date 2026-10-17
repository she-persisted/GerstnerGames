/**
 * @file kit/groove.js
 * @about A bouncier music player for upbeat, dance-style chiptune songs written as data: sixteenth-note patterns, verse and chorus sections, claps and open hi-hats, sparkly chord arpeggios, an octave-bouncing bass, and a pulse-wave lead with a little echo. Same controls as kit/music.js, so the jukebox works with it, and it plays kit/music.js songs too. Everything is synthesized in code (no audio files, nothing copyrighted).
 * @provides Kit.groove.create(songs) -> { set(id), restart(id, { at, delay }), hush(), position(), unlock(), setEnabled(on), enabled, want }, Kit.groove.render(audioContext, song, seconds)
 * @requires kit/audio.js
 *
 * Song format (see assets/music/glitch-hub.js):
 *   title, bpm (quarter notes a minute; each step is a sixteenth note), root (MIDI note of the key, 60 = middle C)
 *   form       section names in play order, looped, for example ["A", "B", "A", "C"]
 *   sections   { name: { chords, lead, bass, kick, clap, hat, open, arp } }
 *     chords   one chord per bar, each a list of semitones above root (the first one is the bass note)
 *     lead     a string of steps, 16 per bar: a number = semitones above root (plus the lead's oct), . = rest, - = keep holding
 *     bass     a pattern repeated every bar: 1 = chord root, 8 = root an octave up, 5 = the fifth, . = rest, - = hold
 *     kick, clap, hat, open   patterns: x = hit, . = rest (16 per bar, or longer to cover several bars, for fills)
 *     arp      true to ripple the chord's notes every sixteenth
 *   lead, arp, bass, pad   instrument settings: { wave: square | triangle | sawtooth | sine | pulse25 | pulse12, vol, oct, echo, gate }
 *   drums      { kick, clap, hat, open } volumes
 * Songs written for kit/music.js (32 eighth-note steps, no form) still play: they are turned into this format.
 * render(ctx, song, seconds) schedules a song into any audio context from time 0 (the play-test uses it to check loudness).
 * restart(id, { at, delay }) plays a song from `at` seconds in (a negative `at` waits that long first), starting `delay` seconds
 * from now and cutting off notes already lined up, so a game can keep the music in time with something (a rhythm run).
 * hush() fades the music out right away until the next set or restart. position() = seconds into the song now, or null.
 */
(function (Kit) {
  "use strict";
  const m2f = m => 440 * Math.pow(2, (m - 69) / 12);
  const waves = new WeakMap();
  function wave(a, type) {
    if (type !== "pulse25" && type !== "pulse12") return null;
    let w = waves.get(a); if (!w) waves.set(a, w = {});
    if (!w[type]) {
      const d = type === "pulse25" ? .25 : .125, n = 40, re = new Float32Array(n), im = new Float32Array(n);
      for (let k = 1; k < n; k++) { re[k] = Math.sin(2 * Math.PI * k * d) / (Math.PI * k); im[k] = (1 - Math.cos(2 * Math.PI * k * d)) / (Math.PI * k); }
      w[type] = a.createPeriodicWave(re, im);
    }
    return w[type];
  }

  // Turns pattern strings into step lists. lead: "0 - 4 . 7" (spaces between steps); others: "x...x..." (one letter a step).
  function parseLead(str) {
    const out = [];
    if (!str) return out;
    let last = null;
    for (const tok of str.trim().split(/\s+/)) {
      if (tok === "|") continue;
      if (tok === "-") { if (last) last.len++; out.push(null); }
      else if (tok === ".") { last = null; out.push(null); }
      else { last = { n: Number(tok), len: 1 }; out.push(last); }
    }
    return out;
  }
  const steps = str => (str || "").replace(/\s+/g, "");

  // Prepares a song once: every section's lead parsed, and the play order laid out as steps.
  function prep(s) {
    if (s.__prep) return s.__prep;
    let song = s;
    if (!s.form) { // an older kit/music.js song: 32 eighth notes, 4 chords
      const lead = s.lead.map(n => n == null ? ". ." : `${n} -`).join(" ");
      const b8 = (s.bass || []).map(b => b === 1 ? "1." : b === 2 ? "8." : "..").join("");
      const d8 = p => (p || []).map(x => x ? "x." : "..").join("");
      song = { title: s.title, bpm: s.bpm, root: s.root, form: ["A"],
        lead: { wave: s.wave || "triangle", vol: s.leadVol || .05, oct: s.oct || 0, gate: (s.leadLen || 1.5) / 2 },
        bass: { wave: s.bassWave || "triangle", vol: s.bassVol || .09, oct: -24, gate: (s.bassLen || 1.6) / 2 },
        pad: s.pad ? { wave: s.padWave || "sine", vol: s.pad } : null, drums: { kick: .3, hat: s.hatVol || .02 },
        sections: { A: { chords: s.chords, lead, bass: b8, kick: d8(s.kick), hat: d8(s.hat) } } };
    }
    const secs = {};
    for (const [name, sec] of Object.entries(song.sections)) {
      const bars = sec.chords.length;
      secs[name] = { ...sec, bars, leadSteps: parseLead(sec.lead), bassP: steps(sec.bass), kickP: steps(sec.kick), clapP: steps(sec.clap), hatP: steps(sec.hat), openP: steps(sec.open) };
    }
    const order = [];
    for (const name of song.form) { const sec = secs[name]; for (let i = 0; i < sec.bars * 16; i++) order.push([sec, i]); }
    return (s.__prep = { song, order });
  }

  function makeVoice(a, out) {
    const echoIn = a.createGain(), dl = a.createDelay(1), fb = a.createGain(), wet = a.createGain();
    echoIn.gain.value = 1; fb.gain.value = .32; wet.gain.value = .45;
    echoIn.connect(dl); dl.connect(fb).connect(dl); dl.connect(wet).connect(out);
    let noise = null;
    const noiseBuf = () => noise || (noise = Kit.audio.noiseBuffer(a));
    function note(freq, t, dur, inst, pluck) {
      const o = a.createOscillator(), g = a.createGain(), pw = wave(a, inst.wave);
      if (pw) o.setPeriodicWave(pw); else o.type = inst.wave || "triangle";
      o.frequency.setValueAtTime(freq, t);
      const v = inst.vol || .05;
      g.gain.setValueAtTime(.0001, t);
      if (pluck) { g.gain.exponentialRampToValueAtTime(v, t + .008); g.gain.exponentialRampToValueAtTime(v * .35, t + Math.min(dur, .18)); g.gain.exponentialRampToValueAtTime(.0001, t + dur); }
      else { g.gain.linearRampToValueAtTime(v, t + .01); g.gain.setValueAtTime(v, Math.max(t + .01, t + dur - .05)); g.gain.linearRampToValueAtTime(.0001, t + dur); }
      if (inst.vib && dur > .25) { const l = a.createOscillator(), lg = a.createGain(); l.frequency.value = 5.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(freq * .012, t + .25); l.connect(lg).connect(o.frequency); l.start(t); l.stop(t + dur + .05); }
      o.connect(g).connect(out);
      if (inst.echo) { const e = a.createGain(); e.gain.value = inst.echo; g.connect(e).connect(echoIn); }
      o.start(t); o.stop(t + dur + .05);
    }
    function kick(t, v) {
      const o = a.createOscillator(), g = a.createGain();
      o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(45, t + .12);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .22);
      o.connect(g).connect(out); o.start(t); o.stop(t + .24);
    }
    function burst(t, v, type, freq, q, len) {
      const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
      s.buffer = noiseBuf(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + len);
      s.connect(f).connect(g).connect(out); s.start(t); s.stop(t + len + .02);
    }
    function clap(t, v) { // three quick slaps and a little tail
      for (const [d, k] of [[0, .7], [.012, .8], [.024, 1]]) burst(t + d, v * k, "bandpass", 1500, 1.4, .02 + (d === .024 ? .14 : 0));
      const o = a.createOscillator(), g = a.createGain(); o.type = "triangle"; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(140, t + .06);
      g.gain.setValueAtTime(v * .5, t); g.gain.exponentialRampToValueAtTime(.0001, t + .08); o.connect(g).connect(out); o.start(t); o.stop(t + .1);
    }
    return { note, kick, clap, hat: (t, v) => burst(t, v, "highpass", 8000, .7, .035), open: (t, v) => burst(t, v, "highpass", 6500, .7, .16) };
  }

  function playStep(a, V, P, i, t, sd) {
    const { song, order } = P, [sec, k] = order[i % order.length], bar = Math.floor(k / 16), st = k % 16;
    const ch = sec.chords[bar % sec.chords.length], root = song.root, D = song.drums || {};
    const hit = (pat, j) => pat && pat.length && pat[j % pat.length] === "x";
    if (st === 0 && song.pad) ch.forEach(n => V.note(m2f(root - 12 + n), t, sd * 16, song.pad, false));
    const b = sec.bassP && sec.bassP.length ? sec.bassP[k % sec.bassP.length] : ".";
    if (b === "1" || b === "8" || b === "5") {
      let len = 1; while (sec.bassP[(k + len) % sec.bassP.length] === "-" && len < 16) len++;
      const inst = song.bass || {}, n = ch[0] + (b === "8" ? 12 : b === "5" ? 7 : 0);
      V.note(m2f(root + (inst.oct == null ? -12 : inst.oct) + n), t, sd * len * (inst.gate || .85), inst, true);
    }
    const l = sec.leadSteps[k];
    if (l) { const inst = song.lead || {}; V.note(m2f(root + (inst.oct || 0) + l.n), t, sd * l.len * (inst.gate || .9), inst, inst.pluck !== false); }
    if (sec.arp && song.arp) {
      const tones = [...ch, ch[0] + 12], n = tones[st % tones.length];
      V.note(m2f(root + (song.arp.oct == null ? 12 : song.arp.oct) + n), t, sd * .9, song.arp, true);
    }
    if (hit(sec.kickP, k)) V.kick(t, D.kick || .3);
    if (hit(sec.clapP, k)) V.clap(t, D.clap || .14);
    if (hit(sec.hatP, k)) V.hat(t, D.hat || .03);
    if (hit(sec.openP, k)) V.open(t, D.open || .03);
  }

  function create(songs) {
    let cur = null, P = null, want = "theme", step = 0, nextT = 0, timer = 0, unlocked = false, on = true, V = null, bus = null, ctxRef = null, t0 = 0;
    function out(a) {
      if (!bus || ctxRef !== a) {
        ctxRef = a; bus = a.createGain(); bus.gain.value = .5;
        const comp = a.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.attack.value = .004; comp.release.value = .2;
        bus.connect(comp).connect(a.destination); V = makeVoice(a, bus);
      }
      return bus;
    }
    // Fades out everything already lined up (on the old bus) and starts a fresh one, so a restart cuts cleanly.
    function cut(a) {
      if (bus && ctxRef === a) { const old = bus, t = a.currentTime; old.gain.cancelScheduledValues(t); old.gain.setValueAtTime(old.gain.value, t); old.gain.linearRampToValueAtTime(0, t + .03); setTimeout(() => { try { old.disconnect(); } catch (e) { /* gone */ } }, 400); }
      bus = null; out(a);
    }
    function tick() {
      const a = Kit.audio.ctx(); if (!cur || !a) return;
      out(a);
      const sd = 60 / P.song.bpm / 4;
      if (nextT < a.currentTime - .05) nextT = a.currentTime + .05;
      while (nextT < a.currentTime + .15) { playStep(a, V, P, step, nextT, sd); nextT += sd; step = (step + 1) % P.order.length; }
    }
    function start(id) {
      const a = Kit.audio.ctx(), s = songs[id]; if (!a || !s) return;
      if (cur === s && timer) return;
      cur = s; P = prep(s); step = 0; nextT = a.currentTime + .1; t0 = nextT;
      if (!timer) timer = setInterval(tick, 25);
    }
    function stop() { cur = null; if (timer) clearInterval(timer); timer = 0; }
    function restart(id, at = 0, delay = 0) {
      const a = Kit.audio.ctx(), s = songs[id]; if (!a || !s) return;
      cut(a);
      cur = s; P = prep(s);
      const sd = 60 / P.song.bpm / 4, now = a.currentTime + .02 + delay;
      if (at < 0) { step = 0; nextT = now - at; }
      else { const k = Math.ceil(at / sd - 1e-6); step = k % P.order.length; nextT = now + (k * sd - at); }
      t0 = nextT - step * sd;
      if (!timer) timer = setInterval(tick, 25);
    }
    return {
      set(id) { want = id; if (on && unlocked) start(id); },
      restart(id, { at = 0, delay = 0 } = {}) { want = id; if (on && unlocked) restart(id, at, delay); },
      hush() { const a = Kit.audio.ctx(); if (a && bus) cut(a); stop(); },
      position() { const a = Kit.audio.ctx(); return cur && a ? a.currentTime - t0 : null; },
      unlock() { if (unlocked) return; unlocked = true; if (on) start(want); },
      setEnabled(v) { on = !!v; if (on) { if (unlocked) start(want); } else stop(); },
      get enabled() { return on; },
      get want() { return want; }
    };
  }

  // Schedules a whole song into any audio context (for example an OfflineAudioContext) from time 0.
  function render(a, song, seconds) {
    const P = prep(song), bus = a.createGain(); bus.gain.value = .5;
    const comp = a.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.attack.value = .004; comp.release.value = .2;
    bus.connect(comp).connect(a.destination);
    const V = makeVoice(a, bus), sd = 60 / P.song.bpm / 4;
    for (let i = 0, t = .05; t < seconds; i++, t += sd) playStep(a, V, P, i, t, sd);
  }
  Kit.groove = { create, render };
})(window.Kit = window.Kit || {});
