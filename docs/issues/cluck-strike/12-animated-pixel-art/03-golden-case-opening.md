# 03: Golden case opening

Parent: [12 Animated 8-bit art](../12-animated-pixel-art.md)

**What to build:** on a Finish the golden case shakes, the lid flies open, and a golden glow and coins burst out, replacing `golden-case.svg` and its scale/rotate wobble.

**Blocked by:** 01.

**Status:** done

- [x] Frames shown to the user and approved before wiring in
- [x] Closed case stands still otherwise; the opening plays only on a Finish
- [x] Time spent recorded at the bottom of this ticket

**Notes:**

- 11 frames over 1.1 s (`src/widgets/road/pixel/case.ts`): three shakes, the lid lifts and flies off, rays and coins burst out, the case stays open and glowing until the next Round.
- Changed from the plan: the case opens as the chicken lands on the last Lane (`STEP_MS`), not with the fanfare. The celebration resets the camera to the start, which would hide the Finish column mid-opening, so on a Finish the celebration (popup, fanfare, the chicken's return) now waits `CASE_MS` instead of `LANDED_PAUSE_MS`, which stays for a Max Win.
- Checked by sampling the case's frames in headless Chrome against the production build: opening from 0.9 s to 2.0 s after the last GO, popup at 2.0 s. Unit 57, e2e 12 pass.

**Time spent:** ~7 min (23:46–23:53, 2026-11-02).
