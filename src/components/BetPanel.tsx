import { useState } from 'react'
import { formatCoins, parseCoins } from '../format'
import { DIFFICULTIES, laneCount, payoutCents, type Difficulty } from '../game/odds'
import {
  betError,
  canCashOut,
  canGo,
  canPlay,
  canTopUp,
  cashOutCents,
  MAX_BET_CENTS,
  MIN_BET_CENTS,
  useGame,
  type BetError,
} from '../game/store'
import { Coin } from './Coin'
import styles from './BetPanel.module.css'

export function BetPanel() {
  const game = useGame((s) => s)
  const [betText, setBetText] = useState(() => (game.betCents / 100).toFixed(2))
  const playing = game.round.phase === 'playing'
  const error = playing ? null : betError(game)

  function choose(cents: number) {
    setBetText((cents / 100).toFixed(2))
    game.setBet(cents)
  }

  return (
    <section className={styles.panel} aria-label="Bet">
      <div className={styles.bet}>
        <label className={styles.label} htmlFor="bet-amount">
          Bet Amount
        </label>
        <div className={styles.betRow}>
          <button className={styles.chip} disabled={playing} onClick={() => choose(MIN_BET_CENTS)}>
            MIN
          </button>
          <span className={styles.inputBox}>
            <Coin />
            <input
              id="bet-amount"
              className={styles.input}
              inputMode="decimal"
              value={betText}
              disabled={playing}
              aria-invalid={error !== null}
              aria-describedby={error ? 'bet-error' : undefined}
              onChange={(e) => {
                setBetText(e.target.value)
                game.setBet(parseCoins(e.target.value))
              }}
            />
          </span>
          <button
            className={styles.chip}
            disabled={playing}
            onClick={() =>
              choose(Math.max(MIN_BET_CENTS, Math.min(MAX_BET_CENTS, game.balanceCents)))
            }
          >
            MAX
          </button>
        </div>
        <div className={styles.betRow}>
          {PRESETS_CENTS.map((cents) => (
            <button
              key={cents}
              className={styles.chip}
              disabled={playing}
              onClick={() => choose(cents)}
            >
              <Coin size={12} /> {cents / 100}
            </button>
          ))}
        </div>
        {error && (
          <span id="bet-error" className={styles.error}>
            {BET_ERRORS[error]}
          </span>
        )}
      </div>

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
          <Coin /> {error ? '—' : formatCoins(maxWinCents(game.betCents, game.round.difficulty))}
        </span>
      </div>

      <div className={styles.actions}>
        {playing ? (
          <>
            <button
              key="cashOut"
              className={styles.cashOut}
              disabled={!canCashOut(game)}
              onClick={game.cashOut}
            >
              Cash Out <Coin /> {formatCoins(cashOutCents(game))}
            </button>
            <button className={styles.go} disabled={!canGo(game)} onClick={game.go}>
              GO
            </button>
          </>
        ) : canTopUp(game) ? (
          <button className={styles.go} onClick={game.topUp}>
            Top up demo balance
          </button>
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

const PRESETS_CENTS = [200, 300, 800, 2000]

const BET_ERRORS: Record<BetError, string> = {
  invalid: 'Enter an amount like 3 or 2.50',
  belowMin: `Minimum Bet is ${formatCoins(MIN_BET_CENTS)}`,
  aboveMax: `Maximum Bet is ${formatCoins(MAX_BET_CENTS)}`,
  aboveBalance: 'Not enough Balance',
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  hardcore: 'Hardcore',
}

/** The most a Round can pay with this Bet: the last Lane's payout, which is capped at Max Win. */
const maxWinCents = (betCents: number, difficulty: Difficulty) =>
  payoutCents(betCents, difficulty, laneCount(difficulty))

/** Only a Hit is reported here; wins get the popup over the road. */
function RoundStatus() {
  const round = useGame((s) => s.round)
  if (round.phase !== 'hit') return null
  return <span className={styles.lost}>Hit on Lane {round.lane}. Bet lost.</span>
}
