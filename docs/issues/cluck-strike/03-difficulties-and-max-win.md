# 03: All Difficulties and Max Win

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** the player picks Easy, Medium, Hard or Hardcore with tabs before a Round. Each Difficulty shows its own Lanes and Multipliers (24 / 22 / 20 / 15 Lanes, tables from docs/spec.md). When Bet × Multiplier reaches Max Win (10,000), the Round ends with an automatic Cash Out of exactly 10,000. Badges past that Lane look dimmed. Large Multipliers read compactly in badges.

**Blocked by:** 02.

**Status:** done

- [x] All four Multiplier tables in the Odds module; every Difficulty satisfies `P(survive 1) ≤ 1` and decreasing survival along the road (unit test)
- [x] Difficulty tabs; Difficulty is locked during a Round
- [x] Max Win Lane derived from Bet + Difficulty; automatic Cash Out of exactly 10,000 when reached (store-seam test)
- [x] Badges beyond the Max Win Lane are dimmed and update when the Bet changes
- [x] Compact badge format above 1,000 (`41.3Kx`, `2.54Mx`); full value on hover and focus
- [x] Statistical test: average return over many random seeds ≈ 98% (within tolerance) for a fixed Cash Out Lane on each Difficulty
- [x] Time spent recorded at the bottom of this ticket

**Notes:**

- A Round that reaches Max Win ends in its own `maxWin` phase (shown as "Max Win! Cashed out 10,000.00"), so the player sees why it stopped. The payout cap itself lives in the payout function, so a manual Cash Out can never exceed it either.
- The Max Win readout shows the most this Bet can pay on this Difficulty: the last Lane's payout, capped at 10,000.
- The RTP test plays 20,000 seeded Rounds per Difficulty through the real HMAC pipeline and expects 98% ± 5 points.

**Time spent:** ~2 min (15:49–15:51, 2026-11-02).
