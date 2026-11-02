# 09: Top bar, settings, rules and i18n

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** the top bar of a cs2skin game page: the Cluck Strike name (our own logo), the Balance with the coin, an EN/RU switch, and the Fairness, rules and settings buttons.

- Settings: "Auto-reset after Hit" (on by default).
- Rules modal: RTP 98%, the Multiplier tables of all Difficulties, the Max Win and its effect on RTP for large Bets, and an honest note that this demo's fairness runs in the browser.
- Language: the whole UI is available in English and Russian, starts from the browser language, and remembers the player's choice.

**Blocked by:** 03.

**Status:** ready-for-agent

- [ ] Top bar layout following cs2skin's game header (pill buttons, no glow); our own logo, not imitating the Counter-Strike logo
- [ ] Settings menu with the auto-reset toggle wired to the scene behaviour from ticket 08 (if 08 is done; otherwise wire the store setting only)
- [ ] Rules modal with RTP, all four tables, Max Win, and the client-side fairness note
- [ ] Typed `en`/`ru` dictionary; a missing key is a type error; every UI string goes through it
- [ ] Default language from `navigator.language` (ru → ru, otherwise en); choice and settings persisted
- [ ] Time spent recorded at the bottom of this ticket
