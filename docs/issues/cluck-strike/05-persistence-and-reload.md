# 05: Persistence and reload restore

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** the Balance and the Round in progress survive a page reload. A player who reloads mid-Round sees the chicken on the same Lane with the same Multiplier and can keep pressing GO or Cash Out. A reload neither loses nor rescues the Bet.

**Blocked by:** 02.

**Status:** done

- [x] Game store persists Balance, Bet, Difficulty and the Round in progress (Zustand persist, `localStorage`)
- [x] Mock server persists its own state (current Server Seed, nonce, Round) separately; the store and UI still never read the Server Seed before the Round ends
- [x] Reload mid-Round restores the exact Lane, Multiplier and phase; the outcome of the next Step is unchanged
- [x] Corrupted or missing storage falls back to a fresh start (Balance 1,000) without crashing
- [x] Store-seam test: a new store over the same storage continues the Round
- [x] Time spent recorded at the bottom of this ticket

**Notes:**

- The mock server saves its state (nonce + Round with the Server Seed) under its own key, and saves each change before returning with no `await` after it, so a reload can't fall between the server's save and the client's.
- On load the store asks the server for its unfinished Round (`currentRound`, without the Server Seed) and trusts it over its own copy; a saved Round the server no longer knows is dropped.
- Saved data is validated field by field; corrupted or odd values fall back to defaults.

**Time spent:** ~5 min (16:04–16:09, 2026-11-02).
