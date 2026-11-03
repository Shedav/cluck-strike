import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react'
import { useGame } from '@/entities/round'
import { CASE_MS, LANDED_PAUSE_MS, RESULT_MS, ROAST_MS, STEP_MS, THROW_MS } from '@/shared/config'
import { maxWinLane, MULTIPLIERS } from '@/shared/game-rules'
import { useT } from '@/shared/i18n'
import { formatMultiplier, formatMultiplierFull, playSound } from '@/shared/lib'
import { PixelSprite } from '@/shared/ui'
import { centreOf, LANE_PX, START_PX } from '../config'
import { useAfterDelay } from '../lib/useAfterDelay'
import { GOLDEN_CASE } from '../pixel/case'
import { Chicken, type Move } from './Chicken'
import styles from './Road.module.css'
import { Burn, DousedFire, Grenade, LaneFire, SmokePuff } from './StepEffects'
import { WinPopup } from './WinPopup'

export function Road() {
  const round = useGame((s) => s.round)
  // Before a Round the dimming follows the Bet being typed; during and after, the Round's own Bet.
  const betCents = useGame((s) => (s.round.phase === 'idle' ? s.betCents : s.round.betCents))
  const capLane = maxWinLane(betCents, round.difficulty)
  const t = useT()
  // Index 0 is the start column, 1..n the Lanes.
  const cells = useRef<(HTMLDivElement | null)[]>([])
  // The burn plays after the throw and the hop, so the Hit result stays up a bit longer.
  const hitOver = useAfterDelay(round.phase === 'hit', round.nonce, STEP_MS + RESULT_MS)
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
  const lane = celebrate || hitOver ? 0 : round.lane
  const hitNow = round.phase === 'hit' && !hitOver

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
      <div className={`${styles.scene} surface`} style={SCENE_VARS}>
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
                  {state === 'ahead' && <LaneFire className={styles.fire} />}
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

/** Timings and cell widths for Road.module.css, from the same constants the code uses. */
const SCENE_VARS = {
  '--throw-ms': `${THROW_MS}ms`,
  '--step-ms': `${STEP_MS}ms`,
  '--lane-px': `${LANE_PX}px`,
  '--start-px': `${START_PX}px`,
} as CSSProperties

function Badge({ multiplier }: { multiplier: number }) {
  const text = formatMultiplier(multiplier)
  const full = formatMultiplierFull(multiplier)
  if (text === full) return <span className={styles.badge}>{text}</span>
  // Compact badges reveal the exact Multiplier on hover and keyboard focus.
  return (
    <span className={styles.badge} tabIndex={0} aria-label={full} data-full={full}>
      {text}
    </span>
  )
}
