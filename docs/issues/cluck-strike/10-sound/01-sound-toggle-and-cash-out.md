# 01: Sound toggle and the Cash Out sound

Parent: [10 Sound](../10-sound.md)

**What to build:** a sound button (🔊/🔇) in the top bar turns the game's sound on and off. Sound is **on by default**, and the choice is remembered in the browser. When the player cashes out, a short coin chime plays. All sounds are synthesized in the browser with the Web Audio API, so there are no audio files and nothing to license. This is the tracer bullet: setting, sound engine and one effect, end to end.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Sound button in the top bar, labelled for screen readers in English and Russian; state shown with 🔊/🔇
- [ ] Sound on by default; the choice is persisted with the other settings in `localStorage`
- [ ] Sound engine created lazily; nothing plays before the first user interaction (browser autoplay rules), and a blocked or missing `AudioContext` never breaks the game
- [ ] Coin chime synthesized with Web Audio (no audio files) plays on a Cash Out, and only when sound is on
- [ ] Respects the toggle immediately, including mid-Round
- [ ] Time spent recorded at the bottom of this ticket
