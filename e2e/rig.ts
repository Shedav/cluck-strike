import type { Page } from '@playwright/test'
import { verifyRound } from '../src/shared/game-rules/fairness.ts'

/**
 * Makes every seed in the page predictable: crypto.getRandomValues fills with one byte, so both the
 * Client Seed and the Server Seed become that byte repeated. Picks a byte whose first `rounds`
 * Rounds (nonces 0, 1, ...) have the wanted Hit Lanes (null: no Hit up to the Finish).
 */
export async function rigSeeds(
  page: Page,
  match: (hitLanes: (number | null)[]) => boolean,
  rounds = 1,
) {
  for (let byte = 0; byte < 256; byte++) {
    const seed = byte.toString(16).padStart(2, '0').repeat(32)
    const lanes = await Promise.all(
      Array.from({ length: rounds }, (_, nonce) => verifyRound(seed, seed, nonce, 'easy')),
    )
    if (match(lanes)) {
      await page.addInitScript((b) => {
        crypto.getRandomValues = <T extends ArrayBufferView | null>(array: T) => {
          if (array instanceof Uint8Array) array.fill(b)
          return array
        }
      }, byte)
      return
    }
  }
  throw new Error('no byte gives the wanted Rounds')
}
