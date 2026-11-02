# 14: Verify any Round in the Fairness modal

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** compared with cs2skin.com's Fairness (a modal with the Round's values and a "Verify" link to a verifier page with inputs and runnable reference code), our modal checks our own Rounds automatically but gives the player no way to check values by hand or to reproduce the result without our code. Add a "Verify a Round" section to the Fairness modal: Server Seed, Client Seed, nonce and Difficulty inputs (prefilled from the last finished Round), the recomputed Server Seed hash and Hit Lane, and a short self-contained JavaScript snippet with those values that prints the same result when pasted into any browser console.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] "Verify a Round" section with the four inputs, prefilled from the last finished Round
- [x] Shows SHA-256 of the entered Server Seed and the recomputed Hit Lane (or no Hit), updated as the inputs change
- [x] Copyable snippet that needs nothing but a browser console; a test runs it and compares with `verifyRound`
- [x] English and Russian texts
- [x] Time spent recorded at the bottom of this ticket

**Notes:**

- cs2skin, checked on 2026-11-03: Crash's Fairness modal lists Round ID, Server Seed hashed, Server Seed (empty until revealed), Drand Round ID and Drand Randomness with copy buttons, plus a "Verify" link; Royale's adds how each match's seed is derived; Mines' Fairness goes straight to the /provably-fair verifier (Server Seed, Client Seed, nonce, game options, then Go code to run on go.dev/play). Drand fits their multiplayer games; a single-player game like ours (and Mines) uses the player's Client Seed instead, so nothing to add there. Our modal already re-checks each Round automatically, which theirs does not.
- `verifierSnippet` (`src/shared/game-rules/fairness.ts`) builds console JavaScript with the entered values and the Difficulty's Multipliers; a test runs it for every Difficulty, with quotes in the Client Seed, and compares with `verifyRound`.
- The long code made the modal overflow sideways: the value row is a grid item with `min-width: auto`; it now has `min-width: 0` and the code scrolls inside.
- Checked in headless Chrome on desktop and a 360 px phone after a Round: the form's result matches the Last Round's verdict.

**Time spent:** ~10 min (00:25–00:32, 2026-11-03), plus ~5 min looking at cs2skin.
