# Handoff — Cluck Strike: tickets 12 and 13

Repo: `/Users/andreishedav/Projects/PetProjects/chicken_road` (GitHub `Shedav/cluck-strike`, public, `main`).
Live: https://cluck-strike.vercel.app/ (Vercel deploys `main` on push). CI: GitHub Actions, green at `8d70253`.

The game is complete through ticket 11 plus many requested tweaks. Two tickets remain. Read these first, don't re-derive them:

- Product + tech spec: `docs/spec.md`
- MVP issue (user stories, modules, tests): `docs/issues/0001-cluck-strike-mvp.md`
- Glossary (use these terms: Round, Lane, Step, Hit, Smoke, Cash Out, Finish, Max Win, Server/Client Seed): `GLOSSARY.md`
- ADRs: `docs/adr/0001-predetermined-outcome.md`, `docs/adr/0002-feature-sliced-design.md`
- Tickets: `docs/issues/cluck-strike/` — 01–11 and `10-sound/01–03` are done; each has notes and a "Time spent" line.
- **Next:** `docs/issues/cluck-strike/12-animated-pixel-art.md` and `docs/issues/cluck-strike/13-readme-and-final-check.md`

## The user and how they work

- Chat in **Russian**; every `*.md` file in **English**.
- **Commits authored by the user only** — no `Co-Authored-By` / Claude attribution, in commits or PRs. Conventional Commits. Push to `main` directly (no PRs so far) after tests pass, then watch CI (`gh run watch`).
- They send many small UI corrections mid-task; address each, verify, commit separately when unrelated.
- They care about looking like cs2skin.com (reference pages: `/royale`, `/mines`, `/crash`). Violet only for primary actions; flat buttons.
- Keep closing each ticket file: tick boxes, `**Status:** done`, a short Notes section, `**Time spent:**` from `date` timestamps.

## Ticket 12 — animated 8-bit art (decision pending)

The user wants frame-by-frame pixel animation like cs2skin.com/crash (pixel terrorist + C4, orange pixel-font "1.36X" multiplier, explosion and skeleton on crash): chicken idle/throw/hop, **burn down to a skeleton**, **golden case opening**, pixel fire/Smoke/grenade, pixel font. The ticket lists three options; **ask the user to pick** (my recommendation: pixel sprites drawn in code — 24–32 px grids + palette → sprite sheets stepped on the existing timings). Then slice it (e.g. sprite engine + chicken; burn → skeleton; case opening; fire/Smoke/grenade + pixel font) and **show frames to the user before wiring them in**. cs2skin loads the pixel fonts Pixelify Sans and ByteBounce (Google Fonts has Pixelify Sans).

Where things are:

- Scene: `src/widgets/road/ui/Road.tsx` (+ `Road.module.css`), sprite paths and cell geometry in `src/widgets/road/config.ts` (`SPRITES`, `START_PX`, `LANE_PX`, `centreOf`). Current sprites: own flat SVGs in `public/sprites/`.
- Animation timings shared with the Bet panel lock: `src/shared/config/animation.ts` (`THROW_MS`, `HOP_MS`, `ROAST_MS`, `STEP_MS`, `LANDED_PAUSE_MS`, `RESULT_MS`). `Road.module.css` repeats 0.45s/0.9s delays for badge colours — keep in sync.
- Chicken choreography lives in `Road.tsx`: per-cell `<Chicken>` inside `AnimatePresence`, `Move` = step/reset/stay computed with React's previous-value pattern (step effects only when `move.kind === 'step'`, so reloads don't replay). Hit: `FlareUp` + `RoastedChicken` after `STEP_MS + ROAST_MS`; reset after `STEP_MS + RESULT_MS`. Finish/Max Win: last Step plays, then `LANDED_PAUSE_MS`, then popup + fanfare. The golden case is in the `.finish` column.
- Sounds already exist and are timed to these moments (`src/shared/lib/sound.ts`, triggered from `Road.tsx`); keep the timing constants when swapping visuals.

## Ticket 13 — README and final check

Checklist is in the ticket. Notes for writing it:

- Time log: collect the `Time spent` lines from tickets 01–12 (system-clock timestamps; design/spec phase ≈ 4 h wall-clock 11:38–15:25 on 2026-11-02, recorded in ticket 01). Ask the user to confirm the totals — the clock-based numbers look short.
- Decisions to explain (link ADRs/spec rather than repeat): predetermined outcome + client-side provably fair (ADR 0001), FSD + boundary test (ADR 0002), Multiplier tables from the genre's reference game with RTP 98% and Max Win 10,000, mock server behind a backend-shaped contract, synthesized Web Audio sounds, original theme (CS chicken, molotov fire, smoke grenade) instead of copying Chicken Road.
- Known limits: DevTools can read the Hit Lane (no backend), mock funds, placeholder art until ticket 12, synthetic sounds.
- Manual pass on the deployed build (desktop + phone) per the ticket; `BASE_URL=https://cluck-strike.vercel.app pnpm test:e2e` runs the e2e suite against the live site.

## Commands and gotchas

- `pnpm dev` / `pnpm build` / `pnpm lint` (oxlint) / `pnpm format` (Prettier, run before committing) / `pnpm test` (Vitest, 54) / `pnpm test:e2e` (Playwright, 12 on desktop + 360px phone).
- macOS 13: Playwright can't install its Chromium; local runs use installed Chrome (`channel: 'chrome'`), CI uses bundled Chromium. Ad-hoc screenshot scripts: create a `.mjs` in the repo root (so `@playwright/test` resolves), run, delete.
- The in-app browser pane is often hidden, which throttles animations — verify animation with headless Playwright screenshots/position sampling instead.
- e2e pins outcomes by stubbing `crypto.getRandomValues` in the page (`rigSeeds` in `e2e/round.spec.ts`); there is no seed backdoor in the app.
- To render sounds for the user to listen to: temporarily `export` `EFFECTS` in `sound.ts`, render each with `OfflineAudioContext` in headless Chrome against the dev server, write WAVs, revert the export.
- Imports between layers use `@/layer/slice` and a slice's `index.ts`; `src/app/architecture.test.ts` fails on violations.
- Dev server for the browser pane: `.claude/launch.json` config `dev` (port 5173).

## Suggested skills

- `ponytail:ponytail` — the user runs in ponytail mode (smallest complete change).
- `grilling` — to settle ticket 12's direction and art details (frame counts, sizes, palette) before drawing.
- `to-tickets` — to slice ticket 12 into tracer-bullet tickets once the direction is chosen (local files under `docs/issues/cluck-strike/12-…/`).
- `prototype` — for a throwaway page to preview pixel frames before integrating.
- `built-in-browser` — before using the browser pane to look at cs2skin.com pages.
- `code-review` or `ponytail:ponytail-review` — before closing ticket 13.
