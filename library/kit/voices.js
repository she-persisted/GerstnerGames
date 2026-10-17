/**
 * @file kit/voices.js
 * @about Cartoon voices made in code (no recordings): a villain's evil laugh ("MWAH-HA-HA-HA-HAAA!") and a grumbly mutter for when a villain talks. Each syllable is a buzzy tone shaped by vowel filters, with a breathy "h" or a humming "m" at the start, plus a little echo, so it sounds a bit like a voice.
 * @provides Kit.voices { evilLaugh(options) -> seconds, mutter(seconds, options) -> seconds }
 * @requires kit/audio.js
 *
 * evilLaugh({ pitch (Hz, default 120), has (how many HAs, default 4), squeak (true to end with a tiny voice crack; default: now and then) })
 * mutter(seconds, { pitch })
 * Both return how long they last, so a game can animate along with them. They stay silent when sound is off (Kit.audio.setEnabled),
 * but still return their length. Pass { ctx: someAudioContext, at: seconds } to draw into another context (the play-test uses this).
 */
(function (Kit) {
  "use strict";
  const A = Kit.audio;
  const buses = new WeakMap();
  function out(a) {
    let b = buses.get(a);
    if (b) return b;
    b = a.createGain(); b.gain.value = 1;
    const d = a.createDelay(1), fb = a.createGain(), wet = a.createGain();
    d.delayTime.value = .17; fb.gain.value = .26; wet.gain.value = .32;
    b.connect(a.destination); b.connect(d); d.connect(fb).connect(d); d.connect(wet).connect(a.destination);
    buses.set(a, b);
    return b;
  }
  // One sung "ah" from pitch f0 sliding to f1. onset "h" = breathy start, "m" = humming start.
  function syl(a, t, dur, f0, f1, { vol = .19, onset = "h", vib = 0 } = {}) {
    const dest = out(a);
    const src = a.createOscillator(); src.type = "sawtooth";
    src.frequency.setValueAtTime(f0, t); src.frequency.linearRampToValueAtTime(f1, t + dur);
    if (vib) { const l = a.createOscillator(), lg = a.createGain(); l.frequency.value = 6.5; lg.gain.value = f1 * vib; l.connect(lg).connect(src.frequency); l.start(t); l.stop(t + dur + .05); }
    const lips = a.createBiquadFilter(); lips.type = "lowpass"; lips.Q.value = .7;
    lips.frequency.setValueAtTime(onset === "m" ? 260 : 4200, t); lips.frequency.exponentialRampToValueAtTime(4200, t + (onset === "m" ? .12 : .03));
    const env = a.createGain(); env.gain.setValueAtTime(.0001, t);
    env.gain.exponentialRampToValueAtTime(vol, t + (onset === "m" ? .07 : .025));
    env.gain.setValueAtTime(vol, t + dur * .6); env.gain.exponentialRampToValueAtTime(.0001, t + dur);
    src.connect(lips);
    for (const [fq, q, gn] of [[740, 5, 1], [1120, 7, .7], [2500, 9, .3]]) { // the vowel "ah"
      const bp = a.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = fq; bp.Q.value = q;
      const gg = a.createGain(); gg.gain.value = gn * 2.6; lips.connect(bp).connect(gg).connect(env);
    }
    env.connect(dest);
    src.start(t); src.stop(t + dur + .05);
    if (onset === "h") {
      const n = a.createBufferSource(), bp = a.createBiquadFilter(), ng = a.createGain();
      n.buffer = A.noiseBuffer(a); bp.type = "bandpass"; bp.frequency.value = 1400; bp.Q.value = 1.2;
      const t0 = Math.max(0, t - .05);
      ng.gain.setValueAtTime(.0001, t0); ng.gain.exponentialRampToValueAtTime(vol * .45, t0 + .03); ng.gain.exponentialRampToValueAtTime(.0001, t + .03);
      n.connect(bp).connect(ng).connect(dest); n.start(t0); n.stop(t + .05);
    }
  }
  function perform(plan, o) {
    const last = plan[plan.length - 1], total = last.t + last.d + .2;
    const a = o.ctx || (A.enabled ? A.ctx() : null);
    if (a) { const t0 = o.ctx ? (o.at || 0) : a.currentTime + .03; for (const p of plan) syl(a, t0 + p.t, p.d, p.a0, p.a1, p); }
    return total;
  }

  function evilLaugh(o = {}) {
    const P = o.pitch || 120, has = o.has || 4, squeak = o.squeak == null ? Math.random() < .35 : o.squeak;
    const plan = [];
    let t = .02;
    const add = (d, a0, a1, onset, extra = {}) => { plan.push({ t, d, a0, a1, onset, ...extra }); t += d + (onset === "m" ? .07 : .055); };
    add(.34, P * 1.02, P * 1.28, "m", { vib: .02 });                         // MWAH
    for (let i = 0; i < has; i++) add(.15, P * (1.36 - i * .07), P * (1.3 - i * .07), "h"); // HA HA HA HA
    add(.46, P * 1.02, P * .84, "h", { vib: .045 });                         // HAAAA
    if (squeak) { t += .05; add(.16, P * 5.6, P * 7, "h", { vol: .07, vib: .03 }); } // ...eep! (a teeny voice crack)
    return perform(plan, o);
  }
  function mutter(sec = 1, o = {}) {
    const P = o.pitch || 105, plan = [];
    let t = .02, i = 0;
    while (t < sec - .15) { const d = .09 + ((i * 37) % 11) / 80, f = P * (1 + ((i * 53) % 7) / 18); plan.push({ t, d, a0: f, a1: f * .9, onset: i % 2 ? "h" : "m", vol: .1 }); t += d + .05; i++; }
    if (!plan.length) plan.push({ t: .02, d: .12, a0: P, a1: P * .9, onset: "m", vol: .1 });
    perform(plan, o);
    return sec;
  }
  Kit.voices = { evilLaugh, mutter };
})(window.Kit = window.Kit || {});
