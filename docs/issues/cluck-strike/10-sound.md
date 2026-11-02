# 10: Sound

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** the game plays short sound effects in sync with the animations, toggled from the top bar, and the choice is remembered.

**Blocked by:** 08, 09.

**Status:** done — split into [10-sound/01–03](10-sound/), where the work is recorded.

The plan changed while slicing the ticket, so the original criteria no longer apply:

- Sounds are synthesized with the Web Audio API instead of CC0 files: nothing to download or license.
- Sound is **on** by default (the user's call), not off.
- The Step animation became a throw and a hop, so there are more effects than the original four: throw, Smoke, hop, fire burst, roast (crackling and the chicken's scream), Cash Out chime and Finish fanfare.

Still true: effects fire at the matching animation moment, nothing plays before the first user interaction, and the toggle is persisted.
