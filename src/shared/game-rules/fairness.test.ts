import { expect, test } from 'vitest'
import {
  hmacSha256,
  randomSeed,
  roundNumber,
  sha256,
  verifierSnippet,
  verifyRound,
} from './fairness'
import { DIFFICULTIES } from './odds'

test('HMAC-SHA256 matches RFC 4231 test case 2', async () => {
  expect(await hmacSha256('Jefe', 'what do ya want for nothing?')).toBe(
    '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843',
  )
})

test('SHA-256 of a seed is its published hash', async () => {
  expect(await sha256('abc')).toBe(
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  )
})

test('the same seeds and nonce always give the same Round', async () => {
  const a = await roundNumber('server', 'client', 7)
  expect(await roundNumber('server', 'client', 7)).toBe(a)
  expect(a).toBeGreaterThanOrEqual(0)
  expect(a).toBeLessThan(1)
  expect(await verifyRound('server', 'client', 7, 'easy')).toBe(
    await verifyRound('server', 'client', 7, 'easy'),
  )
})

test('changing the Client Seed or the nonce changes the outcome', async () => {
  const base = await roundNumber('server', 'client', 0)
  expect(await roundNumber('server', 'other-client', 0)).not.toBe(base)
  expect(await roundNumber('server', 'client', 1)).not.toBe(base)
})

test('random seeds are 32 bytes of hex and differ', () => {
  const seed = randomSeed()
  expect(seed).toMatch(/^[0-9a-f]{64}$/)
  expect(randomSeed()).not.toBe(seed)
})

test('the console snippet recomputes the same Hit Lane as verifyRound', async () => {
  const AsyncFunction = (async () => {}).constructor as new (
    ...args: string[]
  ) => (console: Pick<Console, 'log'>) => Promise<void>
  for (const difficulty of DIFFICULTIES) {
    for (let nonce = 0; nonce < 20; nonce++) {
      const serverSeed = randomSeed()
      const clientSeed = `it's "quoted" ${nonce}`
      let printed = ''
      await new AsyncFunction(
        'console',
        verifierSnippet(serverSeed, clientSeed, nonce, difficulty),
      )({
        log: (line: string) => void (printed = line),
      })
      const lane = await verifyRound(serverSeed, clientSeed, nonce, difficulty)
      expect(printed).toBe(lane ? `Hit on Lane ${lane}` : 'No Hit: the chicken reaches the Finish')
    }
  }
})
