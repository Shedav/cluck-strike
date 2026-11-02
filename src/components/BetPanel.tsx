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
import { useT, type MessageKey } from '../i18n'
import { Coin } from './Coin'
import { STEP_MS } from './timing'
import styles from './BetPanel.module.css'

export function BetPanel() {
  const game = useGame((s) => s)
  const t = useT()
  const [betText, setBetText] = useState(() => (game.betCents / 100).toFixed(2))
  const playing = game.round.phase === 'playing'
  const error = playing ? null : betError(game)
  const [animating, setAnimating] = useState(false)

  /** Runs a Step action and keeps the buttons locked until its animation has played. */
  async function animated(action: () => Promise<void>) {
    setAnimating(true)
    try {
      await action()
      await new Promise((resolve) => setTimeout(resolve, STEP_MS))
    } finally {
      setAnimating(false)
    }
  }

  function choose(cents: number) {
    setBetText((cents / 100).toFixed(2))
    game.setBet(cents)
  }

  return (
    <section className={styles.panel} aria-label={t('bet')}>
      <div className={styles.bet}>
        <label className={styles.label} htmlFor="bet-amount">
          {t('betAmount')}
        </label>
        <div className={styles.betRow}>
          <button className={styles.chip} disabled={playing} onClick={() => choose(MIN_BET_CENTS)}>
            {t('min')}
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
            {t('max')}
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
            {t(BET_ERRORS[error], {
              amount: formatCoins(error === 'belowMin' ? MIN_BET_CENTS : MAX_BET_CENTS),
            })}
          </span>
        )}
      </div>

      <fieldset className={styles.difficulty} disabled={playing}>
        <legend className={styles.label}>{t('difficulty')}</legend>
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
              {t(d)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.maxWin}>
        <span className={styles.label}>{t('maxWin')}</span>
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
              disabled={animating || !canCashOut(game)}
              onClick={game.cashOut}
            >
              {t('cashOut')} <Coin /> {formatCoins(cashOutCents(game))}
            </button>
            <button
              className={styles.go}
              disabled={animating || !canGo(game)}
              onClick={() => animated(game.go)}
            >
              {t('go')}
            </button>
          </>
        ) : canTopUp(game) ? (
          <button className={styles.go} onClick={game.topUp}>
            {t('topUp')}
          </button>
        ) : (
          <button
            className={styles.go}
            disabled={animating || !canPlay(game)}
            onClick={() => animated(game.play)}
          >
            {t('play')}
          </button>
        )}
      </div>

      <p className={styles.srOnly} role="status">
        <RoundStatus />
      </p>
    </section>
  )
}

const PRESETS_CENTS = [200, 300, 800, 2000]

const BET_ERRORS: Record<BetError, MessageKey> = {
  invalid: 'betInvalid',
  belowMin: 'betBelowMin',
  aboveMax: 'betAboveMax',
  aboveBalance: 'betAboveBalance',
}

/** The most a Round can pay with this Bet: the last Lane's payout, which is capped at Max Win. */
const maxWinCents = (betCents: number, difficulty: Difficulty) =>
  payoutCents(betCents, difficulty, laneCount(difficulty))

/** Screen readers only: a Hit is shown by the scene, wins by the popup. */
function RoundStatus() {
  const round = useGame((s) => s.round)
  const t = useT()
  if (round.phase !== 'hit') return null
  return <>{t('hitAnnouncement', { lane: round.lane })}</>
}
