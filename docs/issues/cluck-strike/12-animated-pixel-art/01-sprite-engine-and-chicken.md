# 01: Pixel sprite engine and the chicken

Parent: [12 Animated 8-bit art](../12-animated-pixel-art.md)

**What to build:** frames are drawn in code as small pixel grids (one character per pixel, one shared palette) and turned into sprite sheets that step frame by frame. The chicken is the tracer bullet: idle bob, throwing the smoke grenade and hopping, played on the existing timings (`THROW_MS`, `HOP_MS`) in place of `chicken.svg`.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] Frames are text grids with a shared palette; a sheet renders crisp at any scale (no blur)
- [x] Chicken frames: idle, throw, hop — shown to the user and approved before wiring in
- [x] The scene plays them on the existing timings; reduced motion shows a still frame
- [x] Unit test for turning a grid into a sheet
- [x] Time spent recorded at the bottom of this ticket

**Notes:**

- `spriteSheet` (`src/shared/lib/pixel.ts`) turns text grids into one SVG sheet, merging same-coloured runs into rects; `crispEdges` keeps pixels sharp. `PixelSprite` (`src/shared/ui`) is an `<img>` that steps `object-position` with CSS `steps(n, jump-none)`, so the e2e locator `img[alt="Chicken"]` still works. Remount (new `key`) replays a one-off animation.
- Chicken (`src/widgets/road/pixel/chicken.ts`, 24x24 at 4x = 96 px): idle 2 frames looping over 900 ms, throw 3 frames over `THROW_MS`, hop 4 frames over `HOP_MS`; the hop arc itself is still motion's `y`. `chicken.svg` is deleted.
- The flying grenade stays hidden for the first third of the throw, while the wind-up frame still holds it, so it is never seen twice.
- Checked in headless Chrome against the production build by sampling `object-position`: throw → hop → idle switch on time and each frame lasts its share. Unit 56, e2e 12 pass.

**Time spent:** ~20 min (23:15–23:35, 2026-11-02).
