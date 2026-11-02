import { motion, MotionConfig } from 'motion/react'
import { Fragment, useEffect, useRef, useState } from 'react'
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
  const current = useRef<HTMLDivElement>(null)
  // The burn plays after the throw and the hop, so the Hit result stays up a bit longer.
  const burnt = useAfterDelay(round.phase === 'hit', round.nonce, STEP_MS + RESULT_MS)
  // After a win the chicken goes back to the start (the popup tells the result); after a Hit the
  // fire stays on the Lane for a moment first.
  const lane = isWin(round.phase) || burnt ? 0 : round.lane
  const hitNow = round.phase === 'hit' && !burnt

  useEffect(() => {
    current.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [lane])

  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.scene}>
        <motion.div
          layoutScroll
          className={styles.road}
          animate={hitNow ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
          transition={{ duration: 0.4, delay: STEP_MS / 1000 }}
        >
          <div className={styles.start} ref={lane === 0 ? current : undefined}>
            {lane === 0 && <Chicken burning={false} hopKey={`start-${round.nonce}`} />}
          </div>
          {MULTIPLIERS[round.difficulty].map((multiplier, i) => {
            const n = i + 1
            const state = n === lane && hitNow ? 'hit' : n <= lane ? 'passed' : 'ahead'
            return (
              <div
                key={n}
                className={`${styles.lane} ${styles[state]} ${capLane && n > capLane ? styles.beyondMaxWin : ''}`}
                ref={n === lane ? current : undefined}
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
                  {n === lane && (
                    <Chicken burning={state === 'hit'} hopKey={`${round.nonce}-${n}`} />
                  )}
                </div>
              </div>
            )
          })}
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

/**
 * The chicken waits for its grenade to land, then hops into the new spot; `layoutId` slides it
 * across from the previous one. A burning chicken fades out as the roasted one appears.
 */
function Chicken({ burning, hopKey }: { burning: boolean; hopKey: string }) {
  const hop = { delay: THROW_MS / 1000, duration: HOP_MS / 1000, ease: 'easeOut' } as const
  return (
    <motion.img
      key={hopKey}
      layoutId="chicken"
      className={styles.chicken}
      src={SPRITES.chicken}
      alt="Chicken"
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: [0, -44, 0], opacity: burning ? 0 : 1 }}
      transition={{
        y: hop,
        layout: hop,
        opacity: { delay: STEP_MS / 1000 + 0.35, duration: 0.2 },
      }}
    />
  )
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
