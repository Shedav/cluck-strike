import { describe, expect, test } from 'vitest'
import { roundNumber } from './fairness'
import {
  DIFFICULTIES,
  hitLaneFor,
  laneCount,
  MAX_WIN_CENTS,
  maxWinLane,
  payoutCents,
  RTP,
  survivalOdds,
} from './odds'

describe.each(DIFFICULTIES)('odds on %s', (difficulty) => {
  test('survival odds start at or below 1 and decrease along the road', () => {
    expect(survivalOdds(difficulty, 1)).toBeLessThanOrEqual(1)
    for (let lane = 2; lane <= laneCount(difficulty); lane++) {
      expect(survivalOdds(difficulty, lane)).toBeLessThan(survivalOdds(difficulty, lane - 1))
    }
  })

  test('cashing out at Lane 3 returns about RTP over many random Rounds', async () => {
    const lane = 3
    const rounds = 20_000
    let paid = 0
    for (let nonce = 0; nonce < rounds; nonce++) {
      const hit = hitLaneFor(difficulty, await roundNumber('rtp-check', 'client', nonce))
      if (hit === null || hit > lane) paid += payoutCents(100, difficulty, lane)
    }
    // 3 standard errors on Hardcore (the widest spread) is about 0.04.
    expect(Math.abs(paid / (rounds * 100) - RTP)).toBeLessThan(0.05)
  }, 30_000) // 20,000 HMACs; slow when files run in parallel
})

describe('odds', () => {
  test('lane counts follow the reference game', () => {
    expect(DIFFICULTIES.map(laneCount)).toEqual([24, 22, 20, 15])
  })

  test('maps the uniform number to the Hit Lane at the boundaries', () => {
    const lane1 = survivalOdds('easy', 1) // 0.98 / 1.03
    expect(hitLaneFor('easy', 0.999999)).toBe(1)
    expect(hitLaneFor('easy', lane1)).toBe(1)
    expect(hitLaneFor('easy', lane1 - 1e-9)).toBe(2)
    expect(hitLaneFor('easy', survivalOdds('easy', 2))).toBe(2)
    expect(hitLaneFor('easy', 0)).toBeNull() // survives every Lane: Finish
    expect(hitLaneFor('hardcore', survivalOdds('hardcore', 15))).toBe(15)
  })

  test('payout is Bet × Multiplier rounded down to the cent and capped at Max Win', () => {
    expect(payoutCents(1000, 'easy', 2)).toBe(1070) // 10.00 × 1.07
    expect(payoutCents(1, 'easy', 1)).toBe(1) // 0.01 × 1.03 = 0.0103
    expect(payoutCents(15_000, 'easy', 24)).toBe(291_600) // 150 × 19.44
    expect(payoutCents(15_000, 'hardcore', 15)).toBe(MAX_WIN_CENTS)
  })

  test('Max Win Lane is the first Lane whose payout reaches 10,000', () => {
    expect(maxWinLane(15_000, 'hardcore')).toBe(8) // 150 × 62.96 = 9,444; 150 × 140.24 = 21,036
    expect(maxWinLane(100, 'hardcore')).toBe(13) // 1 × 9,161.08 = 9,161.08; 1 × 39,301.05 caps
    expect(maxWinLane(300, 'easy')).toBeNull() // 3 × 19.44 never reaches it
  })
})
