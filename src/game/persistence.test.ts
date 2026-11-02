import { expect, test } from 'vitest'
import { verifyRound } from './fairness'
import { createMockServer } from './mockServer'
import { createGameStore } from './store'

const CLIENT_SEED = 'test-client'

function memoryStorage() {
  const items = new Map<string, string>()
  return {
    items,
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
    removeItem: (key: string) => void items.delete(key),
  }
}

async function seedWithHitLane(match: (hitLane: number | null) => boolean) {
  for (let i = 0; ; i++) {
    if (match(await verifyRound(`server-${i}`, CLIENT_SEED, 0, 'easy'))) return `server-${i}`
  }
}

/** A page load: a fresh server and store over the same storage. */
async function load(storage: ReturnType<typeof memoryStorage>, serverSeed = 'unused') {
  const server = createMockServer({ newSeed: () => serverSeed, storage })
  const game = createGameStore({ server, clientSeed: CLIENT_SEED, storage })
  await game.getState().resume()
  return game
}

test('a reload mid-Round continues it on the same Lane with the same outcome', async () => {
  const storage = memoryStorage()
  const seed = await seedWithHitLane((lane) => lane === 4)
  const before = await load(storage, seed)
  before.getState().setBet(1000)
  await before.getState().play()
  await before.getState().go()

  const after = await load(storage)
  expect(after.getState().balanceCents).toBe(99_000)
  expect(after.getState().round).toMatchObject({ phase: 'playing', lane: 2, betCents: 1000 })

  await after.getState().go()
  await after.getState().go()
  expect(after.getState().round).toMatchObject({ phase: 'hit', lane: 4, serverSeed: seed })
})

test('Balance, Bet and Difficulty survive a reload between Rounds', async () => {
  const storage = memoryStorage()
  const before = await load(storage, await seedWithHitLane((lane) => lane === 1))
  before.getState().setDifficulty('hard')
  before.getState().setBet(250)
  await before.getState().play()

  const after = await load(storage)
  expect(after.getState()).toMatchObject({ balanceCents: 99_750, betCents: 250 })
  expect(after.getState().round.difficulty).toBe('hard')
})

test('corrupted storage starts fresh without crashing', async () => {
  const storage = memoryStorage()
  storage.setItem('cluck-strike:game', '{not json')
  storage.setItem('cluck-strike:server', '{"nonce":-1}')
  const game = await load(storage)
  expect(game.getState()).toMatchObject({ balanceCents: 100_000, betCents: 300 })
  expect(game.getState().round.phase).toBe('idle')
})

test('a saved Round the server no longer knows is dropped', async () => {
  const storage = memoryStorage()
  const before = await load(storage, await seedWithHitLane((lane) => lane === null || lane > 3))
  await before.getState().play()
  storage.items.delete('cluck-strike:server')

  const after = await load(storage)
  expect(after.getState().round.phase).toBe('idle')
})

test('a reload after a finished Round starts from the start line, not the old result', async () => {
  const storage = memoryStorage()
  const before = await load(storage, await seedWithHitLane((lane) => lane === null || lane > 2))
  await before.getState().play()
  await before.getState().cashOut()
  expect(before.getState().round.phase).toBe('cashedOut')

  const after = await load(storage)
  expect(after.getState().round).toMatchObject({ phase: 'idle', lane: 0, difficulty: 'easy' })
  expect(after.getState().balanceCents).toBe(before.getState().balanceCents)
})
