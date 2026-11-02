/** How long one Step animation (hop + Smoke or flare-up) takes; buttons stay locked meanwhile. */
export const STEP_MS = 500

/** How long a Round's result stays on the scene before the chicken returns to the start. */
export const RESULT_MS = 2000

export const SPRITES = {
  chicken: '/sprites/chicken.svg',
  chickenRoasted: '/sprites/chicken-roasted.svg',
  fire: '/sprites/fire.svg',
  smoke: '/sprites/smoke.svg',
  goldenCase: '/sprites/golden-case.svg',
} as const
