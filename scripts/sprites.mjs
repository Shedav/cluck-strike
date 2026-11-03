// Renders every pixel sprite's frames at 8x into one PNG, to show frames for approval.
// Usage: node scripts/sprites.mjs <out.png>
import { chromium } from '@playwright/test'
import { createServer } from 'vite'

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})
const load = (path) => vite.ssrLoadModule(path)
const { spriteSheet } = await load('/src/shared/lib/pixel.ts')
const { CHICKEN } = await load('/src/widgets/road/pixel/chicken.ts')
const { BURN } = await load('/src/widgets/road/pixel/burn.ts')
const { GOLDEN_CASE } = await load('/src/widgets/road/pixel/case.ts')
const { FIRE, SMOKE, GRENADE } = await load('/src/widgets/road/pixel/props.ts')
await vite.close()

const sprites = {
  ...CHICKEN,
  burn: BURN,
  case: GOLDEN_CASE.open,
  fire: FIRE,
  smoke: SMOKE,
  grenade: GRENADE,
}
const rows = Object.entries(sprites).map(
  ([name, frames]) =>
    `<p>${name} (${frames.length})</p><img src="${spriteSheet(frames)}" style="height:${frames[0].length * 8}px">`,
)
const browser = await chromium.launch({ channel: process.env.CI ? undefined : 'chrome' })
const page = await browser.newPage({ viewport: { width: 1000, height: 600 } })
await page.setContent(
  `<body style="background:#14161d;color:#ccc;font:16px sans-serif">${rows.join('')}</body>`,
)
await page.screenshot({ path: process.argv[2] ?? 'sprites.png', fullPage: true })
await browser.close()
