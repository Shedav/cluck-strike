import { describe, expect, test } from 'vitest'
import { cashedOut, idleRound, started, stepped, type Round } from './round'

const start = {
  difficulty: 'easy' as const,
  betCents: 300,
  serverSeedHash: 'hash',
  clientSeed: 'client',
  nonce: 0,
}
const playing = (lane = 0): Round => ({ ...started(idleRound('easy'), start), lane })
const over: Round = { ...playing(2), phase: 'hit', serverSeed: 'seed' }

describe('Round transitions', () => {
  test('a Round starts from idle or from a finished Round, not mid-Round', () => {
    expect(started(idleRound('easy'), start)).toMatchObject({ phase: 'playing', lane: 0 })
    expect(started(over, start)).toMatchObject({ phase: 'playing', lane: 0, serverSeed: null })
    const mid = playing(3)
    expect(started(mid, { ...start, betCents: 999 })).toBe(mid)
  })

  test('Steps move the chicken and end the Round on a Hit or the Finish', () => {
    expect(stepped(playing(0), { outcome: 'safe', lane: 1 })).toMatchObject({
      phase: 'playing',
      lane: 1,
    })
    expect(stepped(playing(1), { outcome: 'hit', lane: 2, serverSeed: 's' })).toMatchObject({
      phase: 'hit',
      lane: 2,
      serverSeed: 's',
    })
    expect(
      stepped(playing(23), { outcome: 'finish', lane: 24, payoutCents: 5832, serverSeed: 's' }),
    ).toMatchObject({ phase: 'finished', payoutCents: 5832, serverSeed: 's' })
  })

  test('Steps after the Round ended are ignored', () => {
    expect(stepped(over, { outcome: 'safe', lane: 3 })).toBe(over)
    expect(stepped(idleRound('easy'), { outcome: 'safe', lane: 1 })).toEqual(idleRound('easy'))
  })

  test('Cash Out needs at least one safe Step and an active Round', () => {
    const result = { lane: 2, payoutCents: 321, serverSeed: 's' }
    expect(cashedOut(playing(2), result)).toMatchObject({ phase: 'cashedOut', payoutCents: 321 })
    const atStart = playing(0)
    expect(cashedOut(atStart, result)).toBe(atStart)
    expect(cashedOut(over, result)).toBe(over)
  })
})
