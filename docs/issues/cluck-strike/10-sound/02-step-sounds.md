# 02: Step sounds

Parent: [10 Sound](../10-sound.md)

**What to build:** every Step sounds like the animation looks. A whoosh plays when the chicken throws the smoke grenade, a hiss and puff when it lands and the Smoke puts out the fire, and a light hop sound when the chicken jumps onto the Lane. Each sound starts at the matching animation moment, not when the Step's result arrives.

**Blocked by:** 01.

**Status:** done

- [x] Throw whoosh at the start of a Step (Play's first Step and every GO)
- [x] Smoke hiss/puff when the grenade lands on a safe Step (after the throw)
- [x] Hop sound when the chicken jumps (after the throw)
- [x] Timings come from the same constants the animation uses, so changing a duration keeps sound and picture in sync
- [x] All synthesized with Web Audio; silent when sound is off
- [x] Time spent recorded at the bottom of this ticket

**Notes:**

- Throw is a rising band of filtered noise; Smoke is a low puff plus a high hiss; the hop is a short rising sine. One shared noise buffer per audio context.
- Checked in headless Chrome by logging when sound nodes are created: the throw at the click, then Smoke and hop 450 ms later (`THROW_MS`); a Hit Step skips the Smoke.

**Time spent:** ~2 min (21:45–21:47, 2026-11-02).
