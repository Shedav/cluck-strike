import type { Frame } from '@/shared/lib'

// 24x24, facing right. Rows 15-23 (lower body and legs) are shared by most frames.

const LOWER: Frame = [
  '...kwwwwwwwwwwwwwwwk....',
  '....kwwwwwwwwwwwwwk.....',
  '.....kkwwwwwwwwwkk......',
  '.......kkkkkkkkk........',
  '.........o...o..........',
  '.........o...o..........',
  '........ooo.ooo.........',
  '........................',
  '........................',
]

export const STAND: Frame = [
  '........................',
  '..............kkkkk.....',
  '.............krrrrrk....',
  '............kwwwwwwwk...',
  '............kwwwwwwwk...',
  '..k.........kwwwwwkwk...',
  '.kwk........kwwwwwwwoook',
  '.kwwk.......kwwwwwwwddk.',
  '.kwwwk......kwwwwwwrrk..',
  '.kwwwwkkkkkkkwwwwwwrrk..',
  '.kwwwwwwwwwwwwwwwwwkk...',
  '.kwwwwwwgggggwwwwwwwk...',
  '..kwwwggggggggwwwwwwk...',
  '..kwwwkgggggggwwwwwwk...',
  '..kwwwwkkkggggwwwwwk....',
  ...LOWER,
]

/** The body drops a pixel and the knees bend: idle bob, hop crouch and landing. */
const CROUCH: Frame = ['........................', ...STAND.slice(0, 19), ...STAND.slice(20)]

/** Wing raised behind the head with the grenade in it. */
export const WIND_UP: Frame = [
  '...kkkk.................',
  '...kmmk.......kkkkk.....',
  '..kssssk.....krrrrrk....',
  '..kvvvvk....kwwwwwwwk...',
  '..kssssk....kwwwwwwwk...',
  '..kkggkk....kwwwwwkwk...',
  '.kwkgggk....kwwwwwwwoook',
  '.kwkggggk...kwwwwwwwddk.',
  '.kwwkgggwk..kwwwwwwrrk..',
  '.kwwwkgggwkkkwwwwwwrrk..',
  '.kwwwwkggwwwwwwwwwwkk...',
  '.kwwwwwwwwwwwwwwwwwwk...',
  '..kwwwwwwwwwwwwwwwwwk...',
  '..kwwwwwwwwwwwwwwwwwk...',
  '..kwwwwwwwwwwwwwwwwk....',
  ...LOWER,
]

/** Wing flung forward: the grenade has just left it. */
export const RELEASE: Frame = [
  ...STAND.slice(0, 10),
  '.kwwwwwwwwwwwwwwwwwkk...',
  '.kwwwwwwwwwwwwggggggkk..',
  '..kwwwwwwwwwwggggggggk..',
  '..kwwwwwwwwwwwkkkkkkk...',
  '..kwwwwwwwwwwwwwwwwk....',
  ...LOWER,
]

/** In the air: wings up, legs tucked. */
export const AIRBORNE: Frame = [
  // The raised wing without the grenade.
  ...WIND_UP.slice(0, 5).map((row) => '.'.repeat(8) + row.slice(8)),
  ...WIND_UP.slice(5, 19),
  '.........oo..oo.........',
  '........................',
  '........................',
  '........................',
  '........................',
]

export const CHICKEN = {
  idle: [STAND, CROUCH],
  throw: [WIND_UP, RELEASE, STAND],
  hop: [CROUCH, AIRBORNE, AIRBORNE, CROUCH],
} as const
