import { useState } from 'react'
import { useT } from '@/shared/i18n'
import styles from './Fairness.module.css'

/** A labelled value with a Copy button; `code` keeps multi-line code's lines. */
export function Field({
  label,
  value,
  code = false,
}: {
  label: string
  value: string
  code?: boolean
}) {
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
