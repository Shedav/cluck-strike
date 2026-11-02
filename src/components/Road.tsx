import { motion, MotionConfig, useAnimate, useReducedMotion } from 'motion/react'
import { Fragment, useEffect, useRef, useState, type RefObject } from 'react'
import { formatCoins, formatMultiplier } from '../format'
import { maxWinLane, MULTIPLIERS } from '../game/odds'
import { isWin } from '../game/round'
import { useGame } from '../game/store'
import { Coin } from './Coin'
import styles from './Road.module.css'
import { HOP_MS, LANE_PX, RESULT_MS, SPRITES, STEP_MS, THROW_MS } from './timing'

export function Road() {
  const round = useGame((s) => s.round)
  // Before a Round the dimming follows the Bet being typed; during and after, the Round's own Bet.
  const betCents = useGame((s) => (s.round.phase === 'idle' ? s.betCents : s.round.betCents))
  const capLane = maxWinLane(betCents, round.difficulty)
  // Index 0 is the start column, 1..n the Lanes; the chicken layer aims at their centres.
  const cells = useRef<(HTMLDivElement | null)[]>([])
  // The burn plays after the throw and the hop, so the Hit result stays up a bit longer.
  const burnt = useAfterDelay(round.phase === 'hit', round.nonce, STEP_MS + RESULT_MS)
  // After a win the chicken goes back to the start (the popup tells the result); after a Hit the
  // fire stays on the Lane for a moment first.
  const lane = isWin(round.phase) || burnt ? 0 : round.lane
  const hitNow = round.phase === 'hit' && !burnt

  useEffect(() => {
    cells.current[lane]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [lane])

  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.scene}>
        <motion.div
          className={styles.road}
          animate={hitNow ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
          transition={{ duration: 0.4, delay: STEP_MS / 1000 }}
        >
          <div className={styles.start} ref={(el) => void (cells.current[0] = el)} />
          {MULTIPLIERS[round.difficulty].map((multiplier, i) => {
            const n = i + 1
            const state = n === lane && hitNow ? 'hit' : n <= lane ? 'passed' : 'ahead'
            return (
              <div
                key={n}
                className={`${styles.lane} ${styles[state]} ${capLane && n > capLane ? styles.beyondMaxWin : ''}`}
                ref={(el) => void (cells.current[n] = el)}
              >
                <Badge multiplier={multiplier} />
                <div className={styles.ground}>
                  {state === 'ahead' && <img className={styles.fire} src={SPRITES.fire} alt="" />}
                  {n === lane && round.phase === 'playing' && (
                    <Fragment key={`step-${round.nonce}-${n}`}>
                      <DousedFire />
                      <Grenade miss={false} />
                      <SmokePuff />
                    </Fragment>
                  )}
                  {state === 'hit' && (
                    <>
                      <Grenade miss />
                      <FlareUp />
                      <RoastedChicken />
                    </>
                  )}
                </div>
              </div>
            )
          })}
          <Chicken cells={cells} lane={lane} burning={hitNow} />
          <div className={styles.finish}>
            <motion.img
              className={styles.case}
              src={SPRITES.goldenCase}
              alt="Golden case"
              animate={
                round.phase === 'finished' ? { scale: [1, 1.3, 1.15], rotate: [0, -8, 8, 0] } : {}
              }
              transition={{ duration: 0.6 }}
            />
          </div>
        </motion.div>
        <WinPopup />
      </div>
    </MotionConfig>
  )
}

const CHICKEN_PX = 84

/**
 * The chicken lives in its own layer over the road and moves by `x` to the centre of its cell:
 * after its grenade lands it hops one Lane on; when a Round ends it flies back to the start.
 * A burning chicken fades out as the roasted one appears in the Lane.
 */
