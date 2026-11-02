# Round outcome is predetermined from seeds, not by player timing

The Hit Lane is fixed when a Round starts, derived from `HMAC-SHA256(serverSeed, clientSeed:nonce)`; when the player presses a button and what the fire animation shows have no effect on the result. This keeps the RTP exact and lets the player verify every Round (Server Seed hash shown before, Server Seed revealed after), which is how games of chance on skin sites work. A timing/skill model (cross between flames like an arcade game) was rejected: its payout can't be balanced and it is a different genre from the other games on cs2skin.com.

## Consequences

- There is no backend, so the Server Seed is generated and kept in the browser (and in `localStorage` while a Round is in progress). Anyone with DevTools can read the Hit Lane ahead of time; the fairness proof is a demonstration of the mechanism, not real protection. A real deployment would move seed generation and the Round state to a server.
- Animations are cosmetic and are chosen after the outcome is known: Smoke for a safe Step, a flare-up for a Hit.
