import { expect, test } from 'vitest'
import { BURN_MS, RESULT_MS } from './animation'

test('the burn ends before the scene resets after a Hit', () => {
  expect(BURN_MS).toBeLessThan(RESULT_MS)
})
