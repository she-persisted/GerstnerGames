/**
 * @file kit/jukebox.js
 * @about A list of collected songs with play and stop buttons. Songs not found yet show as locked.
 * @provides Kit.jukebox.render(el, { order, songs, owned, where, music, icons, onTurnOn, fallback })
 * @requires kit/util.js, kit/audio.js, kit/music.js
 *
 * order     song ids in display order
 * songs     Kit.songs (each has a title)
 * owned()   ids the player has collected; the first id in order is always owned
 * where(id) where the song is found, shown under its title
 * music     the player made by Kit.music.create
 * icons     { note, play, stop } HTML
 * onTurnOn  called if pressing play had to switch music back on
 * fallback  song id to return to when a playing song is stopped (default: the first in order)
 */
(function (Kit) {
  "use strict";
  const { esc } = Kit.util;
  function render(el, o) {
    if (!el) return;
    const owned = o.owned(), first = o.order[0], fallback = o.fallback || first, ic = o.icons || {};
    el.innerHTML = o.order.map(id => {
      const s = o.songs[id] || { title: id }, has = id === first || owned.includes(id), playing = o.music.enabled && o.music.want === id;
      if (!has) return `<div class="track-row locked">${ic.note || ""}<span class="tt">???<span class="tw">${esc(o.where(id))}</span></span></div>`;
      return `<div class="track-row">${ic.note || ""}<span class="tt">${esc(s.title)}<span class="tw">${esc(o.where(id))}</span></span><button type="button" class="playbtn ${playing ? "on" : ""}" data-song="${id}" aria-label="${playing ? "Playing" : "Play"} ${esc(s.title)}">${playing ? (ic.stop || "Stop") : (ic.play || "Play")}</button></div>`;
    }).join("");
    el.querySelectorAll("[data-song]").forEach(b => b.addEventListener("click", () => {
      const id = b.dataset.song;
      if (o.music.enabled && o.music.want === id && id !== fallback) o.music.set(fallback);
      else {
        if (!o.music.enabled) { o.music.setEnabled(true); if (o.onTurnOn) o.onTurnOn(); }
        Kit.audio.ctx(); o.music.unlock(); o.music.set(id);
      }
      render(el, o);
      const again = el.querySelector(`[data-song="${id}"]`); if (again) again.focus({ preventScroll: true });
    }));
  }
  Kit.jukebox = { render };
})(window.Kit = window.Kit || {});
