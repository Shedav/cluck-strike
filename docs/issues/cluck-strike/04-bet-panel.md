# 04: Full Bet panel

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** the bottom panel's Bet controls work like the reference game: MIN, the amount input, MAX, and chips 2 / 3 / 8 / 20, all with the gold coin icon. Bets stay within 0.01–150 and never exceed the Balance. Bad input is rejected or corrected. Everything is locked during a Round. A player who can't afford the minimum Bet can top up the demo Balance.

**Blocked by:** 02.

**Status:** done

- [x] Default Bet 3; MIN sets 0.01, MAX sets min(150, Balance); chips set 2 / 3 / 8 / 20
- [x] Input handles empty, negative, letters, more than 2 decimals, above limits and above Balance; Play is disabled while the Bet is invalid
- [x] Amounts formatted `1,234.56` with our own SVG gold coin before the number (no `$`)
- [x] All Bet controls disabled during a Round
- [x] "Top up demo balance" button appears only when the Balance is below 0.01 and restores it to 1,000
- [x] Store-seam tests for limits, invalid Bets and top-up visibility
- [x] Time spent recorded at the bottom of this ticket

**Notes:**

- Invalid input is rejected, not auto-corrected: the field turns red, a message says why (format, min, max, Balance), Play is disabled and the Max Win readout shows "—".
- MAX sets min(150, Balance), but never below the minimum Bet.

**Time spent:** ~1 min (15:55–15:56, 2026-11-02).
