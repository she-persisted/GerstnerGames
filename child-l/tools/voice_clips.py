#!/usr/bin/env python3
"""
Make the recorded voice clips the Toybox characters speak with.

Each character's speech is made ahead of time with Kokoro (an open, free voice
model that runs offline) and saved as mp3 files. The engine plays a clip when
one exists for every part of a sentence and falls back to the browser's
text-to-speech otherwise, so a missing clip never breaks a game.

    python3 child-l/tools/voice_clips.py list    (needs Playwright, like playtest.py)
    python3 child-l/tools/voice_clips.py make    (needs: pip install kokoro soundfile lameenc scipy faster-whisper)
    python3 child-l/tools/voice_clips.py check   (same)

list   Loads every toybox page in headless Chromium, reads the registries and
       writes tools/voice-lines.json: every text each character can say, with
       {word}/{other}/{child} filled in for every word in every pack, the jokes,
       and each pack word on its own at the slow listening speed.
make   Makes any clip that is missing into toybox/lib/assets/voice/<character>/
       and rewrites toybox/lib/assets/voice-clips.js. Add --force to remake all,
       or --only "<text>" to remake the clips whose text contains it.
       Every new clip is played to Whisper (speech recognition). A clip that
       does not come back as its text is remade another way; any that still
       fail are listed as LISTEN. The words are speech practice, so a grown-up
       listens to every LISTEN clip before a deploy.
       Kokoro drops the first sound of a word said on its own ("fox" comes out
       near "vox"), so each slow word is said inside a short sentence and cut out.
check  Plays every existing clip to Whisper again and lists any to listen to.

Voices: Biscuit is Kokoro "af_aoede". Every other character uses "am_puck"
unless VOICES below says otherwise (Mom's choice, October 2026).
"""
import hashlib
import json
import pathlib
import re
import sys

TOOLS = pathlib.Path(__file__).resolve().parent
TOYBOX = TOOLS.parent / "toybox"
LINES = TOOLS / "voice-lines.json"
CLIPS_DIR = TOYBOX / "lib" / "assets" / "voice"
CLIPS_JS = TOYBOX / "lib" / "assets" / "voice-clips.js"

VOICES = {"biscuit": "af_aoede"}
DEFAULT_VOICE = "am_puck"
SPEED = 1.0
SLOW_SPEED = 0.8
RATE = 24000
CHILD_NAMES = ["friend"]  # what pages pass as {child}; never a real name

ENUMERATE_JS = """(childNames) => {
  const T = window.Toybox, out = {};
  const words = [];
  T.packs.all().filter(p => p.type === 'minimal-pairs')
    .forEach(p => p.items.forEach(pair => pair.forEach(w => { if (!words.includes(w)) words.push(w); })));
  const jokes = [];
  T.packs.all().filter(p => p.type === 'jokes').forEach(p => p.items.forEach(j => jokes.push(j.q, j.a)));
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  T.characters.all().forEach(c => {
    const texts = [];
    Object.values(c.lines || {}).forEach(list => list.forEach(tpl => {
      const usesWord = /\\{(word|Word|other)\\}/.test(tpl);
      (usesWord ? words : [null]).forEach(w => childNames.forEach(child => {
        texts.push(tpl.replace(/\\{word\\}/g, w).replace(/\\{Word\\}/g, w && cap(w))
          .replace(/\\{other\\}/g, w).replace(/\\{child\\}/g, child));
      }));
    }));
    const items = {};
    texts.concat(jokes).forEach(t => { items[T.voice.key(t)] = { text: t, slow: false }; });
    words.forEach(w => { items[T.voice.key(w, 0.7)] = { text: w, slow: true }; });
    out[c.id] = items;
  });
  return out;
}"""


def cmd_list():
    from playwright.sync_api import sync_playwright
    merged = {}
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page()
        page.route("**/fonts.googleapis.com/**", lambda r: r.abort())
        for html in sorted(TOYBOX.glob("*.html")):
            page.goto(html.as_uri())
            page.wait_for_function("window.Toybox && Toybox.voice && Toybox.voice.key")
            for cid, items in page.evaluate(ENUMERATE_JS, CHILD_NAMES).items():
                merged.setdefault(cid, {}).update(items)
        browser.close()
    LINES.write_text(json.dumps(merged, indent=1, sort_keys=True) + "\n", encoding="ascii")
    for cid, items in merged.items():
        print(f"{cid}: {len(items)} clips")
    print("wrote", LINES.relative_to(TOOLS.parent.parent))


def file_name(key):
    slug = re.sub(r"[^a-z0-9]+", "-", key)[:40].strip("-") or "clip"
    return f"{slug}-{hashlib.sha1(key.encode()).hexdigest()[:6]}.mp3"


def to_mp3(audio, path):
    import lameenc
    import numpy as np
    pcm = (np.clip(audio, -1, 1) * 32767).astype(np.int16)
    enc = lameenc.Encoder()
    enc.set_bit_rate(64); enc.set_in_sample_rate(RATE); enc.set_channels(1); enc.set_quality(2)
    path.write_bytes(enc.encode(pcm.tobytes()) + enc.flush())


