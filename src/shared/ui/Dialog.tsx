import { useEffect, useRef, type ReactNode } from 'react'
import { useT } from '@/shared/i18n'
import styles from './Dialog.module.css'

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
  const t = useT()
  useEffect(() => {
    if (open) dialog.current?.showModal()
    else dialog.current?.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      className={`${styles.dialog} surface`}
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
              aria-label={t('close')}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </header>
          {children}
        </div>
      )}
    </dialog>
  )
}
