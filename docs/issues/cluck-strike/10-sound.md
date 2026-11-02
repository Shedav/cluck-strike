# 10: Sound

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** the game plays short sound effects for a Step, Smoke, a Hit and a Cash Out, in sync with the animations. Sound is off by default and toggled from the top bar; the choice is remembered.

**Blocked by:** 08, 09.

**Status:** ready-for-agent

- [ ] Four CC0 effects, licenses listed, loaded lazily
- [ ] Each effect fires at the matching animation moment, not when the store result arrives
- [ ] Sound toggle in the top bar, off by default, persisted
- [ ] No sound plays before the first user interaction (browser autoplay rules)
- [ ] Time spent recorded at the bottom of this ticket
