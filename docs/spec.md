# Cluck Strike — Spec

Test task: a playable browser game of chance in the genre of Chicken Road that looks like it belongs among the games on cs2skin.com. No backend; all data is mocked on the client. Terms are defined in [GLOSSARY.md](../GLOSSARY.md); decisions with trade-offs live in [docs/adr](adr/).

## Product

- **Name:** Cluck Strike.
- **Theme:** the CS chicken (a well-known CS easter egg) crosses a dusty street in the style of CS maps; the Lanes are burning with molotov fire.
  - Safe Step: a Smoke cloud lands and puts the fire out on that Lane.
  - Hit: the fire flares up and the chicken gets roasted.
  - Finish: a golden case.
  - Fallback theme if this one does not work out: fire bursting from manholes.
- No Valve or cs2skin logos, map names or assets. The logo is our own and does not imitate the Counter-Strike logo.

## Mechanics

### Round flow

- **Play** takes the Bet from the Balance and immediately makes the first Step.
- **GO** makes each next Step.
- **Cash Out** is available after any safe Step, including right after Play. A Round cannot be cancelled.
- A Hit can happen on the very first Step (Play).
- Automatic Cash Out happens:
  - on **Finish**, i.e. the last Lane is crossed safely;
  - on **Max Win**, i.e. when Bet × Multiplier reaches 10,000. The payout is exactly 10,000 and the Round ends.
- **After a Hit** the scene resets after 2 s. A setting ("Auto-reset after Hit", on by default) can turn this off, so the result stays on screen until the next Play.
- **Reloading the page** mid-Round restores the Round exactly where it was.

### Difficulty and odds

- There are four Difficulties: Easy, Medium, Hard and Hardcore, with 24, 22, 20 and 15 Lanes. They use the multiplier tables of the reference game:
  - **Easy:** 1.03, 1.07, 1.12, 1.17, 1.23, 1.29, 1.36, 1.44, 1.53, 1.63, 1.75, 1.88, 2.04, 2.22, 2.45, 2.72, 3.06, 3.50, 4.08, 4.90, 6.13, 6.61, 9.81, 19.44
  - **Medium:** 1.12, 1.28, 1.47, 1.70, 1.98, 2.33, 2.76, 3.32, 4.03, 4.96, 6.20, 6.91, 8.90, 11.74, 15.99, 22.61, 33.58, 53.20, 92.17, 182.51, 451.71, 1788.80
  - **Hard:** 1.23, 1.55, 1.98, 2.56, 3.36, 4.49, 5.49, 7.53, 10.56, 15.21, 22.59, 34.79, 55.97, 94.99, 172.42, 341.40, 760.46, 2007.63, 6956.47, 41321.43
  - **Hardcore:** 1.63, 2.80, 4.95, 9.08, 15.21, 30.12, 62.96, 140.24, 337.19, 890.19, 2643.89, 9161.08, 39301.05, 233448.29, 2542251.93
- **RTP is 98%.** Survival odds are derived from the table: `P(survive n Lanes) = 0.98 / multiplier(n)`. Every Cash Out point has the same 98% expected return, so Difficulty changes variance, not the house edge. Max Win lowers the effective RTP slightly for large Bets; the rules say so.

### Fairness

The outcome is predetermined, as described in [ADR 0001](adr/0001-predetermined-outcome.md).

- The Hit Lane is derived from `HMAC-SHA256(serverSeed, clientSeed:nonce)`, mapped through the survival distribution above.
- Each Round gets a new Server Seed. Its SHA-256 hash is shown before the Round, and the seed itself is revealed after.
- The Client Seed is random by default and can be edited in the Fairness modal. The nonce increments every Round.
- The Fairness modal shows the hash, the seeds, the nonce and the resulting Hit Lane, and lets the player verify the Round.
- A `mockServer` module with an async API (`startRound → { hash }`, `step → safe | hit`, `endRound → { serverSeed }`) owns the seeds. The UI and the store never see the Server Seed before the Round ends. Swapping in a real backend means replacing this one module.

### Bet and Balance

- Bet limits are min 0.01 and max 150, with a default of 3.
- Bet controls: MIN, the input, MAX, and preset chips 2 / 3 / 8 / 20. All Bet and Difficulty controls are disabled during a Round.
- The starting Balance is 1,000. A "Top up demo balance" button appears when the Balance is below the minimum Bet.
- Balance, the Round in progress, Recent Games, language and settings persist in `localStorage`.

### Recent Games

Recent Games lists the player's last 10 finished Rounds: Difficulty, Bet, Multiplier and payout. Each row opens the Fairness modal for that Round. There is no feed of other players' bets.

## UI

- **Style follows cs2skin.com:**
  - Page background `#060b15` with a faint purple glow.
  - Panels use a gradient from `#121925` to `#111820` with a 12px radius. Inputs and chips use `#0c111c`.
  - Colors: accent `#7d2efa`, win `#15d77c`, Hit `#ed4438`, coin `#f8a605`. Text is `#ffffff`, `#ededed` and `#9dabbd`.
  - Font: Chakra Petch. Buttons are pill-shaped with quick 0.16–0.2 s transitions.
- **Currency:** our own gold coin icon in cs2skin style, placed before the number, with no `$`. Up to 2 decimals and thousands separators (`1,234.56`).
- **Layout:**
  - **Top bar:** name, Balance, EN/RU, sound, Fairness, rules, settings.
  - **Scene:** about 5 Lanes visible on desktop and about 2 on mobile. The camera scrolls sideways after the chicken. Each Lane has a Multiplier badge, shown compact (`41.3Kx`, `2.54Mx`) with the full value in a tooltip. Badges beyond the Max Win Lane are dimmed.
  - **Bottom panel:** Bet controls, Difficulty tabs, then Play, which turns into GO plus Cash Out showing Bet × current Multiplier.
  - **Below the game:** Recent Games.
  - **Mobile:** the bottom panel stacks vertically and Difficulty becomes a dropdown.
- **Animation:** DOM + Framer Motion. A Step is a hop, then Smoke or a flare-up. Buttons are locked while an animation plays, which also prevents double clicks.
- **Sound:** step, Smoke, Hit and Cash Out. Sound is off by default and toggled from the top bar. No music.
- **Hotkeys:** Space for Play/GO, Enter for Cash Out.
- **Accessibility:** fully keyboard-operable, Step results announced via `aria-live`, and `prefers-reduced-motion` respected.
- **Art:** cartoon flat 2D with a bold outline.
  - CC0 packs to start; AI-generated sprites later. Claude writes the prompts and the art direction, the user generates the images.
  - Sprites live in `public/sprites/` under fixed names, so they can be swapped without code changes.
- **i18n:** a small typed dictionary for `en` and `ru`. The default language comes from `navigator.language`, and the player's choice is persisted.

## Out of scope

Backend, accounts, other players' bets, live-wins ticker, online counter, music, autoplay.

## Tech

- Vite, React, TypeScript (strict), and pnpm.
- Zustand with `persist`. Round transitions are pure functions kept outside the store.
- CSS Modules with CSS variables for the palette, Framer Motion, and Web Crypto (no crypto dependency).
- Tests: Vitest through the game store's public API (main seam), plus direct unit tests of the odds math, fairness and Round transitions. Playwright smoke tests cover bet → step → cash out and a forced Hit.
- oxlint and Prettier. GitHub Actions runs lint → format check → test → build → smoke.
- Conventional Commits and the MIT license. The GitHub repository is public and deployed to Vercel.
- The README (English) covers how to run the game, a time log by stage, the decisions with links to the ADRs, and known limits (the fairness proof is client-side only).
