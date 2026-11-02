import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { formatCoins, formatMultiplier } from '../format'
import { maxWinLane, MULTIPLIERS } from '../game/odds'
import { isWin } from '../game/round'
import { useGame } from '../game/store'
import { useT } from '../i18n'
import { playSound } from '../sound'
import { Coin } from './Coin'
import styles from './Road.module.css'
import {
  centreOf,
  HOP_MS,
  LANE_PX,
  LANDED_PAUSE_MS,
  RESULT_MS,
  ROAST_MS,
  SPRITES,
  STEP_MS,
  THROW_MS,
} from './timing'

export function Road() {
  const round = useGame((s) => s.round)
  // Before a Round the dimming follows the Bet being typed; during and after, the Round's own Bet.
  const betCents = useGame((s) => (s.round.phase === 'idle' ? s.betCents : s.round.betCents))
  const capLane = maxWinLane(betCents, round.difficulty)
  const t = useT()
  // Index 0 is the start column, 1..n the Lanes.
  const cells = useRef<(HTMLDivElement | null)[]>([])
  // The burn plays after the throw and the hop, so the Hit result stays up a bit longer.
  const burnt = useAfterDelay(round.phase === 'hit', round.nonce, STEP_MS + RESULT_MS)
  // A Finish or Max Win comes from a Step: let the chicken land on the Lane first, then celebrate.
  const stepWin = round.phase === 'finished' || round.phase === 'maxWin'
  const landed = useAfterDelay(stepWin, round.nonce, STEP_MS + LANDED_PAUSE_MS)
  const celebrate = round.phase === 'cashedOut' || landed
  // After a win the chicken goes back to the start (the popup tells the result); after a Hit the
  // fire stays on the Lane for a moment first.
  const lane = celebrate || burnt ? 0 : round.lane
  const hitNow = round.phase === 'hit' && !burnt

  // How the chicken got to `lane`: a Step forward (hop over from the previous cell) or a reset (fade
  // out where it was, fade in at the start). Updated during render, React's "previous value" pattern.
  const [shown, setShown] = useState<{ lane: number; move: Move }>({ lane, move: { kind: 'stay' } })
  if (shown.lane !== lane) {
    setShown({
      lane,
      move:
        lane > shown.lane
          ? { kind: 'step', distance: centreOf(lane) - centreOf(shown.lane) }
          : { kind: 'reset' },
    })
  }
  const move = shown.move

  // A reload never restores a finished Round, so these fire only for a win just made.
  useEffect(() => {
    if (round.phase === 'cashedOut') playSound('cashOut')
  }, [round.phase, round.nonce])
  useEffect(() => {
    if (landed) playSound('fanfare')
  }, [landed])

  // Step sounds follow the animation: the throw now, the landing when the grenade comes down, and
  // on a Hit the fire burst when the chicken lands in the flames.
  const safeStep = move.kind === 'step' && (round.phase === 'playing' || stepWin)
  const hitStep = move.kind === 'step' && round.phase === 'hit'
  useEffect(() => {
    if (move.kind !== 'step') return
    playSound('throw')
    const landing = setTimeout(() => {
      if (safeStep) playSound('smoke')
      playSound('hop')
    }, THROW_MS)
    const burst = hitStep ? setTimeout(() => playSound('fire'), STEP_MS) : undefined
    const roast = hitStep ? setTimeout(() => playSound('roast'), STEP_MS + ROAST_MS) : undefined
    return () => {
      clearTimeout(landing)
      clearTimeout(burst)
      clearTimeout(roast)
    }
  }, [move, safeStep, hitStep])

  useEffect(() => {
    cells.current[lane]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [lane])

  const chickenIn = (n: number) => (
    <AnimatePresence custom={move}>
      {n === lane && <Chicken key={`${round.nonce}-${n}`} move={move} burning={n > 0 && hitNow} />}
    </AnimatePresence>
  )

  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.scene}>
        <motion.div
          className={styles.road}
          animate={hitNow ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
          transition={{ duration: 0.4, delay: STEP_MS / 1000 }}
        >
          <div className={styles.start} data-lane={0} ref={(el) => void (cells.current[0] = el)}>
            <div className={styles.ground}>{chickenIn(0)}</div>
          </div>
          {MULTIPLIERS[round.difficulty].map((multiplier, i) => {
            const n = i + 1
            const state = n === lane && hitNow ? 'hit' : n <= lane ? 'passed' : 'ahead'
            return (
              <div
                key={n}
                className={`${styles.lane} ${styles[state]} ${capLane && n > capLane ? styles.beyondMaxWin : ''}`}
                data-lane={n}
                ref={(el) => void (cells.current[n] = el)}
              >
                <Badge multiplier={multiplier} />
                <div className={styles.ground}>
                  {state === 'ahead' && <img className={styles.fire} src={SPRITES.fire} alt="" />}
                  {n === lane && (round.phase === 'playing' || stepWin) && (
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
                  {chickenIn(n)}
                </div>
              </div>
            )
          })}
          <div className={styles.finish}>
            <motion.img
              className={styles.case}
              src={SPRITES.goldenCase}
              alt={t('goldenCase')}
              animate={
                round.phase === 'finished' ? { scale: [1, 1.3, 1.15], rotate: [0, -8, 8, 0] } : {}
              }
              transition={{ duration: 0.6, delay: STEP_MS / 1000 }}
            />
          </div>
        </motion.div>
        <WinPopup show={celebrate} />
      </div>
    </MotionConfig>
  )
}

type Move = { kind: 'step'; distance: number } | { kind: 'reset' } | { kind: 'stay' }

const FADE = { duration: 0.25 }

/**
 * The chicken is drawn in its own cell. On a Step it starts where the previous cell was and hops
 * over once its grenade has landed; on a reset (win or Hit) the old one fades out and this one
 * fades in at the start. A burning chicken fades out as the roasted one appears.
 */
function Chicken({ move, burning }: { move: Move; burning: boolean }) {
  const t = useT()
  const hop = { delay: THROW_MS / 1000, duration: HOP_MS / 1000, ease: 'easeOut' } as const
  return (
    <motion.img
      className={styles.chicken}
      src={SPRITES.chicken}
      alt={t('chicken')}
      custom={move}
      variants={{
        // The leaving chicken vanishes at once on a Step (the new one takes its place) and fades on
        // a reset.
        leave: (m: Move) => ({
          opacity: 0,
          transition: m.kind === 'reset' ? FADE : { duration: 0 },
        }),
      }}
      exit="leave"
      initial={
        move.kind === 'step'
          ? { x: -move.distance, y: 0, opacity: 1 }
          : { x: 0, y: 0, opacity: move.kind === 'reset' ? 0 : 1 }
      }
      animate={{
        x: 0,
        y: move.kind === 'step' ? [0, -44, 0] : 0,
        opacity: burning ? 0 : 1,
      }}
      transition={{
        x: hop,
        y: hop,
        opacity: burning
          ? { delay: (STEP_MS + ROAST_MS) / 1000, duration: 0.2 }
          : move.kind === 'reset'
            ? { ...FADE, delay: FADE.duration }
            : FADE,
      }}
    />
  )
}

function RoastedChicken() {
  return (
    <motion.img
      className={styles.chicken}
      src={SPRITES.chickenRoasted}
      alt={useT()('roastedChicken')}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: (STEP_MS + ROAST_MS) / 1000, duration: 0.2 }}
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
function WinPopup({ show }: { show: boolean }) {
  const round = useGame((s) => s.round)
  const hidden = useAfterDelay(show, round.nonce)

  const t = useT()
  if (!show || !isWin(round.phase) || hidden) return null
  const title = t(
    ({ cashedOut: 'youWin', finished: 'finish', maxWin: 'maxWinReached' } as const)[round.phase],
  )
  return (
    // Screen readers hear the result from the Bet panel's live region instead.
    <div className={styles.popup} aria-hidden="true" data-testid="win-popup">
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
