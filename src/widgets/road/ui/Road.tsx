import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { isWin, useGame } from '@/entities/round'
import { HOP_MS, LANDED_PAUSE_MS, RESULT_MS, ROAST_MS, STEP_MS, THROW_MS } from '@/shared/config'
import { maxWinLane, MULTIPLIERS } from '@/shared/game-rules'
import { useT } from '@/shared/i18n'
import { formatCoins, formatMultiplier, playSound } from '@/shared/lib'
import { Coin, PixelSprite } from '@/shared/ui'
import { centreOf, LANE_PX } from '../config'
import { BURN } from '../pixel/burn'
import { GOLDEN_CASE } from '../pixel/case'
import { FIRE, GRENADE, SMOKE } from '../pixel/props'
import { CHICKEN } from '../pixel/chicken'
import styles from './Road.module.css'

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
  // On a Finish the golden case opens as it lands, and the celebration waits until it is open.
  const stepWin = round.phase === 'finished' || round.phase === 'maxWin'
  const caseOpening = useAfterDelay(round.phase === 'finished', round.nonce, STEP_MS)
  const landed = useAfterDelay(
    stepWin,
    round.nonce,
    STEP_MS + (round.phase === 'finished' ? CASE_MS : LANDED_PAUSE_MS),
  )
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
      <div className={`${styles.scene} surface`}>
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
                  {state === 'ahead' && (
                    <PixelSprite
                      className={styles.fire}
                      frames={FIRE}
                      ms={FIRE_MS}
                      loop
                      width={64}
                    />
                  )}
                  {/* Only for a Step seen on screen: after a reload the chicken just stands there. */}
                  {n === lane && move.kind === 'step' && (round.phase === 'playing' || stepWin) && (
                    <Fragment key={`step-${round.nonce}-${n}`}>
                      <DousedFire />
                      <Grenade miss={false} />
                      <SmokePuff />
                    </Fragment>
                  )}
                  {state === 'hit' && (
                    <>
                      <Grenade miss />
                      <Burn />
                    </>
                  )}
                  {chickenIn(n)}
                </div>
              </div>
            )
          })}
          <div className={styles.finish}>
            <PixelSprite
              key={caseOpening ? 'open' : 'closed'}
              className={styles.case}
              frames={caseOpening ? GOLDEN_CASE.open : GOLDEN_CASE.closed}
              ms={CASE_MS}
              width={96}
              alt={t('goldenCase')}
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
 * fades in at the start. A burning chicken vanishes as it lands, where the burn takes over.
 */
function Chicken({ move, burning }: { move: Move; burning: boolean }) {
  const t = useT()
  const hop = { delay: THROW_MS / 1000, duration: HOP_MS / 1000, ease: 'easeOut' } as const
  // On a Step the chicken throws, then hops, then idles; otherwise it just idles.
  const [pose, setPose] = useState<keyof typeof CHICKEN>(move.kind === 'step' ? 'throw' : 'idle')
  useEffect(() => {
    if (move.kind !== 'step') return
    const hopping = setTimeout(() => setPose('hop'), THROW_MS)
    const idling = setTimeout(() => setPose('idle'), STEP_MS)
    return () => {
      clearTimeout(hopping)
      clearTimeout(idling)
    }
  }, [move.kind])
  return (
    <motion.div
      className={styles.chicken}
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
          ? { delay: STEP_MS / 1000, duration: 0 }
          : move.kind === 'reset'
            ? { ...FADE, delay: FADE.duration }
            : FADE,
      }}
    >
      <PixelSprite
        key={pose}
        frames={CHICKEN[pose]}
        ms={POSE_MS[pose]}
        loop={pose === 'idle'}
        width={96}
        alt={t('chicken')}
      />
    </motion.div>
  )
}

const POSE_MS = { idle: 900, throw: THROW_MS, hop: HOP_MS }

/** A Hit: once the chicken lands in the fire, it burns down to a pile of bones that stays there. */
function Burn() {
  const t = useT()
  const [lit, setLit] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setLit(true), STEP_MS)
    return () => clearTimeout(timer)
  }, [])
  if (!lit) return null
  return (
    <PixelSprite
      className={styles.burn}
      frames={BURN}
      ms={BURN_MS}
      width={96}
      alt={t('roastedChicken')}
    />
  )
}

/** The golden case shaking, bursting open and settling, before the Finish is celebrated. */
const CASE_MS = 1100

/** The whole burn; with `STEP_MS` it ends before `RESULT_MS` resets the scene. */
const BURN_MS = 1500

/** The smoke grenade arcs from the chicken's Lane: onto this Lane's fire, or past it on a Hit. */
function Grenade({ miss }: { miss: boolean }) {
  return (
    <motion.div
      className={styles.grenade}
      initial={{ x: -LANE_PX, y: -40, rotate: 0, opacity: 0 }}
      animate={{
        x: [-LANE_PX, miss ? LANE_PX * 0.2 : -LANE_PX / 2, miss ? LANE_PX * 1.1 : 0],
        y: [-40, -150, miss ? -20 : 0],
        rotate: [0, 270, 540],
        // Hidden while the chicken's wind-up frame still holds the grenade (the first of three).
        opacity: [0, 0, 1, 1, 0],
      }}
      transition={{
        duration: THROW_MS / 1000,
        ease: 'easeIn',
        times: [0, 0.5, 1],
        opacity: { duration: THROW_MS / 1000, times: [0, 0.33, 0.34, 0.5, 1] },
      }}
    >
      <PixelSprite frames={GRENADE} ms={0} width={24} />
    </motion.div>
  )
}

/** A safe Step: the Lane's fire dies as the grenade lands... */
function DousedFire() {
  return (
    <motion.div
      className={styles.doused}
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 0, scale: 0.4 }}
      transition={{ delay: THROW_MS / 1000, duration: 0.25 }}
    >
      <PixelSprite frames={FIRE} ms={FIRE_MS} loop width={64} />
    </motion.div>
  )
}

/** ...and a Smoke cloud bursts out, billows and drifts away. */
function SmokePuff() {
  return (
    <motion.div
      className={styles.smoke}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0], y: [0, -10, -20, -40] }}
      transition={{ duration: SMOKE_MS / 1000, times: [0, 0.1, 0.7, 1], delay: THROW_MS / 1000 }}
    >
      <PixelSprite frames={SMOKE} ms={SMOKE_MS} delay={THROW_MS} width={120} />
    </motion.div>
  )
}

const FIRE_MS = 600
const SMOKE_MS = 1200

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
