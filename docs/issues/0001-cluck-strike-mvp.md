---
title: Cluck Strike — playable game (MVP)
labels: [ready-for-agent]
status: open
---

## Problem Statement

A player on a skin-gambling site like cs2skin.com wants a quick game of chance in the Chicken Road genre: one Bet, a few tense Steps, and a choice of when to Cash Out. The task also needs the game to be playable in a browser with no backend, to look like it belongs among the cs2skin games, and to be honest about its odds: the player should be able to check that a Round was not rigged against their choices.

## Solution

**Cluck Strike** is a single-page React game with mock funds.

**The scene:**

- A cartoon CS chicken crosses a burning street, one Lane per Step.
- On a safe Step, Smoke puts out the fire.
- On a Hit, the fire flares up and the chicken is roasted.
- Each Lane shows the Multiplier the player would get by cashing out there.

**The game:**

- The player picks a Bet and one of four Difficulties. Play takes the Bet and makes the first Step; GO makes each next one.
- Cash Out is available after any safe Step.
- Crossing the last Lane (Finish) or reaching Max Win cashes out automatically.

**Fairness and state:**

- The Hit Lane is fixed before the Round from a Server Seed and a Client Seed, and every Round can be verified afterwards.
- All state lives in the browser and survives a reload.

The UI follows the cs2skin look (palette, Chakra Petch, pill buttons, gold coin currency), works on mobile, and is available in English and Russian.

See [docs/spec.md](../spec.md), [GLOSSARY.md](../../GLOSSARY.md) and [ADR 0001](../adr/0001-predetermined-outcome.md).

## User Stories

### Betting

1. As a player, I want to start with a mock Balance of 1,000, so that I can play right away without signing up.
2. As a player, I want to type a Bet amount, so that I can stake exactly what I want.
3. As a player, I want MIN and MAX buttons, so that I can jump to the Bet limits in one click.
4. As a player, I want preset chips 2 / 3 / 8 / 20, so that I can pick a common Bet quickly.
5. As a player, I want the Bet to be limited to 0.01–150 and never more than my Balance, so that I can't place an invalid Bet.
6. As a player, I want invalid Bet input (empty, negative, too many decimals, letters) to be rejected or corrected, so that the game never starts with a broken amount.
7. As a player, I want the default Bet to be 3, so that I have a sensible starting point.
8. As a player, I want to see my Balance with a gold coin icon, formatted like `1,234.56`, so that amounts read like the rest of the site.
9. As a player who ran out of funds, I want a "Top up demo balance" button when my Balance is below the minimum Bet, so that I can keep playing.

### Difficulty

10. As a player, I want to choose between Easy, Medium, Hard and Hardcore, so that I can pick how risky the Round is.
11. As a player, I want each Difficulty to show its Lanes with their Multipliers before I start, so that I know what I'm playing for.
12. As a player, I want to see the Max Win for the chosen Bet and Difficulty, so that I know the ceiling.
13. As a player, I want Lanes beyond the Max Win point to look dimmed, so that I understand they can't pay more.

### Playing a Round

14. As a player, I want Play to take my Bet and immediately make the first Step, so that the Round starts with action.
15. As a player, I want GO to make the next Step, so that I control how far I push my luck.
16. As a player, I want a safe Step to show Smoke putting out the fire and the Multiplier rising, so that I feel the relief of surviving.
17. As a player, I want a Hit to show the fire flaring up and the chicken being roasted, so that losing is clear and dramatic.
18. As a player, I want to understand that I can be Hit on the very first Step, so that Play never feels like a free start.
19. As a player, I want the Cash Out button to show Bet × current Multiplier, so that I see exactly what I'd take home.
20. As a player, I want Cash Out to add that amount to my Balance and end the Round, so that I lock in my win.
21. As a player, I want crossing the last Lane to cash out automatically (Finish, golden case), so that a full run pays out without an extra click.
22. As a player, I want the Round to cash out automatically at exactly 10,000 when Bet × Multiplier reaches Max Win, so that I never take a Step that can't pay more.
23. As a player, I want the camera to follow the chicken sideways, so that the next Lanes are always in view.
24. As a player, I want Bet and Difficulty controls to be locked during a Round, so that nothing changes mid-Round.
25. As a player, I want buttons to be locked while a Step animation plays, so that double clicks don't make extra Steps.
26. As a player, I want the scene to reset 2 seconds after a Hit, so that I can quickly play again.
27. As a player who reloads the page mid-Round, I want the Round restored exactly where it was, so that a reload neither loses nor rescues my Bet.
28. As a keyboard player, I want Space for Play/GO and Enter for Cash Out, so that I can play without the mouse.

### Fairness

