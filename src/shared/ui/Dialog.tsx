import { useEffect, useRef, type ReactNode } from 'react'
import { useT } from '@/shared/i18n'
import styles from './Dialog.module.css'
import { CloseIcon } from './icons/LineIcons'

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
              <CloseIcon />
            </button>
          </header>
          {children}
        </div>
      )}
    </dialog>
  )
}
