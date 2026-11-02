import { useEffect, useState } from 'react'
import { isWin, useGame, type Round } from '@/entities/round'
import { sha256, verifyRound } from '@/shared/game-rules'
import { useT } from '@/shared/i18n'
import { Dialog } from '@/shared/ui'
import styles from './Fairness.module.css'

/** Top-bar button that opens the provably fair modal. */
export function FairnessButton() {
  const [open, setOpen] = useState(false)
  const t = useT()
  return (
    <>
      <button className="link" onClick={() => setOpen(true)}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
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
    </>
  )
}

/** The seeds of one Round and, once it is over, an independent re-check of its result. */
export function RoundProof({ round }: { round: Round }) {
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

function Field({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const t = useT()
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={styles.row}>
        <code className={styles.value}>{value}</code>
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