def words_of(text):
    return re.sub(r"[^a-z ]", " ", re.sub(r"['\u2019]", "", text.lower())).split()


# Words that sound the same, so a listener writing them down can't tell them apart.
HOMOPHONES = {"bin": {"been"}, "fin": {"finn"}, "fair": {"fare"}, "bear": {"bare"},
              "bead": {"bede"}, "feed": {"fede"}}
# Sentences a slow word is said inside before it is cut out; the first one that checks out is used.
CARRIERS = ["Okay, ready? {w}, okay.", "Ready? {w}. Good.", "Okay, ready? {w}.", "Now, {w}, okay."]
# Short lines lose their first or last sound too ("Yes! Fox!" came out "Yes, fogs"),
# so a line that doesn't check out said plainly is said inside one of these and cut out.
SENTENCE_CARRIERS = ["Okay. {w} Okay.", "Ready? {w} Good."]
SENTENCE_SPEEDS = [SPEED, 0.95]
# Words Kokoro would misread, with the sounds to say instead (Kokoro's [word](/phonemes/) markup).
# "fsh" (the fish-with-no-eyes joke) was spelled out as letters.
PRONOUNCE = {"fsh": "[fsh](/fSH/)".replace("SH", chr(0x283))}


def say_as(text):
    for word, markup in PRONOUNCE.items():
        text = re.sub(rf"\b{word}\b", markup, text)
    return text


class Speaker:
    """One Kokoro voice. A word said on its own loses its first sound, so slow
    words are said inside a short sentence and cut out at the pause before them."""

    def __init__(self, voice, pipes):
        from kokoro import KPipeline
        lang = voice[0]  # 'a' American, 'b' British
        self.voice = voice
        self.pipe = pipes.get(lang) or pipes.setdefault(lang, KPipeline(lang_code=lang, repo_id="hexgrad/Kokoro-82M"))
        self.lead = self.say("Listen carefully, the word is", 0.9)[0]
        self.tail = self.say("and that is all.", 0.9)[0]

    def say(self, text, speed):
        import numpy as np
        audio, tokens = [], []
        for r in self.pipe(say_as(text), voice=self.voice, speed=speed):
            audio.append(np.asarray(r.audio, dtype=np.float32))
            tokens += list(r.tokens or [])
        return np.concatenate(audio), tokens

    def cut_from(self, text, carrier, speed):
        """Say text inside the carrier sentence and return just the text's audio."""
        import numpy as np
        before, after = carrier.split("{w}")
        audio, tokens = self.say(carrier.format(w=text), speed)
        spoken = [t for t in tokens if re.search(r"[A-Za-z0-9]", t.text) and t.start_ts is not None]
        i, j = len(words_of(before)), len(spoken) - 1 - len(words_of(after))
        first, last = spoken[i], spoken[j]
        win, step = int(0.01 * RATE), int(0.002 * RATE)

        def quietest(a, b):
            """Sample index of the quietest 10 ms between times a and b (seconds)."""
            lo, hi = max(0, int(a * RATE)), min(len(audio), int(b * RATE))
            if hi - lo <= win:
                return (lo + hi) // 2
            energy = [np.sum(audio[k:k + win] ** 2) for k in range(lo, hi - win, step)]
            return lo + int(np.argmin(energy)) * step + win // 2
        # cut in the pause before the first word and after the last, never into the carrier's words
        start = quietest(spoken[i - 1].end_ts if i else first.start_ts - 0.15, first.start_ts + 0.01)
        end = (quietest(last.end_ts + 0.03, spoken[j + 1].start_ts) if j + 1 < len(spoken)
               else int((last.end_ts + 0.05) * RATE))
        cut = audio[start:end].copy()
        fin, fout = int(0.004 * RATE), int(0.03 * RATE)
        cut[:fin] *= np.linspace(0, 1, fin)
        cut[-fout:] *= np.linspace(1, 0, fout)
        return cut

    def in_context(self, cut):
        """A cut word between two fixed phrases, so the listener judges it like a person would."""
        import numpy as np
        gap = np.zeros(int(0.15 * RATE), np.float32)
        return np.concatenate([self.lead, gap, cut, gap, self.tail])


class Ear:
    """Whisper speech recognition, used to confirm every clip says what it should."""

    def __init__(self):
        from faster_whisper import WhisperModel
        self.model = WhisperModel("small.en", device="cpu", compute_type="int8")

    def hear(self, audio):
        import numpy as np
        from scipy.signal import resample_poly
        a16 = resample_poly(audio, 2, 3).astype(np.float32)  # 24 kHz -> 16 kHz
        segs, _ = self.model.transcribe(a16, language="en", beam_size=5)
        return " ".join(s.text for s in segs).strip()

    def says(self, audio, expected, exact_word=None):
        heard = self.hear(audio)
        got = words_of(heard)

        def has(w):
            return w in got or bool(HOMOPHONES.get(w, set()) & set(got))
        if exact_word:  # the word itself with nothing stuck on: not "bins" or "boned"
            w = exact_word.lower()
            extra = [g for g in got if g != w and g.startswith(w) and g not in HOMOPHONES.get(w, set())]
            return has(w) and not extra, heard
        need = words_of(expected)
        return sum(has(w) for w in need) >= max(1, round(0.8 * len(need))), heard


