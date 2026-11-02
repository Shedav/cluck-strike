import { overlay, type Frame } from '@/shared/lib'

// The golden case in the Finish column: it shakes, the lid flies off, a golden glow and coins burst out.

const EMPTY = '.'.repeat(24)
const blank = (rows: number): string[] => Array<string>(rows).fill(EMPTY)

/** Handle and lid: rows 7-13 of the closed case. */
const LID: Frame = [
  '.........kkkkkk.........',
  '.........k....k.........',
  '..kkkkkkkkkkkkkkkkkkkk..',
  '..kyyyyooooooooooooook..',
  '..kooooooooooooooooouk..',
  '..kooooooooooooooooouk..',
  '..kkkkkkkkkyykkkkkkkkk..',
]

/** Body: rows 14-21. */
const BODY: Frame = [
  '..koooooookyykoooooouk..',
  '..koooooookkkkoooooouk..',
  '..kooooooooooooooooouk..',
  '..kooooooooooooooooouk..',
  '..kooooooooooooooooouk..',
  '..kooooooooooooooooouk..',
  '..kuuuuuuuuuuuuuuuuuuk..',
  '..kkkkkkkkkkkkkkkkkkkk..',
]

const CLOSED: Frame = [...blank(7), ...LID, ...BODY, ...blank(2)]

const shift = (frame: Frame, dx: number): Frame =>
  frame.map((row) =>
    dx < 0 ? row.slice(-dx) + '.'.repeat(-dx) : '.'.repeat(dx) + row.slice(0, -dx),
  )

/** The lid `up` rows above its place, over the open body. */
const lifted = (up: number): Frame => [...blank(7 - up), ...LID, ...blank(up), ...BODY, ...blank(2)]

/** The open case with its golden light pouring up. */
const OPEN: Frame = [
  ...blank(10),
  '........y...y..y........',
  '...y.....y..y.y.....y...',
  '.....yyyyyywwwwyyyyyy...',
  '..kyyyyyywwwwwwwyyyyyk..',
  ...BODY,
  ...blank(2),
]

const RAYS: Frame = [
  ...blank(2),
  '....w.......w......w....',
  '.....y......y.....y.....',
  '......y.....y....y......',
  '...w...y....y...y...w...',
  '....y...y...y..y...y....',
  '.....y...y..y.y...y.....',
  '......yy..yyyy..yy......',
  '........yyyyyyyy........',
  ...blank(14),
]

/** Coins (2x2) at [x, y] positions. */
const coins = (...at: [number, number][]): Frame =>
  blank(24).map((row, y) =>
    [...row]
      .map((pixel, x) => {
        const coin = at.find(([cx, cy]) => x - cx >= 0 && x - cx < 2 && y - cy >= 0 && y - cy < 2)
        return coin ? (y === coin[1] ? 'y' : 'o') : pixel
      })
      .join(''),
  )

export const GOLDEN_CASE = {
  closed: [CLOSED],
  open: [
    shift(CLOSED, -1),
    shift(CLOSED, 1),
    shift(CLOSED, -1),
    shift(CLOSED, 1),
    overlay(OPEN, lifted(1)),
    overlay(overlay(OPEN, RAYS), lifted(4)),
    overlay(overlay(overlay(OPEN, RAYS), lifted(7)), coins([7, 9], [14, 8])),
    overlay(overlay(OPEN, RAYS), coins([5, 5], [11, 3], [16, 6], [19, 9])),
    overlay(overlay(OPEN, RAYS), coins([3, 2], [10, 0], [17, 2], [20, 7], [8, 8])),
    overlay(OPEN, coins([2, 6], [20, 4], [14, 9])),
    OPEN,
  ],
} as const
