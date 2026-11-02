# 02: Step sounds

Parent: [10 Sound](../10-sound.md)

**What to build:** every Step sounds like the animation looks. A whoosh plays when the chicken throws the smoke grenade, a hiss and puff when it lands and the Smoke puts out the fire, and a light hop sound when the chicken jumps onto the Lane. Each sound starts at the matching animation moment, not when the Step's result arrives.

**Blocked by:** 01.

**Status:** ready-for-agent

- [ ] Throw whoosh at the start of a Step (Play's first Step and every GO)
- [ ] Smoke hiss/puff when the grenade lands on a safe Step (after the throw)
- [ ] Hop sound when the chicken jumps (after the throw)
- [ ] Timings come from the same constants the animation uses, so changing a duration keeps sound and picture in sync
- [ ] All synthesized with Web Audio; silent when sound is off
- [ ] Time spent recorded at the bottom of this ticket
