# 04: Fire, Smoke, grenade and the pixel font

Parent: [12 Animated 8-bit art](../12-animated-pixel-art.md)

**What to build:** the remaining sprites become pixel art — looping Lane fire, the Smoke puff and the spinning grenade — and Multipliers and the win popup use a pixel font (Pixelify Sans), like crash's "1.36X". The old SVGs in `public/sprites/` are deleted.

**Blocked by:** 01.

**Status:** done

- [x] Frames shown to the user and approved before wiring in
- [x] Pixel font loaded for badges and the popup, with a fallback while it loads
- [x] No flat SVG sprites left
- [x] Time spent recorded at the bottom of this ticket

**Notes:**

- Frames in `src/widgets/road/pixel/props.ts`: the Lane fire is 16x16, 4 frames looping over 600 ms (odd Lanes start half a loop ahead); the Smoke is 7 frames of a cloud built from round puffs, played over 1.2 s from the grenade's landing (`PixelSprite` got a `delay`), while motion still fades it and lets it drift up; the grenade is one 8x10 frame that motion spins along the arc.
- Pixelify Sans (Google Fonts) is `--font-pixel`, used by the Multiplier badges and the win popup; the rest of the UI keeps Chakra Petch, and the font swaps in once loaded.
- `public/sprites/` and the `SPRITES` map are gone; the spec's Art line now describes the pixel sprites.
- Checked with headless screencast frames of a Step against the production build. Unit 57, e2e 12 pass.

**Time spent:** ~9 min (23:57–00:06, 2026-11-02/03).
