# 01: Sound toggle and the Cash Out sound

Parent: [10 Sound](../10-sound.md)

**What to build:** a sound button (🔊/🔇) in the top bar turns the game's sound on and off. Sound is **on by default**, and the choice is remembered in the browser. When the player cashes out, a short coin chime plays. All sounds are synthesized in the browser with the Web Audio API, so there are no audio files and nothing to license. This is the tracer bullet: setting, sound engine and one effect, end to end.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] Sound button in the top bar, labelled for screen readers in English and Russian; state shown with 🔊/🔇
- [x] Sound on by default; the choice is persisted with the language in `localStorage`
- [x] Sound engine created lazily; nothing plays before the first user interaction (browser autoplay rules), and a blocked or missing `AudioContext` never breaks the game
- [x] Coin chime synthesized with Web Audio (no audio files) plays on a Cash Out, and only when sound is on
- [x] Respects the toggle immediately, including mid-Round
- [x] Time spent recorded at the bottom of this ticket

**Notes:**

- One `AudioContext` is created on the first effect; until the first pointer or key press every effect is skipped, and a missing or blocked context just leaves the game silent.
- The chime fires from the Round reaching `cashedOut`, not from the button, so it can't double-play; a reload never restores a finished Round, so it can't replay either.
- Checked in headless Chrome by counting oscillators: 3 per Cash Out with sound on, 0 with sound off; the off state survives a reload.

**Time spent:** ~2 min (21:39–21:41, 2026-11-02).
