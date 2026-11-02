# 06: Fairness UI

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** the player can open the Fairness modal and check how the outcome is fixed. Before Play they see the hash of the next Server Seed and their Client Seed, which they can edit. After the Round the Server Seed is revealed, and the modal recomputes the Hit Lane from the seeds and nonce, so the player can see it matches what happened.

**Blocked by:** 02.

**Status:** done

- [x] Fairness button opens the modal
- [x] The modal shows the next Server Seed hash, the current Client Seed (editable between Rounds, not during) and the nonce; copy buttons on each value
- [x] After a Round: revealed Server Seed, Client Seed, nonce, Difficulty and the recomputed Hit Lane (or "no Hit"), plus a match indicator
- [x] Editing the Client Seed takes effect from the next Round
- [x] Store-seam test: after a Round, verify from the revealed values equals the actual result
- [x] Time spent recorded at the bottom of this ticket

**Notes:**

- The mock server now draws the next Server Seed one Round ahead (`nextRound()` returns its hash and nonce), so the hash is committed before the player can pick a Client Seed.
- The modal is a native `<dialog>` (focus trap and Escape for free). The proof block (`RoundProof`) is a separate component so Recent Games (ticket 07) can reuse it per Round.
- "Verified" checks both that SHA-256 of the revealed seed equals the committed hash and that the recomputed Hit Lane agrees with how the Round ended (a Cash Out must stop before it).
- For now the Fairness button sits in the existing header; ticket 09 restyles the top bar.

**Time spent:** ~4 min (16:26–16:30, 2026-11-02).
