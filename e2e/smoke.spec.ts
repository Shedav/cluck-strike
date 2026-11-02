import { expect, test } from '@playwright/test'

test('opens the game shell', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Cluck Strike')
  await expect(page.getByRole('heading', { name: 'Cluck Strike' })).toBeVisible()
})
