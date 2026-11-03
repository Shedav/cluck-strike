import { expect, test, type Page } from '@playwright/test'
import { rigSeeds } from './rig'

async function placeBet(page: Page, amount: string) {
  await page.goto('/')
  await page.getByLabel('Bet Amount').fill(amount)
}

test('Play → GO → Cash Out increases the Balance', async ({ page }) => {
  await rigSeeds(page, ([lane]) => lane === null || lane > 2)
  await placeBet(page, '10')
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  await page.getByRole('button', { name: 'GO' }).click()
  await page.getByRole('button', { name: /Cash Out 10\.70/ }).click()

  const popup = page.getByTestId('win-popup')
  await expect(popup).toContainText('1.07x')
  await expect(popup).toContainText('10.70')
  await expect(page.getByTestId('balance')).toHaveText('1,000.70')
  await expect(popup).toBeHidden({ timeout: 4000 })
})

test('a Hit on the first Step loses the Bet', async ({ page }) => {
  await rigSeeds(page, ([lane]) => lane === 1)
  await placeBet(page, '10')
  await page.getByRole('button', { name: 'Play', exact: true }).click()

  await expect(page.getByRole('status')).toHaveText('Hit on Lane 1. Bet lost.')
  await expect(page.getByTestId('balance')).toHaveText('990.00')
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeEnabled()
})

test('a full Easy run crosses all 24 Lanes before the Finish', async ({ page }) => {
  await rigSeeds(page, ([lane]) => lane === null)
  await placeBet(page, '10')
  const chickenOn = (lane: number) => page.locator(`[data-lane="${lane}"] img[alt="Chicken"]`)

  await page.getByRole('button', { name: 'Play', exact: true }).click()
  await expect(chickenOn(1)).toBeVisible()
  for (let lane = 2; lane <= 24; lane++) {
    await page.getByRole('button', { name: 'GO' }).click()
    await expect(chickenOn(lane)).toBeVisible()
  }

  // The chicken stands on the last Lane, then the Finish is celebrated and it returns to the start.
  const popup = page.getByTestId('win-popup')
  await expect(popup).toContainText('Finish!')
  await expect(popup).toContainText('19.44x')
  await expect(popup).toContainText('194.40')
  await expect(page.getByTestId('balance')).toHaveText('1,184.40')
  await expect(chickenOn(0)).toBeVisible()
})

test('Space plays and steps, Enter cashes out', async ({ page, isMobile }) => {
  test.skip(isMobile, 'no hardware keyboard on phones')
  await rigSeeds(page, ([lane]) => lane === null || lane > 2)
  await placeBet(page, '10')
  await page.locator('body').click({ position: { x: 5, y: 5 } }) // leave the Bet input

  await page.keyboard.press('Space')
  await expect(page.getByRole('status')).toHaveText('Lane 1 crossed. Multiplier 1.03x.')
  await expect(page.getByRole('button', { name: 'GO' })).toBeEnabled()
  await page.keyboard.press('Space')
  await expect(page.getByRole('status')).toHaveText('Lane 2 crossed. Multiplier 1.07x.')
  await expect(page.getByRole('button', { name: /Cash Out/ })).toBeEnabled()
  await page.keyboard.press('Enter')

  await expect(page.getByRole('status')).toHaveText('Cashed out 10.70.')
  await expect(page.getByTestId('balance')).toHaveText('1,000.70')
})

test('the page fits a phone screen without sideways scrolling', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone layout only')
  await page.goto('/')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360)
  await expect(page.getByRole('combobox', { name: 'Difficulty' })).toBeVisible()
})

test('a reload mid-Round shows the chicken on its Lane without replaying the Step', async ({
  page,
}) => {
  await rigSeeds(page, ([lane]) => lane === null || lane > 2)
  await placeBet(page, '10')
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  await expect(page.getByRole('button', { name: 'GO' })).toBeEnabled()

  await page.reload()
  await expect(page.locator('[data-lane="1"] img[alt="Chicken"]')).toBeVisible()
  await expect(page.locator('[class*="grenade"], [class*="smoke"]')).toHaveCount(0)
})
