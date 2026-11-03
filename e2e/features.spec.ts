import { expect, test, type Page } from '@playwright/test'
import { rigSeeds } from './rig'

const play = (page: Page) => page.getByRole('button', { name: 'Play', exact: true })
const status = (page: Page) => page.getByRole('status')
const dialog = (page: Page) => page.locator('dialog[open]')

/** Runs a dialog's console code in the page, as a player pasting it into DevTools would. */
async function runConsoleCode(page: Page) {
  const code = await dialog(page).locator('code').last().textContent()
  return page.evaluate(async (code) => {
    let printed = ''
    const AsyncFunction = (async () => {}).constructor as new (
      ...args: string[]
    ) => (console: Pick<Console, 'log'>) => Promise<void>
    await new AsyncFunction('console', code ?? '')({ log: (line: string) => (printed = line) })
    return printed
  }, code)
}

test.describe('Fairness', () => {
  test('the last Round verifies, any Round can be recomputed, and a new Client Seed is used next', async ({
    page,
  }) => {
    await rigSeeds(page, ([lane]) => lane === 1)
    await page.goto('/')
    await play(page).click()
    await expect(status(page)).toHaveText('Hit on Lane 1. Bet lost.')

    await page.getByRole('button', { name: 'Fairness' }).click()
    await expect(dialog(page)).toContainText('✓ Verified')
    await expect(page.getByTestId('verify-result')).toHaveText('Recomputed: Hit on Lane 1')
    expect(await runConsoleCode(page)).toBe('Hit on Lane 1')

    await page.getByLabel('Your Client Seed').fill('my-own-seed')
    await page.getByRole('button', { name: 'Save' }).click()
    await page.getByRole('button', { name: 'Close' }).click()
    await expect(play(page)).toBeEnabled({ timeout: 5000 })
    await play(page).click()

    await page.getByRole('button', { name: 'Fairness' }).click()
    // The Round just played (current or last) ran with the new Client Seed.
    await expect(
      dialog(page)
        .locator('code', { hasText: /^my-own-seed$/ })
        .first(),
    ).toBeVisible()
  })

  test('a Recent Games row opens its proof, with console code that prints the same result', async ({
    page,
  }) => {
    await rigSeeds(page, ([lane]) => lane === 1)
    await page.goto('/')
    await play(page).click()
    await expect(status(page)).toHaveText('Hit on Lane 1. Bet lost.')

    await page.getByRole('button', { name: 'Verify' }).click()
    await expect(dialog(page)).toContainText('Round fairness')
    await expect(dialog(page)).toContainText('✓ Verified')
    expect(await runConsoleCode(page)).toBe('Hit on Lane 1')
  })
})

test.describe('Autoplay', () => {
  test('plays the chosen number of Rounds and cashes out on the chosen Lane', async ({ page }) => {
    await rigSeeds(page, (lanes) => lanes.every((l) => l === null || l > 3), 2)
    await page.goto('/')
    await page.getByRole('button', { name: 'Autoplay' }).click()
    await page.getByLabel('Number of Rounds', { exact: true }).fill('2')
    await expect(page.getByLabel('Cash Out on Lane', { exact: true })).toHaveValue('3')
    await page.getByRole('button', { name: 'Start (2)' }).click()

    await expect(page.getByText('Autoplay: Round 1 of 2')).toBeVisible()
    await expect(page.getByText('Autoplay: Round 2 of 2')).toBeVisible({ timeout: 15_000 })
    await expect(play(page)).toBeVisible({ timeout: 15_000 })
    // Two Rounds at 3.00, each cashed out on Lane 3 (1.12x = 3.36).
    await expect(page.getByTestId('balance')).toHaveText('1,000.72')
  })

  test('Stop lets the current Round finish and starts no more', async ({ page }) => {
    await rigSeeds(page, ([lane]) => lane === null || lane > 3)
    await page.goto('/')
    await page.getByRole('button', { name: 'Autoplay' }).click()
    await page.getByRole('button', { name: 'Start (10)' }).click()
    await page.getByRole('button', { name: 'Stop' }).click()
    await expect(page.getByRole('button', { name: 'Stopping…' })).toBeDisabled()

    await expect(play(page)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('balance')).toHaveText('1,000.36')
  })
})

test('a keyboard user pressing Enter on a focused GO takes a Step, not a Cash Out', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'no hardware keyboard on phones')
  await rigSeeds(page, ([lane]) => lane === null || lane > 3)
  await page.goto('/')
  await play(page).click()
  await expect(page.getByRole('button', { name: 'GO' })).toBeEnabled()

  await page.getByRole('button', { name: 'GO' }).focus()
  await page.keyboard.press('Enter')
  await expect(status(page)).toHaveText('Lane 2 crossed. Multiplier 1.07x.')
  await expect(page.getByTestId('balance')).toHaveText('997.00')
})

test('after a Hit, Play waits for the burn to finish', async ({ page }) => {
  await rigSeeds(page, ([lane]) => lane === 1)
  await page.goto('/')
  await play(page).click()
  await expect(status(page)).toHaveText('Hit on Lane 1. Bet lost.')
  await expect(play(page)).toBeDisabled()
  await expect(play(page)).toBeEnabled({ timeout: 5000 })
})

test('language and sound choices survive a reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'RU', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Играть', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Звук' }).click()
  await expect(page.getByRole('button', { name: 'Звук' })).toHaveAttribute('aria-pressed', 'false')

  await page.reload()
  await expect(page.getByRole('button', { name: 'Играть', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Звук' })).toHaveAttribute('aria-pressed', 'false')
})

test('the rules open and close', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Rules' }).click()
  await expect(dialog(page)).toContainText('How to play')
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(dialog(page)).toHaveCount(0)
})

test('an invalid Bet shows why and blocks Play', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Bet Amount').fill('0')
  await expect(page.getByText('Minimum Bet is 0.01')).toBeVisible()
  await expect(play(page)).toBeDisabled()
})
