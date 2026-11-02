# 03: All Difficulties and Max Win

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** the player picks Easy, Medium, Hard or Hardcore with tabs before a Round. Each Difficulty shows its own Lanes and Multipliers (24 / 22 / 20 / 15 Lanes, tables from docs/spec.md). When Bet × Multiplier reaches Max Win (10,000), the Round ends with an automatic Cash Out of exactly 10,000. Badges past that Lane look dimmed. Large Multipliers read compactly in badges.

**Blocked by:** 02.

**Status:** ready-for-agent

- [ ] All four Multiplier tables in the Odds module; every Difficulty satisfies `P(survive 1) ≤ 1` and decreasing survival along the road (unit test)
- [ ] Difficulty tabs; Difficulty is locked during a Round
- [ ] Max Win Lane derived from Bet + Difficulty; automatic Cash Out of exactly 10,000 when reached (store-seam test)
- [ ] Badges beyond the Max Win Lane are dimmed and update when the Bet changes
- [ ] Compact badge format above 1,000 (`41.3Kx`, `2.54Mx`); full value on hover and focus
- [ ] Statistical test: average return over many random seeds ≈ 98% (within tolerance) for a fixed Cash Out Lane on each Difficulty
- [ ] Time spent recorded at the bottom of this ticket
