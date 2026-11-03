# 13: README and final check

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** the submission is ready: a reviewer opens the repository and finds a README that explains how to run the game, how long it took, and which decisions were made and why. The deployed link works on desktop and on a phone.

**Blocked by:** 07, 10, 11 (all done). Ticket 12 is not a blocker: the README describes the art as it is at submission time.

**Status:** ready-for-agent

- [ ] README in English: what the game is, live link, how to run locally and run tests, tech stack
- [ ] Time log assembled from the "time spent" notes in tickets 01–12, plus total
- [ ] Decisions section with the reasons, linking to the ADRs, GLOSSARY.md and docs/spec.md
- [ ] Known limits: client-side fairness (DevTools can see the Hit Lane), mock funds only, the mock server trusts the client's Bet limits and Balance, synthesized sounds
- [ ] Credits: no third-party art or audio (own pixel sprites drawn in code, Web Audio synthesis); Chakra Petch and Pixelify Sans fonts (Google Fonts, OFL)
- [ ] Manual pass on the deployed build: desktop Chrome/Safari and a phone; all Difficulties, Hit, Finish, Max Win, reload mid-Round, EN/RU, sound on/off, hotkeys, Fairness verify, Recent Games Load more
- [ ] CI green on main; deployed version matches main
- [ ] Time spent recorded at the bottom of this ticket

**Notes for writing it:**

- Time log: `docs/TIMELINE.md` has the active time of the first session (away time excluded, ≈ 4 h 20 min); add the later sessions the same way. Ask the user to confirm the totals.
- Decisions to explain, linking the ADRs and the spec rather than repeating them: predetermined outcome and client-side provably fair (ADR 0001); FSD with the boundary test (ADR 0002); Multiplier tables from the genre's reference game with RTP 98% and Max Win 10,000; the mock server behind a backend-shaped contract; synthesized Web Audio sounds; an original theme (CS chicken, molotov fire, smoke grenade); pixel art drawn in code (ticket 12); Fairness verify form and console code (ticket 14); Autoplay (ticket 15).
