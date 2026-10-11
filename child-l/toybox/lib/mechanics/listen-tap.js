/* ==========================================================================
   Toybox Layer 3: Game type "listen-tap" (Listen Game)
   Hearing practice. The host says one word of a pair; the child taps its
   picture. Accepts packs of type "minimal-pairs". No grown-up needed.

   Game type contract (every file in mechanics/ follows it):
     id, title, blurb, grownUpNote ({host} and {child} are filled in),
     icon (emoji), accent ('sun' | 'candy' | 'mint'), accepts: [pack types],
     create(ctx) -> { start(introParts), stop() }
   ctx, supplied by the shell:
     root        the screen element to build into
     host        T.host(...) for the game's character
     nextItem()  -> {words:[a,b], sounds:[...], pack}
     reward(el, then)  fly a candy from el to the jar, then call then()
     progress    .log(mechanicId, word, ok)
     isActive()  false once the child leaves the screen or the party opens
   ========================================================================== */
(function (T) {
  'use strict';
  const U = T.util;

  T.mechanics.add({
    id: 'listen-tap',
    title: 'Listen Game',
    blurb: '{host} says a word. You tap the picture.',
    grownUpNote: '{child} can play this one alone. {host} says a word and {child} taps the picture.',
    icon: '\uD83D\uDC42',
    accent: 'sun',
    accepts: ['minimal-pairs'],

    create(ctx) {
      const host = ctx.host;
      const prompt = T.ui.promptRow(host, 'Hear the word again');
      const cards = document.createElement('div');
      cards.className = 'tb-cards';
      ctx.root.append(prompt.el, cards);

      let round = null, locked = false, firstTry = true, timer = null;

      function ask(prefix) {
        const w = round.words[round.target];
        host.say((prefix || []).concat([{ t: host.line('find') }, { t: w, rate: 0.72 }]));
      }

      function next(prefix) {
        clearTimeout(timer);
        const item = ctx.nextItem();
        round = { words: item.words, target: Math.random() < 0.5 ? 0 : 1 };
        locked = false; firstTry = true;
        cards.innerHTML = U.shuffle([0, 1]).map(i => T.ui.card(item.words[i], 'data-i="' + i + '"')).join('');
        prompt.bubble.textContent = host.line('whichOne');
        ask(prefix);
      }

      cards.addEventListener('click', e => {
        const btn = e.target.closest('.tb-card');
        if (!btn || locked || !round) return;
        const i = Number(btn.getAttribute('data-i'));
        const w = round.words[round.target];
        if (i === round.target) {
          locked = true;
          if (firstTry) ctx.progress.log('listen-tap', w, true);
          btn.classList.add('tb-right');
          Array.from(cards.children).forEach(c => { if (c !== btn) c.classList.add('tb-dim'); });
          T.sfx.play('chime'); T.fx.sparkle(btn);
          const text = host.line('praise', { word: w, Word: U.cap(w) });
          prompt.bubble.textContent = text;
          host.say(text);
          ctx.reward(btn, () => { timer = setTimeout(() => { if (ctx.isActive()) next(); }, 950); });
        } else {
          if (firstTry) ctx.progress.log('listen-tap', w, false);
          firstTry = false;
          U.restart(btn, 'tb-wrong');
          T.sfx.play('boing');
          const text = host.line('oops', { other: round.words[i] });
          prompt.bubble.textContent = text;
          host.say([{ t: text }, { t: host.line('find') }, { t: w, rate: 0.72 }]);
        }
      });

      prompt.speak.addEventListener('click', () => { if (round) ask(); });

      return {
        start(prefix) { next(prefix); },
        stop() { clearTimeout(timer); }
      };
    }
  });
})(window.Toybox);
