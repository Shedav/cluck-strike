import { useEffect, useState } from 'react'
import { isWin, useGame, type Round } from '@/entities/round'
import {
  DIFFICULTIES,
  sha256,
  verifierSnippet,
  verifyRound,
  type Difficulty,
} from '@/shared/game-rules'
import { useT } from '@/shared/i18n'
import { Dialog, ShieldCheckIcon } from '@/shared/ui'
import styles from './Fairness.module.css'

/** Top-bar button that opens the provably fair modal. */
export function FairnessButton() {
  const [open, setOpen] = useState(false)
  const t = useT()
  return (
    <>
      <button className="link" onClick={() => setOpen(true)}>
        <ShieldCheckIcon />
        {t('fairness')}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={t('provablyFair')}>
        <FairnessContent />
      </Dialog>
    </>
  )
}

function FairnessContent() {
  const round = useGame((s) => s.round)
  const next = useGame((s) => s.next)
  const clientSeed = useGame((s) => s.clientSeed)
  const setClientSeed = useGame((s) => s.setClientSeed)
  const [draft, setDraft] = useState(clientSeed)
  const playing = round.phase === 'playing'
  const t = useT()

  return (
    <>
      <p className={styles.intro}>{t('fairIntro')}</p>

      <section className={styles.section}>
        <h3 className={styles.heading}>{t('nextRound')}</h3>
        <Field label={t('serverSeedHashSha')} value={next?.serverSeedHash ?? '…'} />
        <form
          className={styles.field}
          onSubmit={(e) => {
            e.preventDefault()
            setClientSeed(draft)
          }}
        >
          <label className={styles.label} htmlFor="client-seed">
            {t('yourClientSeed')}
          </label>
          <div className={styles.row}>
            <input
              id="client-seed"
              className={styles.input}
              value={draft}
              maxLength={64}
              disabled={playing}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              className={styles.save}
              disabled={playing || !draft.trim() || draft.trim() === clientSeed}
            >
              {t('save')}
            </button>
          </div>
          {playing && <span className={styles.hint}>{t('changeAfterRound')}</span>}
        </form>
        <Field label={t('nonce')} value={String(next?.nonce ?? '…')} />
      </section>

      {round.phase !== 'idle' && (
        <section className={styles.section}>
          <h3 className={styles.heading}>{t(playing ? 'currentRound' : 'lastRound')}</h3>
          <RoundProof round={round} />
        </section>
      )}

      <VerifyForm />
    </>
  )
}

/** Recomputes any Round from values the player enters, and gives the same check as console code. */
function VerifyForm() {
  // Starts from the last Round whose Server Seed is revealed, if any.
  const last = useGame((s) => (s.round.serverSeed !== null ? s.round : s.recentGames[0]))
  const [form, setForm] = useState(() => ({
    serverSeed: last?.serverSeed ?? '',
    clientSeed: last?.clientSeed ?? '',
    nonce: String(last?.nonce ?? 0),
    difficulty: last?.difficulty ?? ('easy' as Difficulty),
  }))
  const [check, setCheck] = useState<{ hash: string; hitLane: number | null } | null>(null)
  const t = useT()
  const nonce = Number(form.nonce)
  const valid =
    form.serverSeed !== '' && form.nonce.trim() !== '' && Number.isSafeInteger(nonce) && nonce >= 0

  useEffect(() => {
    if (!valid) return
    let live = true
    void Promise.all([
      sha256(form.serverSeed),
      verifyRound(form.serverSeed, form.clientSeed, nonce, form.difficulty),
    ]).then(([hash, hitLane]) => live && setCheck({ hash, hitLane }))
    return () => {
      live = false
    }
  }, [valid, form.serverSeed, form.clientSeed, nonce, form.difficulty])

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
      {valid && check && (
        <>
          <Field label={t('serverSeedHashSha')} value={check.hash} />
          <p className={styles.result} data-testid="verify-result">
            {t('recomputed', {
              result: check.hitLane === null ? t('noHit') : t('hitOnLane', { lane: check.hitLane }),
            })}
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

/**
 * The seeds of one Round and, once it is over, an independent re-check of its result; `withCode`
 * adds the same check as code for the browser console.
 */
export function RoundProof({ round, withCode = false }: { round: Round; withCode?: boolean }) {
  const [check, setCheck] = useState<{ hitLane: number | null; hashOk: boolean } | null>(null)
  const { serverSeed, clientSeed, nonce, serverSeedHash, difficulty } = round
  const t = useT()

  useEffect(() => {
    if (serverSeed === null || clientSeed === null || nonce === null) return
    let live = true
    void Promise.all([
      verifyRound(serverSeed, clientSeed, nonce, difficulty),
      sha256(serverSeed),
    ]).then(([hitLane, hash]) => live && setCheck({ hitLane, hashOk: hash === serverSeedHash }))
    return () => {
      live = false
    }
  }, [serverSeed, clientSeed, nonce, serverSeedHash, difficulty])

  return (
    <>
      <Field label={t('serverSeedHash')} value={serverSeedHash ?? ''} />
      <Field label={t('serverSeed')} value={serverSeed ?? t('revealedLater')} />
      <Field label={t('clientSeed')} value={clientSeed ?? ''} />
      <Field label={t('nonce')} value={String(nonce ?? '')} />
      <Field label={t('difficulty')} value={t(difficulty)} />
      {serverSeed !== null && check && (
        <div className={styles.verdict} data-ok={check.hashOk && matches(round, check.hitLane)}>
          <span>
            {t('recomputed', {
              result: check.hitLane === null ? t('noHit') : t('hitOnLane', { lane: check.hitLane }),
            })}
          </span>
          <span>{t('played', { result: describe(round, t) })}</span>
          <strong>
            {t(check.hashOk && matches(round, check.hitLane) ? 'verified' : 'mismatch')}
          </strong>
        </div>
      )}
      {withCode && serverSeed !== null && clientSeed !== null && nonce !== null && (
        <>
          <Field
            label={t('consoleCode')}
            value={verifierSnippet(serverSeed, clientSeed, nonce, difficulty)}
            code
          />
          <p className={styles.hint}>{t('consoleHint')}</p>
        </>
      )}
    </>
  )
}

/** Whether a recomputed Hit Lane agrees with how the Round actually ended. */
function matches(round: Round, hitLane: number | null) {
  if (round.phase === 'hit') return hitLane === round.lane
  if (round.phase === 'finished') return hitLane === null
  // A Cash Out (or Max Win) stopped before the Hit Lane, if there was one.
  return isWin(round.phase) && (hitLane === null || hitLane > round.lane)
}

function describe(round: Round, t: ReturnType<typeof useT>) {
  switch (round.phase) {
    case 'hit':
      return t('hitOnLane', { lane: round.lane })
    case 'finished':
      return t('reachedFinish')
    case 'maxWin':
      return t('maxWinOnLane', { lane: round.lane })
    default:
      return t('cashedOutOnLane', { lane: round.lane })
  }
}

function Field({ label, value, code = false }: { label: string; value: string; code?: boolean }) {
  const [copied, setCopied] = useState(false)
  const t = useT()
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={styles.row}>
        <code className={`${styles.value} ${code ? styles.code : ''}`}>{value}</code>
        <button
          className={`${styles.copy} secondary`}
          aria-label={t('copyLabel', { label })}
          onClick={() =>
            void navigator.clipboard?.writeText(value).then(() => {
              setCopied(true)
              setTimeout(() => setCopied(false), 1200)
            })
          }
        >
          {t(copied ? 'copied' : 'copy')}
        </button>
      </div>
    </div>
  )
}
