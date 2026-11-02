# 05: Persistence and reload restore

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** the Balance and the Round in progress survive a page reload. A player who reloads mid-Round sees the chicken on the same Lane with the same Multiplier and can keep pressing GO or Cash Out. A reload neither loses nor rescues the Bet.

**Blocked by:** 02.

**Status:** ready-for-agent

- [ ] Game store persists Balance, Bet, Difficulty and the Round in progress (Zustand persist, `localStorage`)
- [ ] Mock server persists its own state (current Server Seed, nonce, Round) separately; the store and UI still never read the Server Seed before the Round ends
- [ ] Reload mid-Round restores the exact Lane, Multiplier and phase; the outcome of the next Step is unchanged
- [ ] Corrupted or missing storage falls back to a fresh start (Balance 1,000) without crashing
- [ ] Store-seam test: a new store over the same storage continues the Round
- [ ] Time spent recorded at the bottom of this ticket
