export const DIFFICULTIES = ['easy', 'medium', 'hard', 'hardcore'] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

/** Return to player: every Cash Out point pays back this share of the Bet on average. */
export const RTP = 0.98

/** The largest payout of a single Round, in cents. Reaching it ends the Round with an automatic Cash Out. */
export const MAX_WIN_CENTS = 1_000_000

// Lane Multipliers of the genre's reference game (docs/spec.md); index 0 is Lane 1.
export const MULTIPLIERS: Record<Difficulty, readonly number[]> = {
  easy: [
    1.03, 1.07, 1.12, 1.17, 1.23, 1.29, 1.36, 1.44, 1.53, 1.63, 1.75, 1.88, 2.04, 2.22, 2.45, 2.72,
    3.06, 3.5, 4.08, 4.9, 6.13, 6.61, 9.81, 19.44,
  ],
  medium: [
    1.12, 1.28, 1.47, 1.7, 1.98, 2.33, 2.76, 3.32, 4.03, 4.96, 6.2, 6.91, 8.9, 11.74, 15.99, 22.61,
    33.58, 53.2, 92.17, 182.51, 451.71, 1788.8,
  ],
  hard: [
    1.23, 1.55, 1.98, 2.56, 3.36, 4.49, 5.49, 7.53, 10.56, 15.21, 22.59, 34.79, 55.97, 94.99,
    172.42, 341.4, 760.46, 2007.63, 6956.47, 41321.43,
  ],
  hardcore: [
    1.63, 2.8, 4.95, 9.08, 15.21, 30.12, 62.96, 140.24, 337.19, 890.19, 2643.89, 9161.08, 39301.05,
    233448.29, 2542251.93,
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

/** Bet × Multiplier in whole cents, rounded down and capped at Max Win; integer math avoids float drift. */
export const payoutCents = (betCents: number, difficulty: Difficulty, lane: number) =>
  Math.min(
    MAX_WIN_CENTS,
    Math.floor((betCents * Math.round(multiplierAt(difficulty, lane) * 100)) / 100),
  )

/** First Lane whose payout reaches Max Win for this Bet, or null if the road ends first. */
export function maxWinLane(betCents: number, difficulty: Difficulty): number | null {
  for (let lane = 1; lane <= laneCount(difficulty); lane++) {
    if (payoutCents(betCents, difficulty, lane) >= MAX_WIN_CENTS) return lane
  }
  return null
}
