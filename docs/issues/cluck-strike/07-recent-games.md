# 07: Recent Games

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** below the game, the player sees their last 10 finished Rounds (Difficulty, Bet, Multiplier, payout), with wins and Hits in different colors. Clicking a row opens the Fairness modal for that Round. The list survives a reload.

**Blocked by:** 05, 06.

**Status:** done

- [x] Each finished Round (Cash Out, Finish, Max Win, Hit) is added to Recent Games with its fairness data
- [x] Capped at the 10 most recent Rounds
- [x] Win rows in green `#15d77c`, Hit rows in red `#ed4438`; layout in the style of cs2skin's Recent Games table
- [x] Row click (and keyboard activation) opens Fairness for that Round
- [x] Persisted; restored after reload
- [x] Store-seam test for the cap and the order
- [x] Time spent recorded at the bottom of this ticket

**Notes:**

- Each finished Round is stored whole (with its revealed seeds), so a row can open the same proof block as the Fairness modal; the modal shell became a shared `Dialog`.
- A Hit shows 0.00x and 0.00 in red; a win shows its effective Multiplier (payout ÷ Bet, so Max Win reads correctly) in green.
- Rows are clickable, and the "Verify" button in each row gives the same action to keyboard users.

**Time spent:** ~2 min (16:36–16:38, 2026-11-02).
