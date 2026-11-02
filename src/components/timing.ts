/** The chicken throws a smoke grenade at the next Lane: it lands there (safe) or flies past (Hit). */
export const THROW_MS = 450

/** Then the chicken hops onto that Lane. */
export const HOP_MS = 450

/** On a Hit, how long after the chicken lands the flare peaks and the roasted chicken appears. */
export const ROAST_MS = 350

/** A whole Step animation; buttons stay locked meanwhile. Road.module.css repeats these delays. */
export const STEP_MS = THROW_MS + HOP_MS

// Cell widths; Road.module.css sets the same flex-basis values.
export const START_PX = 120
export const LANE_PX = 140

/** Horizontal centre of a cell: 0 is the start column, 1..n the Lanes. */
export const centreOf = (cell: number) =>
  cell === 0 ? START_PX / 2 : START_PX + (cell - 1) * LANE_PX + LANE_PX / 2

/** After the last Step of a Finish or Max Win, how long the chicken stands there before the celebration. */
export const LANDED_PAUSE_MS = 400

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
