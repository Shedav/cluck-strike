# 11: Mobile layout, accessibility and hotkeys

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:**

- **Phone layout:** about 2 large Lanes are visible, the Bet panel stacks vertically and Difficulty becomes a dropdown, with no horizontal page scroll.
- **Accessibility:** keyboard and screen-reader players can play the whole game.
- **Hotkeys:** Space for Play/GO, Enter for Cash Out.

**Blocked by:** 03, 04, 08, 09.

**Status:** done

- [x] Responsive layout down to 360px width: stacked Bet panel, Difficulty dropdown, ~2 Lanes visible, top bar condensed
- [x] Every control reachable by keyboard with a visible focus style
- [x] Space = Play/GO, Enter = Cash Out; ignored while typing in an input or while a modal is open
- [x] Step results, Cash Outs, Finish and Max Win announced through `aria-live`
- [x] Modals trap focus and close on Escape
- [x] Playwright smoke runs at a mobile viewport too
- [x] Time spent recorded at the bottom of this ticket

**Notes:**

- Phones (≤ 560px): the logo and Balance share the first row with the tools below; the Bet panel stacks at full width; Difficulty is a native `<select>` (the tabs stay on wider screens). Lane widths are unchanged, so about 1.5–2 Lanes are visible and the camera keeps the chicken's Lane in view.
- Hotkeys are ignored while a dialog is open or another control (an input, MIN, a chip…) has focus, so Space and Enter keep their usual meaning there; on the Play/GO/Cash Out buttons themselves the hotkey replaces the native click to avoid a double action.
- One live region announces every Step, Hit, Cash Out, Finish and Max Win in the current language; the visual win popup is hidden from screen readers to avoid saying it twice.
- A global `:focus-visible` outline covers controls without their own focus style; dialogs are native `<dialog>` (focus trap, Escape).
- Playwright now runs every test on desktop and on a 360px phone profile; test timeout raised to 60 s because animations run in real time.

**Time spent:** ~13 min (22:05–22:18, 2026-11-02), including the Finish fix and the sound render.
