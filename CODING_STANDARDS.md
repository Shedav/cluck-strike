# Coding standards

Judgement calls for review. Mechanical rules are enforced by tooling instead: oxlint, Prettier and `tsc` in CI, and `src/app/architecture.test.ts` (Feature-Sliced Design imports, inline SVG icons only in `src/shared/ui/icons`).

## Naming

- Identifiers and UI text use the terms in `GLOSSARY.md` and none of its _Avoid_ words (amount, not coins; Hit, not burn for the outcome). A sprite or animation may keep its visual name (`BURN`).

## Timing and the scene

- Durations live in `src/shared/config/animation.ts`. CSS reads them through custom properties the component sets (see `SCENE_VARS` in `Road.tsx`); a literal in CSS or TS that mirrors a config constant is a defect.
- A delay that must outlast another one is pinned by a test (`src/shared/config/animation.test.ts`).
- Pixel sprites render at a whole multiple of their grid (24 → 96 px, 16 → 64 px), so every pixel stays the same size.
- Scene stacking order: chicken 1, burn and Smoke 2, grenade 3, win popup 4. A new layer takes its place in this order.

## Look

- cs2skin.com is the reference (`/mines`, `/crash`, `/royale`): violet only for primary actions, flat buttons, grey icon + text links.
- Every UI change is checked at 360 px too. A modal's long content scrolls inside it; a flex or grid child holding long text gets `min-width: 0`.

## Interaction

- Space and Enter press whatever control has focus; the global hotkeys (Space = Play/GO, Enter = Cash Out) work only with focus on the page body. A mouse click on Play/GO/Cash Out drops focus to keep it so.
- Buttons stay locked until the animation they start has played.

## Tests

- E2E locators by role use `exact: true` whenever the name is part of another control's name (Play / Autoplay, RU / Rules).
- A negative assertion (`toHaveCount(0)`, "not visible") uses a selector that matches during the positive case; otherwise it passes no matter what.
- A fixed bug lands with the test that fails without the fix.
