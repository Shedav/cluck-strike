import { overlay, type Frame } from '@/shared/lib'
import { AIRBORNE, RELEASE, STAND } from './chicken'

// A Hit: the chicken catches fire, flails, chars, burns down to a skeleton and the bones fall apart.

const FIRE: Frame = [
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '............r...........',
  '...........rr......r....',
  '..r........ror....rr....',
  '..rr......rroor...ror...',
  '.rorr.....royor..rroor..',
  '.roor..r..royyor.royor..',
  '.royor.rr.rryyorrroyor..',
  'rroyorrorrooyyoorooyorr.',
  'royyyoroyoroyyyooroyyorr',
  'royyoooyyoooyyyooyyyooor',
  'rooyyoooyyyoyyyyoyyyooor',
  'rooyyyooyyyyyyyyyyyyooor',
  'roooyyyyyyyyyyyyyyyyooor',
  'rrooyyyyyyyyyyyyyyyyoorr',
  '.rrooyyyyyyyyyyyyyyoorr.',
  '.rrrooooyyyyyyyyoooorrr.',
  '..rrrrooooooooooorrrrr..',
  '...rrrrrrrrrrrrrrrrrr...',
  '........................',
]

/** The same flames mirrored, so alternating the two makes them flicker. */
const FIRE_FLIP: Frame = FIRE.map((row) => [...row].reverse().join(''))

/** Only the lower flames: catching fire, and dying down around the skeleton. */
const FIRE_LOW: Frame = [
  ...Array<string>(13).fill('........................'),
  ...FIRE.slice(7, 13),
  ...FIRE.slice(19),
]

const EMBERS: Frame = [
  ...Array<string>(19).fill('........................'),
  '.....o..........y.......',
  '........y...o.......o...',
  '...o..yo....oy...yo.....',
  '....ryyor..royr.roor....',
  '........................',
]

/** Standing with the wings up. */
const FLAIL: Frame = [...AIRBORNE.slice(0, 19), ...STAND.slice(19)]

/** Feathers burnt black, comb and beak too. */
const char = (frame: Frame): Frame =>
  frame.map((row) => row.replace(/[wg]/g, (p) => (p === 'w' ? 'h' : 'c')).replace(/[rod]/g, 'c'))

const SKELETON: Frame = [
  '........................',
  '........................',
  '........................',
  '........................',
  '.............kkkkkk.....',
  '............kbbbbbbk....',
  '............kbbbkkbk....',
  '............kbbbkkbbkkk.',
  '............kbbbbbbbbbk.',
  '.............kbbbbkkkk..',
  '..............kbbk......',
  '.kk...........kbbk......',
  '.kbkkkkkkkkkkkkbbk......',
  '..kbbbbbbbbbbbbbbk......',
  '...kkbkbkbkbkbkbk.......',
  '....kbkbkbkbkbkbk.......',
  '.....kkbkbkbkbkk........',
  '.......kkkkkkkk.........',
  '.........kbk.kbk........',
  '.........kbk.kbk........',
  '.........kbk.kbk........',
  '........kbbk.kbbk.......',
  '........kkkk.kkkk.......',
  '........................',
]

/** The skull drops and the ribcage tips over. */
const FALLING: Frame = [
  ...Array<string>(9).fill('........................'),
  '..............kkkkkk....',
  '.............kbbbbbbk...',
  '.............kbbbkkbk...',
  '.............kbbbkkbbkkk',
  '.kk..........kbbbbbbbbbk',
  '.kbkkkkkkkkkkkkbbbbkkkk.',
  '..kbbbbbbbbbbbbbbkk.....',
  '...kkbkbkbkbkbkbk.......',
  '....kbkbkbkbkbkbk.......',
  '.....kkbkbkbkbkk........',
  '.......kkkkkkkk.........',
  '........kbbk..kbbk......',
  '.......kbbk....kbbk.....',
  '.......kkk......kkk.....',
  '........................',
]

const PILE: Frame = [
  ...Array<string>(15).fill('........................'),
  '..............kkkkkk....',
  '.............kbbbbbbk...',
  '.............kbbbkkbkkk.',
  '...kkkkkk.kk.kbbbkkbbbk.',
  '..kbkbkbkkbbkkbbbbbbbkk.',
  '.kbbbbbbbbbbbbkkkkkkk...',
  '.kkbkbkbkkkbbbbbbkbbk...',
  '..kkkkkkk..kkkkkkkkkk...',
  '........................',
]

export const BURN: readonly Frame[] = [
  overlay(STAND, FIRE_LOW),
  overlay(FLAIL, FIRE),
  overlay(RELEASE, FIRE_FLIP),
  overlay(FLAIL, FIRE),
  overlay(char(FLAIL), FIRE_FLIP),
  overlay(char(STAND), FIRE),
  overlay(SKELETON, FIRE_FLIP),
  overlay(SKELETON, FIRE_LOW),
  overlay(SKELETON, EMBERS),
  FALLING,
  PILE,
]
