# 06: Fairness UI

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** the player can open the Fairness modal and check how the outcome is fixed. Before Play they see the hash of the next Server Seed and their Client Seed, which they can edit. After the Round the Server Seed is revealed, and the modal recomputes the Hit Lane from the seeds and nonce, so the player can see it matches what happened.

**Blocked by:** 02.

**Status:** ready-for-agent

- [ ] Fairness button opens the modal
- [ ] The modal shows the next Server Seed hash, the current Client Seed (editable between Rounds, not during) and the nonce; copy buttons on each value
- [ ] After a Round: revealed Server Seed, Client Seed, nonce, Difficulty and the recomputed Hit Lane (or "no Hit"), plus a match indicator
- [ ] Editing the Client Seed takes effect from the next Round
- [ ] Store-seam test: after a Round, verify from the revealed values equals the actual result
- [ ] Time spent recorded at the bottom of this ticket
