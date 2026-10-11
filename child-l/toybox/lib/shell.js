/* ==========================================================================
   Toybox Layer 5: Shell
   Toybox.launch(config) builds a complete game around the chosen game types
   and packs: night sky, top bar with the candy jar, home screen, one screen
   per game type, grown-up corner, and the joke party.
   A game page holds nothing but its config.

   config:
     id         storage name for this game ('magic-words')
     title      shown on the home screen
     child      child's name, used in grown-up text ('friend')
     host       character id ('biscuit')
     welcome    home screen greeting
     mechanics  game type ids, in menu order (['listen-tap', 'say-it'])
     packs      content pack ids (['fb-initial'])
     jokes      jokes pack id ('kid-jokes')
     goal       candies to fill the jar (default 10, max 12)
     toybox     Toybox version the game was built against ('1.0.0')
     legacy     optional {total, enabled}: localStorage keys from an older
                version of the game, imported once
   ========================================================================== */
(function (global) {
  'use strict';
  const T = global.Toybox;
  const U = T.util;

  T.launch = function (cfg) {
    if (!document.body) {   // config ran in <head>: build once the page body exists
      document.addEventListener('DOMContentLoaded', () => T.launch(cfg), { once: true });
      return null;
    }
    if (cfg.toybox && cfg.toybox !== T.version) {
      console.warn('Toybox: game built for ' + cfg.toybox + ', running ' + T.version);
    }
    const host = T.host(cfg.host || 'biscuit');
    const child = cfg.child || 'your child';
    const store = T.store(cfg.id);
    const progress = T.Progress(store);
    const goal = Math.min(12, cfg.goal || 10);

    const mechs = cfg.mechanics.map(id => {
      const m = T.mechanics.get(id);
      if (!m) throw new Error('Toybox: unknown game type "' + id + '"');
      return m;
    });
    const packs = cfg.packs.map(id => {
      const p = T.packs.get(id);
      if (!p) throw new Error('Toybox: unknown pack "' + id + '"');
      return p;
    });
    mechs.forEach(m => {
      if (!packs.some(p => m.accepts.indexOf(p.type) >= 0)) {
        throw new Error('Toybox: game type "' + m.id + '" has no pack it can use');
      }
    });
    packs.forEach(p => (p.items || []).forEach(it => [].concat(it).forEach(w => {
      if (typeof w === 'string' && !T.pictures.has(w)) console.warn('Toybox: no picture for "' + w + '" (a letter tile will show)');
    })));
    const jokePack = cfg.jokes ? T.packs.get(cfg.jokes) : null;
    const jokes = jokePack ? jokePack.items : [];

    /* ---------- saved state ---------- */
    if (cfg.legacy) {
      if (cfg.legacy.total && store.get('total', null) == null) {
        const v = store.raw(cfg.legacy.total, null);
        if (Number.isFinite(v)) store.set('total', v);
      }
      if (cfg.legacy.enabled && store.get('enabled', null) == null && packs[0]) {
        const v = store.raw(cfg.legacy.enabled, null);
        if (Array.isArray(v)) { const o = {}; o[packs[0].id] = v; store.set('enabled', o); }
      }
    }
    let total = Number(store.get('total', 0)) || 0;
    const enabled = store.get('enabled', {}) || {};
    packs.forEach(p => {
      const e = enabled[p.id];
      if (!Array.isArray(e) || e.length !== p.items.length || !e.some(Boolean)) enabled[p.id] = p.items.map(() => true);
    });

    /* ---------- frame ---------- */
    document.documentElement.classList.add('tb-locked');
    if (!document.title) document.title = cfg.title;

    const sky = document.createElement('div');
    sky.className = 'tb-sky';
    sky.setAttribute('aria-hidden', 'true');
    let stars = '';
    for (let i = 0; i < 34; i++) {
      const s = (Math.random() * 2 + 1.5).toFixed(1);
      stars += '<span class="tb-star" style="left:' + (Math.random() * 100).toFixed(1) + '%;top:' + (Math.random() * 68).toFixed(1) +
        '%;width:' + s + 'px;height:' + s + 'px;animation-delay:-' + (Math.random() * 3.4).toFixed(2) + 's"></span>';
    }
    sky.innerHTML = stars;

    const app = document.createElement('div');
    app.className = 'tb-app';
    app.innerHTML =
      '<header class="tb-topbar">' +
        '<button type="button" class="tb-pill tb-ghost tb-small" data-nav="home" hidden><span class="tb-e" aria-hidden="true">\uD83C\uDFE0</span>Home</button>' +
        '<span class="tb-brand" hidden>' + U.esc(cfg.title) + '</span>' +
        '<span class="tb-spacer"></span><div class="tb-jar-mount"></div>' +
      '</header>' +
      (T.voice.available ? '' : '<p class="tb-notice">' + U.esc(host.def.name) + ' can\u2019t talk in this browser. Open this page in Chrome, or a grown-up can read the words out loud.</p>') +
      '<main class="tb-main"><section class="tb-screen" data-screen="home"></section>' +
      mechs.map(m => '<section class="tb-screen" data-screen="' + m.id + '" hidden></section>').join('') +
      '</main>';
    document.body.append(sky, app);

    /* ---------- home screen ---------- */
    const hostName = host.def.name;
    const home = app.querySelector('[data-screen="home"]');
    const cues = [];
    packs.forEach(p => (p.sounds || []).forEach(s => { if (s.cue && !cues.some(c => c.label === s.label)) cues.push(s); }));

    home.innerHTML =
      '<div class="tb-hero">' +
        '<button type="button" class="tb-host tb-host-big" aria-label="Hear ' + U.esc(hostName) + ' say hi">' + host.html() + '</button>' +
        '<h1 class="tb-title">' + U.esc(cfg.title) + '</h1>' +
        '<p class="tb-lede">' + U.esc(cfg.welcome || '') + '</p>' +
      '</div>' +
      '<div class="tb-modes">' + mechs.map(m =>
        '<button type="button" class="tb-mode" data-go="' + m.id + '">' +
          '<span class="tb-mode-ico tb-accent-' + (m.accent || 'sun') + '" aria-hidden="true">' + m.icon + '</span>' +
          '<span class="tb-mode-txt"><b>' + U.esc(m.title) + '</b><small>' + U.esc(U.fill(m.blurb, { host: hostName })) + '</small></span>' +
        '</button>').join('') +
      '</div>' +
      '<p class="tb-total">Candies earned so far: <strong data-total>0</strong></p>' +
      '<details class="tb-grownup"><summary>Grown-up corner</summary><div class="tb-grownup-body">' +
        packs.filter(p => p.type !== 'jokes').map(p => '<p>' + U.esc(p.title) + (p.source ? ' (from ' + U.esc(p.source) + ')' : '') + '.</p>').join('') +
        mechs.map(m => '<p><b>' + U.esc(m.title) + ':</b> ' + U.esc(U.fill(m.grownUpNote, { host: hostName, child: child })) + '</p>').join('') +
        '<p>Keep it to 5 to 10 minutes and stop while ' + U.esc(child) + ' still wants more. The yellow speaker button plays the word first.</p>' +
        (cues.length ? '<div class="tb-cues">' + cues.map(c => '<div class="tb-cue-card"><strong>' + U.esc(c.label) + '</strong>' + U.esc(c.cue) + '</div>').join('') + '</div>' : '') +
        packs.map(p => '<span class="tb-label">Words to practice</span><div class="tb-pairs" data-pack="' + p.id + '">' +
          p.items.map((it, i) => '<label class="tb-pair"><input type="checkbox" id="pair-' + p.id + '-' + i + '" data-i="' + i + '"' +
            (enabled[p.id][i] ? ' checked' : '') + '>' + U.esc([].concat(it).join(' / ')) + '</label>').join('') +
        '</div>').join('') +
        '<span class="tb-label">Tricky words so far (this device)</span><div class="tb-tricky"></div>' +
        '<div><button type="button" class="tb-pill tb-ghost tb-small" data-act="clear-tricky">Clear tricky words</button></div>' +
      '</div></details>';

    function updateTotal() { home.querySelector('[data-total]').textContent = total; }
    function renderTricky() {
      const box = home.querySelector('.tb-tricky');
      const html = mechs.map(m => {
        const list = progress.tricky(m.id, 5);
        return list.length ? '<p><b>' + U.esc(m.title) + ':</b> ' +
          list.map(r => U.esc(r.word) + ' (missed ' + r.miss + ', got ' + r.right + ')').join(', ') + '</p>' : '';
      }).join('');
      box.innerHTML = html || '<p>Nothing tricky yet.</p>';
    }

    /* ---------- navigation ---------- */
    const controllers = {};
    let current = 'home';
    let lastKey = null;

    function show(id) {
      app.querySelectorAll('[data-screen]').forEach(s => { s.hidden = s.getAttribute('data-screen') !== id; });
      app.querySelector('[data-nav="home"]').hidden = id === 'home';
      app.querySelector('.tb-brand').hidden = id === 'home';
      current = id;
      app.querySelector('.tb-main').scrollTop = 0;
    }
    function goHome() {
      T.voice.hush();
      Object.keys(controllers).forEach(k => controllers[k].stop());
      updateTotal(); renderTricky();
      show('home');
    }
    function nextItem(m) {
      const pool = [];
      packs.forEach(p => {
        if (m.accepts.indexOf(p.type) < 0) return;
        p.items.forEach((it, i) => { if (enabled[p.id][i]) pool.push({ pack: p, words: it, sounds: p.sounds, key: p.id + ':' + i }); });
      });
      const choices = pool.length > 1 ? pool.filter(x => x.key !== lastKey) : pool;
      const chosen = U.pick(choices);
      lastKey = chosen.key;
      return chosen;
    }
    const introduced = {};
    function play(id) {
      const m = T.mechanics.get(id);
      if (!controllers[id]) {
        controllers[id] = m.create({
          root: app.querySelector('[data-screen="' + id + '"]'),
          host: host,
          progress: progress,
          nextItem: () => nextItem(m),
          isActive: () => current === id && !party.isOpen,
          reward: (el, then) => { total++; store.set('total', total); jar.add(el, then); }
        });
      }
      show(id);
      const intro = introduced[id] ? null : [{ t: host.line('intro:' + id) }];
      introduced[id] = true;
      controllers[id].start(intro);
    }

    /* ---------- rewards ---------- */
    const jar = T.Jar(app.querySelector('.tb-jar-mount'), goal, () => party.open(goal));
    const party = T.Party({
      host: host, jokes: jokes, store: store,
      onAgain: () => { jar.set(0); if (controllers[current]) controllers[current].start(); else goHome(); },
      onHome: () => { jar.set(0); goHome(); }
    });

    /* ---------- events ---------- */
    home.addEventListener('click', e => {
      const go = e.target.closest('[data-go]');
      if (go) { play(go.getAttribute('data-go')); return; }
      const big = e.target.closest('.tb-host-big');
      if (big) { U.restart(big, 'tb-wiggle'); T.sfx.play('giggle'); host.say(host.line('hello', { child: child })); return; }
      if (e.target.closest('[data-act="clear-tricky"]')) { progress.clear(); renderTricky(); }
    });
    home.addEventListener('change', e => {
      const box = e.target.closest('[data-pack]');
      if (!box) return;
      const pid = box.getAttribute('data-pack');
      const i = Number(e.target.getAttribute('data-i'));
      enabled[pid][i] = e.target.checked;
      if (!enabled[pid].some(Boolean)) { enabled[pid][i] = true; e.target.checked = true; }
      store.set('enabled', enabled);
    });
    app.querySelector('[data-nav="home"]').addEventListener('click', goHome);

    /* ---------- boot (keeps the jar across live updates of the page) ---------- */
    const hot = global.claude && global.claude.hot;
    try { if (hot && hot.snapshot) hot.snapshot(() => ({ jar: jar.count })); } catch (e) { /* no viewer hook */ }
    function boot(data) {
      if (data && Number.isFinite(data.jar)) jar.set(Math.min(goal - 1, data.jar));
      updateTotal(); renderTricky(); show('home');
    }
    if (hot && hot.ready) hot.ready(boot); else boot((hot && hot.data) || {});

    return { play: play, goHome: goHome, progress: progress, store: store };
  };
})(window);
