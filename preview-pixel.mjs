import { chromium } from '@playwright/test'
import { createServer } from 'vite'
const server = await createServer({ server: { port: 5199 }, logLevel: 'error' })
await server.listen()
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1000, height: 600 } })
await page.goto('http://localhost:5199/')
const html = await page.evaluate(async () => {
  const { spriteSheet } = await import('/src/shared/lib/pixel.ts')
  const { CHICKEN } = await import('/src/widgets/road/pixel/chicken.ts')
  const { BURN } = await import('/src/widgets/road/pixel/burn.ts')
  const { GOLDEN_CASE } = await import('/src/widgets/road/pixel/case.ts')
  const { FIRE, SMOKE, GRENADE } = await import('/src/widgets/road/pixel/props.ts')
  return Object.entries({
    ...CHICKEN,
    burn: BURN,
    case: GOLDEN_CASE.open,
    fire: FIRE,
    smoke: SMOKE,
    grenade: GRENADE,
  })
    .map(
      ([name, frames]) =>
        `<div><p>${name} (${frames.length})</p><img src="${spriteSheet(frames)}" style="height:192px;background:#1a1d26"></div>`,
    )
    .join('')
})
await page.setContent(
  `<body style="background:#14161d;color:#ccc;font:16px sans-serif">${html}</body>`,
)
await page.screenshot({ path: process.argv[2], fullPage: true })
await browser.close()
await server.close()
