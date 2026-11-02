// Cell widths; Road.module.css sets the same flex-basis values.
export const START_PX = 120
export const LANE_PX = 140

/** Horizontal centre of a cell: 0 is the start column, 1..n the Lanes. */
export const centreOf = (cell: number) =>
  cell === 0 ? START_PX / 2 : START_PX + (cell - 1) * LANE_PX + LANE_PX / 2

export const SPRITES = {
  chicken: '/sprites/chicken.svg',
  chickenRoasted: '/sprites/chicken-roasted.svg',
  fire: '/sprites/fire.svg',
  smoke: '/sprites/smoke.svg',
  smokeGrenade: '/sprites/smoke-grenade.svg',
  goldenCase: '/sprites/golden-case.svg',
} as const
