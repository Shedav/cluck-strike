import { describe, expect, test } from 'vitest'
import { sha256, verifyRound } from './fairness'
import { createMockServer } from './mockServer'
import type { Difficulty } from './odds'
import { betError, canCashOut, canPlay, canTopUp, cashOutCents, createGameStore } from './store'
import { parseCoins } from '../format'

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

function gameWith(serverSeed: string, balanceCents?: number) {
  const server = createMockServer({ newSeed: () => serverSeed })
  return createGameStore({ server, clientSeed: CLIENT_SEED, balanceCents })
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

  test.each([
    ['', 'invalid'],
    ['-5', 'invalid'],
    ['abc', 'invalid'],
    ['1.234', 'invalid'],
    ['0', 'belowMin'],
    ['0.00', 'belowMin'],
    ['150.01', 'aboveMax'],
    ['0.01', null],
    ['150', null],
    ['2.5', null],
  ])('Bet input %j is %s', async (text, error) => {
    const game = gameWith('any')
    game.getState().setBet(parseCoins(text))
    expect(betError(game.getState())).toBe(error)
    expect(canPlay(game.getState())).toBe(error === null)
    await game.getState().play()
    expect(game.getState().round.phase).toBe(error === null ? 'playing' : 'idle')
  })

  test('a Bet above the Balance cannot start a Round', async () => {
    const game = gameWith('any', 500)
    game.getState().setBet(501)
    expect(betError(game.getState())).toBe('aboveBalance')
    await game.getState().play()
    expect(game.getState().balanceCents).toBe(500)
  })

  test('top-up appears only when the Balance is below the minimum Bet and restores 1,000', async () => {
    const rich = gameWith('any', 1)
    expect(canTopUp(rich.getState())).toBe(false)
    rich.getState().topUp()
    expect(rich.getState().balanceCents).toBe(1)

    const broke = gameWith('any', 0)
    expect(canTopUp(broke.getState())).toBe(true)
    broke.getState().topUp()
    expect(broke.getState().balanceCents).toBe(100_000)
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

  test('the next Server Seed hash is committed before Play and matches the seed revealed after', async () => {
    const seed = await seedWithHitLane((lane) => lane === 1)
    const game = gameWith(seed)
    await game.getState().resume()
    const committed = game.getState().next
    expect(committed).toEqual({ serverSeedHash: await sha256(seed), nonce: 0 })

    await game.getState().play()
    expect(game.getState().round).toMatchObject({
      phase: 'hit',
      serverSeed: seed,
      serverSeedHash: committed!.serverSeedHash,
    })
    expect(game.getState().next?.nonce).toBe(1)
  })

  test('a new Client Seed applies from the next Round, never mid-Round', async () => {
    const game = gameWith(await seedWithHitLane((lane) => lane === null || lane > 2))
    game.getState().setClientSeed('  my-seed  ')
    expect(game.getState().clientSeed).toBe('my-seed')
    game.getState().setClientSeed('   ')
    expect(game.getState().clientSeed).toBe('my-seed')

    await game.getState().play()
    expect(game.getState().round.clientSeed).toBe('my-seed')
    game.getState().setClientSeed('other')
    expect(game.getState().clientSeed).toBe('my-seed')
  })

  test('Recent Games keeps the last 10 finished Rounds, newest first', async () => {
    let i = 0
    const server = createMockServer({ newSeed: () => `seed-${i++}` })
    const game = createGameStore({ server, clientSeed: CLIENT_SEED })
    for (let round = 0; round < 12; round++) {
      await game.getState().play()
      if (game.getState().round.phase === 'playing') await game.getState().cashOut()
    }
    const recent = game.getState().recentGames
    expect(recent.map((r) => r.nonce)).toEqual([11, 10, 9, 8, 7, 6, 5, 4, 3, 2])
    expect(recent.every((r) => r.phase !== 'playing' && r.serverSeed !== null)).toBe(true)
  })
})
