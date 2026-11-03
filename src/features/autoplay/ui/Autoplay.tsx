import { useState } from 'react'
import { betError, useGame } from '@/entities/round'
import { laneCount, multiplierAt, payoutCents } from '@/shared/game-rules'
import { useT } from '@/shared/i18n'
import { formatAmount, formatMultiplier } from '@/shared/lib'
import { AutoplayIcon, CoinIcon, Dialog } from '@/shared/ui'
import { useAutoplay } from '../model/autoplay'
import styles from './Autoplay.module.css'

const ROUND_PRESETS = [10, 25, 50, 100]
const MAX_ROUNDS = 100

/** Opens the Autoplay settings; Start runs the Rounds with the current Bet and Difficulty. */
export function AutoplayButton({ className, disabled }: { className: string; disabled: boolean }) {
  const [open, setOpen] = useState(false)
  const t = useT()
  return (
    <>
      <button
        className={className}
        disabled={disabled}
        aria-label={t('autoplay')}
        title={t('autoplay')}
        onClick={() => setOpen(true)}
      >
        <AutoplayIcon />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={t('autoplay')}>
        <AutoplaySettings onStart={() => setOpen(false)} />
      </Dialog>
    </>
  )
}

// Kept between openings of the modal while the page is open.
let lastSettings = { rounds: 10, cashOutLane: 3 }

function AutoplaySettings({ onStart }: { onStart: () => void }) {
  const game = useGame((s) => s)
  const start = useAutoplay((s) => s.start)
  const t = useT()
  const { difficulty } = game.round
  const lanes = laneCount(difficulty)
  const [rounds, setRounds] = useState(lastSettings.rounds)
  const [cashOutLane, setCashOutLane] = useState(Math.min(lastSettings.cashOutLane, lanes))
  const canStart = betError(game) === null

  return (
    <div className={styles.settings}>
      <Stepper
        id="autoplay-rounds"
        label={t('autoplayRounds')}
        value={rounds}
        min={1}
        max={MAX_ROUNDS}
        onChange={setRounds}
      />
      <div className={styles.presets}>
        {ROUND_PRESETS.map((n) => (
          <button
            key={n}
            className={styles.preset}
            aria-pressed={rounds === n}
            onClick={() => setRounds(n)}
          >
            {n}
          </button>
        ))}
      </div>

      <Stepper
        id="autoplay-lane"
        label={t('cashOutOnLane')}
        value={cashOutLane}
        min={1}
        max={lanes}
        onChange={setCashOutLane}
      />
      <div className={styles.info}>
        <div>
          <span className={styles.label}>{t('multiplier')}</span>
          <strong>{formatMultiplier(multiplierAt(difficulty, cashOutLane))}</strong>
        </div>
        <div>
          <span className={styles.label}>{t('autoplayWin')}</span>
          <strong>
            <CoinIcon />{' '}
            {canStart ? formatAmount(payoutCents(game.betCents, difficulty, cashOutLane)) : '—'}
          </strong>
        </div>
      </div>

      <button
        className={styles.start}
        disabled={!canStart}
        onClick={() => {
          lastSettings = { rounds, cashOutLane }
          onStart()
          start({ rounds, cashOutLane })
        }}
      >
        {t('startAutoplay', { count: rounds })}
      </button>
    </div>
  )
}

/** A number field with − and + buttons, kept within [min, max]. */
function Stepper(props: {
  id: string
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  const { id, label, value, min, max, onChange } = props
  const t = useT()
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.stepper}>
        <button
          className={styles.step}
          aria-label={t('decrease', { label })}
          disabled={value <= min}
          onClick={() => onChange(clamp(value - 1))}
        >
          −
        </button>
        <input
          id={id}
          className={styles.number}
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10)
            if (Number.isFinite(n)) onChange(clamp(n))
          }}
        />
        <button
          className={styles.step}
          aria-label={t('increase', { label })}
          disabled={value >= max}
          onClick={() => onChange(clamp(value + 1))}
        >
          +
        </button>
      </div>
    </div>
  )
}
