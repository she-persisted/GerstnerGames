/* ==========================================================================
   Toybox Layer 3: Game type "say-it" (Magic Word Game)
   Speaking practice, judged by a grown-up. The child says the word on the
   card; the grown-up taps the word they actually heard. Hearing the other
   word of the pair makes the host's magic produce that thing instead, which
   shows the child that the sound changes the word.
   Accepts packs of type "minimal-pairs". Needs a grown-up.
   Follows the game type contract described in listen-tap.js.
   ========================================================================== */
(function (T) {
  'use strict';
  const U = T.util;

  T.mechanics.add({
    id: 'say-it',
    title: 'Magic Word Game',
    blurb: 'You say the word. A grown-up listens.',
    grownUpNote: '{child} says the word on the card, and you tap the word you actually heard. If the other word comes out, {host}\u2019s magic makes that thing instead. The silly mix-up shows that the sound changes the word.',
    icon: '\uD83E\uDE84',
    accent: 'candy',
    accepts: ['minimal-pairs'],
    needsGrownUp: true,

    create(ctx) {
      const host = ctx.host;
      const prompt = T.ui.promptRow(host, 'Hear the word');
      const target = document.createElement('div');
      target.className = 'tb-card tb-target';
      const cue = document.createElement('p');
      cue.className = 'tb-cue';
      cue.hidden = true;
      const judge = document.createElement('div');
      judge.className = 'tb-judge';
      judge.innerHTML = '<span class="tb-label">Grown-up: what did you hear?</span><div class="tb-judge-row"></div>';
      const row = judge.querySelector('.tb-judge-row');
      ctx.root.append(prompt.el, target, cue, judge);

      let r = null, timer = null;

      function show(word, poof) {
        target.classList.remove('tb-right');
        target.innerHTML = T.art.picture(word) + '<span class="tb-word">' + U.esc(word) + '</span>';
        if (poof) U.restart(target, 'tb-poof');
      }
      function showCue() {
        const s = r.sounds && r.sounds[r.target];
        if (!s || !s.cue) return;
        cue.innerHTML = '<strong>' + U.esc(s.label) + ' sound:</strong> ' + U.esc(s.cue);
        cue.hidden = false;
      }
      function giveUpIfNeeded() {
        if (r.misses < 3) return false;
        r.locked = true;
        const t = host.line('newOne');
        prompt.bubble.textContent = t; host.say(t);
        timer = setTimeout(() => { if (ctx.isActive()) next(); }, 1900);
        return true;
      }
      function next(prefix) {
        clearTimeout(timer);
        const item = ctx.nextItem();
        r = { words: item.words, sounds: item.sounds, target: Math.random() < 0.5 ? 0 : 1, misses: 0, locked: false };
        show(r.words[r.target]);
        cue.hidden = true;
        row.innerHTML = r.words.map((w, i) =>
          '<button type="button" class="tb-jbtn" data-i="' + i + '">' + T.art.picture(w) + '<span>' + U.esc(w) + '</span></button>'
        ).join('') +
          '<button type="button" class="tb-jbtn tb-soft" data-act="close">Not quite</button>' +
          '<button type="button" class="tb-jbtn tb-soft" data-act="skip">New word</button>';
        const t = host.line('sayPrompt');
        prompt.bubble.textContent = t;
        host.say((prefix || []).concat([{ t: t }]));
      }

      row.addEventListener('click', e => {
        const b = e.target.closest('.tb-jbtn');
        if (!b || !r || r.locked) return;
        const w = r.words[r.target];
        const act = b.getAttribute('data-act');
        if (act === 'skip') { next(); return; }
        if (act === 'close') {
          r.misses++;
          ctx.progress.log('say-it', w, false);
          showCue();
          if (!giveUpIfNeeded()) { const t = host.line('close'); prompt.bubble.textContent = t; host.say(t); }
          return;
        }
        const i = Number(b.getAttribute('data-i'));
        if (i === r.target) {
          r.locked = true;
          ctx.progress.log('say-it', w, true);
          target.classList.add('tb-right');
          cue.hidden = true;
          T.sfx.play('chime'); T.fx.sparkle(target);
          const t = host.line('abracadabra', { word: w, Word: U.cap(w) });
          prompt.bubble.textContent = t; host.say(t);
          ctx.reward(target, () => { timer = setTimeout(() => { if (ctx.isActive()) next(); }, 1100); });
        } else {
          r.misses++; r.locked = true;
          ctx.progress.log('say-it', w, false);
          const other = r.words[i];
          show(other, true);
          T.sfx.play('boing');
          showCue();
          const t = host.line('mixup', { other: other });
          prompt.bubble.textContent = t; host.say(t);
          timer = setTimeout(() => {
            if (!ctx.isActive()) return;
            show(w);
            r.locked = false;
            if (!giveUpIfNeeded()) {
              const again = host.line('tryAgain');
              prompt.bubble.textContent = again + ' Say \u201C' + w + '.\u201D';
              host.say([{ t: again }, { t: w, rate: 0.72 }]);
            }
          }, 2700);
        }
      });

      prompt.speak.addEventListener('click', () => { if (r) host.say([{ t: r.words[r.target], rate: 0.7 }]); });

      return {
        start(prefix) { next(prefix); },
        stop() { clearTimeout(timer); }
      };
    }
  });
})(window.Toybox);
