import { describe, expect, test } from 'vitest'
import { createGameStore } from '@/entities/round'
import { createMockServer } from '@/shared/api'
import { CASE_MS, LANDED_PAUSE_MS, RESULT_MS, STEP_MS } from '@/shared/config'
import { payoutCents, verifyRound, type Difficulty } from '@/shared/game-rules'
import { createAutoplay } from './autoplay'

const CLIENT_SEED = 'autoplay-client'

/** A Server Seed (reused every Round) whose first Rounds have the wanted Hit Lanes. */
async function seedWhere(
  match: (hitLanes: (number | null)[]) => boolean,
  rounds: number,
  difficulty: Difficulty = 'easy',
) {
  for (let i = 0; i < 20_000; i++) {
    const seed = `server-${i}`
    const lanes = await Promise.all(
      Array.from({ length: rounds }, (_, nonce) =>
        verifyRound(seed, CLIENT_SEED, nonce, difficulty),
      ),
    )
    if (match(lanes)) return seed
  }
  throw new Error('no seed found')
}

async function setup(serverSeed: string, balanceCents?: number, waits: number[] = []) {
  const game = createGameStore({
    server: createMockServer({ newSeed: () => serverSeed }),
    clientSeed: CLIENT_SEED,
    balanceCents,
  })
  await game.getState().resume()
  const autoplay = createAutoplay(game, (ms) => (waits.push(ms), Promise.resolve()))
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

  test('waits for each Step and for the result to show before the next Round', async () => {
    const seed = await seedWhere((lanes) => lanes.every((l) => l === null || l > 2), 2)
    const waits: number[] = []
    const { autoplay, finished } = await setup(seed, undefined, waits)

    autoplay.getState().start({ rounds: 2, cashOutLane: 2 })
    await finished()

    // Play, GO (a Step each), the result, then the second Round; nothing after the last one.
    expect(waits).toEqual([STEP_MS, STEP_MS, RESULT_MS, STEP_MS, STEP_MS])
  })

  test('after a Max Win it also waits out the pause before the celebration', async () => {
    // Hardcore with a 150.00 Bet reaches Max Win on Lane 8 (140.24x), long before the Cash Out Lane.
    const seed = await seedWhere(([lane]) => lane === null || lane > 8, 1, 'hardcore')
    const waits: number[] = []
    const { game, autoplay, finished } = await setup(seed, undefined, waits)
    game.getState().setDifficulty('hardcore')
    game.getState().setBet(15_000)

    autoplay.getState().start({ rounds: 2, cashOutLane: 15 })
    await finished()

    expect(game.getState().recentGames.at(-1)).toMatchObject({ phase: 'maxWin', lane: 8 })
    expect(waits).toContain(RESULT_MS + LANDED_PAUSE_MS)
    expect(waits).not.toContain(RESULT_MS + CASE_MS)
  })
})
