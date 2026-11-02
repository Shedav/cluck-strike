import { useState } from 'react'
import { formatCoins, parseCoins } from '../format'
import { DIFFICULTIES, laneCount, payoutCents, type Difficulty } from '../game/odds'
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

      <fieldset className={styles.difficulty} disabled={playing}>
        <legend className={styles.label}>Difficulty</legend>
        <div className={styles.tabs}>
          {DIFFICULTIES.map((d) => (
            <label key={d} className={styles.tab}>
              <input
                type="radio"
                name="difficulty"
                value={d}
                checked={game.round.difficulty === d}
                onChange={() => game.setDifficulty(d)}
              />
              {DIFFICULTY_LABELS[d]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.maxWin}>
        <span className={styles.label}>Max Win</span>
        <span className={styles.maxWinValue}>
          <Coin /> {formatCoins(maxWinCents(game.betCents, game.round.difficulty))}
        </span>
      </div>

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

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  hardcore: 'Hardcore',
}

/** The most a Round can pay with this Bet: the last Lane's payout, which is capped at Max Win. */
const maxWinCents = (betCents: number, difficulty: Difficulty) =>
  Number.isInteger(betCents) ? payoutCents(betCents, difficulty, laneCount(difficulty)) : 0

function RoundStatus() {
  const round = useGame((s) => s.round)
  switch (round.phase) {
    case 'hit':
      return <span className={styles.lost}>Hit on Lane {round.lane}. Bet lost.</span>
    case 'cashedOut':
      return <span className={styles.won}>Cashed out {formatCoins(round.payoutCents)}</span>
    case 'maxWin':
      return (
        <span className={styles.won}>Max Win! Cashed out {formatCoins(round.payoutCents)}</span>
      )
    case 'finished':
      return <span className={styles.won}>Finish! Won {formatCoins(round.payoutCents)}</span>
    default:
      return null
  }
}
