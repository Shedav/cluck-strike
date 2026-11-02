import { useEffect, useRef, useState, type ReactNode } from 'react'
import { sha256, verifyRound } from '../game/fairness'
import { isWin, type Round } from '../game/round'
import { useGame } from '../game/store'
import styles from './Fairness.module.css'

/** Top-bar button that opens the provably fair modal. */
export function FairnessButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className={styles.trigger} onClick={() => setOpen(true)}>
        Fairness
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Provably fair">
        <FairnessContent />
      </Dialog>
    </>
  )
}

/** A native modal dialog (focus trap, Escape) that also closes on a backdrop click. */
export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (open) dialog.current?.showModal()
    else dialog.current?.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-label={title}
      onClose={onClose}
      // A click on the backdrop lands on the dialog itself.
      onClick={(e) => e.target === dialog.current && dialog.current.close()}
    >
      {open && (
        <div className={styles.content}>
          <header className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button
              className={styles.close}
              onClick={() => dialog.current?.close()}
              aria-label="Close"
            >
              ×
            </button>
          </header>
          {children}
        </div>
      )}
    </dialog>
  )
}

function FairnessContent() {
  const round = useGame((s) => s.round)
  const next = useGame((s) => s.next)
  const clientSeed = useGame((s) => s.clientSeed)
  const setClientSeed = useGame((s) => s.setClientSeed)
  const [draft, setDraft] = useState(clientSeed)
  const playing = round.phase === 'playing'

  return (
    <>
      <p className={styles.intro}>
        Each Round's Hit Lane is HMAC-SHA256(Server Seed, Client Seed:nonce). The Server Seed's hash
        is shown before you play and the seed itself after, so you can check nothing changed.
      </p>

      <section className={styles.section}>
        <h3 className={styles.heading}>Next Round</h3>
        <Field label="Server Seed hash (SHA-256)" value={next?.serverSeedHash ?? '…'} />
        <form
          className={styles.field}
          onSubmit={(e) => {
            e.preventDefault()
            setClientSeed(draft)
          }}
        >
          <label className={styles.label} htmlFor="client-seed">
            Your Client Seed
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
              Save
            </button>
          </div>
          {playing && <span className={styles.hint}>You can change it after this Round.</span>}
        </form>
        <Field label="Nonce" value={String(next?.nonce ?? '…')} />
      </section>

      {round.phase !== 'idle' && (
        <section className={styles.section}>
          <h3 className={styles.heading}>{playing ? 'Current Round' : 'Last Round'}</h3>
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
      <Field label="Server Seed hash" value={serverSeedHash ?? ''} />
      <Field label="Server Seed" value={serverSeed ?? 'Revealed when the Round ends'} />
      <Field label="Client Seed" value={clientSeed ?? ''} />
      <Field label="Nonce" value={String(nonce ?? '')} />
      <Field label="Difficulty" value={difficulty} />
      {serverSeed !== null && check && (
        <div className={styles.verdict} data-ok={check.hashOk && matches(round, check.hitLane)}>
          <span>
            Recomputed:{' '}
            {check.hitLane === null ? 'no Hit on any Lane' : `Hit on Lane ${check.hitLane}`}
          </span>
          <span>Played: {describe(round)}</span>
          <strong>
            {check.hashOk && matches(round, check.hitLane) ? '✓ Verified' : '✗ Does not match'}
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

function describe(round: Round) {
  switch (round.phase) {
    case 'hit':
      return `Hit on Lane ${round.lane}`
    case 'finished':
      return 'reached the Finish'
    case 'maxWin':
      return `Max Win on Lane ${round.lane}`
    default:
      return `cashed out on Lane ${round.lane}`
  }
}

function Field({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={styles.row}>
        <code className={styles.value}>{value}</code>
        <button
          className={styles.copy}
          aria-label={`Copy ${label}`}
          onClick={() =>
            void navigator.clipboard?.writeText(value).then(() => {
              setCopied(true)
              setTimeout(() => setCopied(false), 1200)
            })
          }
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
