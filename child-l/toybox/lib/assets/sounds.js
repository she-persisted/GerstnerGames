/* ==========================================================================
   Toybox Layer 1: Sounds
   Sound effects as recipes (no audio files). The engine plays each note with
   the Web Audio API. Keep the same sound for the same meaning in every game.
   A sound definition:
     id, label (what it means), notes: [{f, at, dur, wave, vol, to}]
       f    start frequency in Hz       at   start time in seconds
       dur  length in seconds           wave sine | triangle | square | sawtooth
       vol  peak volume (0 to 1)        to   optional end frequency (a slide)
   Ids the engine and game types use: chime, boing, plink, fanfare, giggle.
   ========================================================================== */
(function (T) {
  'use strict';
  T.sounds.addMany([
    {
      id: 'chime', label: 'Right answer',
      notes: [784, 988, 1319].map((f, i) => ({ f: f, at: i * 0.08, dur: 0.28, wave: 'triangle', vol: 0.16 }))
    },
    {
      id: 'boing', label: 'Silly mix-up or wrong picture',
      notes: [{ f: 440, to: 110, dur: 0.5, wave: 'sine', vol: 0.22 }]
    },
    {
      id: 'plink', label: 'Candy lands in the jar',
      notes: [{ f: 1568, dur: 0.14, wave: 'sine', vol: 0.12 }]
    },
    {
      id: 'fanfare', label: 'Jar full',
      notes: [523, 659, 784, 1047, 784, 1047].map((f, i) => ({ f: f, at: i * 0.11, dur: 0.24, wave: 'square', vol: 0.06 }))
    },
    {
      id: 'giggle', label: 'Biscuit giggles',
      notes: [1200, 1500, 1250, 1560, 1320].map((f, i) => ({ f: f, at: i * 0.07, dur: 0.09, wave: 'sine', vol: 0.1 }))
    }
  ]);
})(window.Toybox);
