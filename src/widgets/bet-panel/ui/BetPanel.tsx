import { useEffect, useState, type MouseEvent } from 'react'
import {
  betError,
  canCashOut,
  canGo,
  canPlay,
  canTopUp,
  cashOutCents,
  MAX_BET_CENTS,
  MIN_BET_CENTS,
  gameStore,
  useGame,
  type BetError,
} from '@/entities/round'
import { AutoplayButton, useAutoplay } from '@/features/autoplay'
import { BURN_MS, STEP_MS } from '@/shared/config'
import {
  DIFFICULTIES,
  laneCount,
  multiplierAt,
  payoutCents,
  type Difficulty,
} from '@/shared/game-rules'
import { useT, type MessageKey } from '@/shared/i18n'
import { formatCoins, formatMultiplier, parseCoins } from '@/shared/lib'
import { Coin } from '@/shared/ui'
import styles from './BetPanel.module.css'

export function BetPanel() {
  const game = useGame((s) => s)
  const t = useT()
  const [betText, setBetText] = useState(() => (game.betCents / 100).toFixed(2))
  const playing = game.round.phase === 'playing'
  const auto = useAutoplay((s) => s)
  // The Bet and Difficulty stay fixed during a Round and for the whole Autoplay run.
  const locked = playing || auto.running
  const error = playing ? null : betError(game)
  const [animating, setAnimating] = useState(false)

  /** Runs a Step action and keeps the buttons locked until its animation has played. */
  async function animated(action: () => Promise<void>) {
    setAnimating(true)
    try {
      await action()
      // After a Hit, Play waits for the burn too, so a new Round doesn't cut it short.
      const hit = gameStore.getState().round.phase === 'hit'
      await new Promise((resolve) => setTimeout(resolve, hit ? STEP_MS + BURN_MS : STEP_MS))
    } finally {
      setAnimating(false)
    }
  }

  const canStep = !animating && (playing ? canGo(game) : canPlay(game))
  const canTake = !animating && canCashOut(game)

  // Hotkeys: Space = Play/GO, Enter = Cash Out. Not while typing or with a dialog open; on any
  // focused control (MIN, a chip, Play/GO/Cash Out themselves) Space and Enter press that control,
  // as a keyboard user expects. A mouse click doesn't leave focus on Play/GO/Cash Out (`press`), so
  // for mouse players the hotkeys stay global.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== ' ' && e.key !== 'Enter') return
      if (e.repeat || auto.running || document.querySelector('dialog[open]')) return
      const el = document.activeElement
      if (el && el !== document.body) return
      e.preventDefault()
      if (e.key === ' ' && canStep) void animated(playing ? game.go : game.play)
      if (e.key === 'Enter' && canTake) void game.cashOut()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  /** A click handler that drops the focus after a mouse click, so Space/Enter go back to the hotkeys. */
  const press = (action: () => unknown) => (e: MouseEvent<HTMLButtonElement>) => {
    if (e.detail > 0) e.currentTarget.blur()
    void action()
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
          <button className={styles.chip} disabled={locked} onClick={() => choose(MIN_BET_CENTS)}>
            {t('min')}
          </button>
          <span className={styles.inputBox}>
            <Coin />
            <input
              id="bet-amount"
              className={styles.input}
              inputMode="decimal"
              value={betText}
              disabled={locked}
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
            disabled={locked}
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
              disabled={locked}
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

      <fieldset className={styles.difficulty} disabled={locked}>
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
        {auto.running ? (
          <>
            <span className={styles.autoProgress}>
              {t('autoplayProgress', { current: auto.current, total: auto.total })}
            </span>
            <button className={styles.go} disabled={auto.stopping} onClick={auto.stop}>
              {t(auto.stopping ? 'stopping' : 'stop')}
            </button>
          </>
        ) : playing ? (
          <>
            <button
              key="cashOut"
              className={styles.cashOut}
              disabled={!canTake}
              onClick={press(game.cashOut)}
            >
              {t('cashOut')} <Coin /> {formatCoins(cashOutCents(game))}
            </button>
            <button
              className={styles.go}
              disabled={!canStep}
              onClick={press(() => animated(game.go))}
            >
              {t('go')}
            </button>
          </>
        ) : canTopUp(game) ? (
          <button className={styles.go} onClick={game.topUp}>
            {t('topUp')}
          </button>
        ) : (
          <>
            <AutoplayButton className={styles.auto} disabled={!canStep} />
            <button
              className={styles.go}
              disabled={!canStep}
              onClick={press(() => animated(game.play))}
            >
              {t('play')}
            </button>
          </>
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
  const latest = useGame((s) => s.round)
  // A Step, Hit or win is announced when the chicken lands, as the scene shows it, not when the
  // server answers; a Cash Out has no animation to wait for.
  const [round, setRound] = useState(latest)
  useEffect(() => {
    const timer = setTimeout(() => setRound(latest), latest.phase === 'cashedOut' ? 0 : STEP_MS)
    return () => clearTimeout(timer)
  }, [latest])
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
