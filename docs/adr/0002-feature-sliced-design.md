# Feature-Sliced Design with enforced boundaries

`src` is organised by Feature-Sliced Design: `app → pages → widgets → features → entities → shared`. A layer imports only from layers below it, and another slice only through its `index.ts`, using the `@/layer/slice` alias. `src/app/architecture.test.ts` walks every import and fails CI on a violation, so the boundaries hold without extra lint plugins.

## Where the game's rules and the mock server live

The mock server stands in for a backend (ADR 0001) and must not depend on client code, while the client needs the same Multiplier tables and verification to render badges and re-check a Round. Both therefore sit in `shared`:

- `shared/game-rules`: Multiplier tables, RTP, Max Win, payout, HMAC and `verifyRound`. Pure and framework-free: the rules both sides agree on, like a shared contract package.
- `shared/api`: the server contract (`types.ts`) and the browser-only `mockServer` that implements it. The Round entity depends on the contract types, never on the implementation.

A real backend would move the implementation out of the repo and keep the contract and game rules as a package shared with the client.

## Considered options

- A top-level `server/` folder outside the layers: clearer separation, but the client's verification would then import from outside `src`'s layering. Rejected for a single-repo test task.
- Putting odds in `entities`: the mock server (in `shared`) could no longer use them without breaking the layer order.
