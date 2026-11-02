# 11: Mobile layout, accessibility and hotkeys

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:**

- **Phone layout:** about 2 large Lanes are visible, the Bet panel stacks vertically and Difficulty becomes a dropdown, with no horizontal page scroll.
- **Accessibility:** keyboard and screen-reader players can play the whole game.
- **Hotkeys:** Space for Play/GO, Enter for Cash Out.

**Blocked by:** 03, 04, 08, 09.

**Status:** ready-for-agent

- [ ] Responsive layout down to 360px width: stacked Bet panel, Difficulty dropdown, ~2 Lanes visible, top bar condensed
- [ ] Every control reachable by keyboard with a visible focus style
- [ ] Space = Play/GO, Enter = Cash Out; ignored while typing in an input or while a modal is open
- [ ] Step results, Cash Outs, Finish and Max Win announced through `aria-live`
- [ ] Modals trap focus and close on Escape
- [ ] Playwright smoke runs at a mobile viewport too
- [ ] Time spent recorded at the bottom of this ticket
