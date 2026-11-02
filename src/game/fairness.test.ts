import { expect, test } from 'vitest'
import { hmacSha256, randomSeed, roundNumber, sha256, verifyRound } from './fairness'

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
