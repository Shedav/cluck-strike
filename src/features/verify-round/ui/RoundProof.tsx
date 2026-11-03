import { isWin, type Round } from '@/entities/round'
import { verifierSnippet } from '@/shared/game-rules'
import { useT } from '@/shared/i18n'
import styles from './Fairness.module.css'
import { Field } from './Field'
import { recomputedText, useVerification } from './verification'

/**
 * The seeds of one Round and, once it is over, an independent re-check of its result; `withCode`
 * adds the same check as code for the browser console.
 */
export function RoundProof({ round, withCode = false }: { round: Round; withCode?: boolean }) {
  const { serverSeed, clientSeed, nonce, serverSeedHash, difficulty } = round
  const check = useVerification(serverSeed, clientSeed, nonce, difficulty)
  const ok = check !== null && check.hash === serverSeedHash && matches(round, check.hitLane)
  const t = useT()

  return (
    <>
      <Field label={t('serverSeedHash')} value={serverSeedHash ?? ''} />
      <Field label={t('serverSeed')} value={serverSeed ?? t('revealedLater')} />
      <Field label={t('clientSeed')} value={clientSeed ?? ''} />
      <Field label={t('nonce')} value={String(nonce ?? '')} />
      <Field label={t('difficulty')} value={t(difficulty)} />
      {check && (
        <div className={styles.verdict} data-ok={ok}>
          <span>{recomputedText(t, check.hitLane)}</span>
          <span>{t('played', { result: describe(round, t) })}</span>
          <strong>{t(ok ? 'verified' : 'mismatch')}</strong>
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
