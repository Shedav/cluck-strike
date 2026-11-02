# 03: Hit and Finish sounds

Parent: [10 Sound](../10-sound.md)

**What to build:** a Hit sounds like a miss: the grenade whooshes past the Lane, then a fire burst plays at the moment the chicken lands in the flames. Reaching the Finish or Max Win plays a short fanfare instead of the plain Cash Out chime.

**Blocked by:** 01.

**Status:** done

- [x] On a Hit: throw whoosh, then a fire burst timed to the flare-up (after the hop), no Smoke sound
- [x] Finish and Max Win play a short fanfare
- [x] All synthesized with Web Audio; silent when sound is off
- [x] Time spent recorded at the bottom of this ticket

**Notes:**

- The fire burst is a low rumble plus a falling low-pass noise burst; the fanfare is a C-E-G-C arpeggio.
- Checked in headless Chrome by logging sound nodes on a Hit: throw, hop 450 ms later, fire burst another 450 ms later (`STEP_MS`), no Smoke.
- Not checked live: Finish and Max Win are hard to reach by playing; they share the trigger with the Cash Out chime, which is checked.

- Added on request: a "roasted" sound (frying sizzle under a falling squawk) when the roasted chicken appears, 350 ms after the fire burst (`ROAST_MS`, shared with the animation). The sound toggle now uses white line icons instead of emoji.

**Time spent:** ~2 min (21:54–21:56, 2026-11-02).
