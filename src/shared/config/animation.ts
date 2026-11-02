// Animation timings shared by the scene (Road) and the controls that wait for it (Bet panel).

/** The chicken throws a smoke grenade at the next Lane: it lands there (safe) or flies past (Hit). */
export const THROW_MS = 450

/** Then the chicken hops onto that Lane. */
export const HOP_MS = 450

/** On a Hit, how long after the chicken lands in the fire it screams (the burn's flailing frames). */
export const ROAST_MS = 350

/** A whole Step animation; buttons stay locked meanwhile. Road.module.css repeats these delays. */
export const STEP_MS = THROW_MS + HOP_MS

/** After the last Step of a Max Win, how long the chicken stands there before the celebration (a Finish waits for the golden case). */
export const LANDED_PAUSE_MS = 400

/** How long a Round's result stays on the scene before the chicken returns to the start. */
export const RESULT_MS = 2000

/** On a Finish, the golden case shakes, bursts open and settles before the celebration starts. */
export const CASE_MS = 1100
