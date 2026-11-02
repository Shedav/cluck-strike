import { useState } from 'react'
import { formatCoins, parseCoins } from '../format'
import { canCashOut, canGo, canPlay, cashOutCents, useGame } from '../game/store'
import { Coin } from './Coin'
import styles from './BetPanel.module.css'

export function BetPanel() {
  const game = useGame((s) => s)
  const [betText, setBetText] = useState(() => (game.betCents / 100).toFixed(2))
  const playing = game.round.phase === 'playing'

  return (
    <section className={styles.panel} aria-label="Bet">
      <label className={styles.bet}>
        <span className={styles.label}>Bet Amount</span>
        <span className={styles.inputBox}>
          <Coin />
          <input
            className={styles.input}
            inputMode="decimal"
            value={betText}
            disabled={playing}
            aria-invalid={!canPlay(game) && !playing && !game.pending}
            onChange={(e) => {
              setBetText(e.target.value)
              game.setBet(parseCoins(e.target.value))
            }}
          />
        </span>
      </label>

      <div className={styles.actions}>
        {playing ? (
          <>
            <button className={styles.go} disabled={!canGo(game)} onClick={game.go}>
              GO
            </button>
            <button className={styles.cashOut} disabled={!canCashOut(game)} onClick={game.cashOut}>
              Cash Out <Coin /> {formatCoins(cashOutCents(game))}
            </button>
          </>
        ) : (
          <button className={styles.go} disabled={!canPlay(game)} onClick={game.play}>
            Play
          </button>
        )}
      </div>

      <p className={styles.status} role="status">
        <RoundStatus />
      </p>
    </section>
  )
}

function RoundStatus() {
  const round = useGame((s) => s.round)
  switch (round.phase) {
    case 'hit':
      return <span className={styles.lost}>Hit on Lane {round.lane}. Bet lost.</span>
    case 'cashedOut':
      return <span className={styles.won}>Cashed out {formatCoins(round.payoutCents)}</span>
    case 'finished':
      return <span className={styles.won}>Finish! Won {formatCoins(round.payoutCents)}</span>
    default:
      return null
  }
}
