export type Difficulty = 'easy'

/** Return to player: every Cash Out point pays back this share of the Bet on average. */
export const RTP = 0.98

// Lane Multipliers of the genre's reference game (docs/spec.md); index 0 is Lane 1.
export const MULTIPLIERS: Record<Difficulty, readonly number[]> = {
  easy: [
    1.03, 1.07, 1.12, 1.17, 1.23, 1.29, 1.36, 1.44, 1.53, 1.63, 1.75, 1.88, 2.04, 2.22, 2.45, 2.72,
    3.06, 3.5, 4.08, 4.9, 6.13, 6.61, 9.81, 19.44,
  ],
}

export const laneCount = (difficulty: Difficulty) => MULTIPLIERS[difficulty].length

/** Multiplier for standing on `lane` (1-based). */
export const multiplierAt = (difficulty: Difficulty, lane: number) =>
  MULTIPLIERS[difficulty][lane - 1]

/** Chance to survive Lanes 1..lane, chosen so that cashing out there returns exactly RTP. */
export const survivalOdds = (difficulty: Difficulty, lane: number) =>
  RTP / multiplierAt(difficulty, lane)

/** Maps a uniform number in [0, 1) to the Hit Lane, or null when the chicken reaches the Finish. */
export function hitLaneFor(difficulty: Difficulty, u: number): number | null {
  for (let lane = 1; lane <= laneCount(difficulty); lane++) {
    if (u >= survivalOdds(difficulty, lane)) return lane
  }
  return null
}

/** Bet × Multiplier in whole cents, rounded down; integer math avoids float drift. */
export const payoutCents = (betCents: number, difficulty: Difficulty, lane: number) =>
  Math.floor((betCents * Math.round(multiplierAt(difficulty, lane) * 100)) / 100)