function Chicken({
  cells,
  lane,
  burning,
}: {
  cells: RefObject<(HTMLDivElement | null)[]>
  lane: number
  burning: boolean
}) {
  const [scope, animate] = useAnimate<HTMLImageElement>()
  const reduced = useReducedMotion()
  const shownLane = useRef<number | null>(null)

  useEffect(() => {
    const cell = cells.current[lane]
    if (!cell || !scope.current) return
    const x = cell.offsetLeft + cell.offsetWidth / 2 - CHICKEN_PX / 2
    const from = shownLane.current
    shownLane.current = lane
    if (from === null || reduced) {
      void animate(scope.current, { x, y: 0 }, { duration: 0 })
    } else if (lane > from) {
      const hop = { delay: THROW_MS / 1000, duration: HOP_MS / 1000, ease: 'easeOut' } as const
      void animate(scope.current, { x }, hop)
      void animate(scope.current, { y: [0, -44, 0] }, hop)
    } else if (lane < from) {
      // Back to the start: one long arc, a bit longer the further it has to fly.
      const fly = { duration: 0.5 + 0.05 * (from - lane), ease: 'easeInOut' } as const
      void animate(scope.current, { x }, fly)
      void animate(scope.current, { y: [0, -90, 0] }, fly)
    }
  }, [lane, cells, scope, animate, reduced])

  // Cell widths change with the viewport; snap back to the cell centre without animating.
  useEffect(() => {
    const onResize = () => {
      const cell = cells.current[shownLane.current ?? 0]
      if (cell && scope.current) {
        void animate(
          scope.current,
          { x: cell.offsetLeft + cell.offsetWidth / 2 - CHICKEN_PX / 2 },
          { duration: 0 },
        )
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [cells, scope, animate])

  useEffect(() => {
    if (!scope.current) return
    void animate(
      scope.current,
      { opacity: burning ? 0 : 1 },
      burning ? { delay: STEP_MS / 1000 + 0.35, duration: 0.2 } : { duration: 0.2 },
    )
  }, [burning, scope, animate])

  return <img ref={scope} className={styles.chickenLayer} src={SPRITES.chicken} alt="Chicken" />
}

function RoastedChicken() {
  return (
    <motion.img
      className={styles.chicken}
      src={SPRITES.chickenRoasted}
      alt="Roasted chicken"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: STEP_MS / 1000 + 0.35, duration: 0.2 }}
    />
  )
}

/** The smoke grenade arcs from the chicken's Lane: onto this Lane's fire, or past it on a Hit. */
function Grenade({ miss }: { miss: boolean }) {
  return (
    <motion.img
      className={styles.grenade}
      src={SPRITES.smokeGrenade}
      alt=""
      initial={{ x: -LANE_PX, y: -40, rotate: 0, opacity: 1 }}
      animate={{
        x: [-LANE_PX, miss ? LANE_PX * 0.2 : -LANE_PX / 2, miss ? LANE_PX * 1.1 : 0],
        y: [-40, -150, miss ? -20 : 0],
        rotate: [0, 270, 540],
        opacity: [1, 1, 0],
      }}
      transition={{ duration: THROW_MS / 1000, ease: 'easeIn', times: [0, 0.5, 1] }}
    />
  )
}

/** A safe Step: the Lane's fire dies as the grenade lands... */
function DousedFire() {
  return (
    <motion.img
      className={styles.fire}
      src={SPRITES.fire}
      alt=""
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 0, scale: 0.4 }}
      transition={{ delay: THROW_MS / 1000, duration: 0.25 }}
    />
  )
}

/** ...and a Smoke cloud bursts out and drifts away. */
function SmokePuff() {
  return (
    <motion.img
      className={styles.smoke}
      src={SPRITES.smoke}
      alt=""
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1.4, 1.6, 1.9], y: [0, -10, -20, -40] }}
      transition={{ duration: 1.2, times: [0, 0.2, 0.6, 1], delay: THROW_MS / 1000 }}
    />
  )
}

/** A Hit: once the chicken lands, the fire flares up over it, then dies down to show it roasted. */
function FlareUp() {
  return (
    <motion.img
      className={styles.flare}
      src={SPRITES.fire}
      alt=""
      initial={{ scale: 0.6, opacity: 1 }}
      animate={{ scale: [0.6, 1.8, 1.5, 1], opacity: [1, 1, 1, 0] }}
      transition={{ duration: 1.4, times: [0, 0.25, 0.7, 1], delay: STEP_MS / 1000 }}
    />
  )
}

function Badge({ multiplier }: { multiplier: number }) {
  const text = formatMultiplier(multiplier)
  const full = `${multiplier.toLocaleString('en-US', { minimumFractionDigits: 2 })}x`
  if (text === full) return <span className={styles.badge}>{text}</span>
  // Compact badges reveal the exact Multiplier on hover and keyboard focus.
  return (
    <span className={styles.badge} tabIndex={0} aria-label={full} data-full={full}>
      {text}
    </span>
  )
}

/** True once `active` has held for `ms` within the Round identified by `nonce`. */
function useAfterDelay(active: boolean, nonce: number | null, ms = RESULT_MS) {
  const [doneFor, setDoneFor] = useState<number | null>(null)
  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => setDoneFor(nonce), ms)
    return () => clearTimeout(timer)
  }, [active, nonce, ms])
  return active && doneFor === nonce
}

/** Shows the Multiplier and payout of a won Round for a moment, then hides. */
function WinPopup() {
  const round = useGame((s) => s.round)
  const hidden = useAfterDelay(isWin(round.phase), round.nonce)

  if (!isWin(round.phase) || hidden) return null
  const title = { cashedOut: 'You win!', finished: 'Finish!', maxWin: 'Max Win!' }[round.phase]
  return (
    <div className={styles.popup} role="status" data-testid="win-popup">
      <span className={styles.popupTitle}>{title}</span>
      <span className={styles.popupMultiplier}>
        {formatMultiplier(round.payoutCents / round.betCents)}
      </span>
      <span className={styles.popupAmount}>
        <Coin size={20} /> {formatCoins(round.payoutCents)}
      </span>
    </div>
  )
}
