# 07: Recent Games

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** below the game, the player sees their last 10 finished Rounds (Difficulty, Bet, Multiplier, payout), with wins and Hits in different colors. Clicking a row opens the Fairness modal for that Round. The list survives a reload.

**Blocked by:** 05, 06.

**Status:** ready-for-agent

- [ ] Each finished Round (Cash Out, Finish, Max Win, Hit) is added to Recent Games with its fairness data
- [ ] Capped at the 10 most recent Rounds
- [ ] Win rows in green `#15d77c`, Hit rows in red `#ed4438`; layout in the style of cs2skin's Recent Games table
- [ ] Row click (and keyboard activation) opens Fairness for that Round
- [ ] Persisted; restored after reload
- [ ] Store-seam test for the cap and the order
- [ ] Time spent recorded at the bottom of this ticket
