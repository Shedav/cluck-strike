# 12: Animated 8-bit art

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** replace the flat SVG sprites with frame-by-frame 8-bit pixel animation in the style of cs2skin.com/crash (a pixel character and bomb, a pixel-font multiplier, an explosion and a skeleton on a crash):

- the chicken: idle bob, throwing the smoke grenade, hopping;
- a Hit: the chicken catches fire, flails, chars and burns down to a skeleton whose bones fall apart;
- the Finish: the golden case shakes, the lid flies open, a golden glow and coins burst out;
- pixel fire (loop), a Smoke puff and the grenade;
- a pixel font for Multipliers and the win popup, like crash's "1.36X".

**Blocked by:** 08.

**Status:** in progress — option 1 (pixel sprites drawn in code) chosen; split into [12-animated-pixel-art/01–04](12-animated-pixel-art/).

Originally this ticket was "art direction and AI image prompts" for still sprites. The user wants animation, and AI image generators don't keep one character consistent across frames, so the options are:

1. **Pixel sprites drawn in code (recommended):** each frame is a small pixel grid (24–32 px) with a shared palette, assembled into sprite sheets and stepped on the scene's existing timings. Consistent style, no downloads or licences, easy to fix pixel by pixel; plain 8-bit detail.
2. **AI-generated sprite sheets:** richer, but frames drift and need hand clean-up in an editor; the user generates them.
3. **CC0 pixel packs:** need downloading and licence checks; a chicken, a skeleton and a case in one style are unlikely to exist.

Once chosen, this ticket is split into slices (sprite engine and chicken; burn to skeleton; case opening; fire, Smoke, grenade and pixel font). Frames are shown to the user for approval before they go into the game. Given the size of the work, it is best done in a fresh session.

- [x] Direction chosen: pixel sprites drawn in code
- [x] Sliced into tickets
- [ ] Time spent recorded at the bottom of this ticket
