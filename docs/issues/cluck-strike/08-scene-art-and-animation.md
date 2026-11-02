# 08: Scene art and animation

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** the schematic scene becomes the real one. A cartoon flat-2D chicken (bold outline) crosses a dusty CS-style street with molotov fire on the Lanes ahead.

- A safe Step: the chicken hops and a Smoke cloud puts out the fire.
- A Hit: the fire flares up and the chicken is roasted.
- The Finish: a golden case.
- The camera scrolls sideways after the chicken.

Buttons are locked while an animation plays. After a Hit the scene resets after 2 seconds.

**Blocked by:** 02.

**Status:** ready-for-agent

- [ ] CC0 placeholder sprites stored under fixed, documented names, so they can be swapped without code changes; licenses listed
- [ ] Animations with Framer Motion (DOM, no canvas): hop, Smoke, flare-up and roast, golden case at the Finish, idle fire flicker on upcoming Lanes
- [ ] Animations play after the store already knows the result (ADR 0001); the UI holds an "animating" lock so double clicks can't make extra Steps
- [ ] About 5 Lanes visible on desktop; the camera follows the chicken
- [ ] Auto-reset of the scene 2 s after a Hit (the setting toggle comes in ticket 09; default on)
- [ ] `prefers-reduced-motion`: shorter animations, no shaking
- [ ] No Valve or cs2skin assets, logos or map names
- [ ] Time spent recorded at the bottom of this ticket