29. As a player, I want to see the hash of the next Server Seed before I Play, so that I know the outcome is already fixed.
30. As a player, I want to see and change my Client Seed, so that the game can't pick the outcome alone.
31. As a player, I want the Server Seed revealed after the Round, so that I can check the result myself.
32. As a player, I want a Fairness modal that recomputes the Hit Lane from the revealed seeds and nonce, so that I can verify the Round in one click.
33. As a player, I want to open Fairness for any Round in Recent Games, so that I can verify past Rounds too.
34. As a player, I want the rules to state the RTP (98%), the Multiplier tables, the Max Win, and that Max Win slightly lowers RTP on large Bets, so that the odds are transparent.
35. As a curious player, I want the rules to say that this demo's fairness runs in the browser, so that I'm not misled about its guarantees.

### Recent Games

36. As a player, I want a Recent Games list of my recent Rounds (10 at a time, Load more for up to 100) with Difficulty, Bet, Multiplier and payout, so that I can track how I'm doing.
37. As a player, I want wins and Hits colored differently in Recent Games, so that I can scan results at a glance.
38. As a player, I want Recent Games to survive a reload, so that my history isn't lost.

### Language and sound

39. As a Russian-speaking player, I want to switch the UI to Russian (English is the default), so that I can play in my language.
40. As a player, I want to switch between EN and RU and have my choice remembered, so that it sticks between visits.
41. As a player, I want sound effects for the throw, Smoke, hop, Hit, Cash Out and Finish, on by default with a toggle in the top bar, so that the game feels alive and I can still mute it.
42. As a player, I want my sound and language choices remembered, so that I don't set them every time.

### Look, layout, accessibility

43. As a cs2skin visitor, I want the game to use the site's dark purple look, Chakra Petch font and pill buttons, so that it feels native to the site.
44. As a desktop player, I want about 5 Lanes visible, the Bet panel at the bottom and Recent Games below, so that everything fits on one screen.
45. As a mobile player, I want about 2 large Lanes visible, a stacked Bet panel and a Difficulty dropdown, so that the game is comfortable on a phone.
46. As a player, I want large Multipliers shown compactly in badges (`41.3Kx`, `2.54Mx`) with the full value on hover/focus, so that badges stay readable.
47. As a screen-reader user, I want Step results and Cash Outs announced, so that I can follow the Round without seeing it.
48. As a player with reduced-motion enabled, I want shorter animations without shaking, so that the game is comfortable to watch.
49. As a keyboard user, I want every control reachable and visibly focused, so that I can play without a mouse.

### Reviewer / developer

50. As a reviewer, I want a public repository with a clean Conventional Commits history, so that I can follow how the work was done.
51. As a reviewer, I want a deployed link, so that I can play without building anything.
52. As a reviewer, I want a README with a time log, the decisions and links to ADRs, so that I can judge the trade-offs.
53. As a developer, I want the Server Seed handling behind a single mock server module, so that a real backend can replace it without touching the UI.
54. As a developer, I want sprites under fixed names, so that new art can replace the placeholder sprites without code changes.
55. As a developer, I want CI to run lint, tests and build on every push, so that main always works.

## Implementation Decisions

### Modules

- **Odds.** Holds the four Difficulty tables (Lane Multipliers from [docs/spec.md](../spec.md)), the RTP (0.98) and the Max Win (10,000).
  - It derives survival odds with `P(survive n Lanes) = RTP / multiplier(n)`.
  - It maps a uniform number in [0, 1) to a Hit Lane: the first Lane `n` where the number is ≥ `P(survive n)`. If there is no such Lane, there is no Hit and the Round can reach the Finish.
  - It also answers which Lane first reaches Max Win for a given Bet.
- **Fairness.**
  - Computes `HMAC-SHA256(serverSeed, clientSeed:nonce)` with Web Crypto and turns the first 52 bits into a uniform number.
  - Hashes a Server Seed with SHA-256.
  - Exposes one verify operation `(serverSeed, clientSeed, nonce, difficulty) → Hit Lane | none`, used by both the Fairness modal and the mock server.
- **Mock server.** Owns the seeds and the authoritative Round.
  - Its API is async and shaped like a real backend:
    - start Round with Bet, Difficulty and Client Seed → hash and nonce;
    - Step → safe or Hit;
    - Cash Out → payout;
    - every Round end reveals the Server Seed.
  - A new Server Seed is drawn for every Round, one Round ahead, so its hash can be shown before Play (`nextRound`).
  - `currentRound` returns the unfinished Round without its seed, so a reloaded client can resume it.
  - It keeps its own persisted state, so a Round survives a reload; the UI never reads the Server Seed before the Round ends.
  - It accepts an injectable seed source. Tests pass fixed seeds; the app uses `crypto.getRandomValues`.
- **Round transitions.** Pure functions describing the Round phases. This is the client's view of the state machine: `idle → playing → cashedOut | hit | finished | maxWin`.
  - A transition is ignored when the current phase does not allow it. This is the guard against double clicks and a Step after the end.
