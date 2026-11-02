import type { Frame } from '@/shared/lib'

// The Lane fire, the smoke grenade and the Smoke cloud it bursts into.

const FLAME: Frame = [
  '................',
  '.......r........',
  '......rr........',
  '......ror.......',
  '.....rroor...r..',
  '..r..royor..rr..',
  '..rr.royyor.ror.',
  '.ror.royyorrror.',
  '.roorroyyyoroor.',
  '.royoooyyyooyor.',
  'rroyyoyyyyyyyorr',
  'royyyyyyyyyyyyor',
  'royyyyyyyyyyyyor',
  'rooyyyyyyyyyyoor',
  '.rrooyyyyyyoorr.',
  '...rrrrrrrrrr...',
]

const mirror = (frame: Frame): Frame => frame.map((row) => [...row].reverse().join(''))

/** The tongues licking a pixel higher. */
const TALL: Frame = [...FLAME.slice(1, 10), ...FLAME.slice(9)]

/** 16x16, looping. */
export const FIRE: readonly Frame[] = [FLAME, mirror(TALL), mirror(FLAME), TALL]

/** 8x10, spun by the throw. */
export const GRENADE: readonly Frame[] = [
  [
    '...kkk..',
    '..kmmmkk',
    '..kmmmkm',
    '.kkkkkkk',
    '.kssssk.',
    '.kvvvvk.',
    '.kvvvvk.',
    '.kvvvvk.',
    '.kssssk.',
    '..kkkk..',
  ],
]

type Puff = [cx: number, cy: number, r: number]

/** A 24x24 cloud of round puffs: outlined, lit from the top left, shaded underneath. */
function cloud(...puffs: Puff[]): Frame {
  const inside = (x: number, y: number) =>
    puffs.find(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r)
  return Array.from({ length: 24 }, (_, y) =>
    Array.from({ length: 24 }, (_, x) => {
      const puff = inside(x, y)
      if (!puff)
        return [inside(x - 1, y), inside(x + 1, y), inside(x, y - 1), inside(x, y + 1)].some(
          Boolean,
        )
          ? 'k'
          : '.'
      const [cx, cy, r] = puff
      if (x - cx + (y - cy) < -r * 0.6) return 'w'
      return y - cy > r * 0.5 ? 'm' : 's'
    }).join(''),
  )
}

/** Bursts out, billows and breaks up into wisps. */
export const SMOKE: readonly Frame[] = [
  cloud([12, 19, 2]),
  cloud([12, 17, 4], [8, 19, 2], [16, 19, 2]),
  cloud([12, 14, 5], [7, 17, 4], [17, 17, 4], [12, 19, 3]),
  cloud([12, 11, 6], [6, 15, 5], [18, 15, 5], [12, 18, 4]),
  cloud([11, 9, 6], [5, 14, 4], [19, 13, 5], [12, 17, 3]),
  cloud([8, 8, 3], [17, 7, 4], [12, 14, 3], [4, 15, 2], [20, 15, 2]),
  cloud([7, 6, 2], [18, 5, 2], [12, 12, 2]),
]
