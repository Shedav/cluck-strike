# 13: README and final check

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** the submission is ready: a reviewer opens the repository and finds a README that explains how to run the game, how long it took, and which decisions were made and why. The deployed link works on desktop and on a phone.

**Blocked by:** 07, 10, 11 (all done). Ticket 12 is not a blocker: the README describes the art as it is at submission time.

**Status:** ready-for-agent

- [ ] README in English: what the game is, live link, how to run locally and run tests, tech stack
- [ ] Time log assembled from the "time spent" notes in tickets 01–12, plus total
- [ ] Decisions section with the reasons, linking to the ADRs, GLOSSARY.md and docs/spec.md
- [ ] Known limits: client-side fairness (DevTools can see the Hit Lane), mock funds only, placeholder SVG art until ticket 12, synthesized sounds
- [ ] Credits: no third-party art or audio (own SVG sprites, Web Audio synthesis); Chakra Petch font (Google Fonts, OFL)
- [ ] Manual pass on the deployed build: desktop Chrome/Safari and a phone; all Difficulties, Hit, Finish, Max Win, reload mid-Round, EN/RU, sound on/off, hotkeys, Fairness verify, Recent Games Load more
- [ ] CI green on main; deployed version matches main
- [ ] Time spent recorded at the bottom of this ticket
