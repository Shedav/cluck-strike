# 08: Scene art and animation

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** the schematic scene becomes the real one. A cartoon flat-2D chicken (bold outline) crosses a dusty CS-style street with molotov fire on the Lanes ahead.

- A safe Step: the chicken hops and a Smoke cloud puts out the fire.
- A Hit: the fire flares up and the chicken is roasted.
- The Finish: a golden case.
- The camera scrolls sideways after the chicken.

Buttons are locked while an animation plays. After a Hit the burn animation plays, then the chicken returns to the start (the 2 s reset already exists with an emoji placeholder).

**Blocked by:** 02.

**Status:** done

- [x] Placeholder sprites stored under fixed names in `public/sprites/` (listed in one place in code), so they can be swapped without code changes
- [x] Animations with Framer Motion (DOM, no canvas): hop, Smoke, flare-up and roast, golden case at the Finish, idle fire flicker on upcoming Lanes
- [x] Animations play after the store already knows the result (ADR 0001); the UI holds an "animating" lock so double clicks can't make extra Steps
- [x] About 5 Lanes visible on desktop; the camera follows the chicken
- [x] Auto-reset of the scene 2 s after a Hit (the setting toggle comes in ticket 09; default on)
- [x] `prefers-reduced-motion`: shorter animations, no shaking
- [x] No Valve or cs2skin assets, logos or map names
- [x] Time spent recorded at the bottom of this ticket

**Notes:**

- Instead of CC0 packs, the placeholder sprites are our own flat SVGs (chicken, roasted chicken, fire, smoke, golden case): nothing to download or license, and the same file names will take the AI-generated art from ticket 12.
- The chicken moves with a shared `layoutId` (it slides from Lane to Lane) plus a hop; the road is a `layoutScroll` container so the camera scroll doesn't break the slide.
- After a Hit the flare dies down to show the roasted chicken; after 2 s the chicken returns to the start.
- `MotionConfig reducedMotion="user"` drops transform animations (hop, shake) for reduced-motion users; the CSS flicker and popup pop are switched off too.
- A finished Round is no longer persisted, so a reload after a win starts at the start line instead of replaying the win popup (bug reported during this ticket).

**Time spent:** ~6 min (16:17–16:23, 2026-11-02).
