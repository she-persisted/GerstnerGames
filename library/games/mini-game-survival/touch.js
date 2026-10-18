/**
 * @file games/mini-game-survival/touch.js
 * @about Lets Mini Game Survival play on phones and tablets. Touch mode turns on with a touch screen and then follows whatever the player last used (a finger or a mouse). In touch mode, hints and tips say tap instead of naming keys, key badges hide, back and forward buttons float in the corner of the scene (they do what the L and R keys do), and typing a clue pops up the phone's own keyboard.
 * @requires games/mini-game-survival/scene.js
 *
 * tip(keys, tap): a hint with a keyboard version and a touch version. showHint and hintIfIdle (scene.js) take one and pick the
 *   right words when the hint shows. In HTML, put keyboard-only words in a .k-only span and touch-only words in a .t-only span.
 * phoneKeyboard(host) -> { stop }: adds an "Open keyboard" button to host that opens the phone's keyboard. Each letter typed
 *   becomes a key press for the typing challenge on screen. Letters from a real keyboard already reach the challenge, so
 *   they're never sent twice. stop() closes the keyboard.
 */
let touchMode = false;
function setTouch(on) { touchMode = on; document.body.classList.toggle("touchy", on); }
setTouch(matchMedia("(pointer: coarse)").matches);
addEventListener("pointerdown", e => {
  if (e.pointerType === "touch" && !touchMode) setTouch(true);
  else if (e.pointerType === "mouse" && touchMode) setTouch(false);
}, true);
const tip = (keys, tap) => () => (touchMode ? tap : keys);

// The back and forward buttons in the scene's corner (touch mode only).
let lastTap = 0;
function navTap(dir) {
  const st = STEPS[flow.step], now = performance.now();
  if (!active || !st || st.t === "end" || now - lastTap < 250) return;
  lastTap = now; hintActivity();
  if (dir < 0) navBack(); else navForward();
}
$("#navBack").addEventListener("click", () => navTap(-1));
$("#navFwd").addEventListener("click", () => navTap(1));

function phoneKeyboard(host) {
  const wrap = document.createElement("div"); wrap.className = "phonekeys t-only";
  wrap.innerHTML = `<span class="btn ghost phonekeybtn" aria-hidden="true">Open keyboard</span>
    <input type="text" class="phonebox" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="Type the clue here">`;
  host.append(wrap);
  const box = wrap.querySelector("input"), label = wrap.querySelector(".phonekeybtn");
  let real = false, prev = "";
  const send = ch => document.dispatchEvent(new KeyboardEvent("keydown", { key: ch, bubbles: true, cancelable: true }));
  // A real key press (from a keyboard, or a phone keyboard that names its keys) gets to the challenge by itself.
  box.addEventListener("keydown", e => { real = e.isTrusted && e.key.length === 1; });
  box.addEventListener("input", e => {
    const v = box.value;
    if (!real && v.startsWith(prev)) for (const ch of v.slice(prev.length)) send(ch);
    prev = v; real = false;
    if (!e.isComposing && v.length > 24) { box.value = ""; prev = ""; }
  });
  box.addEventListener("compositionend", () => { box.value = ""; prev = ""; });
  box.addEventListener("focus", () => { label.textContent = "Keyboard on. Type away!"; wrap.classList.add("on"); });
  box.addEventListener("blur", () => { label.textContent = "Open keyboard"; wrap.classList.remove("on"); box.value = ""; prev = ""; });
  return { stop() { box.blur(); box.disabled = true; wrap.classList.add("done"); } };
}
