# 02: Burn down to a skeleton

Parent: [12 Animated 8-bit art](../12-animated-pixel-art.md)

**What to build:** on a Hit the chicken catches fire, flails, chars and burns down to a skeleton whose bones fall apart, replacing `FlareUp` and `chicken-roasted.svg`, timed to `STEP_MS + ROAST_MS` so the fire and roast sounds still match.

**Blocked by:** 01.

**Status:** done

- [x] Frames shown to the user and approved before wiring in
- [x] Plays once per Hit on the existing timings; the skeleton stays until the reset
- [x] Time spent recorded at the bottom of this ticket

**Notes:**

- 11 frames over 1.5 s (`src/widgets/road/pixel/burn.ts`): catches fire, flails (the scream at `ROAST_MS` lands on the flailing frames), chars, skeleton through dying flames and embers, the skull drops, a pile of bones stays until the reset. Flames are one layer drawn over the chicken's poses with `overlay` (`src/shared/lib/pixel.ts`); it and its mirror alternate to flicker.
- The burn mounts when the chicken lands (`STEP_MS`), where the live chicken vanishes; it ends at 2.4 s, before `RESULT_MS` resets the scene at 2.9 s. `FlareUp`, `chicken-roasted.svg` and their styles are gone; the screen shake and sounds keep their timings.
- Checked with headless screenshots of a rigged Hit on Lane 1 against the production build. Unit 57, e2e 12 pass.

**Time spent:** ~6 min (23:38–23:44, 2026-11-02).
