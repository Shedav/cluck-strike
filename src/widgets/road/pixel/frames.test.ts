import { describe, expect, test } from 'vitest'
import { spriteSheet, type Frame } from '@/shared/lib'
import { BURN } from './burn'
import { GOLDEN_CASE } from './case'
import { CHICKEN } from './chicken'
import { FIRE, GRENADE, SMOKE } from './props'

const SPRITES: Record<string, { frames: readonly Frame[]; size: [number, number] }> = {
  ...Object.fromEntries(
    Object.entries(CHICKEN).map(([pose, frames]) => [
      `chicken ${pose}`,
      { frames, size: [24, 24] },
    ]),
  ),
  burn: { frames: BURN, size: [24, 24] },
  'case closed': { frames: GOLDEN_CASE.closed, size: [24, 24] },
  'case open': { frames: GOLDEN_CASE.open, size: [24, 24] },
  fire: { frames: FIRE, size: [16, 16] },
  smoke: { frames: SMOKE, size: [24, 24] },
  grenade: { frames: GRENADE, size: [8, 10] },
}

describe('every sprite builds into a sheet of the size the scene scales it for', () => {
  test.each(Object.entries(SPRITES))('%s', (_, { frames, size: [width, height] }) => {
    expect(() => spriteSheet(frames)).not.toThrow()
    expect(frames[0][0]).toHaveLength(width)
    expect(frames[0]).toHaveLength(height)
  })
})
