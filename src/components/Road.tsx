import { useEffect, useRef } from 'react'
import { MULTIPLIERS } from '../game/odds'
import { useGame } from '../game/store'
import styles from './Road.module.css'

// shortcut: emoji placeholders for the chicken and fire; real sprites and animation come in ticket 08.
export function Road() {
  const round = useGame((s) => s.round)
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
            className={`${styles.lane} ${styles[state]}`}
            ref={lane === round.lane ? current : undefined}
          >
            <span className={styles.badge}>{multiplier.toFixed(2)}x</span>
            {lane === round.lane && <span className={styles.chicken}>{chicken}</span>}
          </div>
        )
      })}
    </div>
  )
}
