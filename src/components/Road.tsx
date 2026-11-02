import { useEffect, useRef } from 'react'
import { formatMultiplier } from '../format'
import { maxWinLane, MULTIPLIERS } from '../game/odds'
import { useGame } from '../game/store'
import styles from './Road.module.css'

// shortcut: emoji placeholders for the chicken and fire; real sprites and animation come in ticket 08.
export function Road() {
  const round = useGame((s) => s.round)
  // Before a Round the dimming follows the Bet being typed; during and after, the Round's own Bet.
  const betCents = useGame((s) => (s.round.phase === 'idle' ? s.betCents : s.round.betCents))
  const capLane = maxWinLane(betCents, round.difficulty)
  const current = useRef<HTMLDivElement>(null)

  useEffect(() => {
    current.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [round.lane])

  const chicken = round.phase === 'hit' ? '🔥' : '🐔'

  return (
    <div className={styles.road}>
      <div className={styles.start} ref={round.lane === 0 ? current : undefined}>
        {round.lane === 0 && <span className={styles.chicken}>{chicken}</span>}
      </div>
      {MULTIPLIERS[round.difficulty].map((multiplier, i) => {
        const lane = i + 1
        const state =
          lane === round.lane && round.phase === 'hit'
            ? 'hit'
            : lane <= round.lane
              ? 'passed'
              : 'ahead'
        return (
          <div
            key={lane}
            className={`${styles.lane} ${styles[state]} ${capLane && lane > capLane ? styles.beyondMaxWin : ''}`}
            ref={lane === round.lane ? current : undefined}
          >
            <Badge multiplier={multiplier} />
            {lane === round.lane && <span className={styles.chicken}>{chicken}</span>}
          </div>
        )
      })}
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
