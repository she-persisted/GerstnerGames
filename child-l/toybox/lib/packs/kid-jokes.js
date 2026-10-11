/* ==========================================================================
   Toybox Layer 4: Content pack "kid-jokes"
   Pack type "jokes": items [{q: setup, a: punchline}, ...]
   Used as the prize when the candy jar fills. Keep them short and kind.
   ========================================================================== */
(function (T) {
  'use strict';
  T.packs.add({
    id: 'kid-jokes',
    type: 'jokes',
    title: 'Jar-full jokes',
    items: [
      { q: 'What do you call a dog who does magic?', a: 'A labracadabrador!' },
      { q: 'What do you call a bear with no teeth?', a: 'A gummy bear!' },
      { q: 'What do you call a fish with no eyes?', a: 'A fsh!' },
      { q: 'Why are fish so smart?', a: 'Because they live in schools!' },
      { q: 'What kind of key opens a banana?', a: 'A monkey!' },
      { q: 'What do you call a sleeping dinosaur?', a: 'A dino-snore!' },
      { q: 'Why do bees have sticky hair?', a: 'Because they use honeycombs!' },
      { q: 'Why did the teddy bear say no to dessert?', a: 'Because it was already stuffed!' },
      { q: 'Knock knock! Who\u2019s there? Boo. Boo who?', a: 'Don\u2019t cry, it\u2019s only a joke!' }
    ]
  });
})(window.Toybox);