def make_clip(spk, ear, item):
    """Return (audio, ok, heard). Tries each way of saying it until the listener agrees."""
    text = item["text"]
    if item["slow"]:  # (make, judge it between two fixed phrases)
        tries = [(lambda c=c: spk.cut_from(text, c, SLOW_SPEED), True) for c in CARRIERS]
    else:
        tries = ([(lambda s=s: spk.say(text, s)[0], False) for s in SENTENCE_SPEEDS] +
                 [(lambda c=c, s=s: spk.cut_from(text, c, s), True)
                  for c in SENTENCE_CARRIERS for s in SENTENCE_SPEEDS])
    first = None
    for make, in_context in tries:
        audio = make()
        heard_audio = spk.in_context(audio) if in_context else audio
        if item["slow"]:
            ok, heard = ear.says(heard_audio, text, exact_word=text)
        else:
            ok, heard = ear.says(heard_audio, text)
        if ok:
            return audio, True, heard
        first = first or (audio, False, heard)
    return first


def write_clips_js(sets):
    out = ["/* ==========================================================================",
           "   Toybox Layer 1: Voice clips (generated by child-l/tools/voice_clips.py; do not edit)",
           "   Each character's lines, made ahead of time with the Kokoro voice model.",
           "   key = Toybox.voice.key(text, rate) -> mp3 file in voice/<character>/.",
           "   ========================================================================== */",
           "(function (T) {", "  'use strict';"]
    for cid, s in sets.items():
        out.append(f"  T.voice.addClips({{ id: {json.dumps(cid)}, voice: {json.dumps(s['voice'])}, "
                   f"base: 'lib/assets/voice/{cid}/', clips: {{")
        out += [f"    {json.dumps(k)}: {json.dumps(v)}," for k, v in sorted(s["clips"].items())]
        out[-1] = out[-1].rstrip(",")
        out.append("  } });")
    out.append("})(window.Toybox);")
    CLIPS_JS.write_text("\n".join(out) + "\n", encoding="ascii")
    print("wrote", CLIPS_JS.relative_to(TOOLS.parent.parent),
          "|", ", ".join(f"{c}: {len(s['clips'])} clips ({s['voice']})" for c, s in sets.items()))


def cmd_make(args):
    force = "--force" in args
    only = args[args.index("--only") + 1].lower() if "--only" in args else None
    lines = json.loads(LINES.read_text(encoding="ascii"))
    pipes, sets, flagged = {}, {}, []
    ear = Ear()
    for cid, items in sorted(lines.items()):
        spk = Speaker(VOICES.get(cid, DEFAULT_VOICE), pipes)
        folder = CLIPS_DIR / cid
        folder.mkdir(parents=True, exist_ok=True)
        clips = {}
        for key, item in sorted(items.items()):
            name = file_name(key)
            path = folder / name
            redo = force or (only and only in item["text"].lower())
            if redo or not path.exists():
                audio, ok, heard = make_clip(spk, ear, item)
                to_mp3(audio, path)
                label = f"{cid}: {item['text']!r}{' (slow)' if item['slow'] else ''}"
                print(f"  {'ok    ' if ok else 'LISTEN'} {label}  heard {heard!r}")
                if not ok:
                    flagged.append(label)
            clips[key] = name
        for old in folder.glob("*.mp3"):
            if old.name not in clips.values():
                old.unlink()
        sets[cid] = {"voice": spk.voice, "clips": clips}
    write_clips_js(sets)
    print("every new clip checked out" if not flagged else
          f"{len(flagged)} clip(s) to listen to:\n  " + "\n  ".join(flagged))


def cmd_check():
    """Play every existing clip to the listener again and list any that don't say their text."""
    import soundfile as sf
    lines = json.loads(LINES.read_text(encoding="ascii"))
    ear, pipes, bad = Ear(), {}, 0
    for cid, items in sorted(lines.items()):
        spk = Speaker(VOICES.get(cid, DEFAULT_VOICE), pipes)
        for key, item in sorted(items.items()):
            audio, _ = sf.read(CLIPS_DIR / cid / file_name(key), dtype="float32")
            ok, heard = ear.says(spk.in_context(audio), item["text"],
                                 exact_word=item["text"] if item["slow"] else None)
            bad += not ok
            print(f"  {'ok    ' if ok else 'LISTEN'} {cid}: {item['text']!r}  heard {heard!r}")
    print("every clip checked out" if not bad else f"{bad} clip(s) to listen to")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "list":
        cmd_list()
    elif cmd == "make":
        cmd_make(sys.argv[2:])
    elif cmd == "check":
        cmd_check()
    else:
        print(__doc__)
        sys.exit(1)
