import { useState } from 'react'
import { useGame } from '@/entities/round'
import { DIFFICULTIES, verifierSnippet, type Difficulty } from '@/shared/game-rules'
import { useT } from '@/shared/i18n'
import styles from './Fairness.module.css'
import { Field } from './Field'
import { recomputedText, useVerification } from './verification'

/** Recomputes any Round from values the player enters, and gives the same check as console code. */
export function VerifyForm() {
  // Starts from the last Round whose Server Seed is revealed, if any.
  const last = useGame((s) => (s.round.serverSeed !== null ? s.round : s.recentGames[0]))
  const [form, setForm] = useState(() => ({
    serverSeed: last?.serverSeed ?? '',
    clientSeed: last?.clientSeed ?? '',
    nonce: String(last?.nonce ?? 0),
    difficulty: last?.difficulty ?? ('easy' as Difficulty),
  }))
  const t = useT()
  const nonce = Number(form.nonce)
  const valid =
    form.serverSeed !== '' && form.nonce.trim() !== '' && Number.isSafeInteger(nonce) && nonce >= 0
  const check = useVerification(
    valid ? form.serverSeed : null,
    form.clientSeed,
    valid ? nonce : null,
    form.difficulty,
  )

  const input = (name: 'serverSeed' | 'clientSeed' | 'nonce', label: string) => (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={`verify-${name}`}>
        {label}
      </label>
      <input
        id={`verify-${name}`}
        className={styles.input}
        inputMode={name === 'nonce' ? 'numeric' : undefined}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      />
    </div>
  )

  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>{t('verifyARound')}</h3>
      <p className={styles.hint}>{t('verifyHint')}</p>
      {input('serverSeed', t('serverSeed'))}
      {input('clientSeed', t('clientSeed'))}
      <div className={styles.pair}>
        {input('nonce', t('nonce'))}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="verify-difficulty">
            {t('difficulty')}
          </label>
          <select
            id="verify-difficulty"
            className={styles.input}
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {t(d)}
              </option>
            ))}
          </select>
        </div>
      </div>
      {check && (
        <>
          <Field label={t('serverSeedHashSha')} value={check.hash} />
          <p className={styles.result} data-testid="verify-result">
            {recomputedText(t, check.hitLane)}
          </p>
          <Field
            label={t('consoleCode')}
            value={verifierSnippet(form.serverSeed, form.clientSeed, nonce, form.difficulty)}
            code
          />
        </>
      )}
    </section>
  )
}
