import { motion, MotionConfig } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { formatCoins, formatMultiplier } from '../format'
import { maxWinLane, MULTIPLIERS } from '../game/odds'
import { isWin } from '../game/round'
import { useGame } from '../game/store'
import { Coin } from './Coin'
import styles from './Road.module.css'
import { RESULT_MS, SPRITES, STEP_MS } from './timing'

export function Road() {
  const round = useGame((s) => s.round)
  // Before a Round the dimming follows the Bet being typed; during and after, the Round's own Bet.
  const betCents = useGame((s) => (s.round.phase === 'idle' ? s.betCents : s.round.betCents))
  const capLane = maxWinLane(betCents, round.difficulty)
  const current = useRef<HTMLDivElement>(null)
  const burnt = useAfterDelay(round.phase === 'hit', round.nonce)
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
          transition={{ duration: 0.4, delay: STEP_MS / 2000 }}
        >
          <div className={styles.start} ref={lane === 0 ? current : undefined}>
            {lane === 0 && <Chicken roasted={false} hopKey={`start-${round.nonce}`} />}
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
                  {state === 'hit' && <FlareUp />}
                  {n === lane && state === 'passed' && round.phase === 'playing' && (
                    <SmokePuff key={`smoke-${round.nonce}-${n}`} />
                  )}
                  {n === lane && (
                    <Chicken roasted={state === 'hit'} hopKey={`${round.nonce}-${n}`} />
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

/** The chicken hops into each new spot; `layoutId` slides it across from the previous one. */
function Chicken({ roasted, hopKey }: { roasted: boolean; hopKey: string }) {
  return (
    <motion.img
      key={hopKey}
      layoutId="chicken"
      className={styles.chicken}
      src={roasted ? SPRITES.chickenRoasted : SPRITES.chicken}
      alt={roasted ? 'Roasted chicken' : 'Chicken'}
      initial={{ y: 0 }}
      animate={{ y: [0, -44, 0] }}
      transition={{
        duration: STEP_MS / 1000,
        ease: 'easeOut',
        layout: { duration: STEP_MS / 1000 },
      }}
    />
  )
}

/** A safe Step: a Smoke cloud lands on the fire and drifts away. */
function SmokePuff() {
  return (
    <motion.img
      className={styles.smoke}
      src={SPRITES.smoke}
      alt=""
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: [0, 1, 0], scale: [0.4, 1.3, 1.7], y: [0, -10, -30] }}
      transition={{ duration: 0.9, delay: STEP_MS / 2000 }}
    />
  )
}

/** A Hit: the fire flares up over the chicken, then dies down to show it roasted. */
function FlareUp() {
  return (
    <motion.img
      className={styles.flare}
      src={SPRITES.fire}
      alt=""
      initial={{ scale: 0.6, opacity: 0.6 }}
      animate={{ scale: [0.6, 1.8, 1.5, 1], opacity: [0.6, 1, 1, 0] }}
      transition={{ duration: 1.4, times: [0, 0.25, 0.7, 1], delay: STEP_MS / 2000 }}
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

/** True once `active` has held for RESULT_MS within the Round identified by `nonce`. */
function useAfterDelay(active: boolean, nonce: number | null) {
  const [doneFor, setDoneFor] = useState<number | null>(null)
  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => setDoneFor(nonce), RESULT_MS)
    return () => clearTimeout(timer)
  }, [active, nonce])
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
