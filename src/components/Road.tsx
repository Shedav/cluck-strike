import { useEffect, useRef, useState } from 'react'
import { formatCoins, formatMultiplier } from '../format'
import { maxWinLane, MULTIPLIERS } from '../game/odds'
import { isWin } from '../game/round'
import { useGame } from '../game/store'
import { Coin } from './Coin'
import styles from './Road.module.css'

// shortcut: emoji placeholders for the chicken and fire; real sprites and animation come in ticket 08.
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

  useEffect(() => {
    current.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [lane])

  const chicken = round.phase === 'hit' && !burnt ? '🔥' : '🐔'

  return (
    <div className={styles.scene}>
      <div className={styles.road}>
        <div className={styles.start} ref={lane === 0 ? current : undefined}>
          {lane === 0 && <span className={styles.chicken}>{chicken}</span>}
        </div>
        {MULTIPLIERS[round.difficulty].map((multiplier, i) => {
          const n = i + 1
          const state = n === lane && round.phase === 'hit' ? 'hit' : n <= lane ? 'passed' : 'ahead'
          return (
            <div
              key={n}
              className={`${styles.lane} ${styles[state]} ${capLane && n > capLane ? styles.beyondMaxWin : ''}`}
              ref={n === lane ? current : undefined}
            >
              <Badge multiplier={multiplier} />
              {n === lane && <span className={styles.chicken}>{chicken}</span>}
            </div>
          )
        })}
      </div>
      <WinPopup />
    </div>
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

const RESULT_MS = 2000

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
