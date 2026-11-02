# 02: Tracer bullet — one Round end to end

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** on Easy, the player can type a Bet, press Play (the Bet leaves the Balance and the chicken makes the first Step), press GO for more Steps, and Cash Out to receive Bet × current Multiplier. A Round can end in a Hit (Bet lost) or a Finish (automatic Cash Out after the last Lane). The outcome comes from seeds as described in ADR 0001, through the mock server boundary. The scene is schematic: Lanes as blocks with Multiplier badges and a placeholder chicken that moves Lane to Lane.

**Blocked by:** 01.

**Status:** done

- [x] Odds module: Easy table, RTP 0.98, `P(survive n) = RTP / multiplier(n)`, uniform number → Hit Lane (or none)
- [x] Fairness module: `HMAC-SHA256(serverSeed, clientSeed:nonce)` via Web Crypto → uniform number from the first 52 bits; SHA-256 hash of the Server Seed; verify `(serverSeed, clientSeed, nonce, difficulty) → Hit Lane | none`
- [x] Mock server with an async, backend-shaped API (start Round → hash + nonce, Step → safe | Hit, Cash Out → payout, Server Seed revealed at every Round end); new Server Seed per Round; injectable seed source
- [x] Round transitions as pure functions (`idle → playing → cashedOut | hit | finished`); a transition not allowed in the current phase is ignored
- [x] Game store (Zustand) is the only API the UI uses: Play, GO, Cash Out, Bet setter, Balance (starts at 1,000), current Lane, Multiplier, Cash Out amount, phase
- [x] Play takes the Bet and makes the first Step; the first Step can be a Hit
- [x] Cash Out is only possible after a safe Step; a Round cannot be cancelled
- [x] Store-seam tests (fixed seeds): win via Cash Out, Hit on the first Step, Hit mid-Round, Finish, ignored actions after the Round ends, verify of a finished Round matches its real Hit Lane
- [x] Unit tests: Odds boundaries, Fairness determinism (same inputs → same Hit Lane; changing Client Seed or nonce changes it), allowed and ignored transitions
- [x] Playwright smoke: Play → GO → Cash Out increases the Balance; a forced Hit (fixed seeds) decreases it
- [x] Time spent recorded at the bottom of this ticket

**Notes:**

- Money is kept in integer cents; payouts are Bet × Multiplier rounded down to the cent.
- The Mock server is the only holder of the Server Seed; the store sees the hash and nonce until the Round ends.
- Store actions run one at a time (a `pending` lock), so a double click on GO makes one Step.
- The Playwright tests pin the outcome by stubbing `crypto.getRandomValues` in the page, so the app has no seed backdoor.
- The chicken and fire are emoji placeholders until ticket 08.

**Time spent:** ~4 min (15:41–15:45, 2026-11-02).
