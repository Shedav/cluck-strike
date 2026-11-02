import { describe, expect, test } from 'vitest'
import { verifyRound } from './fairness'
import { createMockServer } from './mockServer'
import type { Difficulty } from './odds'
import { canCashOut, canPlay, cashOutCents, createGameStore } from './store'

const CLIENT_SEED = 'test-client'

/** Finds a Server Seed whose first Round (nonce 0) has the wanted Hit Lane. */
async function seedWithHitLane(
  match: (hitLane: number | null) => boolean,
  difficulty: Difficulty = 'easy',
) {
  for (let i = 0; i < 10_000; i++) {
    const seed = `server-${i}`
    if (match(await verifyRound(seed, CLIENT_SEED, 0, difficulty))) return seed
  }
  throw new Error('no seed found')
}

function gameWith(serverSeed: string) {
  const server = createMockServer({ newSeed: () => serverSeed })
  return createGameStore({ server, clientSeed: CLIENT_SEED })
}

describe('game store', () => {
  test('Play takes the Bet and makes the first Step; GO and Cash Out pay Bet × Multiplier', async () => {
    const game = gameWith(await seedWithHitLane((lane) => lane === null || lane > 3))
    game.getState().setBet(1000)

    await game.getState().play()
    expect(game.getState().balanceCents).toBe(99_000)
    expect(game.getState().round).toMatchObject({ phase: 'playing', lane: 1 })

    await game.getState().go()
    expect(cashOutCents(game.getState())).toBe(1070) // 10.00 × 1.07

    await game.getState().cashOut()
    expect(game.getState().balanceCents).toBe(100_070)
    expect(game.getState().round).toMatchObject({ phase: 'cashedOut', lane: 2, payoutCents: 1070 })
  })

  test('the first Step can be a Hit, and the Bet is lost', async () => {
    const game = gameWith(await seedWithHitLane((lane) => lane === 1))
    await game.getState().play()
    expect(game.getState().round).toMatchObject({ phase: 'hit', lane: 1 })
    expect(game.getState().balanceCents).toBe(100_000 - 300)
    expect(canCashOut(game.getState())).toBe(false)
  })

  test('a Hit mid-Round ends it and further actions are ignored', async () => {
    const game = gameWith(await seedWithHitLane((lane) => lane === 3))
    await game.getState().play()
    await game.getState().go()
    await game.getState().go()
    expect(game.getState().round).toMatchObject({ phase: 'hit', lane: 3 })

    await game.getState().go()
    await game.getState().cashOut()
    expect(game.getState().round).toMatchObject({ phase: 'hit', lane: 3 })
    expect(game.getState().balanceCents).toBe(99_700)
  })

  test('crossing the last Lane is a Finish with an automatic Cash Out', async () => {
    const game = gameWith(await seedWithHitLane((lane) => lane === null))
    game.getState().setBet(100)
    await game.getState().play()
    while (game.getState().round.phase === 'playing') await game.getState().go()
    expect(game.getState().round).toMatchObject({ phase: 'finished', lane: 24, payoutCents: 1944 })
    expect(game.getState().balanceCents).toBe(100_000 - 100 + 1944)
  })

  test('a double click makes only one Step', async () => {
    const game = gameWith(await seedWithHitLane((lane) => lane === null || lane > 5))
    await game.getState().play()
    await Promise.all([game.getState().go(), game.getState().go()])
    expect(game.getState().round.lane).toBe(2)
  })

  test('a Bet above the Balance or below one cent cannot start a Round', async () => {
    const game = gameWith('any')
    game.getState().setBet(100_001)
    expect(canPlay(game.getState())).toBe(false)
    await game.getState().play()
    expect(game.getState().round.phase).toBe('idle')
    game.getState().setBet(0)
    expect(canPlay(game.getState())).toBe(false)
  })

  test('a finished Round verifies to the Hit Lane that actually happened', async () => {
    const game = gameWith(await seedWithHitLane((lane) => lane === 2))
    await game.getState().play()
    await game.getState().go()
    const { round } = game.getState()
    expect(round.serverSeed).not.toBeNull()
    expect(await verifyRound(round.serverSeed!, round.clientSeed!, round.nonce!, 'easy')).toBe(
      round.lane,
    )
  })

  test('reaching Max Win ends the Round with an automatic Cash Out of exactly 10,000', async () => {
    // Hardcore at 150: Lane 7 pays 9,444, Lane 8 would pay 21,036 and is capped.
    const game = gameWith(await seedWithHitLane((lane) => lane === null || lane > 8, 'hardcore'))
    game.getState().setDifficulty('hardcore')
    game.getState().setBet(15_000)
    await game.getState().play()
    while (game.getState().round.phase === 'playing') await game.getState().go()
    expect(game.getState().round).toMatchObject({
      phase: 'maxWin',
      lane: 8,
      payoutCents: 1_000_000,
    })
    expect(game.getState().balanceCents).toBe(100_000 - 15_000 + 1_000_000)
  })

  test('Difficulty can change between Rounds but not during one', async () => {
    const game = gameWith(await seedWithHitLane((lane) => lane === null || lane > 1))
    game.getState().setDifficulty('hard')
    expect(game.getState().round.difficulty).toBe('hard')
    game.getState().setDifficulty('easy')
    await game.getState().play()
    game.getState().setDifficulty('hardcore')
    game.getState().setBet(5)
    expect(game.getState().round).toMatchObject({ difficulty: 'easy', betCents: 300 })
  })
})
