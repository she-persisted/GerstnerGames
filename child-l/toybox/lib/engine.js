/* ==========================================================================
   Toybox Layer 2: Engine
   Shared services every game uses: registries, voice, sound player, effects,
   storage, progress, candy jar, joke party, and small UI builders.
   Depends on: Layer 0 (theme.css class names). Knows nothing about specific
   characters, words or games.
   Load order on a page: theme.css, engine.js, assets/*, packs/*, mechanics/*,
   shell.js, then the game's config script.
   ========================================================================== */
(function (global) {
  'use strict';
  const T = global.Toybox = global.Toybox || {};
  T.version = '1.2.0';

  /* ---------- registries: each layer adds its definitions here ---------- */
  function registry(kind) {
    const map = new Map();
    return {
      kind: kind,
      add(def) {
        if (!def || !def.id) throw new Error('Toybox: a ' + kind + ' needs an id');
        map.set(def.id, def);
        return def;
      },
      addMany(defs) { defs.forEach(d => this.add(d)); },
      get(id) { return map.get(id); },
      has(id) { return map.has(id); },
      all() { return Array.from(map.values()); }
    };
  }
  T.characters = registry('character');
  T.pictures = registry('picture');
  T.sounds = registry('sound');
  T.packs = registry('pack');
  T.mechanics = registry('mechanic');

  /* ---------- utilities ---------- */
  const U = T.util = {
    esc(s) {
      return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    },
    pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
      return a;
    },
    cap(w) { return w ? w.charAt(0).toUpperCase() + w.slice(1) : ''; },
    /* fill('Yes! {Word}!', {Word:'Fox'}) -> 'Yes! Fox!' */
    fill(tpl, vars) { return String(tpl).replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] != null ? vars[k] : '')); },
    /* re-trigger a CSS animation class */
    restart(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); },
    reduced: !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches)
  };

  /* ---------- fonts (Google Fonts is the only font host artifacts allow) ---------- */
  T.useFonts = function () {
    if (document.querySelector('link[data-tb-fonts]')) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.setAttribute('data-tb-fonts', '');
    l.href = 'https://fonts.googleapis.com/css2?family=Andika:wght@400;700&family=Grandstander:wght@600;800&display=swap';
    document.head.appendChild(l);
  };
  T.useFonts();

  /* ---------- storage: per game, per browser. Never throws. ---------- */
  T.store = function (ns) {
    const pre = 'toybox:' + ns + ':';
    function read(key, fallback) {
      try { const v = global.localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
    }
    return {
      get(k, fallback) { return read(pre + k, fallback); },
      set(k, v) { try { global.localStorage.setItem(pre + k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } },
      raw(fullKey, fallback) { return read(fullKey, fallback); }
    };
  };

  /* ---------- progress: right/miss tally per game type and word ---------- */
  T.Progress = function (store) {
    return {
      log(mechanicId, word, ok) {
        const all = store.get('tally', {}) || {};
        const m = all[mechanicId] = all[mechanicId] || {};
        const t = m[word] = m[word] || { right: 0, miss: 0 };
        if (ok) t.right++; else t.miss++;
        store.set('tally', all);
      },
      tricky(mechanicId, n) {
        const m = (store.get('tally', {}) || {})[mechanicId] || {};
        return Object.keys(m)
          .map(w => ({ word: w, right: m[w].right, miss: m[w].miss }))
          .filter(r => r.miss > 0)
          .sort((x, y) => y.miss - x.miss || x.right - y.right)
          .slice(0, n || 5);
      },
      clear() { store.set('tally', {}); }
    };
  };

  /* ---------- voice: recorded clips first, the browser's text-to-speech otherwise ----------
     A clip set (assets/voice-clips.js) maps spoken text to mp3 files made ahead of
     time. say() plays clips when every part has one, so a sentence is never split
     between two voices; anything without a clip uses text-to-speech. */
  const clipSets = {};
  let defaultClips = null;
  let playing = null;
  /* the lookup key for a part: words only, lowercase; slow parts get their own clip */
  function clipKey(text, rate) {
    const words = String(text).toLowerCase().replace(/['\u2018\u2019]/g, '')
      .replace(/[^a-z0-9]+/g, ' ').trim();
    return (rate && rate < 0.85) ? words + ' |slow' : words;
  }
  function clipsFor(parts, s) {
    const set = clipSets[s.clips] || defaultClips;
    if (!set || !parts.length) return null;
    const files = parts.map(p => set.clips[clipKey(p.t, p.rate)]);
    return files.every(Boolean) ? files.map(f => set.base + f) : null;
  }
  function stopClip() { if (playing) { playing.pause(); playing = null; } }
  function playClips(files, mine) {
    let i = 0;
    (function next() {
      if (mine !== sayToken || i >= files.length) { playing = null; return; }
      const a = playing = new Audio(files[i++]);
      a.onended = () => setTimeout(next, 120);
      a.onerror = next;
      a.play().catch(next);
    })();
  }

  const synth = ('speechSynthesis' in global) ? global.speechSynthesis : null;
  let chosenVoice = null;
  let sayToken = 0;
  function pickVoice() {
    if (!synth) return;
    const vs = synth.getVoices() || [];
    const prefs = [
      v => /Google US English/i.test(v.name),
      v => /^en[-_]US/i.test(v.lang) && /Samantha|Aria|Jenny|Ava|Allison|Natural/i.test(v.name),
      v => /^en[-_]US/i.test(v.lang),
      v => /^en/i.test(v.lang)
    ];
    for (const p of prefs) { const v = vs.find(p); if (v) { chosenVoice = v; return; } }
  }
  if (synth) { pickVoice(); synth.onvoiceschanged = pickVoice; }

  T.voice = {
    available: !!synth,
    key: clipKey,
    /* set: {id, base: 'lib/assets/voice/<id>/', clips: {key: 'file.mp3'}}. The first set added is the default. */
    addClips(set) {
      clipSets[set.id] = set;
      if (!defaultClips) defaultClips = set;
      T.voice.available = true;
    },
    /* parts: 'text' or [{t:'text', rate, pitch}, ...]; style: {rate, pitch, clips} defaults */
    say(parts, style) {
      if (typeof parts === 'string') parts = [{ t: parts }];
      parts = (parts || []).filter(p => p && p.t);
      const s = style || {};
      const mine = ++sayToken;
      stopClip();
      const files = clipsFor(parts, s);
      if (files) { if (synth) synth.cancel(); playClips(files, mine); return; }
      if (!synth) return;
      synth.cancel();
      setTimeout(() => {   // Chrome can drop speech queued right after cancel()
        if (mine !== sayToken) return;
        parts.forEach(p => {
          const u = new SpeechSynthesisUtterance(p.t);
          if (chosenVoice) u.voice = chosenVoice;
          u.lang = chosenVoice ? chosenVoice.lang : 'en-US';
          u.rate = p.rate || s.rate || 0.95;
          u.pitch = p.pitch || s.pitch || 1;
          synth.speak(u);
        });
      }, 70);
    },
    hush() { sayToken++; stopClip(); if (synth) synth.cancel(); }
  };

  /* ---------- host: a character wrapped with speaking + line picking ---------- */
  T.host = function (id) {
    const def = T.characters.get(id);
    if (!def) throw new Error('Toybox: unknown character "' + id + '"');
    return {
      def: def,
      html() { return def.render(); },
      /* random line of a kind, with {vars} filled in */
      line(kind, vars) {
        const list = (def.lines && def.lines[kind]) || [];
        return list.length ? U.fill(U.pick(list), vars || {}) : '';
      },
      say(parts) { T.voice.say(parts, def.voice); }
    };
  };

  /* ---------- sound player: plays recipes registered in assets/sounds.js ---------- */
  let actx = null;
  function audio() {
    if (!actx) {
      const C = global.AudioContext || global.webkitAudioContext;
      if (C) { try { actx = new C(); } catch (e) { actx = null; } }
    }
    if (actx && actx.state === 'suspended') actx.resume();
    return actx;
  }
  document.addEventListener('pointerdown', audio, { once: true, capture: true });
  T.sfx = {
    unlock: audio,
    play(id) {
      const s = T.sounds.get(id);
      const a = audio();
      if (!s || !a) return;
      const now = a.currentTime;
      s.notes.forEach(n => {
        const t = now + (n.at || 0), dur = n.dur || 0.2;
        const o = a.createOscillator(), g = a.createGain();
        o.type = n.wave || 'triangle';
        o.frequency.setValueAtTime(n.f, t);
        if (n.to) o.frequency.exponentialRampToValueAtTime(n.to, t + dur);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(n.vol || 0.15, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(a.destination);
        o.start(t); o.stop(t + dur + 0.05);
      });
    }
  };

  /* ---------- art: turns picture ids into markup ---------- */
  T.art = {
    picture(word) {
      const p = T.pictures.get(word);
      if (!p) {   // missing picture: a letter tile, so a new word never breaks a game
        return '<span class="tb-pic tb-pic-letter" aria-hidden="true"><span>' + U.esc(String(word).charAt(0)) + '</span></span>';
      }
      if (p.svg) return '<span class="tb-pic" aria-hidden="true">' + p.svg + '</span>';
      return '<span class="tb-pic' + (p.cls ? ' ' + p.cls : '') + '" aria-hidden="true">' + p.emoji +
        (p.extra ? '<span class="tb-pic-extra">' + p.extra + '</span>' : '') + '</span>';
    }
  };

  /* ---------- effects ---------- */
  let confettiCanvas = null;
  T.fx = {
    sparkle(el) {
      if (U.reduced || !el || !el.animate) return;
      for (let i = 0; i < 8; i++) {
        const s = document.createElement('span');
        s.className = 'tb-spark';
        s.textContent = '\u2605';
        el.appendChild(s);
        const ang = i / 8 * Math.PI * 2, d = 70 + Math.random() * 35;
        s.animate([
          { transform: 'translate(-50%,-50%) scale(.3)', opacity: 1 },
          { transform: 'translate(calc(-50% + ' + Math.round(Math.cos(ang) * d) + 'px), calc(-50% + ' + Math.round(Math.sin(ang) * d) + 'px)) scale(1)', opacity: 0 }
        ], { duration: 720, easing: 'ease-out' }).onfinish = () => s.remove();
      }
    },
    /* a candy flies from one element to another, then done() */
    fly(fromEl, toEl, color, done) {
      if (U.reduced || !document.body.animate || !fromEl || !toEl) { done(); return; }
      const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
      const c = document.createElement('span');
      c.className = 'tb-flying';
      c.style.background = color;
      document.body.appendChild(c);
      const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2;
      const x1 = b.left + b.width / 2, y1 = b.top + b.height / 2;
      const anim = c.animate([
        { transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(1.7)' },
        { transform: 'translate(' + ((x0 + x1) / 2) + 'px,' + (Math.min(y0, y1) - 90) + 'px) scale(1.3)', offset: 0.5 },
        { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(.6)' }
      ], { duration: 760, easing: 'cubic-bezier(.3,.7,.4,1)' });
      anim.onfinish = () => { c.remove(); done(); };
    },
    confetti() {
      if (U.reduced) return;
      if (!confettiCanvas) {
        confettiCanvas = document.createElement('canvas');
        confettiCanvas.className = 'tb-confetti';
        confettiCanvas.setAttribute('aria-hidden', 'true');
        document.body.appendChild(confettiCanvas);
      }
      const cv = confettiCanvas, c = cv.getContext('2d');
      if (!c) return;
      const dpr = Math.min(2, global.devicePixelRatio || 1);
      const W = global.innerWidth, H = global.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cs = getComputedStyle(document.documentElement);
      const cols = [1, 2, 3, 4, 5].map(n => cs.getPropertyValue('--tb-c' + n).trim());
      const ps = Array.from({ length: 80 }, () => ({
        x: W / 2 + (Math.random() - 0.5) * 90, y: H * 0.38,
        vx: (Math.random() - 0.5) * 13, vy: -Math.random() * 13 - 4,
        r: Math.random() * 6 + 5, col: cols[Math.floor(Math.random() * 5)]
      }));
      const t0 = performance.now(), LIFE = 2600;
      (function frame(t) {
        const el = t - t0;
        c.clearRect(0, 0, W, H);
        c.globalAlpha = Math.max(0, 1 - el / LIFE);
        ps.forEach(p => {
          p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.vx *= 0.99;
          c.beginPath(); c.arc(p.x, p.y, p.r, 0, Math.PI * 2); c.fillStyle = p.col; c.fill();
        });
        if (el < LIFE) requestAnimationFrame(frame); else { c.globalAlpha = 1; c.clearRect(0, 0, W, H); }
      })(t0);
    }
  };

  /* ---------- UI builders shared by game types ---------- */
  T.ui = {
    /* host + speech bubble + replay button. Returns {el, bubble, speak}. */
    promptRow(host, speakLabel) {
      const row = document.createElement('div');
      row.className = 'tb-prompt';
      row.innerHTML = '<span class="tb-host" aria-hidden="true">' + host.html() + '</span>' +
        '<p class="tb-bubble" aria-live="polite"></p>' +
        '<button class="tb-speak" type="button" aria-label="' + U.esc(speakLabel || 'Hear it again') + '">\uD83D\uDD0A</button>';
      return { el: row, bubble: row.querySelector('.tb-bubble'), speak: row.querySelector('.tb-speak') };
    },
    /* a tappable picture card for one word; attrs is extra attribute text */
    card(word, attrs) {
      return '<button type="button" class="tb-card" aria-label="' + U.esc(word) + '" ' + (attrs || '') + '>' +
        T.art.picture(word) + '<span class="tb-word">' + U.esc(word) + '</span></button>';
    }
  };

  /* ---------- candy jar: the reward meter in the top bar (fits up to 12) ---------- */
  T.Jar = function (mount, goal, onFull) {
    mount.classList.add('tb-jar-wrap');
    mount.innerHTML = '<span class="tb-jar-text" aria-live="polite"></span>' +
      '<div class="tb-jar" aria-hidden="true"><div class="tb-jar-candies"></div></div>';
    const text = mount.querySelector('.tb-jar-text');
    const jar = mount.querySelector('.tb-jar');
    const box = mount.querySelector('.tb-jar-candies');
    let count = 0;
    function render() {
      let h = '';
      for (let i = 0; i < goal; i++) {
        h += i < count ? '<span class="tb-jc tb-on" style="background:var(--tb-c' + (i % 5 + 1) + ')"></span>' : '<span class="tb-jc"></span>';
      }
      box.innerHTML = h;
      text.textContent = count + ' of ' + goal;
    }
    const api = {
      goal: goal,
      get count() { return count; },
      set(n) { count = Math.max(0, Math.min(goal, n | 0)); render(); },
      add(fromEl, then) {
        T.fx.fly(fromEl, jar, 'var(--tb-c' + (count % 5 + 1) + ')', () => {
          count = Math.min(goal, count + 1);
          render();
          U.restart(jar, 'tb-bump');
          T.sfx.play('plink');
          if (count >= goal) setTimeout(onFull, 500);
          else if (then) then();
        });
      }
    };
    render();
    return api;
  };

  /* ---------- joke party: shown when the jar fills ---------- */
  T.Party = function (opts) {
    const host = opts.host;
    const jokes = (opts.jokes && opts.jokes.length) ? opts.jokes : [{ q: 'Guess what?', a: 'You did it!' }];
    const el = document.createElement('div');
    el.className = 'tb-party';
    el.hidden = true;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Jar full');
    el.innerHTML = '<div class="tb-party-card">' +
      '<span class="tb-host" aria-hidden="true">' + host.html() + '</span>' +
      '<h2 class="tb-party-title">Jar full!</h2>' +
      '<div class="tb-big-jar" aria-hidden="true"></div>' +
      '<p class="tb-joke-q"></p>' +
      '<button type="button" class="tb-pill" data-act="tell">Tell me!</button>' +
      '<p class="tb-joke-a" hidden></p>' +
      '<div class="tb-party-actions">' +
      '<button type="button" class="tb-pill" data-act="again">Play again</button>' +
      '<button type="button" class="tb-pill tb-ghost" data-act="home">Home</button>' +
      '</div></div>';
    document.body.appendChild(el);
    const q = el.querySelector('.tb-joke-q'), a = el.querySelector('.tb-joke-a'), tell = el.querySelector('[data-act="tell"]');
    let idx = opts.store ? opts.store.get('jokeIdx', Math.floor(Math.random() * jokes.length)) : 0;
    let joke = null, isOpen = false;

    el.addEventListener('click', e => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const act = b.getAttribute('data-act');
      if (act === 'tell') {
        a.hidden = false; tell.hidden = true;
        T.sfx.play('giggle'); host.say(joke.a);
        el.querySelector('[data-act="again"]').focus();
        return;
      }
      api.close();
      if (act === 'again' && opts.onAgain) opts.onAgain();
      if (act === 'home' && opts.onHome) opts.onHome();
    });

    const api = {
      get isOpen() { return isOpen; },
      open(goal) {
        joke = jokes[idx % jokes.length]; idx++;
        if (opts.store) opts.store.set('jokeIdx', idx);
        let h = '';
        for (let i = 0; i < goal; i++) h += '<span style="background:var(--tb-c' + (i % 5 + 1) + ')"></span>';
        el.querySelector('.tb-big-jar').innerHTML = h;
        q.textContent = joke.q; a.textContent = joke.a;
        a.hidden = true; tell.hidden = false;
        el.hidden = false; isOpen = true;
        T.sfx.play('fanfare'); T.fx.confetti();
        host.say([{ t: host.line('jarFull') }, { t: joke.q }]);
        tell.focus();
      },
      close() { el.hidden = true; isOpen = false; }
    };
    return api;
  };
})(window);
