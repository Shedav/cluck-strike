// Screenshots the production build in headless Chrome after a few scripted actions, with the
// first Round's outcome pinned. Run `pnpm build` first.
//
// Usage: node scripts/shot.mjs <out.png> [--phone] [--hit <lane> | --no-hit] [step...]
// Steps run in order: click:<button name>  key:<key>  fill:<label>=<value>  wait:<ms>
// Example: node scripts/shot.mjs /tmp/win.png --phone --no-hit click:Play wait:1200 'click:Cash Out'
import { chromium, devices } from '@playwright/test'
import { createServer, preview } from 'vite'

const [out, ...args] = process.argv.slice(2)
const phone = args.includes('--phone')
const hitAt = args.includes('--no-hit')
  ? null
  : args.includes('--hit')
    ? Number(args[args.indexOf('--hit') + 1])
    : undefined
const steps = args.filter((a) => /^(click|key|fill|wait):/.test(a))

// Like e2e/rig.ts: one repeated byte as every seed, picked so the first Round has the wanted Hit Lane.
let byte
if (hitAt !== undefined) {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  })
  const { verifyRound } = await vite.ssrLoadModule('/src/shared/game-rules/fairness.ts')
  await vite.close()
  for (byte = 0; byte < 256; byte++) {
    const seed = byte.toString(16).padStart(2, '0').repeat(32)
    if ((await verifyRound(seed, seed, 0, 'easy')) === hitAt) break
  }
  if (byte === 256) throw new Error(`no seed gives a Hit on ${hitAt}`)
}

const server = await preview({ preview: { port: 5198 }, logLevel: 'error' })
const browser = await chromium.launch({ channel: process.env.CI ? undefined : 'chrome' })
const page = await browser.newPage(
  phone
    ? { ...devices['Pixel 7'], viewport: { width: 360, height: 780 } }
    : { viewport: { width: 1100, height: 800 } },
)
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
if (byte !== undefined) {
  await page.addInitScript((b) => {
    crypto.getRandomValues = (a) => (a instanceof Uint8Array && a.fill(b), a)
  }, byte)
}
await page.goto('http://localhost:5198/')
for (const step of steps) {
  const [kind, arg] = [step.slice(0, step.indexOf(':')), step.slice(step.indexOf(':') + 1)]
  if (kind === 'click') await page.getByRole('button', { name: arg, exact: true }).click()
  if (kind === 'key') await page.keyboard.press(arg)
  if (kind === 'fill')
    await page.getByLabel(arg.split('=')[0], { exact: true }).fill(arg.split('=')[1])
  if (kind === 'wait') await page.waitForTimeout(Number(arg))
}
await page.screenshot({ path: out })
console.log(`saved ${out}; console errors: ${errors.length}`)
await browser.close()
server.httpServer.close()
