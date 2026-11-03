import { expect, test, type Page } from '@playwright/test'
import { rigSeeds } from './rig'

// Layout bugs that first showed up on a real phone: each check pins one of them.
test.beforeEach(({ isMobile }) => test.skip(!isMobile, 'phone layout only'))

const play = (page: Page) => page.getByRole('button', { name: 'Play', exact: true })

test('Play sits right under the scene, above the Bet settings', async ({ page }) => {
  await page.goto('/')
  const playBox = await play(page).boundingBox()
  const betBox = await page.getByLabel('Bet Amount').boundingBox()
  expect(playBox!.y).toBeLessThan(betBox!.y)
  expect(playBox!.y + playBox!.height).toBeLessThanOrEqual(780) // visible without scrolling
})

test('Cash Out keeps its amount on one line, even a long one', async ({ page }) => {
  await rigSeeds(page, ([lane]) => lane === null || lane > 2)
  await page.goto('/')
  await page.getByLabel('Bet Amount').fill('150')
  await play(page).click()
  await page.getByRole('button', { name: 'GO' }).click()
  const cashOut = page.getByRole('button', { name: /Cash Out/ })
  await expect(cashOut).toContainText('160.50')
  expect((await cashOut.boundingBox())!.height).toBeLessThanOrEqual(48)
})

test('the win popup is drawn above the chicken', async ({ page }) => {
  await rigSeeds(page, ([lane]) => lane === null || lane > 1)
  await page.goto('/')
  await play(page).click()
  await page.getByRole('button', { name: /Cash Out/ }).click()
  const popup = page.getByTestId('win-popup')
  await expect(popup).toBeVisible()
  // The scene scrolls back to the start as the chicken returns there; let it settle under the popup.
  await expect(page.locator('[data-lane="0"] img[alt="Chicken"]')).toBeInViewport({ ratio: 1 })
  await page.waitForTimeout(400)
  const box = (await popup.boundingBox())!
  // The chicken stands under the popup's lower-left part on a 360px screen.
  const points = [
    { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    { x: box.x + 12, y: box.y + box.height - 8 },
  ]
  const onTop = await page.evaluate(
    (points) =>
      points.every(
        ({ x, y }) =>
          document.elementFromPoint(x, y)?.closest('[data-testid="win-popup"]') !== null,
      ),
    points,
  )
  expect(onTop).toBe(true)
})

test('the Fairness modal fits the screen, long code included', async ({ page }) => {
  await rigSeeds(page, ([lane]) => lane === 1)
  await page.goto('/')
  await play(page).click()
  await expect(page.getByRole('status')).toHaveText('Hit on Lane 1. Bet lost.')
  await page.getByRole('button', { name: 'Fairness' }).click()
  const dialog = page.locator('dialog[open]')
  await expect(dialog.getByText('Code for the browser console')).toBeVisible()
  const overflow = await dialog.evaluate((d) => d.scrollWidth - d.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})
