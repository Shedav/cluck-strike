# 15: Autoplay

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** like the genre's reference game, an Autoplay button next to Play opens a modal: the number of Rounds (a stepper with 10/25/50/100 presets), the Lane to cash out on (a stepper up to the Difficulty's last Lane) with its Multiplier and win, and a "Start (N)" button. While it runs, each Round plays on its own with the current Bet and Difficulty: Play, GO on the scene's timings, Cash Out on the chosen Lane (or a Hit), a pause to show the result, then the next Round. The panel shows the Round counter and a Stop button; Stop lets the current Round finish and starts no more.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] Autoplay button and modal with Rounds and the Cash Out Lane, Multiplier and win preview, Start (N)
- [x] Rounds play on the scene's timings; the Bet panel's inputs, Play/GO/Cash Out and the hotkeys are locked meanwhile
- [x] Counter (Round k of N) and Stop, which finishes the current Round first
- [x] Stops by itself after N Rounds or when the Balance can't cover the Bet; not resumed after a reload
- [x] Runner tested against the store with a rigged server
- [x] English and Russian texts
- [x] Time spent recorded at the bottom of this ticket

**Notes:**

- Runner and its state in `src/features/autoplay/model/autoplay.ts`; it drives the game store like a player (Play, GO, Cash Out) and waits `STEP_MS` per Step and `RESULT_MS` (+ `CASE_MS` after a Finish) between Rounds. `CASE_MS` moved to `shared/config`.
- The Autoplay button's label contains "Play", so e2e now finds the Play button with `exact: true`.
- Checked in headless Chrome (desktop and 360 px): modal, counter, Stop → "Stopping…", one Round finished on the chosen Lane, then Play is back. Unit 61, e2e 12 pass.

**Time spent:** ~12 min (00:26–00:38, 2026-11-03).