- **Game store** (Zustand + persist). This is the single public API the UI talks to:
  - player actions: Play, GO, Cash Out;
  - Bet and Difficulty setters, Client Seed setter, top-up;
  - language and sound toggles;
  - derived values: Cash Out amount, Max Win Lane, whether each action is allowed.
  - It persists Balance, the Round in progress and Recent Games (last 100 Rounds); language and sound are persisted separately. A finished Round is not persisted.
- **i18n.** A small typed `en`/`ru` dictionary. A missing key is a type error. The default language is English.
- **Sound.** Effects synthesized with the Web Audio API (no files): throw, Smoke, hop, fire burst, roast (crackling and the chicken's scream), Cash Out chime, Finish fanfare. Silent until the first user gesture and when muted.
- **UI components:**
  - Top bar: name, Balance, language, sound, Fairness, rules.
  - Scene: Lanes, Multiplier badges, chicken, fire / Smoke / flare-up, golden case at the Finish.
  - Bet panel: MIN, input, MAX, chips, Difficulty tabs or dropdown, Play / GO / Cash Out.
  - Recent Games.
  - Fairness and rules modals.

### Behaviour details

- Play is one action: it takes the Bet and makes the first Step, so the first Step can be a Hit.
- Cash Out is only allowed in `playing`, after at least one safe Step. A Round cannot be cancelled.
- Auto Cash Out happens on Finish and when Bet × Multiplier ≥ Max Win. In the Max Win case the payout is exactly Max Win.
- Multipliers and payouts are shown with 2 decimals. Badges use a compact form above 1,000.
- Animations are cosmetic and run after the store knows the result (ADR 0001). The UI keeps its own "animating" lock on top of the store's phase guard.
- After a Hit, the burn plays and then the scene resets; the Round itself is already finished in the store.
- The stack is DOM + Framer Motion, with no canvas. CSS Modules use CSS variables for the cs2skin palette.
- Code is organised by Feature-Sliced Design with an import-boundary test (ADR 0002): game rules and the mock server in `shared`, the Round model and store in `entities/round`, the Fairness check in `features/verify-round`, and the top bar, scene, Bet panel and Recent Games as widgets.

## Testing Decisions

A good test drives the system the way its user does and asserts what the user can observe: Balance, Multiplier, phase, payout, Recent Games, revealed seeds. It never asserts internal calls or private state. Fixed seeds make every scenario deterministic.

These set the prior art for the codebase.

**Main seam: the game store's public API (Vitest).**

- Bet validation and limits.
- Play takes the Bet, and a Hit can happen on the first Step.
- GO and Cash Out payouts.
- Finish and Max Win auto Cash Out.
- Locked actions are ignored (double click, Step after the end).
- A Round is restored after a reload (a new store over the same storage).
- Recent Games caps at 100 Rounds, newest first.
- Top-up appears only below the minimum Bet.
- Verifying a finished Round from its revealed seeds gives the Hit Lane that actually happened.

**Direct unit tests of the pure modules (Vitest).**

- Odds:
  - survival odds decrease along each table;
  - `P(survive 1) ≤ 1` for all Difficulties;
  - Hit Lane mapping at the boundaries;
  - Max Win Lane for a few Bets;
  - a statistical check that the average return over many random seeds is ≈ 98% for a fixed Cash Out Lane.
- Fairness:
  - known HMAC vectors;
  - the same inputs always give the same Hit Lane;
  - changing the Client Seed or the nonce changes the outcome.
- Round transitions: allowed and ignored transitions per phase.

**UI (Playwright), against the built app, on desktop and a 360px phone:**

- Play → GO → Cash Out increases the Balance.
- A forced Hit (fixed seeds injected for the test) shows the result and decreases the Balance.
- A full Easy run crosses all 24 Lanes before the Finish.
- Space and Enter play, step and cash out.
- A reload mid-Round shows the chicken on its Lane without replaying the Step.
- The page fits a phone without sideways scroll.

## Out of Scope

- A real backend, accounts or authentication.
- Real money, and Max Win cases beyond 10,000.
- Other players' bets, a live-wins ticker, an online counter.
- Music, autoplay, leaderboards.
- Valve or cs2skin logos, map names or assets.
- Final art. The MVP uses our own flat SVG sprites; animated 8-bit art is ticket 12.

## Further Notes

- The fairness proof runs in the browser, so anyone with DevTools can read the Hit Lane early (ADR 0001). The README must say so.
- The Multiplier tables follow the genre's reference game. Name, theme, art and code are original.
- The fallback theme, if the molotov/Smoke theme doesn't work visually, is fire from manholes; the mechanics don't change.
- All `*.md` files in the repo are in English.
