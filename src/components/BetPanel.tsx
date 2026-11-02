import { useEffect, useState } from 'react'
import { formatCoins, formatMultiplier, parseCoins } from '../format'
import { DIFFICULTIES, laneCount, multiplierAt, payoutCents, type Difficulty } from '../game/odds'
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

  const canStep = !animating && (playing ? canGo(game) : canPlay(game))
  const canTake = !animating && canCashOut(game)

  // Hotkeys: Space = Play/GO, Enter = Cash Out. Not while typing or with a dialog open; on another
  // focused control (MIN, a chip...) Space and Enter keep their own meaning.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== ' ' && e.key !== 'Enter') return
      if (e.repeat || document.querySelector('dialog[open]')) return
      const el = document.activeElement
      if (el && el !== document.body && !(el instanceof HTMLElement && el.dataset.hotkey)) return
      e.preventDefault()
      if (e.key === ' ' && canStep) void animated(playing ? game.go : game.play)
      if (e.key === 'Enter' && canTake) void game.cashOut()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

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
        {/* Tabs on wide screens, a dropdown on phones (CSS shows one of them). */}
        <select
          className={styles.select}
          aria-label={t('difficulty')}
          value={game.round.difficulty}
          onChange={(e) => game.setDifficulty(e.target.value as Difficulty)}
        >
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {t(d)}
            </option>
          ))}
        </select>
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
              data-hotkey="Enter"
              disabled={!canTake}
              onClick={game.cashOut}
            >
              {t('cashOut')} <Coin /> {formatCoins(cashOutCents(game))}
            </button>
            <button
              className={styles.go}
              data-hotkey="Space"
              disabled={!canStep}
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
            data-hotkey="Space"
            disabled={!canStep}
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

/** Screen readers only: what the scene and the win popup show, as one live message. */
function RoundStatus() {
  const round = useGame((s) => s.round)
  const t = useT()
  const amount = formatCoins(round.payoutCents)
  switch (round.phase) {
    case 'playing':
      return round.lane > 0 ? (
        <>
          {t('stepAnnouncement', {
            lane: round.lane,
            multiplier: formatMultiplier(multiplierAt(round.difficulty, round.lane)),
          })}
        </>
      ) : null
    case 'hit':
      return <>{t('hitAnnouncement', { lane: round.lane })}</>
    case 'cashedOut':
      return <>{t('cashOutAnnouncement', { amount })}</>
    case 'finished':
      return <>{t('finishAnnouncement', { amount })}</>
    case 'maxWin':
      return <>{t('maxWinAnnouncement', { amount })}</>
    default:
      return null
  }
}
