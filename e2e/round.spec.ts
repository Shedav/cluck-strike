import { expect, test, type Page } from '@playwright/test'
import { verifyRound } from '../src/game/fairness.ts'

/**
 * Makes every seed in the page predictable: crypto.getRandomValues fills with one byte, so both the
 * Client Seed and the Server Seed become that byte repeated. Picks a byte whose first Round matches.
 */
async function rigSeeds(page: Page, match: (hitLane: number | null) => boolean) {
  for (let byte = 0; byte < 256; byte++) {
    const seed = byte.toString(16).padStart(2, '0').repeat(32)
    if (match(await verifyRound(seed, seed, 0, 'easy'))) {
      await page.addInitScript((b) => {
        crypto.getRandomValues = <T extends ArrayBufferView | null>(array: T) => {
          if (array instanceof Uint8Array) array.fill(b)
          return array
        }
      }, byte)
      return
    }
  }
  throw new Error('no byte gives the wanted Round')
}

async function placeBet(page: Page, amount: string) {
  await page.goto('/')
  await page.getByLabel('Bet Amount').fill(amount)
}

test('Play → GO → Cash Out increases the Balance', async ({ page }) => {
  await rigSeeds(page, (lane) => lane === null || lane > 2)
  await placeBet(page, '10')
  await page.getByRole('button', { name: 'Play' }).click()
  await page.getByRole('button', { name: 'GO' }).click()
  await page.getByRole('button', { name: /Cash Out 10\.70/ }).click()

  await expect(page.getByRole('status')).toHaveText('Cashed out 10.70')
  await expect(page.getByTestId('balance')).toHaveText('1,000.70')
})

test('a Hit on the first Step loses the Bet', async ({ page }) => {
  await rigSeeds(page, (lane) => lane === 1)
  await placeBet(page, '10')
  await page.getByRole('button', { name: 'Play' }).click()

  await expect(page.getByRole('status')).toHaveText('Hit on Lane 1. Bet lost.')
  await expect(page.getByTestId('balance')).toHaveText('990.00')
  await expect(page.getByRole('button', { name: 'Play' })).toBeEnabled()
})
