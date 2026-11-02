import { describe, expect, test } from 'vitest'
import { createGameStore } from '@/entities/round'
import { createMockServer } from '@/shared/api'
import { payoutCents, verifyRound } from '@/shared/game-rules'
import { createAutoplay } from './autoplay'

const CLIENT_SEED = 'autoplay-client'

/** A Server Seed (reused every Round) whose first Rounds have the wanted Hit Lanes. */
async function seedWhere(match: (hitLanes: (number | null)[]) => boolean, rounds: number) {
  for (let i = 0; i < 10_000; i++) {
    const seed = `server-${i}`
    const lanes = await Promise.all(
      Array.from({ length: rounds }, (_, nonce) => verifyRound(seed, CLIENT_SEED, nonce, 'easy')),
    )
    if (match(lanes)) return seed
  }
  throw new Error('no seed found')
}

async function setup(serverSeed: string, balanceCents?: number) {
  const game = createGameStore({
    server: createMockServer({ newSeed: () => serverSeed }),
    clientSeed: CLIENT_SEED,
    balanceCents,
  })
  await game.getState().resume()
  const autoplay = createAutoplay(game, () => Promise.resolve())
  const finished = () =>
    new Promise<void>((resolve) => {
      const unsubscribe = autoplay.subscribe((s) => s.running || (unsubscribe(), resolve()))
    })
  return { game, autoplay, finished }
}

describe('autoplay', () => {
  test('plays the Rounds and cashes out on the chosen Lane', async () => {
    const seed = await seedWhere((lanes) => lanes.every((l) => l === null || l > 2), 3)
    const { game, autoplay, finished } = await setup(seed)

    autoplay.getState().start({ rounds: 3, cashOutLane: 2 })
    expect(autoplay.getState()).toMatchObject({ running: true, total: 3 })
    await finished()

    const { recentGames, balanceCents } = game.getState()
    expect(recentGames.map((r) => [r.phase, r.lane])).toEqual([
      ['cashedOut', 2],
      ['cashedOut', 2],
      ['cashedOut', 2],
    ])
    expect(balanceCents).toBe(100_000 + 3 * (payoutCents(300, 'easy', 2) - 300))
  })

  test('Stop lets the current Round finish and starts no more', async () => {
    const seed = await seedWhere((lanes) => lanes.every((l) => l === null || l > 1), 2)
    const { game, autoplay, finished } = await setup(seed)

    autoplay.getState().start({ rounds: 5, cashOutLane: 1 })
    autoplay.getState().stop()
    expect(autoplay.getState().stopping).toBe(true)
    await finished()

    expect(game.getState().recentGames).toHaveLength(1)
    expect(game.getState().round).toMatchObject({ phase: 'cashedOut', lane: 1 })
  })

  test('stops when the Balance no longer covers the Bet', async () => {
    const seed = await seedWhere((lanes) => lanes[0] === 1 && lanes[1] === 1, 2)
    const { game, autoplay, finished } = await setup(seed, 600)

    autoplay.getState().start({ rounds: 5, cashOutLane: 3 })
    await finished()

    expect(game.getState().recentGames.map((r) => r.phase)).toEqual(['hit', 'hit'])
    expect(game.getState().balanceCents).toBe(0)
  })
})
