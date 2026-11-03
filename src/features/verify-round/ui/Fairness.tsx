import { useState } from 'react'
import { useGame } from '@/entities/round'
import { useT } from '@/shared/i18n'
import { Dialog, ShieldCheckIcon } from '@/shared/ui'
import styles from './Fairness.module.css'
import { Field } from './Field'
import { RoundProof } from './RoundProof'
import { VerifyForm } from './VerifyForm'

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
