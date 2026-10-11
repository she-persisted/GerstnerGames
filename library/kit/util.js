/**
 * @file kit/util.js
 * @about Small helpers every game uses: finding elements, random picks, answer matching, and safe browser storage.
 * @provides Kit.util { $, wait, shuffle, sample, pick, rint, clamp, esc, norm, squash, lev, cleanName, store }
 * @requires nothing
 */
(function (Kit) {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (arr, n) => shuffle(arr.slice()).slice(0, n);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Lowercase, drop punctuation and a leading "a / an / the / mount" so "The Moon" matches "moon".
  const norm = s => String(s).toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim()
    .replace(/^(a|an|the|your|my|its|his|her|mount|mt) /, "");
  const squash = s => norm(s).replace(/ /g, "");

  // Edit distance between two words. Used to forgive one small spelling slip.
  function lev(a, b) {
    const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (x, i) => i);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }

  // Tidy a typed name: letters, numbers, spaces, apostrophes, hyphens; capital first letter.
  const cleanName = (v, max = 14) => {
    const t = String(v || "").replace(/[^A-Za-z0-9 '\-]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
    return t ? t[0].toUpperCase() + t.slice(1) : "";
  };

  // Browser storage that never throws (private windows and previews can block it).
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* storage blocked */ } }
  };

  Kit.util = { $, wait, shuffle, sample, pick, rint, clamp, esc, norm, squash, lev, cleanName, store };
})(window.Kit = window.Kit || {});
