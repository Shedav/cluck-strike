# 09: Top bar, rules and i18n

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** the top bar of a cs2skin game page: the Cluck Strike name (our own logo), the Balance with the coin, an EN/RU switch, and the Fairness and rules buttons.

- Rules modal: RTP 98%, the Multiplier tables of all Difficulties, the Max Win and its effect on RTP for large Bets, and an honest note that this demo's fairness runs in the browser.
- Language: the whole UI is available in English and Russian, starts in English, and remembers the player's choice.

**Blocked by:** 03.

**Status:** done

- [x] Top bar layout following cs2skin's game header (pill buttons, no glow); our own logo, not imitating the Counter-Strike logo
- [x] Rules modal with RTP, all four tables, Max Win, and the client-side fairness note
- [x] Typed `en`/`ru` dictionary; a missing key is a type error; every UI string goes through it
- [x] Default language English (changed from browser detection at the user's request); choice persisted
- [x] Time spent recorded at the bottom of this ticket

**Notes:**

- Language (and later sound) live in their own small persisted store, separate from the game.
- The Russian dictionary is typed against the English keys, so a missing or misspelled key fails the build; messages use `{name}` placeholders.
- `<html lang>` follows the chosen language.
- Our own logo is the coin-and-chicken favicon with a violet glow plus a plain wordmark; nothing borrowed from the Counter-Strike logo.
- Also in this change, requested during the ticket: after a win or a Hit the chicken now fades out where it stands and fades in at the start (no visible flight back), and it is drawn inside its cell, so it is centred on the start column again.

**Time spent:** ~9 min (16:46–16:55, 2026-11-02).
