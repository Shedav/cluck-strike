import { defineConfig, devices } from '@playwright/test'

// BASE_URL points the smoke tests at a deployed build (e.g. Vercel) instead of a local preview.
const baseURL = process.env.BASE_URL ?? 'http://localhost:4173'

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Animations run in real time and two device profiles share the CPU.
  timeout: 60_000,
  use: { baseURL },
  projects: [
    {
      name: 'chromium',
      // Playwright's bundled Chromium doesn't install on macOS 13, so local runs use installed Chrome.
      use: { ...devices['Desktop Chrome'], channel: process.env.CI ? undefined : 'chrome' },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 360, height: 780 },
        channel: process.env.CI ? undefined : 'chrome',
      },
    },
  ],
  // Smoke tests run against the production build, not the dev server.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'pnpm build && pnpm preview --port 4173 --strictPort',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
      },
})
