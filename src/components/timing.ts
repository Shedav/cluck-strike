/** The chicken throws a smoke grenade at the next Lane: it lands there (safe) or flies past (Hit). */
export const THROW_MS = 450

/** Then the chicken hops onto that Lane. */
export const HOP_MS = 450

/** A whole Step animation; buttons stay locked meanwhile. Road.module.css repeats these delays. */
export const STEP_MS = THROW_MS + HOP_MS

/** Distance from one Lane's centre to the next, for the grenade's flight. */
export const LANE_PX = 135

/** How long a Round's result stays on the scene before the chicken returns to the start. */
export const RESULT_MS = 2000

export const SPRITES = {
  chicken: '/sprites/chicken.svg',
  chickenRoasted: '/sprites/chicken-roasted.svg',
  fire: '/sprites/fire.svg',
  smoke: '/sprites/smoke.svg',
  smokeGrenade: '/sprites/smoke-grenade.svg',
  goldenCase: '/sprites/golden-case.svg',
} as const
