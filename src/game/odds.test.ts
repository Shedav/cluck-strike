import { describe, expect, test } from 'vitest'
import { hitLaneFor, laneCount, payoutCents, RTP, survivalOdds } from './odds'

describe('odds (easy)', () => {
  test('survival odds start below 1 and decrease along the road', () => {
    expect(survivalOdds('easy', 1)).toBeLessThanOrEqual(1)
    for (let lane = 2; lane <= laneCount('easy'); lane++) {
      expect(survivalOdds('easy', lane)).toBeLessThan(survivalOdds('easy', lane - 1))
    }
  })

  test('maps the uniform number to the Hit Lane at the boundaries', () => {
    const lane1 = survivalOdds('easy', 1) // 0.98 / 1.03
    const lane2 = survivalOdds('easy', 2)
    expect(hitLaneFor('easy', 0.999999)).toBe(1)
    expect(hitLaneFor('easy', lane1)).toBe(1)
    expect(hitLaneFor('easy', lane1 - 1e-9)).toBe(2)
    expect(hitLaneFor('easy', lane2)).toBe(2)
    expect(hitLaneFor('easy', 0)).toBeNull() // survives every Lane: Finish
    expect(hitLaneFor('easy', survivalOdds('easy', 24))).toBe(24)
  })

  test('payout is Bet × Multiplier rounded down to the cent', () => {
    expect(payoutCents(1000, 'easy', 2)).toBe(1070) // 10.00 × 1.07
    expect(payoutCents(1, 'easy', 1)).toBe(1) // 0.01 × 1.03 = 0.0103
    expect(payoutCents(15_000, 'easy', 24)).toBe(291_600) // 150 × 19.44
  })

  test('cashing out at a fixed Lane returns RTP on average', () => {
    // P(survive n) × multiplier(n) = RTP by construction; check it via hitLaneFor on a fine grid.
    const lane = 5
    const samples = 100_000
    let survived = 0
    for (let i = 0; i < samples; i++) {
      const hit = hitLaneFor('easy', (i + 0.5) / samples)
      if (hit === null || hit > lane) survived++
    }
    expect((survived / samples) * 1.23).toBeCloseTo(RTP, 3)
  })
})
