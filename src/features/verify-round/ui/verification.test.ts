import { describe, expect, test } from 'vitest'
import { idleRound, type Phase, type Round } from '@/entities/round'
import { matchesOutcome } from './verification'

const ended = (phase: Phase, lane: number): Round => ({ ...idleRound('easy'), phase, lane })

describe('matchesOutcome: does the recomputed Hit Lane agree with how the Round ended?', () => {
  test('a Hit must be on the recomputed Hit Lane', () => {
    expect(matchesOutcome(ended('hit', 4), 4)).toBe(true)
    expect(matchesOutcome(ended('hit', 4), 5)).toBe(false)
    expect(matchesOutcome(ended('hit', 4), null)).toBe(false)
  })

  test('a Finish needs a Round with no Hit Lane', () => {
    expect(matchesOutcome(ended('finished', 24), null)).toBe(true)
    expect(matchesOutcome(ended('finished', 24), 24)).toBe(false)
  })

  test('a Cash Out or Max Win must stop before the Hit Lane, if there is one', () => {
    for (const phase of ['cashedOut', 'maxWin'] as const) {
      expect(matchesOutcome(ended(phase, 3), 4)).toBe(true)
      expect(matchesOutcome(ended(phase, 3), null)).toBe(true)
      expect(matchesOutcome(ended(phase, 3), 3)).toBe(false)
      expect(matchesOutcome(ended(phase, 3), 2)).toBe(false)
    }
  })

  test('an unfinished Round never verifies', () => {
    expect(matchesOutcome(ended('playing', 2), null)).toBe(false)
    expect(matchesOutcome(ended('idle', 0), null)).toBe(false)
  })
})
